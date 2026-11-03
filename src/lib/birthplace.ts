// The NHL gives birth countries as three-letter codes (mostly IOC style); Intl wants two-letter ones
const COUNTRY_CODES: Record<string, string> = {
  SWE: 'SE', CAN: 'CA', USA: 'US', FIN: 'FI', NOR: 'NO', DEN: 'DK', GER: 'DE', SUI: 'CH', AUT: 'AT',
  CZE: 'CZ', SVK: 'SK', RUS: 'RU', BLR: 'BY', UKR: 'UA', LAT: 'LV', LTU: 'LT', EST: 'EE', POL: 'PL',
  SLO: 'SI', FRA: 'FR', GBR: 'GB', NED: 'NL', ITA: 'IT', ESP: 'ES', KAZ: 'KZ', AUS: 'AU', JPN: 'JP',
  KOR: 'KR', CHN: 'CN', HUN: 'HU', BRA: 'BR', RSA: 'ZA', NZL: 'NZ', JAM: 'JM', NGA: 'NG',
};

const countryName = (code: string, locale: string) => {
  const region = COUNTRY_CODES[code];
  if (!region) return code;
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(region) ?? code;
  } catch {
    return code;
  }
};

/**
 * "Västerås" for players born in Sweden (the whole site is about Swedes),
 * otherwise "Calgary, Alberta, Canada". Null when the NHL has no birthplace.
 */
export const formatBirthplace = (
  place: { birthCity?: string; birthRegion?: string; birthCountry?: string },
  locale: string,
) => {
  if (!place.birthCity) return null;
  if (!place.birthCountry || place.birthCountry === 'SWE') return place.birthCity;
  return [place.birthCity, place.birthRegion, countryName(place.birthCountry, locale)].filter(Boolean).join(', ');
};
