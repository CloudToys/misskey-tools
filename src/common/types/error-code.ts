export const errorCodes = [
  'hitorisskeyIsDenied',
  'teapot',
  'sessionRequired',
  'tokenRequired',
  'invalidParamater',
  'notAuthorized',
  'hostNotFound',
  'invalidHostFormat',
  'noNewUserAllowed',
  'other',
] as const;

export type ErrorCode = typeof errorCodes[number];
