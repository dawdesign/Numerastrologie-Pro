import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { WIKI_NUMBERS } from '../data/wikiData';
import { NUMEROLOGY_DESCRIPTIONS } from '../engine/personalityData';
import WikiAstrologyWheel from '../components/WikiAstrologyWheel';
import WikiSkyWheel from '../components/WikiSkyWheel';
import { Lock } from 'lucide-react';

const NUMBERS_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];

// 12x12 Pixel Art Padlock matrix
// 0: background grey, 1: keyhole dark, 2: shackle silver, 3: body slate
const LOCK_PIXEL_ART = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // row 0
    [0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0], // row 1: shackle top
    [0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0], // row 2: shackle arch
    [0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0], // row 3: shackle sides
    [0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0], // row 4: shackle sides
    [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0], // row 5: body top
    [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0], // row 6: body
    [0, 0, 3, 3, 3, 1, 1, 3, 3, 3, 0, 0], // row 7: body + keyhole
    [0, 0, 3, 3, 3, 1, 1, 3, 3, 3, 0, 0], // row 8: body + keyhole
    [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0], // row 9: body
    [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0], // row 10: body base
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // row 11: empty
];

function getPixelArtColor(val: number): string {
    switch (val) {
        case 1:
            return '#18181b'; // dark keyhole
        case 2:
            return '#a1a1aa'; // silver shackle
        case 3:
            return '#64748b'; // slate padlock body
        default:
            return 'rgba(255, 255, 255, 0.05)'; // neutral greyscale background
    }
}

// Exact shown compatibilities per user specification
const PRO_SHOWN_COMPAT: Record<number, { best: number[], friends: number[], enemy: number[] }> = {
    1: { best: [], friends: [1, 4, 7], enemy: [9] },
    2: { best: [8], friends: [2, 5], enemy: [] },
    3: { best: [], friends: [3, 6, 9], enemy: [4] },
    4: { best: [], friends: [1, 7], enemy: [3] },
    5: { best: [], friends: [2, 8, 9], enemy: [6] },
    6: { best: [], friends: [3, 9], enemy: [5] },
    7: { best: [11], friends: [1, 4], enemy: [] },
    8: { best: [2], friends: [5], enemy: [] },
    9: { best: [], friends: [3, 9], enemy: [1, 11] },
    11: { best: [], friends: [11, 22, 33], enemy: [9] },
    22: { best: [], friends: [11, 22, 33], enemy: [] },
    33: { best: [], friends: [11, 22, 33], enemy: [] }
};

// Number of locked items in each category
const LOCKED_COMPAT_COUNTS: Record<number, { best: number, friends: number, enemy: number }> = {
    1: { best: 1, friends: 4, enemy: 0 },
    2: { best: 0, friends: 3, enemy: 1 },
    3: { best: 1, friends: 6, enemy: 0 },
    4: { best: 3, friends: 1, enemy: 1 },
    5: { best: 2, friends: 2, enemy: 2 },
    6: { best: 1, friends: 4, enemy: 1 },
    7: { best: 1, friends: 1, enemy: 3 },
    8: { best: 3, friends: 3, enemy: 2 },
    9: { best: 1, friends: 1, enemy: 5 },
    11: { best: 2, friends: 1, enemy: 0 },
    22: { best: 1, friends: 3, enemy: 2 },
    33: { best: 1, friends: 2, enemy: 1 }
};

export default function Wiki() {
    const { t, language } = useSettings();
    const [activeTab, setActiveTab] = useState<'numbers' | 'earth' | 'sky'>('numbers');
    const [expandedNumbers, setExpandedNumbers] = useState<Record<string, boolean>>({});

    const toggleNumber = (id: string) => {
        setExpandedNumbers(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const allExpanded = NUMBERS_LIST.every(n => !!expandedNumbers[String(n)]);
    const toggleAllNumbers = () => {
        if (allExpanded) {
            setExpandedNumbers({});
        } else {
            const next: Record<string, boolean> = {};
            NUMBERS_LIST.forEach(n => {
                next[String(n)] = true;
            });
            setExpandedNumbers(next);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', margin: '0 0 var(--spacing-sm) 0', fontSize: 'clamp(1.4rem, 3vw, 1.85rem)' }}>{t('Information Wiki')}</h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'clamp(4px, 1.2vw, 8px)',
                width: '100%',
                maxWidth: '560px',
                margin: '0 auto var(--spacing-md)',
                background: 'var(--bg-secondary)',
                padding: '4px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                boxSizing: 'border-box'
            }}>
                <button
                    onClick={() => setActiveTab('numbers')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'clamp(6px, 1.5vw, 10px) clamp(4px, 1vw, 12px)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'clamp(0.72rem, 2.5vw, 0.95rem)',
                        fontWeight: activeTab === 'numbers' ? 700 : 500,
                        background: activeTab === 'numbers' ? 'var(--text-main)' : 'transparent',
                        color: activeTab === 'numbers' ? 'var(--bg-main)' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'center',
                        lineHeight: 1.25,
                        transition: 'all 0.2s ease',
                        boxShadow: activeTab === 'numbers' ? 'var(--shadow-sm)' : 'none',
                        minHeight: 'clamp(36px, 6vw, 42px)'
                    }}
                >
                    {t('Numbers')}
                </button>
                <button
                    onClick={() => setActiveTab('earth')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'clamp(6px, 1.5vw, 10px) clamp(4px, 1vw, 12px)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'clamp(0.72rem, 2.5vw, 0.95rem)',
                        fontWeight: activeTab === 'earth' ? 700 : 500,
                        background: activeTab === 'earth' ? 'var(--text-main)' : 'transparent',
                        color: activeTab === 'earth' ? 'var(--bg-main)' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'center',
                        lineHeight: 1.25,
                        transition: 'all 0.2s ease',
                        boxShadow: activeTab === 'earth' ? 'var(--shadow-sm)' : 'none',
                        minHeight: 'clamp(36px, 6vw, 42px)'
                    }}
                >
                    {t('Earth / Vietnamese Signs')}
                </button>
                <button
                    onClick={() => setActiveTab('sky')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'clamp(6px, 1.5vw, 10px) clamp(4px, 1vw, 12px)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'clamp(0.72rem, 2.5vw, 0.95rem)',
                        fontWeight: activeTab === 'sky' ? 700 : 500,
                        background: activeTab === 'sky' ? 'var(--text-main)' : 'transparent',
                        color: activeTab === 'sky' ? 'var(--bg-main)' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'center',
                        lineHeight: 1.25,
                        transition: 'all 0.2s ease',
                        boxShadow: activeTab === 'sky' ? 'var(--shadow-sm)' : 'none',
                        minHeight: 'clamp(36px, 6vw, 42px)'
                    }}
                >
                    {t('Sky / Western Signs')}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {activeTab === 'numbers' && (
                    <>
                        {/* Greyscale Pixel Art Lock Compatibility Chart */}
                        <div 
                            className="card animate-fade-in" 
                            style={{ 
                                maxWidth: '350px', 
                                width: '100%',
                                margin: '0 auto var(--spacing-md)', 
                                padding: '12px 14px',
                                boxSizing: 'border-box'
                            }}
                        >
                            <h2 style={{ margin: '0 0 10px 0', textAlign: 'center', fontSize: 'clamp(0.85rem, 1.8vw, 0.98rem)', fontWeight: 700 }}>
                                {t('Number Compatibility Chart')}
                            </h2>
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                                {/* Column Headers in Greyscale */}
                                <div style={{ display: 'grid', gridTemplateColumns: `clamp(18px, 3.5vw, 22px) repeat(${NUMBERS_LIST.length}, 1fr)`, gap: '2px', marginBottom: '2px' }}>
                                    <div></div>
                                    {NUMBERS_LIST.map(n => (
                                        <div key={n} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 'clamp(0.58rem, 1.2vw, 0.68rem)', padding: '1px 0', color: 'var(--text-tertiary)' }}>
                                            {n}
                                        </div>
                                    ))}
                                </div>

                                {/* 12x12 Pixel Art Padlock Matrix */}
                                {NUMBERS_LIST.map((n1, rIdx) => (
                                    <div key={n1} style={{ display: 'grid', gridTemplateColumns: `clamp(18px, 3.5vw, 22px) repeat(${NUMBERS_LIST.length}, 1fr)`, gap: '2px', marginBottom: '2px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 'clamp(0.58rem, 1.2vw, 0.68rem)', color: 'var(--text-tertiary)' }}>
                                            {n1}
                                        </div>
                                        {NUMBERS_LIST.map((n2, cIdx) => {
                                            const pixelVal = LOCK_PIXEL_ART[rIdx]?.[cIdx] ?? 0;
                                            const cellBg = getPixelArtColor(pixelVal);
                                            return (
                                                <div 
                                                    key={`${n1}-${n2}`} 
                                                    title={language === 'fr' ? 'Verrouillé dans Numerastrologie Pro' : 'Locked in Numerastrologie Pro'}
                                                    style={{
                                                        background: cellBg,
                                                        aspectRatio: '1 / 1',
                                                        borderRadius: '2px',
                                                        border: '1px solid rgba(255, 255, 255, 0.04)',
                                                        transition: 'background 0.2s ease'
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>

                            {/* Pixel Art Padlock Legend */}
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                justifyContent: 'center', 
                                gap: '6px', 
                                marginTop: '10px', 
                                fontSize: 'clamp(0.68rem, 1.1vw, 0.76rem)', 
                                color: 'var(--text-tertiary)' 
                            }}>
                                <Lock size={13} strokeWidth={2.4} />
                                <span>{language === 'fr' ? 'Matrice de compatibilité verrouillée' : 'Compatibility matrix locked'}</span>
                            </div>
                        </div>

                        {/* High-taste Toolbar */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--spacing-sm)',
                            padding: '0 4px'
                        }}>
                            <span style={{
                                fontSize: '0.82rem',
                                color: 'var(--text-secondary)',
                                fontWeight: 600,
                                letterSpacing: '0.04em',
                                textTransform: 'uppercase'
                            }}>
                                {language === 'fr' ? '12 Profils Numérologiques' : '12 Numerology Profiles'}
                            </span>
                            <button
                                type="button"
                                onClick={toggleAllNumbers}
                                className="wiki-action-btn"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.8rem',
                                    padding: '5px 12px',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-full)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {allExpanded ? (
                                        <polyline points="4 14 12 6 20 14" />
                                    ) : (
                                        <polyline points="4 10 12 18 20 10" />
                                    )}
                                </svg>
                                {allExpanded
                                    ? (language === 'fr' ? 'Tout masquer' : 'Collapse All')
                                    : (language === 'fr' ? 'Tout afficher' : 'Expand All')}
                            </button>
                        </div>

                        {/* Cards List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {(WIKI_NUMBERS[language] || WIKI_NUMBERS['en']).map((number) => {
                                const numVal = parseInt(number.id, 10);
                                const isExpanded = !!expandedNumbers[number.id];
                                const config = PRO_SHOWN_COMPAT[numVal] || { best: [], friends: [], enemy: [] };
                                const lockedCounts = LOCKED_COMPAT_COUNTS[numVal] || { best: 0, friends: 0, enemy: 0 };

                                // Shown lists
                                const shownBest = config.best;
                                const shownFriends = config.friends;
                                const shownEnemy = config.enemy;

                                // Locked box counts
                                const lockedBestCount = lockedCounts.best;
                                const lockedFriendsCount = lockedCounts.friends;
                                const lockedEnemyCount = lockedCounts.enemy;

                                const descriptions = NUMEROLOGY_DESCRIPTIONS[language as 'en' | 'fr']?.[numVal] || [];
                                const isMaster = numVal > 9;

                                return (
                                    <div
                                        key={number.id}
                                        className="card wiki-number-box animate-fade-in"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px',
                                            padding: 'clamp(14px, 2.8vw, 20px)',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-secondary)',
                                            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.04), var(--shadow-sm)'
                                        }}
                                    >
                                        {/* Header Row: Title & Action Button */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                userSelect: 'none'
                                            }}
                                            onClick={() => toggleNumber(number.id)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <h3
                                                    style={{
                                                        fontSize: 'clamp(1.6rem, 4vw, 2.1rem)',
                                                        fontWeight: 800,
                                                        margin: 0,
                                                        lineHeight: 1,
                                                        letterSpacing: '-0.03em',
                                                        color: isMaster ? 'var(--accent-gold)' : 'var(--text-main)',
                                                        fontFamily: 'var(--font-sans)'
                                                    }}
                                                >
                                                    {number.id}
                                                </h3>
                                                {isMaster ? (
                                                    <span style={{
                                                        fontSize: '0.68rem',
                                                        fontWeight: 700,
                                                        letterSpacing: '0.06em',
                                                        textTransform: 'uppercase',
                                                        padding: '3px 8px',
                                                        borderRadius: 'var(--radius-full)',
                                                        background: 'rgba(212, 175, 55, 0.12)',
                                                        color: 'var(--accent-gold)',
                                                        border: '1px solid rgba(212, 175, 55, 0.3)'
                                                    }}>
                                                        {language === 'fr' ? 'Nombre Maître' : 'Master Number'}
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        fontSize: '0.72rem',
                                                        fontWeight: 600,
                                                        color: 'var(--text-tertiary)',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        {language === 'fr' ? 'Chemin de Vie' : 'Life Path'}
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleNumber(number.id);
                                                }}
                                                className="wiki-action-btn"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '7px',
                                                    padding: '6px 14px',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: '0.84rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    background: isExpanded ? 'var(--bg-tertiary)' : 'var(--text-main)',
                                                    color: isExpanded ? 'var(--text-main)' : 'var(--bg-main)',
                                                    border: '1px solid var(--border-color)',
                                                    boxShadow: 'var(--shadow-sm)'
                                                }}
                                            >
                                                {isExpanded
                                                    ? (language === 'fr' ? 'Masquer' : 'Hide')
                                                    : (language === 'fr' ? 'Voir' : 'See')}
                                                <svg
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    style={{
                                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                                                    }}
                                                >
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Three Lines of Text: BEST, FRIENDLY, ENEMY with Shown + Locked boxes */}
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px',
                                            fontSize: 'clamp(0.85rem, 2.2vw, 0.92rem)'
                                        }}>
                                            {/* BEST Row (Blue) */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'minmax(90px, max-content) 1fr',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '5px 10px',
                                                borderRadius: 'var(--radius-sm)',
                                                background: 'rgba(51, 136, 255, 0.05)',
                                                border: '1px solid rgba(51, 136, 255, 0.12)'
                                            }}>
                                                <span style={{
                                                    color: 'var(--accent-blue)',
                                                    fontWeight: 800,
                                                    fontSize: '0.78rem',
                                                    letterSpacing: '0.06em',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {language === 'fr' ? 'MEILLEUR :' : 'BEST :'}
                                                </span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                                    {shownBest.map(n => (
                                                        <span
                                                            key={n}
                                                            style={{
                                                                padding: '1px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.84rem',
                                                                fontWeight: 700,
                                                                fontFamily: 'var(--font-mono)',
                                                                background: 'rgba(51, 136, 255, 0.12)',
                                                                color: 'var(--accent-blue)',
                                                                border: '1px solid rgba(51, 136, 255, 0.2)'
                                                            }}
                                                        >
                                                            {n}
                                                        </span>
                                                    ))}
                                                    {Array.from({ length: lockedBestCount }).map((_, idx) => (
                                                        <span
                                                            key={`locked-best-${idx}`}
                                                            title={language === 'fr' ? 'Verrouillé' : 'Locked'}
                                                            style={{
                                                                width: '24px',
                                                                height: '22px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                borderRadius: '4px',
                                                                background: 'rgba(51, 136, 255, 0.12)',
                                                                color: 'var(--accent-blue)',
                                                                border: '1px solid rgba(51, 136, 255, 0.2)'
                                                            }}
                                                        >
                                                            <Lock size={12} strokeWidth={2.4} />
                                                        </span>
                                                    ))}
                                                    {shownBest.length === 0 && lockedBestCount === 0 && (
                                                        <span style={{ color: 'var(--accent-blue)', opacity: 0.6 }}>—</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* FRIENDLY Row (Green) */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'minmax(90px, max-content) 1fr',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '5px 10px',
                                                borderRadius: 'var(--radius-sm)',
                                                background: 'rgba(0, 230, 118, 0.04)',
                                                border: '1px solid rgba(0, 230, 118, 0.12)'
                                            }}>
                                                <span style={{
                                                    color: 'var(--accent-green)',
                                                    fontWeight: 800,
                                                    fontSize: '0.78rem',
                                                    letterSpacing: '0.06em',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {language === 'fr' ? 'AMIS :' : 'FRIENDLY :'}
                                                </span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                                    {shownFriends.map(n => (
                                                        <span
                                                            key={n}
                                                            style={{
                                                                padding: '1px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.84rem',
                                                                fontWeight: 700,
                                                                fontFamily: 'var(--font-mono)',
                                                                background: 'rgba(0, 230, 118, 0.1)',
                                                                color: 'var(--accent-green)',
                                                                border: '1px solid rgba(0, 230, 118, 0.2)'
                                                            }}
                                                        >
                                                            {n}
                                                        </span>
                                                    ))}
                                                    {Array.from({ length: lockedFriendsCount }).map((_, idx) => (
                                                        <span
                                                            key={`locked-friend-${idx}`}
                                                            title={language === 'fr' ? 'Verrouillé' : 'Locked'}
                                                            style={{
                                                                width: '24px',
                                                                height: '22px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                borderRadius: '4px',
                                                                background: 'rgba(0, 230, 118, 0.1)',
                                                                color: 'var(--accent-green)',
                                                                border: '1px solid rgba(0, 230, 118, 0.2)'
                                                            }}
                                                        >
                                                            <Lock size={12} strokeWidth={2.4} />
                                                        </span>
                                                    ))}
                                                    {shownFriends.length === 0 && lockedFriendsCount === 0 && (
                                                        <span style={{ color: 'var(--accent-green)', opacity: 0.6 }}>—</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ENEMY Row (Red) */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'minmax(90px, max-content) 1fr',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '5px 10px',
                                                borderRadius: 'var(--radius-sm)',
                                                background: 'rgba(255, 77, 77, 0.04)',
                                                border: '1px solid rgba(255, 77, 77, 0.12)'
                                            }}>
                                                <span style={{
                                                    color: 'var(--accent-red)',
                                                    fontWeight: 800,
                                                    fontSize: '0.78rem',
                                                    letterSpacing: '0.06em',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {language === 'fr' ? 'ENNEMIS :' : 'ENEMY :'}
                                                </span>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                                                    {shownEnemy.map(n => (
                                                        <span
                                                            key={n}
                                                            style={{
                                                                padding: '1px 8px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.84rem',
                                                                fontWeight: 700,
                                                                fontFamily: 'var(--font-mono)',
                                                                background: 'rgba(255, 77, 77, 0.1)',
                                                                color: 'var(--accent-red)',
                                                                border: '1px solid rgba(255, 77, 77, 0.2)'
                                                            }}
                                                        >
                                                            {n}
                                                        </span>
                                                    ))}
                                                    {Array.from({ length: lockedEnemyCount }).map((_, idx) => (
                                                        <span
                                                            key={`locked-enemy-${idx}`}
                                                            title={language === 'fr' ? 'Verrouillé' : 'Locked'}
                                                            style={{
                                                                width: '24px',
                                                                height: '22px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                borderRadius: '4px',
                                                                background: 'rgba(255, 77, 77, 0.1)',
                                                                color: 'var(--accent-red)',
                                                                border: '1px solid rgba(255, 77, 77, 0.2)'
                                                            }}
                                                        >
                                                            <Lock size={12} strokeWidth={2.4} />
                                                        </span>
                                                    ))}
                                                    {shownEnemy.length === 0 && lockedEnemyCount === 0 && (
                                                        <span style={{ color: 'var(--accent-red)', opacity: 0.6 }}>—</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Developed section when opened */}
                                        {isExpanded && (
                                            <div
                                                className="animate-fade-in"
                                                style={{
                                                    marginTop: '6px',
                                                    paddingTop: 'var(--spacing-md)',
                                                    borderTop: '1px solid var(--border-color)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '10px'
                                                }}
                                            >
                                                {descriptions.map((bullet, idx) => (
                                                    <div
                                                        key={idx}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'baseline',
                                                            gap: '10px',
                                                            fontSize: '0.92rem',
                                                            lineHeight: 1.55,
                                                            color: 'var(--text-main)'
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                width: '5px',
                                                                height: '5px',
                                                                borderRadius: '50%',
                                                                background: isMaster ? 'var(--accent-gold)' : 'var(--text-tertiary)',
                                                                flexShrink: 0,
                                                                transform: 'translateY(-2px)'
                                                            }}
                                                        />
                                                        <span>{bullet}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {activeTab === 'earth' && (
                    <WikiAstrologyWheel />
                )}

                {activeTab === 'sky' && (
                    <WikiSkyWheel />
                )}
            </div>
        </div>
    );
}
