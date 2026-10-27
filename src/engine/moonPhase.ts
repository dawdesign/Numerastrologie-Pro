export interface MoonPhaseInfo {
    index: number;         // 0 to 7
    nameEn: string;        // English name
    nameFr: string;        // French name
    emoji: string;         // Emoji symbol
    ageDays: number;       // Approx age in days (0 - 29.53)
    fraction: number;      // 0.0 (New Moon) to 1.0 (Full Moon) illumination approx
}

export const MOON_PHASES: { index: number; nameEn: string; nameFr: string; emoji: string }[] = [
    { index: 0, nameEn: 'New Moon', nameFr: 'Nouvelle lune', emoji: '🌑' },
    { index: 1, nameEn: 'Waxing Crescent', nameFr: 'Premier croissant', emoji: '🌒' },
    { index: 2, nameEn: 'First Quarter', nameFr: 'Premier quartier', emoji: '🌓' },
    { index: 3, nameEn: 'Waxing Gibbous', nameFr: 'Lune gibbeuse croissante', emoji: '🌔' },
    { index: 4, nameEn: 'Full Moon', nameFr: 'Pleine lune', emoji: '🌕' },
    { index: 5, nameEn: 'Waning Gibbous', nameFr: 'Lune gibbeuse décroissante', emoji: '🌖' },
    { index: 6, nameEn: 'Last Quarter', nameFr: 'Dernier quartier', emoji: '🌗' },
    { index: 7, nameEn: 'Waning Crescent', nameFr: 'Dernier croissant', emoji: '🌘' },
];

/**
 * Calculates the astronomical Moon Phase for a given calendar date (year, month 1-12, day 1-31).
 * Uses Conway / Meeus Julian Day lunar age calculation.
 * Synodic month: 29.53058770576 days.
 */
export function getMoonPhase(year: number, month: number, day: number): MoonPhaseInfo {
    // Convert to Julian Day Number (at 12:00 UTC)
    let y = year;
    let m = month;
    if (m <= 2) {
        y -= 1;
        m += 12;
    }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;

    // Known reference new moon: JD 2451549.5 (Jan 6, 2000, 18:14 UTC)
    const synodicMonth = 29.53058867;
    const daysSinceNew = jd - 2451549.5;
    const newMoons = daysSinceNew / synodicMonth;
    const phaseFraction = newMoons - Math.floor(newMoons); // [0, 1)

    // Age in days: 0 to 29.53
    const ageDays = phaseFraction * synodicMonth;

    // 8 phase bins (each centered around key points: 0=New, 0.25=First Q, 0.5=Full, 0.75=Last Q)
    // Adding 1/16 shifts bin edges so New Moon is [-1/16, 1/16)
    const phaseIndex = Math.floor((phaseFraction + 1 / 16) * 8) % 8;

    const meta = MOON_PHASES[phaseIndex];
    // Approximate illumination fraction (0 = new, 1 = full)
    const illumination = 0.5 * (1 - Math.cos(2 * Math.PI * phaseFraction));

    return {
        index: phaseIndex,
        nameEn: meta.nameEn,
        nameFr: meta.nameFr,
        emoji: meta.emoji,
        ageDays: Math.round(ageDays * 10) / 10,
        fraction: Math.round(illumination * 100) / 100
    };
}
