import jaJP from './ja-JP.json';
import enUS from './en-US.json';
import koKR from './ko-KR.json';

import deepmerge from 'deepmerge';

const merge = (baseData: Record<string, unknown>, newData: Record<string, unknown>) => {
  return deepmerge(baseData, newData, {
    isMergeableObject: obj => typeof obj === 'object'
  });
};

const _enUS = merge(koKR, enUS);
const _jaJP = merge(_enUS, jaJP);

export const resources = {
  'ko_KR': { translation: koKR },
  'en_US': { translation: _enUS },
  'ja_JP': { translation: _jaJP },
};

export const languageName = {
  'ko_KR': '한국어',
  'en_US': 'English',
  'ja_JP': '日本語',
} as const;

export type LanguageCode = keyof typeof resources;

export const getBrowserLanguage = () => {
  const lang = navigator.language.replace('-', '_').toLowerCase();
  return (Object.keys(resources) as LanguageCode[]).find(k => k.toLowerCase().startsWith(lang)) ?? 'ko_KR';
};
