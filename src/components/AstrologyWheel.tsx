import { EARTH_SIGNS, checkEarthSignCompatibility } from '../engine/astrology';

interface AstrologyWheelProps {
    yearSignId: number;   // 0 to 11
    monthSignId: number;  // 0 to 11
}

export default function AstrologyWheel({ yearSignId, monthSignId }: AstrologyWheelProps) {
    const signsInfo = [
        { id: 0, name: 'Rat', emoji: '🐀', dates: '7 Déc - 5 Jan' },
        { id: 1, name: 'Boeuf', emoji: '🐂', dates: '6 Jan - 3 Fév' },
        { id: 2, name: 'Tigre', emoji: '🐅', dates: '4 Fév - 5 Mars' },
        { id: 3, name: 'Chat', emoji: '🐈', dates: '6 Mars - 4 Avr' },
        { id: 4, name: 'Dragon', emoji: '🐉', dates: '5 Avr - 5 Mai' },
        { id: 5, name: 'Serpent', emoji: '🐍', dates: '6 Mai - 5 Juin' },
        { id: 6, name: 'Cheval', emoji: '🐎', dates: '6 Juin - 6 Juil' },
        { id: 7, name: 'Chèvre', emoji: '🐐', dates: '7 Juil - 7 Août' },
        { id: 8, name: 'Singe', emoji: '🐒', dates: '8 Août - 7 Sept' },
        { id: 9, name: 'Coq', emoji: '🐓', dates: '8 Sept - 7 Oct' },
        { id: 10, name: 'Chien', emoji: '🐕', dates: '8 Oct - 6 Nov' },
        { id: 11, name: 'Cochon', emoji: '🐖', dates: '7 Nov - 6 Déc' }
    ];

    const cx = 200;
    const cy = 200;
    const outerRadius = 180;
    const innerRadius = 120;
    const textRadius = 150;
    const nodesRadius = 90;

    // Helper to calculate coordinates
    const getCoords = (angleInDegrees: number, r: number) => {
        const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
        return {
            x: cx + r * Math.cos(angleInRadians),
            y: cy + r * Math.sin(angleInRadians)
        };
    };

    // Personal signs nodes coordinates
    const yearNode = getCoords(yearSignId * 30, nodesRadius);
    const monthNode = getCoords(monthSignId * 30, nodesRadius);


    // Detect compatibilities for line drawing
    const getLineStroke = (id1: number, id2: number) => {
        const sign1 = EARTH_SIGNS[id1];
        const sign2 = EARTH_SIGNS[id2];
        const compat = checkEarthSignCompatibility(sign1, sign2);

        if (compat === 'Soulmate' || compat === 'Friend') {
            return '#10b981'; // Green for friends/soulmates
        } else if (compat === 'Enemy') {
            return '#ef4444'; // Red for enemies
        }
        return '#d4af37'; // Gold default for neutral connections
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '420px', margin: '0 auto' }}>
            <svg 
                viewBox="0 0 400 400" 
                style={{ 
                    width: '100%', 
                    height: 'auto', 
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.06))'
                }}
            >
                {/* Defs for gradients & shadow masks */}
                <defs>
                    <radialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#fcfbfa" stopOpacity={1} />
                    </radialGradient>
                    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.08" />
                    </filter>
                    <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#d4af37" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
                    </radialGradient>
                </defs>

                {/* Center Glow for premium touch */}
                <circle cx={cx} cy={cy} r={innerRadius} fill="url(#centerGlow)" />

                {/* Outer decorative ring */}
                <circle cx={cx} cy={cy} r={outerRadius} fill="none" stroke="#d4af37" strokeWidth="1" strokeOpacity={0.3} />
                <circle cx={cx} cy={cy} r={outerRadius + 8} fill="none" stroke="#d4af37" strokeWidth="0.5" strokeOpacity={0.2} />

                {/* Main Wheel Circle */}
                <circle cx={cx} cy={cy} r={outerRadius} fill="url(#wheelBg)" stroke="#1a1a1a" strokeWidth="1.5" />
                <circle cx={cx} cy={cy} r={innerRadius} fill="none" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="3 3" strokeOpacity={0.5} />

                {/* Sectors & Labels */}
                {signsInfo.map((sign, i) => {
                    const angle = i * 30;
                    const dividerCoords = getCoords(angle - 15, outerRadius);
                    const dividerInnerCoords = getCoords(angle - 15, innerRadius);
                    const labelCoords = getCoords(angle, textRadius);
                    
                    const isYear = i === yearSignId;
                    const isMonth = i === monthSignId;
                    const isActive = isYear || isMonth;

                    // Compute clean rotation for label text so it is always readable
                    let textRotation = angle;
                    if (angle > 90 && angle < 270) {
                        textRotation += 180; // Flip text upside down to make it readable
                    }

                    return (
                        <g key={sign.id}>
                            {/* Sector Divider Lines */}
                            <line 
                                x1={dividerInnerCoords.x} 
                                y1={dividerInnerCoords.y} 
                                x2={dividerCoords.x} 
                                y2={dividerCoords.y} 
                                stroke="#1a1a1a" 
                                strokeWidth="0.5" 
                                strokeOpacity={0.2} 
                            />

                            {/* Background Highlight for active signs */}
                            {isActive && (
                                <circle 
                                    cx={labelCoords.x} 
                                    cy={labelCoords.y} 
                                    r="22" 
                                    fill={isYear ? '#d4af37' : '#10b981'} 
                                    fillOpacity={0.12} 
                                />
                            )}

                            {/* Label Group */}
                            <g transform={`translate(${labelCoords.x}, ${labelCoords.y}) rotate(${textRotation})`}>
                                {/* Emoji */}
                                <text 
                                    x="0" 
                                    y="-12" 
                                    textAnchor="middle" 
                                    dominantBaseline="middle" 
                                    style={{ fontSize: '14px', fontFamily: 'system-ui' }}
                                >
                                    {sign.emoji}
                                </text>
                                
                                {/* Sign Name */}
                                <text 
                                    x="0" 
                                    y="2" 
                                    textAnchor="middle" 
                                    dominantBaseline="middle" 
                                    style={{ 
                                        fontSize: '8.5px', 
                                        fontWeight: isActive ? 700 : 500,
                                        fontFamily: 'Inter, sans-serif',
                                        fill: isYear ? '#a18218' : isMonth ? '#0f766e' : '#1a1a1a'
                                    }}
                                >
                                    {sign.name}
                                </text>

                                 <text 
                                    x="0" 
                                    y="12" 
                                    textAnchor="middle" 
                                    dominantBaseline="middle" 
                                    style={{ 
                                        fontSize: '5.5px', 
                                        fontWeight: 400,
                                        fontFamily: 'Inter, sans-serif',
                                        fill: '#666666'
                                    }}
                                >
                                    {sign.dates}
                                </text>
                            </g>
                        </g>
                    );
                })}

                {/* INNER ASTROLOGY MAP CONNECTIONS */}
                {/* Connection lines between year and month nodes */}
                <line 
                    x1={yearNode.x} 
                    y1={yearNode.y} 
                    x2={monthNode.x} 
                    y2={monthNode.y} 
                    stroke={getLineStroke(yearSignId, monthSignId)} 
                    strokeWidth="1.5" 
                    strokeDasharray={yearSignId === monthSignId ? "0" : "3 3"} 
                    opacity={yearSignId === monthSignId ? 0 : 0.8}
                />

                {/* INNER ACTIVE NODES */}
                {/* Year Sign Node */}
                <g filter="url(#shadow)">
                    <circle cx={yearNode.x} cy={yearNode.y} r="14" fill="#ffffff" stroke="#d4af37" strokeWidth="2.5" />
                    <text 
                        x={yearNode.x} 
                        y={yearNode.y} 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        style={{ fontSize: '10px', fontWeight: 800, fill: '#d4af37', fontFamily: 'Georgia, serif' }}
                    >
                        A
                    </text>
                </g>

                {/* Month Sign Node */}
                {yearSignId !== monthSignId && (
                    <g filter="url(#shadow)">
                        <circle cx={monthNode.x} cy={monthNode.y} r="12" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                        <text 
                            x={monthNode.x} 
                            y={monthNode.y} 
                            textAnchor="middle" 
                            dominantBaseline="middle" 
                            style={{ fontSize: '9px', fontWeight: 800, fill: '#10b981', fontFamily: 'Georgia, serif' }}
                        >
                            M
                        </text>
                    </g>
                )}



                {/* Inner central graphic (Zen / Lotus / Star style) */}
                <circle cx={cx} cy={cy} r="6" fill="#1a1a1a" />
                <circle cx={cx} cy={cy} r="2" fill="#ffffff" />
            </svg>

            {/* Premium Legend */}
            <div style={{ 
                display: 'flex', 
                gap: '12px', 
                fontSize: '0.75rem', 
                marginTop: '16px', 
                fontWeight: 600,
                color: '#666666',
                fontFamily: 'Inter, sans-serif'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d4af37', display: 'inline-block' }}></span>
                    <span>Année (A)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                    <span>Mois (M)</span>
                </div>
            </div>
        </div>
    );
}
