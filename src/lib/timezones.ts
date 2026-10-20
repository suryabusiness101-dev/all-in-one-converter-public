/**
 * Timezone data, offset math, and search/scoring for the timezone converter.
 * Pure logic only — no DOM access at module scope, so this stays safe under
 * the build's SSR prerender pass (see CLAUDE.md's SEO section).
 */

const FALLBACK_ZONES = [
  'UTC', 'America/Los_Angeles', 'America/Denver', 'America/Chicago',
  'America/New_York', 'America/Sao_Paulo', 'Europe/London', 'Europe/Paris',
  'Europe/Berlin', 'Europe/Moscow', 'Asia/Dubai', 'Asia/Kolkata',
  'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland',
];

/** Intl.supportedValuesOf('timeZone') deliberately excludes the fixed-offset
 *  Etc/GMT zones (they're "non-canonical" per CLDR) even though they're
 *  valid IANA ids Intl.DateTimeFormat happily accepts. Windows' picker lists
 *  these (e.g. "(UTC-12:00) International Date Line West") for the rare case
 *  of a UTC offset with no associated city — ships, remote stations, etc.
 *  Etc/GMT's sign is POSIX-inverted: Etc/GMT+12 means UTC-12. Etc/GMT0/UTC+0
 *  is skipped since the 'UTC' zone already covers it. */
const FIXED_OFFSET_ZONES: string[] = [
  ...Array.from({ length: 12 }, (_, i) => `Etc/GMT+${i + 1}`), // UTC-1 .. UTC-12
  ...Array.from({ length: 14 }, (_, i) => `Etc/GMT-${i + 1}`), // UTC+1 .. UTC+14
];

function computeAllZones(): string[] {
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      const zones = Intl.supportedValuesOf('timeZone');
      if (zones && zones.length) {
        const withUtc = zones.includes('UTC') ? zones : ['UTC', ...zones];
        return [...withUtc, ...FIXED_OFFSET_ZONES];
      }
    }
  } catch {
    // fall through to the fallback list
  }
  return [...FALLBACK_ZONES];
}

export const ZONES: string[] = computeAllZones();

/** Abbreviations people actually type. Ambiguous ones map to several zones on
 *  purpose — the picker surfaces every candidate with its live offset. */
export const ALIASES: Record<string, string[]> = {
  IST: ['Asia/Kolkata', 'Europe/Dublin', 'Asia/Jerusalem'],
  CST: ['America/Chicago', 'Asia/Shanghai', 'America/Havana'],
  CDT: ['America/Chicago'],
  EST: ['America/New_York'], EDT: ['America/New_York'],
  PST: ['America/Los_Angeles'], PDT: ['America/Los_Angeles'],
  MST: ['America/Denver', 'America/Phoenix'], MDT: ['America/Denver'],
  AKST: ['America/Anchorage'], HST: ['Pacific/Honolulu'],
  GMT: ['UTC', 'Europe/London'], BST: ['Europe/London'],
  CET: ['Europe/Paris'], CEST: ['Europe/Paris'],
  EET: ['Europe/Athens'], WET: ['Europe/Lisbon'],
  MSK: ['Europe/Moscow'], GST: ['Asia/Dubai'], PKT: ['Asia/Karachi'],
  BDT: ['Asia/Dhaka'], NPT: ['Asia/Kathmandu'], WIB: ['Asia/Jakarta'],
  SGT: ['Asia/Singapore'], HKT: ['Asia/Hong_Kong'], JST: ['Asia/Tokyo'],
  KST: ['Asia/Seoul'], AEST: ['Australia/Sydney'], AEDT: ['Australia/Sydney'],
  AWST: ['Australia/Perth'], ACST: ['Australia/Adelaide'], NZST: ['Pacific/Auckland'],
  BRT: ['America/Sao_Paulo'], ART: ['America/Argentina/Buenos_Aires'],
  SAST: ['Africa/Johannesburg'], WAT: ['Africa/Lagos'], EAT: ['Africa/Nairobi'],
  UTC: ['UTC'], AST: ['America/Halifax'], NST: ['America/St_Johns'],
};

/** A few zones have both a canonical IANA name and an older "link" name;
 *  which one Intl.supportedValuesOf() reports depends on the runtime's
 *  bundled tzdata version (e.g. some engines still report Asia/Calcutta
 *  instead of Asia/Kolkata). Resolve our canonical references against
 *  whichever spelling ZONES actually contains, so abbreviation search
 *  doesn't silently miss a zone depending on the browser. */
const LEGACY_ZONE_LINKS: Record<string, string> = {
  'Asia/Kolkata': 'Asia/Calcutta',
  'Asia/Kathmandu': 'Asia/Katmandu',
};

function resolveZone(zone: string): string {
  if (ZONES.includes(zone)) return zone;
  const legacy = LEGACY_ZONE_LINKS[zone];
  return legacy && ZONES.includes(legacy) ? legacy : zone;
}

/** The inverse case of LEGACY_ZONE_LINKS: some runtimes' Intl list still
 *  reports a deprecated "link" name as the primary id (this environment's
 *  Chromium returns `Asia/Calcutta`, never `Asia/Kolkata`). The id stays
 *  valid and is what we hand to Intl for the actual conversion — but the
 *  picker, the chosen-value label and the results should *display* the
 *  current name, since "Calcutta", "Saigon", "Kiev" etc. read as outdated.
 *  Old spellings still match in search via SYNONYMS above and via the raw
 *  id in score()'s `full` string, so nothing becomes unfindable. */
const CANONICAL_DISPLAY: Record<string, string> = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'Asia/Katmandu': 'Asia/Kathmandu',
  'Asia/Rangoon': 'Asia/Yangon',
  'Asia/Saigon': 'Asia/Ho_Chi_Minh',
  'Asia/Thimbu': 'Asia/Thimphu',
  'America/Godthab': 'America/Nuuk',
  'Europe/Kiev': 'Europe/Kyiv',
  'Pacific/Enderbury': 'Pacific/Kanton',
  'Atlantic/Faeroe': 'Atlantic/Faroe',
  'Africa/Asmera': 'Africa/Asmara',
};

/** Display spelling for a zone id — canonical name where the runtime handed
 *  us a stale link name, otherwise the id unchanged. Never use the result
 *  as an Intl `timeZone` value; keep passing the original id for that. */
export function canonicalZone(zone: string): string {
  return CANONICAL_DISPLAY[zone] ?? zone;
}

export const ALIAS_BY_ZONE: Record<string, string[]> = {};
for (const [abbr, zones] of Object.entries(ALIASES)) {
  for (const zone of zones) {
    (ALIAS_BY_ZONE[resolveZone(zone)] ??= []).push(abbr);
  }
}

/** Country shown beside each zone. Ambiguous abbreviations are unreadable
 *  without it: three zones all called IST look identical otherwise. Covers
 *  effectively every zone Intl.supportedValuesOf() can return, not just the
 *  handful referenced by ALIASES — falling back to a bare region name
 *  ("Asia", "America") for the rest was a weak result in the picker. */
const COUNTRY: Record<string, string> = {
  UTC: 'Worldwide',

  // Africa
  'Africa/Abidjan': "Côte d'Ivoire", 'Africa/Accra': 'Ghana', 'Africa/Addis_Ababa': 'Ethiopia',
  'Africa/Algiers': 'Algeria', 'Africa/Asmera': 'Eritrea', 'Africa/Bamako': 'Mali',
  'Africa/Bangui': 'Central African Republic', 'Africa/Banjul': 'Gambia',
  'Africa/Bissau': 'Guinea-Bissau', 'Africa/Blantyre': 'Malawi', 'Africa/Brazzaville': 'Congo',
  'Africa/Bujumbura': 'Burundi', 'Africa/Cairo': 'Egypt', 'Africa/Casablanca': 'Morocco',
  'Africa/Ceuta': 'Spain', 'Africa/Conakry': 'Guinea', 'Africa/Dakar': 'Senegal',
  'Africa/Dar_es_Salaam': 'Tanzania', 'Africa/Djibouti': 'Djibouti', 'Africa/Douala': 'Cameroon',
  'Africa/El_Aaiun': 'Western Sahara', 'Africa/Freetown': 'Sierra Leone',
  'Africa/Gaborone': 'Botswana', 'Africa/Harare': 'Zimbabwe', 'Africa/Johannesburg': 'South Africa',
  'Africa/Juba': 'South Sudan', 'Africa/Kampala': 'Uganda', 'Africa/Khartoum': 'Sudan',
  'Africa/Kigali': 'Rwanda', 'Africa/Kinshasa': 'DR Congo', 'Africa/Libreville': 'Gabon',
  'Africa/Lome': 'Togo', 'Africa/Luanda': 'Angola', 'Africa/Lubumbashi': 'DR Congo',
  'Africa/Lusaka': 'Zambia', 'Africa/Malabo': 'Equatorial Guinea', 'Africa/Maputo': 'Mozambique',
  'Africa/Maseru': 'Lesotho', 'Africa/Mbabane': 'Eswatini', 'Africa/Mogadishu': 'Somalia',
  'Africa/Monrovia': 'Liberia', 'Africa/Nairobi': 'Kenya', 'Africa/Ndjamena': 'Chad',
  'Africa/Niamey': 'Niger', 'Africa/Nouakchott': 'Mauritania', 'Africa/Ouagadougou': 'Burkina Faso',
  'Africa/Porto-Novo': 'Benin', 'Africa/Sao_Tome': 'São Tomé and Príncipe', 'Africa/Tripoli': 'Libya',
  'Africa/Tunis': 'Tunisia', 'Africa/Windhoek': 'Namibia',

  // Americas
  'America/Adak': 'United States', 'America/Anchorage': 'United States',
  'America/Anguilla': 'Anguilla', 'America/Antigua': 'Antigua and Barbuda',
  'America/Araguaina': 'Brazil', 'America/Argentina/La_Rioja': 'Argentina',
  'America/Argentina/Rio_Gallegos': 'Argentina', 'America/Argentina/Salta': 'Argentina',
  'America/Argentina/San_Juan': 'Argentina', 'America/Argentina/San_Luis': 'Argentina',
  'America/Argentina/Tucuman': 'Argentina', 'America/Argentina/Ushuaia': 'Argentina',
  'America/Aruba': 'Aruba', 'America/Asuncion': 'Paraguay', 'America/Bahia': 'Brazil',
  'America/Bahia_Banderas': 'Mexico', 'America/Barbados': 'Barbados', 'America/Belem': 'Brazil',
  'America/Belize': 'Belize', 'America/Blanc-Sablon': 'Canada', 'America/Boa_Vista': 'Brazil',
  'America/Bogota': 'Colombia', 'America/Boise': 'United States',
  'America/Buenos_Aires': 'Argentina', 'America/Cambridge_Bay': 'Canada',
  'America/Campo_Grande': 'Brazil', 'America/Cancun': 'Mexico', 'America/Caracas': 'Venezuela',
  'America/Catamarca': 'Argentina', 'America/Cayenne': 'French Guiana',
  'America/Cayman': 'Cayman Islands', 'America/Chicago': 'United States',
  'America/Chihuahua': 'Mexico', 'America/Ciudad_Juarez': 'Mexico',
  'America/Coral_Harbour': 'Canada', 'America/Cordoba': 'Argentina',
  'America/Costa_Rica': 'Costa Rica', 'America/Coyhaique': 'Chile', 'America/Creston': 'Canada',
  'America/Cuiaba': 'Brazil', 'America/Curacao': 'Curaçao', 'America/Danmarkshavn': 'Greenland',
  'America/Dawson': 'Canada', 'America/Dawson_Creek': 'Canada', 'America/Denver': 'United States',
  'America/Detroit': 'United States', 'America/Dominica': 'Dominica', 'America/Edmonton': 'Canada',
  'America/Eirunepe': 'Brazil', 'America/El_Salvador': 'El Salvador',
  'America/Fort_Nelson': 'Canada', 'America/Fortaleza': 'Brazil', 'America/Glace_Bay': 'Canada',
  'America/Godthab': 'Greenland', 'America/Goose_Bay': 'Canada',
  'America/Grand_Turk': 'Turks and Caicos Islands', 'America/Grenada': 'Grenada',
  'America/Guadeloupe': 'Guadeloupe', 'America/Guatemala': 'Guatemala',
  'America/Guayaquil': 'Ecuador', 'America/Guyana': 'Guyana', 'America/Halifax': 'Canada',
  'America/Havana': 'Cuba', 'America/Hermosillo': 'Mexico',
  'America/Indiana/Knox': 'United States', 'America/Indiana/Marengo': 'United States',
  'America/Indiana/Petersburg': 'United States', 'America/Indiana/Tell_City': 'United States',
  'America/Indiana/Vevay': 'United States', 'America/Indiana/Vincennes': 'United States',
  'America/Indiana/Winamac': 'United States', 'America/Indianapolis': 'United States',
  'America/Inuvik': 'Canada', 'America/Iqaluit': 'Canada', 'America/Jamaica': 'Jamaica',
  'America/Jujuy': 'Argentina', 'America/Juneau': 'United States',
  'America/Kentucky/Monticello': 'United States', 'America/Kralendijk': 'Caribbean Netherlands',
  'America/La_Paz': 'Bolivia', 'America/Lima': 'Peru', 'America/Los_Angeles': 'United States',
  'America/Louisville': 'United States', 'America/Lower_Princes': 'Sint Maarten',
  'America/Maceio': 'Brazil', 'America/Managua': 'Nicaragua', 'America/Manaus': 'Brazil',
  'America/Marigot': 'Saint Martin', 'America/Martinique': 'Martinique',
  'America/Matamoros': 'Mexico', 'America/Mazatlan': 'Mexico', 'America/Mendoza': 'Argentina',
  'America/Menominee': 'United States', 'America/Merida': 'Mexico',
  'America/Metlakatla': 'United States', 'America/Mexico_City': 'Mexico',
  'America/Miquelon': 'Saint Pierre and Miquelon', 'America/Moncton': 'Canada',
  'America/Monterrey': 'Mexico', 'America/Montevideo': 'Uruguay',
  'America/Montserrat': 'Montserrat', 'America/Nassau': 'Bahamas', 'America/New_York': 'United States',
  'America/Nome': 'United States', 'America/Noronha': 'Brazil',
  'America/North_Dakota/Beulah': 'United States', 'America/North_Dakota/Center': 'United States',
  'America/North_Dakota/New_Salem': 'United States', 'America/Ojinaga': 'Mexico',
  'America/Panama': 'Panama', 'America/Paramaribo': 'Suriname', 'America/Phoenix': 'United States',
  'America/Port-au-Prince': 'Haiti', 'America/Port_of_Spain': 'Trinidad and Tobago',
  'America/Porto_Velho': 'Brazil', 'America/Puerto_Rico': 'Puerto Rico',
  'America/Punta_Arenas': 'Chile', 'America/Rankin_Inlet': 'Canada', 'America/Recife': 'Brazil',
  'America/Regina': 'Canada', 'America/Resolute': 'Canada', 'America/Rio_Branco': 'Brazil',
  'America/Santarem': 'Brazil', 'America/Santiago': 'Chile',
  'America/Santo_Domingo': 'Dominican Republic', 'America/Sao_Paulo': 'Brazil',
  'America/Scoresbysund': 'Greenland', 'America/Sitka': 'United States',
  'America/St_Barthelemy': 'Saint Barthélemy', 'America/St_Johns': 'Canada',
  'America/St_Kitts': 'Saint Kitts and Nevis', 'America/St_Lucia': 'Saint Lucia',
  'America/St_Thomas': 'US Virgin Islands', 'America/St_Vincent': 'Saint Vincent and the Grenadines',
  'America/Swift_Current': 'Canada', 'America/Tegucigalpa': 'Honduras', 'America/Thule': 'Greenland',
  'America/Tijuana': 'Mexico', 'America/Toronto': 'Canada', 'America/Tortola': 'British Virgin Islands',
  'America/Vancouver': 'Canada', 'America/Whitehorse': 'Canada', 'America/Winnipeg': 'Canada',
  'America/Yakutat': 'United States',

  // Antarctica / Arctic
  'Antarctica/Casey': 'Antarctica', 'Antarctica/Davis': 'Antarctica',
  'Antarctica/DumontDUrville': 'Antarctica', 'Antarctica/Macquarie': 'Australia',
  'Antarctica/Mawson': 'Antarctica', 'Antarctica/McMurdo': 'Antarctica',
  'Antarctica/Palmer': 'Antarctica', 'Antarctica/Rothera': 'Antarctica',
  'Antarctica/Syowa': 'Antarctica', 'Antarctica/Troll': 'Antarctica', 'Antarctica/Vostok': 'Antarctica',
  'Arctic/Longyearbyen': 'Svalbard',

  // Asia
  'Asia/Aden': 'Yemen', 'Asia/Almaty': 'Kazakhstan', 'Asia/Amman': 'Jordan', 'Asia/Anadyr': 'Russia',
  'Asia/Aqtau': 'Kazakhstan', 'Asia/Aqtobe': 'Kazakhstan', 'Asia/Ashgabat': 'Turkmenistan',
  'Asia/Atyrau': 'Kazakhstan', 'Asia/Baghdad': 'Iraq', 'Asia/Bahrain': 'Bahrain',
  'Asia/Baku': 'Azerbaijan', 'Asia/Bangkok': 'Thailand', 'Asia/Barnaul': 'Russia',
  'Asia/Beirut': 'Lebanon', 'Asia/Bishkek': 'Kyrgyzstan', 'Asia/Brunei': 'Brunei',
  'Asia/Calcutta': 'India', 'Asia/Chita': 'Russia', 'Asia/Colombo': 'Sri Lanka',
  'Asia/Damascus': 'Syria', 'Asia/Dhaka': 'Bangladesh', 'Asia/Dili': 'Timor-Leste',
  'Asia/Dubai': 'UAE', 'Asia/Dushanbe': 'Tajikistan', 'Asia/Famagusta': 'Cyprus',
  'Asia/Gaza': 'Palestine', 'Asia/Hebron': 'Palestine', 'Asia/Hong_Kong': 'Hong Kong',
  'Asia/Hovd': 'Mongolia', 'Asia/Irkutsk': 'Russia', 'Asia/Jakarta': 'Indonesia',
  'Asia/Jayapura': 'Indonesia', 'Asia/Jerusalem': 'Israel', 'Asia/Kabul': 'Afghanistan',
  'Asia/Kamchatka': 'Russia', 'Asia/Karachi': 'Pakistan', 'Asia/Kathmandu': 'Nepal',
  'Asia/Katmandu': 'Nepal', 'Asia/Khandyga': 'Russia', 'Asia/Kolkata': 'India',
  'Asia/Krasnoyarsk': 'Russia', 'Asia/Kuala_Lumpur': 'Malaysia', 'Asia/Kuching': 'Malaysia',
  'Asia/Kuwait': 'Kuwait', 'Asia/Macau': 'Macau', 'Asia/Magadan': 'Russia',
  'Asia/Makassar': 'Indonesia', 'Asia/Manila': 'Philippines', 'Asia/Muscat': 'Oman',
  'Asia/Nicosia': 'Cyprus', 'Asia/Novokuznetsk': 'Russia', 'Asia/Novosibirsk': 'Russia',
  'Asia/Omsk': 'Russia', 'Asia/Oral': 'Kazakhstan', 'Asia/Phnom_Penh': 'Cambodia',
  'Asia/Pontianak': 'Indonesia', 'Asia/Pyongyang': 'North Korea', 'Asia/Qatar': 'Qatar',
  'Asia/Qostanay': 'Kazakhstan', 'Asia/Qyzylorda': 'Kazakhstan', 'Asia/Rangoon': 'Myanmar',
  'Asia/Riyadh': 'Saudi Arabia', 'Asia/Saigon': 'Vietnam', 'Asia/Sakhalin': 'Russia',
  'Asia/Samarkand': 'Uzbekistan', 'Asia/Seoul': 'South Korea', 'Asia/Shanghai': 'China',
  'Asia/Singapore': 'Singapore', 'Asia/Srednekolymsk': 'Russia', 'Asia/Taipei': 'Taiwan',
  'Asia/Tashkent': 'Uzbekistan', 'Asia/Tbilisi': 'Georgia', 'Asia/Tehran': 'Iran',
  'Asia/Thimphu': 'Bhutan', 'Asia/Tokyo': 'Japan', 'Asia/Tomsk': 'Russia',
  'Asia/Ulaanbaatar': 'Mongolia', 'Asia/Urumqi': 'China', 'Asia/Ust-Nera': 'Russia',
  'Asia/Vientiane': 'Laos', 'Asia/Vladivostok': 'Russia', 'Asia/Yakutsk': 'Russia',
  'Asia/Yekaterinburg': 'Russia', 'Asia/Yerevan': 'Armenia',

  // Atlantic
  'Atlantic/Azores': 'Portugal', 'Atlantic/Bermuda': 'Bermuda', 'Atlantic/Canary': 'Spain',
  'Atlantic/Cape_Verde': 'Cape Verde', 'Atlantic/Faeroe': 'Faroe Islands',
  'Atlantic/Madeira': 'Portugal', 'Atlantic/Reykjavik': 'Iceland',
  'Atlantic/South_Georgia': 'South Georgia', 'Atlantic/St_Helena': 'Saint Helena',

  // Australia
  'Australia/Adelaide': 'Australia', 'Australia/Brisbane': 'Australia',
  'Australia/Broken_Hill': 'Australia', 'Australia/Darwin': 'Australia',
  'Australia/Eucla': 'Australia', 'Australia/Hobart': 'Australia',
  'Australia/Lindeman': 'Australia', 'Australia/Lord_Howe': 'Australia',
  'Australia/Melbourne': 'Australia', 'Australia/Perth': 'Australia', 'Australia/Sydney': 'Australia',

  // Europe
  'Europe/Amsterdam': 'Netherlands', 'Europe/Andorra': 'Andorra', 'Europe/Astrakhan': 'Russia',
  'Europe/Athens': 'Greece', 'Europe/Belgrade': 'Serbia', 'Europe/Berlin': 'Germany',
  'Europe/Bratislava': 'Slovakia', 'Europe/Brussels': 'Belgium', 'Europe/Bucharest': 'Romania',
  'Europe/Budapest': 'Hungary', 'Europe/Busingen': 'Germany', 'Europe/Chisinau': 'Moldova',
  'Europe/Copenhagen': 'Denmark', 'Europe/Dublin': 'Ireland', 'Europe/Gibraltar': 'Gibraltar',
  'Europe/Guernsey': 'Guernsey', 'Europe/Helsinki': 'Finland', 'Europe/Isle_of_Man': 'Isle of Man',
  'Europe/Istanbul': 'Türkiye', 'Europe/Jersey': 'Jersey', 'Europe/Kaliningrad': 'Russia',
  'Europe/Kiev': 'Ukraine', 'Europe/Kirov': 'Russia', 'Europe/Lisbon': 'Portugal',
  'Europe/Ljubljana': 'Slovenia', 'Europe/London': 'United Kingdom', 'Europe/Luxembourg': 'Luxembourg',
  'Europe/Madrid': 'Spain', 'Europe/Malta': 'Malta', 'Europe/Mariehamn': 'Åland Islands',
  'Europe/Minsk': 'Belarus', 'Europe/Monaco': 'Monaco', 'Europe/Moscow': 'Russia',
  'Europe/Oslo': 'Norway', 'Europe/Paris': 'France', 'Europe/Podgorica': 'Montenegro',
  'Europe/Prague': 'Czechia', 'Europe/Riga': 'Latvia', 'Europe/Rome': 'Italy',
  'Europe/Samara': 'Russia', 'Europe/San_Marino': 'San Marino',
  'Europe/Sarajevo': 'Bosnia and Herzegovina', 'Europe/Saratov': 'Russia',
  'Europe/Simferopol': 'Ukraine', 'Europe/Skopje': 'North Macedonia', 'Europe/Sofia': 'Bulgaria',
  'Europe/Stockholm': 'Sweden', 'Europe/Tallinn': 'Estonia', 'Europe/Tirane': 'Albania',
  'Europe/Ulyanovsk': 'Russia', 'Europe/Vaduz': 'Liechtenstein', 'Europe/Vatican': 'Vatican City',
  'Europe/Vienna': 'Austria', 'Europe/Vilnius': 'Lithuania', 'Europe/Volgograd': 'Russia',
  'Europe/Warsaw': 'Poland', 'Europe/Zagreb': 'Croatia', 'Europe/Zurich': 'Switzerland',

  // Indian Ocean
  'Indian/Antananarivo': 'Madagascar', 'Indian/Chagos': 'British Indian Ocean Territory',
  'Indian/Christmas': 'Australia', 'Indian/Cocos': 'Australia', 'Indian/Comoro': 'Comoros',
  'Indian/Kerguelen': 'French Southern Territories', 'Indian/Mahe': 'Seychelles',
  'Indian/Maldives': 'Maldives', 'Indian/Mauritius': 'Mauritius', 'Indian/Mayotte': 'Mayotte',
  'Indian/Reunion': 'Réunion',

  // Pacific
  'Pacific/Apia': 'Samoa', 'Pacific/Auckland': 'New Zealand',
  'Pacific/Bougainville': 'Papua New Guinea', 'Pacific/Chatham': 'New Zealand',
  'Pacific/Easter': 'Chile', 'Pacific/Efate': 'Vanuatu', 'Pacific/Enderbury': 'Kiribati',
  'Pacific/Fakaofo': 'Tokelau', 'Pacific/Fiji': 'Fiji', 'Pacific/Funafuti': 'Tuvalu',
  'Pacific/Galapagos': 'Ecuador', 'Pacific/Gambier': 'French Polynesia',
  'Pacific/Guadalcanal': 'Solomon Islands', 'Pacific/Guam': 'Guam',
  'Pacific/Honolulu': 'United States', 'Pacific/Kiritimati': 'Kiribati',
  'Pacific/Kosrae': 'Micronesia', 'Pacific/Kwajalein': 'Marshall Islands',
  'Pacific/Majuro': 'Marshall Islands', 'Pacific/Marquesas': 'French Polynesia',
  'Pacific/Midway': 'United States', 'Pacific/Nauru': 'Nauru', 'Pacific/Niue': 'Niue',
  'Pacific/Norfolk': 'Australia', 'Pacific/Noumea': 'New Caledonia',
  'Pacific/Pago_Pago': 'American Samoa', 'Pacific/Palau': 'Palau', 'Pacific/Pitcairn': 'Pitcairn Islands',
  'Pacific/Ponape': 'Micronesia', 'Pacific/Port_Moresby': 'Papua New Guinea',
  'Pacific/Rarotonga': 'Cook Islands', 'Pacific/Saipan': 'Northern Mariana Islands',
  'Pacific/Tahiti': 'French Polynesia', 'Pacific/Tarawa': 'Kiribati', 'Pacific/Tongatapu': 'Tonga',
  'Pacific/Truk': 'Micronesia', 'Pacific/Wake': 'United States', 'Pacific/Wallis': 'Wallis and Futuna',
};

/** Alternate names people search for that are neither the zone's own city
 *  nor an abbreviation: other major cities that share the same zone, plus
 *  deprecated IANA "link" names that Intl.supportedValuesOf() omits as
 *  non-canonical but that Intl.DateTimeFormat still accepts as valid
 *  timeZone values. Same set of underlying zones, more ways to find them.
 *  Values are resolved through resolveZone() below, so it doesn't matter
 *  which spelling a given runtime treats as canonical. */
const SYNONYMS: Record<string, string> = {
  // major-city synonyms — same zone as the city already listed for it
  Mumbai: 'Asia/Kolkata', Delhi: 'Asia/Kolkata', 'New Delhi': 'Asia/Kolkata',
  Bengaluru: 'Asia/Kolkata', Bangalore: 'Asia/Kolkata', Chennai: 'Asia/Kolkata',
  Hyderabad: 'Asia/Kolkata', Pune: 'Asia/Kolkata',
  Boston: 'America/New_York', Miami: 'America/New_York', Washington: 'America/New_York',
  Atlanta: 'America/New_York', Philadelphia: 'America/New_York',
  Houston: 'America/Chicago', Dallas: 'America/Chicago', Austin: 'America/Chicago',
  'San Antonio': 'America/Chicago',
  Seattle: 'America/Los_Angeles', Portland: 'America/Los_Angeles',
  'San Diego': 'America/Los_Angeles', 'San Jose': 'America/Los_Angeles',
  'Las Vegas': 'America/Los_Angeles',
  Beijing: 'Asia/Shanghai', Guangzhou: 'Asia/Shanghai', Shenzhen: 'Asia/Shanghai',
  'Rio de Janeiro': 'America/Sao_Paulo',
  Frankfurt: 'Europe/Berlin', Munich: 'Europe/Berlin', Hamburg: 'Europe/Berlin',
  Milan: 'Europe/Rome', Naples: 'Europe/Rome', Barcelona: 'Europe/Madrid',
  Osaka: 'Asia/Tokyo', 'St Petersburg': 'Europe/Moscow', 'Saint Petersburg': 'Europe/Moscow',
  Manchester: 'Europe/London', Birmingham: 'Europe/London',
  Edinburgh: 'Europe/London', Glasgow: 'Europe/London',
  Montreal: 'America/Toronto', Ottawa: 'America/Toronto',

  // deprecated IANA link names — still valid, just excluded from supportedValuesOf()
  'Asia/Calcutta': 'Asia/Kolkata', 'Asia/Katmandu': 'Asia/Kathmandu',
  'US/Eastern': 'America/New_York', 'US/Central': 'America/Chicago',
  'US/Mountain': 'America/Denver', 'US/Pacific': 'America/Los_Angeles',
  'US/Alaska': 'America/Anchorage', 'US/Hawaii': 'Pacific/Honolulu',
  'US/Arizona': 'America/Phoenix', 'US/Aleutian': 'America/Adak',
  'US/Samoa': 'Pacific/Pago_Pago', 'US/East-Indiana': 'America/Indianapolis',
  'Canada/Eastern': 'America/Toronto', 'Canada/Central': 'America/Winnipeg',
  'Canada/Mountain': 'America/Edmonton', 'Canada/Pacific': 'America/Vancouver',
  'Canada/Atlantic': 'America/Halifax', 'Canada/Newfoundland': 'America/St_Johns',
  'Canada/Saskatchewan': 'America/Regina', 'Canada/Yukon': 'America/Whitehorse',
  'Brazil/East': 'America/Sao_Paulo', 'Brazil/Acre': 'America/Rio_Branco',
  'Brazil/DeNoronha': 'America/Noronha', 'Brazil/West': 'America/Manaus',
  'Mexico/General': 'America/Mexico_City', 'Mexico/BajaNorte': 'America/Tijuana',
  'Mexico/BajaSur': 'America/Mazatlan',
  'Chile/Continental': 'America/Santiago', 'Chile/EasterIsland': 'Pacific/Easter',
  GB: 'Europe/London', 'GB-Eire': 'Europe/London', Eire: 'Europe/Dublin',
  Iceland: 'Atlantic/Reykjavik', Israel: 'Asia/Jerusalem', Japan: 'Asia/Tokyo',
  Poland: 'Europe/Warsaw', Portugal: 'Europe/Lisbon', PRC: 'Asia/Shanghai',
  ROC: 'Asia/Taipei', ROK: 'Asia/Seoul', Turkey: 'Europe/Istanbul', Egypt: 'Africa/Cairo',
  Cuba: 'America/Havana', Hongkong: 'Asia/Hong_Kong', Iran: 'Asia/Tehran', Libya: 'Africa/Tripoli',
  NZ: 'Pacific/Auckland', 'NZ-CHAT': 'Pacific/Chatham', 'W-SU': 'Europe/Moscow',
  Navajo: 'America/Denver', Zulu: 'UTC', UCT: 'UTC', Universal: 'UTC', Greenwich: 'UTC',
};

export const SYNONYMS_BY_ZONE: Record<string, string[]> = {};
for (const [name, target] of Object.entries(SYNONYMS)) {
  (SYNONYMS_BY_ZONE[resolveZone(target)] ??= []).push(name);
}

export function regionOf(zone: string): string {
  return zone.includes('/') ? zone.split('/')[0] : 'Other';
}

function isFixedOffsetZone(zone: string): boolean {
  return zone.startsWith('Etc/GMT');
}

/** Etc/GMT's sign is POSIX-inverted from the UTC offset it names (Etc/GMT+12
 *  is UTC-12) — surface the actual offset instead of the confusing raw id. */
function fixedOffsetLabel(zone: string): string {
  const m = /^Etc\/GMT([+-]\d{1,2})$/.exec(zone);
  if (!m) return zone;
  const hours = -Number(m[1]);
  const sign = hours >= 0 ? '+' : '-';
  return `UTC${sign}${String(Math.abs(hours)).padStart(2, '0')}:00`;
}

export function cityOf(zone: string): string {
  if (isFixedOffsetZone(zone)) return fixedOffsetLabel(zone);
  const parts = canonicalZone(zone).split('/');
  return parts[parts.length - 1].replace(/_/g, ' ');
}

export function countryOf(zone: string): string {
  if (isFixedOffsetZone(zone)) return 'No DST';
  return COUNTRY[zone] || COUNTRY[canonicalZone(zone)] || regionOf(zone).replace(/_/g, ' ');
}

export function zoneLabel(zone: string): string {
  return `${cityOf(zone)}, ${countryOf(zone)}`;
}

/** Other names this zone is searchable under, for a small "aka" hint in the
 *  picker — otherwise a "Mumbai" search landing on a row labeled "Kolkata"
 *  reads as a wrong result rather than an intentional synonym match. */
export function synonymsOf(zone: string): string[] {
  return SYNONYMS_BY_ZONE[zone] || [];
}

/* ---------- offsets and conversion ---------- */

const partsCache = new Map<string, Intl.DateTimeFormat>();
function fmtParts(zone: string): Intl.DateTimeFormat {
  let fmt = partsCache.get(zone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    partsCache.set(zone, fmt);
  }
  return fmt;
}

/** The wall-clock time in `zone` at instant `date`, as a UTC-based epoch.
 *  Difference from the real epoch is the zone's offset at that instant. */
function asUTCEpoch(date: Date, zone: string): number {
  const parts = fmtParts(zone).formatToParts(date);
  const o: Record<string, string> = {};
  for (const p of parts) if (p.type !== 'literal') o[p.type] = p.value;
  const hour = o.hour === '24' ? 0 : Number(o.hour);
  return Date.UTC(Number(o.year), Number(o.month) - 1, Number(o.day), hour, Number(o.minute), Number(o.second));
}

export function offsetMs(date: Date, zone: string): number {
  return asUTCEpoch(date, zone) - date.getTime();
}

/** Wall-clock time in `zone` -> real instant. Two passes so DST shifts land right. */
export function wallToInstant(y: number, mo: number, d: number, h: number, mi: number, zone: string): Date {
  const naive = Date.UTC(y, mo - 1, d, h, mi, 0);
  const guess = new Date(naive - offsetMs(new Date(naive), zone));
  const refined = new Date(naive - offsetMs(guess, zone));
  return refined;
}

/** True if the given wall-clock time doesn't exist in `zone` at that date
 *  (a spring-forward DST gap), meaning `wallToInstant` had to round to the
 *  nearest valid instant instead of an exact match. */
export function isWallClockGap(h: number, mi: number, zone: string, instant: Date): boolean {
  const parts = fmtParts(zone).formatToParts(instant);
  const got: Record<string, string> = {};
  for (const p of parts) if (p.type !== 'literal') got[p.type] = p.value;
  return Number(got.hour) !== h || Number(got.minute) !== mi;
}

const labelCache = new Map<string, string>();
export function offsetLabel(zone: string, date: Date): string {
  const key = `${zone}|${Math.floor(date.getTime() / 60000)}`;
  const cached = labelCache.get(key);
  if (cached) return cached;
  const mins = Math.round(offsetMs(date, zone) / 60000);
  const sign = mins < 0 ? '-' : '+';
  const abs = Math.abs(mins);
  const label = `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
  labelCache.set(key, label);
  return label;
}

export function shortName(zone: string, date: Date): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' }).formatToParts(date);
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

export function prettyIn(zone: string, date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: zone, weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(date);
}

/** Wall-clock time in `zone` at instant `atMs`, formatted as a
 *  datetime-local input value (`YYYY-MM-DDTHH:mm`). Used to seed the
 *  converter's date field with the time *in the selected From zone* — the
 *  value that wallToInstant() then reads back as From-zone local time.
 *  Seeding it from the browser's own clock instead (as the converter did
 *  before) is wrong whenever From isn't the browser's zone. */
export function wallClockInZone(zone: string, atMs: number): string {
  const o: Record<string, string> = {};
  for (const p of fmtParts(zone).formatToParts(new Date(atMs))) {
    if (p.type !== 'literal') o[p.type] = p.value;
  }
  const hour = o.hour === '24' ? '00' : o.hour;
  return `${o.year}-${o.month}-${o.day}T${hour}:${o.minute}`;
}

export function detectLocalZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/* ---------- search ---------- */

export interface ZoneMatch {
  zone: string;
  score: number;
}

function score(zone: string, q: string): number {
  const city = cityOf(zone).toLowerCase();
  const synonyms = (SYNONYMS_BY_ZONE[zone] || []).map((s) => s.toLowerCase());
  // Includes the friendly city label and synonyms, not just the raw id, so
  // searching a UTC offset (e.g. "-12") matches a fixed-offset zone like
  // Etc/GMT+12 despite its POSIX-inverted raw name, and a partial synonym
  // match (e.g. "banga...") still finds something via substring fallback.
  const full = `${zone} ${city} ${synonyms.join(' ')}`.toLowerCase();
  const abbrs = (ALIAS_BY_ZONE[zone] || []).map((a) => a.toLowerCase());
  if (abbrs.includes(q)) return 0;
  if (city === q || synonyms.includes(q)) return 1;
  if (city.startsWith(q) || synonyms.some((s) => s.startsWith(q))) return 2;
  if (abbrs.some((a) => a.startsWith(q))) return 3;
  if (countryOf(zone).toLowerCase().startsWith(q)) return 4;
  if (full.includes(q)) return 5;
  return -1;
}

/** Exact-abbreviation matches with more than one zone (e.g. "IST") — the
 *  caller should show a disambiguation header above these results. */
export function ambiguousAliasMatches(query: string): string[] | null {
  const matches = ALIASES[query.trim().toUpperCase()];
  return matches && matches.length > 1 ? matches : null;
}

export function searchZones(query: string, pinned: string[] = [], limit = 80): string[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    const rest = ZONES.filter((z) => !pinned.includes(z));
    return [...pinned, ...rest].slice(0, Math.min(limit, 60));
  }
  const matches: ZoneMatch[] = [];
  for (const zone of ZONES) {
    const s = score(zone, q);
    if (s >= 0) matches.push({ zone, score: s });
  }
  matches.sort((a, b) => a.score - b.score || a.zone.localeCompare(b.zone));
  return matches.slice(0, limit).map((m) => m.zone);
}

/* ---------- pinned zones ---------- */

const PINNED_KEY = 'cg_tz_pinned';

export function getPinnedZones(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PINNED_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Distinguishes "never set" (first visit, ok to seed defaults) from "user
 *  cleared their pins" (respect the empty state, don't re-seed). */
export function hasStoredPins(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(PINNED_KEY) !== null;
  } catch {
    return true;
  }
}

export function setPinnedZones(zones: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PINNED_KEY, JSON.stringify(zones));
  } catch {
    // localStorage unavailable (private mode etc.) — pins just won't persist
  }
}
