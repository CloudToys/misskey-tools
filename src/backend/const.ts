export const defaultTemplate = '어제의 제 Misskey 사용량을 공개합니다!\n\n노트 : {notesCount} ({notesDelta})\n팔로잉 : {followingCount} ({followingDelta})\n팔로워 : {followersCount} ({followersDelta})\n\n같이 [참여]({url})해보지 않으실래요?';

export const currentTokenVersion = 2;

export const misskeyAppInfo = {
  name: 'Misskey Tools with LycheeBridge',
  description: 'LycheeBridge에서 관리하는 Misskey Tools의 포크 버전',
  permission: [
    'read:account',
    'write:account',
    'write:notes',
    'read:drive',
    'write:drive',
    'read:notifications',
    'write:notifications',
    'read:channels',
  ],
} as const;
