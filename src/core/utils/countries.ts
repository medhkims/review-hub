export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  dialCode: string;
  flag: string; // emoji
}

function flagEmoji(isoCode: string): string {
  return isoCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(char.charCodeAt(0) + 127397),
    );
}

const RAW: [string, string, string][] = [
  // [name, iso2, dialCode]
  ['Afghanistan', 'AF', '+93'],
  ['Albania', 'AL', '+355'],
  ['Algeria', 'DZ', '+213'],
  ['Argentina', 'AR', '+54'],
  ['Australia', 'AU', '+61'],
  ['Austria', 'AT', '+43'],
  ['Bahrain', 'BH', '+973'],
  ['Bangladesh', 'BD', '+880'],
  ['Belgium', 'BE', '+32'],
  ['Brazil', 'BR', '+55'],
  ['Bulgaria', 'BG', '+359'],
  ['Cameroon', 'CM', '+237'],
  ['Canada', 'CA', '+1'],
  ['Chile', 'CL', '+56'],
  ['China', 'CN', '+86'],
  ['Colombia', 'CO', '+57'],
  ['Croatia', 'HR', '+385'],
  ['Czech Republic', 'CZ', '+420'],
  ['Denmark', 'DK', '+45'],
  ['Egypt', 'EG', '+20'],
  ['Ethiopia', 'ET', '+251'],
  ['Finland', 'FI', '+358'],
  ['France', 'FR', '+33'],
  ['Germany', 'DE', '+49'],
  ['Ghana', 'GH', '+233'],
  ['Greece', 'GR', '+30'],
  ['Hungary', 'HU', '+36'],
  ['India', 'IN', '+91'],
  ['Indonesia', 'ID', '+62'],
  ['Iran', 'IR', '+98'],
  ['Iraq', 'IQ', '+964'],
  ['Ireland', 'IE', '+353'],
  ['Israel', 'IL', '+972'],
  ['Italy', 'IT', '+39'],
  ['Ivory Coast', 'CI', '+225'],
  ['Japan', 'JP', '+81'],
  ['Jordan', 'JO', '+962'],
  ['Kenya', 'KE', '+254'],
  ['Kuwait', 'KW', '+965'],
  ['Lebanon', 'LB', '+961'],
  ['Libya', 'LY', '+218'],
  ['Malaysia', 'MY', '+60'],
  ['Mali', 'ML', '+223'],
  ['Mauritania', 'MR', '+222'],
  ['Mexico', 'MX', '+52'],
  ['Morocco', 'MA', '+212'],
  ['Netherlands', 'NL', '+31'],
  ['New Zealand', 'NZ', '+64'],
  ['Niger', 'NE', '+227'],
  ['Nigeria', 'NG', '+234'],
  ['Norway', 'NO', '+47'],
  ['Oman', 'OM', '+968'],
  ['Pakistan', 'PK', '+92'],
  ['Palestine', 'PS', '+970'],
  ['Philippines', 'PH', '+63'],
  ['Poland', 'PL', '+48'],
  ['Portugal', 'PT', '+351'],
  ['Qatar', 'QA', '+974'],
  ['Romania', 'RO', '+40'],
  ['Russia', 'RU', '+7'],
  ['Saudi Arabia', 'SA', '+966'],
  ['Senegal', 'SN', '+221'],
  ['Serbia', 'RS', '+381'],
  ['Singapore', 'SG', '+65'],
  ['Somalia', 'SO', '+252'],
  ['South Africa', 'ZA', '+27'],
  ['South Korea', 'KR', '+82'],
  ['Spain', 'ES', '+34'],
  ['Sudan', 'SD', '+249'],
  ['Sweden', 'SE', '+46'],
  ['Switzerland', 'CH', '+41'],
  ['Syria', 'SY', '+963'],
  ['Taiwan', 'TW', '+886'],
  ['Thailand', 'TH', '+66'],
  ['Tunisia', 'TN', '+216'],
  ['Turkey', 'TR', '+90'],
  ['Ukraine', 'UA', '+380'],
  ['United Arab Emirates', 'AE', '+971'],
  ['United Kingdom', 'GB', '+44'],
  ['United States', 'US', '+1'],
  ['Vietnam', 'VN', '+84'],
  ['Yemen', 'YE', '+967'],
];

export const COUNTRIES: Country[] = RAW.map(([name, code, dialCode]) => ({
  name,
  code,
  dialCode,
  flag: flagEmoji(code),
})).sort((a, b) => a.name.localeCompare(b.name));

export function findCountryByDialCode(dialCode: string): Country | undefined {
  return COUNTRIES.find((c) => c.dialCode === dialCode);
}
