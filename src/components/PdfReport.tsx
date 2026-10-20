import { useMemo } from 'react';
import AstrologyWheel from './AstrologyWheel';
import { calculateLifePath, reduceNumber, reduceCycle, calculateLuckyNumber } from '../engine/numerology';
import { getEarthSign, getEarthMonthSign, getWesternSign, EARTH_SIGNS, WESTERN_SIGNS } from '../engine/astrology';
import { NUMEROLOGY_DESCRIPTIONS, EARTH_SIGN_DESCRIPTIONS, UNREDUCED_LP_DESCRIPTIONS } from '../engine/personalityData';
import { calculateGematriaPremium } from '../engine/gematriaEngine';

interface PdfReportProps {
    name: string;
    day: number;
    month: number;
    year: number;
}

const MONTHS_FR = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const SOLAR_SIGNS_FR: Record<string, string> = {
    'Aries': 'Bélier',
    'Taurus': 'Taureau',
    'Gemini': 'Gémeaux',
    'Cancer': 'Cancer',
    'Leo': 'Lion',
    'Virgo': 'Vierge',
    'Libra': 'Balance',
    'Scorpio': 'Scorpion',
    'Sagittarius': 'Sagittaire',
    'Capricorn': 'Capricorne',
    'Aquarius': 'Verseau',
    'Pisces': 'Poissons'
};

const CHINESE_SIGNS_FR: Record<string, string> = {
    'Rat': 'Rat',
    'Ox': 'Bœuf',
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

const FIRST_LETTER_TRAITS: Record<string, string> = {
    'A': 'Alpha, leadeuse', 'B': 'Sensitive, collaborative', 'C': 'Créative, éloquente', 'D': 'Organisée, travailleuse',
    'E': 'Voyageuse, libre', 'F': 'Protectrice, responsable', 'G': 'Analytique, solitaire', 'H': 'Ambitieuse, puissante',
    'I': 'Idéaliste, émotive', 'J': 'Déterminée, leadeuse', 'K': 'Intuitive, messagère', 'L': 'Sociable, expressive',
    'M': 'Rigoureuse, bâtisseuse', 'N': 'Dynamique, voyageuse', 'O': 'Généreuse, protectrice', 'P': 'Sage, réfléchie',
    'Q': 'Assertive, indépendante', 'R': 'Karmique, sensible', 'S': 'Indépendante, forte', 'T': 'Charismatique, émotionnel',
    'U': 'Intuitive, réceptive', 'V': 'Bâtisseuse, maîtresse de son destin', 'W': 'Originale, changeante',
    'X': 'Équilibrée, double', 'Y': 'Spirituelle, indécise', 'Z': 'Volonté de fer, karmique'
};

const FIRST_VOWEL_TRAITS: Record<string, string> = {
    'A': 'Compétitive, leadeuse', 'E': 'Sexuel, ouverte d’esprit, indécise', 'I': 'Adaptative, égoïste',
    'O': 'Protectrice, aimante', 'U': 'Réceptive, équilibrée', 'Y': 'Spirituelle, inspirée'
};

// Helper functions for premium calculations in React
function getDayOfYear(year: number, month: number, day: number): number {
    const date = new Date(year, month - 1, day);
    const start = new Date(year, 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

function getIsoWeek(year: number, month: number, day: number): number {
    const d = new Date(Date.UTC(year, month - 1, day));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getChineseElement(year: number): string {
    const lastDigit = year % 10;
    if (lastDigit === 0 || lastDigit === 1) return 'Métal';
    if (lastDigit === 2 || lastDigit === 3) return 'Eau';
    if (lastDigit === 4 || lastDigit === 5) return 'Bois';
    if (lastDigit === 6 || lastDigit === 7) return 'Feu';
    return 'Terre';
}

function renderTriangleSVG(v1: string | number, v2: string | number, v3: string | number, coreNumbers: number[], label: string) {
    const hasVal = (v: string | number) => {
        if (typeof v === 'string') {
            const parts = v.split('/').map(Number);
            return parts.some(p => coreNumbers.includes(p));
        }
        return coreNumbers.includes(Number(v));
    };
    
    const active1 = hasVal(v1);
    const active2 = hasVal(v2);
    const active3 = hasVal(v3);
    
    return (
        <div className="compatibility-triangle-box">
            <svg className="compatibility-triangle-svg" viewBox="0 0 100 90" style={{ overflow: 'visible' }}>
                <polygon points="50,15 15,75 85,75" fill="none" stroke="#d4af37" strokeWidth="1.2" strokeOpacity={0.3} />
                {active1 && active2 && <line x1="50" y1="15" x2="15" y2="75" stroke="#10b981" strokeWidth="2.5" />}
                {active2 && active3 && <line x1="15" y1="75" x2="85" y2="75" stroke="#10b981" strokeWidth="2.5" />}
                {active3 && active1 && <line x1="85" y1="75" x2="50" y2="15" stroke="#10b981" strokeWidth="2.5" />}
                
                {/* Vertex 1 */}
                <circle cx="50" cy="15" r="9" fill={active1 ? '#10b981' : '#ffffff'} stroke="#d4af37" strokeWidth="1.2" />
                <text x="50" y="15.5" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '7.5px', fontWeight: 800, fill: active1 ? '#ffffff' : '#1a1a1a', fontFamily: "'Outfit', sans-serif" }}>{v1}</text>
                
                {/* Vertex 2 */}
                <circle cx="15" cy="75" r="9" fill={active2 ? '#10b981' : '#ffffff'} stroke="#d4af37" strokeWidth="1.2" />
                <text x="15" y="75.5" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '7.5px', fontWeight: 800, fill: active2 ? '#ffffff' : '#1a1a1a', fontFamily: "'Outfit', sans-serif" }}>{v2}</text>
                
                {/* Vertex 3 */}
                <circle cx="85" cy="75" r="9" fill={active3 ? '#10b981' : '#ffffff'} stroke="#d4af37" strokeWidth="1.2" />
                <text x="85" y="75.5" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '7.5px', fontWeight: 800, fill: active3 ? '#ffffff' : '#1a1a1a', fontFamily: "'Outfit', sans-serif" }}>{v3}</text>
            </svg>
            <div className="triangle-title" style={{ fontSize: '0.68rem', color: '#555555', marginTop: '6px', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{label}</div>
        </div>
    );
}

export default function PdfReport({ name, day, month, year }: PdfReportProps) {
    const cleanedName = name.trim() || 'Alexandra';

    // 1. Numerology Calculations
    const lpData = useMemo(() => calculateLifePath(month, day, year), [month, day, year]);
    const luckyNum = useMemo(() => calculateLuckyNumber(month, day, year), [month, day, year]);
    const pinnacle = useMemo(() => {
        const sum = day + month;
        return { base: sum, reduced: reduceCycle(sum) };
    }, [day, month]);

    // 2. Astrology Calculations
    const earthSign = useMemo(() => getEarthSign(year, month, day), [year, month, day]);
    const earthMonthSign = useMemo(() => getEarthMonthSign(month, day), [month, day]);
    const skySign = useMemo(() => getWesternSign(month, day), [month, day]);



    // 3. Premium Gematria calculations
    const gematria = useMemo(() => calculateGematriaPremium(cleanedName), [cleanedName]);
    const cleanNameUpper = useMemo(() => cleanedName.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, ''), [cleanedName]);
    const firstLetter = useMemo(() => cleanNameUpper.charAt(0) || 'A', [cleanNameUpper]);
    
    const firstVowel = useMemo(() => {
        const vowels = ['A', 'E', 'I', 'O', 'U', 'Y'];
        let vow = 'A';
        for (let char of cleanNameUpper) {
            if (vowels.includes(char)) {
                vow = char;
                break;
            }
        }
        return vow;
    }, [cleanNameUpper]);

    const letterTrait = FIRST_LETTER_TRAITS[firstLetter] || 'Indépendante, unique';
    const vowelTrait = FIRST_VOWEL_TRAITS[firstVowel] || 'Intuitive, harmonieuse';

    // Lettrologie custom paragraph
    const lettrologieText = useMemo(() => {
        if (firstLetter === 'C') {
            return "Personne très bavarde, aime bien raconter des histoires en exagérant les traits. Très indécise, change facilement d’avis. Mauvaise mémoire, mémoire sélective. Généreuse, donne beaucoup, parfois trop. Favorisée sous l’énergie 3, par exemple jour universel 3 ou année universelle 3. C = 3";
        } else if (firstLetter === 'T') {
            return "Tu es quelqu’un à qui on aime se confier et qu’on écoute. Tu vois les choses en grand et tu as envie de changer le monde. Tu t’attaches souvent aux objets et as du mal à les jeter. Grand potentiel de manifestation matérielle (argent). Tu dois vivre d’une certaine façon, tu as des exigences pour toi-même et ça depuis la naissance.";
        } else {
            return `Portée par la vibration de la lettre initiale ${firstLetter}, tu penses que tu n’es jamais mieux servie que par toi-même. Tu aimes faire les choses à ta façon, et apprendre de la manière dure. Tu as un grand potentiel de manifestation et une exigence naturelle élevée pour toi-même.`;
        }
    }, [firstLetter]);

    // Cluster Brands & Places Recommendations based on Chinese Sign
    const recommendations = useMemo(() => {
        const isClusterA = ['Rat', 'Dragon', 'Monkey', 'Rooster'].includes(earthSign.name);
        if (isClusterA) {
            return {
                lieux: ['Chine', 'Nouvelle Zélande', 'Népal', 'Stockholm (Suède)', 'Bahamas', 'New York (États-Unis)', 'Australie', 'Mexico City (Mexique)', 'Guatemala', 'Tokyo (Japon)', 'Irlande', 'Toronto (Canada)'],
                marques: ['Adidas', 'Puma', 'Shein', 'Sandro', 'The Kooples', 'Levi’s', 'Quechua', 'Evian', 'Celio', 'Tommy Hilfiger', 'Fendi', 'Hermès', 'Auchan', 'Calvin Klein', 'Monoprix', 'TikTok', 'Apple', 'Decathlon', 'Bose', 'BMW', 'Land Rover', 'Toyota', 'Volkswagen', 'Hotel F1', 'Holiday Inn', 'Mercure Hotel'],
                lieuxEviter: ['Majorque', 'Roumanie', 'Pologne', 'Brésil', 'Espagne', 'Allemagne', 'Royaume-Uni', 'Chypre', 'Indonésie', 'Philippines'],
                marquesEviter: ['Champion', 'Diesel', 'Vittel', 'Nestlé', 'Kellogg’s', 'B&B Hotels', 'Ferrari', 'Porsche', 'Honda', 'Peugeot', 'Jaguar', 'Dior', 'Casio', 'Sony', 'Columbus Café']
            };
        } else {
            return {
                lieux: ['Royaume-Uni', 'Philippines', 'Brésil', 'Majorque', 'Chypre', 'Indonésie', 'Afrique du Sud', 'Cancun (Mexique)', 'Allemagne', 'Tulum', 'Mykonos (Grèce)', 'Lucerne (Suisse)', 'Roumanie', 'Paraguay'],
                marques: ['Champion', 'Diesel', 'Vittel', 'Dior', 'Casio', 'Sony', 'Isabel Marant', 'Columbus Café', 'Louis Vuitton', 'Samsung', 'Chanel', 'Super U', 'Volvic', 'Instagram', 'Zadig & Voltaire', 'Ferrari', 'Porsche', 'Honda', 'Peugeot', 'Jaguar', 'Mercedes', 'Alfa Romeo', 'Seat', 'B&B Motels'],
                lieuxEviter: ['Nouvelle Zélande', 'Australie', 'Népal', 'Nevada (États-Unis)', 'New York (États-Unis)'],
                marquesEviter: ['Adidas', 'Puma', 'Shein', 'Sandro', 'The Kooples', 'Land Rover', 'Dodge', 'Hotel F1']
            };
        }
    }, [earthSign]);

    // Sleeping direction logic
    const sleepDir = useMemo(() => {
        if (['Horse', 'Pig', 'Goat', 'Tiger', 'Snake'].includes(earthSign.name) || lpData.lifepathNumber === 1 || day === 1) {
            return 'SUD';
        } else if (['Dragon', 'Rat'].includes(earthSign.name) || lpData.lifepathNumber === 5 || day === 5) {
            return 'EST-SUD-EST';
        } else if (['Ox', 'Monkey', 'Dog'].includes(earthSign.name)) {
            return 'NORD-OUEST';
        }
        return 'OUEST';
    }, [earthSign, lpData, day]);

    // 5-Year forecast calculations
    const forecasts = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const fcs = [];
        
        for (let i = 0; i < 5; i++) {
            const fcYear = currentYear + i;
            const fcLp = calculateLifePath(month, day, fcYear);
            const yearSign = getEarthSign(fcYear, 6, 15);
            
            let text = "";
            let warning = false;

            if (fcLp.lifepathNumber === 1) {
                text = "Cette année tente des coups de poker. La chance est de ton côté. C'est le moment d'imprimer de ton énergie tout ce que tu fais, et de partir sur une nouvelle base. Tu vas prendre beaucoup d'indépendance. Évite les conflits en règle générale même si l'autre a tort.";
            } else if (fcLp.lifepathNumber === 2 || fcLp.lifepathNumber === 11) {
                text = "C'est ton année ou une année difficile et émotionnellement chargée. Les années 11 changent toute la perspective qu'ont les gens sur la vie. C'est un élan de spiritualité qui va te gagner et de belles émotions très fortes. Une pratique sportive sera sans doute nécessaire pour canaliser toute cette énergie. Cette année marquera la fin de certaines choses qui te tiraient vers le bas jusque-là. Entoure-toi de l'énergie de ton signe ami pour te favoriser.";
                warning = true;
            } else if (fcLp.lifepathNumber === 3) {
                text = "Année très positive pour toi. Une année où tu auras du mal à te concentrer sur une seule chose à la fois. Tu feras de belles rencontres. 3 est le chiffre de la communication, donc si tu ne parles pas à tout le monde tu rateras des opportunités. Il y aura sans doute beaucoup de célébrations, sorties ou fête.";
            } else if (fcLp.lifepathNumber === 4 || fcLp.lifepathNumber === 22) {
                text = "Les années perso 22 sont souvent les plus belles sous une énergie astrologique compatible. Année parfaite pour un mariage par exemple ou un fort moment de ta vie. Tu vas te sentir léger et plus inspiré. Si c'est un cycle 4 standard, tu vas beaucoup te consacrer au travail. Pense en grand et bâtis à grande échelle. Attention aux factures, amendes et règlements, sois très réglo avec la loi.";
                warning = true;
            } else if (fcLp.lifepathNumber === 5) {
                text = "Cette année tu voyageras beaucoup. Il se peut que tu aies un enfant. Changement dans ta vie que ce soit dans le professionnel ou le personnel. Épicurien sous cette énergie, rappelle-toi que sous l’énergie 5 c'est mieux de louer que d'acheter.";
            } else if (fcLp.lifepathNumber === 6) {
                text = "Cette année tu vas avoir plus de responsabilités notamment vis-à-vis de ta famille. Tu seras plus chez toi. Bonne année financière. Tu seras emmené à rendre service aux autres.";
            } else if (fcLp.lifepathNumber === 7) {
                text = "Année de retrait, d'étude et d'overthinking. C'est le moment de réfléchir et de prendre soin de ta santé mentale. Risque d'accidents musculaires ou osseux (point faible genoux). Prends du temps pour toi dans la solitude et reste éloigné des conflits.";
                warning = true;
            } else if (fcLp.lifepathNumber === 8) {
                text = "Année de retour de karma, bon ou mauvais selon tes actions. Grands mouvements d'argent. La vibration 17/8 ou 26/8 te poussera à être plus stratégique ou plus dogmatique. Le sommeil sera plus agité, concentre-toi sur tes objectifs matériels sans tricher.";
                warning = true;
            } else if (fcLp.lifepathNumber === 9) {
                text = "Cette année ne sera pas la meilleure pour toi si elle clash avec ton énergie. Fin de cycle complète. Reste tranquille et évite de lancer de grandes nouveautés. Laisse les choses se terminer naturellement pour préparer le renouveau.";
                warning = true;
            } else {
                text = "Une année de transition pour consolider tes acquis et harmoniser tes vibrations personnelles.";
            }

            fcs.push({
                year: fcYear,
                animal: CHINESE_SIGNS_FR[yearSign.name],
                emoji: yearSign.emoji,
                display: fcLp.lifepath,
                text,
                warning
            });
        }
        return fcs;
    }, [month, day]);

    // Extra dynamic data
    const dayOfYear = useMemo(() => getDayOfYear(year, month, day), [year, month, day]);
    const isoWeek = useMemo(() => getIsoWeek(year, month, day), [year, month, day]);
    const chineseElement = useMemo(() => getChineseElement(year), [year]);
    const solarSignOrdinal = useMemo(() => ((WESTERN_SIGNS.indexOf(skySign) + 9) % 12) + 1, [skySign]);
    const chineseSignOrdinal = useMemo(() => earthSign.id + 1, [earthSign]);

    const getOrdinalText = (n: number) => n === 1 ? '1er' : `${n}ème`;

    // Core numbers for compatibility triangles
    const coreNumbers = useMemo(() => [
        lpData.lifepathNumber,
        reduceNumber(day),
        pinnacle.reduced,
        lpData.unreduced,
        day
    ], [lpData, day, pinnacle]);

    const unreducedString = `${lpData.unreduced}/${lpData.lifepathNumber}`;

    return (
        <article className="pdf-report-preview" style={{ display: 'block' }}>
            <style dangerouslySetInnerHTML={{ __html: `
                /* CSS TOKENS & RESET FOR A4 PRINT PREVIEW */
                .pdf-report-preview {
                    background: #fbf9f4;
                    color: #1a1a1a;
                    font-family: 'Inter', sans-serif;
                    line-height: 1.6;
                    padding: 0;
                    margin: 0 auto;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    border: 1px solid #e8e2d2;
                    max-width: 850px;
                    border-radius: 12px;
                    overflow: hidden;
                }

                .pdf-page {
                    width: 100%;
                    line-height: 1.6;
                    background: #fbf9f4;
                    padding: 20mm 20mm;
                    min-height: 297mm;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                }

                .page-title {
                    font-family: 'Georgia', serif;
                    font-size: 1.8rem;
                    border-bottom: 2px solid #d4af37;
                    padding-bottom: 8px;
                    color: #1a1a1a;
                    margin-bottom: 24px;
                }

                /* Cards and Details */
                .details-card {
                    background: #ffffff;
                    border: 1px solid #e8e2d2;
                    border-radius: 8px;
                    padding: 24px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.01);
                }

                .details-card span {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: #888888;
                    font-weight: 600;
                }

                .details-card .title {
                    font-size: 1.6rem;
                    font-weight: 800;
                    margin: 6px 0;
                }

                .details-card p {
                    font-size: 0.9rem;
                    color: #555555;
                    line-height: 1.5;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .text-block-dossier {
                    background: #ffffff;
                    border: 1px solid #e8e2d2;
                    border-radius: 8px;
                    padding: 24px;
                    line-height: 1.6;
                }

                .text-block-dossier h4 {
                    font-size: 1rem;
                    font-weight: 700;
                    margin: 0 0 10px 0;
                    text-transform: uppercase;
                }

                .text-block-dossier p {
                    margin: 0;
                    color: #444444;
                    font-size: 0.95rem;
                }

                .unreduced-badge {
                    background: #fbf9f4;
                    border-left: 4px solid #d4af37;
                    padding: 12px 16px;
                    font-size: 0.9rem;
                    color: #a18218;
                    font-weight: 500;
                    border-radius: 0 4px 4px 0;
                    margin-bottom: 20px;
                }

                .unreduced-badge ul {
                    margin: 6px 0 0 0;
                    padding-left: 20px;
                }

                .traits-list {
                    margin: 0;
                    padding-left: 20px;
                    color: #444444;
                    font-size: 0.95rem;
                }

                .traits-list li {
                    list-style-type: square;
                    margin-bottom: 10px;
                }

                .astro-grid {
                    display: grid;
                    grid-template-columns: 1.15fr 0.85fr;
                    gap: 24px;
                    align-items: center;
                    margin-bottom: 30px;
                }

                .wheel-container-standalone {
                    background: #ffffff;
                    border: 1px solid #e8e2d2;
                    border-radius: 8px;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                    width: 100%;
                }

                .recom-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .lucky-number-card {
                    background: #ffffff;
                    border: 1px dashed #d4af37;
                    border-radius: 8px;
                    padding: 24px;
                    text-align: center;
                }

                .lucky-number-card .big-num {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #d4af37;
                    margin: 8px 0;
                }

                .lucky-number-card ul {
                    margin: 0;
                    padding-left: 16px;
                    font-size: 0.8rem;
                    color: #666666;
                    text-align: left;
                    line-height: 1.6;
                }

                .brands-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }

                .brand-list-card {
                    background: #ffffff;
                    border: 1px solid #e8e2d2;
                    border-radius: 8px;
                    padding: 20px;
                }

                .forecasts-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .forecast-card {
                    background: #ffffff;
                    border: 1px solid #e8e2d2;
                    border-radius: 8px;
                    padding: 16px 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.01);
                }

                .forecast-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                    border-bottom: 1px dashed #e8e2d2;
                    padding-bottom: 6px;
                }

                .forecast-card-header h4 {
                    font-size: 1.1rem;
                    margin: 0;
                    font-family: 'Georgia', serif;
                    color: #1a1a1a;
                }

                .forecast-badge {
                    font-size: 0.85rem;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 12px;
                }

                .forecast-badge.warn {
                    color: #ef4444;
                    background: #fef2f2;
                }

                .forecast-badge.success {
                    color: #10b981;
                    background: #f0fdf4;
                }

                .hair-advice-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    margin-top: 16px;
                }

                .weakpoint-card {
                    display: flex;
                    gap: 16px;
                    align-items: flex-start;
                    margin-top: 16px;
                }

                .weakpoint-card .icon {
                    font-size: 2.5rem;
                    line-height: 1;
                }

                .weakpoint-card p {
                    margin: 0;
                    color: #444444;
                    font-size: 0.92rem;
                }

                .pdf-footer {
                    border-top: 1px solid #e8e2d2;
                    padding-top: 20px;
                    text-align: center;
                    font-size: 0.8rem;
                    color: #888888;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-top: 20px;
                }

                .pdf-closing {
                    text-align: center;
                    border-top: 1px solid #e8e2d2;
                    padding-top: 30px;
                    font-size: 0.9rem;
                    color: #666666;
                    margin-top: 40px;
                }

                .pdf-closing p {
                    margin: 0 0 4px 0;
                    font-style: italic;
                    font-family: 'Georgia', serif;
                }

                .pdf-closing strong {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .page-break {
                    height: 1px;
                    page-break-before: always;
                }

                /* PREMIUM ALIGNMENT PAGE 1 CLASSES */
                .chemin-pill-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 12px;
                }
                .chemin-pill {
                    background: linear-gradient(135deg, #d4af37 0%, #aa8410 100%);
                    color: #111111;
                    padding: 6px 18px;
                    border-radius: 20px;
                    font-family: 'Outfit', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    box-shadow: 0 4px 10px rgba(212, 175, 55, 0.2);
                }
                .date-calculator-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 6px;
                }
                .date-calculator-widget {
                    background: #ffffff;
                    border: 1px solid #e8e2d2;
                    border-radius: 12px;
                    padding: 10px 24px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }
                .date-section {
                    text-align: center;
                    min-width: 60px;
                }
                .date-section .num {
                    font-family: 'Outfit', sans-serif;
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    line-height: 1.2;
                }
                .date-section .label {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: #888888;
                    font-weight: 600;
                    margin-top: 2px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 3px;
                }
                .date-section .label .caret {
                    color: #d4af37;
                    font-size: 0.55rem;
                }
                .date-divider {
                    font-family: 'Georgia', serif;
                    font-size: 1.4rem;
                    color: #d4af37;
                    font-weight: 300;
                }
                .bridge-container {
                    display: flex;
                    justify-content: center;
                    height: 25px;
                    margin-bottom: 4px;
                }
                .bridge-svg {
                    width: 100%;
                    max-width: 500px;
                    height: 100%;
                }
                .cream-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }
                .cream-card {
                    background: #fdfbf7;
                    border: 1px solid #e8e2d2;
                    border-radius: 10px;
                    padding: 14px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
                }
                .cream-card .card-title {
                    font-size: 0.68rem;
                    text-transform: uppercase;
                    color: #888888;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    margin-bottom: 4px;
                }
                .cream-card .card-value {
                    font-family: 'Outfit', sans-serif;
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    line-height: 1.2;
                }
                .cream-card .card-subtitle {
                    font-size: 0.72rem;
                    color: #666666;
                    margin-top: 3px;
                }
                .spaced-gematria-section {
                    background: #ffffff;
                    border: 1px solid #e8e2d2;
                    border-radius: 8px;
                    padding: 16px 20px;
                    margin-bottom: 20px;
                }
                .spaced-gematria-grid-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    overflow-x: auto;
                    width: 100%;
                }
                .astrology-side-by-side {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    align-items: center;
                    margin-top: 10px;
                }
                .astrology-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.72rem;
                    font-family: 'Inter', sans-serif;
                }
                .astrology-table th {
                    text-align: left;
                    padding: 5px;
                    border-bottom: 1px solid #e8e2d2;
                    color: #888888;
                    font-weight: 600;
                }
                .astrology-table td {
                    padding: 4.5px 5px;
                    border-bottom: 1px solid #f2ede2;
                    color: #333333;
                }
                .astrology-table tr.highlight-active {
                    background-color: #c2ecd2 !important;
                    color: #0f5132 !important;
                    font-weight: 700;
                }
                .astrology-table tr.highlight-active td {
                    color: #0f5132 !important;
                }
                .astrology-table tr.highlight-clash {
                    background-color: #f5c6c6 !important;
                    color: #842029 !important;
                    font-weight: 700;
                }
                .astrology-table tr.highlight-clash td {
                    color: #842029 !important;
                }
                .triangles-container {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    margin: 20px 0;
                    gap: 15px;
                }
                .compatibility-triangle-box {
                    text-align: center;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .compatibility-triangle-svg {
                    width: 90px;
                    height: 80px;
                }
                .triangle-title {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-top: 6px;
                }

                @media print {
                    .pdf-report-preview {
                        border: none !important;
                        box-shadow: none !important;
                        background: transparent !important;
                        max-width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .pdf-page {
                        min-height: 297mm !important;
                        height: 297mm !important;
                        page-break-inside: avoid !important;
                        page-break-after: always !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        padding: 15mm 20mm !important;
                        box-sizing: border-box !important;
                        background: #fbf9f4 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            ` }} />

            {/* PAGE 1: IDENTITÉ & ASTROLOGIE TERRESTRE */}
            <div className="pdf-page" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'always' }}>
                <div>
                    <div className="chemin-pill-container" style={{ marginTop: '10px' }}>
                        <span className="chemin-pill">Chemin de vie {lpData.lifepath}</span>
                    </div>

                    <div className="date-calculator-container">
                        <div className="date-calculator-widget">
                            <div className="date-section" style={{ minWidth: '80px' }}>
                                <div className="num" style={{ textTransform: 'uppercase', fontSize: '1.1rem', color: '#1a1a1a' }}>
                                    {MONTHS_FR[month - 1]}
                                </div>
                                <div className="label">Mois <span className="caret">v</span></div>
                            </div>
                            <div className="date-divider">|</div>
                            <div className="date-section">
                                <div className="num">{day.toString().padStart(2, '0')}</div>
                                <div className="label">Jour</div>
                            </div>
                            <div className="date-divider">|</div>
                            <div className="date-section">
                                <div className="num">{year}</div>
                                <div className="label">Année</div>
                            </div>
                        </div>
                    </div>

                    <div className="bridge-container">
                        <svg className="bridge-svg" viewBox="0 0 500 25">
                            <path d="M 150 0 C 150 15, 80 10, 80 25" fill="none" stroke="#e07a5f" strokeWidth="1.5" strokeDasharray="3 3" />
                            <path d="M 250 0 L 250 25" fill="none" stroke="#e07a5f" strokeWidth="1.5" strokeDasharray="3 3" />
                            <path d="M 350 0 C 350 15, 420 10, 420 25" fill="none" stroke="#e07a5f" strokeWidth="1.5" strokeDasharray="3 3" />
                        </svg>
                    </div>

                    <div className="cream-cards-grid">
                        <div className="cream-card">
                            <div className="card-title">Zodiaque Solaire</div>
                            <div className="card-value" style={{ color: '#6b21a8' }}>
                                <span>{skySign.emoji}</span> {SOLAR_SIGNS_FR[skySign.name] || skySign.name}
                            </div>
                            <div className="card-subtitle">{getOrdinalText(solarSignOrdinal)} Signe</div>
                        </div>
                        <div className="cream-card">
                            <div className="card-title">Énergie Secondaire</div>
                            <div className="card-value" style={{ color: '#0d9488' }}>
                                {dayOfYear} Énergie Sec.
                            </div>
                            <div className="card-subtitle">{getOrdinalText(dayOfYear)} Jour / Sem. {isoWeek}</div>
                        </div>
                        <div className="cream-card">
                            <div className="card-title">Signe Terrestre</div>
                            <div className="card-value" style={{ color: '#b45309' }}>
                                <span>{earthSign.emoji}</span> {CHINESE_SIGNS_FR[earthSign.name]} de {chineseElement}
                            </div>
                            <div className="card-subtitle">{getOrdinalText(chineseSignOrdinal)} Signe</div>
                        </div>
                    </div>

                    {/* spaced gematria layout */}
                    <div className="spaced-gematria-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                            <div className="spaced-gematria-grid-wrapper">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', gap: '14px' }}>
                                        <div style={{ width: '140px', color: '#888', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', alignSelf: 'center' }}>Prénom</div>
                                        <div style={{ display: 'flex', gap: '14px' }}>
                                            {gematria.letters.map((char, i) => {
                                                const isVowel = ['A', 'E', 'I', 'O', 'U', 'Y'].includes(char);
                                                return (
                                                    <div key={`th-${i}`} style={{ width: '28px', padding: '8px 0', borderBottom: '2.5px solid #1a1a1a', fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', color: isVowel ? '#c94a29' : '#1a1a1a' }}>
                                                        {char}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '14px', borderTop: '1px dashed #f2ede2', paddingTop: '4px' }}>
                                        <div style={{ width: '140px', color: '#888', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', alignSelf: 'center' }}>Ordinale</div>
                                        <div style={{ display: 'flex', gap: '14px' }}>
                                            {gematria.ordinal.map((o, i) => (
                                                <div key={`ord-${i}`} style={{ width: '28px', padding: '12px 0', color: '#1a1a1a', fontWeight: 600, textAlign: 'center', fontSize: '1.1rem' }}>
                                                    {o.val}
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a', marginLeft: '20px', alignSelf: 'center' }}>= {gematria.ordValue}/{gematria.ordReduced}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '14px', borderTop: '1px dashed #f2ede2', paddingTop: '4px' }}>
                                        <div style={{ width: '140px', color: '#888', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', alignSelf: 'center' }}>Réduite (No-2)</div>
                                        <div style={{ display: 'flex', gap: '14px' }}>
                                            {gematria.reduced.map((r, i) => (
                                                <div key={`red-${i}`} style={{ width: '28px', padding: '12px 0', color: '#d4af37', fontWeight: 700, textAlign: 'center', fontSize: '1.1rem' }}>
                                                    {r.val}
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: '#d4af37', marginLeft: '20px', alignSelf: 'center' }}>= {gematria.redValue}/{gematria.redReduced}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px' }}>
                                <div style={{ background: '#fdfbf7', border: '1px solid #e8e2d2', borderRadius: '6px', padding: '6px 10px', boxShadow: '0 1px 4px rgba(0,0,0,0.01)' }}>
                                    <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: '#88', fontWeight: 700, display: 'block', letterSpacing: '0.05em' }}>1ère Lettre : {firstLetter}</span>
                                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#1a1a1a', marginTop: '1px', lineHeight: 1.2 }}>{letterTrait}</div>
                                </div>
                                <div style={{ background: '#fdfbf7', border: '1px solid #e8e2d2', borderRadius: '6px', padding: '6px 10px', boxShadow: '0 1px 4px rgba(0,0,0,0.01)' }}>
                                    <span style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: '#88', fontWeight: 700, display: 'block', letterSpacing: '0.05em' }}>1ère Voyelle : {firstVowel}</span>
                                    <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#c94a29', marginTop: '1px', lineHeight: 1.2 }}>{vowelTrait}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-block-dossier" style={{ padding: '12px 18px', marginBottom: '15px', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
                        <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#d4af37', marginBottom: '4px', letterSpacing: '0.04em' }}>Lettrologie & Vibration</h4>
                        <p style={{ fontSize: '0.84rem', lineHeight: 1.5, color: '#333333' }}>{lettrologieText}</p>
                    </div>

                    {/* Side-by-side Earth Astrology */}
                    <div className="details-card" style={{ padding: '12px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                        <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a1a1a', textAlign: 'center', fontWeight: 800, marginBottom: '2px' }}>Axe de l'Astrologie Terrestre</h3>
                        <p style={{ fontSize: '0.7rem', textAlign: 'center', color: '#666', marginBottom: '8px', fontWeight: 600 }}>
                            ANNÉE DE LA {CHINESE_SIGNS_FR[earthSign.name].toUpperCase()} ({year}) | MOIS DU {CHINESE_SIGNS_FR[earthMonthSign.name].toUpperCase()} ({['7 Déc - 5 Jan', '6 Jan - 3 Fév', '4 Fév - 5 Mars', '6 Mars - 4 Avr', '5 Avr - 5 Mai', '6 Mai - 5 Juin', '6 Juin - 6 Juil', '7 Juil - 7 Août', '8 Août - 7 Sept', '8 Sept - 7 Oct', '8 Oct - 6 Nov', '7 Nov - 6 Déc'][earthMonthSign.id]})
                        </p>
                        <div className="astrology-side-by-side" style={{ marginTop: '4px' }}>
                            <div className="wheel-container-standalone" style={{ padding: 0, border: 'none', boxShadow: 'none', background: 'transparent' }}>
                                <AstrologyWheel yearSignId={earthSign.id} monthSignId={earthMonthSign.id} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <table className="astrology-table">
                                    <thead>
                                        <tr>
                                            <th>Signe</th>
                                            <th>Dates du Mois</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[0,1,2,3,4,5,6,7,8,9,10,11].map(idx => {
                                            const sign = EARTH_SIGNS[idx];
                                            const dates = ['7 Déc - 5 Jan', '6 Jan - 3 Fév', '4 Fév - 5 Mars', '6 Mars - 4 Avr', '5 Avr - 5 Mai', '6 Mai - 5 Juin', '6 Juin - 6 Juil', '7 Juil - 7 Août', '8 Août - 7 Sept', '8 Sept - 7 Oct', '8 Oct - 6 Nov', '7 Nov - 6 Déc'][idx];
                                            
                                            const isMonth = idx === earthMonthSign.id;
                                            const isMonthClash = idx === (earthMonthSign.id + 6) % 12;
                                            
                                            let trClass = '';
                                            if (isMonth) {
                                                trClass = 'highlight-active';
                                            } else if (isMonthClash) {
                                                trClass = 'highlight-clash';
                                            }
                                            
                                            return (
                                                <tr key={`astro-row-${idx}`} className={trClass}>
                                                    <td style={{ fontWeight: 700, fontSize: '0.72rem' }}>{sign.emoji} {CHINESE_SIGNS_FR[sign.name]}</td>
                                                    <td style={{ fontSize: '0.68rem' }}>{dates}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pdf-footer" style={{ marginTop: '10px' }}>© Cabinet Numéro-Astrologie • Document Confidentiel</div>
            </div>

            <div className="page-break"></div>

            {/* PAGE 2: CHEMIN DE VIE & COMPATIBILITÉS */}
            <div className="pdf-page" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'always' }}>
                <div>
                    <h2 className="page-title" style={{ marginBottom: '16px' }}>II. Le Chemin de Vie & Compatibilités</h2>
                    
                    <div className="details-card" style={{ marginBottom: '18px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                        <h3 style={{ fontSize: '1.15rem', color: '#d4af37', margin: '0 0 10px 0', fontWeight: 800, fontFamily: 'Georgia, serif' }}>Vibration du Chemin de Vie {lpData.lifepath}</h3>
                        
                        {UNREDUCED_LP_DESCRIPTIONS['fr'][unreducedString] && (
                            <div className="unreduced-badge" style={{ marginBottom: '12px', padding: '8px 12px' }}>
                                <strong>Vibration spécifique {unreducedString} :</strong>
                                <ul style={{ marginTop: '4px', paddingLeft: '16px', fontSize: '0.82rem' }}>
                                    {UNREDUCED_LP_DESCRIPTIONS['fr'][unreducedString].map((t, idx) => <li key={`unred-${idx}`}>{t}</li>)}
                                </ul>
                            </div>
                        )}

                        <ul className="traits-list" style={{ fontSize: '0.84rem', lineHeight: '1.45', columnCount: 2, columnGap: '20px', marginBottom: 0 }}>
                            {NUMEROLOGY_DESCRIPTIONS['fr'][lpData.lifepathNumber]?.map((t, idx) => <li key={`trait-${idx}`}>{t}</li>)}
                        </ul>
                    </div>

                    <div className="details-grid" style={{ gap: '15px', marginBottom: '18px' }}>
                        <div className="details-card" style={{ padding: '14px 18px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#888' }}>Jour de Naissance</span>
                            <div className="title" style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0 2px 0' }}>Né le {day}</div>
                            <p style={{ color: '#555', fontSize: '0.8rem', lineHeight: '1.4' }}>Le jour de naissance gouverne tes énergies secondaires. Réduit à la vibration {reduceNumber(day)}, il active ta créativité et tes talents cachés.</p>
                        </div>
                        <div className="details-card" style={{ padding: '14px 18px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#888' }}>Pinacle (Mois + Jour)</span>
                            <div className="title" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d4af37', margin: '4px 0 2px 0' }}>Vibration {pinnacle.reduced}</div>
                            <p style={{ color: '#555', fontSize: '0.8rem', lineHeight: '1.4' }}>Somme du Jour et Mois de naissance ({day} + {month} = {pinnacle.base}). C'est l'axe de force et de récolte pour tes grandes réalisations de vie.</p>
                        </div>
                    </div>

                    {/* Triangles of compatibility */}
                    <div className="details-card" style={{ padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a1a1a', textAlign: 'center', fontWeight: 800, marginBottom: '12px' }}>Triangles Cosmiques de Compatibilité</h3>
                        <div className="triangles-container" style={{ margin: 0, padding: 0 }}>
                            {renderTriangleSVG(3, 6, 9, coreNumbers, "Vibration Créative / Intellectuelle")}
                            {renderTriangleSVG(1, 4, 7, coreNumbers, "Vibration Physique / Structurelle")}
                            {renderTriangleSVG("2/11", "5/22", "8/33", coreNumbers, "Vibration Émotionnelle / Maîtres")}
                        </div>
                        <p style={{ fontSize: '0.74rem', textAlign: 'center', color: '#666', marginTop: '10px', lineHeight: '1.4', fontStyle: 'italic', fontWeight: 500 }}>
                            * Les sommets colorés en vert <strong style={{ color: '#10b981' }}>●</strong> indiquent les vibrations actives de tes énergies (Chemin de vie, Jour de naissance, Pinacle). Les personnes ayant ces chiffres comme chemin de vie ou jour de naissance ont une résonance cosmique instantanée avec toi.
                        </p>
                    </div>
                </div>
                <div className="pdf-footer">Page 2 • Cabinet Numéro-Astrologie</div>
            </div>

            <div className="page-break"></div>

            {/* PAGE 3: ZODIAQUE TERRESTRE & RICHESSE */}
            <div className="pdf-page" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'always' }}>
                <div>
                    <h2 className="page-title" style={{ marginBottom: '16px' }}>III. Zodiaque Terrestre & Conseils de Richesse</h2>
                    
                    <div className="recom-row" style={{ gap: '15px', marginBottom: '18px' }}>
                        <div className="lucky-number-card" style={{ padding: '16px', border: '1px dashed #d4af37', borderRadius: '8px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#888' }}>Nombre Porte-bonheur</span>
                            <div className="big-num" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#d4af37', margin: '6px 0' }}>
                                {luckyNum.base === luckyNum.flipped ? luckyNum.base : `${luckyNum.base} / ${luckyNum.flipped}`}
                            </div>
                            <ul style={{ fontSize: '0.78rem', lineHeight: '1.4', paddingLeft: '12px', marginBottom: 0 }}>
                                <li>Tes <strong>{luckyNum.base} ans</strong> seront un âge très important dans ta vie.</li>
                                <li>L'an <strong>20{luckyNum.base}</strong> sera une année importante et hyper positive.</li>
                                <li>Le <strong>{luckyNum.flipped}</strong> de chaque mois est une excellente date pour toi.</li>
                                <li>Utilise ces nombres pour des chambres d'hôtels, plaques, jeux de hasard...</li>
                            </ul>
                        </div>
                        <div className="lucky-number-card" style={{ padding: '16px', border: '1px solid #e8e2d2', borderRadius: '8px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#888' }}>Orientation du Sommeil</span>
                            <div className="big-num" style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a', margin: '8px 0' }}>{sleepDir}</div>
                            <p style={{ fontSize: '0.78rem', color: '#555', lineHeight: '1.45', textAlign: 'left', padding: '0 4px', marginBottom: 0 }}>
                                Positionner la tête de ton lit orientée vers le <strong>{sleepDir}</strong> favorise une récupération cosmique optimale, équilibre ton énergie terrestre et magnétise la richesse matérielle au quotidien.
                            </p>
                        </div>
                    </div>

                    <div className="details-card" style={{ marginBottom: '18px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                        <h3 style={{ fontSize: '1.15rem', color: '#10b981', margin: '0 0 10px 0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Georgia, serif' }}>
                            <span>{earthSign.emoji}</span> Signe Terrestre : {CHINESE_SIGNS_FR[earthSign.name]} ({chineseElement})
                        </h3>
                        <ul className="traits-list" style={{ fontSize: '0.82rem', lineHeight: '1.45', columnCount: 2, columnGap: '20px', marginBottom: 0 }}>
                            {EARTH_SIGN_DESCRIPTIONS['fr'][earthSign.id]?.map((t, idx) => <li key={`esign-trait-${idx}`}>{t}</li>)}
                        </ul>
                    </div>

                    <div className="brand-list-card" style={{ padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a1a1a', textAlign: 'center', fontWeight: 800, marginBottom: '12px' }}>Affinités et Clashs des Marques & Lieux</h3>
                        <div className="brands-grid" style={{ gap: '15px' }}>
                            <div style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981', padding: '12px', borderRadius: '0 6px 6px 0' }}>
                                <h4 style={{ color: '#166534', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>🌿 Compatible & Ami</h4>
                                <div style={{ marginBottom: '6px' }}>
                                    <strong style={{ fontSize: '0.72rem', color: '#166534' }}>Lieux géographiques :</strong>
                                    <p style={{ fontSize: '0.74rem', color: '#3f6212', marginTop: '1px', lineHeight: '1.3' }}>{recommendations.lieux.join(', ')}</p>
                                </div>
                                <div>
                                    <strong style={{ fontSize: '0.72rem', color: '#166534' }}>Marques & Produits :</strong>
                                    <p style={{ fontSize: '0.74rem', color: '#3f6212', marginTop: '1px', lineHeight: '1.3' }}>{recommendations.marques.join(', ')}</p>
                                </div>
                            </div>
                            <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '12px', borderRadius: '0 6px 6px 0' }}>
                                <h4 style={{ color: '#991b1b', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>❌ À Éviter (Clash)</h4>
                                <div style={{ marginBottom: '6px' }}>
                                    <strong style={{ fontSize: '0.72rem', color: '#991b1b' }}>Lieux à éviter :</strong>
                                    <p style={{ fontSize: '0.74rem', color: '#991b1b', marginTop: '1px', lineHeight: '1.3' }}>{recommendations.lieuxEviter.join(', ')}</p>
                                </div>
                                <div>
                                    <strong style={{ fontSize: '0.72rem', color: '#991b1b' }}>Marques à éviter :</strong>
                                    <p style={{ fontSize: '0.74rem', color: '#991b1b', marginTop: '1px', lineHeight: '1.3' }}>{recommendations.marquesEviter.join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pdf-footer">Page 3 • Cabinet Numéro-Astrologie</div>
            </div>

            <div className="page-break"></div>

            {/* PAGE 4: PREVISIONS SUR 5 ANS */}
            <div className="pdf-page" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'always' }}>
                <div>
                    <h2 className="page-title" style={{ marginBottom: '16px' }}>IV. Prévisions sur 5 Ans (Cycles)</h2>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '12px', lineHeight: '1.4', fontWeight: 500 }}>
                        Les cycles personnels s'activent à la date de ton anniversaire chaque année. Ils influencent ton état émotionnel, ta motivation et tes facultés de manifestation. Voici les prévisions détaillées pour ton chemin cosmique :
                    </p>
                    <div className="forecasts-stack" style={{ gap: '12px' }}>
                        {forecasts.map((fc, idx) => (
                            <div key={`fc-${idx}`} className="forecast-card" style={{ padding: '12px 16px', borderRadius: '8px' }}>
                                <div className="forecast-card-header" style={{ marginBottom: '4px', paddingBottom: '4px' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        Année {fc.year} — {fc.animal} {fc.emoji}
                                    </h4>
                                    <span className={`forecast-badge ${fc.warning ? 'warn' : 'success'}`} style={{ fontSize: '0.74rem', padding: '2px 8px', borderRadius: '10px' }}>
                                        {fc.warning ? '⚠️ ' : '✨ '} Année Perso {fc.display}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: '#333333', lineHeight: '1.45' }}>{fc.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="pdf-footer">Page 4 • Cabinet Numéro-Astrologie</div>
            </div>

            <div className="page-break"></div>

            {/* PAGE 5: CONSEILS DE VIE & FORMULES */}
            <div className="pdf-page" style={{ pageBreakInside: 'avoid' }}>
                <div>
                    <h2 className="page-title" style={{ marginBottom: '16px' }}>V. Conseils de Vie & Règles Cosmiques</h2>
                    
                    <div className="hair-advice-grid" style={{ gap: '15px', marginBottom: '18px', marginTop: 0 }}>
                        <div className="details-card" style={{ padding: '14px 16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                            <h3 style={{ fontSize: '0.85rem', color: '#d4af37', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>Point Faible & Préservation</h3>
                            <div className="weakpoint-card" style={{ marginTop: '4px', gap: '10px' }}>
                                <div className="icon" style={{ fontSize: '1.6rem' }}>⚠️</div>
                                <div style={{ fontSize: '0.8rem', lineHeight: '1.4', color: '#444' }}>
                                    {earthSign.name === 'Rat' || lpData.lifepathNumber === 33 ? (
                                        <>
                                            <strong>Faiblesse physique : les genoux.</strong><br />
                                            Attention dans les cycles personnels de vibration <strong>7</strong>. Fais attention aux chutes physiques et articulaires.
                                        </>
                                    ) : (
                                        <>
                                            <strong>Faiblesse physique : la gorge et le cou.</strong><br />
                                            Évite de le surcharger de tensions physiques ou émotionnelles, particulièrement lors de tes cycles personnels de vibration <strong>7</strong>.
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="details-card" style={{ padding: '14px 16px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                            <h3 style={{ fontSize: '0.85rem', color: '#d4af37', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>Manifestation des Cheveux</h3>
                            <p style={{ fontSize: '0.78rem', lineHeight: '1.4', color: '#555' }}>
                                Les cheveux agissent comme des antennes vibratoires pour capter l'abondance.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                <div style={{ background: '#f0fdf4', borderLeft: '3px solid #10b981', padding: '4px 8px', borderRadius: '0 4px 4px 0', fontSize: '0.76rem', color: '#166534' }}>
                                    <strong>Coupe :</strong> Jour <strong>{lpData.isMaster ? lpData.lifepathNumber : day}</strong> ou jours <strong>8, 17, 26, 28</strong>.
                                </div>
                                <div style={{ background: '#fef2f2', borderLeft: '3px solid #ef4444', padding: '4px 8px', borderRadius: '0 4px 4px 0', fontSize: '0.76rem', color: '#991b1b' }}>
                                    <strong>Évite :</strong> Le jour **11** ou les jours de vibration 11 (clash émotionnel).
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="details-card" style={{ marginBottom: '18px', padding: '14px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', background: '#fdfbf7' }}>
                        <h3 style={{ fontSize: '0.85rem', color: '#1a1a1a', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>Règles de Manifestation de l'Abondance</h3>
                        <ul style={{ fontSize: '0.82rem', lineHeight: '1.45', paddingLeft: '16px', color: '#333', marginBottom: 0 }}>
                            {earthSign.name === 'Rat' ? (
                                <li><strong>Délégation d'or :</strong> Ne cherche pas à tout faire tout seul, emploie des gens qui font le travail à ta place. C'est la technique qui marche le mieux pour le signe Rat.</li>
                            ) : (
                                <li><strong>Force d'impact :</strong> Utilise ta persévérance naturelle pour structurer des projets à long terme. Ne lâche pas prise face aux obstacles.</li>
                            )}
                            <li><strong>Tarification en 8 :</strong> Mets tes prix se terminant ou se réduisant à <strong>8</strong> (ex: 80€, 440€, 26€...). Les personnes chemin de vie 8 ou réduisant à 8 seront d'excellents partenaires en affaires.</li>
                            {lpData.lifepathNumber === 33 ? (
                                <li><strong>Couleur de pouvoir :</strong> Entoure-toi de la couleur <strong>orange</strong> (ORANGE = 33 en gématrie premium) pour rayonner d'influence.</li>
                            ) : gematria.redValue === 55 ? (
                                <li><strong>Couleur & Prénom (55) :</strong> Ton prénom réduit à <strong>55</strong>. C'est un nombre puissant de richesse cosmique (Steve Jobs et Bill gates nés en 1955).</li>
                            ) : (
                                <li><strong>Couleur de pouvoir :</strong> Entoure-toi de couleurs sobres ou vibrantes pour équilibrer tes vibrations au quotidien.</li>
                            )}
                            <li><strong>Dates âmes sœurs :</strong> Les <strong>23 Janvier, 15 Mai, 7 Septembre et 27 Septembre</strong> sont des portails de chance relationnelle majeure pour toi.</li>
                        </ul>
                    </div>

                    {/* Mathematical cycle explanations */}
                    <div className="details-card" style={{ marginBottom: '15px', padding: '14px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)', background: '#fdfbf7' }}>
                        <h3 style={{ fontSize: '0.85rem', color: '#d4af37', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>Calcul des Cycles Personnels</h3>
                        <p style={{ fontSize: '0.78rem', lineHeight: '1.4', color: '#555', marginBottom: '6px' }}>
                            Pour suivre tes propres cycles et anticiper les portails temporels, applique les formules de calcul suivantes :
                        </p>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', background: 'rgba(0,0,0,0.02)', padding: '8px 12px', borderRadius: '6px', color: '#1a1a1a', lineHeight: 1.35 }}>
                            <strong>ANNÉE PERSO :</strong> JOUR DE NAISSANCE + MOIS + DERNIER ANNIVERSAIRE<br />
                            <strong>MOIS PERSO :</strong> ANNÉE PERSO + MOIS EN COURS (Débute au jour de naissance)<br />
                            <strong>JOUR PERSO :</strong> ANNÉE PERSO + MOIS EN COURS + JOUR EN COURS (Débute à l'heure)
                        </div>
                    </div>

                    <div className="pdf-closing" style={{ marginTop: '15px', borderTop: '1.5px solid #e8e2d2', paddingTop: '12px' }}>
                        <p style={{ fontSize: '0.82rem', fontFamily: 'Georgia, serif', marginBottom: '2px' }}>« Que les astres et les nombres guident tes pas vers ton plus haut potentiel. »</p>
                        <strong style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Cabinet Numéro-Astrologie • Paris</strong>
                    </div>
                </div>
                <div className="pdf-footer">Page 5 • Cabinet Numéro-Astrologie</div>
            </div>
        </article>
    );
}
