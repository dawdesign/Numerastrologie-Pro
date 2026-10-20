import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

export type SkyElement = 'fire' | 'earth' | 'air' | 'water';

export interface SkyWheelSign {
    id: number;
    name: string;
    nameFr: string;
    glyph: string;
    number: number;
    element: SkyElement;
    elementEmoji: string;
    dates: {
        en: string;
        fr: string;
    };
}

export const SKY_WHEEL_SIGNS: SkyWheelSign[] = [
    { id: 0, name: 'Aries', nameFr: 'BÉLIER', glyph: '♈', number: 1, element: 'fire', elementEmoji: '🔥', dates: { en: 'Mar 21 – Apr 19', fr: '21 Mar – 19 Avr' } },
    { id: 1, name: 'Taurus', nameFr: 'TAUREAU', glyph: '♉', number: 2, element: 'earth', elementEmoji: '🌍', dates: { en: 'Apr 20 – May 20', fr: '20 Avr – 20 Mai' } },
    { id: 2, name: 'Gemini', nameFr: 'GÉMEAUX', glyph: '♊', number: 3, element: 'air', elementEmoji: '💨', dates: { en: 'May 21 – Jun 20', fr: '21 Mai – 20 Juin' } },
    { id: 3, name: 'Cancer', nameFr: 'CANCER', glyph: '♋', number: 4, element: 'water', elementEmoji: '💧', dates: { en: 'Jun 21 – Jul 22', fr: '21 Juin – 22 Juil' } },
    { id: 4, name: 'Leo', nameFr: 'LION', glyph: '♌', number: 5, element: 'fire', elementEmoji: '🔥', dates: { en: 'Jul 23 – Aug 22', fr: '23 Juil – 22 Août' } },
    { id: 5, name: 'Virgo', nameFr: 'VIERGE', glyph: '♍', number: 6, element: 'earth', elementEmoji: '🌍', dates: { en: 'Aug 23 – Sep 22', fr: '23 Août – 22 Sept' } },
    { id: 6, name: 'Libra', nameFr: 'BALANCE', glyph: '♎', number: 7, element: 'air', elementEmoji: '💨', dates: { en: 'Sep 23 – Oct 22', fr: '23 Sept – 22 Oct' } },
    { id: 7, name: 'Scorpio', nameFr: 'SCORPION', glyph: '♏', number: 8, element: 'water', elementEmoji: '💧', dates: { en: 'Oct 23 – Nov 21', fr: '23 Oct – 21 Nov' } },
    { id: 8, name: 'Sagittarius', nameFr: 'SAGITTAIRE', glyph: '♐', number: 9, element: 'fire', elementEmoji: '🔥', dates: { en: 'Nov 22 – Dec 21', fr: '22 Nov – 21 Déc' } },
    { id: 9, name: 'Capricorn', nameFr: 'CAPRICORNE', glyph: '♑', number: 10, element: 'earth', elementEmoji: '🌍', dates: { en: 'Dec 22 – Jan 19', fr: '22 Déc – 19 Jan' } },
    { id: 10, name: 'Aquarius', nameFr: 'VERSEAU', glyph: '♒', number: 11, element: 'air', elementEmoji: '💨', dates: { en: 'Jan 20 – Feb 18', fr: '20 Jan – 18 Fév' } },
    { id: 11, name: 'Pisces', nameFr: 'POISSONS', glyph: '♓', number: 12, element: 'water', elementEmoji: '💧', dates: { en: 'Feb 19 – Mar 20', fr: '19 Fév – 20 Mar' } },
];

export interface ElementTheme {
    name: string;
    nameFr: string;
    emoji: string;
    color: string;
    glowColor: string;
    arrowColor: string;
    badgeBg: string;
    badgeBorder: string;
    cardBorder: string;
    selected: {
        outer: string;
        middle: string;
        inner: string;
        stroke: string;
        strokeWidth: number;
    };
    compatible: {
        outer: string;
        middle: string;
        inner: string;
        stroke: string;
        strokeWidth: number;
    };
}

export const ELEMENT_THEMES: Record<SkyElement, ElementTheme> = {
    fire: {
        name: 'Fire',
        nameFr: 'Feu',
        emoji: '🔥',
        color: '#ff5722',
        glowColor: '#ff5722',
        arrowColor: '#ff5722',
        badgeBg: 'rgba(255, 87, 34, 0.14)',
        badgeBorder: 'rgba(255, 87, 34, 0.35)',
        cardBorder: 'rgba(255, 87, 34, 0.25)',
        selected: {
            outer: 'rgba(255, 87, 34, 0.50)',
            middle: 'rgba(255, 87, 34, 0.30)',
            inner: 'rgba(255, 87, 34, 0.40)',
            stroke: '#ff5722',
            strokeWidth: 2.2
        },
        compatible: {
            outer: 'rgba(255, 87, 34, 0.22)',
            middle: 'rgba(255, 87, 34, 0.12)',
            inner: 'rgba(255, 87, 34, 0.17)',
            stroke: 'rgba(255, 87, 34, 0.52)',
            strokeWidth: 1.5
        }
    },
    earth: {
        name: 'Earth',
        nameFr: 'Terre',
        emoji: '🌍',
        color: '#10b981',
        glowColor: '#10b981',
        arrowColor: '#10b981',
        badgeBg: 'rgba(16, 185, 129, 0.14)',
        badgeBorder: 'rgba(16, 185, 129, 0.35)',
        cardBorder: 'rgba(16, 185, 129, 0.25)',
        selected: {
            outer: 'rgba(16, 185, 129, 0.50)',
            middle: 'rgba(16, 185, 129, 0.30)',
            inner: 'rgba(16, 185, 129, 0.40)',
            stroke: '#10b981',
            strokeWidth: 2.2
        },
        compatible: {
            outer: 'rgba(16, 185, 129, 0.22)',
            middle: 'rgba(16, 185, 129, 0.12)',
            inner: 'rgba(16, 185, 129, 0.17)',
            stroke: 'rgba(16, 185, 129, 0.52)',
            strokeWidth: 1.5
        }
    },
    air: {
        name: 'Air',
        nameFr: 'Air',
        emoji: '💨',
        color: '#06b6d4',
        glowColor: '#00d2ff',
        arrowColor: '#06b6d4',
        badgeBg: 'rgba(6, 182, 212, 0.14)',
        badgeBorder: 'rgba(6, 182, 212, 0.35)',
        cardBorder: 'rgba(6, 182, 212, 0.25)',
        selected: {
            outer: 'rgba(6, 182, 212, 0.50)',
            middle: 'rgba(6, 182, 212, 0.30)',
            inner: 'rgba(6, 182, 212, 0.40)',
            stroke: '#06b6d4',
            strokeWidth: 2.2
        },
        compatible: {
            outer: 'rgba(6, 182, 212, 0.22)',
            middle: 'rgba(6, 182, 212, 0.12)',
            inner: 'rgba(6, 182, 212, 0.17)',
            stroke: 'rgba(6, 182, 212, 0.52)',
            strokeWidth: 1.5
        }
    },
    water: {
        name: 'Water',
        nameFr: 'Eau',
        emoji: '💧',
        color: '#3b82f6',
        glowColor: '#2563eb',
        arrowColor: '#3b82f6',
        badgeBg: 'rgba(59, 130, 246, 0.14)',
        badgeBorder: 'rgba(59, 130, 246, 0.35)',
        cardBorder: 'rgba(59, 130, 246, 0.25)',
        selected: {
            outer: 'rgba(59, 130, 246, 0.50)',
            middle: 'rgba(59, 130, 246, 0.30)',
            inner: 'rgba(59, 130, 246, 0.40)',
            stroke: '#3b82f6',
            strokeWidth: 2.2
        },
        compatible: {
            outer: 'rgba(59, 130, 246, 0.22)',
            middle: 'rgba(59, 130, 246, 0.12)',
            inner: 'rgba(59, 130, 246, 0.17)',
            stroke: 'rgba(59, 130, 246, 0.52)',
            strokeWidth: 1.5
        }
    }
};

export const SKY_SIGN_DESCRIPTIONS: Record<'en' | 'fr', Record<string, string[]>> = {
    fr: {
        Aries: [
            "Commence les projets avec fougue mais a du mal à les terminer.",
            "Les femmes aiment qu'on leur touche les cheveux.",
            "Chercheuses d'or, esprit ambitieux et déterminé.",
            "Profil athlétique, compétitif et sportif.",
            "Ressource son énergie vitale auprès des pins et dans la nature."
        ],
        Taurus: [
            "Gouverne la zone sacrée du cou et de la gorge.",
            "Le Chanteur du zodiaque, voix chaleureuse et captivante.",
            "Profondément attaché à la stabilité, la sensualité et au confort matériel.",
            "Patience exemplaire, mais fureur mémorable quand poussé à bout."
        ],
        Gemini: [
            "Gouverne les épaules et les bras.",
            "Multitâche naturel, esprit ultra-vif et communicateur né.",
            "Santé mentale sensible, pensée en perpétuelle ébullition.",
            "Enclin à l'infidélité ou à l'inconstance par haine de l'ennui.",
            "Grande créativité et talent comique marqué.",
            "Génie, débrouillard, bosseur acharné.",
            "Le signe le plus fréquemment tatoué du zodiaque."
        ],
        Cancer: [
            "Profondément romantique et attaché au foyer.",
            "Énergie très karmique (intimement relié au nombre 8).",
            "Intuition protectrice envers son cercle familial et affectif.",
            "Hyper-émotif, mémoire sentimentale sans égale."
        ],
        Leo: [
            "Populaire, présence magnétique naturelle.",
            "Pas tactile, préserve une distance royale avec les autres.",
            "Aime plaisanter et taquiner, ne prend pas les remarques personnellement.",
            "Esprit socialiste et généreux avec sa cour.",
            "Adore l'attention et être admiré à sa juste valeur.",
            "Grand sens du style, donne toujours une excellente première impression.",
            "Pas toujours fidèle dans la durée amoureuse."
        ],
        Virgo: [
            "Gouverne la zone de l'estomac et de la digestion.",
            "Complexe d'infériorité secret malgré d'immenses compétences.",
            "Le critique bienveillant mais acéré du zodiaque.",
            "Quête constante de clarté, de méthode et de perfection.",
            "Sens aigu du devoir et souci maniaque du détail."
        ],
        Libra: [
            "Ment avec une adresse redoutable quand la situation l'impose.",
            "Brillant dans les présentations orales et la diplomatie.",
            "Avocat du diable : perçoit toujours les deux facettes de chaque argument.",
            "Recherche permanente de compromis, d'équité et de collaboration.",
            "Horreur absolue des conflits ouverts et de la discorde.",
            "Le meilleur allié pour peser le pour et le contre d'une décision.",
            "Quand une conviction est forgée, reste inébranlable.",
            "Se regarde très souvent dans le miroir, esthète né."
        ],
        Scorpio: [
            "Aura intensément sexuelle et magnétique.",
            "Regarde droit dans les yeux et détecte le mensonge instantanément.",
            "Esprit détective, harceleur / investigateur redoutable quand intrigué.",
            "Très rancunier : pardonne rarement, n'oublie jamais.",
            "Possède la voix la plus douce et envoutante."
        ],
        Sagittarius: [
            "Manque souvent de tact : doit apprendre à tourner sept fois sa langue.",
            "Dit les vérités telles qu'elles sont, honnêteté brute.",
            "Destiné aux grands voyages et aux découvertes internationales.",
            "Préfère souvent la compagnie des animaux à celle des humains.",
            "Loyal mais s'ennuie aussi vite qu'il s'est enflammé.",
            "Les hanches et le bassin sont la signature physique qui ressort.",
            "Très bavard, adore refaire le monde."
        ],
        Capricorn: [
            "Surveille la zone des genoux et des articulations.",
            "Esprit stratégique, recherche l'ascension sociale et financière.",
            "Capitaliste et bâtisseur de structures pérennes.",
            "La famille et le devoir d'ancrage comptent avant tout.",
            "Le signe le moins dominé par la sexualité pulsionnelle.",
            "Le seul signe capable de dominer et canaliser le Scorpion.",
            "Apparence prude et réservée dissimulant une volonté de fer.",
            "Considéré comme le stratège le plus intelligent du zodiaque."
        ],
        Aquarius: [
            "Naturellement attiré par les personnes d'autres cultures et horizons.",
            "A souvent connu une enfance atypique ou exigeante.",
            "Le rebelle visionnaire qui refuse les dogmes établis.",
            "Mollets et jambes prononcés.",
            "Exigence relationnelle suprême : son partenaire doit être son amant ET son meilleur ami.",
            "Porte très fréquemment des lunettes de vue."
        ],
        Pisces: [
            "Gouverne la zone des chevilles et des pieds.",
            "Doit se méfier de tout dogmatisme ou mysticisme excessif.",
            "Don alchimique pour transformer le négatif en positif.",
            "Forte tendance aux illusions et aux songes déconnectés du réel.",
            "Fasciné en secret par les figures de pouvoir.",
            "Vulnérable à la manipulation ou aux influences extérieures.",
            "Personnalité la plus prédisposée aux dépendances et addictions."
        ]
    },
    en: {
        Aries: [
            "Starts projects with great fire but struggles to finish them.",
            "Women love having their hair touched.",
            "Gold diggers, ambitious and driven mindset.",
            "Athletic, competitive, and sporty profile.",
            "Recharges vital energy around pine trees and in deep nature."
        ],
        Taurus: [
            "Governs the neck and throat area.",
            "The Singer of the zodiac, warm and captivating vocal tone.",
            "Deeply grounded in stability, sensory pleasure, and material comfort.",
            "Unrivaled patience, but explosive fury when pushed too far."
        ],
        Gemini: [
            "Governs shoulders and arms.",
            "Natural multitasker with a quick, agile mind and conversational gift.",
            "Sensitive mental health, restless thought loops.",
            "Prone to infidelity or fickleness out of fear of boredom.",
            "Vibrant creativity and razor-sharp comedic timing.",
            "Genius hustler, tirelessly hardworking.",
            "Most tattooed sign in the entire zodiac."
        ],
        Cancer: [
            "Deeply romantic and devoted to home and sanctuary.",
            "Strong karmic energy (profoundly linked to the number 8).",
            "Protective intuition toward family and inner circle.",
            "Hypersensitive with indelible emotional memory."
        ],
        Leo: [
            "Popular, effortlessly captivating presence.",
            "Not touchy, keeps a regal personal boundary.",
            "Loves teasing and playful banter, never takes jokes personally.",
            "Socialist spirit, exceptionally generous with their court.",
            "Loves attention, respect, and heartfelt admiration.",
            "Natural sense of style, always delivers a striking first impression.",
            "Not consistently faithful in long-term romantic relationships."
        ],
        Virgo: [
            "Governs the stomach and digestive system.",
            "Hidden inferiority complex despite extraordinary competence.",
            "The sharp, discerning critic of the zodiac.",
            "Relentless quest for clarity, method, and perfection.",
            "Devoted sense of service with meticulous attention to detail."
        ],
        Libra: [
            "Lies with remarkable skill when diplomacy requires it.",
            "Brilliant in oral presentations and graceful negotiations.",
            "Devil's advocate: instinctively sees both sides of any argument.",
            "Constant pursuit of balance, fairness, and peaceful collaboration.",
            "Deep aversion to open conflict and ugly confrontations.",
            "The finest counsel to consult when weighing tough decisions.",
            "Once a conviction is settled, remains completely steadfast.",
            "Checks the mirror frequently, born lover of aesthetics."
        ],
        Scorpio: [
            "Deeply sexual, magnetic, and hypnotic aura.",
            "Looks right into the eyes and detects lies immediately.",
            "Detective instinct, relentless investigator when intrigued.",
            "Very resentful: rarely forgives and never forgets a breach of trust.",
            "Frequently possesses the softest, most enchanting voice."
        ],
        Sagittarius: [
            "Often lacks tact: must learn to think before speaking.",
            "Delivers brutal honesty, tells things exactly as they are.",
            "Born wanderer, destined for long-distance voyages and foreign lands.",
            "Frequently prefers the company of animals over humans.",
            "Loyal friend, but moves on as fast as passion ignited.",
            "Hips and thighs are the standout physical trait.",
            "Great conversationalist, loves philosophizing about life."
        ],
        Capricorn: [
            "Needs to safeguard knees, joints, and bones.",
            "Strategic climber, conscious of status and material security.",
            "Natural capitalist, master builder of lasting enterprises.",
            "Family legacy and heritage matter above all else.",
            "Least driven by reckless sexual impulse.",
            "The only sign capable of dominating and taming Scorpio.",
            "Prude, reserved facade masking an iron will.",
            "Regarded as the smartest and most patient strategist of the zodiac."
        ],
        Aquarius: [
            "Instinctively drawn to partners from foreign cultures and unique origins.",
            "Often weathered a challenging or unconventional upbringing.",
            "The eternal visionary rebel, refuses conforming to rigid dogma.",
            "Distinctive, powerful calves and athletic lower legs.",
            "Ultimate relationship standard: partner must be their lover AND their best friend.",
            "Very commonly wears prescription glasses."
        ],
        Pisces: [
            "Governs the ankles, feet, and lymphatic balance.",
            "Must avoid falling into excessive religious dogmatism.",
            "Rare alchemical gift of turning negative experiences into positive grace.",
            "Prone to daydreaming, escapism, and romantic delusions.",
            "Secretly fascinated by power and high-influence figures.",
            "Easily swayed or manipulated by cunning personalities.",
            "Most vulnerable sign to addictive patterns and dependencies."
        ]
    }
};

const getSectorPath = (cx: number, cy: number, rOut: number, rIn: number, startAngle: number, endAngle: number) => {
    const startRadOut = ((startAngle - 90) * Math.PI) / 180;
    const endRadOut = ((endAngle - 90) * Math.PI) / 180;
    
    const x1Out = cx + rOut * Math.cos(startRadOut);
    const y1Out = cy + rOut * Math.sin(startRadOut);
    const x2Out = cx + rOut * Math.cos(endRadOut);
    const y2Out = cy + rOut * Math.sin(endRadOut);

    const x1In = cx + rIn * Math.cos(startRadOut);
    const y1In = cy + rIn * Math.sin(startRadOut);
    const x2In = cx + rIn * Math.cos(endRadOut);
    const y2In = cy + rIn * Math.sin(endRadOut);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `
        M ${x1In} ${y1In}
        L ${x1Out} ${y1Out}
        A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2Out} ${y2Out}
        L ${x2In} ${y2In}
        A ${rIn} ${rIn} 0 ${largeArc} 0 ${x1In} ${y1In}
        Z
    `;
};

export default function WikiSkyWheel() {
    const { t, language } = useSettings();
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [rotationAngle, setRotationAngle] = useState<number>(0);

    // Calculate shortest angular path so the wheel rotates via the closest direction (<= 180 deg)
    const handleSelectIndex = (newIndex: number) => {
        setSelectedIndex(newIndex);
        setRotationAngle(prevAngle => {
            const targetBase = -newIndex * 30;
            let diff = (targetBase - prevAngle) % 360;
            while (diff > 180) diff -= 360;
            while (diff < -180) diff += 360;
            return prevAngle + diff;
        });
    };

    const cx = 200;
    const cy = 200;

    // Concentric radii matching WikiAstrologyWheel geometry
    const rOuterMax = 190;
    const rOuterMin = 140;
    const rMiddleMin = 95;
    const rInnerMin = 50;

    const activeSign = SKY_WHEEL_SIGNS[selectedIndex];
    const activeElement = activeSign.element;
    const activeTheme = ELEMENT_THEMES[activeElement];

    // Compatibility rule: signs with the exact same element are compatible. No enemies.
    const getSegmentStatus = (idx: number): 'selected' | 'compatible' | 'neutral' => {
        if (idx === selectedIndex) return 'selected';
        if (SKY_WHEEL_SIGNS[idx].element === activeElement) {
            return 'compatible';
        }
        return 'neutral';
    };

    // Calculate segment styles based on active element theme
    const getSegmentColors = (status: 'selected' | 'compatible' | 'neutral') => {
        switch (status) {
            case 'selected':
                return activeTheme.selected;
            case 'compatible':
                return activeTheme.compatible;
            case 'neutral':
            default:
                return {
                    outer: 'var(--bg-tertiary)',
                    middle: 'var(--bg-secondary)',
                    inner: 'var(--bg-tertiary)',
                    stroke: 'var(--border-color)',
                    strokeWidth: 1
                };
        }
    };


    const activeBullets = SKY_SIGN_DESCRIPTIONS[language === 'fr' ? 'fr' : 'en']?.[activeSign.name] || [];
    const activeSignName = language === 'fr' ? t(activeSign.name) : activeSign.name;
    const elementNameLocalized = language === 'fr' ? activeTheme.nameFr : activeTheme.name;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xl)', width: '100%' }}>
            
            {/* Element Quick Switcher Badges */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'clamp(6px, 1.5vw, 12px)',
                flexWrap: 'wrap',
                width: '100%',
                maxWidth: '650px',
                marginBottom: '-4px'
            }}>
                {(['fire', 'earth', 'air', 'water'] as SkyElement[]).map(elem => {
                    const theme = ELEMENT_THEMES[elem];
                    const isCurrent = activeElement === elem;
                    // Find first sign of this element to switch to
                    const targetSign = SKY_WHEEL_SIGNS.find(s => s.element === elem);
                    
                    return (
                        <button
                            key={elem}
                            type="button"
                            onClick={() => {
                                if (targetSign) handleSelectIndex(targetSign.id);
                            }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: 'clamp(0.78rem, 2vw, 0.88rem)',
                                fontWeight: isCurrent ? 700 : 500,
                                background: isCurrent ? theme.badgeBg : 'var(--bg-secondary)',
                                color: isCurrent ? theme.color : 'var(--text-secondary)',
                                border: `1px solid ${isCurrent ? theme.badgeBorder : 'var(--border-color)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                                boxShadow: isCurrent ? `0 0 12px ${theme.badgeBg}` : 'none'
                            }}
                        >
                            <span>{theme.emoji}</span>
                            <span>{language === 'fr' ? theme.nameFr : theme.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Interactive SVG Wheel */}
            <div style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: '440px', 
                aspectRatio: '1/1',
                margin: '0 auto'
            }}>
                <svg 
                    viewBox="0 0 400 400"
                    style={{
                        width: '100%',
                        height: '100%',
                        overflow: 'visible',
                        cursor: 'pointer',
                        filter: 'drop-shadow(0px 12px 32px rgba(0,0,0,0.15))'
                    }}
                >
                    <defs>
                        {/* Glow filters for each element (selected = brighter, compatible = softer) */}
                        <filter id="glow-selected-fire" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="5.5" floodColor="#ff5722" floodOpacity="0.65" />
                        </filter>
                        <filter id="glow-compatible-fire" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ff5722" floodOpacity="0.3" />
                        </filter>

                        <filter id="glow-selected-earth" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="5.5" floodColor="#10b981" floodOpacity="0.65" />
                        </filter>
                        <filter id="glow-compatible-earth" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.3" />
                        </filter>

                        <filter id="glow-selected-air" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="5.5" floodColor="#06b6d4" floodOpacity="0.65" />
                        </filter>
                        <filter id="glow-compatible-air" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#06b6d4" floodOpacity="0.3" />
                        </filter>

                        <filter id="glow-selected-water" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="5.5" floodColor="#3b82f6" floodOpacity="0.65" />
                        </filter>
                        <filter id="glow-compatible-water" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.3" />
                        </filter>
                    </defs>

                    {/* Rotating wheel container */}
                    <g 
                        style={{ 
                            transform: `rotate(${rotationAngle}deg)`, 
                            transformOrigin: '200px 200px',
                            transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)' 
                        }}
                    >
                        {SKY_WHEEL_SIGNS.map((sign, i) => {
                            const startAngle = i * 30 - 15;
                            const endAngle = i * 30 + 15;
                            const status = getSegmentStatus(i);
                            const colors = getSegmentColors(status);
                            const counterRotate = -(i * 30 + rotationAngle);

                            const filterVal = status === 'selected' 
                                ? `url(#glow-selected-${activeElement})` 
                                : status === 'compatible' 
                                    ? `url(#glow-compatible-${activeElement})` 
                                    : 'none';

                            return (
                                <g 
                                    key={sign.id} 
                                    onClick={() => handleSelectIndex(i)}
                                    style={{
                                        filter: filterVal,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {/* 1. Outer band (Astrological glyph) */}
                                    <path 
                                        d={getSectorPath(cx, cy, rOuterMax, rOuterMin, startAngle, endAngle)}
                                        fill={colors.outer}
                                        stroke={colors.stroke}
                                        strokeWidth={colors.strokeWidth}
                                        style={{ transition: 'fill 0.4s ease, stroke 0.4s ease, stroke-width 0.4s ease' }}
                                    />
                                    {/* 2. Middle band (Sign Name) */}
                                    <path 
                                        d={getSectorPath(cx, cy, rOuterMin, rMiddleMin, startAngle, endAngle)}
                                        fill={colors.middle}
                                        stroke={colors.stroke}
                                        strokeWidth={colors.strokeWidth}
                                        style={{ transition: 'fill 0.4s ease, stroke 0.4s ease, stroke-width 0.4s ease' }}
                                    />
                                    {/* 3. Inner band (Sign Number 1 - 12) */}
                                    <path 
                                        d={getSectorPath(cx, cy, rMiddleMin, rInnerMin, startAngle, endAngle)}
                                        fill={colors.inner}
                                        stroke={colors.stroke}
                                        strokeWidth={colors.strokeWidth}
                                        style={{ transition: 'fill 0.4s ease, stroke 0.4s ease, stroke-width 0.4s ease' }}
                                    />

                                    {/* Segment Content (Counter-rotated to always remain upright) */}
                                    <g transform={`translate(${cx}, ${cy}) rotate(${i * 30})`}>
                                        {/* Outer Band: Astrological glyph */}
                                        <text 
                                            x="0" 
                                            y="-165" 
                                            textAnchor="middle" 
                                            dominantBaseline="middle" 
                                            transform={`rotate(${counterRotate}, 0, -165)`}
                                            style={{ 
                                                fontSize: '1.4rem', 
                                                userSelect: 'none',
                                                pointerEvents: 'none',
                                                fill: status === 'neutral' ? 'var(--text-main)' : activeTheme.color,
                                                transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), fill 0.4s ease'
                                            }}
                                        >
                                            {sign.glyph}
                                        </text>

                                        {/* Middle Band: Name */}
                                        <text 
                                            x="0" 
                                            y="-117" 
                                            textAnchor="middle" 
                                            dominantBaseline="middle" 
                                            transform={`rotate(${counterRotate}, 0, -117)`}
                                            style={{ 
                                                fontSize: (language === 'fr' ? sign.nameFr : sign.name).length >= 9 
                                                    ? '0.42rem' 
                                                    : (language === 'fr' ? sign.nameFr : sign.name).length >= 7 
                                                        ? '0.46rem' 
                                                        : '0.50rem', 
                                                fontWeight: status === 'selected' ? 800 : 700, 
                                                letterSpacing: '0.01em',
                                                fill: status === 'neutral' ? 'var(--text-secondary)' : 'var(--text-main)',
                                                userSelect: 'none',
                                                pointerEvents: 'none',
                                                transition: 'fill 0.4s ease, transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
                                            }}
                                        >
                                            {language === 'fr' ? sign.nameFr : sign.name.toUpperCase()}
                                        </text>

                                        {/* Inner Band: Number */}
                                        <text 
                                            x="0" 
                                            y="-72" 
                                            textAnchor="middle" 
                                            dominantBaseline="middle" 
                                            transform={`rotate(${counterRotate}, 0, -72)`}
                                            style={{ 
                                                fontSize: '0.8rem', 
                                                fontWeight: status === 'selected' ? 900 : 700, 
                                                fill: status === 'neutral' ? 'var(--text-tertiary)' : activeTheme.color,
                                                userSelect: 'none',
                                                pointerEvents: 'none',
                                                transition: 'fill 0.4s ease, transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
                                            }}
                                        >
                                            {sign.number}
                                        </text>
                                    </g>
                                </g>
                            );
                        })}
                    </g>

                    {/* Dark center hub circle */}
                    <circle 
                        cx={cx} 
                        cy={cy} 
                        r={rInnerMin} 
                        fill="var(--bg-main)" 
                        stroke="var(--border-color)" 
                        strokeWidth="1.5" 
                    />
                    <circle 
                        cx={cx} 
                        cy={cy} 
                        r={rInnerMin - 12} 
                        fill="var(--bg-secondary)" 
                        stroke={activeTheme.badgeBorder} 
                        strokeWidth="1.5" 
                        style={{ transition: 'stroke 0.4s ease' }}
                    />

                    {/* Central Element Emoji */}
                    <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                            fontSize: '1.4rem',
                            userSelect: 'none',
                            pointerEvents: 'none',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                        }}
                    >
                        {activeSign.elementEmoji}
                    </text>
                </svg>

                {/* Decorative absolute selector arrow pointing to 12 o'clock in active element color */}
                <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '12px solid transparent',
                    borderRight: '12px solid transparent',
                    borderTop: `16px solid ${activeTheme.arrowColor}`,
                    filter: `drop-shadow(0 3px 6px ${activeTheme.badgeBg})`,
                    pointerEvents: 'none',
                    zIndex: 20,
                    transition: 'border-top-color 0.4s ease, filter 0.4s ease'
                }} />
            </div>

            {/* Premium details legend */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 'clamp(8px, 2vw, var(--spacing-lg))', 
                fontSize: '0.85rem', 
                flexWrap: 'wrap',
                marginTop: '-10px'
            }}>
                {/* 1. Selected Sign (Brighter highlight) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        background: activeTheme.selected.outer, 
                        border: `1.5px solid ${activeTheme.color}`, 
                        borderRadius: '3px',
                        boxShadow: `0 0 6px ${activeTheme.badgeBg}`
                    }}></div>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {t('Selected')} ({activeSignName})
                    </span>
                </div>

                {/* 2. Compatible Sign (Same element, softer highlight) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        background: activeTheme.compatible.outer, 
                        border: `1px solid ${activeTheme.compatible.stroke}`, 
                        borderRadius: '3px' 
                    }}></div>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                        {language === 'fr' ? 'Compatible (Même élément)' : 'Compatible (Same element)'}
                    </span>
                </div>

                {/* 3. Neutral */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '3px' }}></div>
                    <span style={{ fontWeight: 500, color: 'var(--text-tertiary)' }}>{t('Neutral')}</span>
                </div>
            </div>

            {/* Description Card Underneath */}
            <div className="card animate-fade-in" style={{ 
                width: '100%', 
                maxWidth: '650px',
                display: 'flex', 
                gap: 'clamp(14px, 3vw, var(--spacing-lg))', 
                alignItems: 'flex-start',
                background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
                border: `1px solid ${activeTheme.cardBorder}`,
                padding: 'clamp(16px, 3vw, var(--spacing-xl))',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'border-color 0.4s ease'
            }}>
                {/* Left: Large Glyph with Element Tint */}
                <div style={{
                    fontSize: 'clamp(3.5rem, 8vw, 4.5rem)',
                    lineHeight: 1,
                    minWidth: 'clamp(70px, 15vw, 85px)',
                    textAlign: 'center',
                    borderRight: '1px solid var(--border-color)',
                    paddingRight: 'clamp(12px, 2.5vw, var(--spacing-lg))',
                    marginTop: '-4px',
                    color: activeTheme.color,
                    textShadow: `0 0 20px ${activeTheme.badgeBg}`,
                    userSelect: 'none',
                    transition: 'color 0.4s ease, text-shadow 0.4s ease'
                }}>
                    {activeSign.glyph}
                </div>

                {/* Right: Info and Bullet List */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                        margin: '0 0 var(--spacing-sm) 0',
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        <h3 style={{ 
                            margin: 0, 
                            fontSize: 'clamp(1.2rem, 3vw, 1.4rem)', 
                            fontWeight: 800,
                            color: 'var(--text-main)',
                            display: 'inline-flex',
                            alignItems: 'center'
                        }}>
                            <span>{activeSignName}</span>
                        </h3>

                        {/* Element Badge */}
                        <span style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            background: activeTheme.badgeBg,
                            color: activeTheme.color,
                            border: `1px solid ${activeTheme.badgeBorder}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <span>{activeSign.elementEmoji}</span>
                            <span>{elementNameLocalized}</span>
                        </span>

                        {/* Dates Range */}
                        <span style={{ 
                            fontSize: '0.82rem', 
                            fontWeight: 500, 
                            color: 'var(--text-tertiary)' 
                        }}>
                            ({activeSign.dates[language === 'fr' ? 'fr' : 'en']})
                        </span>

                        {/* Order Number */}
                        <span style={{ 
                            fontSize: '0.82rem', 
                            fontWeight: 600, 
                            color: 'var(--text-tertiary)' 
                        }}>
                            (N° {activeSign.number})
                        </span>
                    </div>



                    {/* Bullet Points List */}
                    <ul style={{ 
                        margin: 0, 
                        paddingLeft: 'var(--spacing-md)', 
                        color: 'var(--text-main)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '6px' 
                    }}>
                        {activeBullets.map((bullet, idx) => (
                            <li key={idx} style={{ lineHeight: '1.45', fontSize: '0.94rem' }}>
                                {bullet}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
