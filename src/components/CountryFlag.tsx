import React from 'react';

// Country name / emoji to 2-letter ISO code mapping for flagcdn
const COUNTRY_CODE_MAP: Record<string, string> = {
  // Common Names
  russia: 'ru',
  russian: 'ru',
  oman: 'om',
  qatar: 'qa',
  kuwait: 'kw',
  'saudi arabia': 'sa',
  saudi: 'sa',
  ksa: 'sa',
  uae: 'ae',
  'united arab emirates': 'ae',
  dubai: 'ae',
  'abu dhabi': 'ae',
  europe: 'eu',
  eu: 'eu',
  germany: 'de',
  poland: 'pl',
  singapore: 'sg',
  israel: 'il',
  bahrain: 'bh',
  iraq: 'iq',
  malaysia: 'my',
  india: 'in',
  uk: 'gb',
  'united kingdom': 'gb',
  croatia: 'hr',
  hungary: 'hu',
  romania: 'ro',
  italy: 'it',
  canada: 'ca',
  australia: 'au',
  japan: 'jp',
  mauritius: 'mu',
  maldives: 'mv',

  // Emoji mappings
  '🇷🇺': 'ru',
  '🇴🇲': 'om',
  '🇶🇦': 'qa',
  '🇰🇼': 'kw',
  '🇸🇦': 'sa',
  '🇦🇪': 'ae',
  '🇪🇺': 'eu',
  '🇩🇪': 'de',
  '🇵🇱': 'pl',
  '🇸🇬': 'sg',
  '🇮🇱': 'il',
  '🇧🇭': 'bh',
  '🇮🇶': 'iq',
  '🇲🇾': 'my',
  '🇮🇳': 'in',
  '🇬🇧': 'gb',
  '🇭🇷': 'hr',
  '🇭🇺': 'hu',
  '🇷🇴': 'ro'
};

export function getCountryCode(countryOrEmoji?: string): string {
  if (!countryOrEmoji) return 'un';
  const clean = countryOrEmoji.trim().toLowerCase();

  // If already a 2-letter code
  if (/^[a-z]{2}$/.test(clean)) {
    return clean;
  }

  // Exact match
  if (COUNTRY_CODE_MAP[clean]) {
    return COUNTRY_CODE_MAP[clean];
  }

  // Partial match search
  for (const [key, code] of Object.entries(COUNTRY_CODE_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return code;
    }
  }

  return 'un'; // United Nations fallback flag
}

export function getFlagUrl(countryOrEmoji?: string, width = 80): string {
  const code = getCountryCode(countryOrEmoji);
  return `https://flagcdn.com/w${width}/${code}.png`;
}

interface CountryFlagProps {
  country?: string;
  countryCode?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  shape?: 'circle' | 'squircle' | 'rounded';
  className?: string;
  imgClassName?: string;
  alt?: string;
  showBorder?: boolean;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  country,
  countryCode,
  size = 'md',
  shape = 'circle',
  className = '',
  imgClassName = '',
  alt,
  showBorder = true
}) => {
  const resolvedCode = countryCode ? countryCode.toLowerCase() : getCountryCode(country);
  const flagUrl = `https://flagcdn.com/w80/${resolvedCode}.png`;
  const flagAlt = alt || `${country || resolvedCode.toUpperCase()} Flag`;

  const sizeClasses: Record<string, string> = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
    custom: ''
  };

  const shapeClasses: Record<string, string> = {
    circle: 'rounded-full',
    squircle: 'rounded-lg',
    rounded: 'rounded-md'
  };

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden bg-slate-800 ${
        sizeClasses[size] || 'w-6 h-6'
      } ${shapeClasses[shape]} ${
        showBorder ? 'border border-white/20 shadow-xs' : ''
      } ${className}`}
    >
      <img
        src={flagUrl}
        alt={flagAlt}
        className={`w-full h-full object-cover object-center ${imgClassName}`}
        loading="lazy"
        onError={(e) => {
          // Fallback to generic globe/flag if image fails to load
          const target = e.currentTarget;
          target.style.display = 'none';
          if (target.parentElement) {
            target.parentElement.innerHTML = '🌐';
          }
        }}
      />
    </span>
  );
};

export default CountryFlag;
