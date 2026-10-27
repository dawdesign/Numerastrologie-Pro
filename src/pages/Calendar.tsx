import LockedBox from '../components/LockedBox';
import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { calculateLifePath, reduceNumber, MASTER_NUMBERS, calculateLuckyNumber, calculatePersonalCycles, reduceCycle, calculateAge } from '../engine/numerology';
import { getEarthSign, getWesternSign, getEarthMonthSign, checkEarthSignCompatibility } from '../engine/astrology';
import { checkCompatibility, getNumberCompat } from '../engine/compatibilityEngine';
import { EarthSignEmoji } from '../components/ZodiacEmoji';
import { useSettings } from '../context/SettingsContext';
import { getMoonPhase } from '../engine/moonPhase';

const getCycleColor = (cycle: number | string, profileLp?: number | string) => {
    const cycleNum = typeof cycle === 'string' ? parseInt(cycle.split('/')[0], 10) : cycle;
    if (cycleNum === 11) {
        if (profileLp !== undefined) {
            const compat = getNumberCompat(profileLp, 11);
            if (compat === 'Best' || compat === 'Good' || compat === 'MS') {
                return 'var(--accent-light-green)';
            }
            if (compat === 'Enem' || compat === 'Bad') {
                return 'var(--accent-red)';
            }
        }
        return 'inherit';
    }
    if (cycleNum === 22) {
        if (profileLp !== undefined) {
            const compat = getNumberCompat(profileLp, 22);
            if (compat === 'Best' || compat === 'Good' || compat === 'MS') {
                return 'var(--accent-light-green)';
            }
            if (compat === 'Enem' || compat === 'Bad') {
                return 'var(--accent-red)';
            }
        }
        return 'inherit';
    }
    if (cycleNum === 7 || cycleNum === 9) return 'var(--accent-red)';
    if (cycleNum === 8) return 'var(--accent-orange, #f59e0b)';
    return 'inherit';
};

export default function Calendar() {
    const navigate = useNavigate();
    const { t, language } = useSettings();
    const [searchParams] = useSearchParams();
    const profileMonth = searchParams.get('pm');
    const profileDay = searchParams.get('pd');
    const profileYear = searchParams.get('py');
    const profileName = searchParams.get('name');
    const today = new Date();
    const [viewMode, setViewMode] = useState<'Days' | 'Months' | 'Years'>('Days');
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
    const [selectedDay, setSelectedDay] = useState(today.getDate());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());

    // Generate matrix for the current month
    const calendarDays = useMemo(() => {
        const days = [];
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        // get first day of the month (0 = Sunday, 1 = Monday ...)
        const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();

        // pad start
        for (let i = 0; i < firstDayIndex; i++) {
            days.push(null);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            days.push(d);
        }

        return days;
    }, [currentYear, currentMonth]);

    const nextView = () => {
        if (viewMode === 'Days') {
            if (currentMonth === 12) {
                setCurrentMonth(1);
                setCurrentYear(y => y + 1);
            } else {
                setCurrentMonth(m => m + 1);
            }
        } else if (viewMode === 'Months') {
            setCurrentYear(y => y + 1);
        } else if (viewMode === 'Years') {
            setCurrentYear(y => y + 12);
        }
    };

    const prevView = () => {
        if (viewMode === 'Days') {
            if (currentMonth === 1) {
                setCurrentMonth(12);
                setCurrentYear(y => y - 1);
            } else {
                setCurrentMonth(m => m - 1);
            }
        } else if (viewMode === 'Months') {
            setCurrentYear(y => y - 1);
        } else if (viewMode === 'Years') {
            setCurrentYear(y => y - 12);
        }
    };

    // Selected Day Reading
    const dayReading = useMemo(() => {
        if (!selectedDay) return null;
        const { lifepath, unreduced } = calculateLifePath(currentMonth, selectedDay, currentYear);
        const dayReduced = reduceNumber(selectedDay);
        const earthSign = getEarthSign(currentYear, currentMonth, selectedDay);
        const earthMonthSign = getEarthMonthSign(currentMonth, selectedDay);
        const skySign = getWesternSign(currentMonth, selectedDay);
        const moonPhase = getMoonPhase(currentYear, currentMonth, selectedDay);
        return { lifepath, unreduced, dayReduced, earthSign, earthMonthSign, skySign, moonPhase };
    }, [selectedDay, currentMonth, currentYear]);

    // Compute exported profile data
    const exportedProfile = useMemo(() => {
        let pm = profileMonth ? parseInt(profileMonth) : null;
        let pd = profileDay ? parseInt(profileDay) : null;
        let py = profileYear ? parseInt(profileYear) : null;
        let name = profileName;

        // Fallback to localStorage removed so calendar defaults to no profile

        if (!pm || !pd || !py) return null;

        const { lifepath, unreduced } = calculateLifePath(pm, pd, py);
        const earthSign = getEarthSign(py, pm, pd);
        const luckyNumber = calculateLuckyNumber(pm, pd, py);
        const skySign = getWesternSign(pm, pd);
        return { month: pm, day: pd, year: py, lifepath, unreduced, earthSign, luckyNumber, skySign, name };
    }, [profileMonth, profileDay, profileYear, profileName]);

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

    // Helper to determine day color based on compatibility
    const getDailyColorStyle = (_day: number): { background?: string, color?: string, border?: string } => { return {}; };

    // Helper to determine month color based on compatibility
    const getMonthColorStyle = (_month: number): { background?: string, color?: string, border?: string } => { return {}; };

    // Helper to determine year color based on compatibility
    const getYearColorStyle = (year: number): { background?: string, color?: string, border?: string } => {
        if (!exportedProfile) return {};
        const yearSign = getEarthSign(year, 6, 1);
        const compat = checkEarthSignCompatibility(exportedProfile.earthSign, yearSign);

        if (compat === 'Same' || compat === 'Friend' || compat === 'Soulmate') {
            return {
                background: 'var(--accent-dark-green)',
                color: '#fff',
                border: '1px solid var(--accent-dark-green)'
            };
        }
        if (compat === 'Enemy') {
            return {
                background: 'var(--accent-red)',
                color: '#fff',
                border: '1px solid var(--accent-red)'
            };
        }

        return {};
    };


    return (
        <div className="animate-fade-in matrix-calendar-wrapper">

            {/* Top Bar: Title & Compact Profile Banner */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap', 
                gap: '12px',
                marginBottom: '4px' 
            }}>
                <h1 style={{ margin: 0, fontSize: 'clamp(1.25rem, 2.5vw, 1.7rem)', fontWeight: 800 }}>
                    {t('Matrix Calendar')}
                </h1>

                {exportedProfile && (
                    <div
                        onClick={() => navigate('/')}
                        title={language === 'fr' ? 'Cliquer pour changer de profil' : 'Click to change profile'}
                        className="exported-profile-banner"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        }}
                    >
                        {/* Left: Calendar Icon + Title & Formatted Date */}
                        <div className="exported-profile-left">
                            <span style={{ fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', lineHeight: 1, flexShrink: 0 }}>🗓️</span>
                            <div className="exported-profile-left-texts">
                                <span className="exported-profile-label">
                                    {language === 'fr' ? 'PROFIL EXPORTÉ' : 'EXPORTED PROFILE'}
                                </span>
                                <span className="exported-profile-date">
                                    {(() => {
                                        try {
                                            return new Date(exportedProfile.year, exportedProfile.month - 1, exportedProfile.day).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            });
                                        } catch {
                                            return `${exportedProfile.day} / ${exportedProfile.month} / ${exportedProfile.year}`;
                                        }
                                    })()}
                                </span>
                            </div>
                        </div>

                        {/* Right: Chemin de vie & Signe de terre */}
                        <div className="exported-profile-stats">
                            {/* Chemin de vie */}
                            <div className="exported-profile-stat-col">
                                <span className="exported-profile-label">
                                    {language === 'fr' ? 'CHEMIN DE VIE' : 'LIFE PATH'}
                                </span>
                                <span className="exported-profile-stat-val" style={{ fontSize: 'clamp(0.95rem, 2.8vw, 1.15rem)', fontWeight: 800 }}>
                                    {exportedProfile.lifepath}
                                </span>
                            </div>

                            {/* Signe de terre */}
                            <div className="exported-profile-stat-col">
                                <span className="exported-profile-label">
                                    {language === 'fr' ? 'SIGNE DE TERRE' : 'EARTH SIGN'}
                                </span>
                                <div className="exported-profile-stat-val">
                                    <EarthSignEmoji sign={exportedProfile.earthSign} size={16} />
                                    <span>
                                        {t(exportedProfile.earthSign.name)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Harmonious Dual-Box Layout: Calendar Grid (Left) + Description Panel (Right) */}
            <div className="matrix-calendar-layout">

                {/* Calendar Grid Card */}
                <div className="card matrix-calendar-card">

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <button className="btn btn-outline" style={{ padding: 'clamp(4px, 1vw, 6px) clamp(10px, 1.8vw, 14px)', fontSize: 'clamp(0.72rem, 1.8vw, 0.85rem)' }} onClick={prevView}>&larr; {t('Prev')}</button>
                        <div style={{ display: 'flex', gap: 'clamp(4px, 1vw, var(--spacing-sm))', alignItems: 'center' }}>
                            {viewMode === 'Days' && (
                                <select className="input-field" style={{ padding: 'clamp(4px, 1vw, 6px)', fontSize: 'clamp(0.72rem, 1.8vw, 0.85rem)', maxWidth: 'clamp(80px, 25vw, 150px)' }} value={currentMonth} onChange={e => { setCurrentMonth(parseInt(e.target.value)); }}>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                        <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' })}</option>
                                    ))}
                                </select>
                            )}
                            {viewMode !== 'Years' && (
                                <input
                                    type="number"
                                    className="input-field"
                                    style={{ width: 'clamp(60px, 15vw, 90px)', padding: 'clamp(4px, 1vw, 6px)', fontSize: 'clamp(0.72rem, 1.8vw, 0.85rem)' }}
                                    value={currentYear}
                                    onFocus={(e) => e.target.select()}
                                    onChange={e => { setCurrentYear(parseInt(e.target.value) || 2024); }}
                                />
                            )}
                            {viewMode === 'Years' && (
                                <span style={{ fontWeight: 600, fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)' }}>
                                    {currentYear - 5} - {currentYear + 6}
                                </span>
                            )}
                        </div>
                        <button className="btn btn-outline" style={{ padding: 'clamp(4px, 1vw, 6px) clamp(10px, 1.8vw, 14px)', fontSize: 'clamp(0.72rem, 1.8vw, 0.85rem)' }} onClick={nextView}>{t('Next')} &rarr;</button>
                    </div>

                    {viewMode === 'Days' && (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                gap: 'clamp(2px, 0.4vw, 4px)',
                                textAlign: 'center',
                                marginBottom: '4px'
                            }}>
                                {(language === 'en' ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']).map(d => (
                                    <div key={d} style={{ fontWeight: 600, fontSize: 'clamp(0.65rem, 1.2vw, 0.78rem)', color: 'var(--text-secondary)' }}>{d}</div>
                                ))}
                            </div>

                            <div className="matrix-days-grid">
                                {calendarDays.map((day, idx) => {
                                    if (day === null) return <div key={`empty-${idx}`} className="matrix-day-cell" style={{ opacity: 0, pointerEvents: 'none' }} />;

                                    const { lifepath, unreduced } = calculateLifePath(currentMonth, day, currentYear);
                                    const isSelected = selectedDay === day;
                                    const isToday = day === today.getDate() && currentMonth === today.getMonth() + 1 && currentYear === today.getFullYear();

                                    const lpLabel = unreduced !== lifepath && typeof lifepath !== 'string' ? `${unreduced}/${lifepath}` : `${lifepath}`;

                                    let isLucky = false;
                                    if (exportedProfile) {
                                        const todaysLucky = calculateLuckyNumber(currentMonth, day, currentYear);
                                        const y1 = Math.floor(currentYear / 100);
                                        const y2 = currentYear % 100;
                                        const yearSum = y1 + y2;

                                        isLucky = unreduced === exportedProfile.luckyNumber.base || unreduced === exportedProfile.luckyNumber.flipped ||
                                            day === exportedProfile.luckyNumber.base || day === exportedProfile.luckyNumber.flipped ||
                                            todaysLucky.base === exportedProfile.luckyNumber.base || todaysLucky.base === exportedProfile.luckyNumber.flipped ||
                                            yearSum === exportedProfile.luckyNumber.base || yearSum === exportedProfile.luckyNumber.flipped;
                                    }

                                    const cellStyle = getDailyColorStyle(day);
                                    let cellBorder = cellStyle.border || (isToday ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)');
                                    if (isLucky) cellBorder = '2px solid var(--accent-gold)';
                                    

                                    const cellBg = cellStyle.background || 'var(--bg-main)';
                                    const cellColor = cellStyle.color || 'var(--text-main)';

                                    if (isSelected) {
                                        cellBorder = '3px solid var(--text-main)';
                                    }

                                    const dayMoon = getMoonPhase(currentYear, currentMonth, day);

                                    return (
                                        <div
                                            key={day}
                                            onClick={() => setSelectedDay(day)}
                                            className="matrix-day-cell"
                                            title={`${language === 'fr' ? dayMoon.nameFr : dayMoon.nameEn} (${Math.round(dayMoon.fraction * 100)}%)`}
                                            style={{
                                                cursor: 'pointer',
                                                borderRadius: 'var(--radius-md)',
                                                border: cellBorder,
                                                background: cellBg,
                                                color: cellColor,
                                                transition: 'all 0.15s ease',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {/* Moon Phase Emoji */}
                                            <span 
                                                style={{
                                                    position: 'absolute',
                                                    top: '2px',
                                                    right: '3px',
                                                    fontSize: 'clamp(0.55rem, 0.95vw, 0.75rem)',
                                                    lineHeight: 1,
                                                    opacity: 0.9,
                                                    pointerEvents: 'none',
                                                    filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.4))'
                                                }}
                                            >
                                                {dayMoon.emoji}
                                            </span>

                                            <div style={{ fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', fontWeight: 700, lineHeight: 1, zIndex: 1 }}>{day}</div>

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                gap: '2px',
                                                marginTop: '2px',
                                                fontSize: 'clamp(0.52rem, 0.95vw, 0.65rem)',
                                                color: cellStyle.color ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)',
                                                zIndex: 1,
                                                lineHeight: 1,
                                                maxWidth: '100%',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lpLabel}</span>
                                                {/* Month earth sign hidden in free version */}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {viewMode === 'Months' && (
                        <div className="matrix-months-grid">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                                const isSelected = selectedMonth === m;
                                const isThisMonth = m === today.getMonth() + 1 && currentYear === today.getFullYear();
                                const monthName = new Date(currentYear, m - 1, 1).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short' });
                                const uMonth = reduceCycle(m + reduceCycle(currentYear));
                                const yearEarthSign = getEarthSign(currentYear, m, 15);

                                let isLucky = false;
                                if (exportedProfile) {
                                    const uMonthRaw = m + reduceNumber(currentYear);
                                    const monthLucky = calculateLuckyNumber(m, 1, currentYear);
                                    const y1 = Math.floor(currentYear / 100);
                                    const y2 = currentYear % 100;
                                    const yearSum = y1 + y2;

                                    isLucky = (uMonthRaw === exportedProfile.luckyNumber.base || uMonthRaw === exportedProfile.luckyNumber.flipped) ||
                                        (monthLucky.base === exportedProfile.luckyNumber.base || monthLucky.base === exportedProfile.luckyNumber.flipped) ||
                                        (yearSum === exportedProfile.luckyNumber.base || yearSum === exportedProfile.luckyNumber.flipped);
                                }

                                const cellStyle = getMonthColorStyle(m);
                                let cellBorder = cellStyle.border || (isThisMonth ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)');
                                if (isLucky) cellBorder = '2px solid var(--accent-gold)';
                                if (isSelected) cellBorder = 'var(--text-main)';

                                const cellBg = isSelected ? 'var(--text-main)' : (cellStyle.background || 'var(--bg-main)');
                                const cellColor = isSelected ? 'var(--bg-main)' : (cellStyle.color || 'var(--text-main)');

                                return (
                                    <div
                                        key={m}
                                        onClick={() => setSelectedMonth(m)}
                                        className="matrix-month-cell"
                                        style={{
                                            cursor: 'pointer',
                                            borderRadius: 'var(--radius-md)',
                                            border: cellBorder,
                                            background: cellBg,
                                            color: cellColor,
                                            transition: 'all 0.15s ease',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.05rem)', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{monthName}</div>
                                        <div style={{
                                            display: 'flex',
                                            gap: '4px',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginTop: '2px',
                                            fontSize: 'clamp(0.6rem, 0.95vw, 0.74rem)',
                                            color: isSelected ? 'var(--bg-secondary)' : (cellStyle.color ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)'),
                                            maxWidth: '100%',
                                            overflow: 'hidden'
                                        }}>
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{language === 'fr' ? 'Mois Univ.' : 'Univ. Month'}: <strong>{uMonth}</strong></span>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                                                <EarthSignEmoji sign={yearEarthSign} size={13} />
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {viewMode === 'Years' && (
                        <div className="matrix-years-grid">
                            {Array.from({ length: 12 }, (_, i) => currentYear - 5 + i).map(y => {
                                const isSelected = selectedYear === y;
                                const isThisYear = y === today.getFullYear();
                                const uYear = reduceCycle(y);
                                const eSign = getEarthSign(y, 6, 1); // majority of the year

                                let isLucky = false;
                                if (exportedProfile) {
                                    const lastTwo = y % 100;
                                    const firstTwo = Math.floor(y / 100);
                                    const yearSum = firstTwo + lastTwo;
                                    const personAge = y - exportedProfile.year;
                                    const flippedAge = personAge > 0 ? parseInt(personAge.toString().split('').reverse().join('')) : -1;

                                    isLucky = lastTwo === exportedProfile.luckyNumber.base || lastTwo === exportedProfile.luckyNumber.flipped ||
                                        yearSum === exportedProfile.luckyNumber.base || yearSum === exportedProfile.luckyNumber.flipped ||
                                        personAge === exportedProfile.luckyNumber.base || personAge === exportedProfile.luckyNumber.flipped ||
                                        flippedAge === exportedProfile.luckyNumber.base || flippedAge === exportedProfile.luckyNumber.flipped;
                                }

                                const cellStyle = getYearColorStyle(y);
                                let cellBorder = cellStyle.border || (isThisYear ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)');
                                if (isLucky) cellBorder = '2px solid var(--accent-gold)';
                                if (isSelected) cellBorder = 'var(--text-main)';

                                const cellBg = isSelected ? 'var(--text-main)' : (cellStyle.background || 'var(--bg-main)');
                                const cellColor = isSelected ? 'var(--bg-main)' : (cellStyle.color || 'var(--text-main)');

                                return (
                                    <div
                                        key={y}
                                        onClick={() => setSelectedYear(y)}
                                        className="matrix-year-cell"
                                        style={{
                                            cursor: 'pointer',
                                            borderRadius: 'var(--radius-md)',
                                            border: cellBorder,
                                            background: cellBg,
                                            color: cellColor,
                                            transition: 'all 0.15s ease',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.25rem)', fontWeight: 800, lineHeight: 1.1 }}>{y}</div>
                                        <div style={{
                                            display: 'flex',
                                            gap: '4px',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginTop: '2px',
                                            fontSize: 'clamp(0.6rem, 0.95vw, 0.74rem)',
                                            color: isSelected ? 'var(--bg-secondary)' : (cellStyle.color ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)'),
                                            maxWidth: '100%',
                                            overflow: 'hidden'
                                        }}>
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{language === 'fr' ? 'Année Univ.' : 'Univ. Year'}: <strong>{uYear}</strong></span>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                                                <EarthSignEmoji sign={eSign} size={13} /> {t(eSign.name).substring(0,3)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* View Mode Toggles */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-sm)', marginTop: 'auto', paddingTop: '10px' }}>
                        <button
                            id="calendar-toggle-years"
                            className={`btn ${viewMode === 'Years' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setViewMode('Years')}
                            style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}
                        >{t('Years')}</button>
                        <button
                            id="calendar-toggle-months"
                            className={`btn ${viewMode === 'Months' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setViewMode('Months')}
                            style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}
                        >{t('Months')}</button>
                        <button
                            id="calendar-toggle-days"
                            className={`btn ${viewMode === 'Days' ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setViewMode('Days')}
                            style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem' }}
                        >{t('Days')}</button>
                    </div>

                </div>

                {/* Details Panel */}
                <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                    {viewMode === 'Days' && dayReading && (() => {
                        let detailEarthColor = 'inherit';
                        let detailSkyColor = 'inherit';
                        let luckyReasons: React.ReactNode[] = [];

                        if (exportedProfile) {
                            const compat = checkCompatibility(
                                { m: exportedProfile.month, d: exportedProfile.day, y: exportedProfile.year },
                                { m: currentMonth, d: selectedDay, y: currentYear },
                                language
                            );

                            const todaysLucky = calculateLuckyNumber(currentMonth, selectedDay, currentYear);
                            const { base: b, flipped: f } = exportedProfile.luckyNumber;
                            const y1 = Math.floor(currentYear / 100);
                            const y2 = currentYear % 100;
                            const ySumActual = y1 + y2;

                            if (dayReading.unreduced === b || dayReading.unreduced === f) {
                                luckyReasons.push(language === 'en' ? <span>Day energy (<strong>{dayReading.unreduced}</strong>) matches <strong>{b}/{f}</strong></span> : <span>L'énergie du jour (<strong>{dayReading.unreduced}</strong>) correspond à <strong>{b}/{f}</strong></span>);
                            }
                            if (selectedDay === b || selectedDay === f) {
                                luckyReasons.push(language === 'en' ? <span>Day of the month (<strong>{selectedDay}</strong>) matches <strong>{b}/{f}</strong></span> : <span>Le jour du mois (<strong>{selectedDay}</strong>) correspond à <strong>{b}/{f}</strong></span>);
                            }
                            if (todaysLucky.base === b || todaysLucky.base === f) {
                                luckyReasons.push(language === 'en' ? <span>Date lucky number (<strong>{todaysLucky.base}</strong>) matches <strong>{b}/{f}</strong></span> : <span>Le numéro de chance (<strong>{todaysLucky.base}</strong>) correspond à <strong>{b}/{f}</strong></span>);
                            }
                            if (ySumActual === b || ySumActual === f) {
                                luckyReasons.push(language === 'en' ? <span>Year double-digit sum (<strong>{y1}+{y2}={ySumActual}</strong>) matches <strong>{b}/{f}</strong></span> : <span>La somme de l'année (<strong>{y1}+{y2}={ySumActual}</strong>) correspond à <strong>{b}/{f}</strong></span>);
                            }

                            // Earth Sign specific match
                            detailEarthColor = getCompatColor(compat.astroMatch);

                            // Sky Sign specific match
                            const exportedSkySign = exportedProfile.skySign || getWesternSign(exportedProfile.month, exportedProfile.day);
                            if (dayReading.skySign.name === exportedSkySign.name) {
                                detailSkyColor = 'var(--accent-dark-green)';
                            }
                        }

                        const cardBorder = luckyReasons.length > 0 ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)';

                        return (
                            <div className="card matrix-details-card" style={{ border: cardBorder }}>
                                <div style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                                    <h3 style={{ margin: 0, fontSize: 'clamp(0.95rem, 1.5vw, 1.2rem)', fontWeight: 700, textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.25 }}>
                                        {new Date(currentYear, currentMonth - 1, selectedDay).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </h3>
                                    {luckyReasons.length > 0 && (
                                        <div style={{ color: 'var(--accent-gold)', marginTop: '8px', fontSize: '0.82rem', textAlign: 'left', background: 'rgba(212, 175, 55, 0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', wordBreak: 'break-word' }}>
                                            <div style={{ fontWeight: 700, marginBottom: '2px', textAlign: 'center' }}>✨ {t('Lucky Day!')}</div>
                                            <ul style={{ margin: 0, paddingLeft: '14px', color: 'var(--text-main)', lineHeight: 1.35 }}>
                                                {luckyReasons.map((reason, i) => <li key={i}>{reason}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px', width: '100%', margin: '8px 0' }}>
                                    <div style={{ textAlign: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 6px', minWidth: 0, overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('Energy')}</div>
                                        {dayReading.unreduced !== dayReading.lifepath && typeof dayReading.lifepath !== 'string' ? (
                                            <div style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2.2rem)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                <span style={{ color: 'var(--text-tertiary)' }}>{dayReading.unreduced}</span>
                                                <span style={{ color: 'var(--border-color)', margin: '0 2px' }}>/</span>
                                                <span>{dayReading.lifepath}</span>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2.2rem)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dayReading.lifepath}</div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 6px', minWidth: 0, overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('Secondary Energy')}</div>
                                        {selectedDay !== dayReading.dayReduced && !MASTER_NUMBERS.includes(dayReading.dayReduced) ? (
                                            <div style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2.2rem)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                <span style={{ color: 'var(--text-tertiary)' }}>{selectedDay}</span>
                                                <span style={{ color: 'var(--border-color)', margin: '0 2px' }}>/</span>
                                                <span>{dayReading.dayReduced}</span>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2.2rem)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dayReading.dayReduced}</div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', width: '100%', margin: '6px 0', alignItems: 'stretch' }}>
                                    {/* Earth Year */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--bg-main)', border: detailEarthColor !== 'inherit' ? `2px solid ${detailEarthColor}` : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '8px 4px', minWidth: 0, overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{t('Earth Year')}</div>
                                        <div style={{ padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <EarthSignEmoji sign={dayReading.earthSign} size={36} />
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '0.78rem', marginTop: '2px', color: detailEarthColor !== 'inherit' ? detailEarthColor : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                                            {t(dayReading.earthSign.name)}
                                        </div>
                                    </div>

                                    {/* Earth Month - Locked in free version */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '8px 4px', minWidth: 0, overflow: 'hidden', justifyContent: 'center' }}>
                                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{t('Earth Month')}</div>
                                        <LockedBox size={22} style={{ padding: '4px' }} />
                                    </div>

                                    {/* Sky Sign */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        background: 'var(--bg-main)',
                                        border: detailSkyColor !== 'inherit' ? `2px solid ${detailSkyColor}` : '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '8px 4px',
                                        minWidth: 0,
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{t('Sky Sign')}</div>
                                        <div style={{ padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '38px' }}>
                                            <span style={{ fontSize: '30px', lineHeight: 1 }}>{dayReading.skySign.emoji}</span>
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '0.78rem', marginTop: '2px', color: detailSkyColor !== 'inherit' ? detailSkyColor : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                                            {t(dayReading.skySign.name)}
                                        </div>
                                    </div>
                                </div>

                                 {exportedProfile ? (() => {
                                    const pCycles = calculatePersonalCycles(exportedProfile.month, exportedProfile.day, currentMonth, selectedDay, currentYear);
                                    const age = calculateAge({ year: exportedProfile.year, month: exportedProfile.month, day: exportedProfile.day }, new Date(currentYear, currentMonth - 1, selectedDay || 1));
                                    return (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                            width: '100%',
                                            marginTop: 'auto',
                                            paddingTop: '10px',
                                            borderTop: '1px solid var(--border-color)',
                                            textAlign: 'center',
                                            gap: '4px',
                                            alignItems: 'baseline'
                                        }}>
                                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('Personal Day')}</div>
                                                <div style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.5rem)', fontWeight: 800, color: getCycleColor(pCycles.personalDay, exportedProfile.lifepath), lineHeight: 1.1 }}>{pCycles.personalDay}</div>
                                            </div>
                                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('Personal Month')}</div>
                                                <div style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.5rem)', fontWeight: 800, color: getCycleColor(pCycles.personalMonth, exportedProfile.lifepath), lineHeight: 1.1 }}>{pCycles.personalMonth}</div>
                                            </div>
                                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                                                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t('Age')}</div>
                                                <div style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.5rem)', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {age}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })() : null}

                                {/* Moon Phase - Bottom of Date Info Box */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginTop: exportedProfile ? '10px' : 'auto',
                                    paddingTop: '10px',
                                    borderTop: '1px solid var(--border-color)',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.85rem'
                                }}>
                                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{dayReading.moonPhase.emoji}</span>
                                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                        {language === 'fr' ? dayReading.moonPhase.nameFr : dayReading.moonPhase.nameEn}
                                    </span>
                                    <span style={{ fontSize: '0.78rem', opacity: 0.65 }}>
                                        ({Math.round(dayReading.moonPhase.fraction * 100)}%)
                                    </span>
                                </div>
                            </div>
                        );
                    })()}

                    {viewMode === 'Months' && (() => {
                        const uMonth = reduceCycle(selectedMonth + reduceCycle(currentYear));
                        const monthName = new Date(currentYear, selectedMonth - 1, 1).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'long' });
                        const selectedMonthYearSign = getEarthSign(currentYear, selectedMonth, 15);
                        let luckyReasons: React.ReactNode[] = [];

                        if (exportedProfile) {
                            const uMonthRaw = selectedMonth + reduceNumber(currentYear);
                            const monthLucky = calculateLuckyNumber(selectedMonth, 1, currentYear);
                            const { base: b, flipped: f } = exportedProfile.luckyNumber;
                            const y1 = Math.floor(currentYear / 100);
                            const y2 = currentYear % 100;
                            const ySumActual = y1 + y2;

                            if (uMonthRaw === b || uMonthRaw === f) {
                                luckyReasons.push(language === 'en' ? <span>Universal Month energy (<strong>{uMonthRaw}</strong>) matches <strong>{b}/{f}</strong></span> : <span>L'énergie du mois universel (<strong>{uMonthRaw}</strong>) correspond à <strong>{b}/{f}</strong></span>);
                            }
                            if (monthLucky.base === b || monthLucky.base === f) {
                                luckyReasons.push(language === 'en' ? <span>Month lucky number (<strong>{monthLucky.base}</strong>) matches <strong>{b}/{f}</strong></span> : <span>Le numéro de chance du mois (<strong>{monthLucky.base}</strong>) correspond à <strong>{b}/{f}</strong></span>);
                            }
                            if (ySumActual === b || ySumActual === f) {
                                luckyReasons.push(language === 'en' ? <span>Year double-digit sum (<strong>{y1}+{y2}={ySumActual}</strong>) matches <strong>{b}/{f}</strong></span> : <span>La somme de l'année (<strong>{y1}+{y2}={ySumActual}</strong>) correspond à <strong>{b}/{f}</strong></span>);
                            }

                             
                        }

                        return (
                            <div className="card matrix-details-card" style={{ border: luckyReasons.length > 0 ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)' }}>
                                <div style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                                    <h3 style={{ margin: 0, fontSize: 'clamp(1.05rem, 1.8vw, 1.35rem)', fontWeight: 700, textAlign: 'center', textTransform: 'capitalize', wordBreak: 'break-word', lineHeight: 1.25 }}>
                                        {monthName} {currentYear}
                                    </h3>
                                    {luckyReasons.length > 0 && (
                                        <div style={{ color: 'var(--accent-gold)', marginTop: '8px', fontSize: '0.82rem', textAlign: 'left', background: 'rgba(212, 175, 55, 0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', wordBreak: 'break-word' }}>
                                            <div style={{ fontWeight: 700, marginBottom: '2px', textAlign: 'center' }}>✨ {t('Lucky Month!')}</div>
                                            <ul style={{ margin: 0, paddingLeft: '14px', color: 'var(--text-main)', lineHeight: 1.35 }}>
                                                {luckyReasons.map((reason, i) => <li key={i}>{reason}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    textAlign: 'center',
                                    margin: '10px 0',
                                    background: 'var(--bg-main)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '12px 8px',
                                    border: '1px solid var(--border-color)',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    minWidth: 0,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('Universal Month')}</div>
                                    <div style={{ fontSize: 'clamp(2.6rem, 4vw, 3.8rem)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {uMonth}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {selectedMonth} + {reduceCycle(currentYear)} ({currentYear})
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', width: '100%', margin: '6px 0' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 6px', minWidth: 0, overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600, minHeight: '2.4em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t('Earth Year')}</div>
                                        <div style={{ padding: '4px', marginTop: '4px' }}>
                                            <EarthSignEmoji sign={selectedMonthYearSign} size={42} />
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{t(selectedMonthYearSign.name)}</div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '10px 6px', minWidth: 0, overflow: 'hidden', justifyContent: 'center' }}>
                                        <LockedBox size={26} style={{ padding: '6px' }} />
                                    </div>
                                </div>

                                {exportedProfile ? (() => {
                                    const pCycles = calculatePersonalCycles(exportedProfile.month, exportedProfile.day, selectedMonth, 15, currentYear);
                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)', width: '100%', minWidth: 0, overflow: 'hidden' }}>
                                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('Personal Month')}</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: getCycleColor(pCycles.personalMonth, exportedProfile.lifepath), lineHeight: 1.1, marginTop: '2px' }}>{pCycles.personalMonth}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{t('Personal Year')}: {pCycles.personalYear}</div>
                                        </div>
                                    );
                                })() : null}
                            </div>
                        );
                    })()}

                    {viewMode === 'Years' && (() => {
                        const uYear = reduceCycle(selectedYear);
                        const eSign = getEarthSign(selectedYear, 6, 1); // majority of the year

                        let luckyReasons: React.ReactNode[] = [];
                        let eYearColor = 'inherit';
                        if (exportedProfile) {
                            const lastTwo = selectedYear % 100;
                            const firstTwo = Math.floor(selectedYear / 100);
                            const yearSumOfTwo = firstTwo + lastTwo;
                            const personAge = selectedYear - exportedProfile.year;
                            const flippedAge = personAge > 0 ? parseInt(personAge.toString().split('').reverse().join('')) : -1;
                            const { base: b, flipped: f } = exportedProfile.luckyNumber;

                            if (lastTwo === b || lastTwo === f) {
                                luckyReasons.push(language === 'en' ? <span>Year ending (<strong>{lastTwo}</strong>) matches <strong>{b}/{f}</strong></span> : <span>La fin de l'année (<strong>{lastTwo}</strong>) correspond à <strong>{b}/{f}</strong></span>);
                            }
                            if (yearSumOfTwo === b || yearSumOfTwo === f) {
                                luckyReasons.push(language === 'en' ? <span>Year double-digit sum (<strong>{firstTwo}+{lastTwo}={yearSumOfTwo}</strong>) matches <strong>{b}/{f}</strong></span> : <span>La somme de l'année (<strong>{firstTwo}+{lastTwo}={yearSumOfTwo}</strong>) correspond à <strong>{b}/{f}</strong></span>);
                            }
                            if (personAge === b || personAge === f) {
                                luckyReasons.push(language === 'en' ? <span>You turn <strong>{personAge}</strong> this year</span> : <span>Vous aurez <strong>{personAge}</strong> ans cette année</span>);
                            }
                            if (flippedAge === b || flippedAge === f) {
                                luckyReasons.push(language === 'en' ? <span>Your flipped age (<strong>{flippedAge}</strong>) matches <strong>{b}/{f}</strong></span> : <span>Votre âge inversé (<strong>{flippedAge}</strong>) correspond à <strong>{b}/{f}</strong></span>);
                            }

                            const emCompat = checkEarthSignCompatibility(exportedProfile.earthSign, eSign);
                            if (emCompat === 'Enemy') eYearColor = 'var(--accent-red)';
                            else if (emCompat === 'Friend' || emCompat === 'Soulmate' || emCompat === 'Same') eYearColor = 'var(--accent-dark-green)';
                        }

                        return (
                            <div className="card matrix-details-card" style={{ border: luckyReasons.length > 0 ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)' }}>
                                <div style={{ width: '100%', minWidth: 0, overflow: 'hidden' }}>
                                    <h3 style={{ margin: 0, fontSize: 'clamp(1.05rem, 1.8vw, 1.35rem)', fontWeight: 700, textAlign: 'center', wordBreak: 'break-word' }}>
                                        {t('Year')} {selectedYear}
                                    </h3>
                                    {luckyReasons.length > 0 && (
                                        <div style={{ color: 'var(--accent-gold)', marginTop: '8px', fontSize: '0.82rem', textAlign: 'left', background: 'rgba(212, 175, 55, 0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)', wordBreak: 'break-word' }}>
                                            <div style={{ fontWeight: 700, marginBottom: '2px', textAlign: 'center' }}>✨ {t('Lucky Year!')}</div>
                                            <ul style={{ margin: 0, paddingLeft: '14px', color: 'var(--text-main)', lineHeight: 1.35 }}>
                                                {luckyReasons.map((reason, i) => <li key={i}>{reason}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    textAlign: 'center',
                                    margin: '10px 0',
                                    background: 'var(--bg-main)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '12px 8px',
                                    border: '1px solid var(--border-color)',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    minWidth: 0,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('Universal Year')}</div>
                                    <div style={{ fontSize: 'clamp(2.6rem, 4vw, 3.8rem)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, margin: '4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {uYear}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', wordBreak: 'break-word' }}>
                                        {language === 'fr' ? 'Somme théosophique de l\'année' : 'Theosophical sum of the year'}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--bg-main)', border: eYearColor !== 'inherit' ? `2px solid ${eYearColor}` : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px 8px', margin: '6px 0', width: '100%', boxSizing: 'border-box', minWidth: 0, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('Earth Year')}</div>
                                    <div style={{ position: 'relative', marginTop: '4px' }}>
                                        <EarthSignEmoji sign={eSign} size={46} />
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '4px', color: eYearColor !== 'inherit' ? eYearColor : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{t(eSign.name)}</div>
                                </div>

                                {exportedProfile ? (() => {
                                    const pCycles = calculatePersonalCycles(exportedProfile.month, exportedProfile.day, 6, 1, selectedYear);
                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border-color)', width: '100%', minWidth: 0, overflow: 'hidden' }}>
                                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>{t('Personal Year')}</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: getCycleColor(pCycles.personalYear, exportedProfile.lifepath), lineHeight: 1.1, marginTop: '2px' }}>{pCycles.personalYear}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px', textAlign: 'center', wordBreak: 'break-word' }}>{language === 'en' ? `from your birthday in ${pCycles.lastBirthdayYear}` : `depuis votre anniversaire en ${pCycles.lastBirthdayYear}`}</div>
                                        </div>
                                    );
                                })() : null}
                            </div>
                        );
                    })()}

                </div>

            </div>
        </div>
    );
}
