import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { calculateLifePath, reduceNumber, MASTER_NUMBERS } from '../engine/numerology';
import { getEarthSign, getEarthMonthSign, getWesternSign, EARTH_SIGNS, WESTERN_SIGNS } from '../engine/astrology';
import { EarthSignEmoji, SkySignEmoji } from '../components/ZodiacEmoji';
import { useSettings } from '../context/SettingsContext';

type DateResult = {
    dateObj: Date;
    dateStr: string;
    lifepath: number | string;
    unreduced: number;
    dayReduced: number;
    day: number;
    earthSign: typeof EARTH_SIGNS[0];
    earthMonthSign: typeof EARTH_SIGNS[0];
    skySign: typeof WESTERN_SIGNS[0];
};

interface FilterOption {
    id: string | number;
    label: string;
    emoji?: string;
}

type ModalType = 'lifepath' | 'secondary' | 'earthYear' | 'earthMonth' | 'skySign' | null;

export default function Equation() {
    const { t, language } = useSettings();

    // Default dates: start date filled with current date, finish date set to 1 year ahead
    const today = new Date();
    const [startDay, setStartDay] = useState<string>(() => today.getDate().toString());
    const [startMonth, setStartMonth] = useState<string>(() => (today.getMonth() + 1).toString());
    const [startYear, setStartYear] = useState<string>(() => today.getFullYear().toString());

    const [endDay, setEndDay] = useState<string>(() => today.getDate().toString());
    const [endMonth, setEndMonth] = useState<string>(() => (today.getMonth() + 1).toString());
    const [endYear, setEndYear] = useState<string>(() => (today.getFullYear() + 1).toString());

    const [dateError, setDateError] = useState('');

    // Multi-select search filters
    const [selectedLifePaths, setSelectedLifePaths] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem('eqSelectedLifePaths');
            if (stored) return JSON.parse(stored);
            const oldSingle = localStorage.getItem('eqTargetLifePath');
            return oldSingle ? [oldSingle] : [];
        } catch {
            return [];
        }
    });

    const [selectedSecondaryEnergies, setSelectedSecondaryEnergies] = useState<number[]>(() => {
        try {
            const stored = localStorage.getItem('eqSelectedSecondaryEnergies');
            if (stored) return JSON.parse(stored);
            const oldSingle = localStorage.getItem('eqTargetSecondaryEnergy') || localStorage.getItem('eqTargetDay');
            return oldSingle ? [parseInt(oldSingle, 10)] : [];
        } catch {
            return [];
        }
    });

    const [selectedEarthYears, setSelectedEarthYears] = useState<number[]>(() => {
        try {
            const stored = localStorage.getItem('eqSelectedEarthYears');
            if (stored) return JSON.parse(stored);
            const oldSingle = localStorage.getItem('eqTargetEarthYear') || localStorage.getItem('eqTargetEarthSign');
            return oldSingle !== null && oldSingle !== '' ? [parseInt(oldSingle, 10)] : [];
        } catch {
            return [];
        }
    });

    const [selectedEarthMonths, setSelectedEarthMonths] = useState<number[]>(() => {
        try {
            const stored = localStorage.getItem('eqSelectedEarthMonths');
            if (stored) return JSON.parse(stored);
            const oldSingle = localStorage.getItem('eqTargetEarthMonth');
            return oldSingle !== null && oldSingle !== '' ? [parseInt(oldSingle, 10)] : [];
        } catch {
            return [];
        }
    });

    const [selectedSkySigns, setSelectedSkySigns] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem('eqSelectedSkySigns');
            if (stored) return JSON.parse(stored);
            const oldSingle = localStorage.getItem('eqTargetSkySign');
            return oldSingle ? [oldSingle] : [];
        } catch {
            return [];
        }
    });

    // Centralized Modal State
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const [results, setResults] = useState<DateResult[]>([]);
    const [searched, setSearched] = useState(false);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('eqSelectedLifePaths', JSON.stringify(selectedLifePaths));
        localStorage.setItem('eqSelectedSecondaryEnergies', JSON.stringify(selectedSecondaryEnergies));
        localStorage.setItem('eqSelectedEarthYears', JSON.stringify(selectedEarthYears));
        localStorage.setItem('eqSelectedEarthMonths', JSON.stringify(selectedEarthMonths));
        localStorage.setItem('eqSelectedSkySigns', JSON.stringify(selectedSkySigns));
    }, [selectedLifePaths, selectedSecondaryEnergies, selectedEarthYears, selectedEarthMonths, selectedSkySigns]);

    // Lock body scroll when any filter modal is open, and handle Escape key
    useEffect(() => {
        if (!activeModal) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActiveModal(null);
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeModal]);

    const resetStartDateToToday = () => {
        const now = new Date();
        setStartDay(now.getDate().toString());
        setStartMonth((now.getMonth() + 1).toString());
        setStartYear(now.getFullYear().toString());
    };

    const resetAllFilters = () => {
        setSelectedLifePaths([]);
        setSelectedSecondaryEnergies([]);
        setSelectedEarthYears([]);
        setSelectedEarthMonths([]);
        setSelectedSkySigns([]);
    };

    const totalFiltersActive = 
        selectedLifePaths.length + 
        selectedSecondaryEnergies.length + 
        selectedEarthYears.length + 
        selectedEarthMonths.length + 
        selectedSkySigns.length;

    // Filter Options Definitions
    const lifepathOptions: FilterOption[] = [
        { id: '1', label: '1' },
        { id: '3', label: '3' },
        { id: '4', label: '4' },
        { id: '5', label: '5' },
        { id: '6', label: '6' },
        { id: '7', label: '7' },
        { id: '8', label: '8' },
        { id: '9', label: '9' },
        { id: '11', label: '11' },
        { id: '13', label: '13 (13/4)' },
        { id: '22', label: '22' },
        { id: '24', label: '24 (24/6)' },
        { id: '28', label: '28 (28/1)' },
        { id: '31', label: '31 (31/4)' },
        { id: '33', label: '33' },
    ];

    const secondaryEnergyOptions: FilterOption[] = Array.from({ length: 31 }, (_, i) => ({
        id: i + 1,
        label: (i + 1).toString()
    }));

    const earthYearOptions: FilterOption[] = EARTH_SIGNS.map(sign => ({
        id: sign.id,
        label: t(sign.name),
        emoji: sign.emoji
    }));

    const earthMonthOptions: FilterOption[] = EARTH_SIGNS.map(sign => ({
        id: sign.id,
        label: t(sign.name),
        emoji: sign.emoji
    }));

    const skySignOptions: FilterOption[] = WESTERN_SIGNS.map(sign => ({
        id: sign.name,
        label: t(sign.name),
        emoji: sign.emoji
    }));

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveModal(null);
        setSearched(true);
        setResults([]);
        setDateError('');

        // Year is required on both sides; Day and Month are optional
        const sYStr = startYear.trim();
        const eYStr = endYear.trim();

        if (!sYStr || !eYStr) {
            setDateError(
                language === 'fr' 
                    ? 'Veuillez au minimum renseigner les années de début et de fin.' 
                    : 'Please at least enter the start and finish years.'
            );
            return;
        }

        const sY = parseInt(sYStr, 10);
        const eY = parseInt(eYStr, 10);

        if (isNaN(sY) || isNaN(eY)) {
            setDateError(
                language === 'fr' 
                    ? 'Veuillez entrer une année valide (ex: 2024).' 
                    : 'Please enter valid years (e.g., 2024).'
            );
            return;
        }

        // Helper to get days in month supporting leap years and negative/BC years
        const getDaysInMonth = (y: number, m: number): number => {
            if (m === 2) {
                const isLeap = ((y % 4) + 4) % 4 === 0 && (((y % 100) + 100) % 100 !== 0 || ((y % 400) + 400) % 400 === 0);
                return isLeap ? 29 : 28;
            }
            if ([4, 6, 9, 11].includes(m)) return 30;
            return 31;
        };

        // Parse start month/day or default to full range
        const sMStr = startMonth.trim();
        const sDStr = startDay.trim();
        let sM = sMStr ? parseInt(sMStr, 10) : 1;
        if (sMStr && (isNaN(sM) || sM < 1 || sM > 12)) {
            setDateError(language === 'fr' ? 'Le mois de début doit être compris entre 1 et 12.' : 'Start month must be between 1 and 12.');
            return;
        }
        let sD = sDStr ? parseInt(sDStr, 10) : 1;
        if (sDStr && (isNaN(sD) || sD < 1 || sD > 31)) {
            setDateError(language === 'fr' ? 'Le jour de début doit être compris entre 1 et 31.' : 'Start day must be between 1 and 31.');
            return;
        }

        // Parse finish month/day or default to end of period
        const eMStr = endMonth.trim();
        const eDStr = endDay.trim();
        let eM = eMStr ? parseInt(eMStr, 10) : 12;
        if (eMStr && (isNaN(eM) || eM < 1 || eM > 12)) {
            setDateError(language === 'fr' ? 'Le mois de fin doit être compris entre 1 et 12.' : 'Finish month must be between 1 and 12.');
            return;
        }
        let eD = eDStr ? parseInt(eDStr, 10) : getDaysInMonth(eY, eM);
        if (eDStr && (isNaN(eD) || eD < 1 || eD > 31)) {
            setDateError(language === 'fr' ? 'Le jour de fin doit être compris entre 1 et 31.' : 'Finish day must be between 1 and 31.');
            return;
        }

        let startY = sY, startM = sM, startD = Math.min(sD, getDaysInMonth(sY, sM));
        let endYVal = eY, endMVal = eM, endDVal = Math.min(eD, getDaysInMonth(eY, eM));

        // Sort chronologically if user entered start > finish
        const isAfter = (y1: number, m1: number, d1: number, y2: number, m2: number, d2: number) => {
            if (y1 !== y2) return y1 > y2;
            if (m1 !== m2) return m1 > m2;
            return d1 > d2;
        };

        if (isAfter(startY, startM, startD, endYVal, endMVal, endDVal)) {
            [startY, endYVal] = [endYVal, startY];
            [startM, endMVal] = [endMVal, startM];
            [startD, endDVal] = [endDVal, startD];
        }

        // Cap range to max 100 years per search to ensure high performance
        const maxRange = 100;
        if (endYVal - startY > maxRange) {
            endYVal = startY + maxRange;
            setDateError(language === 'fr' ? `Plage limitée à 100 ans (${startY} à ${endYVal}) pour les performances.` : `Range limited to 100 years (${startY} to ${endYVal}) for performance.`);
        }

        const matches: DateResult[] = [];
        const maxMatches = 250;

        for (let y = startY; y <= endYVal; y++) {
            const mStart = (y === startY) ? startM : 1;
            const mEnd = (y === endYVal) ? endMVal : 12;

            for (let m = mStart; m <= mEnd; m++) {
                const maxD = getDaysInMonth(y, m);
                const dStart = (y === startY && m === startM) ? startD : 1;
                const dEnd = (y === endYVal && m === endMVal) ? Math.min(endDVal, maxD) : maxD;

                for (let d = dStart; d <= dEnd; d++) {
                    let isValid = true;

                    const { lifepath, lifepathNumber, unreduced } = calculateLifePath(m, d, y);
                    const dayReduced = reduceNumber(d);
                    const earthSign = getEarthSign(y, m, d);
                    const earthMonthSign = getEarthMonthSign(m, d);
                    const skySign = getWesternSign(m, d);

                    // 1. Life Path Filter (Multi-select)
                    if (selectedLifePaths.length > 0) {
                        const matchLp = selectedLifePaths.some(lpStr => {
                            const val = parseInt(lpStr, 10);
                            if ([13, 24, 28, 31].includes(val)) {
                                return unreduced === val;
                            } else {
                                return lifepathNumber === val;
                            }
                        });
                        if (!matchLp) isValid = false;
                    }

                    // 2. Secondary Energy Filter (Multi-select 1-31)
                    if (selectedSecondaryEnergies.length > 0) {
                        if (!selectedSecondaryEnergies.includes(d)) {
                            isValid = false;
                        }
                    }

                    // 3. Earth Year Filter (Multi-select)
                    if (selectedEarthYears.length > 0) {
                        if (!selectedEarthYears.includes(earthSign.id)) {
                            isValid = false;
                        }
                    }

                    // 4. Earth Month Filter (Multi-select)
                    if (selectedEarthMonths.length > 0) {
                        if (!selectedEarthMonths.includes(earthMonthSign.id)) {
                            isValid = false;
                        }
                    }

                    // 5. Sky Sign Filter (Multi-select)
                    if (selectedSkySigns.length > 0) {
                        if (!selectedSkySigns.includes(skySign.name)) {
                            isValid = false;
                        }
                    }

                    if (isValid) {
                        const dateInstance = new Date(2000, m - 1, d);
                        try {
                            dateInstance.setFullYear(y);
                        } catch {
                            // Fallback for extreme dates
                        }

                        matches.push({
                            dateObj: dateInstance,
                            dateStr: language === 'fr'
                                ? `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`
                                : `${m.toString().padStart(2, '0')}/${d.toString().padStart(2, '0')}/${y}`,
                            lifepath,
                            unreduced,
                            dayReduced,
                            day: d,
                            earthSign,
                            earthMonthSign,
                            skySign
                        });

                        if (matches.length >= maxMatches) break;
                    }
                }
                if (matches.length >= maxMatches) break;
            }
            if (matches.length >= maxMatches) break;
        }

        setResults(matches);
    };

    // Helper to render a trigger box on the page
    const renderFilterBox = (
        title: string,
        modalKey: ModalType,
        selectedIds: (string | number)[],
        optionsList: FilterOption[],
        onClear: () => void,
        onRemoveItem: (id: string | number) => void
    ) => {
        const isSelected = selectedIds.length > 0;

        return (
            <div style={{ position: 'relative' }}>
                <label style={{ 
                    fontWeight: 600, 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.8rem', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.04em', 
                    marginBottom: '6px', 
                    display: 'block' 
                }}>
                    {title} {isSelected ? `(${selectedIds.length})` : ''}
                </label>

                <div
                    onClick={() => setActiveModal(modalKey)}
                    style={{
                        background: 'var(--bg-secondary)',
                        border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 12px',
                        minHeight: '48px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxShadow: isSelected ? '0 0 8px rgba(212, 175, 55, 0.15)' : 'none'
                    }}
                >
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', flex: 1, alignItems: 'center' }}>
                        {!isSelected ? (
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                                {language === 'fr' ? 'Tous (aucun filtre)' : 'All (no filter)'}
                            </span>
                        ) : (
                            selectedIds.map(id => {
                                const opt = optionsList.find(o => o.id === id);
                                if (!opt) return null;
                                return (
                                    <span
                                        key={id}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            background: 'var(--bg-main)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-sm)',
                                            padding: '2px 8px',
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                            color: 'var(--text-main)',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        {opt.emoji && <span>{opt.emoji}</span>}
                                        <span>{opt.label}</span>
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveItem(id);
                                            }}
                                            title={language === 'fr' ? 'Retirer' : 'Remove'}
                                            style={{
                                                cursor: 'pointer',
                                                color: 'var(--text-tertiary)',
                                                marginLeft: '3px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700
                                            }}
                                        >
                                            ✕
                                        </span>
                                    </span>
                                );
                            })
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        {isSelected && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClear();
                                }}
                                title={language === 'fr' ? 'Tout effacer' : 'Clear all'}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-tertiary)',
                                    cursor: 'pointer',
                                    padding: '2px 4px',
                                    fontSize: '0.8rem'
                                }}
                            >
                                ✕
                            </button>
                        )}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>▼</span>
                    </div>
                </div>
            </div>
        );
    };

    // Helper to get active modal configuration
    const getActiveModalConfig = () => {
        if (!activeModal) return null;
        switch (activeModal) {
            case 'lifepath':
                return {
                    title: t('Life Path'),
                    options: lifepathOptions,
                    selected: selectedLifePaths,
                    onChange: (sel: (string | number)[]) => setSelectedLifePaths(sel as string[]),
                    gridColumns: 3
                };
            case 'secondary':
                return {
                    title: t('Secondary Energy'),
                    options: secondaryEnergyOptions,
                    selected: selectedSecondaryEnergies,
                    onChange: (sel: (string | number)[]) => setSelectedSecondaryEnergies(sel as number[]),
                    gridColumns: 6
                };
            case 'earthYear':
                return {
                    title: t('Earth Year'),
                    options: earthYearOptions,
                    selected: selectedEarthYears,
                    onChange: (sel: (string | number)[]) => setSelectedEarthYears(sel as number[]),
                    gridColumns: 2
                };
            case 'earthMonth':
                return {
                    title: t('Earth Month'),
                    options: earthMonthOptions,
                    selected: selectedEarthMonths,
                    onChange: (sel: (string | number)[]) => setSelectedEarthMonths(sel as number[]),
                    gridColumns: 2
                };
            case 'skySign':
                return {
                    title: t('Sky Sign'),
                    options: skySignOptions,
                    selected: selectedSkySigns,
                    onChange: (sel: (string | number)[]) => setSelectedSkySigns(sel as string[]),
                    gridColumns: 2
                };
        }
    };

    const modalConfig = getActiveModalConfig();

    return (
        <div className="animate-fade-in" style={{ maxWidth: '940px', margin: '0 auto', padding: '0 var(--spacing-md) var(--spacing-2xl)' }}>
            
            {/* Header section with esoteric aesthetic */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)', position: 'relative' }}>
                <h1 style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 800, 
                    letterSpacing: '-0.03em', 
                    background: 'linear-gradient(135deg, var(--text-main) 30%, var(--accent-gold) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 'var(--spacing-xs)'
                }}>
                    {t('Date Finder & Equation')}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '560px', margin: '0 auto' }}>
                    {language === 'en'
                        ? 'Find specific dates matching exact Numerology (Lifepath, Secondary Energy) and Astrology (Chinese Year, Earth Month, Sky Sign) filters within a designated timeframe.'
                        : 'Trouvez des dates spécifiques selon les filtres précis de Numérologie (Chemin de vie, Énergie secondaire) et d\'Astrologie (Année chinoise, Mois de terre, Signe du ciel).'
                    }
                </p>
                <div style={{ 
                    width: '60px', 
                    height: '3px', 
                    background: 'linear-gradient(90deg, var(--accent-gold), var(--accent-purple))', 
                    margin: 'var(--spacing-md) auto 0',
                    borderRadius: 'var(--radius-full)'
                }} />
            </div>

            {/* Parameters Form Card */}
            <div className="card" style={{ 
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                background: 'var(--bg-main)',
                overflow: 'visible',
                position: 'relative',
                marginBottom: 'var(--spacing-2xl)'
            }}>


                <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>
                    
                    {/* SECTION 1: Date Range Selection */}
                    <div>
                        <div style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: 700, 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.08em', 
                            color: 'var(--accent-gold)', 
                            marginBottom: 'var(--spacing-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span>📅</span>
                            <span>{language === 'fr' ? 'Période de Recherche' : 'Search Date Range'}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-lg)' }}>
                            
                            {/* Start Date Box */}
                            <div style={{ 
                                background: 'var(--bg-secondary)', 
                                padding: 'var(--spacing-md)', 
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)' 
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                        {t('Start Date')}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={resetStartDateToToday}
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-sm)',
                                            padding: '2px 8px',
                                            fontSize: '0.75rem',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                        title={language === 'fr' ? 'Remplir avec la date du jour' : 'Set to current date'}
                                    >
                                        <span>🔄</span> {language === 'fr' ? "Aujourd'hui" : 'Today'}
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                            {t('Day')}
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={startDay}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (v === '' || /^\d{1,2}$/.test(v)) setStartDay(v);
                                            }}
                                            onFocus={e => e.target.select()}
                                            placeholder="JJ"
                                            className="input-field"
                                            style={{ width: '100%', padding: '8px 10px', textAlign: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                            {t('Month')}
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={startMonth}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (v === '' || /^\d{1,2}$/.test(v)) setStartMonth(v);
                                            }}
                                            onFocus={e => e.target.select()}
                                            placeholder="MM"
                                            className="input-field"
                                            style={{ width: '100%', padding: '8px 10px', textAlign: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1.5 }}>
                                        <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                            {t('Year')}
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={startYear}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (v === '' || v === '-' || /^-?\d*$/.test(v)) setStartYear(v);
                                            }}
                                            onFocus={e => e.target.select()}
                                            placeholder="AAAA"
                                            className="input-field"
                                            style={{ width: '100%', padding: '8px 10px', textAlign: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Finish Date Box */}
                            <div style={{ 
                                background: 'var(--bg-secondary)', 
                                padding: 'var(--spacing-md)', 
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)' 
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                        {t('Finish Date')}
                                    </label>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                            {t('Day')}
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={endDay}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (v === '' || /^\d{1,2}$/.test(v)) setEndDay(v);
                                            }}
                                            onFocus={e => e.target.select()}
                                            placeholder="JJ"
                                            className="input-field"
                                            style={{ width: '100%', padding: '8px 10px', textAlign: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                            {t('Month')}
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={endMonth}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (v === '' || /^\d{1,2}$/.test(v)) setEndMonth(v);
                                            }}
                                            onFocus={e => e.target.select()}
                                            placeholder="MM"
                                            className="input-field"
                                            style={{ width: '100%', padding: '8px 10px', textAlign: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1.5 }}>
                                        <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                            {t('Year')}
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={endYear}
                                            onChange={e => {
                                                const v = e.target.value;
                                                if (v === '' || v === '-' || /^-?\d*$/.test(v)) setEndYear(v);
                                            }}
                                            onFocus={e => e.target.select()}
                                            placeholder="AAAA"
                                            className="input-field"
                                            style={{ width: '100%', padding: '8px 10px', textAlign: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {dateError && (
                        <div style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: 'var(--accent-red, #ef4444)',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}>
                            {dateError}
                        </div>
                    )}

                    {/* SECTION 2: Search Filters with Mixing Board Icon */}
                    <div>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginBottom: 'var(--spacing-md)' 
                        }}>
                            <div style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                {/* Equalizer / Mixing board Icon */}
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(168,85,247,0.2))',
                                    border: '1px solid rgba(212,175,55,0.3)',
                                    color: 'var(--accent-gold)'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="4" y1="21" x2="4" y2="14"></line>
                                        <line x1="4" y1="10" x2="4" y2="3"></line>
                                        <line x1="12" y1="21" x2="12" y2="12"></line>
                                        <line x1="12" y1="8" x2="12" y2="3"></line>
                                        <line x1="20" y1="21" x2="20" y2="16"></line>
                                        <line x1="20" y1="12" x2="20" y2="3"></line>
                                        <line x1="1" y1="14" x2="7" y2="14"></line>
                                        <line x1="9" y1="8" x2="15" y2="8"></line>
                                        <line x1="17" y1="16" x2="23" y2="16"></line>
                                    </svg>
                                </span>
                                <h2 style={{ 
                                    fontSize: '1.05rem', 
                                    fontWeight: 800, 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '0.06em', 
                                    color: 'var(--text-main)',
                                    margin: 0
                                }}>
                                    {t('Search Filters')}
                                </h2>
                            </div>

                            {totalFiltersActive > 0 && (
                                <button
                                    type="button"
                                    onClick={resetAllFilters}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--accent-gold)',
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <span>✕</span> {t('Reset Filters')} ({totalFiltersActive})
                                </button>
                            )}
                        </div>

                        {/* Interactive Multi-Select Filter Boxes */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--spacing-md)' }}>
                            
                            {/* 1. Life Path Box */}
                            {renderFilterBox(
                                t('Life Path'),
                                'lifepath',
                                selectedLifePaths,
                                lifepathOptions,
                                () => setSelectedLifePaths([]),
                                (id) => setSelectedLifePaths(selectedLifePaths.filter(x => x !== id))
                            )}

                            {/* 2. Secondary Energy Box */}
                            {renderFilterBox(
                                t('Secondary Energy'),
                                'secondary',
                                selectedSecondaryEnergies,
                                secondaryEnergyOptions,
                                () => setSelectedSecondaryEnergies([]),
                                (id) => setSelectedSecondaryEnergies(selectedSecondaryEnergies.filter(x => x !== id))
                            )}

                            {/* 3. Earth Year Box */}
                            {renderFilterBox(
                                t('Earth Year'),
                                'earthYear',
                                selectedEarthYears,
                                earthYearOptions,
                                () => setSelectedEarthYears([]),
                                (id) => setSelectedEarthYears(selectedEarthYears.filter(x => x !== id))
                            )}

                            {/* 4. Earth Month Box */}
                            {renderFilterBox(
                                t('Earth Month'),
                                'earthMonth',
                                selectedEarthMonths,
                                earthMonthOptions,
                                () => setSelectedEarthMonths([]),
                                (id) => setSelectedEarthMonths(selectedEarthMonths.filter(x => x !== id))
                            )}

                            {/* 5. Sky Sign Box */}
                            {renderFilterBox(
                                t('Sky Sign'),
                                'skySign',
                                selectedSkySigns,
                                skySignOptions,
                                () => setSelectedSkySigns([]),
                                (id) => setSelectedSkySigns(selectedSkySigns.filter(x => x !== id))
                            )}

                        </div>
                    </div>

                    {/* Search Submit Button */}
                    <button 
                        type="submit" 
                        style={{ 
                            alignSelf: 'center', 
                            minWidth: '260px',
                            padding: '12px 30px',
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: '#111111',
                            background: '#ffffff',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-full)',
                            boxShadow: 'var(--shadow-md)',
                            transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
                            cursor: 'pointer',
                            marginTop: 'var(--spacing-xs)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            e.currentTarget.style.background = '#f9f9f9';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            e.currentTarget.style.background = '#ffffff';
                        }}
                    >
                        <span>🔍</span>
                        <span>{t('Search Calendar')}</span>
                    </button>
                </form>
            </div>

            {/* Centralized Filter Modal rendered directly into document.body */}
            {modalConfig && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999999,
                        padding: '16px'
                    }}
                    onClick={() => setActiveModal(null)}
                >
                    <div
                        style={{
                            background: 'var(--bg-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                            width: '100%',
                            maxWidth: modalConfig.gridColumns >= 6 ? '540px' : '480px',
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '14px 18px',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'var(--bg-secondary)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.15rem' }}>🎛️</span>
                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                    {modalConfig.title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    padding: '4px'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Subheader / Action Bar */}
                        <div style={{
                            padding: '10px 18px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            borderBottom: '1px solid var(--border-color)',
                            background: 'var(--bg-main)',
                            fontSize: '0.85rem'
                        }}>
                            <button
                                type="button"
                                onClick={() => modalConfig.onChange([])}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontSize: '0.82rem',
                                    fontWeight: 600
                                }}
                            >
                                {language === 'fr' ? 'Tout décocher' : 'Clear all'}
                            </button>
                        </div>

                        {/* Checkbox Options Grid */}
                        <div style={{
                            padding: '16px',
                            overflowY: 'auto',
                            display: 'grid',
                            gridTemplateColumns: modalConfig.gridColumns ? `repeat(${modalConfig.gridColumns}, 1fr)` : 'repeat(auto-fill, minmax(130px, 1fr))',
                            gap: '8px'
                        }}>
                            {modalConfig.options.map(opt => {
                                const selectedList = modalConfig.selected as (string | number)[];
                                const isChecked = selectedList.includes(opt.id);
                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => {
                                            if (isChecked) {
                                                modalConfig.onChange(selectedList.filter(x => x !== opt.id));
                                            } else {
                                                modalConfig.onChange([...selectedList, opt.id]);
                                            }
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: modalConfig.gridColumns >= 6 ? '10px 4px' : '9px 12px',
                                            borderRadius: 'var(--radius-sm)',
                                            border: isChecked ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                                            background: isChecked 
                                                ? (modalConfig.gridColumns >= 6 ? 'var(--accent-gold)' : 'rgba(212, 175, 55, 0.16)') 
                                                : 'var(--bg-secondary)',
                                            color: isChecked && modalConfig.gridColumns >= 6 ? '#111111' : undefined,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            justifyContent: modalConfig.gridColumns >= 6 ? 'center' : 'flex-start',
                                            userSelect: 'none'
                                        }}
                                    >
                                        {modalConfig.gridColumns < 6 && (
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '4px',
                                                border: isChecked ? '2px solid var(--accent-gold)' : '2px solid var(--border-color)',
                                                background: isChecked ? 'var(--accent-gold)' : 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#111',
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                flexShrink: 0
                                            }}>
                                                {isChecked ? '✓' : ''}
                                            </div>
                                        )}
                                        {opt.emoji && <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{opt.emoji}</span>}
                                        <span style={{ 
                                            fontSize: '0.88rem', 
                                            fontWeight: isChecked ? 700 : 500,
                                            color: (isChecked && modalConfig.gridColumns >= 6) ? '#111111' : (isChecked ? 'var(--text-main)' : 'var(--text-secondary)')
                                        }}>
                                            {opt.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '12px 18px',
                            borderTop: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            background: 'var(--bg-secondary)'
                        }}>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                style={{
                                    padding: '8px 22px',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--text-main)',
                                    color: 'var(--bg-main)',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                {language === 'fr' ? 'Fermer / Valider' : 'Done'} ({modalConfig.selected.length})
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Results Section */}
            {searched && (
                <div className="animate-fade-in">
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <span style={{ color: 'var(--accent-purple)' }}>✦</span> {t('Results')} ({results.length}{results.length >= 250 ? '+' : ''})
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--spacing-lg)' }}>
                        {results.map((res, i) => (
                            <div 
                                key={i} 
                                className="card animate-fade-in" 
                                style={{ 
                                    padding: 'var(--spacing-lg)', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    textAlign: 'center',
                                    background: 'linear-gradient(135deg, var(--bg-main), var(--bg-secondary))',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-sm)',
                                    borderRadius: 'var(--radius-lg)',
                                    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                    cursor: 'default',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                }}
                            >
                                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: 'var(--spacing-xs)' }}>
                                    {res.dateStr}
                                </div>
                                
                                <div style={{ width: '40px', height: '2px', background: 'var(--border-color)', marginBottom: 'var(--spacing-md)' }} />
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginBottom: 'var(--spacing-md)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                                        <span>{t('Life Path')}</span>
                                        <span style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>
                                            {res.unreduced !== res.lifepath && typeof res.lifepath !== 'string' ? `${res.unreduced}/${res.lifepath}` : res.lifepath}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                                        <span>{t('Secondary Energy')}</span>
                                        <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                                            {res.day !== res.dayReduced && !MASTER_NUMBERS.includes(res.dayReduced) ? `${res.day}/${res.dayReduced}` : res.day}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', alignItems: 'center' }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        background: 'var(--bg-secondary)', 
                                        padding: '4px 10px', 
                                        borderRadius: 'var(--radius-full)', 
                                        width: '100%',
                                        justifyContent: 'center',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <EarthSignEmoji sign={res.earthSign} size={18} />
                                        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)' }}>{t(res.earthSign.name)} ({t('Earth Year')})</span>
                                    </div>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        background: 'var(--bg-secondary)', 
                                        padding: '4px 10px', 
                                        borderRadius: 'var(--radius-full)', 
                                        width: '100%',
                                        justifyContent: 'center',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <EarthSignEmoji sign={res.earthMonthSign} size={18} />
                                        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)' }}>{t(res.earthMonthSign.name)} ({t('Earth Month')})</span>
                                    </div>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px', 
                                        background: 'var(--bg-secondary)', 
                                        padding: '4px 10px', 
                                        borderRadius: 'var(--radius-full)', 
                                        width: '100%',
                                        justifyContent: 'center',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <SkySignEmoji sign={res.skySign} size={18} />
                                        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)' }}>{t(res.skySign.name)} ({t('Sky Sign')})</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {results.length === 0 && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-secondary)' }}>
                                {language === 'en' ? 'No dates found matching those criteria in this timeframe.' : 'Aucune date trouvée correspondant à ces critères sur cette période.'}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
