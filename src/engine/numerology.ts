// numerology.ts

export const MASTER_NUMBERS = [11, 22, 33];
export const KARMIC_NUMBERS = [13, 14, 16, 19];

/**
 * Reduces a number to a single digit by summing its digits.
 * If the sum is a master number (11, 22, 33), it is NOT reduced further!
 */
export function reduceNumber(num: number): number {
    const absNum = Math.abs(num);
    if (MASTER_NUMBERS.includes(absNum)) return absNum;
    if (absNum < 10) return absNum;

    const sum = absNum
        .toString()
        .split('')
        .reduce((acc, digit) => acc + parseInt(digit, 10), 0);

    // Special Case: The only 2 energy allowed is from the 2nd day itself.
    // Any other number that reduces to 2 (like 20) is considered 11 energy.
    if (sum === 2) return 11;

    // If the sum is still > 9 and not a master number, reduce recursively
    if (sum > 9 && !MASTER_NUMBERS.includes(sum)) {
        return reduceNumber(sum);
    }

    return sum;
}

export function reduceToSingleDigit(num: number): number {
    const absNum = Math.abs(num);
    if (absNum < 10) return absNum;
    const sum = absNum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    return reduceToSingleDigit(sum);
}

/**
 * Reduces a number for cycles (Year, Month, Day, Life Path).
 * Enforces the rule that 2 energy does not exist in cycles and is always 11.
 */
export function reduceCycle(num: number): number {
    const reduced = reduceNumber(num);
    return (reduced === 2 || reduced === 11) ? 11 : reduced;
}

/**
 * Calculates Life Path by summing the EXACT digits of M, D, Y.
 * Returns both the unreduced base, the final lifepath, and pure master number status.
 */
export function calculateLifePath(month: number, day: number, year: number): {
    lifepath: number | string;
    lifepathNumber: number;
    unreduced: number;
    isMaster: boolean;
    isPure: boolean;
} {
    const sumDigits = (n: number) => Math.abs(n).toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);

    // Month: Keep 11, else sum digits
    const mVal = month === 11 ? 11 : sumDigits(month);
    
    // Day: Keep 11, 22, else sum digits
    const dVal = (day === 11 || day === 22) ? day : sumDigits(day);
    
    // Year: Sum individual digits (e.g. 1951 -> 1+9+5+1 = 16)
    const yVal = sumDigits(year);

    const unreduced = mVal + dVal + yVal;
    const lifepathNum = reduceCycle(unreduced);

    const isMaster = MASTER_NUMBERS.includes(lifepathNum);

    // A component is considered a reducible double digit if its sum is >= 10 and NOT a master number.
    const isReducibleDoubleDigit = (n: number) => n >= 10 && !MASTER_NUMBERS.includes(n);
    
    // Pure calculation: Check if original date parts were already reduced or master numbers
    // We only care about day purity for a lifepath to be "Pure" as months are always reduced (except 11).
    const dayPure = !isReducibleDoubleDigit(day);

    const isPure = isMaster && dayPure;

    let lifepath: string | number = lifepathNum;
    if (isMaster && !isPure) {
        if (lifepathNum === 22) lifepath = '22/4';
        if (lifepathNum === 33) lifepath = '33/6';
    }

    return { lifepath, lifepathNumber: lifepathNum, unreduced, isMaster, isPure };
}

export interface LetterDetails {
    char: string;
    original: number;
    reduced: number;
}

export interface LetterologyResult {
    originalSum: number;
    reducedSum: number;
    reduced: number;
    letters: LetterDetails[];
    originalEquation: string;
    reducedEquation: string;
}

/**
 * Simple Letterology Gematria: A=1, B=2 ... Z=26
 * Calculates original letter index sums, individually reduced digit sums, and final reduction.
 */
export function calculateLetterology(text: string): LetterologyResult {
    const cleanedText = text.toUpperCase().replace(/[^A-Z]/g, '');
    const letters: LetterDetails[] = [];
    let originalSum = 0;
    let reducedSum = 0;

    for (let i = 0; i < cleanedText.length; i++) {
        const char = cleanedText[i];
        const original = char.charCodeAt(0) - 64; // A=1, B=2, ... Z=26
        
        // Reduce the letter's value individually to a single digit
        let reduced = original;
        while (reduced > 9) {
            reduced = reduced.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
        }

        letters.push({ char, original, reduced });
        originalSum += original;
        reducedSum += reduced;
    }

    const reduced = reduceNumber(reducedSum);
    const originalEquation = letters.map(item => item.original).join('+');
    const reducedEquation = letters.map(item => item.reduced).join('+');

    return {
        originalSum,
        reducedSum,
        reduced,
        letters,
        originalEquation,
        reducedEquation
    };
}

/**
 * Calculates Personal Year, Month, and Day based on current date.
 */
export function calculatePersonalCycles(birthMonth: number, birthDay: number, currentMonth: number, currentDay: number, currentYear: number) {
    // 1. Personal Year = Birth Month + Birth Day + Year of last birthday
    let lastBirthdayYear = currentYear;
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
        lastBirthdayYear = currentYear - 1;
    }

    const personalYearResult = calculateLifePath(birthMonth, birthDay, lastBirthdayYear);
    const personalYear = personalYearResult.lifepathNumber;
    const personalYearString = personalYearResult.lifepath;

    // 2. Personal Month = Personal Year + Month
    // Cycle starts on the day of the month you were born
    let effectiveMonth = currentMonth;
    if (currentDay < birthDay) {
        effectiveMonth = currentMonth - 1;
        if (effectiveMonth === 0) {
            effectiveMonth = 12;
            // Note: Does the Personal Year roll back for Personal Month? The user logic mostly bases it on the calendar month rolling back.
        }
    }

    // Do NOT split master numbers (e.g. 11, 22) into 1+1 or 2+2! Use the actual values.
    const pmRaw = personalYear + reduceNumber(effectiveMonth);
    const personalMonth = reduceCycle(pmRaw);

    // 3. Personal Day = Personal Year + Month + Day
    // Add the current reduced calendar month and reduced calendar day to the personal year
    const pdRaw = personalYear + reduceNumber(currentMonth) + reduceNumber(currentDay);
    const personalDay = reduceCycle(pdRaw);

    return {
        personalYear: personalYearString,
        personalYearUnreduced: personalYearResult.unreduced,
        personalMonth,
        personalDay,
        lastBirthdayYear,
        effectiveMonth
    };
}

/**
 * Calculates Universal Year, Month, and Day based on a given calendar date.
 */
export function calculateUniversalCycles(currentMonth: number, currentDay: number, currentYear: number) {
    const universalYear = reduceCycle(currentYear);

    const umRaw = universalYear + reduceNumber(currentMonth);
    const universalMonth = reduceCycle(umRaw);

    const universalDayResult = calculateLifePath(currentMonth, currentDay, currentYear);

    return {
        universalYear,
        universalMonth,
        universalDay: universalDayResult.lifepath,
        universalDayUnreduced: universalDayResult.unreduced
    };
}

/**
 * Calculates a person's Lucky Number based on their birthdate.
 * The lucky number is formed by combining the first digit of the month 
 * and the last digit of the year in MM/DD/YYYY format.
 * E.g., 10/22/2001 -> '1' and '1' -> 11.
 * 05/02/1990 -> '0' and '0' -> 0.
 */
export function calculateLuckyNumber(month: number, day: number, year: number): { base: number, flipped: number, baseStr: string, flippedStr: string } {
    const mStr = month.toString().padStart(2, '0');
    const dStr = day.toString().padStart(2, '0');
    const yStr = year.toString().padStart(4, '0');

    const fullDateStr = `${mStr}/${dStr}/${yStr}`;

    // First digit of month, last digit of year
    let firstDigit = fullDateStr[0];
    if (firstDigit === '0') {
        firstDigit = fullDateStr[1];
    }
    const lastDigit = fullDateStr[fullDateStr.length - 1];

    const baseStr = firstDigit + lastDigit;
    const flippedStr = lastDigit + firstDigit;

    let base = parseInt(baseStr, 10);
    let flipped = parseInt(flippedStr, 10);

    if (base % 10 === 0) {
        flipped = base;
        return {
            base,
            flipped,
            baseStr,
            flippedStr: baseStr
        };
    }

    return {
        base,
        flipped,
        baseStr,
        flippedStr
    };
}

/**
 * Checks if a specific calendar date (month and day) matches the lucky number digits.
 * E.g., for lucky number 18/81:
 * - Jan 8 (M=1, D=8) -> matches 01/08 and 08/01
 * - Aug 1 (M=8, D=1) -> matches 08/01 and 01/08
 */
export function isLuckyDateMatch(month: number, day: number, luckyNumber: { base: number, flipped: number, baseStr?: string, flippedStr?: string }): boolean {
    const bStr = luckyNumber.baseStr || luckyNumber.base.toString().padStart(2, '0');
    if (bStr.length < 2) return false;
    const d1 = parseInt(bStr[0], 10);
    const d2 = parseInt(bStr[1], 10);

    // Date matches if (month === d1 && day === d2) OR (month === d2 && day === d1)
    return (month === d1 && day === d2) || (month === d2 && day === d1);
}

/**
 * Calculates current age or age at a specific target date.
 */
export function calculateAge(birthDate: { year: number, month: number, day: number }, targetDate: Date = new Date()): number {
    let age = targetDate.getFullYear() - birthDate.year;
    const m = (targetDate.getMonth() + 1) - birthDate.month;
    if (m < 0 || (m === 0 && targetDate.getDate() < birthDate.day)) {
        age--;
    }
    return age;
}
