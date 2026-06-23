import data from './data.json';

export type LangCode = 'cn' | 'en' | 'ru';
export type Translations = typeof data.cn;
export const translations = data as Record<LangCode, Translations>;
