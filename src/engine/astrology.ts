// astrology.ts

export type ZodiacSign = {
    name: string;
    emoji: string;
    id: number; // 0 to 11
};

export const EARTH_SIGNS: ZodiacSign[] = [
    { name: 'Rat', emoji: '🐀', id: 0 },
    { name: 'Ox', emoji: '🐂', id: 1 },
    { name: 'Tiger', emoji: '🐅', id: 2 },
    { name: 'Cat', emoji: '🐈', id: 3 }, // Note: Vietnamese uses Cat instead of Rabbit
    { name: 'Dragon', emoji: '🐉', id: 4 },
    { name: 'Snake', emoji: '🐍', id: 5 },
    { name: 'Horse', emoji: '🐎', id: 6 },
    { name: 'Goat', emoji: '🐐', id: 7 },
    { name: 'Monkey', emoji: '🐒', id: 8 },
    { name: 'Rooster', emoji: '🐓', id: 9 },
    { name: 'Dog', emoji: '🐕', id: 10 },
    { name: 'Pig', emoji: '🐖', id: 11 },
];

export const WESTERN_SIGNS = [
    { name: 'Aries', emoji: '♈', start: [3, 21], end: [4, 19] },
    { name: 'Taurus', emoji: '♉', start: [4, 20], end: [5, 20] },
    { name: 'Gemini', emoji: '♊', start: [5, 21], end: [6, 20] },
    { name: 'Cancer', emoji: '♋', start: [6, 21], end: [7, 22] },
    { name: 'Leo', emoji: '♌', start: [7, 23], end: [8, 22] },
    { name: 'Virgo', emoji: '♍', start: [8, 23], end: [9, 22] },
    { name: 'Libra', emoji: '♎', start: [9, 23], end: [10, 22] },
    { name: 'Scorpio', emoji: '♏', start: [10, 23], end: [11, 21] },
    { name: 'Sagittarius', emoji: '♐', start: [11, 22], end: [12, 21] },
    { name: 'Capricorn', emoji: '♑', start: [12, 22], end: [1, 19] },
    { name: 'Aquarius', emoji: '♒', start: [1, 20], end: [2, 18] },
    { name: 'Pisces', emoji: '♓', start: [2, 19], end: [3, 20] },
];

// Lunar New Year specific dates based on Vietnamese Astrology info
export const LUNAR_NEW_YEARS: { year: number, start: Date, signId: number }[] = [
    { year: 1948, start: new Date(1948, 1, 10), signId: 0 },
    { year: 1949, start: new Date(1949, 0, 29), signId: 1 },
    { year: 1950, start: new Date(1950, 1, 17), signId: 2 },
    { year: 1951, start: new Date(1951, 1, 6), signId: 3 },
    { year: 1952, start: new Date(1952, 0, 27), signId: 4 },
    { year: 1953, start: new Date(1953, 1, 14), signId: 5 },
    { year: 1954, start: new Date(1954, 1, 3), signId: 6 },
    { year: 1955, start: new Date(1955, 0, 24), signId: 7 },
    { year: 1956, start: new Date(1956, 1, 12), signId: 8 },
    { year: 1957, start: new Date(1957, 0, 31), signId: 9 },
    { year: 1958, start: new Date(1958, 1, 18), signId: 10 },
    { year: 1959, start: new Date(1959, 1, 8), signId: 11 },
    { year: 1960, start: new Date(1960, 0, 28), signId: 0 },
    { year: 1961, start: new Date(1961, 1, 15), signId: 1 },
    { year: 1962, start: new Date(1962, 1, 5), signId: 2 },
    { year: 1963, start: new Date(1963, 0, 25), signId: 3 },
    { year: 1964, start: new Date(1964, 1, 13), signId: 4 },
    { year: 1965, start: new Date(1965, 1, 2), signId: 5 },
    { year: 1966, start: new Date(1966, 0, 21), signId: 6 },
    { year: 1967, start: new Date(1967, 1, 9), signId: 7 },
    { year: 1968, start: new Date(1968, 0, 30), signId: 8 },
    { year: 1969, start: new Date(1969, 1, 17), signId: 9 },
    { year: 1970, start: new Date(1970, 1, 6), signId: 10 },
    { year: 1971, start: new Date(1971, 0, 27), signId: 11 },
    { year: 1972, start: new Date(1972, 1, 15), signId: 0 },
    { year: 1973, start: new Date(1973, 1, 3), signId: 1 },
    { year: 1974, start: new Date(1974, 0, 23), signId: 2 },
    { year: 1975, start: new Date(1975, 1, 11), signId: 3 },
    { year: 1976, start: new Date(1976, 0, 31), signId: 4 },
    { year: 1977, start: new Date(1977, 1, 18), signId: 5 },
    { year: 1978, start: new Date(1978, 1, 7), signId: 6 },
    { year: 1979, start: new Date(1979, 0, 28), signId: 7 },
    { year: 1980, start: new Date(1980, 1, 16), signId: 8 },
    { year: 1981, start: new Date(1981, 1, 5), signId: 9 },
    { year: 1982, start: new Date(1982, 0, 25), signId: 10 },
    { year: 1983, start: new Date(1983, 1, 13), signId: 11 },
    { year: 1984, start: new Date(1984, 1, 2), signId: 0 },
    { year: 1985, start: new Date(1985, 1, 19), signId: 1 },
    { year: 1986, start: new Date(1986, 1, 9), signId: 2 },
    { year: 1987, start: new Date(1987, 0, 29), signId: 3 },
    { year: 1988, start: new Date(1988, 1, 17), signId: 4 },
    { year: 1989, start: new Date(1989, 1, 6), signId: 5 },
    { year: 1990, start: new Date(1990, 0, 27), signId: 6 },
    { year: 1991, start: new Date(1991, 1, 15), signId: 7 },
    { year: 1992, start: new Date(1992, 1, 4), signId: 8 },
    { year: 1993, start: new Date(1993, 0, 23), signId: 9 },
    { year: 1994, start: new Date(1994, 1, 10), signId: 10 },
    { year: 1995, start: new Date(1995, 0, 30), signId: 11 },
    { year: 1996, start: new Date(1996, 1, 19), signId: 0 },
    { year: 1997, start: new Date(1997, 1, 7), signId: 1 },
    { year: 1998, start: new Date(1998, 0, 28), signId: 2 },
    { year: 1999, start: new Date(1999, 1, 16), signId: 3 },
    { year: 2000, start: new Date(2000, 1, 5), signId: 4 },
    { year: 2001, start: new Date(2001, 0, 24), signId: 5 },
    { year: 2002, start: new Date(2002, 1, 12), signId: 6 },
    { year: 2003, start: new Date(2003, 1, 1), signId: 7 },
    { year: 2004, start: new Date(2004, 0, 22), signId: 8 },
    { year: 2005, start: new Date(2005, 1, 9), signId: 9 },
    { year: 2006, start: new Date(2006, 0, 29), signId: 10 },
    { year: 2007, start: new Date(2007, 1, 17), signId: 11 },
    { year: 2008, start: new Date(2008, 1, 7), signId: 0 },
    { year: 2009, start: new Date(2009, 0, 26), signId: 1 },
    { year: 2010, start: new Date(2010, 1, 14), signId: 2 },
    { year: 2011, start: new Date(2011, 1, 3), signId: 3 },
    { year: 2012, start: new Date(2012, 0, 23), signId: 4 },
    { year: 2013, start: new Date(2013, 1, 10), signId: 5 },
    { year: 2014, start: new Date(2014, 0, 31), signId: 6 },
    { year: 2015, start: new Date(2015, 1, 19), signId: 7 },
    { year: 2016, start: new Date(2016, 1, 8), signId: 8 },
    { year: 2017, start: new Date(2017, 0, 28), signId: 9 },
    { year: 2018, start: new Date(2018, 1, 16), signId: 10 },
    { year: 2019, start: new Date(2019, 1, 4), signId: 11 },
    { year: 2020, start: new Date(2020, 0, 25), signId: 0 },
    { year: 2021, start: new Date(2021, 1, 12), signId: 1 },
    { year: 2022, start: new Date(2022, 1, 1), signId: 2 },
    { year: 2023, start: new Date(2023, 0, 22), signId: 3 },
    { year: 2024, start: new Date(2024, 1, 10), signId: 4 },
    { year: 2025, start: new Date(2025, 0, 29), signId: 5 },
    { year: 2026, start: new Date(2026, 1, 17), signId: 6 },
    { year: 2027, start: new Date(2027, 1, 6), signId: 7 },
    { year: 2028, start: new Date(2028, 0, 26), signId: 8 },
    { year: 2029, start: new Date(2029, 1, 13), signId: 9 },
    { year: 2030, start: new Date(2030, 1, 3), signId: 10 },
    { year: 2031, start: new Date(2031, 0, 22), signId: 11 }
];

/**
 * Get the Vietnamese Earth Sign based on the exact Lunar New Year boundary.
 */
export function getEarthSign(year: number, month: number, day: number): ZodiacSign {
    // month is 1-indexed (1 = Jan, 2 = Feb)
    const targetDate = new Date(year, month - 1, day);

    // Find the Lunar New Year for this calendar year
    const lunarYearRow = LUNAR_NEW_YEARS.find(r => r.year === year);

    if (lunarYearRow) {
        if (targetDate >= lunarYearRow.start) {
            // The person was born on or after LNY -> they belong to this year's sign
            return EARTH_SIGNS[lunarYearRow.signId];
        } else {
            // Born before LNY -> they belong to the PREVIOUS year's sign
            // The id of the previous year is simply (thisYearID - 1 + 12) % 12
            const previousSignId = (lunarYearRow.signId - 1 + 12) % 12;
            return EARTH_SIGNS[previousSignId];
        }
    } else {
        // Fallback logic if out of bounds (1948 - 2031)
        // Approximate Lunar New Year around Feb 4th.
        let lunarYear = year;
        if (month === 1 || (month === 2 && day <= 4)) {
            lunarYear = year - 1;
        }

        // Approximate using math: Year of Rat (1960) -> 1960 % 12 === 4.
        // So (Year - 4) % 12 give the sign ID.
        const approximateId = ((lunarYear - 4) % 12 + 12) % 12; // Avoid negative moduli
        return EARTH_SIGNS[approximateId];
    }
}

/**
 * Gets the Earth Month Sign based on specific Gregorian date boundaries.
 * Rat: Dec 7 - Jan 5
 * Ox: Jan 6 - Feb 3
 * Tiger: Feb 4 - Mar 5
 * Cat: Mar 6 - Apr 4
 * Dragon: Apr 5 - May 5
 * Snake: May 6 - Jun 5
 * Horse: Jun 6 - Jul 6
 * Goat: Jul 7 - Aug 7
 * Monkey: Aug 8 - Sep 7
 * Rooster: Sep 8 - Oct 7
 * Dog: Oct 8 - Nov 6
 * Pig: Nov 7 - Dec 6
 */
export function getEarthMonthSign(month: number, day: number): ZodiacSign {
    if ((month === 12 && day >= 7) || (month === 1 && day <= 5)) return EARTH_SIGNS[0]; // Rat
    if ((month === 1 && day >= 6) || (month === 2 && day <= 3)) return EARTH_SIGNS[1]; // Ox
    if ((month === 2 && day >= 4) || (month === 3 && day <= 5)) return EARTH_SIGNS[2]; // Tiger
    if ((month === 3 && day >= 6) || (month === 4 && day <= 4)) return EARTH_SIGNS[3]; // Cat
    if ((month === 4 && day >= 5) || (month === 5 && day <= 5)) return EARTH_SIGNS[4]; // Dragon
    if ((month === 5 && day >= 6) || (month === 6 && day <= 5)) return EARTH_SIGNS[5]; // Snake
    if ((month === 6 && day >= 6) || (month === 7 && day <= 6)) return EARTH_SIGNS[6]; // Horse
    if ((month === 7 && day >= 7) || (month === 8 && day <= 7)) return EARTH_SIGNS[7]; // Goat
    if ((month === 8 && day >= 8) || (month === 9 && day <= 7)) return EARTH_SIGNS[8]; // Monkey
    if ((month === 9 && day >= 8) || (month === 10 && day <= 7)) return EARTH_SIGNS[9]; // Rooster
    if ((month === 10 && day >= 8) || (month === 11 && day <= 6)) return EARTH_SIGNS[10]; // Dog
    if ((month === 11 && day >= 7) || (month === 12 && day <= 6)) return EARTH_SIGNS[11]; // Pig

    return EARTH_SIGNS[0]; // Fallback
}

/**
 * Gets the Western (Sky) Sign
 */
export function getWesternSign(month: number, day: number) {
    for (const sign of WESTERN_SIGNS) {
        const [startM, startD] = sign.start;
        const [endM, endD] = sign.end;

        if (
            (month === startM && day >= startD) ||
            (month === endM && day <= endD)
        ) {
            return sign;
        }
    }
    // Default fallback (should never be hit with valid dates)
    return WESTERN_SIGNS[0];
}

/**
 * Checks compatibility between two Earth Signs.
 * Each sign has +4 / -4 (Friend Trine) and +6 (Enemy).
 */
export type Compatibility = 'Enemy' | 'Friend' | 'Neutral' | 'Soulmate' | 'Same';

export function checkEarthSignCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): Compatibility {
    const id1 = sign1.id;
    const id2 = sign2.id;

    // Check Same sign
    if (id1 === id2) return 'Same';

    // Check Soulmates (Rat & Ox)
    if ((id1 === 0 && id2 === 1) || (id1 === 1 && id2 === 0)) return 'Soulmate';

    // Check Enemy (6 positions away on the wheel)
    const distance = Math.abs(id1 - id2);
    const circularDistance = Math.min(distance, 12 - distance);

    if (circularDistance === 6) return 'Enemy';

    // Check Friend (4 positions away - trines)
    if (circularDistance === 4) return 'Friend';

    // Other specific fatal attractions/exceptions from text:
    // Cat(Cat=3) and Rooster(Rooster=9) -> This is naturally distance 6 (Enemy)
    // Dog fights dog -> self neutral? the chart has exceptions. We can expand this later.

    return 'Neutral';
}
