import { calculateLifePath, reduceNumber } from './numerology';
import { getEarthSign, getEarthMonthSign } from './astrology';
import { NUMEROLOGY_COMPATIBILITY, ZODIAC_TRINES, ZODIAC_ENEMIES, ZODIAC_SOULMATES, ZODIAC_50 } from './compatibilityData';
import type { CompatibilityLevel } from './compatibilityData';

function normalizeNumber(num: number | string): string {
    const s = String(num);
    if (s.startsWith('22/')) return '22';
    if (s.startsWith('33/')) return '33';
    return s;
}

export function getNumberCompat(num1: number | string, num2: number | string): CompatibilityLevel {
    const n1 = normalizeNumber(num1);
    const n2 = normalizeNumber(num2);

    // Look up directly from grid
    const comp1 = NUMEROLOGY_COMPATIBILITY[n1]?.[n2];
    if (comp1) return comp1;

    const comp2 = NUMEROLOGY_COMPATIBILITY[n2]?.[n1];
    if (comp2) return comp2;

    return 'Neutral';
}

export function isAstroEnemy(sign1: string, sign2: string): boolean {
    return ZODIAC_ENEMIES.some(pair => (pair[0] === sign1 && pair[1] === sign2) || (pair[0] === sign2 && pair[1] === sign1));
}

export function isAstroTrine(sign1: string, sign2: string): boolean {
    const isTrine = ZODIAC_TRINES.some(group => group.includes(sign1) && group.includes(sign2));
    const isSoulmate = ZODIAC_SOULMATES.some(pair => (pair[0] === sign1 && pair[1] === sign2) || (pair[0] === sign2 && pair[1] === sign1));
    return isTrine || isSoulmate;
}

export function isAstro50(sign1: string, sign2: string): boolean {
    return ZODIAC_50.some(pair => (pair[0] === sign1 && pair[1] === sign2) || (pair[0] === sign2 && pair[1] === sign1));
}

export function getZodiacCompat(sign1: string, sign2: string): 'Same' | 'Trine' | 'Enem' | '50' | 'Neutral' {
    if (sign1 === sign2) return 'Same';
    if (isAstroEnemy(sign1, sign2)) return 'Enem';
    if (isAstroTrine(sign1, sign2)) return 'Trine';
    if (isAstro50(sign1, sign2)) return '50';
    return 'Neutral';
}

export type CompatibilityResult = {
    lifepathMatch: CompatibilityLevel;
    dayMatch: CompatibilityLevel;
    astroMatch: 'Same' | 'Enem' | 'Trine' | 'Neutral' | '50';
    astroMonthMatch: 'Same' | 'Enem' | 'Trine' | 'Neutral' | '50';
    locationMatch?: 'Same' | 'Enem' | 'Trine' | 'Neutral' | '50' | null;
    locationSign?: string | null;
    overallVerdict: string;
    isOverridden: boolean;
    compatibilityScore: number;
    compatibilityLabel: string;
    compatibilityColor: string;
    lp1: number | string;
    lp2: number | string;
    day1: number;
    day2: number;
};

const ZODIAC_NAME_FR: Record<string, string> = {
    'Rat': 'Rat',
    'Ox': 'Boeuf',
    'Tiger': 'Tigre',
    'Cat': 'Chat',
    'Dragon': 'Dragon',
    'Snake': 'Serpent',
    'Horse': 'Cheval',
    'Goat': 'Chèvre',
    'Monkey': 'Singe',
    'Rooster': 'Coq',
    'Dog': 'Chien',
    'Pig': 'Cochon'
};

export function checkCompatibility(
    date1: { m: number, d: number, y: number },
    date2: { m: number, d: number, y: number },
    language: 'en' | 'fr' = 'en',
    locationSign?: string | null
): CompatibilityResult {

    const calc1 = calculateLifePath(date1.m, date1.d, date1.y);
    const calc2 = calculateLifePath(date2.m, date2.d, date2.y);
    const lp1 = calc1.lifepath;
    const lp2 = calc2.lifepath;

    // Day is only 2 if the day is literally evaluated to 2
    const day1 = reduceNumber(date1.d);
    const day2 = reduceNumber(date2.d);

    const sign1 = getEarthSign(date1.y, date1.m, date1.d).name;
    const sign2 = getEarthSign(date2.y, date2.m, date2.d).name;

    const monthSign1 = getEarthMonthSign(date1.m, date1.d).name;
    const monthSign2 = getEarthMonthSign(date2.m, date2.d).name;

    const s1 = language === 'fr' ? (ZODIAC_NAME_FR[sign1] || sign1) : sign1;
    const s2 = language === 'fr' ? (ZODIAC_NAME_FR[sign2] || sign2) : sign2;
    const ms1 = language === 'fr' ? (ZODIAC_NAME_FR[monthSign1] || monthSign1) : monthSign1;
    const ms2 = language === 'fr' ? (ZODIAC_NAME_FR[monthSign2] || monthSign2) : monthSign2;

    const lifepathMatch = getNumberCompat(lp1, lp2);
    const dayMatch = getNumberCompat(day1, day2);

    let astroMatch: 'Same' | 'Enem' | 'Trine' | 'Neutral' | '50' = 'Neutral';
    if (sign1 === sign2) astroMatch = 'Same';
    else if (isAstroEnemy(sign1, sign2)) astroMatch = 'Enem';
    else if (isAstroTrine(sign1, sign2)) astroMatch = 'Trine';
    else if (isAstro50(sign1, sign2)) astroMatch = '50';

    let astroMonthMatch: 'Same' | 'Enem' | 'Trine' | 'Neutral' | '50' = 'Neutral';
    if (monthSign1 === monthSign2) astroMonthMatch = 'Same';
    else if (isAstroEnemy(monthSign1, monthSign2)) astroMonthMatch = 'Enem';
    else if (isAstroTrine(monthSign1, monthSign2)) astroMonthMatch = 'Trine';
    else if (isAstro50(monthSign1, monthSign2)) astroMonthMatch = '50';

    // Location Earth Sign evaluation against profile sign1
    let locationMatch: 'Same' | 'Enem' | 'Trine' | 'Neutral' | '50' | null = null;
    if (locationSign) {
        if (locationSign === sign1) locationMatch = 'Same';
        else if (isAstroEnemy(sign1, locationSign)) locationMatch = 'Enem';
        else if (isAstroTrine(sign1, locationSign)) locationMatch = 'Trine';
        else if (isAstro50(sign1, locationSign)) locationMatch = '50';
        else locationMatch = 'Neutral';
    }

    let overallVerdict = '';
    let isOverridden = false;

    // RULE 1: Numerology supersedes astrology.
    if (lifepathMatch === 'Enem') {
        overallVerdict = language === 'fr'
            ? `Incompatible. Les chemins de vie ${lp1} et ${lp2} sont en fort conflit, prévalant sur tout indicateur amical.`
            : `Incompatible. Life Paths ${lp1} and ${lp2} clash heavily, overriding any other friendly indicators.`;
    } else if (lifepathMatch === 'Bad') {
        overallVerdict = language === 'fr'
            ? `Difficile. Les chemins de vie ${lp1} et ${lp2} créent des frictions toxiques ou un effet miroir (comme deux 8 ou deux 9 ensemble).`
            : `Challenging. Life Paths ${lp1} and ${lp2} create toxic friction or mirror issues (like 8s or 9s together).`;
    } else if (lifepathMatch === 'MS') {
        if (astroMatch === 'Enem' || astroMonthMatch === 'Enem') {
            isOverridden = true;
            const enemyPair = astroMatch === 'Enem' ? `${s1} & ${s2}` : `${ms1} & ${ms2}`;
            overallVerdict = language === 'fr'
                ? `Priorité Compatible (Maître/Serviteur). Malgré la présence d'ennemis du zodiaque (${enemyPair}), les chemins de vie ${lp1} et ${lp2} ont une relation Maître/Serviteur qui préserve l'entente. Remarque : cette dynamique est souvent à sens unique.`
                : `Compatible Override (Master/Servant). Even though there are Zodiac enemies (${enemyPair}), Life Paths ${lp1} and ${lp2} have a Master/Servant relationship that saves the match. Note: This dynamic is often one-sided.`;
        } else {
            overallVerdict = language === 'fr'
                ? `Dynamique Maître/Serviteur. Les chemins de vie ${lp1} et ${lp2} ont une compatibilité forte mais potentiellement à sens unique (ex. 6 ou 8 au service du 1).`
                : `Master/Servant Dynamic. Life Paths ${lp1} and ${lp2} have a strong but potentially one-sided compatibility (e.g. 6 or 8 serving 1).`;
        }
    } else if (lifepathMatch === 'Best' || lifepathMatch === 'Good') {
        if (astroMatch === 'Enem' || astroMonthMatch === 'Enem') {
            isOverridden = true;
            overallVerdict = language === 'fr'
                ? `Priorité Compatible. Malgré la présence d'ennemis du zodiaque, les chemins de vie ${lp1} et ${lp2} sont harmonieux, préservant l'entente.`
                : `Compatible Override. Even though there are Zodiac enemies, Life Paths ${lp1} and ${lp2} are friendly, saving the match.`;
        } else {
            overallVerdict = language === 'fr'
                ? `Très Compatible. Les chemins de vie ${lp1} et ${lp2} s'alignent parfaitement.`
                : `Highly Compatible. Life Paths ${lp1} and ${lp2} align beautifully.`;
        }
    } else {
        // Neutral Lifepath, fallback to checking days or astrology
        if (astroMatch === 'Enem' || astroMonthMatch === 'Enem') {
            const enemyPair = astroMatch === 'Enem' ? `${s1} & ${s2}` : `${ms1} & ${ms2}`;
            overallVerdict = language === 'fr'
                ? `Friction. ${enemyPair} sont en conflit astrologique, et les chemins de vie ne suffisent pas à compenser.`
                : `Friction. ${enemyPair} clash astrologically, and the Life Paths aren't strong enough to save it.`;
        } else if (astroMatch === 'Same' || astroMatch === 'Trine' || astroMonthMatch === 'Same' || astroMonthMatch === 'Trine') {
            const trinePair = (astroMatch === 'Same' || astroMatch === 'Trine') ? `${s1} & ${s2}` : `${ms1} & ${ms2}`;
            overallVerdict = language === 'fr'
                ? `Bonne Harmonie. Les chemins de vie sont neutres, mais l'harmonie ${trinePair} crée une excellente alchimie.`
                : `Good Flow. The Life Paths are okay, but the ${trinePair} harmony creates a great connection.`;
        } else if (astroMatch === '50' || astroMonthMatch === '50') {
            const fiftyPair = astroMatch === '50' ? `${s1} & ${s2}` : `${ms1} & ${ms2}`;
            overallVerdict = language === 'fr'
                ? `Énergie Mitigée. ${fiftyPair} ne s'accordent pas naturellement sans être ennemis pour autant, créant une connexion 50/50.`
                : `Mixed Energy. ${fiftyPair} don't naturally get along, but they aren't enemies either, creating a 50/50 connection.`;
        } else {
            overallVerdict = language === 'fr'
                ? `Connexion neutre / moyenne selon les indicateurs principaux.`
                : `Neutral / Average connection based on main indicators.`;
        }
    }

    // Secondary Modifier (Day)
    if (lifepathMatch !== 'Enem' && lifepathMatch !== 'Bad') {
        if (dayMatch === 'Enem') {
            overallVerdict += language === 'fr'
                ? ` Cependant, les énergies du jour en conflit (${day1} vs ${day2}) entraîneront des frictions au quotidien.`
                : ` However, clashing Day energies (${day1} vs ${day2}) will cause daily friction.`;
        }
    }

    // Master Number Exception (Rule 3)
    const isMaster1 = calc1.isMaster;
    const isMaster2 = calc2.isMaster;

    if ((astroMatch === 'Enem' || astroMonthMatch === 'Enem') && (isMaster1 || isMaster2) && (lifepathMatch !== 'Enem' && lifepathMatch !== 'Bad')) {
        const masterVal = isMaster1 ? lp1 : lp2;
        overallVerdict = language === 'fr'
            ? `Exception Maître ! Bien qu'il y ait des ennemis jurés en astrologie, la fréquence Maître (${masterVal}) élève la relation au-delà des conflits terrestres.`
            : `Master Exception! Though there are sworn enemies in the astrology, the Master frequency (${masterVal}) elevates the relationship above earthy conflicts.`;
        isOverridden = true;
    }

    let lpScore = 0;
    if (lifepathMatch === 'Best') lpScore = 100;
    else if (lifepathMatch === 'Good') lpScore = 85;
    else if (lifepathMatch === 'MS') lpScore = 70;
    else if (lifepathMatch === '50' || lifepathMatch === 'Neutral') lpScore = 50;
    else if (lifepathMatch === 'Bad') lpScore = 25;
    else lpScore = 0;

    let dayScore = 0;
    if (dayMatch === 'Best') dayScore = 100;
    else if (dayMatch === 'Good') dayScore = 85;
    else if (dayMatch === 'MS') dayScore = 70;
    else if (dayMatch === '50' || dayMatch === 'Neutral') dayScore = 50;
    else if (dayMatch === 'Bad') dayScore = 25;
    else dayScore = 0;

    let astroScore = 0;
    if (astroMatch === 'Same' || astroMatch === 'Trine') astroScore = 100;
    else if (astroMatch === 'Neutral' || astroMatch === '50') astroScore = 50;
    else astroScore = 0;

    let astroMonthScore = 0;
    if (astroMonthMatch === 'Same' || astroMonthMatch === 'Trine') astroMonthScore = 100;
    else if (astroMonthMatch === 'Neutral' || astroMonthMatch === '50') astroMonthScore = 50;
    else astroMonthScore = 0;

    // Base compatibility score calculation between the two profiles
    let compatibilityScore = (lpScore * 0.55) + (dayScore * 0.15) + (astroScore * 0.20) + (astroMonthScore * 0.10);

    if (isOverridden && compatibilityScore < 65) {
        compatibilityScore = 65;
    }

    // Location modifier based on user's profile earth year sign
    if (locationSign && locationMatch) {
        if (locationMatch === 'Same') {
            compatibilityScore += 20; // Same exact sign: +20%
        } else if (locationMatch === 'Trine') {
            compatibilityScore += 10; // Same trine: +10%
        } else if (locationMatch === 'Enem') {
            compatibilityScore -= 20; // Enemy: -20%
        }
    }

    // Clamp score between 0 and 100
    compatibilityScore = Math.max(0, Math.min(100, compatibilityScore));
    let roundedScore = Math.round(compatibilityScore);

    let compatibilityLabel = '';
    let compatibilityColor = '';

    if (roundedScore <= 20) {
        compatibilityLabel = locationMatch === 'Enem' ? 'Enemy' : 'Terrible';
        compatibilityColor = 'var(--accent-red)';
    } else if (roundedScore <= 50) {
        compatibilityLabel = 'Bad';
        compatibilityColor = 'var(--accent-orange, #f59e0b)';
    } else if (roundedScore <= 60) {
        compatibilityLabel = 'Ok';
        compatibilityColor = '#eab308';
    } else if (roundedScore <= 80) {
        compatibilityLabel = 'Good';
        compatibilityColor = 'var(--accent-dark-green)';
    } else {
        compatibilityLabel = 'Excellent';
        compatibilityColor = 'var(--accent-light-green)';
    }

    // Mention location modifier in overall verdict
    if (locationSign && locationMatch) {
        const locName = language === 'fr' ? (ZODIAC_NAME_FR[locationSign] || locationSign) : locationSign;
        if (locationMatch === 'Same') {
            overallVerdict += language === 'fr'
                ? ` Lieu Résonant (+20%) : Le signe du lieu (${locName}) est exactement le même que votre signe de terre (${s1}), ajoutant un bonus de +20% à la compatibilité.`
                : ` Exact Sign Location (+20%): The location sign (${locName}) is the exact same as your earth year sign (${s1}), granting a +20% compatibility bonus.`;
        } else if (locationMatch === 'Trine') {
            overallVerdict += language === 'fr'
                ? ` Lieu Trigone (+10%) : Le signe du lieu (${locName}) est dans le même trigone que votre profil (${s1}), ajoutant un bonus de +10% à la compatibilité.`
                : ` Trine Location (+10%): The location sign (${locName}) is in the same trine as your profile (${s1}), granting a +10% compatibility bonus.`;
        } else if (locationMatch === 'Enem') {
            overallVerdict += language === 'fr'
                ? ` Lieu Ennemi (-20%) : Le signe du lieu (${locName}) est en conflit ennemi avec votre profil (${s1}), appliquant une pénalité de -20% sur la compatibilité.`
                : ` Enemy Location (-20%): The location sign (${locName}) is an enemy to your profile (${s1}), applying a -20% compatibility penalty.`;
        }
    }

    return {
        lifepathMatch,
        dayMatch,
        astroMatch,
        astroMonthMatch,
        locationMatch,
        locationSign,
        overallVerdict,
        isOverridden,
        compatibilityScore: roundedScore,
        compatibilityLabel,
        compatibilityColor,
        lp1,
        lp2,
        day1,
        day2
    };
}
