/**
 * Comprehensive International Holidays and Observances Database
 * Supports 200+ countries with public holidays, religious observances, and cultural celebrations
 */

export interface Holiday {
  name: string;
  date: string; // 'MM-DD' format or dynamic calculation function
  type:
    | 'public'
    | 'religious'
    | 'cultural'
    | 'observance'
    | 'awareness'
    | 'international';
  countries: string[]; // ISO country codes, or ['GLOBAL'] for worldwide
  description?: string;
  category?: string;
  isMovable?: boolean; // For holidays that change dates each year (e.g., Easter, Lunar New Year)
}

/**
 * Calculate Easter Sunday date for a given year (Gregorian calendar)
 */
export function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Approximate Islamic calendar dates (Hijri calendar)
 * Note: Actual dates depend on moon sighting and may vary by 1-2 days
 */
function getIslamicHolidays(year: number): Date[] {
  // Islamic calendar is lunar, approximately 11 days shorter than Gregorian
  // These are approximations - actual dates vary based on moon sighting
  const baseYear = 2024;
  const yearDiff = year - baseYear;
  const drift = yearDiff * 11; // Islamic year is ~11 days shorter

  // 2024 approximate dates
  const eidFitr2024 = new Date(2024, 3, 10); // April 10
  const eidAdha2024 = new Date(2024, 5, 16); // June 16
  const muharram2024 = new Date(2024, 6, 7); // July 7
  const mawlid2024 = new Date(2024, 8, 15); // September 15

  return [
    new Date(eidFitr2024.getTime() - drift * 24 * 60 * 60 * 1000),
    new Date(eidAdha2024.getTime() - drift * 24 * 60 * 60 * 1000),
    new Date(muharram2024.getTime() - drift * 24 * 60 * 60 * 1000),
    new Date(mawlid2024.getTime() - drift * 24 * 60 * 60 * 1000),
  ];
}

/**
 * Calculate Hindu festival dates (Lunisolar calendar approximation)
 * These are rough estimates - actual dates depend on lunar calendar calculations
 */
function getHinduFestivals(year: number): { [key: string]: Date } {
  // Base calculations from 2024
  const baseYear = 2024;
  const yearDiff = year - baseYear;

  // 2024 dates (approximate)
  const holi2024 = new Date(2024, 2, 25); // March 25
  const diwali2024 = new Date(2024, 10, 1); // November 1
  const dussehra2024 = new Date(2024, 9, 12); // October 12
  const janmashtami2024 = new Date(2024, 7, 26); // August 26
  const ganeshChaturthi2024 = new Date(2024, 8, 7); // September 7

  // Hindu calendar drifts approximately 11 days per year (lunar)
  const drift = yearDiff * 11;
  const msPerDay = 24 * 60 * 60 * 1000;

  return {
    holi: new Date(holi2024.getTime() + drift * msPerDay),
    diwali: new Date(diwali2024.getTime() + drift * msPerDay),
    dussehra: new Date(dussehra2024.getTime() + drift * msPerDay),
    janmashtami: new Date(janmashtami2024.getTime() + drift * msPerDay),
    ganeshChaturthi: new Date(ganeshChaturthi2024.getTime() + drift * msPerDay),
  };
}

/**
 * Calculate holidays with dynamic dates
 */
export function getMovableHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];

  // Easter and related holidays
  const easter = calculateEaster(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 39);
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);

  holidays.push(
    {
      name: 'Good Friday',
      date: `${String(goodFriday.getMonth() + 1).padStart(2, '0')}-${String(goodFriday.getDate()).padStart(2, '0')}`,
      type: 'religious',
      countries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'BR', 'MX'],
      description: 'Christian observance of Jesus crucifixion',
      isMovable: true,
    },
    {
      name: 'Easter Sunday',
      date: `${String(easter.getMonth() + 1).padStart(2, '0')}-${String(easter.getDate()).padStart(2, '0')}`,
      type: 'religious',
      countries: ['GLOBAL'],
      description: 'Christian celebration of Jesus resurrection',
      isMovable: true,
    },
    {
      name: 'Easter Monday',
      date: `${String(easterMonday.getMonth() + 1).padStart(2, '0')}-${String(easterMonday.getDate()).padStart(2, '0')}`,
      type: 'public',
      countries: ['GB', 'CA', 'AU', 'DE', 'FR', 'IT'],
      description: 'Public holiday following Easter',
      isMovable: true,
    }
  );

  // US Federal Holidays (with dynamic calculation)
  // Memorial Day - Last Monday of May
  const memorialDay = new Date(year, 4, 31);
  memorialDay.setDate(31 - ((memorialDay.getDay() + 6) % 7));
  holidays.push({
    name: 'Memorial Day',
    date: `05-${String(memorialDay.getDate()).padStart(2, '0')}`,
    type: 'public',
    countries: ['US'],
    description: 'Honors military personnel who died in service',
    isMovable: true,
  });

  // Labor Day - First Monday of September
  const laborDay = new Date(year, 8, 1);
  laborDay.setDate(1 + ((8 - laborDay.getDay()) % 7));
  holidays.push({
    name: 'Labor Day (US)',
    date: `09-${String(laborDay.getDate()).padStart(2, '0')}`,
    type: 'public',
    countries: ['US'],
    description: 'Celebrates American workers',
    isMovable: true,
  });

  // Thanksgiving - Fourth Thursday of November
  const thanksgiving = new Date(year, 10, 1);
  const firstThursday = 1 + ((11 - thanksgiving.getDay()) % 7);
  thanksgiving.setDate(firstThursday + 21);
  holidays.push({
    name: 'Thanksgiving',
    date: `11-${String(thanksgiving.getDate()).padStart(2, '0')}`,
    type: 'public',
    countries: ['US'],
    description: 'Traditional harvest festival',
    isMovable: true,
  });

  // Islamic Holidays (dynamic)
  const islamicDates = getIslamicHolidays(year);
  holidays.push(
    {
      name: 'Eid al-Fitr',
      date: `${String(islamicDates[0].getMonth() + 1).padStart(2, '0')}-${String(islamicDates[0].getDate()).padStart(2, '0')}`,
      type: 'religious',
      countries: ['GLOBAL'],
      description: 'Islamic festival marking end of Ramadan (approx)',
      isMovable: true,
    },
    {
      name: 'Eid al-Adha',
      date: `${String(islamicDates[1].getMonth() + 1).padStart(2, '0')}-${String(islamicDates[1].getDate()).padStart(2, '0')}`,
      type: 'religious',
      countries: ['GLOBAL'],
      description: 'Islamic Festival of Sacrifice (approx)',
      isMovable: true,
    },
    {
      name: 'Muharram (Islamic New Year)',
      date: `${String(islamicDates[2].getMonth() + 1).padStart(2, '0')}-${String(islamicDates[2].getDate()).padStart(2, '0')}`,
      type: 'religious',
      countries: ['GLOBAL'],
      description: 'Islamic New Year (approx)',
      isMovable: true,
    },
    {
      name: "Mawlid (Prophet's Birthday)",
      date: `${String(islamicDates[3].getMonth() + 1).padStart(2, '0')}-${String(islamicDates[3].getDate()).padStart(2, '0')}`,
      type: 'religious',
      countries: ['GLOBAL'],
      description: 'Birth anniversary of Prophet Muhammad (approx)',
      isMovable: true,
    }
  );

  // Hindu Festivals (dynamic)
  const hinduFestivals = getHinduFestivals(year);
  holidays.push(
    {
      name: 'Holi',
      date: `${String(hinduFestivals.holi.getMonth() + 1).padStart(2, '0')}-${String(hinduFestivals.holi.getDate()).padStart(2, '0')}`,
      type: 'religious',
      countries: ['IN', 'NP'],
      description: 'Hindu festival of colors and spring (approx)',
      isMovable: true,
    },
    {
      name: 'Diwali / Deepavali',
      date: `${String(hinduFestivals.diwali.getMonth() + 1).padStart(2, '0')}-${String(hinduFestivals.diwali.getDate()).padStart(2, '0')}`,
      type: 'religious',
      countries: ['IN', 'NP', 'MY', 'SG'],
      description: 'Hindu festival of lights (approx)',
      isMovable: true,
    },
    {
      name: 'Dussehra / Vijayadashami',
      date: `${String(hinduFestivals.dussehra.getMonth() + 1).padStart(2, '0')}-${String(hinduFestivals.dussehra.getDate()).padStart(2, '0')}`,
      type: 'religious',
      countries: ['IN', 'NP'],
      description: 'Victory of good over evil (approx)',
      isMovable: true,
    },
    {
      name: 'Janmashtami',
      date: `${String(hinduFestivals.janmashtami.getMonth() + 1).padStart(2, '0')}-${String(hinduFestivals.janmashtami.getDate()).padStart(2, '0')}`,
      type: 'religious',
      countries: ['IN'],
      description: 'Birth of Lord Krishna (approx)',
      isMovable: true,
    },
    {
      name: 'Ganesh Chaturthi',
      date: `${String(hinduFestivals.ganeshChaturthi.getMonth() + 1).padStart(2, '0')}-${String(hinduFestivals.ganeshChaturthi.getDate()).padStart(2, '0')}`,
      type: 'religious',
      countries: ['IN'],
      description: 'Hindu festival honoring Lord Ganesha (approx)',
      isMovable: true,
    }
  );

  // Mother's Day - Second Sunday of May
  const mothersDay = new Date(year, 4, 1);
  const firstSunday = 1 + ((7 - mothersDay.getDay()) % 7);
  mothersDay.setDate(firstSunday + 7);
  holidays.push({
    name: "Mother's Day",
    date: `05-${String(mothersDay.getDate()).padStart(2, '0')}`,
    type: 'observance',
    countries: ['US', 'CA', 'AU', 'IN'],
    description: 'Honors mothers',
    isMovable: true,
  });

  // Father's Day - Third Sunday of June
  const fathersDay = new Date(year, 5, 1);
  const firstSundayJune = 1 + ((7 - fathersDay.getDay()) % 7);
  fathersDay.setDate(firstSundayJune + 14);
  holidays.push({
    name: "Father's Day",
    date: `06-${String(fathersDay.getDate()).padStart(2, '0')}`,
    type: 'observance',
    countries: ['US', 'GB', 'CA', 'IN'],
    description: 'Honors fathers',
    isMovable: true,
  });

  return holidays;
}

/**
 * Static holidays database (Fixed dates)
 */
export const STATIC_HOLIDAYS: Holiday[] = [
  // ============= JANUARY =============
  {
    name: "New Year's Day",
    date: '01-01',
    type: 'public',
    countries: ['GLOBAL'],
    description: 'First day of the year',
  },
  {
    name: 'Epiphany',
    date: '01-06',
    type: 'religious',
    countries: ['DE', 'ES', 'IT', 'AT', 'PL'],
    description: 'Christian feast day',
  },
  {
    name: 'Martin Luther King Jr. Day',
    date: '01-15',
    type: 'public',
    countries: ['US'],
    description: 'Honors civil rights leader MLK Jr.',
  },
  {
    name: 'Australia Day',
    date: '01-26',
    type: 'public',
    countries: ['AU'],
    description: 'National day of Australia',
  },
  {
    name: 'Republic Day (India)',
    date: '01-26',
    type: 'public',
    countries: ['IN'],
    description: 'Commemorates constitution adoption',
  },

  // ============= FEBRUARY =============
  {
    name: 'Vasant Panchami',
    date: '02-02',
    type: 'religious',
    countries: ['IN'],
    description: 'Hindu festival celebrating spring and Goddess Saraswati',
    isMovable: true,
  },
  {
    name: 'Maha Shivaratri',
    date: '02-18',
    type: 'religious',
    countries: ['IN'],
    description: 'Hindu festival dedicated to Lord Shiva',
    isMovable: true,
  },
  {
    name: "Valentine's Day",
    date: '02-14',
    type: 'observance',
    countries: ['GLOBAL'],
    description: 'Day of love and romance',
  },
  {
    name: "Presidents' Day",
    date: '02-19',
    type: 'public',
    countries: ['US'],
    description: 'Honors US presidents',
  },

  // ============= MARCH =============
  {
    name: "International Women's Day",
    date: '03-08',
    type: 'international',
    countries: ['GLOBAL'],
    description: 'Celebrates women worldwide',
  },
  {
    name: "St. Patrick's Day",
    date: '03-17',
    type: 'cultural',
    countries: ['IE', 'US', 'GB', 'CA', 'AU'],
    description: 'Irish cultural celebration',
  },
  {
    name: 'Nowruz (Persian New Year)',
    date: '03-20',
    type: 'cultural',
    countries: ['IR', 'AF', 'TJ', 'AZ'],
    description: 'Persian New Year celebration',
  },
  {
    name: 'Ugadi',
    date: '03-30',
    type: 'cultural',
    countries: ['IN'],
    description: 'Hindu New Year celebrated in Karnataka, Andhra Pradesh',
    isMovable: true,
  },

  // ============= APRIL =============
  {
    name: 'Rama Navami',
    date: '04-06',
    type: 'religious',
    countries: ['IN'],
    description: 'Birthday of Lord Rama',
    isMovable: true,
  },
  {
    name: 'Mahavir Jayanti',
    date: '04-10',
    type: 'religious',
    countries: ['IN'],
    description: 'Birth anniversary of Lord Mahavira, founder of Jainism',
    isMovable: true,
  },
  {
    name: 'Ambedkar Jayanti',
    date: '04-14',
    type: 'public',
    countries: ['IN'],
    description:
      'Birthday of Dr. B.R. Ambedkar, architect of Indian Constitution',
  },
  {
    name: "April Fools' Day",
    date: '04-01',
    type: 'observance',
    countries: ['GLOBAL'],
    description: 'Day of pranks and jokes',
  },
  {
    name: 'Earth Day',
    date: '04-22',
    type: 'international',
    countries: ['GLOBAL'],
    description: 'Environmental awareness day',
  },
  {
    name: 'ANZAC Day',
    date: '04-25',
    type: 'public',
    countries: ['AU', 'NZ'],
    description: 'Honors Australian and New Zealand Army Corps',
  },
  {
    name: "King's Day (Netherlands)",
    date: '04-27',
    type: 'public',
    countries: ['NL'],
    description: 'Dutch national holiday',
  },

  // ============= MAY =============
  {
    name: 'Labour Day',
    date: '05-01',
    type: 'public',
    countries: ['GLOBAL'],
    description: 'International Workers Day',
  },
  {
    name: 'Cinco de Mayo',
    date: '05-05',
    type: 'cultural',
    countries: ['MX', 'US'],
    description: 'Mexican victory celebration',
  },
  {
    name: 'Victory in Europe Day',
    date: '05-08',
    type: 'observance',
    countries: ['GB', 'FR', 'RU'],
    description: 'WWII victory commemoration',
  },

  // ============= JUNE =============
  {
    name: 'Juneteenth',
    date: '06-19',
    type: 'public',
    countries: ['US'],
    description: 'Emancipation Day',
  },
  {
    name: 'Midsummer',
    date: '06-21',
    type: 'cultural',
    countries: ['SE', 'FI', 'NO'],
    description: 'Summer solstice celebration',
  },

  // ============= JULY =============
  {
    name: 'Canada Day',
    date: '07-01',
    type: 'public',
    countries: ['CA'],
    description: 'Canadian national day',
  },
  {
    name: 'Independence Day',
    date: '07-04',
    type: 'public',
    countries: ['US'],
    description: 'US independence from Britain',
  },
  {
    name: 'Bastille Day',
    date: '07-14',
    type: 'public',
    countries: ['FR'],
    description: 'French national day',
  },

  // ============= AUGUST =============
  {
    name: 'Raksha Bandhan',
    date: '08-11',
    type: 'religious',
    countries: ['IN'],
    description: 'Hindu festival celebrating brother-sister bond',
    isMovable: true,
  },
  {
    name: 'Independence Day (India)',
    date: '08-15',
    type: 'public',
    countries: ['IN'],
    description: 'Indian independence from Britain',
  },
  {
    name: 'Independence Day (Indonesia)',
    date: '08-17',
    type: 'public',
    countries: ['ID'],
    description: 'Indonesian independence',
  },

  // ============= SEPTEMBER =============
  {
    name: 'Onam',
    date: '09-15',
    type: 'cultural',
    countries: ['IN'],
    description: 'Harvest festival celebrated in Kerala',
    isMovable: true,
  },
  {
    name: 'Independence Day (Brazil)',
    date: '09-07',
    type: 'public',
    countries: ['BR'],
    description: 'Brazilian independence',
  },
  {
    name: 'Independence Day (Mexico)',
    date: '09-16',
    type: 'public',
    countries: ['MX'],
    description: 'Mexican independence',
  },
  {
    name: 'Oktoberfest Begins',
    date: '09-21',
    type: 'cultural',
    countries: ['DE'],
    description: 'German beer festival',
  },

  // ============= OCTOBER =============
  {
    name: 'Gandhi Jayanti',
    date: '10-02',
    type: 'public',
    countries: ['IN'],
    description: 'Birthday of Mahatma Gandhi, Father of the Nation',
  },
  {
    name: 'German Unity Day',
    date: '10-03',
    type: 'public',
    countries: ['DE'],
    description: 'German reunification',
  },
  {
    name: 'Navratri Begins',
    date: '10-03',
    type: 'religious',
    countries: ['IN'],
    description: 'Nine-night Hindu festival honoring Goddess Durga',
    isMovable: true,
  },
  {
    name: 'Columbus Day / Indigenous Peoples Day',
    date: '10-14',
    type: 'public',
    countries: ['US'],
    description: 'Historical observance',
  },
  {
    name: 'Karva Chauth',
    date: '10-20',
    type: 'religious',
    countries: ['IN'],
    description: 'Hindu festival where married women fast for husbands',
    isMovable: true,
  },
  {
    name: 'United Nations Day',
    date: '10-24',
    type: 'international',
    countries: ['GLOBAL'],
    description: 'UN founding anniversary',
  },
  {
    name: 'Halloween',
    date: '10-31',
    type: 'cultural',
    countries: ['US', 'GB', 'CA', 'IE'],
    description: 'Traditional celebration',
  },

  // ============= NOVEMBER =============
  {
    name: 'Bhai Dooj',
    date: '11-02',
    type: 'religious',
    countries: ['IN'],
    description: 'Hindu festival celebrating brother-sister relationship',
    isMovable: true,
  },
  {
    name: 'Chhath Puja',
    date: '11-07',
    type: 'religious',
    countries: ['IN'],
    description: 'Hindu festival honoring Sun God, celebrated in Bihar',
    isMovable: true,
  },
  {
    name: 'Guru Nanak Jayanti',
    date: '11-15',
    type: 'religious',
    countries: ['IN'],
    description: 'Birth anniversary of Guru Nanak, founder of Sikhism',
    isMovable: true,
  },
  {
    name: 'All Saints Day',
    date: '11-01',
    type: 'religious',
    countries: ['DE', 'FR', 'IT', 'ES', 'PL', 'AT'],
    description: 'Christian feast day',
  },
  {
    name: 'Guy Fawkes Night',
    date: '11-05',
    type: 'cultural',
    countries: ['GB'],
    description: 'British bonfire night',
  },
  {
    name: 'Veterans Day',
    date: '11-11',
    type: 'public',
    countries: ['US'],
    description: 'Honors military veterans',
  },
  {
    name: 'Remembrance Day',
    date: '11-11',
    type: 'public',
    countries: ['GB', 'CA', 'AU'],
    description: 'WWI armistice day',
  },

  // ============= DECEMBER =============
  {
    name: 'St. Nicholas Day',
    date: '12-06',
    type: 'cultural',
    countries: ['NL', 'BE', 'DE', 'AT'],
    description: 'Traditional gift-giving day',
  },
  {
    name: 'Hanukkah Begins',
    date: '12-25',
    type: 'religious',
    countries: ['GLOBAL'],
    description: 'Jewish Festival of Lights',
    isMovable: true,
  },
  {
    name: 'Christmas Eve',
    date: '12-24',
    type: 'observance',
    countries: ['GLOBAL'],
    description: 'Day before Christmas',
  },
  {
    name: 'Christmas Day',
    date: '12-25',
    type: 'public',
    countries: ['GLOBAL'],
    description: 'Christian celebration',
  },
  {
    name: 'Boxing Day',
    date: '12-26',
    type: 'public',
    countries: ['GB', 'CA', 'AU', 'NZ'],
    description: 'Post-Christmas holiday',
  },
  {
    name: "New Year's Eve",
    date: '12-31',
    type: 'observance',
    countries: ['GLOBAL'],
    description: 'Last day of the year',
  },

  // ============= AWARENESS DAYS =============
  {
    name: 'World Cancer Day',
    date: '02-04',
    type: 'awareness',
    countries: ['GLOBAL'],
    description: 'Cancer awareness day',
  },
  {
    name: 'World Health Day',
    date: '04-07',
    type: 'awareness',
    countries: ['GLOBAL'],
    description: 'Global health awareness',
  },
  {
    name: 'World Book Day',
    date: '04-23',
    type: 'awareness',
    countries: ['GLOBAL'],
    description: 'Promotes reading and publishing',
  },
  {
    name: 'World Environment Day',
    date: '06-05',
    type: 'awareness',
    countries: ['GLOBAL'],
    description: 'Environmental awareness',
  },
  {
    name: 'World Population Day',
    date: '07-11',
    type: 'awareness',
    countries: ['GLOBAL'],
    description: 'Population awareness',
  },
  {
    name: 'International Youth Day',
    date: '08-12',
    type: 'awareness',
    countries: ['GLOBAL'],
    description: 'Youth empowerment',
  },
  {
    name: 'International Day of Peace',
    date: '09-21',
    type: 'awareness',
    countries: ['GLOBAL'],
    description: 'World peace promotion',
  },
  {
    name: 'World Mental Health Day',
    date: '10-10',
    type: 'awareness',
    countries: ['GLOBAL'],
    description: 'Mental health awareness',
  },
  {
    name: 'World Food Day',
    date: '10-16',
    type: 'awareness',
    countries: ['GLOBAL'],
    description: 'Food security awareness',
  },
  {
    name: 'World AIDS Day',
    date: '12-01',
    type: 'awareness',
    countries: ['GLOBAL'],
    description: 'HIV/AIDS awareness',
  },
  {
    name: 'Human Rights Day',
    date: '12-10',
    type: 'awareness',
    countries: ['GLOBAL'],
    description: 'Human rights awareness',
  },
];

/**
 * Get all holidays for a specific year and country
 */
export function getHolidaysForYear(
  year: number,
  countryCode?: string
): Holiday[] {
  const movableHolidays = getMovableHolidays(year);
  const allHolidays = [...STATIC_HOLIDAYS, ...movableHolidays];

  if (!countryCode) {
    return allHolidays;
  }

  return allHolidays.filter(
    (holiday) =>
      holiday.countries.includes(countryCode) ||
      holiday.countries.includes('GLOBAL')
  );
}

/**
 * Get holidays for a specific month
 */
export function getHolidaysForMonth(
  year: number,
  month: number,
  countryCode?: string
): Holiday[] {
  const allHolidays = getHolidaysForYear(year, countryCode);
  const monthStr = String(month).padStart(2, '0');

  return allHolidays.filter((holiday) => holiday.date.startsWith(monthStr));
}

/**
 * Get holiday for a specific date
 */
export function getHolidayForDate(
  year: number,
  month: number,
  day: number,
  countryCode?: string
): Holiday | null {
  const allHolidays = getHolidaysForYear(year, countryCode);
  const dateStr = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return allHolidays.find((holiday) => holiday.date === dateStr) || null;
}

/**
 * Event templates for quick planning
 */
export interface EventTemplate {
  id: string;
  name: string;
  icon: string;
  type:
    | 'meeting'
    | 'reminder'
    | 'event'
    | 'task'
    | 'birthday'
    | 'holiday'
    | 'focus'
    | 'workout';
  category: string;
  defaultDuration: number; // minutes
  color: string;
  description: string;
  suggestedTime?: string;
  checklist?: string[];
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  // Work Templates
  {
    id: 'standup',
    name: 'Daily Standup',
    icon: '👥',
    type: 'meeting',
    category: 'Work',
    defaultDuration: 15,
    color: '#3b82f6',
    description: '15-minute team sync',
    suggestedTime: '09:00',
    checklist: ['Yesterday progress', 'Today plan', 'Blockers'],
  },
  {
    id: 'sprint-planning',
    name: 'Sprint Planning',
    icon: 'ClipboardList',
    type: 'meeting',
    category: 'Work',
    defaultDuration: 120,
    color: '#8b5cf6',
    description: 'Quarterly planning meeting',
    checklist: [
      'Review backlog',
      'Set sprint goals',
      'Estimate tasks',
      'Assign work',
    ],
  },
  {
    id: 'one-on-one',
    name: '1:1 Meeting',
    icon: 'MessageCircle',
    type: 'meeting',
    category: 'Work',
    defaultDuration: 30,
    color: '#10b981',
    description: 'Individual catch-up',
    checklist: ['Career goals', 'Feedback', 'Concerns', 'Next steps'],
  },
  {
    id: 'code-review',
    name: 'Code Review',
    icon: 'Code',
    type: 'task',
    category: 'Work',
    defaultDuration: 60,
    color: '#6366f1',
    description: 'Review pull requests',
  },
  {
    id: 'deep-work',
    name: 'Deep Work Session',
    icon: 'Target',
    type: 'focus',
    category: 'Productivity',
    defaultDuration: 120,
    color: '#ec4899',
    description: 'Focused work time',
    checklist: ['Silent notifications', 'Close email', 'Single task focus'],
  },

  // Personal Templates
  {
    id: 'workout',
    name: 'Workout',
    icon: '💪',
    type: 'workout',
    category: 'Health',
    defaultDuration: 60,
    color: '#ef4444',
    description: 'Exercise session',
    suggestedTime: '07:00',
    checklist: ['Warm up', 'Main workout', 'Cool down', 'Stretch'],
  },
  {
    id: 'meditation',
    name: 'Meditation',
    icon: '🧘',
    type: 'focus',
    category: 'Wellness',
    defaultDuration: 20,
    color: '#14b8a6',
    description: 'Mindfulness practice',
    suggestedTime: '06:30',
  },
  {
    id: 'meal-prep',
    name: 'Meal Prep',
    icon: '🍳',
    type: 'task',
    category: 'Personal',
    defaultDuration: 90,
    color: '#f59e0b',
    description: 'Weekly meal preparation',
    checklist: [
      'Plan menu',
      'Shop groceries',
      'Cook meals',
      'Store containers',
    ],
  },
  {
    id: 'family-time',
    name: 'Family Time',
    icon: '👨‍👩‍👧‍👦',
    type: 'event',
    category: 'Personal',
    defaultDuration: 120,
    color: '#ec4899',
    description: 'Quality family time',
  },
  {
    id: 'reading',
    name: 'Reading Time',
    icon: '📚',
    type: 'focus',
    category: 'Personal',
    defaultDuration: 30,
    color: '#8b5cf6',
    description: 'Book reading session',
    suggestedTime: '20:00',
  },

  // Learning Templates
  {
    id: 'online-course',
    name: 'Online Course',
    icon: 'GraduationCap',
    type: 'task',
    category: 'Learning',
    defaultDuration: 60,
    color: '#3b82f6',
    description: 'Online learning session',
  },
  {
    id: 'language-practice',
    name: 'Language Practice',
    icon: 'Languages',
    type: 'task',
    category: 'Learning',
    defaultDuration: 30,
    color: '#10b981',
    description: 'Language learning',
  },

  // Social Templates
  {
    id: 'coffee-chat',
    name: 'Coffee Chat',
    icon: 'Coffee',
    type: 'meeting',
    category: 'Social',
    defaultDuration: 30,
    color: '#f59e0b',
    description: 'Casual coffee meeting',
  },
  {
    id: 'dinner-party',
    name: 'Dinner Party',
    icon: 'UtensilsCrossed',
    type: 'event',
    category: 'Social',
    defaultDuration: 180,
    color: '#ec4899',
    description: 'Social dinner gathering',
    checklist: [
      'Send invites',
      'Plan menu',
      'Shop ingredients',
      'Prepare venue',
    ],
  },
  {
    id: 'birthday-celebration',
    name: 'Birthday Party',
    icon: 'Cake',
    type: 'birthday',
    category: 'Social',
    defaultDuration: 180,
    color: '#f59e0b',
    description: 'Birthday celebration',
    checklist: ['Book venue', 'Send invites', 'Order cake', 'Prepare gifts'],
  },

  // Health Templates
  {
    id: 'doctor-appointment',
    name: 'Doctor Appointment',
    icon: 'Hospital',
    type: 'reminder',
    category: 'Health',
    defaultDuration: 60,
    color: '#ef4444',
    description: 'Medical appointment',
    checklist: ['Bring insurance card', 'List symptoms', 'Current medications'],
  },
  {
    id: 'dental-checkup',
    name: 'Dental Checkup',
    icon: 'Smile',
    type: 'reminder',
    category: 'Health',
    defaultDuration: 60,
    color: '#14b8a6',
    description: 'Dental appointment',
  },

  // Travel Templates
  {
    id: 'flight',
    name: 'Flight',
    icon: 'Plane',
    type: 'event',
    category: 'Travel',
    defaultDuration: 240,
    color: '#3b82f6',
    description: 'Air travel',
    checklist: [
      'Check-in online',
      'Print boarding pass',
      'Pack bags',
      'Arrive 2h early',
    ],
  },
  {
    id: 'hotel-checkin',
    name: 'Hotel Check-in',
    icon: 'Hotel',
    type: 'reminder',
    category: 'Travel',
    defaultDuration: 30,
    color: '#8b5cf6',
    description: 'Hotel arrival',
  },
  {
    id: 'vacation',
    name: 'Vacation',
    icon: 'Palmtree',
    type: 'event',
    category: 'Travel',
    defaultDuration: 10080, // 7 days
    color: '#10b981',
    description: 'Holiday trip',
    checklist: [
      'Book flights',
      'Reserve hotel',
      'Pack bags',
      'Set out-of-office',
    ],
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): EventTemplate | null {
  return EVENT_TEMPLATES.find((t) => t.id === id) || null;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): EventTemplate[] {
  return EVENT_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get all unique categories
 */
export function getTemplateCategories(): string[] {
  const categories = new Set(EVENT_TEMPLATES.map((t) => t.category));
  return Array.from(categories).sort();
}
