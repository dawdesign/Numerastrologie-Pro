import { Lock } from 'lucide-react';
import LockedBox from '../components/LockedBox';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateLifePath, reduceNumber, MASTER_NUMBERS, calculatePersonalCycles, calculateLuckyNumber, calculateUniversalCycles, reduceCycle, calculateAge, isLuckyDateMatch, getDayOfYear } from '../engine/numerology';
import { getEarthSign, getLunarYear, getWesternSign, WESTERN_SIGNS, getEarthMonthSign, EARTH_SIGNS, checkEarthSignCompatibility, checkWesternSignCompatibility } from '../engine/astrology';
import { COUNTRIES_FOUNDING_DATA } from '../data/countriesData';
import { CLUBS_FOUNDING_DATA } from '../data/clubsData';
import { WIKI_EARTH_SIGNS } from '../data/wikiData';
import { NUMEROLOGY_DESCRIPTIONS, EARTH_SIGN_DESCRIPTIONS } from '../engine/personalityData';
import { SKY_SIGN_DESCRIPTIONS } from '../components/WikiSkyWheel';
import { EarthSignEmoji } from '../components/ZodiacEmoji';
import { fetchWikiSearch, fetchWikiEntityDetails } from '../engine/wikiFetcher';
import type { WikiSearchResult } from '../engine/wikiFetcher';
import { useSettings } from '../context/SettingsContext';

const getOrdinal = (n: number, lang: string) => {
    if (lang === 'fr') return n + (n === 1 ? "er" : "e");
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

function getElement(lunarYear: number, t: (k: string) => string): { name: string, emoji: string } {
    const digit = ((lunarYear % 10) + 10) % 10;
    if (digit === 0 || digit === 1) return { name: t('Metal'), emoji: '🪙' };
    if (digit === 2 || digit === 3) return { name: t('Water'), emoji: '💧' };
    if (digit === 4 || digit === 5) return { name: t('Wood'), emoji: '🪵' };
    if (digit === 6 || digit === 7) return { name: t('Fire'), emoji: '🔥' };
    if (digit === 8 || digit === 9) return { name: t('Earth'), emoji: '⛰️' };
    return { name: '', emoji: '' };
}


export default function Calculator() {
    const navigate = useNavigate();
    const { t, language, showCompatOutlines } = useSettings();

    // Refs for fluid input tabbing
    const monthInputRef = useRef<HTMLInputElement>(null);
    const dayInputRef = useRef<HTMLInputElement>(null);
    const yearInputRef = useRef<HTMLInputElement>(null);

    // Current date default (stored as strings to allow empty states and padding)
    const today = new Date();
    const [month, setMonth] = useState<any>(() => {
        const stored = localStorage.getItem('profileMonth');
        return stored ? stored : String(today.getMonth() + 1).padStart(2, '0');
    });
    const [day, setDay] = useState<any>(() => {
        const stored = localStorage.getItem('profileDay');
        return stored ? stored : String(today.getDate()).padStart(2, '0');
    });
    const [year, setYear] = useState<any>(() => {
        const stored = localStorage.getItem('profileYear');
        return stored ? stored : String(today.getFullYear());
    });

    interface LatestProfile {
        name: string;
        day: string;
        month: string;
        year: string;
        isExactDateUnknown?: boolean;
        unknownDateEarthSign?: string;
        endDate?: { year: number, month: number, day: number } | null;
    }

    // Main Search state
    const [query, setQuery] = useState(() => localStorage.getItem('profileQuery') || '');
    const [results, setResults] = useState<WikiSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [endDate, setEndDate] = useState<{ year: number, month: number, day: number } | null>(() => {
        const stored = localStorage.getItem('profileEndDate');
        return stored ? JSON.parse(stored) : null;
    });
    const [isExactDateUnknown, setIsExactDateUnknown] = useState<boolean>(() => {
        const stored = localStorage.getItem('profileIsExactDateUnknown');
        return stored === 'true';
    });
    const [unknownDateEarthSign, setUnknownDateEarthSign] = useState<string>(() => {
        return localStorage.getItem('profileUnknownDateEarthSign') || '';
    });

    const [latestProfile, setLatestProfile] = useState<LatestProfile | null>(() => {
        try {
            const stored = localStorage.getItem('latestSearchedProfile');
            if (stored) return JSON.parse(stored);
            const storedName = localStorage.getItem('profileName');
            const storedDay = localStorage.getItem('profileDay');
            const storedMonth = localStorage.getItem('profileMonth');
            const storedYear = localStorage.getItem('profileYear');
            if (storedName && storedName !== 'Today' && storedName !== "Aujourd'hui" && storedDay && storedMonth && storedYear) {
                return {
                    name: storedName,
                    day: storedDay,
                    month: storedMonth,
                    year: storedYear,
                    isExactDateUnknown: localStorage.getItem('profileIsExactDateUnknown') === 'true',
                    unknownDateEarthSign: localStorage.getItem('profileUnknownDateEarthSign') || '',
                    endDate: localStorage.getItem('profileEndDate') ? JSON.parse(localStorage.getItem('profileEndDate')!) : null
                };
            }
        } catch {}
        return null;
    });

    const [isTodaySelected, setIsTodaySelected] = useState<boolean>(() => {
        return localStorage.getItem('profileIsToday') === 'true';
    });

    const isDateMatchingLatest = useMemo(() => {
        if (!latestProfile) return false;

        if (latestProfile.isExactDateUnknown) {
            if (!isExactDateUnknown) return false;
            const curY = parseInt(String(year), 10);
            const tgtY = parseInt(String(latestProfile.year), 10);
            return !isNaN(curY) && !isNaN(tgtY) && curY === tgtY;
        }

        const curD = parseInt(String(day), 10);
        const curM = parseInt(String(month), 10);
        const curY = parseInt(String(year), 10);

        const tgtD = parseInt(String(latestProfile.day), 10);
        const tgtM = parseInt(String(latestProfile.month), 10);
        const tgtY = parseInt(String(latestProfile.year), 10);

        return (
            !isNaN(curD) && !isNaN(curM) && !isNaN(curY) &&
            !isNaN(tgtD) && !isNaN(tgtM) && !isNaN(tgtY) &&
            curD === tgtD &&
            curM === tgtM &&
            curY === tgtY
        );
    }, [latestProfile, day, month, year, isExactDateUnknown]);

    const isMatchingToday = useMemo(() => {
        const curD = parseInt(String(day), 10);
        const curM = parseInt(String(month), 10);
        const curY = parseInt(String(year), 10);
        const now = new Date();
        return curD === now.getDate() && curM === (now.getMonth() + 1) && curY === now.getFullYear();
    }, [day, month, year]);

    const activeProfileName = useMemo(() => {
        if (isDateMatchingLatest && latestProfile) {
            return latestProfile.name;
        }
        if (isTodaySelected && isMatchingToday) {
            return t('Today');
        }
        return '';
    }, [isDateMatchingLatest, latestProfile, isTodaySelected, isMatchingToday, t]);

    const selectedEntityName = activeProfileName;

    const formattedTrueDate = useMemo(() => {
        const d = parseInt(String(day), 10);
        const m = parseInt(String(month), 10);
        const y = parseInt(String(year), 10);
        if (isNaN(d) || isNaN(m) || isNaN(y)) return '';

        try {
            const dt = new Date(2000, m - 1, d);
            dt.setFullYear(y);
            const str = dt.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            if (str && str !== 'Invalid Date') {
                return str;
            }
        } catch {}
        return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    }, [day, month, year, language]);

    useEffect(() => {
        if (!isDateMatchingLatest && latestProfile && query === latestProfile.name) {
            setQuery('');
        } else if (isDateMatchingLatest && latestProfile && query === '') {
            setQuery(latestProfile.name);
        }
    }, [isDateMatchingLatest, latestProfile]);

    useEffect(() => {
        if (isDateMatchingLatest && latestProfile?.endDate && !endDate) {
            setEndDate(latestProfile.endDate);
        }
    }, [isDateMatchingLatest, latestProfile]);

    useEffect(() => {
        localStorage.setItem('profileIsToday', isTodaySelected.toString());
    }, [isTodaySelected]);

    const searchRef = useRef<HTMLDivElement>(null);
    const [showResults, setShowResults] = useState(false);

    const isSearchFocused = useRef(false);
    

    const selectedEntityNameRef = useRef(selectedEntityName);
    selectedEntityNameRef.current = selectedEntityName;

    const [searchHistory, setSearchHistory] = useState<string[]>(() => {
        const saved = localStorage.getItem('wikiSearchHistory');
        return saved ? JSON.parse(saved) : [];
    });
    const [showSearchHistory, setShowSearchHistory] = useState(false);
    

    useEffect(() => {
        localStorage.setItem('wikiSearchHistory', JSON.stringify(searchHistory));
    }, [searchHistory]);

    const addToHistory = useCallback((term: string) => {
        if (!term) return;
        setSearchHistory(prev => {
            const up = [term, ...prev.filter(t => t !== term)].slice(0, 5);
            return up;
        });
    }, []);

    const handleDayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let valRaw = e.target.value.replace(/\D/g, '');
        if (valRaw.length > 2) {
            valRaw = valRaw.slice(0, 2);
        }
        setDay(valRaw);
        setEndDate(null);

        // Auto-tab to Month
        if (valRaw.length === 2 || (valRaw.length === 1 && parseInt(valRaw, 10) >= 4)) {
            monthInputRef.current?.focus();
            setTimeout(() => {
                monthInputRef.current?.select();
            }, 0);
        }
    };

    const handleMonthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let valRaw = e.target.value.replace(/\D/g, '');
        if (valRaw.length > 2) {
            valRaw = valRaw.slice(0, 2);
        }
        setMonth(valRaw);
        setEndDate(null);

        // Auto-tab to Year
        if (valRaw.length === 2 || (valRaw.length === 1 && parseInt(valRaw, 10) >= 2)) {
            yearInputRef.current?.focus();
            setTimeout(() => {
                yearInputRef.current?.select();
            }, 0);
        }
    };

    const handleYearInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let valRaw = e.target.value.replace(/[^\d-]/g, '');
        if (valRaw.indexOf('-') > 0) {
            valRaw = valRaw[0] + valRaw.slice(1).replace(/-/g, '');
        }
        const maxLen = valRaw.startsWith('-') ? 5 : 4;
        if (valRaw.length > maxLen) {
            valRaw = valRaw.slice(0, maxLen);
        }
        setYear(valRaw);
        setEndDate(null);
    };

    const handleDayInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === '/' || e.key === 'Tab') {
            e.preventDefault();
            monthInputRef.current?.focus();
            setTimeout(() => {
                monthInputRef.current?.select();
            }, 0);
        }
    };

    const handleMonthInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === '/' || e.key === 'Tab') {
            e.preventDefault();
            yearInputRef.current?.focus();
            setTimeout(() => {
                yearInputRef.current?.select();
            }, 0);
        } else if (e.key === 'Backspace' && !month) {
            e.preventDefault();
            const dayStr = day.toString();
            const nextDay = dayStr.slice(0, -1);
            setDay(nextDay);
            dayInputRef.current?.focus();
        }
    };

    const handleYearInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !year) {
            e.preventDefault();
            const monthStr = month.toString();
            const nextMonth = monthStr.slice(0, -1);
            setMonth(nextMonth);
            monthInputRef.current?.focus();
        }
    };

    const [isComparing, setIsComparing] = useState<boolean>(false);
    const [showPersonalCycles, setShowPersonalCycles] = useState(false);

    const getCompatColor = (match: string, ownVal?: number | string, otherVal?: number | string) => {
        if (match.startsWith('var(') || match.startsWith('#')) return match;

        if (ownVal !== undefined && otherVal !== undefined) {
            const ownReduced = typeof ownVal === 'string' ? parseInt(ownVal.split('/')[0], 10) : ownVal;
            const otherReduced = typeof otherVal === 'string' ? parseInt(otherVal.split('/')[0], 10) : otherVal;
            if (match === 'MS') {
                if (ownReduced === 1 && (otherReduced === 6 || otherReduced === 8)) {
                    return 'var(--accent-dark-green)';
                }
                return ''; // Neutral
            }
        }

        if (match === 'MS') {
            return '';
        }
        if (match === 'Best') return 'var(--accent-light-green)';
        if (match === 'Good' || match === 'Trine' || match === 'Friend' || match === 'Same') return 'var(--accent-dark-green)';
        if (match === 'Enem' || match === 'Bad' || match === 'Enemy') return 'var(--accent-red)';
        if (match === '50') return 'var(--accent-yellow)';
        return 'var(--text-main)';
    };

    const getCycleColor = (cycle: number | string, profileLp?: number | string) => {
        const cycleNum = typeof cycle === 'string' ? parseInt(cycle.split('/')[0], 10) : cycle;
        if (cycleNum === 11) {
            if (profileLp !== undefined) {
                const lp = typeof profileLp === 'string' ? parseInt(profileLp.split('/')[0], 10) : profileLp;
                if (lp === 1 || lp === 3 || lp === 7 || lp === 11 || lp === 22 || lp === 33) return 'var(--accent-light-green)';
                if (lp === 9) return 'var(--accent-red)';
            }
            return 'inherit';
        }
        if (cycleNum === 22) {
            if (profileLp !== undefined) {
                const lp = typeof profileLp === 'string' ? parseInt(profileLp.split('/')[0], 10) : profileLp;
                if (lp === 3 || lp === 6 || lp === 7 || lp === 8 || lp === 11 || lp === 22 || lp === 33) return 'var(--accent-light-green)';
                if (lp === 5 || lp === 9) return 'var(--accent-red)';
            }
            return 'inherit';
        }
        if (cycleNum === 7 || cycleNum === 9) return 'var(--accent-red)';
        if (cycleNum === 8) return 'var(--accent-orange, #f59e0b)';
        return 'inherit';
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
                setShowSearchHistory(false);
                isSearchFocused.current = false;
            }
            
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const performSearch = useCallback(async (searchTerm: string) => {
        if (!searchTerm || searchTerm.length < 2) {
            setResults([]);
            return;
        }

        if (searchTerm === selectedEntityNameRef.current) return;

        setLoading(true);
        setErrorMsg('');

        try {
            const searchLower = searchTerm.toLowerCase();

            // 1. Club matches (appear FIRST in search results)
            const clubMatches = CLUBS_FOUNDING_DATA.filter(club => 
                club.name.toLowerCase().includes(searchLower) || 
                (club.aliases && club.aliases.some(alias => alias.toLowerCase().includes(searchLower)))
            );

            const formattedClubMatches: WikiSearchResult[] = clubMatches.map((club, index) => {
                let dateStr = club.isExactDateUnknown 
                    ? (club.year ? club.year.toString() : '?') 
                    : `${club.month?.toString().padStart(2, '0')}-${club.day?.toString().padStart(2, '0')}-${club.year}`;
                return {
                    title: club.name,
                    pageid: -20000 - index,
                    snippet: `${club.country} • Founding date: ${dateStr} (Earth Sign: ${club.earthSign}) • ${club.origins}`,
                };
            });

            // 2. Country matches
            const countryMatches = COUNTRIES_FOUNDING_DATA.filter(country => 
                country.name.toLowerCase().includes(searchLower) || 
                (country.aliases && country.aliases.some(alias => alias.toLowerCase().includes(searchLower)))
            );

            const formattedCountryMatches: WikiSearchResult[] = countryMatches.map((country, index) => {
                let dateStr = country.isExactDateUnknown ? '?' : `${country.month?.toString().padStart(2, '0')}-${country.day?.toString().padStart(2, '0')}-${country.year}`;
                return {
                    title: country.name,
                    pageid: -10000 - index,
                    snippet: `Country founding date: ${dateStr} (Earth Sign: ${country.earthSign})`,
                };
            });

            const localMatches = [...formattedClubMatches, ...formattedCountryMatches];

            // 3. Call Wikipedia search
            const wikiData = await fetchWikiSearch(searchTerm, language);

            // Filter out any Wikipedia result that matches a local club or country
            const filteredWiki = wikiData.filter(item => 
                !clubMatches.some(cm => cm.name.toLowerCase() === item.title.toLowerCase()) &&
                !countryMatches.some(lm => lm.name.toLowerCase() === item.title.toLowerCase())
            );

            const combined = [...localMatches, ...filteredWiki];
            setResults(combined);

            if (isSearchFocused.current) {
                setShowResults(true);
            }
        } catch (err) {
            // Prepend local matches even if Wikipedia search fails
            const searchLower = searchTerm.toLowerCase();
            const clubMatches = CLUBS_FOUNDING_DATA.filter(club => 
                club.name.toLowerCase().includes(searchLower) || 
                (club.aliases && club.aliases.some(alias => alias.toLowerCase().includes(searchLower)))
            );
            const foundingLabel = language === 'fr' ? 'Date de fondation' : 'Founding date';
            const earthSignLabel = language === 'fr' ? 'Signe de Terre' : 'Earth Sign';
            const countryFoundingLabel = language === 'fr' ? 'Date de fondation du pays' : 'Country founding date';
            const formattedClubMatches: WikiSearchResult[] = clubMatches.map((club, index) => {
                let dateStr = club.isExactDateUnknown 
                    ? (club.year ? club.year.toString() : '?') 
                    : `${club.month?.toString().padStart(2, '0')}-${club.day?.toString().padStart(2, '0')}-${club.year}`;
                return {
                    title: club.name,
                    pageid: -20000 - index,
                    snippet: `${club.country} • ${foundingLabel}: ${dateStr} (${earthSignLabel}: ${t(club.earthSign)}) • ${club.origins}`,
                };
            });

            const countryMatches = COUNTRIES_FOUNDING_DATA.filter(country => 
                country.name.toLowerCase().includes(searchLower) || 
                (country.aliases && country.aliases.some(alias => alias.toLowerCase().includes(searchLower)))
            );
            const formattedCountryMatches: WikiSearchResult[] = countryMatches.map((country, index) => {
                let dateStr = country.isExactDateUnknown ? '?' : `${country.month?.toString().padStart(2, '0')}-${country.day?.toString().padStart(2, '0')}-${country.year}`;
                return {
                    title: country.name,
                    pageid: -10000 - index,
                    snippet: `${countryFoundingLabel}: ${dateStr} (${earthSignLabel}: ${t(country.earthSign)})`,
                };
            });

            const localMatches = [...formattedClubMatches, ...formattedCountryMatches];
            if (localMatches.length > 0) {
                setResults(localMatches);
                if (isSearchFocused.current) {
                    setShowResults(true);
                }
            } else {
                setErrorMsg(t('Error fetching search results from Wikipedia.'));
            }
        } finally {
            setLoading(false);
        }
    }, [t, language]);


    useEffect(() => {
        localStorage.setItem('profileMonth', month.toString());
        localStorage.setItem('profileDay', day.toString());
        localStorage.setItem('profileYear', year.toString());
        localStorage.setItem('profileQuery', query);
        localStorage.setItem('profileName', selectedEntityName);
        localStorage.setItem('profileIsExactDateUnknown', isExactDateUnknown.toString());
        localStorage.setItem('profileUnknownDateEarthSign', unknownDateEarthSign);
        if (endDate) {
            localStorage.setItem('profileEndDate', JSON.stringify(endDate));
        } else {
            localStorage.removeItem('profileEndDate');
        }
    }, [month, day, year, query, selectedEntityName, endDate, isExactDateUnknown, unknownDateEarthSign]);

    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(query);
        }, 400); // 400ms debounce
        return () => clearTimeout(timer);
    }, [query, performSearch]);

    const searchWikipedia = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSearchHistory(false);
        addToHistory(query);
        isSearchFocused.current = true;
        performSearch(query);
    };

    

    const getEntityDetails = async (title: string) => {
        setResults([]); // hide results
        setErrorMsg(language === 'fr' ? 'Chargement des détails pour ' + title + '...' : 'Loading details for ' + title + '...');

        try {
            // Check local club database first (clubs show up first and prioritized)
            const localClub = CLUBS_FOUNDING_DATA.find(c => 
                c.name.toLowerCase() === title.toLowerCase() || 
                (c.aliases && c.aliases.some(alias => alias.toLowerCase() === title.toLowerCase()))
            );

            if (localClub) {
                setErrorMsg('');
                const dayVal = localClub.isExactDateUnknown ? '' : (localClub.day ?? 1).toString().padStart(2, '0');
                const monthVal = localClub.isExactDateUnknown ? '' : (localClub.month ?? 1).toString().padStart(2, '0');
                const yearVal = localClub.year ? localClub.year.toString() : '';
                const profileData: LatestProfile = {
                    name: localClub.name,
                    day: dayVal,
                    month: monthVal,
                    year: yearVal,
                    isExactDateUnknown: Boolean(localClub.isExactDateUnknown),
                    unknownDateEarthSign: localClub.earthSign || '',
                    endDate: null
                };
                setLatestProfile(profileData);
                localStorage.setItem('latestSearchedProfile', JSON.stringify(profileData));
                setIsTodaySelected(false);
                setQuery(localClub.name);
                setShowResults(false);
                setShowSearchHistory(false);
                isSearchFocused.current = false;
                addToHistory(localClub.name);
                setEndDate(null);

                if (localClub.isExactDateUnknown) {
                    setIsExactDateUnknown(true);
                    setUnknownDateEarthSign(localClub.earthSign);
                    setYear(yearVal);
                    setMonth('');
                    setDay('');
                } else {
                    setIsExactDateUnknown(false);
                    setYear(yearVal);
                    setMonth(monthVal);
                    setDay(dayVal);
                }
                return;
            }

            // Check local country database
            const localCountry = COUNTRIES_FOUNDING_DATA.find(c => 
                c.name.toLowerCase() === title.toLowerCase() || 
                (c.aliases && c.aliases.some(alias => alias.toLowerCase() === title.toLowerCase()))
            );

            if (localCountry) {
                setErrorMsg('');
                const dayVal = localCountry.isExactDateUnknown ? '' : (localCountry.day ?? 1).toString().padStart(2, '0');
                const monthVal = localCountry.isExactDateUnknown ? '' : (localCountry.month ?? 1).toString().padStart(2, '0');
                const yearVal = localCountry.year ? localCountry.year.toString() : '';
                const profileData: LatestProfile = {
                    name: localCountry.name,
                    day: dayVal,
                    month: monthVal,
                    year: yearVal,
                    isExactDateUnknown: Boolean(localCountry.isExactDateUnknown),
                    unknownDateEarthSign: localCountry.earthSign || '',
                    endDate: null
                };
                setLatestProfile(profileData);
                localStorage.setItem('latestSearchedProfile', JSON.stringify(profileData));
                setIsTodaySelected(false);
                setQuery(localCountry.name);
                setShowResults(false);
                setShowSearchHistory(false);
                isSearchFocused.current = false;
                addToHistory(localCountry.name);
                setEndDate(null);

                if (localCountry.isExactDateUnknown) {
                    setIsExactDateUnknown(true);
                    setUnknownDateEarthSign(localCountry.earthSign);
                    setYear(yearVal);
                    setMonth('');
                    setDay('');
                } else {
                    setIsExactDateUnknown(false);
                    setYear(yearVal);
                    setMonth(monthVal);
                    setDay(dayVal);
                }
                return;
            }

            const { foundDate, foundEndDate } = await fetchWikiEntityDetails(title, language);

            if (foundDate) {
                const { year, month, day } = foundDate;
                const dayVal = day.toString().padStart(2, '0');
                const monthVal = month.toString().padStart(2, '0');
                const yearVal = year.toString();
                const profileData: LatestProfile = {
                    name: title,
                    day: dayVal,
                    month: monthVal,
                    year: yearVal,
                    isExactDateUnknown: false,
                    unknownDateEarthSign: '',
                    endDate: foundEndDate
                };
                setLatestProfile(profileData);
                localStorage.setItem('latestSearchedProfile', JSON.stringify(profileData));
                setIsTodaySelected(false);
                setYear(yearVal);
                setMonth(monthVal);
                setDay(dayVal);
                setEndDate(foundEndDate);
                setIsExactDateUnknown(false);
                setErrorMsg('');
                setQuery(title);
                setShowResults(false); // hide dropdown after selection
                setShowSearchHistory(false);
                isSearchFocused.current = false;
                addToHistory(title);
            } else {
                setErrorMsg(language === 'fr'
                    ? `Impossible de trouver automatiquement une date de naissance ou de fondation dans Wikipédia/Wikidata pour ${title}.`
                    : `Could not automatically find a birth or foundation date in Wikidata/Wikipedia for ${title}.`);
            }

        } catch (err) {
            setErrorMsg(t('Error fetching details.'));
        }
    };

    const isYearValid = typeof year === 'number' || (typeof year === 'string' && year !== '' && year !== '-');
    const isMonthValid = Boolean(month && !isNaN(parseInt(month, 10)) && parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12);
    const isDayValid = Boolean(day && !isNaN(parseInt(day, 10)) && parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31);
    const isFullDateValid = Boolean(isDayValid && isMonthValid && isYearValid);

    const isExactDateUnknownEffective = isExactDateUnknown && !isFullDateValid;

    const yNum = typeof year === 'string' ? parseInt(year, 10) : year;
    const computedEarthSignName = !isNaN(yNum)
        ? (unknownDateEarthSign || getEarthSign(yNum, 6, 1).name)
        : unknownDateEarthSign;

    const earthSignObj = isExactDateUnknownEffective && computedEarthSignName
        ? EARTH_SIGNS.find(s => s.name.toLowerCase() === computedEarthSignName.toLowerCase())
        : null;
    const earthSignWikiInfo = isExactDateUnknownEffective && computedEarthSignName
        ? (WIKI_EARTH_SIGNS[language] || WIKI_EARTH_SIGNS['en'])?.find((s: any) => s.name.toLowerCase() === computedEarthSignName.toLowerCase())
        : null;

    let reading = null;

    if (isFullDateValid) {
        const y = typeof year === 'string' ? parseInt(year, 10) : year;
        const m = typeof month === 'string' ? parseInt(month, 10) : month;
        const d = typeof day === 'string' ? parseInt(day, 10) : day;
        
        if (!isNaN(m) && !isNaN(d) && !isNaN(y)) {
            const { lifepath, unreduced, isMaster, isPure } = calculateLifePath(m, d, y);
            const earthSign = getEarthSign(y, m, d);
            const skySign = getWesternSign(m, d);

            const dayReduced = reduceNumber(d);
            const isMasterDay = MASTER_NUMBERS.includes(dayReduced);

            const dateObj = new Date();
            dateObj.setFullYear(y, m - 1, d);
            dateObj.setHours(0,0,0,0);
            
            const startObj = new Date();
            startObj.setFullYear(y, 0, 0);
            startObj.setHours(0,0,0,0);
            
            const dayOfYear = getDayOfYear(m, d, y);
            const weekOfYear = Math.ceil(dayOfYear / 7);

            const lunarYear = getLunarYear(y, m, d);
            const element = getElement(lunarYear, t);

            const skySignIndex = WESTERN_SIGNS.findIndex(s => s.name === skySign.name) + 1;
            const earthSignIndex = earthSign.id + 1;

            const luckyNumber = calculateLuckyNumber(m, d, y);

            const now = new Date();
            const personalCycles = calculatePersonalCycles(m, d, now.getMonth() + 1, now.getDate(), now.getFullYear());
            const universalCycles = calculateUniversalCycles(now.getMonth() + 1, now.getDate(), now.getFullYear());

            const currentYear = now.getFullYear();
            const lastTwoDigits = currentYear % 100;
            const isLuckyCurrentYear = lastTwoDigits === luckyNumber.base || lastTwoDigits === luckyNumber.flipped;


            // Check if today is a lucky day based on Universal Day
            const isLuckyUniversalDay = universalCycles.universalDayUnreduced === luckyNumber.base || universalCycles.universalDayUnreduced === luckyNumber.flipped;
            const isLuckyMonthDay = now.getDate() === luckyNumber.base || (luckyNumber.flipped <= 31 && now.getDate() === luckyNumber.flipped);
            const isLuckyDigitsDate = isLuckyDateMatch(now.getMonth() + 1, now.getDate(), luckyNumber);
            const todayDayOfYear = getDayOfYear(now.getMonth() + 1, now.getDate(), now.getFullYear());
            const isLuckyDayOfYear = todayDayOfYear === luckyNumber.base || todayDayOfYear === luckyNumber.flipped;

            const isLuckyToday = isLuckyUniversalDay || isLuckyMonthDay || isLuckyDigitsDate || isLuckyDayOfYear;

            // Compare to Today's values
            const todayEarthYearSign = getEarthSign(now.getFullYear(), now.getMonth() + 1, now.getDate());
            const todayEarthMonthSign = getEarthMonthSign(now.getMonth() + 1, now.getDate());
            const todaySkySign = getWesternSign(now.getMonth() + 1, now.getDate());

            let yearSignVsTodayColor = '';
            let yearSignVsTodayCompat = '';
            let skySignVsTodayColor = '';
            let skySignVsTodayCompat = '';

            const isToday = y === now.getFullYear() && m === (now.getMonth() + 1) && d === now.getDate();
            const earthMonthSignObj = getEarthMonthSign(m, d);
            const isSameEarthMonthAsToday = !isToday && earthMonthSignObj.name === todayEarthMonthSign.name;
            const isSameSkySignAsToday = !isToday && skySign.name === todaySkySign.name;

            if (!endDate && showCompatOutlines) {
                if (!isToday) {
                    const earthCompat = checkEarthSignCompatibility(earthSign, todayEarthYearSign);
                    if (earthCompat === 'Same' || earthCompat === 'Friend') {
                        const label = earthCompat === 'Friend' ? 'Trine' : 'Same';
                        yearSignVsTodayColor = getCompatColor(label);
                        yearSignVsTodayCompat = label;
                    }

                    const skyCompat = checkWesternSignCompatibility(skySign.name, todaySkySign.name);
                    if (skyCompat === 'Same' || skyCompat === 'Trine') {
                        skySignVsTodayColor = getCompatColor(skyCompat);
                        skySignVsTodayCompat = skyCompat;
                    }
                }
            }

            const isSameSkySign = isSameSkySignAsToday || (skySignVsTodayCompat === 'Same' || skySignVsTodayCompat === 'Trine');

            let endCycles = null;
            if (endDate) {
                const endEarthSign = getEarthSign(endDate.year, endDate.month, endDate.day);
                const pCycles = calculatePersonalCycles(m, d, endDate.month, endDate.day, endDate.year);

                const endYearLastTwo = endDate.year % 100;
                const isLuckyEndYear = endYearLastTwo === luckyNumber.base || endYearLastTwo === luckyNumber.flipped;

                const endPYearRaw = calculateLifePath(endDate.month, endDate.day, endDate.year).unreduced;
                const endDayOfYear = getDayOfYear(endDate.month, endDate.day, endDate.year);
                const isLuckyEndDay = endPYearRaw === luckyNumber.base || endPYearRaw === luckyNumber.flipped ||
                    endDate.day === luckyNumber.base || (luckyNumber.flipped <= 31 && endDate.day === luckyNumber.flipped) ||
                    endDayOfYear === luckyNumber.base || endDayOfYear === luckyNumber.flipped ||
                    isLuckyDateMatch(endDate.month, endDate.day, luckyNumber);

                const endUC = calculateUniversalCycles(endDate.month, endDate.day, endDate.year);

                endCycles = {
                    year: endDate.year,
                    endEarthSign,
                    uYear: endUC.universalYear,
                    uMonth: endUC.universalMonth,
                    uDay: endUC.universalDay,
                    pYear: pCycles.personalYear,
                    isLuckyEndYear,
                    isLuckyEndDay
                };
            }

            reading = {
                lifepath,
                unreduced,
                dayReduced,
                day: d,
                isMasterDay,
                isMasterLifePath: isMaster,
                isPure,
                earthSign,
                earthMonthSign: earthMonthSignObj,
                isSameEarthMonthAsToday,
                skySign,
                skySignIndex,
                isSameSkySign,
                isSameSkySignAsToday,
                skySignVsTodayColor,
                skySignVsTodayCompat,
                earthSignIndex,
                dayOfYear,
                weekOfYear,
                element,
                personalCycles,
                universalCycles,
                yearSignVsTodayColor,
                yearSignVsTodayCompat,
                currentYear,
                endCycles,
                luckyNumber,
                isLuckyCurrentYear,
                isLuckyToday,
                pinnacle: {
                    base: d + m,
                    reduced: reduceCycle(d + m)
                }
            };
        }
    }

    // Input styles removing default number spins
    const hideSpinStyles = `
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
        }
        input[type=number] {
            -moz-appearance: textfield;
        }
    `;

    return (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)', paddingBottom: 'var(--spacing-2xl)' }}>
            <style>{hideSpinStyles}</style>

            {/* Global Search integrated to the Home Page */}
            <div ref={searchRef} style={{ width: '100%', maxWidth: '700px', marginBottom: 'var(--spacing-md)' }}>
                <form onSubmit={searchWikipedia} style={{ display: 'flex', gap: 'var(--spacing-sm)', position: 'relative', width: '100%' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (e.target.value === '') setShowSearchHistory(true);
                        }}
                        onFocus={(e) => { 
                            isSearchFocused.current = true;
                            e.target.select();
                            if (results.length > 0 && query !== '') setShowResults(true); 
                            else if (searchHistory.length > 0) setShowSearchHistory(true);
                        }}
                        placeholder={t('Search for celebrities or countries...')}
                        className="input-field"
                        style={{ flex: 1, minWidth: 0, padding: 'var(--spacing-sm) clamp(10px, 3vw, 16px)', fontSize: 'clamp(0.88rem, 3.2vw, 1rem)' }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ flexShrink: 0, whiteSpace: 'nowrap', padding: 'var(--spacing-sm) clamp(14px, 4vw, 24px)', fontSize: 'clamp(0.85rem, 3vw, 0.95rem)' }}>
                        {loading ? t('Searching...') : t('Search')}
                    </button>

                    {/* Floating Dropdown for Search Results */}
                    {showResults && results.length > 0 && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                            zIndex: 100, maxHeight: '300px', overflowY: 'auto', marginTop: 'var(--spacing-xs)'
                        }}>
                            {results.map((res) => (
                                <div
                                    key={res.pageid}
                                    style={{
                                        padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => getEntityDetails(res.title)}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                                        {res.title}
                                        {res.pageid < 0 && (
                                            <span 
                                                title={res.pageid <= -20000 ? t("Verified Club Data") : t("Verified Country Data")} 
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: 'var(--accent-gold, #d4af37)',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: '14px',
                                                    height: '14px',
                                                    fontSize: '0.7rem',
                                                    lineHeight: 1,
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                ✓
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: res.snippet + '...' }} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Floating Dropdown for Search History */}
                    {showSearchHistory && searchHistory.length > 0 && (!showResults || query === '') && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
                            zIndex: 100, maxHeight: '300px', overflowY: 'auto', marginTop: 'var(--spacing-xs)'
                        }}>
                            <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-tertiary)', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>{t('Recent Searches')}</div>
                            {searchHistory.map((term) => (
                                <div
                                    key={`hist-${term}`}
                                    style={{
                                        padding: '10px 12px', borderBottom: '1px solid var(--border-color)',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                        color: 'var(--text-main)', fontSize: '0.9rem'
                                    }}
                                    onClick={() => {
                                        setQuery(term);
                                        setShowSearchHistory(false);
                                        addToHistory(term);
                                        getEntityDetails(term);
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                    <span style={{ fontSize: '1rem', opacity: 0.5 }}>🕒</span>
                                    {term}
                                </div>
                            ))}
                        </div>
                    )}
                </form>
                {errorMsg && (
                    <div style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.85rem', color: 'var(--accent-red)' }}>
                        {errorMsg}
                    </div>
                )}
            </div>

            {/* Top: Life Path Header */}
            {reading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '100%', maxWidth: '700px' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0 }}>
                        <button
                            onClick={() => {
                                const today = new Date();
                                setMonth((today.getMonth() + 1).toString().padStart(2, '0'));
                                setDay(today.getDate().toString().padStart(2, '0'));
                                setYear(today.getFullYear().toString());
                                setIsTodaySelected(true);
                                setEndDate(null);
                                setQuery('');
                                setIsExactDateUnknown(false);
                            }}
                            title={t('Reset to Today')}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                color: 'var(--text-secondary)',
                                transition: 'all 0.2s ease',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-main)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                            🔄
                        </button>
                    </div>

                    <div style={{ position: 'absolute', top: 0, right: 0 }}>
                        <button
                            onClick={() => navigate(`/calendar?pm=${month}&pd=${day}&py=${year}${selectedEntityName ? `&name=${encodeURIComponent(selectedEntityName)}` : ''}`)}
                            title={t('Export Profile to Calendar')}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                color: 'var(--text-secondary)',
                                transition: 'all 0.2s ease',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-main)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                            📅
                        </button>
                    </div>

                    <h2 style={{ fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)', padding: '0 44px', textAlign: 'center', wordBreak: 'break-word' }}>
                        {selectedEntityName || formattedTrueDate}
                    </h2>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', padding: '0 44px', maxWidth: '100%' }}>
                        <div style={{ position: 'relative', maxWidth: '100%' }}>
                            <div style={{
                                background: 'var(--bg-main)',
                                padding: 'var(--spacing-sm) clamp(14px, 4vw, var(--spacing-xl))',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                fontSize: 'clamp(1.15rem, 4.5vw, 1.5rem)',
                                boxShadow: 'var(--shadow-md)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'clamp(8px, 2vw, 12px)',
                                position: 'relative',
                                whiteSpace: 'nowrap'
                            }}>
                                <span style={{ fontWeight: 300 }}>{t('Life Path')}</span>
                                <span style={{ fontWeight: 800 }}>
                                    {reading.unreduced !== reading.lifepath && typeof reading.lifepath !== 'string' ? (
                                        <>
                                            <span style={{ color: 'var(--text-tertiary)' }}>{reading.unreduced}</span>
                                            <span style={{ color: 'var(--border-color)', margin: '0 4px', fontWeight: 300 }}>/</span>
                                            {reading.lifepath}
                                        </>
                                    ) : reading.lifepath}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isExactDateUnknownEffective && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '100%', maxWidth: '700px', marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0 }}>
                        <button
                            onClick={() => {
                                const today = new Date();
                                setMonth((today.getMonth() + 1).toString().padStart(2, '0'));
                                setDay(today.getDate().toString().padStart(2, '0'));
                                setYear(today.getFullYear().toString());
                                setIsTodaySelected(true);
                                setEndDate(null);
                                setQuery('');
                                setIsExactDateUnknown(false);
                            }}
                            title={t('Reset to Today')}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '6px 8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                color: 'var(--text-secondary)',
                                transition: 'all 0.2s ease',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-main)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                            🔄
                        </button>
                    </div>

                    <h2 style={{ fontSize: 'clamp(1.15rem, 4vw, 1.5rem)', fontWeight: 700, margin: 'var(--spacing-sm) 0 0 0', color: 'var(--text-main)', padding: '0 44px', textAlign: 'center', wordBreak: 'break-word' }}>{selectedEntityName || year}</h2>
                </div>
            )}

            {/* Middle: Date Selector Box */}
            <div className="card date-selector-card" style={{ width: '100%', maxWidth: '700px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--spacing-xl) var(--spacing-lg) 38px var(--spacing-lg)', gap: 'var(--spacing-xl)', position: 'relative' }}>
                {/* Day */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        ref={dayInputRef}
                        value={day}
                        onChange={handleDayInputChange}
                        onKeyDown={handleDayInputKeyDown}
                        onFocus={(e) => e.target.select()}
                        placeholder={isExactDateUnknownEffective && !day ? "?" : "DD"}
                        style={{
                            fontSize: 'clamp(1.6rem, 7vw, 2.5rem)',
                            color: 'var(--text-secondary)',
                            width: 'clamp(44px, 14vw, 60px)',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            textAlign: 'center',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                <div style={{ fontSize: 'clamp(1.6rem, 7vw, 2.5rem)', fontWeight: 300, color: 'var(--border-color)' }}>/</div>

                {/* Month */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        ref={monthInputRef}
                        value={month}
                        onChange={handleMonthInputChange}
                        onKeyDown={handleMonthInputKeyDown}
                        onFocus={(e) => e.target.select()}
                        placeholder={isExactDateUnknownEffective && !month ? "?" : "MM"}
                        style={{
                            fontSize: 'clamp(1.6rem, 7vw, 2.5rem)',
                            color: 'var(--text-secondary)',
                            width: 'clamp(44px, 14vw, 60px)',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            textAlign: 'center',
                            fontFamily: 'inherit'
                        }}
                    />
                    
                    {/* Absolute positioned month selector name label */}
                    <div style={{ 
                        position: 'absolute', 
                        top: '100%', 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        whiteSpace: 'nowrap', 
                        marginTop: '4px',
                        fontSize: '0.9rem', 
                        color: 'var(--text-tertiary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}>
                        {month && !isNaN(parseInt(month, 10)) ? new Date(2000, parseInt(month, 10) - 1, 1).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'long' }) : t('Unknown')}
                        <span style={{ fontSize: '0.6rem' }}>▼</span>
                        
                        <select
                            value={month && !isNaN(parseInt(month, 10)) ? parseInt(month, 10) : 1}
                            onChange={(e) => {
                                setMonth(e.target.value.padStart(2, '0'));
                                setEndDate(null);
                            }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer',
                                zIndex: 10
                            }}
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ fontSize: 'clamp(1.6rem, 7vw, 2.5rem)', fontWeight: 300, color: 'var(--border-color)' }}>/</div>

                {/* Year */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input
                        type="text"
                        inputMode="numeric"
                        ref={yearInputRef}
                        value={year}
                        onChange={handleYearInputChange}
                        onKeyDown={handleYearInputKeyDown}
                        onFocus={(e) => e.target.select()}
                        placeholder={isExactDateUnknownEffective && !year ? "?" : "YYYY"}
                        style={{
                            fontSize: 'clamp(1.6rem, 7vw, 2.5rem)',
                            color: 'var(--text-secondary)',
                            width: 'clamp(76px, 22vw, 100px)',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            textAlign: 'center',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
            </div>

            {isExactDateUnknownEffective && earthSignObj && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '700px', marginTop: 'var(--spacing-md)' }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-xl)', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
                            <div style={{ transform: 'scale(1.2)', transformOrigin: 'center' }}>
                                <EarthSignEmoji sign={earthSignObj} size={64} />
                            </div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, margin: 'var(--spacing-xs) 0', color: 'var(--text-main)' }}>
                            {t(earthSignObj.name)}
                        </div>
                        <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>
                            {t('Earth Year Sign')}
                        </div>
                        {earthSignWikiInfo && (
                            <div style={{
                                fontSize: '0.9rem',
                                color: 'var(--text-secondary)',
                                marginTop: 'var(--spacing-md)',
                                borderTop: '1px solid var(--border-color)',
                                paddingTop: 'var(--spacing-md)',
                                textAlign: 'left',
                                width: '100%',
                                lineHeight: '1.4'
                            }}>
                                {earthSignWikiInfo.desc}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bottom: 3 Cards */}
            {reading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(8px, 2vw, var(--spacing-md))', width: '100%', maxWidth: '700px' }}>

                    {/* Sky Sign Card */}
                    <div style={{ position: 'relative', minWidth: 0 }}>
                        <div className="card" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 'clamp(12px, 3vw, var(--spacing-xl)) clamp(6px, 1.5vw, var(--spacing-lg))',
                            textAlign: 'center',
                            border: (showCompatOutlines && reading.skySignVsTodayColor) ? `2px solid ${reading.skySignVsTodayColor}` : undefined,
                            transition: 'border-color 0.3s ease',
                            height: '100%'
                        }}>
                            <div style={{ fontSize: 'clamp(2rem, 6.5vw, 3rem)', lineHeight: 1, filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))', marginBottom: 'var(--spacing-sm)' }}>
                                {reading.skySign.emoji}
                            </div>
                            <div style={{ fontSize: 'clamp(0.85rem, 3.2vw, 1.5rem)', fontWeight: 500, margin: 'var(--spacing-xs) 0', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                                {t(reading.skySign.name)}
                            </div>
                            <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: 'clamp(0.65rem, 2.4vw, 0.9rem)' }}>
                                {getOrdinal(reading.skySignIndex, language)} {t('sign')}
                            </div>
                        </div>
                        {showCompatOutlines && reading.skySignVsTodayColor && (
                            <div style={{
                                position: 'absolute', top: '0', left: '50%', transform: 'translate(-50%, -50%)',
                                background: reading.skySignVsTodayColor, color: '#fff', fontSize: 'clamp(0.5rem, 2vw, 0.7rem)', padding: '2px 6px', borderRadius: '12px', fontWeight: 600,
                                whiteSpace: 'nowrap', zIndex: 10
                            }}>
                                {t(reading.skySignVsTodayCompat)}
                            </div>
                        )}
                    </div>

                    {/* Secondary Energy Card */}
                    <div style={{ position: 'relative', minWidth: 0 }}>
                        <div className="card" style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(12px, 3vw, var(--spacing-xl)) clamp(6px, 1.5vw, var(--spacing-lg))', textAlign: 'center',
                            height: '100%'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                <div style={{ fontSize: 'clamp(1.35rem, 5.5vw, 3rem)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                                    {reading.day !== reading.dayReduced ? (
                                        <>
                                            <span style={{ color: 'var(--text-tertiary)' }}>{reading.day}</span>
                                            <span style={{ color: 'var(--border-color)', margin: '0 2px', fontWeight: 300 }}>/</span>
                                            {reading.dayReduced}
                                        </>
                                    ) : reading.dayReduced}
                                </div>
                            </div>
                            <div style={{ fontSize: 'clamp(0.68rem, 2.3vw, 1.05rem)', fontWeight: 400, color: 'var(--text-secondary)', marginBottom: 'clamp(8px, 2.5vw, var(--spacing-lg))', lineHeight: 1.2 }}>
                                {t('sec. energy')}
                            </div>
                            <div style={{ fontStyle: 'italic', color: 'var(--text-tertiary)', fontSize: 'clamp(0.62rem, 2.1vw, 0.9rem)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                {(() => {
                                    const age = calculateAge({ year: Number(year), month: Number(month), day: Number(day) });
                                    return (
                                        <div style={{ color: 'var(--primary-color)', fontWeight: 600, fontStyle: 'normal', marginBottom: '2px' }}>
                                            {t('years old').replace('{age}', age.toString())}
                                        </div>
                                    );
                                })()}
                                <div>{getOrdinal(reading.dayOfYear, language)} {t('day')}</div>
                                <div>{getOrdinal(reading.weekOfYear, language)} {t('week')}</div>
                            </div>
                        </div>
                    </div>

                    {/* Earth Sign Card */}
                    <div style={{ position: 'relative', minWidth: 0 }}>
                        <div className="card" style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(12px, 3vw, var(--spacing-xl)) clamp(6px, 1.5vw, var(--spacing-lg))', textAlign: 'center',
                            border: (showCompatOutlines && reading.yearSignVsTodayColor) ? `2px solid ${reading.yearSignVsTodayColor}` : undefined,
                            transition: 'border-color 0.3s ease',
                            height: '100%'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(2px, 1vw, 6px)', marginBottom: 'var(--spacing-sm)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-6px' }}>
                                    <span style={{ fontSize: 'clamp(0.85rem, 3vw, 1.2rem)' }}>{reading.element.emoji}</span>
                                    <span style={{ fontSize: 'clamp(0.45rem, 1.8vw, 0.6rem)', textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>{t(reading.element.name)}</span>
                                </div>
                                <span style={{
                                    fontSize: 'clamp(1.9rem, 6.5vw, 3rem)',
                                    lineHeight: 1,
                                    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {reading.earthSign.emoji}
                                </span>
                            </div>
                            <div style={{ fontSize: 'clamp(0.85rem, 3.2vw, 1.5rem)', fontWeight: 500, margin: 'var(--spacing-xs) 0', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                                {t(reading.earthSign.name)}
                            </div>
                            <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: 'clamp(0.65rem, 2.4vw, 0.9rem)' }}>
                                {getOrdinal(reading.earthSignIndex, language)} {t('Earth Year Sign').toLowerCase()}
                            </div>
                        </div>
                        {showCompatOutlines && reading.yearSignVsTodayColor && (
                            <div style={{
                                position: 'absolute', top: '0', left: '50%', transform: 'translate(-50%, -50%)',
                                background: reading.yearSignVsTodayColor, color: '#fff', fontSize: 'clamp(0.5rem, 2vw, 0.7rem)', padding: '2px 6px', borderRadius: '12px', fontWeight: 600,
                                whiteSpace: 'nowrap', zIndex: 10
                            }}>
                                {t(reading.yearSignVsTodayCompat)}
                            </div>
                        )}
                    </div>



                    {/* BOTTOM 3 CARDS ROW */}
                    <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(8px, 2vw, var(--spacing-md))', marginTop: 'var(--spacing-xs)', width: '100%', maxWidth: '700px', margin: '0 auto' }}>
                        {/* Earth Month Card - Locked */}
                        <div style={{ position: 'relative', minWidth: 0 }}>
                            <div className="card" style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: 'clamp(12px, 3vw, var(--spacing-xl)) clamp(6px, 1.5vw, var(--spacing-lg))',
                                border: '1px solid var(--border-color)', minHeight: 'clamp(175px, 25vw, 210px)',
                                height: '100%', boxSizing: 'border-box'
                            }}>
                                <LockedBox size={38} />
                            </div>
                        </div>

                        {/* Lucky Number Card */}
                        <div style={{ position: 'relative', minWidth: 0 }}>
                            <div className="card" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 'clamp(12px, 3vw, var(--spacing-xl)) clamp(6px, 1.5vw, var(--spacing-lg))',
                                textAlign: 'center',
                                border: `2px dashed var(--accent-gold)`,
                                minHeight: 'clamp(175px, 25vw, 210px)',
                                height: '100%', boxSizing: 'border-box'
                            }}>
                                <div style={{ fontSize: 'clamp(0.5rem, 2vw, 0.8rem)', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 'var(--spacing-sm)', whiteSpace: 'nowrap' }}>
                                    {t('Lucky #')}
                                </div>
                                <div style={{ fontSize: 'clamp(1.2rem, 5vw, 2.8rem)', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1 }}>
                                    {reading.luckyNumber.base !== reading.luckyNumber.flipped ? (
                                        <>
                                            <span>{reading.luckyNumber.base}</span>
                                            <span style={{ fontSize: 'clamp(0.8rem, 3vw, 1.2rem)', color: 'var(--accent-gold)', opacity: 0.6, margin: '0 2px' }}>/</span>
                                            <span>{reading.luckyNumber.flipped}</span>
                                        </>
                                    ) : reading.luckyNumber.base}
                                </div>
                                <div style={{ fontStyle: 'italic', color: 'var(--text-tertiary)', fontSize: 'clamp(0.6rem, 2vw, 0.9rem)', marginTop: 'var(--spacing-sm)' }}>
                                    {t('vibration')}
                                </div>
                            </div>
                        </div>

                        {/* Pinnacle Card - Locked */}
                        <div style={{ position: 'relative', minWidth: 0 }}>
                            <div className="card" style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: 'clamp(12px, 3vw, var(--spacing-xl)) clamp(6px, 1.5vw, var(--spacing-lg))',
                                border: '1px solid var(--border-color)', minHeight: 'clamp(175px, 25vw, 210px)',
                                height: '100%', boxSizing: 'border-box'
                            }}>
                                <LockedBox size={38} />
                            </div>
                        </div>
                    </div>

                    {/* Cycles Card */}
                    <div className="card" style={{ gridColumn: '1 / -1', padding: 'clamp(16px, 4vw, var(--spacing-xl))', marginTop: 'var(--spacing-md)' }}>
                        {reading.endCycles ? (
                            <div style={{ textAlign: 'center', fontSize: '1.2rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
                                {language === 'fr' ? (
                                    <>
                                        {selectedEntityName || 'Profil'} est décédé(e) en {reading.endCycles.year}{reading.endCycles.endEarthSign?.emoji && <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '2px' }}>{reading.endCycles.endEarthSign.emoji}</span>}, une année universelle <strong>{reading.endCycles.uYear}</strong>, 
                                        un mois universel <strong>{reading.endCycles.uMonth}</strong>, 
                                        un jour universel <strong>{reading.endCycles.uDay}</strong>, 
                                        pendant une année personnelle <strong>{reading.endCycles.pYear}</strong>.
                                    </>
                                ) : (
                                    <>
                                        Died in {reading.endCycles.year}{reading.endCycles.endEarthSign?.emoji && <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '2px' }}>{reading.endCycles.endEarthSign.emoji}</span>}, a Universal <strong>{reading.endCycles.uYear}</strong> year, 
                                        Universal <strong>{reading.endCycles.uMonth}</strong> month, 
                                        and Universal <strong>{reading.endCycles.uDay}</strong> day, 
                                        while in a <strong>{reading.endCycles.pYear}</strong> personal year.
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Universal Cycles Section */}
                                <div style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', textAlign: 'center' }}>
                                        <h3 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 'clamp(0.85rem, 3vw, 1rem)', margin: 0 }}>
                                            {t('Current Universal Cycles')}
                                        </h3>
                                        {reading.isLuckyCurrentYear && (
                                            <div style={{ background: 'var(--accent-gold)', color: '#fff', fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                                                ✨ {t('Lucky Year!')}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(8px, 2.5vw, var(--spacing-lg))', textAlign: 'center' }}>
                                        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{ fontSize: 'clamp(0.68rem, 2.3vw, 0.85rem)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)', fontWeight: 600, minHeight: '2.4em', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                                {t('Universal Year')}
                                            </div>
                                            <div style={{ fontSize: 'clamp(1.6rem, 6vw, 2.5rem)', fontWeight: 800, color: 'var(--text-main)', minHeight: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {reading.universalCycles.universalYear}
                                            </div>
                                            <div style={{ fontSize: 'clamp(0.68rem, 2.2vw, 0.8rem)', color: 'var(--text-tertiary)', marginTop: '4px', minHeight: '2.4em', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'center' }}>
                                                {t('For the world in')} {reading.currentYear}
                                            </div>
                                        </div>

                                        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{ fontSize: 'clamp(0.68rem, 2.3vw, 0.85rem)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)', fontWeight: 600, minHeight: '2.4em', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                                {t('Universal Month')}
                                            </div>
                                            <div style={{ fontSize: 'clamp(1.6rem, 6vw, 2.5rem)', fontWeight: 800, color: 'var(--text-main)', minHeight: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {reading.universalCycles.universalMonth}
                                            </div>
                                            <div style={{ fontSize: 'clamp(0.68rem, 2.2vw, 0.8rem)', color: 'var(--text-tertiary)', marginTop: '4px', minHeight: '2.4em', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'center' }}>
                                                {t('For')} {new Date(2000, new Date().getMonth(), 1).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'long' })}
                                            </div>
                                        </div>

                                        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{ fontSize: 'clamp(0.68rem, 2.3vw, 0.85rem)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)', fontWeight: 600, minHeight: '2.4em', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                                {t('Universal Day')}
                                            </div>
                                            <div style={{ fontSize: 'clamp(1.6rem, 6vw, 2.5rem)', fontWeight: 800, color: 'var(--text-main)', minHeight: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {reading.universalCycles.universalDayUnreduced !== reading.universalCycles.universalDay && typeof reading.universalCycles.universalDay !== 'string' ? (
                                                    <>
                                                        <span style={{ color: 'var(--text-tertiary)' }}>{reading.universalCycles.universalDayUnreduced}</span>
                                                        <span style={{ color: 'var(--border-color)', margin: '0 4px', fontWeight: 300 }}>/</span>
                                                        {reading.universalCycles.universalDay}
                                                    </>
                                                ) : reading.universalCycles.universalDay}
                                            </div>
                                            <div style={{ fontSize: 'clamp(0.68rem, 2.2vw, 0.8rem)', color: 'var(--text-tertiary)', marginTop: '4px', minHeight: '2.4em', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'center' }}>
                                                <span>{t('For today')}</span>
                                                <span>({new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })})</span>
                                            </div>
                                            {reading.isLuckyToday && (
                                                <div style={{ marginTop: '8px', color: 'var(--accent-gold)', fontWeight: 600, fontSize: 'clamp(0.72rem, 2.3vw, 0.85rem)' }}>
                                                    ✨ {t('Lucky Day')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Cycles Section */}
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-md)' }}>
                                    <button
                                        onClick={() => setShowPersonalCycles(!showPersonalCycles)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-tertiary)',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                                    >
                                        {showPersonalCycles ? t('Hide Personal Cycles') : t('Show Personal Cycles')}
                                        <span style={{ transform: showPersonalCycles ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                                    </button>
                                </div>

                                {showPersonalCycles && (
                                    <div className="animate-fade-in" style={{ marginTop: 'var(--spacing-lg)' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(8px, 2.5vw, var(--spacing-lg))', textAlign: 'center' }}>
                                            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ fontSize: 'clamp(0.68rem, 2.3vw, 0.85rem)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)', fontWeight: 600, minHeight: '2.4em', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                                    {t('Personal Year')}
                                                </div>
                                                <div style={{ fontSize: 'clamp(1.6rem, 6vw, 2.5rem)', fontWeight: 800, color: getCycleColor(reading.personalCycles.personalYear, reading.lifepath), minHeight: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {reading.personalCycles.personalYearUnreduced !== reading.personalCycles.personalYear && typeof reading.personalCycles.personalYear !== 'string' ? (
                                                        <>
                                                            <span style={{ color: 'var(--text-tertiary)' }}>{reading.personalCycles.personalYearUnreduced}</span>
                                                            <span style={{ color: 'var(--border-color)', margin: '0 4px', fontWeight: 300 }}>/</span>
                                                            {reading.personalCycles.personalYear}
                                                        </>
                                                    ) : reading.personalCycles.personalYear}
                                                </div>
                                                <div style={{ fontSize: 'clamp(0.68rem, 2.2vw, 0.8rem)', color: 'var(--text-tertiary)', marginTop: '4px', minHeight: '2.4em', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'center' }}>
                                                    {language === 'fr' 
                                                        ? `A commencé à l'anniversaire en ${reading.personalCycles.lastBirthdayYear}` 
                                                        : `${t('Started on your')} ${reading.personalCycles.lastBirthdayYear} ${t('birthday')}`}
                                                </div>
                                            </div>

                                            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ fontSize: 'clamp(0.68rem, 2.3vw, 0.85rem)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)', fontWeight: 600, minHeight: '2.4em', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                                    {t('Personal Month')}
                                                </div>
                                                <div style={{ fontSize: 'clamp(1.6rem, 6vw, 2.5rem)', fontWeight: 800, color: getCycleColor(reading.personalCycles.personalMonth, reading.lifepath), minHeight: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {reading.personalCycles.personalMonth}
                                                </div>
                                                <div style={{ fontSize: 'clamp(0.68rem, 2.2vw, 0.8rem)', color: 'var(--text-tertiary)', marginTop: '4px', minHeight: '2.4em', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', textAlign: 'center' }}>
                                                    {language === 'fr' 
                                                        ? `Basé sur le cycle ${new Date(2000, reading.personalCycles.effectiveMonth - 1, 1).toLocaleString('fr-FR', { month: 'long' })}` 
                                                        : `${t('Based on')} ${new Date(2000, reading.personalCycles.effectiveMonth - 1, 1).toLocaleString('en-US', { month: 'long' })} ${t('cycle')}`}
                                                </div>
                                            </div>

                                            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ fontSize: 'clamp(0.68rem, 2.3vw, 0.85rem)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)', fontWeight: 600, minHeight: '2.4em', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                                    {t('Personal Day')}
                                                </div>
                                                <div style={{ fontSize: 'clamp(1.6rem, 6vw, 2.5rem)', fontWeight: 800, color: getCycleColor(reading.personalCycles.personalDay, reading.lifepath), minHeight: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {reading.personalCycles.personalDay}
                                                </div>
                                                <div style={{ fontSize: 'clamp(0.68rem, 2.2vw, 0.8rem)', color: 'var(--text-tertiary)', marginTop: '4px', minHeight: '2.4em', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'center' }}>
                                                    <span>{t('For today')}</span>
                                                    <span>({new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })})</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Compatibility Section - Locked in free version */}
                    <div className="card" style={{ gridColumn: '1 / -1', padding: 'clamp(12px, 3vw, var(--spacing-xl))', marginTop: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isComparing ? 'var(--spacing-lg)' : 0 }}>
                            <h3 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {t('Check Compatibility')}
                            </h3>
                            <button
                                onClick={() => setIsComparing(!isComparing)}
                                className="btn btn-primary"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.8rem', background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                            >
                                <Lock size={13} style={{ color: 'var(--text-tertiary)' }} />
                                {isComparing ? t('Close') : t('Compare Match')}
                            </button>
                        </div>

                        {isComparing && (
                            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-xl) var(--spacing-md)', minHeight: '140px', borderTop: '1px solid var(--border-color)', marginTop: 'var(--spacing-md)' }}>
                                <LockedBox size={36} />
                            </div>
                        )}
                    </div>

                    {/* Personality Profile Section */}
                    <div className="card" style={{ gridColumn: '1 / -1', padding: 'clamp(14px, 3.5vw, var(--spacing-xl))', marginTop: 'var(--spacing-md)' }}>
                        <h3 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '1.1rem', margin: '0 0 var(--spacing-lg) 0', textAlign: 'center' }}>
                            {t('Personality Profile')}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 'var(--spacing-lg)' }}>
                            
                            {/* Life Path Traits */}
                            <div style={{ background: 'var(--bg-main)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginTop: 0, marginBottom: 'var(--spacing-md)' }}>
                                    {t('Life Path')} {reading.unreduced !== reading.lifepath && typeof reading.lifepath !== 'string' ? `${reading.unreduced}/${reading.lifepath}` : reading.lifepath}
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {typeof reading.lifepath === 'string' && reading.lifepath.includes('/') ? (
                                        (() => {
                                            const parts = reading.lifepath.split('/');
                                            const masterTraits = NUMEROLOGY_DESCRIPTIONS[language][parseInt(parts[0])] || [];
                                            const baseTraits = NUMEROLOGY_DESCRIPTIONS[language][parseInt(parts[1])] || [];
                                            const traits: {text: string, source: string}[] = [];
                                            const maxLength = Math.max(masterTraits.length, baseTraits.length);
                                            for (let i = 0; i < maxLength; i++) {
                                                if (masterTraits[i]) traits.push({ text: masterTraits[i], source: parts[0] });
                                                if (baseTraits[i]) traits.push({ text: baseTraits[i], source: parts[1] });
                                            }
                                            return traits.map((trait, i) => (
                                                <li key={i}>
                                                    {trait.text}
                                                    <span style={{ opacity: 0.5, fontSize: '0.8em', marginLeft: '6px' }}>({language === 'fr' ? 'Énergie' : 'Energy'} {trait.source})</span>
                                                </li>
                                            ));
                                        })()
                                    ) : (
                                        NUMEROLOGY_DESCRIPTIONS[language][reading.lifepath as number]?.map((trait, i) => (
                                            <li key={i}>{trait}</li>
                                        ))
                                    )}
                                </ul>
                            </div>

                            {/* Secondary Energy (Day) Traits */}
                            <div style={{ background: 'var(--bg-main)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginTop: 0, marginBottom: 'var(--spacing-xs)' }}>
                                    {t('sec. energy').charAt(0).toUpperCase() + t('sec. energy').slice(1)} {reading.day !== reading.dayReduced ? `${reading.day}/${reading.dayReduced}` : reading.dayReduced}
                                </h4>

                                <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {NUMEROLOGY_DESCRIPTIONS[language][reading.dayReduced as number]?.map((trait, i) => (
                                        <li key={i}>{trait}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Earth Sign Traits */}
                            <div style={{ background: 'var(--bg-main)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginTop: 0, marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {t(reading.earthSign.name)} ({t('Year')}) <span style={{ fontSize: '1.2rem' }}>{reading.earthSign.emoji}</span>
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {EARTH_SIGN_DESCRIPTIONS[language][reading.earthSign.id]?.map((trait, i) => (
                                        <li key={`earth-${i}`}>{trait}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Sky Sign Traits */}
                            <div style={{ background: 'var(--bg-main)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginTop: 0, marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {t(reading.skySign.name)} ({t('Sky Sign')}) <span style={{ fontSize: '1.2rem' }}>{reading.skySign.emoji}</span>
                                </h4>
                                <ul style={{ margin: 0, paddingLeft: 'var(--spacing-lg)', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {SKY_SIGN_DESCRIPTIONS[language][reading.skySign.name]?.map((trait, i) => (
                                        <li key={`sky-${i}`}>{trait}</li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    </div>

                </div>
            )}


        </div>
    );
}
