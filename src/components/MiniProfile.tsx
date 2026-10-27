import { calculateLifePath, calculateLuckyNumber } from '../engine/numerology';
import { getEarthSign, getWesternSign, getEarthMonthSign } from '../engine/astrology';
import { useSettings } from '../context/SettingsContext';

interface ComponentHighlights {
    lifepath?: string;
    day?: string;
    luckyNumber?: string;
    earthSign?: string;
    monthSign?: string;
    skySign?: string;
    label?: string;
    subLabel?: string;
}

interface MiniProfileProps {
    label: string;
    subLabel?: string | number; // e.g. jersey number
    month: number;
    day: number;
    year: any;
    onMonthChange: (m: number) => void;
    onDayChange: (d: number) => void;
    onYearChange: (y: any) => void;
    scale?: number;
    highlights?: ComponentHighlights;
    variant?: 'full' | 'stadium';
}

export default function MiniProfile({ label, subLabel, month, day, year, onMonthChange, onDayChange, onYearChange, scale = 1, highlights, variant = 'full' }: MiniProfileProps) {
    const { t } = useSettings();

    let reading = null;
    const isYearValid = typeof year === 'number' || (typeof year === 'string' && year !== '' && year !== '-');

    if (month && day && year && isYearValid) {
        const y = typeof year === 'string' ? parseInt(year, 10) : year;
        const { lifepath, unreduced } = calculateLifePath(month, day, y);
        const earthSign = getEarthSign(y, month, day);
        const monthSign = getEarthMonthSign(month, day);
        const skySign = getWesternSign(month, day);
        const luckyNumber = calculateLuckyNumber(month, day, y);

        reading = {
            lifepath,
            unreduced,
            earthSign,
            monthSign,
            skySign,
            luckyNumber
        };
    }

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
        <div style={{
            width: `${450 * scale}px`,
            height: `${380 * scale}px`,
            position: 'relative',
            flexShrink: 0
        }}>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${scale})`,
                background: 'var(--bg-secondary)',
                border: `4px solid var(--border-color)`,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-md)',
                boxShadow: 'var(--shadow-lg)',
                width: '450px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--spacing-md)'
            }}>
                <style>{hideSpinStyles}</style>

            {subLabel !== undefined && (
                <div style={{
                    position: 'absolute',
                    top: '-25px',
                    left: '-25px',
                    background: 'var(--accent-blue, #3b82f6)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '74px',
                    height: '74px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.4rem',
                    fontWeight: 800,
                    border: highlights?.subLabel ? `6px solid ${highlights.subLabel}` : '4px solid var(--bg-secondary)',
                    zIndex: 2
                }}>
                    {subLabel}
                </div>
            )}

            <div style={{ fontSize: label.length > 12 ? '1.4rem' : '1.8rem', fontWeight: 800, color: 'var(--text-main)', textAlign: 'center', width: '100%', wordBreak: 'break-word', lineHeight: 1.1 }}>
                {label}
            </div>

            {reading && variant === 'full' && (
                <div style={{
                    background: 'var(--bg-main)',
                    padding: '8px 24px',
                    borderRadius: 'var(--radius-sm)',
                    border: highlights?.lifepath ? `3px solid ${highlights.lifepath}` : '2px solid var(--border-color)',
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: 'var(--shadow-sm)'
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
            )}

            <div className="card" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input
                        type="number"
                        value={day}
                        onChange={(e) => {
                            let val = parseInt(e.target.value, 10);
                            if (isNaN(val)) val = 1;
                            onDayChange(val);
                        }}
                        onFocus={(e) => e.target.select()}
                        min="1" max="31"
                        style={{
                            fontSize: '2rem',
                            color: 'var(--text-secondary)',
                            width: '50px',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            textAlign: 'center',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
                
                <div style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--border-color)' }}>/</div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <select
                        value={month}
                        onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
                        style={{
                            appearance: 'none',
                            fontSize: '2rem',
                            color: 'var(--text-secondary)',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontFamily: 'inherit'
                        }}
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                        ))}
                    </select>
                </div>
                
                <div style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--border-color)' }}>/</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => {
                            let valRaw = e.target.value;
                            if (valRaw === '' || valRaw === '-') onYearChange(valRaw);
                            else onYearChange(isNaN(parseInt(valRaw, 10)) ? 2000 : parseInt(valRaw, 10));
                        }}
                        onFocus={(e) => e.target.select()}
                        style={{
                            fontSize: '2rem',
                            color: 'var(--text-secondary)',
                            width: '80px',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            textAlign: 'center',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
            </div>

            {reading && (
                <div style={{ display: 'grid', gridTemplateColumns: variant === 'stadium' ? '1fr' : 'repeat(4, 1fr)', gap: '8px', width: '100%' }}>
                    {/* Sky Sign Card */}
                    {variant === 'full' && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 8px', textAlign: 'center', border: highlights?.skySign ? `3px solid ${highlights.skySign}` : undefined }}>
                            <div style={{ fontSize: '2.5rem', lineHeight: 1, marginBottom: '8px' }}>
                                {reading.skySign.emoji}
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                {t(reading.skySign.name)}
                            </div>
                        </div>
                    )}

                    {/* Secondary Energy / Lucky */}
                    {variant === 'full' && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 8px', textAlign: 'center', border: highlights?.luckyNumber || highlights?.day ? `3px solid ${highlights.luckyNumber || highlights.day}` : undefined }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                {day}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                {t('sec. energy')}
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {reading.luckyNumber.base !== reading.luckyNumber.flipped ? (
                                    <>
                                        <span>{reading.luckyNumber.base}</span>
                                        <span style={{ fontSize: '0.8rem', opacity: 0.6, margin: '0 2px' }}>/</span>
                                        <span>{reading.luckyNumber.flipped}</span>
                                    </>
                                ) : reading.luckyNumber.base}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                {t('Lucky #')}
                            </div>
                        </div>
                    )}

                    {/* Earth Month Sign Card */}
                    {variant === 'full' && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 8px', textAlign: 'center', border: highlights?.monthSign ? `3px solid ${highlights.monthSign}` : undefined }}>
                             <div style={{ fontSize: '2.5rem', lineHeight: 1, marginBottom: '8px' }}>
                                {reading.monthSign.emoji}
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                {t(reading.monthSign.name)}
                            </div>
                        </div>
                    )}

                    {/* Earth Sign Card */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 8px', textAlign: 'center', border: highlights?.earthSign ? `3px solid ${highlights.earthSign}` : undefined }}>
                         <div style={{ fontSize: '2.5rem', lineHeight: 1, marginBottom: '8px' }}>
                            {reading.earthSign.emoji}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>
                            {t(reading.earthSign.name)}
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
