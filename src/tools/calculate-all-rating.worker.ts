import { Users } from '../backend/models/index.js';
import { updateRating } from '../backend/functions/update-rating.js';
import { api } from '../backend/services/misskey.js';
import { MiUser } from '../backend/functions/update-score.js';

export default async () => {
  const users = await Users.find();
  for (const u of users) {
    console.log(`${u.username}@${u.host}의 레이팅을 갱신하는 중...`);
    const miUser = await api<MiUser & { error: unknown }>(u.host, 'users/show', { username: u.username }, u.token);
    if (miUser.error) {
      console.log(`${u.username}@${u.host}의 데이터 불러오기에 실패했습니다. 스킵하는 중...`);
      continue;
    }
    await updateRating(u, miUser);
  }
};
