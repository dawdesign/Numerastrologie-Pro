export interface CountryFoundingData {
    name: string;
    isExactDateUnknown: boolean;
    month?: number;
    day?: number;
    year?: number;
    earthSign: string; // e.g. "Goat", "Tiger", "Pig", "Snake", etc.
    aliases?: string[];
}

export const COUNTRIES_FOUNDING_DATA: CountryFoundingData[] = [
    { name: "Austria", isExactDateUnknown: false, month: 10, day: 26, year: 1955, earthSign: "Goat" },
    { name: "Belgium", isExactDateUnknown: false, month: 10, day: 4, year: 1830, earthSign: "Tiger" },
    { name: "Bosnia", isExactDateUnknown: false, month: 3, day: 2, year: 1992, earthSign: "Monkey" },
    { name: "Bulgaria", isExactDateUnknown: false, month: 3, day: 3, year: 1878, earthSign: "Tiger" },
    { name: "Croatia", isExactDateUnknown: false, month: 6, day: 25, year: 1991, earthSign: "Goat" },
    { name: "England", isExactDateUnknown: false, month: 7, day: 12, year: 927, earthSign: "Pig" },
    { name: "France", isExactDateUnknown: false, month: 10, day: 4, year: 1958, earthSign: "Dog" },
    { name: "Germany", isExactDateUnknown: false, month: 10, day: 3, year: 1990, earthSign: "Horse" },
    { name: "Monaco", isExactDateUnknown: false, month: 1, day: 8, year: 1297, earthSign: "Monkey" },
    { name: "Netherlands", isExactDateUnknown: false, month: 7, day: 26, year: 1581, earthSign: "Snake" },
    { name: "Norway", isExactDateUnknown: false, month: 5, day: 17, year: 1814, earthSign: "Dog" },
    { name: "Portugal", isExactDateUnknown: false, month: 7, day: 25, year: 1143, earthSign: "Pig" },
    { name: "Russia", isExactDateUnknown: false, month: 12, day: 25, year: 1991, earthSign: "Goat" },
    { name: "Scotland", isExactDateUnknown: true, earthSign: "Pig" },
    { name: "Spain", isExactDateUnknown: false, month: 12, day: 6, year: 1978, earthSign: "Horse" },
    { name: "Sweden", isExactDateUnknown: false, month: 6, day: 6, year: 1523, earthSign: "Goat" },
    { name: "Switzerland", isExactDateUnknown: false, month: 9, day: 12, year: 1848, earthSign: "Monkey" },
    { name: "United Kingdom", isExactDateUnknown: false, month: 5, day: 1, year: 1707, earthSign: "Pig", aliases: ["UK", "Britain", "Great Britain"] },
    { name: "Argentina", isExactDateUnknown: false, month: 5, day: 25, year: 1810, earthSign: "Horse" },
    { name: "Brazil", isExactDateUnknown: false, month: 9, day: 7, year: 1822, earthSign: "Horse", aliases: ["Brasil"] },
    { name: "Canada", isExactDateUnknown: false, month: 7, day: 1, year: 1867, earthSign: "Cat" },
    { name: "Colombia", isExactDateUnknown: false, month: 7, day: 20, year: 1810, earthSign: "Horse" },
    { name: "Ecuador", isExactDateUnknown: false, month: 5, day: 13, year: 1830, earthSign: "Tiger" },
    { name: "Mexico", isExactDateUnknown: false, month: 9, day: 28, year: 1821, earthSign: "Snake" },
    { name: "Panama", isExactDateUnknown: false, month: 11, day: 3, year: 1903, earthSign: "Cat" },
    { name: "Paraguay", isExactDateUnknown: false, month: 5, day: 15, year: 1811, earthSign: "Goat" },
    { name: "United States", isExactDateUnknown: false, month: 7, day: 4, year: 1776, earthSign: "Monkey", aliases: ["USA", "US", "United States of America"] },
    { name: "Venezuela", isExactDateUnknown: false, month: 12, day: 15, year: 1999, earthSign: "Cat" },
    { name: "Iran", isExactDateUnknown: false, month: 4, day: 1, year: 1979, earthSign: "Goat" },
    { name: "Iraq", isExactDateUnknown: false, month: 7, day: 14, year: 1958, earthSign: "Dog" },
    { name: "Saudi Arabia", isExactDateUnknown: false, month: 9, day: 23, year: 1932, earthSign: "Monkey" },
    { name: "Qatar", isExactDateUnknown: false, month: 9, day: 3, year: 1971, earthSign: "Pig" },
    { name: "Turkey", isExactDateUnknown: false, month: 10, day: 29, year: 1923, earthSign: "Pig" },
    { name: "Australia", isExactDateUnknown: false, month: 1, day: 1, year: 1901, earthSign: "Rat" },
    { name: "China", isExactDateUnknown: false, month: 10, day: 1, year: 1949, earthSign: "Ox" },
    { name: "India", isExactDateUnknown: false, month: 8, day: 15, year: 1947, earthSign: "Pig" },
    { name: "Japan", isExactDateUnknown: false, month: 2, day: 11, year: 660, earthSign: "Monkey" },
    { name: "North Korea", isExactDateUnknown: false, month: 9, day: 9, year: 1948, earthSign: "Rat" },
    { name: "Uzbekistan", isExactDateUnknown: false, month: 9, day: 1, year: 1991, earthSign: "Goat", aliases: ["Ouzbékistan"] },
    { name: "South Korea", isExactDateUnknown: false, month: 8, day: 15, year: 1948, earthSign: "Rat" },
    { name: "Thailand", isExactDateUnknown: false, month: 6, day: 24, year: 1932, earthSign: "Monkey" },
    { name: "Algeria", isExactDateUnknown: false, month: 7, day: 5, year: 1962, earthSign: "Tiger" },
    { name: "Egypt", isExactDateUnknown: false, month: 6, day: 18, year: 1953, earthSign: "Snake" },
    { name: "Ivory Coast", isExactDateUnknown: false, month: 8, day: 7, year: 1960, earthSign: "Rat" },
    { name: "Mali", isExactDateUnknown: false, month: 9, day: 22, year: 1960, earthSign: "Rat" },
    { name: "Morocco", isExactDateUnknown: true, earthSign: "Snake", aliases: ["Morroco"] },
    { name: "Nigeria", isExactDateUnknown: false, month: 10, day: 1, year: 1960, earthSign: "Rat" },
    { name: "Ghana", isExactDateUnknown: false, month: 3, day: 6, year: 1957, earthSign: "Rooster" },
    { name: "RD Congo", isExactDateUnknown: false, month: 6, day: 30, year: 1960, earthSign: "Rat", aliases: ["Congo", "DR Congo", "Democratic Republic of the Congo", "République Démocratique du Congo"] },
    { name: "Senegal", isExactDateUnknown: false, month: 4, day: 4, year: 1960, earthSign: "Rat" },
    { name: "South Africa", isExactDateUnknown: false, month: 4, day: 27, year: 1994, earthSign: "Dog" }
];
