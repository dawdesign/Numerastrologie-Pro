import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'fr';

interface SettingsContextType {
  theme: Theme;
  language: Language;
  showCompatOutlines: boolean;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  toggleShowCompatOutlines: () => void;
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // General UI
    'Settings': 'Settings',
    'Language': 'Language',
    'Theme': 'Theme',
    'Dark Mode': 'Dark Mode',
    'Light Mode': 'Light Mode',
    'Search': 'Search',
    'Searching...': 'Searching...',
    'Reset to Today': 'Reset to Today',
    'Today': 'Today',
    'Recent Searches': 'Recent Searches',
    'Search for celebrities or countries...': 'Search for celebrities or countries...',

    // Navigation / Pages
    'Calculator': 'Calculator',
    'Calendar/Horoscope': 'Calendar/Horoscope',
    'Equation/Finder': 'Equation/Finder',
    'Letterology': 'Letterology',
    'Wiki': 'Wiki',

    // Profiles & Energy
    'Numbers': 'Numbers',
    'Life Path': 'Life Path',
    'sec. energy': 'secondary energy',
    'Personality Profile': 'Personality Profile',
    'Lucky #': 'Lucky #',
    'Pinnacle': 'Pinnacle',
    'Particularity:': 'Particularity:',
    'vibration': 'vibration',
    'structure': 'structure',
    'sign': 'sign',
    'birthday': 'birthday',
    'cycle': 'cycle',

    // Astrology
    'Earth Month Sign': 'Earth Month Sign',
    'Earth Year Sign': 'Earth Year Sign',
    'Sky / Western Signs': 'Sky / Western Signs',
    'Earth / Vietnamese Signs': 'Earth / Vietnamese Signs',
    'Earth Sign': 'Earth Sign',

    // Elements
    'Metal': 'Metal',
    'Water': 'Water',
    'Wood': 'Wood',
    'Fire': 'Fire',
    'Earth': 'Earth',
    'Air': 'Air',

    // Zodiac Signs
    'Rat': 'Rat', 'Ox': 'Ox', 'Tiger': 'Tiger', 'Cat': 'Cat', 'Dragon': 'Dragon', 'Snake': 'Snake',
    'Horse': 'Horse', 'Goat': 'Goat', 'Monkey': 'Monkey', 'Rooster': 'Rooster', 'Dog': 'Dog', 'Pig': 'Pig',
    'Aries': 'Aries', 'Taurus': 'Taurus', 'Gemini': 'Gemini', 'Cancer': 'Cancer', 'Leo': 'Leo', 'Virgo': 'Virgo',
    'Libra': 'Libra', 'Scorpio': 'Scorpio', 'Sagittarius': 'Sagittarius', 'Capricorn': 'Capricorn', 'Aquarius': 'Aquarius', 'Pisces': 'Pisces',

    // Cycles
    'Current Universal Cycles': 'Current Universal Cycles',
    'Universal Year': 'Universal Year',
    'Universal Month': 'Universal Month',
    'Universal Day': 'Universal Day',
    'Current Personal Cycles': 'Current Personal Cycles',
    'Personal Year': 'Personal Year',
    'Personal Month': 'Personal Month',
    'Personal Day': 'Personal Day',
    'Started on your': 'Started on your',
    'Based on': 'Based on',
    'For today': 'For today',
    'For the world in': 'For the world in',

    // Compatibility
    'Check Compatibility': 'Check Compatibility',
    'Compare Match': 'Compare Match',
    'Close': 'Close',
    'Search entity to compare with...': 'Search entity to compare with...',
    'Location': 'Location',
    'Lieu': 'Location',
    'Clear location': 'Clear location',
    'Month': 'Month',
    'Day': 'Day',
    'Year': 'Year',
    'Compatibility with the numerology profile of': 'Compatibility with the numerology profile of',
    'the selected date': 'the selected date',
    'overallVerdict': 'overall verdict',
    'Rule Override Active': 'Rule Override Active',
    'Compatible': 'Compatible',
    'Master/Servant': 'Master/Servant',
    'Challenging': 'Challenging',
    'Incompatible': 'Incompatible',
    'Neutral': 'Neutral',
    'Best': 'Best',
    'Good': 'Good',
    'Bad': 'Bad',
    'Enem': 'Enemy',
    'Enemy': 'Enemy',
    'MS': 'Master/Servant',
    '50': '50/50',
    'Trine': 'Trine',
    'Same': 'Same Sign',
    'Terrible': 'Terrible',
    'Ok': 'Ok',
    'Excellent': 'Excellent',
    'Lucky Day': 'Lucky Day',
    'Lucky Day!': 'Lucky Day!',
    'Lucky Month!': 'Lucky Month!',
    'Lucky Year!': 'Lucky Year!',
    'It was a Lucky Year!': 'It was a Lucky Year!',
    'It was a Lucky Date!': 'It was a Lucky Date!',
    'years old': '{age} years old',
    'Moon Phase': 'Moon Phase',

    // Miscellaneous UI
    'Export Profile to Calendar': 'Export Profile to Calendar',
    'Date Finder & Equation': 'Date Finder & Equation',
    'Search From Year': 'Search From Year',
    'Search To Year': 'Search To Year',
    'Search Calendar': 'Search Calendar',
    'Results': 'Results',
    'Reduced Day': 'Reduced Day',
    'Reduced Form': 'Reduced Form',
    'Unreduced Form': 'Unreduced Form',
    'Information Wiki': 'Information Wiki',
    'Number Compatibility Chart': 'Number Compatibility Chart',
    'Compatibility Outlines': 'Compatibility Outlines',
    'Show compatibility outlines in calculator': 'Show compatibility outlines in calculator',
    'Matrix Value': 'Final Reduction',

    // Additional Dictionary Keys
    'Selected': 'Selected',
    'Friendly (Trine)': 'Friendly (Trine)',
    'Opposite (Enemy)': 'Opposite (Enemy)',
    'Compatible (Same Element)': 'Compatible (Same Element)',
    'Fire Signs': 'Fire Signs',
    'Earth Signs': 'Earth Signs',
    'Air Signs': 'Air Signs',
    'Water Signs': 'Water Signs',
    'No enemy signs': 'No enemy signs',
    'Error fetching search results from Wikipedia.': 'Error fetching search results from Wikipedia.',
    'Error fetching details.': 'Error fetching details.',
    'Cannot compare matching with an unknown exact date.': 'Cannot compare matching with an unknown exact date.',
    'Verified Country Data': 'Verified Country Data',
    'Verified Club Data': 'Verified Club Data',
    'Unknown': 'Unknown',
    'day': 'day',
    'week': 'week',
    'For': 'For',
    'Hide Personal Cycles': 'Hide Personal Cycles',
    'Show Personal Cycles': 'Show Personal Cycles',
    'Earth Month': 'Earth Month',
    'Universal Cycles of Compare Date': 'Universal Cycles of Compare Date',
    'Matrix Calendar': 'Matrix Calendar',
    'Unknown Date': 'Unknown Date',
    'Prev': 'Prev',
    'Next': 'Next',
    'Years': 'Years',
    'Months': 'Months',
    'Days': 'Days',
    'Energy': 'Energy',
    'Secondary Energy': 'Secondary Energy',
    'Earth Year': 'Chinese Year',
    'Sky Sign': 'Sky Sign',
    'Primary Earth Month': 'Primary Earth Month',
    'Text & Number Reduction': 'Text & Number Reduction',
    'Alphabet / Letterology': 'Alphabet / Letterology',
    'Number Reduction': 'Number Reduction',
    'e.g., 2026, 45, 999': 'e.g., 2026, 45, 999',
    'Numerology': 'Numerology',
    'Start Date': 'Start Date',
    'Finish Date': 'Finish Date',
    'Search Filters': 'Search Filters',
    'Reset Filters': 'Reset Filters',
    'Any': 'Any',
  },
  fr: {
    // General UI
    'Settings': 'Paramètres',
    'Language': 'Langue',
    'Theme': 'Thème',
    'Dark Mode': 'Mode Sombre',
    'Light Mode': 'Mode Clair',
    'Search': 'Chercher',
    'Searching...': 'Recherche...',
    'Reset to Today': 'Réinitialiser',
    'Today': "Aujourd'hui",
    'Recent Searches': 'Recherches récentes',
    'Search for celebrities or countries...': 'Rechercher des célébrités ou des pays...',
    'Numerastrologie Pro by DD22': 'Numerastrologie Pro by DD22',
    'Locked in free version': 'Verrouillé dans la version gratuite',

    // Navigation / Pages
    'Calculator': 'Calculateur',
    'Calendar/Horoscope': 'Calendrier/Horoscope',
    'Equation/Finder': 'Équation/Recherche',
    'Letterology': 'Lettrologie',
    'Wiki': 'Wiki',

    // Profiles & Energy
    'Numbers': 'Nombres',
    'Life Path': 'Chemin de vie',
    'sec. energy': 'énergie secondaire',
    'Personality Profile': 'Profil de personnalité',
    'Lucky #': 'N° Chance',
    'Pinnacle': 'Pinacle',
    'Particularity:': 'Particularité :',
    'vibration': 'vibration',
    'structure': 'personnalité',
    'sign': 'signe',
    'birthday': 'anniversaire',
    'cycle': 'cycle',

    // Astrology
    'Earth Month Sign': 'Mois',
    'Earth Year Sign': 'Signe',
    'Sky / Western Signs': 'Signes du Ciel / Occidentaux',
    'Earth / Vietnamese Signs': 'Signes de Terre / Vietnamiens',
    'Earth Sign': 'Signe de Terre',

    // Elements
    'Metal': 'Métal',
    'Water': 'Eau',
    'Wood': 'Bois',
    'Fire': 'Feu',
    'Earth': 'Terre',
    'Air': 'Air',

    // Zodiac Signs
    'Rat': 'Rat', 'Ox': 'Boeuf', 'Boeuf': 'Boeuf', 'Tiger': 'Tigre', 'Cat': 'Chat', 'Dragon': 'Dragon', 'Snake': 'Serpent',
    'Horse': 'Cheval', 'Goat': 'Chèvre', 'Monkey': 'Singe', 'Rooster': 'Coq', 'Dog': 'Chien', 'Pig': 'Cochon',
    'Aries': 'Bélier', 'Taurus': 'Taureau', 'Gemini': 'Gémeaux', 'Cancer': 'Cancer', 'Leo': 'Lion', 'Virgo': 'Vierge',
    'Libra': 'Balance', 'Scorpio': 'Scorpion', 'Sagittarius': 'Sagittaire', 'Capricorn': 'Capricorne', 'Aquarius': 'Verseau', 'Pisces': 'Poissons',

    // Cycles
    'Current Universal Cycles': 'Cycles Universels Actuels',
    'Universal Year': 'Année Universelle',
    'Universal Month': 'Mois Universel',
    'Universal Day': 'Jour Universel',
    'Current Personal Cycles': 'Cycles Personnels Actuels',
    'Personal Year': 'Année Personnelle',
    'Personal Month': 'Mois Personnel',
    'Personal Day': 'Jour Personnel',
    'Started on your': 'A commencé à votre',
    'Based on': 'Basé sur le cycle de',
    'For today': 'Pour aujourd\'hui',
    'For the world in': 'Pour le monde en',

    // Compatibility
    'Check Compatibility': 'Vérifier la compatibilité',
    'Compare Match': 'Comparer',
    'Close': 'Fermer',
    'Search entity to compare with...': 'Chercher une célébrité, un pays, un club...',
    'Location': 'Lieu',
    'Lieu': 'Lieu',
    'Clear location': 'Effacer le lieu',
    'Month': 'Mois',
    'Day': 'Jour',
    'Year': 'Année',
    'Compatibility with the numerology profile of': 'Compatibilité avec le profil de numérologie de',
    'the selected date': 'la date sélectionnée',
    'overallVerdict': 'verdict global',
    'Rule Override Active': 'Règle de priorité active',
    'Compatible': 'Compatible',
    'Master/Servant': 'Maître/Serviteur',
    'Challenging': 'Difficile',
    'Incompatible': 'Incompatible',
    'Neutral': 'Neutre',
    'Best': 'Excellent',
    'Good': 'Bon',
    'Bad': 'Mauvais',
    'Enem': 'Ennemi',
    'Enemy': 'Ennemi',
    'MS': 'Maître/Serviteur',
    '50': '50/50',
    'Trine': 'Trigone',
    'Same': 'Même Signe',
    'Terrible': 'Terrible',
    'Ok': 'Correct',
    'Excellent': 'Excellent',
    'Lucky Day': 'Jour porte-bonheur',
    'Lucky Day!': 'Jour porte-bonheur !',
    'Lucky Month!': 'Mois porte-bonheur !',
    'Lucky Year!': 'Année porte-bonheur !',
    'It was a Lucky Year!': 'C\'était une année porte-bonheur !',
    'It was a Lucky Date!': 'C\'était une date porte-bonheur !',
    "set to today's date": "Définir à la date d'aujourd'hui",
    'years old': '{age} ans',
    'Moon Phase': 'Phase lunaire',

    // Miscellaneous UI
    'Export Profile to Calendar': 'Exporter vers le calendrier',
    'Date Finder & Equation': 'Recherche de Date & Équation',
    'Search From Year': 'Chercher à partir de l\'année',
    'Search To Year': 'Chercher jusqu\'à l\'année',
    'Search Calendar': 'Chercher dans le calendrier',
    'Results': 'Résultats',
    'Reduced Day': 'Jour Réduit',
    'Reduced Form': 'Forme réduite',
    'Unreduced Form': 'Forme non réduite',
    'Information Wiki': 'Wiki d\'Informations',
    'Number Compatibility Chart': 'Tableau de Compatibilité des Nombres',
    'Compatibility Outlines': 'Contours de compatibilité',
    'Show compatibility outlines in calculator': 'Afficher les contours de compatibilité dans le calculateur',
    'Matrix Value': 'Réduction Finale',

    // Additional Dictionary Keys
    'Selected': 'Sélectionné',
    'Friendly (Trine)': 'Amical (Trigone)',
    'Opposite (Enemy)': 'Opposé (Ennemi)',
    'Compatible (Same Element)': 'Compatible (Même Élément)',
    'Fire Signs': 'Signes de Feu',
    'Earth Signs': 'Signes de Terre',
    'Air Signs': 'Signes d\'Air',
    'Water Signs': 'Signes d\'Eau',
    'No enemy signs': 'Aucun signe ennemi',
    'Error fetching search results from Wikipedia.': 'Erreur lors de la récupération des résultats Wikipédia.',
    'Error fetching details.': 'Erreur lors de la récupération des détails.',
    'Cannot compare matching with an unknown exact date.': 'Impossible de comparer avec une date exacte inconnue.',
    'Verified Country Data': 'Données vérifiées du pays',
    'Verified Club Data': 'Données vérifiées du club',
    'Unknown': 'Inconnu',
    'day': 'jour',
    'week': 'semaine',
    'For': 'Pour',
    'Hide Personal Cycles': 'Masquer les Cycles Personnels',
    'Show Personal Cycles': 'Afficher les Cycles Personnels',
    'Earth Month': 'Mois de Terre',
    'Universal Cycles of Compare Date': 'Cycles Universels de la Date Comparée',
    'Matrix Calendar': 'Calendrier Matriciel',
    'Unknown Date': 'Date Inconnue',
    'Prev': 'Préc.',
    'Next': 'Suiv.',
    'Years': 'Années',
    'Months': 'Mois',
    'Days': 'Jours',
    'Energy': 'Énergie',
    'Secondary Energy': 'Énergie Secondaire',
    'Earth Year': 'Année Chinoise',
    'Sky Sign': 'Signe du Ciel',
    'Primary Earth Month': 'Mois de Terre Principal',
    'Text & Number Reduction': 'Réduction de Texte & Nombres',
    'Alphabet / Letterology': 'Alphabet / Lettrologie',
    'Number Reduction': 'Réduction de Nombres',
    'e.g., 2026, 45, 999': 'ex: 2026, 45, 999',
    'Numerology': 'Numérologie',
    'Start Date': 'Date de début',
    'Finish Date': 'Date de fin',
    'Search Filters': 'Filtres de recherche',
    'Reset Filters': 'Réinitialiser les filtres',
    'Any': 'Tous',
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('app-theme') as Theme) || 'dark';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('app-language') as Language) || 'fr';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    localStorage.setItem('app-language', language);
  }, [language]);

  const [showCompatOutlines, setShowCompatOutlinesState] = useState<boolean>(() => {
    const stored = localStorage.getItem('app-show-compat-outlines');
    return stored === null ? true : stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem('app-show-compat-outlines', showCompatOutlines.toString());
  }, [showCompatOutlines]);

  const toggleTheme = () => setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleLanguage = () => setLanguageState(prev => (prev === 'en' ? 'fr' : 'en'));
  const toggleShowCompatOutlines = () => setShowCompatOutlinesState(prev => !prev);
  const setTheme = (t: Theme) => setThemeState(t);
  const setLanguage = (l: Language) => setLanguageState(l);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ theme, language, showCompatOutlines, toggleTheme, toggleLanguage, toggleShowCompatOutlines, setTheme, setLanguage, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
