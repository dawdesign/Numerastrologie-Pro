import { EARTH_SIGN_DESCRIPTIONS } from '../engine/personalityData';

export interface WikiNumber {
    id: string;
    title: string;
    traits: string[];
    description: string;
}

export interface WikiSign {
    name: string;
    emoji: string;
    desc: string;
    traits?: string[];
}

export const WIKI_NUMBERS: Record<string, WikiNumber[]> = {
    en: [
        { id: '1', title: '1 - The Leader', traits: ['Leadership', 'Independence', 'Ambition'], description: "Alpha, leader. Independent. Aggressive, very assertive. Learns things the hard way. Loves to debate, argue. Wants to lead everything all the time. Loyal. Competitive, hates losing." },
        { id: '2', title: '2 - The Diplomat', traits: ['Harmony', 'Intuition', 'Sensitivity'], description: "Feminine. Dislikes conflicts. Number of collaboration, sensitivity, and intuition. Has premonitory dreams." },
        { id: '3', title: '3 - The Creative', traits: ['Creativity', 'Optimism', 'Communication'], description: "The child in numerology. Looks younger than their age. Gets bored very easily, attention deficit. Very creative. Luckiest number, always finds help when needed most. Talkative." },
        { id: '4', title: '4 - The Builder', traits: ['Discipline', 'Hard Work', 'Commerce'], description: "Must not be an outlaw, it will always end badly. Skeptical of everything and everyone. Good in business. Hard worker. Holds several jobs/businesses at once. Has trouble stopping once they start a task. Lazy people are unbearable to you." },
        { id: '5', title: '5 - The Explorer', traits: ['Freedom', 'Sensuality', 'Travel'], description: "Travels a lot. Physical beauty. Open-minded (the shape of 5 is open both ways). Very indecisive, constantly changing mind. Unreliable. Epicureans who love stimulating their 5 senses." },
        { id: '6', title: '6 - The Nurturer', traits: ['Family', 'Comfort', 'Romance'], description: "Empathetic. Family and home-oriented, their sanctuary is most important. Likes comfort. Loves to eat (the shape of 6 has a big belly). Romantic. Likes when things are simple and go at their pace. The best friends to have." },
        { id: '7', title: '7 - The Analyst', traits: ['Intellect', 'Technology', 'Solitude'], description: "Genius, high IQ, intelligent. Good with technology. Body is more fragile, gets injured easily. Needs to spend time alone. Poor at communicating emotions, doesn't explain well, causing misunderstandings. Doesn't speak loudly, often hard to hear." },
        { id: '8', title: '8 - The Powerhouse', traits: ['Karma', 'Money', 'Power'], description: "Very karmic, everything comes back like a boomerang. The number of money, 8 exists top and bottom, but middle is nonexistent. Has been poor and rich, never in between. Loves power, sees everything as a balance of power. Gains and loses weight easily. Strict about customs and traditions." },
        { id: '9', title: '9 - The Humanitarian', traits: ['Wisdom', 'Attachment', 'Counsel'], description: "Feminine. Intelligent. Sentimental attachment to objects, hard to throw away. Once attached to someone or something, hard to let go. Sensitive to beauty. Should not get tattooed. Handles pressure poorly, but gives great advice to others." },
        { id: '11', title: '11 - The Illuminator', traits: ['Spiritual Messenger', 'Intuition', 'Charisma'], description: "Spiritual messenger. Hypersensitive and hyper-emotional. Has great intuition. Old soul, has been through incarnations of 1-9. Charismatic. Senses things before they happen. Slim and athletic body. Has a beautiful voice." },
        { id: '22', title: '22 - The Master Builder', traits: ['Structure', 'Ambition', 'Power'], description: "Master builder. Very old soul. Lifts others up. Poetic and artistic soul. Builds their physique, often found in the gym. Often experiences burnouts and nervous breakdowns. Unfortunately prone to bipolarity. Desperately needs structure and discipline." },
        { id: '33', title: '33 - The Master Teacher', traits: ['Influence', 'Manifestation', 'Ether'], description: "Oldest souls. Tremendous influence over others and events. Manifests easily and rapidly. Very intelligent. Had difficult beginnings, tested by the matrix. Succeeds later in life. The number associated with the 5th element, ether. ETHER = 33." }
    ],
    fr: [
        { id: '1', title: '1 - Le Leader', traits: ['Leadership', 'Indépendance', 'Ambition'], description: "Alpha, leadeur. Indépendant. Agressif, très assertif. Apprends les choses de la manière dure. Adorent débattre, argumenter. Veulent tout le temps tout diriger. Loyaux. Compétitifs, détestent perdre." },
        { id: '2', title: '2 - Le Diplomate', traits: ['Harmonie', 'Intuition', 'Sensibilité'], description: "Féminin. N'aiment pas les conflits. Chiffre de la collaboration, de la sensibilité et de l'intuition. Font des rêves prémonitoires." },
        { id: '3', title: '3 - Le Créateur', traits: ['Créativité', 'Optimisme', 'Communication'], description: "L’enfant en numérologie. Font plus jeune que leur âge. S’ennuient très facilement, ont un trouble de l’attention. Sont très créatifs. Le chiffre le plus chanceux, ont toujours de l’aide quand ils en ont le plus besoin. Bavards." },
        { id: '4', title: '4 - Le Bâtisseur', traits: ['Discipline', 'Commerce', 'Travail'], description: "Ne doit pas être hors la loi, ça se terminera toujours mal. Sceptique de tout et tout le monde. Bon dans le commerce. Bosseur. A plusieurs jobs/business en même temps. A du mal à s’arrêter quand ils démarrent une tâche. Les gens paresseux t’insupportent." },
        { id: '5', title: "5 - L'Explorateur", traits: ['Liberté', 'Voyage', 'Épicurien'], description: "Voyage beaucoup. Beauté physique. Ouvert d’esprit (la forme du 5 est ouvert des deux sens). Très indécis, change tout le temps d’avis. Peu fiable. Sont des épicuriens qui aiment stimuler leurs 5 sens." },
        { id: '6', title: '6 - Le Protecteur', traits: ['Famille', 'Foyer', 'Confort'], description: "Empathiques. Orientés famille et foyer, leur cocon est le plus important pour eux. Aiment leur confort. Adorent manger (la forme du 6 a un gros ventre). Romantiques. Aiment quand les choses sont simples et vont à leur rythme. Sont les meilleurs amis à avoir." },
        { id: '7', title: '7 - Le Penseur', traits: ['Intellect', 'Technologie', 'Solitude'], description: "Génie, QI élevé, Intelligent. Bons avec la technologie. Leur corps est plus fragile, se blesse facilement. A besoin de passer du temps seul. Communique mal ses émotions, ne s’explique pas très bien, source de malentendus. Ne parlent pas fort." },
        { id: '8', title: '8 - Le Dirigeant', traits: ['Karma', 'Argent', 'Pouvoir'], description: "Très karmique, tout revient vers lui comme un boomerang. Le chiffre de l’argent, 8 existe en haut et en bas, mais le milieu est inexistant. A été pauvre et riche mais jamais entre les deux. Adore le pouvoir, voit tout comme un rapport de force. Prend du poids et perd du poids facilement." },
        { id: '9', title: "9 - L'Humanitaire", traits: ['Sagesse', 'Attachement', 'Conseil'], description: "Féminin. Intelligents. S’attache sentimentalement aux objets et à du mal à les jeter. Une fois qu’ils s’attachent à quelque chose ou quelqu'un, ont du mal à lâcher prise. Sont sensibles à la beauté. Ne devrait pas se tatouer. Gèrent mal la pression, mais conseillent bien les autres." },
        { id: '11', title: "11 - L'Illuminateur", traits: ['Messager spirituel', 'Intuition', 'Charisme'], description: "Messager spirituel. Hypersensible et hyper émotionnel. A une très bonne intuition. Ame ancienne, a été à travers plusieurs incarnations des 1-9. Charismatiques. Sentent les choses arriver avant qu’elle se produisent. Corps mince et athlétique. A une belle voix." },
        { id: '22', title: '22 - Le Grand Bâtisseur', traits: ['Structure', 'Ambition', 'Réalisation'], description: "Maitre batisseur. Âme très ancienne. Tire les autres vers le haut. Ame poétique et artistique. Construit son corps, on peut souvent le trouver à la salle de sport. Connait souvent des burn-out et des crises de nerfs. Malheureusement sujet à la bipolarité. A besoin à tout prix de discipline et de structure." },
        { id: '33', title: '33 - Le Guide Spirituel', traits: ['Influence', 'Manifestation', 'Éther'], description: "Âmes les plus anciennes. Des personnes avec extrêmement d’influence sur les autres et sur les évènements. Manifeste super bien et rapidement. Très intelligents. A eu des débuts difficiles, et toute sa vie est testé par la matrice. Réussit plus tard dans la vie. Le nombre associé au 5eme élément, l’éther. ETHER = 33." }
    ]
};

const EARTH_NAMES_FR = ['Rat', 'Boeuf', 'Tigre', 'Chat', 'Dragon', 'Serpent', 'Cheval', 'Chèvre', 'Singe', 'Coq', 'Chien', 'Cochon'];
const EARTH_NAMES_EN = ['Rat', 'Ox', 'Tiger', 'Cat', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
const EARTH_EMOJIS = ['🐀', '🐂', '🐅', '🐈', '🐉', '🐍', '🐎', '🐐', '🐒', '🐓', '🐕', '🐖'];

export const WIKI_EARTH_SIGNS: Record<string, WikiSign[]> = {
    fr: EARTH_NAMES_FR.map((name, id) => ({
        name,
        emoji: EARTH_EMOJIS[id],
        desc: EARTH_SIGN_DESCRIPTIONS.fr[id].join(' '),
        traits: EARTH_SIGN_DESCRIPTIONS.fr[id]
    })),
    en: EARTH_NAMES_EN.map((name, id) => ({
        name,
        emoji: EARTH_EMOJIS[id],
        desc: EARTH_SIGN_DESCRIPTIONS.en[id].join(' '),
        traits: EARTH_SIGN_DESCRIPTIONS.en[id]
    }))
};

export const WIKI_SKY_SIGNS: Record<string, WikiSign[]> = {
    en: [
        { name: 'Aries', emoji: '♈', desc: "Direct, confident, natural leader, aggressive, impatient, courageous, determined." },
        { name: 'Taurus', emoji: '♉', desc: "Patient, reliable, devoted, stubborn, possessive, loves comfort and beauty." },
        { name: 'Gemini', emoji: '♊', desc: "Curious, adaptable, witty, nervous, inconsistent, excellent communicator." },
        { name: 'Cancer', emoji: '♋', desc: "Intuitive, sentimental, compassionate, protective, moody, deeply caring." },
        { name: 'Leo', emoji: '♌', desc: "Charismatic, generous, warm-hearted, creative, dramatic, proud." },
        { name: 'Virgo', emoji: '♍', desc: "Analytical, hardworking, practical, detail-oriented, critical, intelligent." },
        { name: 'Libra', emoji: '♎', desc: "Diplomatic, fair, social, idealistic, indecisive, hates conflict." },
        { name: 'Scorpio', emoji: '♏', desc: "Passionate, resourceful, brave, secretive, jealous, intense emotions." },
        { name: 'Sagittarius', emoji: '♐', desc: "Optimistic, lover of freedom, philosophical, frank, impatient." },
        { name: 'Capricorn', emoji: '♑', desc: "Disciplined, ambitious, responsible, pragmatic, pessimistic, persistent." },
        { name: 'Aquarius', emoji: '♒', desc: "Progressive, original, independent, humanitarian, detached, visionary." },
        { name: 'Pisces', emoji: '♓', desc: "Compassionate, artistic, intuitive, gentle, overly trusting, dreamy." }
    ],
    fr: [
        { name: 'Bélier', emoji: '♈', desc: "Direct, confiant, leader naturel, agressif, impatient, courageux, déterminé." },
        { name: 'Taureau', emoji: '♉', desc: "Patient, fiable, dévoué, têtu, possessif, aime le confort et la beauté." },
        { name: 'Gémeaux', emoji: '♊', desc: "Curieux, adaptable, vif d'esprit, nerveux, inconsistant, excellent communicant." },
        { name: 'Cancer', emoji: '♋', desc: "Intuitif, sentimental, compatissant, protecteur, lunatique, profondément attentionné." },
        { name: 'Lion', emoji: '♌', desc: "Charismatique, généreux, chaleureux, créatif, dramatique, fier." },
        { name: 'Vierge', emoji: '♍', desc: "Analytique, travailleur, pratique, axé sur les détails, critique, intelligent." },
        { name: 'Balance', emoji: '♎', desc: "Diplomate, équitable, sociable, idéaliste, indécis, déteste les conflits." },
        { name: 'Scorpion', emoji: '♏', desc: "Passionné, ingénieux, courageux, secret, jaloux, émotions intenses." },
        { name: 'Sagittaire', emoji: '♐', desc: "Optimiste, épris de liberté, philosophique, franc, impatient." },
        { name: 'Capricorne', emoji: '♑', desc: "Discipliné, ambitieux, responsable, pragmatique, pessimiste, persévérant." },
        { name: 'Verseau', emoji: '♒', desc: "Progressiste, original, indépendant, humanitaire, détaché, visionnaire." },
        { name: 'Poissons', emoji: '♓', desc: "Compatissant, artistique, intuitif, doux, trop confiant, rêveur." }
    ]
};
