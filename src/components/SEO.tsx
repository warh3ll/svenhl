import { Helmet } from 'react-helmet-async';
import { LOCALES, localizePath, useI18n, type Lang } from '@/i18n';

interface SEOProps {
  title: string;
  description: string;
  /** The page's English path, e.g. "/teams/VAN"; the Swedish address is derived from it */
  path: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_URL = 'https://svenhl.com';
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const LANGS: Lang[] = ['en', 'sv'];

const SEO = ({ title, description, path, jsonLd }: SEOProps) => {
  const { lang } = useI18n();
  const urlFor = (l: Lang) => `${SITE_URL}${localizePath(path, l)}`;
  const url = urlFor(lang);
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet htmlAttributes={{ lang }}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {/* Tell search engines about the same page in the other language */}
      {LANGS.map((l) => (
        <link key={l} rel="alternate" hrefLang={l} href={urlFor(l)} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={urlFor('en')} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={LOCALES[lang].replace('-', '_')} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="SVENHL" />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      {ldArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify({ url, inLanguage: lang, ...data })}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
