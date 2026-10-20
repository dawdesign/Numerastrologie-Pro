import { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { EARTH_SIGN_DESCRIPTIONS } from '../engine/personalityData';

// Zodiac signs configurations matching order on the wheel:
// 1: Rat (Top / 12 o'clock / i = 0)
// 2: Boeuf (Ox / i = 1)
// 3: Tigre (Tiger / i = 2)
// 4: Chat (Cat / i = 3)
// 5: Dragon (i = 4)
// 6: Serpent (i = 5)
// 7: Cheval (Horse / i = 6)
// 8: Chèvre (Goat / i = 7)
// 9: Singe (Monkey / i = 8)
// 10: Coq (Rooster / i = 9)
// 11: Chien (Dog / i = 10)
// 12: Cochon (Pig / i = 11)
const ZODIAC_WHEEL_SIGNS = [
    { id: 0, name: 'Rat', nameFr: 'RAT', emoji: '🐀', number: 1 },
    { id: 1, name: 'Boeuf', nameFr: 'BOEUF', emoji: 'BOEUF', number: 2 },
    { id: 2, name: 'Tigre', nameFr: 'TIGRE', emoji: '🐅', number: 3 },
    { id: 3, name: 'Chat', nameFr: 'CHAT', emoji: '🐈', number: 4 },
    { id: 4, name: 'Dragon', nameFr: 'DRAGON', emoji: '🐉', number: 5 },
    { id: 5, name: 'Serpent', nameFr: 'SERPENT', emoji: '🐍', number: 6 },
    { id: 6, name: 'Cheval', nameFr: 'CHEVAL', emoji: '🐎', number: 7 },
    { id: 7, name: 'Chèvre', nameFr: 'CHEVRE', emoji: '🐐', number: 8 },
    { id: 8, name: 'Singe', nameFr: 'SINGE', emoji: '🐒', number: 9 },
    { id: 9, name: 'Coq', nameFr: 'COQ', emoji: '🐓', number: 10 },
    { id: 10, name: 'Chien', nameFr: 'CHIEN', emoji: '🐕', number: 11 },
    { id: 11, name: 'Cochon', nameFr: 'COCHON', emoji: '🐖', number: 12 }
];

export const ZODIAC_DESCRIPTIONS_TXT: Record<string, Record<string, string[]>> = {
    fr: {
        Rat: EARTH_SIGN_DESCRIPTIONS.fr[0],
        Boeuf: EARTH_SIGN_DESCRIPTIONS.fr[1],
        Tigre: EARTH_SIGN_DESCRIPTIONS.fr[2],
        Chat: EARTH_SIGN_DESCRIPTIONS.fr[3],
        Dragon: EARTH_SIGN_DESCRIPTIONS.fr[4],
        Serpent: EARTH_SIGN_DESCRIPTIONS.fr[5],
        Cheval: EARTH_SIGN_DESCRIPTIONS.fr[6],
        Chèvre: EARTH_SIGN_DESCRIPTIONS.fr[7],
        Singe: EARTH_SIGN_DESCRIPTIONS.fr[8],
        Coq: EARTH_SIGN_DESCRIPTIONS.fr[9],
        Chien: EARTH_SIGN_DESCRIPTIONS.fr[10],
        Cochon: EARTH_SIGN_DESCRIPTIONS.fr[11]
    },
    en: {
        Rat: EARTH_SIGN_DESCRIPTIONS.en[0],
        Boeuf: EARTH_SIGN_DESCRIPTIONS.en[1],
        Tigre: EARTH_SIGN_DESCRIPTIONS.en[2],
        Chat: EARTH_SIGN_DESCRIPTIONS.en[3],
        Dragon: EARTH_SIGN_DESCRIPTIONS.en[4],
        Serpent: EARTH_SIGN_DESCRIPTIONS.en[5],
        Cheval: EARTH_SIGN_DESCRIPTIONS.en[6],
        Chèvre: EARTH_SIGN_DESCRIPTIONS.en[7],
        Singe: EARTH_SIGN_DESCRIPTIONS.en[8],
        Coq: EARTH_SIGN_DESCRIPTIONS.en[9],
        Chien: EARTH_SIGN_DESCRIPTIONS.en[10],
        Cochon: EARTH_SIGN_DESCRIPTIONS.en[11]
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

export default function WikiAstrologyWheel() {
    const { t, language } = useSettings();
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const [rotationAngle, setRotationAngle] = useState<number>(0);

    // Calculate shortest angular path so the wheel never does a full revolution needlessly
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

    // Radius specifications matching concentric bands
    const rOuterMax = 190;
    const rOuterMin = 140;
    const rMiddleMin = 95;
    const rInnerMin = 50;

    // Check relationship categories for any segment index
    const getSegmentStatus = (idx: number) => {
        if (idx === selectedIndex) return 'selected';
        
        // Trines (Friendly)
        if (idx === (selectedIndex + 4) % 12 || idx === (selectedIndex + 8) % 12) {
            return 'friendly';
        }
        // Clash (Opposing Enemy)
        if (idx === (selectedIndex + 6) % 12) {
            return 'enemy';
        }
        return 'neutral';
    };

    // Calculate segment colors
    const getSegmentColors = (status: 'selected' | 'friendly' | 'enemy' | 'neutral') => {
        switch (status) {
            case 'selected':
                return {
                    outer: 'rgba(46, 204, 113, 0.45)', // Richer green
                    middle: 'rgba(46, 204, 113, 0.25)',
                    inner: 'rgba(46, 204, 113, 0.35)',
                    stroke: '#2ecc71',
                    strokeWidth: 2
                };
            case 'friendly':
                return {
                    outer: 'rgba(46, 204, 113, 0.25)', // Softer green
                    middle: 'rgba(46, 204, 113, 0.15)',
                    inner: 'rgba(46, 204, 113, 0.2)',
                    stroke: 'rgba(46, 204, 113, 0.45)',
                    strokeWidth: 1.5
                };
            case 'enemy':
                return {
                    outer: 'rgba(231, 76, 60, 0.35)',  // Soft red
                    middle: 'rgba(231, 76, 60, 0.2)',
                    inner: 'rgba(231, 76, 60, 0.25)',
                    stroke: '#e74c3c',
                    strokeWidth: 2
                };
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

    const activeSign = ZODIAC_WHEEL_SIGNS[selectedIndex];
    const activeBullets = ZODIAC_DESCRIPTIONS_TXT[language === 'fr' ? 'fr' : 'en']?.[activeSign.name] || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-xl)', width: '100%' }}>
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
                        <filter id="glow-selected" x="-10%" y="-10%" width="120%" height="120%">
                            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#2ecc71" floodOpacity="0.3" />
                        </filter>
                        <filter id="glow-enemy" x="-10%" y="-10%" width="120%" height="120%">
                            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#e74c3c" floodOpacity="0.3" />
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
                        {ZODIAC_WHEEL_SIGNS.map((sign, i) => {
                            const startAngle = i * 30 - 15;
                            const endAngle = i * 30 + 15;
                            const status = getSegmentStatus(i);
                            const colors = getSegmentColors(status);

                            const counterRotate = -(i * 30 + rotationAngle);

                            return (
                                <g 
                                    key={sign.id} 
                                    onClick={() => handleSelectIndex(i)}
                                    style={{
                                        filter: status === 'selected' ? 'url(#glow-selected)' : status === 'enemy' ? 'url(#glow-enemy)' : 'none'
                                    }}
                                >
                                    {/* 1. Outer band (Emoji) */}
                                    <path 
                                        d={getSectorPath(cx, cy, rOuterMax, rOuterMin, startAngle, endAngle)}
                                        fill={colors.outer}
                                        stroke={colors.stroke}
                                        strokeWidth={colors.strokeWidth}
                                        style={{ transition: 'fill 0.4s ease, stroke 0.4s ease' }}
                                    />
                                    {/* 2. Middle band (Label) */}
                                    <path 
                                        d={getSectorPath(cx, cy, rOuterMin, rMiddleMin, startAngle, endAngle)}
                                        fill={colors.middle}
                                        stroke={colors.stroke}
                                        strokeWidth={colors.strokeWidth}
                                        style={{ transition: 'fill 0.4s ease, stroke 0.4s ease' }}
                                    />
                                    {/* 3. Inner band (Index number) */}
                                    <path 
                                        d={getSectorPath(cx, cy, rMiddleMin, rInnerMin, startAngle, endAngle)}
                                        fill={colors.inner}
                                        stroke={colors.stroke}
                                        strokeWidth={colors.strokeWidth}
                                        style={{ transition: 'fill 0.4s ease, stroke 0.4s ease' }}
                                    />

                                    {/* Segment Content (Rotated to segment direction) */}
                                    <g transform={`translate(${cx}, ${cy}) rotate(${i * 30})`}>
                                        {/* Outer Band: Emoji */}
                                        <text 
                                            x="0" 
                                            y="-165" 
                                            textAnchor="middle" 
                                            dominantBaseline="middle" 
                                            transform={`rotate(${counterRotate}, 0, -165)`}
                                            style={{ 
                                                fontSize: '1.65rem', 
                                                userSelect: 'none',
                                                pointerEvents: 'none',
                                                transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
                                            }}
                                        >
                                            {sign.emoji === 'BOEUF' ? '🐂' : sign.emoji}
                                        </text>

                                        {/* Middle Band: Name */}
                                        <text 
                                            x="0" 
                                            y="-117" 
                                            textAnchor="middle" 
                                            dominantBaseline="middle" 
                                            transform={`rotate(${counterRotate}, 0, -117)`}
                                            style={{ 
                                                fontSize: '0.65rem', 
                                                fontWeight: 700, 
                                                letterSpacing: '0.05em',
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
                                                fontSize: '1rem', 
                                                fontWeight: 800, 
                                                fill: status === 'neutral' ? 'var(--text-tertiary)' : 'var(--text-main)',
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
                        stroke="var(--border-color)" 
                        strokeWidth="1" 
                    />
                </svg>

                {/* Decorative absolute selector arrow pointing to the top */}
                <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '12px solid transparent',
                    borderRight: '12px solid transparent',
                    borderTop: '16px solid var(--accent-purple, #8b5cf6)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                    pointerEvents: 'none',
                    zIndex: 20
                }} />
            </div>

            {/* Premium details legend */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 'var(--spacing-md)', 
                fontSize: '0.85rem', 
                flexWrap: 'wrap',
                marginTop: '-10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(46, 204, 113, 0.45)', border: '1px solid #2ecc71', borderRadius: '3px' }}></div>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{t('Selected')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(46, 204, 113, 0.2)', border: '1px solid rgba(46, 204, 113, 0.45)', borderRadius: '3px' }}></div>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{t('Friendly (Trine)')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '12px', height: '12px', background: 'rgba(231, 76, 60, 0.35)', border: '1px solid #e74c3c', borderRadius: '3px' }}></div>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{t('Opposite (Enemy)')}</span>
                </div>
            </div>

            {/* Description Card Underneath */}
            <div className="card animate-fade-in" style={{ 
                width: '100%', 
                maxWidth: '650px',
                display: 'flex', 
                gap: 'var(--spacing-lg)', 
                alignItems: 'flex-start',
                background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
                border: '1px solid var(--border-color)',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--radius-lg)'
            }}>
                <div style={{
                    fontSize: '4.5rem',
                    lineHeight: 1,
                    minWidth: '85px',
                    textAlign: 'center',
                    borderRight: '1px solid var(--border-color)',
                    paddingRight: 'var(--spacing-lg)',
                    marginTop: '-4px'
                }}>
                    {activeSign.emoji === 'BOEUF' ? '🐂' : activeSign.emoji}
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ 
                        margin: '0 0 var(--spacing-sm) 0', 
                        fontSize: '1.4rem', 
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {t(activeSign.name)}
                        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>
                            (N° {activeSign.number})
                        </span>
                    </h3>
                    <ul style={{ 
                        margin: 0, 
                        paddingLeft: 'var(--spacing-md)', 
                        color: 'var(--text-main)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '6px' 
                    }}>
                        {activeBullets.map((bullet, idx) => (
                            <li key={idx} style={{ lineHeight: '1.45', fontSize: '0.95rem' }}>{bullet}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
