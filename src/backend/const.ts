export const defaultTemplate = '昨日のMisskeyの活動は\n\nノート: {notesCount}({notesDelta})\nフォロー : {followingCount}({followingDelta})\nフォロワー :{followersCount}({followersDelta})\n\nでした。\n{url}';

/**
 * 現在のMisskeyアプリトークンバージョン。
 * ver 2:
 *   * 全権限を許可するように（将来的に使うため）
 *   * アプリ名をMisskey Toolsに
 * ver 1:
 *   * 初回バージョン
*/
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
