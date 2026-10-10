// The site's text lives in en.json and sv.json, one "key": "text" line per string.
// {name} in a text is filled in by the code; keys ending in _one/_other are the singular and plural forms.
// Swedish pages live under /sv with Swedish slugs from routes.json (/sv/lag/VAN for /teams/VAN).
import { useLocation } from 'react-router-dom';
import en from './en.json';
import sv from './sv.json';
import svSlugs from './routes.json';

export type Lang = 'en' | 'sv';
type Vars = Record<string, string | number>;

const texts: Record<Lang, Record<string, string>> = { en, sv };
export const LOCALES: Record<Lang, string> = { en: 'en-US', sv: 'sv-SE' };

const toSvSlug: Record<string, string> = svSlugs;
const fromSvSlug = Object.fromEntries(Object.entries(toSvSlug).map(([enSlug, svSlug]) => [svSlug, enSlug]));

export const langFromPath = (pathname: string): Lang => (/^\/sv(\/|$)/.test(pathname) ? 'sv' : 'en');

// "/teams/VAN" -> "/sv/lag/VAN" for Swedish; English paths are returned unchanged
export const localizePath = (path: string, lang: Lang) => {
  if (lang === 'en') return path;
  const [, first = '', ...rest] = path.split('/');
  return ['/sv', toSvSlug[first] ?? first, ...rest].filter(Boolean).join('/');
};

// The English path of any page: "/sv/lag/VAN" -> "/teams/VAN"
export const englishPath = (pathname: string) => {
  if (langFromPath(pathname) === 'en') return pathname;
  const [, , first = '', ...rest] = pathname.split('/');
  return '/' + [fromSvSlug[first] ?? first, ...rest].filter(Boolean).join('/');
};

export const translate = (lang: Lang, key: string, vars: Vars = {}) => {
  const pick = (k: string) => texts[lang][k] ?? texts.en[k];
  const pluralKey = 'count' in vars ? `${key}_${vars.count === 1 ? 'one' : 'other'}` : key;
  const text = pick(pluralKey) ?? pick(key) ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
};

// "A, B and C"
export const listNames = (lang: Lang, names: string[]) =>
  names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} ${translate(lang, 'list.and')} ${names[names.length - 1]}`;

export const useI18n = () => {
  const { pathname } = useLocation();
  const lang = langFromPath(pathname);
  const locale = LOCALES[lang];
  return {
    lang,
    locale,
    t: (key: string, vars?: Vars) => translate(lang, key, vars),
    /** Link target in the current language for an English path, e.g. path('/teams') */
    path: (enPath: string) => localizePath(enPath, lang),
    /** 12.3 / 12,3 */
    decimal: (value: number, digits: number) =>
      value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }),
    /** 0.957 -> 95.7% / 95,7 % */
    percent: (fraction: number) =>
      fraction.toLocaleString(locale, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    /** Short position, e.g. "D" -> "B" in Swedish */
    position: (code: string) => (`position.short.${code}` in texts.en ? translate(lang, `position.short.${code}`) : code),
  };
};

/** Text by key, for components that can't call the hook themselves */
export const T = ({ k }: { k: string }) => {
  const { t } = useI18n();
  return <>{t(k)}</>;
};
