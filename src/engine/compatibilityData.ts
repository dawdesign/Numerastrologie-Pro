export type CompatibilityLevel = 'Enem' | 'Bad' | '50' | 'Good' | 'Best' | 'MS' | 'Neutral';

export const NUMEROLOGY_COMPATIBILITY: Record<string, Record<string, CompatibilityLevel>> = {
    '1': {
        '1': 'Good', '2': 'Good', '3': 'Good', '4': 'Good', '6': 'MS', '7': 'Good', '8': 'Good', '9': 'Enem', '11': 'Best'
    },
    '2': {
        '1': 'Good', '3': 'Good', '4': 'Good', '5': 'Good', '6': 'Good', '8': 'Best', '9': 'Enem'
    },
    '3': {
        '1': 'Good', '2': 'Good', '3': 'Good', '4': 'Enem', '5': 'Best', '6': 'Good', '7': '50', '8': 'Good', '9': 'Good', '11': 'Good', '22': 'Good', '33': 'Good'
    },
    '4': {
        '1': 'Good', '2': 'Good', '3': 'Enem', '5': 'Enem', '6': 'Best', '7': 'Good', '8': 'Best', '9': 'Best'
    },
    '5': {
        '2': 'Good', '3': 'Best', '4': 'Enem', '5': 'Good', '6': 'Enem', '7': 'Best', '8': 'Good', '9': 'Good', '22': 'Enem', '33': 'Good'
    },
    '6': {
        '1': 'MS', '2': 'Good', '3': 'Good', '4': 'Best', '5': 'Enem', '7': 'Enem', '8': 'Good', '9': 'Good', '22': 'Good'
    },
    '7': {
        '1': 'Good', '3': '50', '4': 'Good', '5': 'Best', '6': 'Enem', '8': 'Enem', '9': 'Enem', '11': 'Best', '22': 'Good'
    },
    '8': {
        '1': 'Good', '2': 'Best', '3': 'Good', '4': 'Best', '5': 'Good', '6': 'Good', '7': 'Enem', '8': 'Bad', '22': 'Best', '33': 'Best'
    },
    '9': {
        '1': 'Enem', '2': 'Enem', '3': 'Good', '4': 'Best', '5': 'Good', '6': 'Good', '7': 'Enem', '9': 'Bad', '11': 'Enem', '22': 'Enem', '33': 'Enem'
    },
    '11': {
        '1': 'Best', '3': 'Good', '7': 'Best', '9': 'Enem', '11': 'Good', '22': 'Good', '33': 'Good'
    },
    '22': {
        '3': 'Good', '5': 'Enem', '6': 'Good', '7': 'Good', '8': 'Best', '9': 'Enem', '11': 'Good', '22': 'Good', '33': 'Good'
    },
    '33': {
        '3': 'Good', '5': 'Good', '8': 'Best', '9': 'Enem', '11': 'Good', '22': 'Good', '33': 'Good'
    }
};

export const ZODIAC_TRINES = [
    ['Rat', 'Monkey', 'Dragon'],
    ['Ox', 'Snake', 'Rooster'],
    ['Goat', 'Pig', 'Cat'],
    ['Horse', 'Dog', 'Tiger']
];

export const ZODIAC_ENEMIES = [
    ['Rat', 'Horse'],
    ['Ox', 'Goat'],
    ['Tiger', 'Monkey'],
    ['Cat', 'Rooster'],
    ['Dragon', 'Dog'],
    ['Snake', 'Pig']
];

export const ZODIAC_SOULMATES = [
    ['Rat', 'Ox']
];

export const ZODIAC_50 = [
    ['Dragon', 'Pig']
];
