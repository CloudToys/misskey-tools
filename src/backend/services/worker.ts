import cron from 'node-cron';
import { deleteUser } from '../functions/users.js';
import { MiUser, updateScore } from '../functions/update-score.js';
import { updateRating } from '../functions/update-rating.js';
import { Users } from '../models/index.js';
import {sendNoteAlert, sendNotificationAlert} from './send-alert.js';
import {api, MisskeyError, TimedOutError} from './misskey.js';
import * as Store from '../store.js';
import { User } from '../models/entities/user.js';
import {groupBy} from '../utils/group-by.js';
import {clearLog, printLog} from '../store.js';
import {errorToString} from '../functions/error-to-string.js';
import {Acct, toAcct} from '../models/acct.js';
import {Count} from '../models/count.js';
import {format} from '../../common/functions/format.js';
import {delay} from '../utils/delay.js';

const ERROR_CODES_USER_REMOVED = ['NO_SUCH_USER', 'AUTHENTICATION_FAILED', 'YOUR_ACCOUNT_SUSPENDED'];

// TODO: Redisで持つようにしたい
const userScoreCache = new Map<Acct, Count>();

export default (): void => {
  cron.schedule('0 0 0 * * *', work);
};

export const work = async () => {
  Store.dispatch({ nowCalculating: true });

  clearLog();
  printLog('Started.');

  try {
    const users = await Users.find();
    const groupedUsers = groupBy(users, u => u.host);

    printLog(`${users.length}개의 계정을 발견, 레이팅을 계산하고 있습니다.`);
    await calculateAllRating(groupedUsers);
    Store.dispatch({ nowCalculating: false });

    printLog(`${users.length}개의 계정 레이팅 계산 완료, 알림을 전송하고 있습니다.`);
    await sendAllAlerts(groupedUsers);

    printLog('Misskey Tools with LycheeBridge 알림 전송이 완료되었습니다.');
  } catch (e) {
    printLog('Misskey Tools with LycheeBridge 알림 전송에 실패했습니다.', 'error');
    printLog(e instanceof Error ? errorToString(e) : JSON.stringify(e, null, '  '), 'error');
  } finally {
    Store.dispatch({ nowCalculating: false });
  }
};

const calculateAllRating = async (groupedUsers: [string, User[]][]) => {
  return await Promise.all(groupedUsers.map(kv => calculateRating(...kv)));
};

const calculateRating = async (host: string, users: User[]) => {
  for (const user of users) {
    let miUser: MiUser;
    try {
      miUser = await api<MiUser>(user.host, 'i', {}, user.token);
    } catch (e) {
      if (!(e instanceof Error)) {
        printLog('문제 발생: 오류 객체는 Error를 상속하지 않아야 합니다.', 'error');
      } else if (e instanceof MisskeyError) {
        if (ERROR_CODES_USER_REMOVED.includes(e.error.code)) {
          // ユーザーが削除されている場合、レコードからも消してとりやめ
          printLog(`${toAcct(user)} 게정이 삭제, 정지, 또는 토큰이 제거된 것으로 보이며, 시스템에서 계정이 제거되었습니다.`, 'warn');
          await deleteUser(user.username, user.host);
        } else {
          printLog(`Misskey 오류: ${JSON.stringify(e.error)}`, 'error');
        }
      } else if (e instanceof TimedOutError) {
        printLog(`${user.host} 인스턴스로의 연결에 실패하여 레이팅 계산을 중단합니다.`, 'error');
        return;
      } else {
        // おそらく通信エラー
        printLog(`알 수 없는 오류가 발생했습니다.\n${errorToString(e)}`, 'error');
      }
      continue;
    }
    userScoreCache.set(toAcct(user), miUser);

    await updateRating(user, miUser);
  }
  printLog(`${host} 인스턴스의 사용자 ${users.length}명의 레이팅 계산이 완료되었습니다.`);
};

const sendAllAlerts = async (groupedUsers: [string, User[]][]) => {
  return await Promise.all(groupedUsers.map(kv => sendAlerts(...kv)));
};

const sendAlerts = async (host: string, users: User[]) => {
  const models = users
    .map(user => {
      const count = userScoreCache.get(toAcct(user));
      if (count == null) return null;
      return {
        user,
        count,
        message: format(user, count),
      };
    })
    .filter(u => u != null) as {user: User, count: Count, message: string}[];

  // 何もしない
  for (const {user, count} of models.filter(m => m.user.alertMode === 'nothing')) {
    await updateScore(user, count);
  }

  // 通知
  for (const {user, count, message} of models.filter(m => m.user.alertMode === 'notification' || m.user.alertMode === 'both')) {
    await sendNotificationAlert(message, user);
    if (user.alertMode === 'notification') {
      await updateScore(user, count);
    }
  }

  // アラート
  for (const {user, count, message} of models.filter(m => m.user.alertMode === 'note' || m.user.alertMode === 'both')) {
    await sendNoteAlert(message, user);
    await Promise.all([
      updateScore(user, count),
      delay(1000),
    ]);
  }

  printLog(`${host} 인스턴스의 사용자 ${users.length}명의 알림 전송이 완료되었습니다.`);
};
