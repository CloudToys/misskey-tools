import { User } from '../models/entities/user.js';
import { api } from './misskey.js';
import {format} from '../../common/functions/format.js';
import {getScores} from '../functions/get-scores.js';


/**
 * アラートを送信する
 * @param user ユーザー
 */
export const sendAlert = async (user: User) => {
  const text = format(user, await getScores(user));
  switch (user.alertMode) {
    case 'note':
      await sendNoteAlert(text, user);
      break;
    case 'notification':
      await sendNotificationAlert(text, user);
      break;
    case 'both':
      await Promise.all([
        sendNotificationAlert(text, user),
        sendNoteAlert(text, user),
      ]);
      break;
  }
};

/**
 * ノートアラートを送信する
 * @param text 通知内容
 * @param user ユーザー
 */
export const sendNoteAlert = async (text: string, user: User) => {
  const res = await api<Record<string, unknown>>(user.host, 'notes/create', {
    text,
    visibility: user.visibility,
    localOnly: user.localOnly,
    remoteFollowersOnly: user.remoteFollowersOnly,
  }, user.token);

  if (res.error) {
    throw res.error || res;
  }
};

/**
 * 通知アラートを送信する
 * @param text 通知内容
 * @param user ユーザー
 */
export const sendNotificationAlert = async (text: string, user: User) => {
  const res = await api(user.host, 'notifications/create', {
    header: 'Misskey Tools with LycheeBridge',
    icon: 'https://t.psec.dev/assets/lcb.png',
    body: text,
  }, user.token);

  if (res.error) {
    throw res.error || res;
  }
};
