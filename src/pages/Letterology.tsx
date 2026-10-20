import { useState, useEffect } from 'react';
import { calculateLetterology, reduceNumber } from '../engine/numerology';
import { useSettings } from '../context/SettingsContext';

interface LetterDetails {
    char: string;
    original: number;
    reduced: number;
}

export default function Letterology() {
    const { t, language } = useSettings();
    const [text, setText] = useState(() => localStorage.getItem('letText') || '');
    const [numberInput, setNumberInput] = useState<string>(() => localStorage.getItem('letNum') || '');

    useEffect(() => {
        localStorage.setItem('letText', text);
        localStorage.setItem('letNum', numberInput);
    }, [text, numberInput]);

    const { originalSum, reducedSum, reduced, letters } = text
        ? calculateLetterology(text)
        : { originalSum: 0, reducedSum: 0, reduced: 0, letters: [] as LetterDetails[] };
    const numReduced = numberInput ? reduceNumber(parseInt(numberInput, 10)) : null;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto', padding: '0 var(--spacing-md) var(--spacing-2xl)' }}>

            {/* Header section with esoteric tone */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)', position: 'relative' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg, var(--text-main) 30%, var(--accent-purple) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 'var(--spacing-xs)'
                }}>
                    {t('Text & Number Reduction')}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                    {language === 'en'
                        ? 'Deconstruct letters and numbers into their core energetic vibrations.'
                        : 'Déconstruisez les lettres et les nombres en leurs vibrations énergétiques fondamentales.'
                    }
                </p>
                <div style={{
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-gold))',
                    margin: 'var(--spacing-md) auto 0',
                    borderRadius: 'var(--radius-full)'
                }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

                {/* Letterology */}
                <div className="card" style={{
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-md)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-xl)',
                    background: 'var(--bg-main)',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Decorative glow effect */}
                    <div style={{
                        position: 'absolute',
                        top: '-10%',
                        right: '-10%',
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'var(--accent-purple)',
                        filter: 'blur(70px)',
                        opacity: 0.1,
                        pointerEvents: 'none'
                    }} />

                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <span style={{ color: 'var(--accent-purple)' }}>✦</span> {t('Alphabet / Letterology')}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--spacing-lg)' }}>
                        {language === 'en'
                            ? 'Find the Matrix value of a name or word. Simple Gematria (reduced individually): A=1, B=2, C=3... Z=26.'
                            : 'Trouvez la valeur d\'un nom ou d\'un mot. Guématrie simple (réduite individuellement) : A=1, B=2, C=3... Z=26.'
                        }
                    </p>

                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        placeholder={t('Search for celebrities or countries...')}
                        className="input-field"
                        style={{
                            width: '100%',
                            marginBottom: 'var(--spacing-xl)',
                            padding: 'var(--spacing-md)',
                            fontSize: '1.1rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxShadow: 'inset var(--shadow-sm)'
                        }}
                    />

                    {text && (
                        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

                            {/* Grid of letter tiles */}
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', justifyContent: 'center', padding: 'var(--spacing-md) 0' }}>
                                {letters.map((item, i) => (
                                    <div
                                        key={i}
                                        className="letter-tile"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            minWidth: '52px',
                                            padding: 'var(--spacing-sm) var(--spacing-xs)',
                                            background: 'var(--bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--border-color)',
                                            boxShadow: 'var(--shadow-sm)',
                                            transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                                            cursor: 'default',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                            e.currentTarget.style.borderColor = 'var(--accent-purple)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                            e.currentTarget.style.borderColor = 'var(--border-color)';
                                        }}
                                    >
                                        <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--text-main)' }}>{item.char}</div>
                                        <div style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', fontWeight: 500 }}>{item.original}</div>
                                        {item.original > 9 ? (
                                            <div style={{
                                                marginTop: '4px',
                                                color: 'var(--accent-purple)',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                background: 'rgba(153, 51, 255, 0.1)',
                                                padding: '2px 6px',
                                                borderRadius: 'var(--radius-full)'
                                            }}>
                                                → {item.reduced}
                                            </div>
                                        ) : (
                                            <div style={{ height: '22px' }} /> // Spacer to keep heights identical
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Result Display widget with premium styling */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
                                padding: 'var(--spacing-lg)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-color)',
                                gap: 'var(--spacing-md)'
                            }}>
                                {/* Symmetrical Columns */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-around',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-md)',
                                    flexWrap: 'wrap',
                                    width: '100%'
                                }}>
                                    <div style={{ textAlign: 'center', flex: 1, minWidth: '120px' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                            {t('Unreduced Form')}
                                        </div>
                                        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{originalSum}</div>
                                    </div>

                                    <div className="letterology-star" style={{
                                        fontSize: '2rem',
                                        color: 'var(--accent-purple)',
                                        opacity: 0.6,
                                    }}>
                                        ✦
                                    </div>

                                    <div style={{ textAlign: 'center', flex: 1, minWidth: '120px' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                                            {t('Matrix Value')}
                                        </div>
                                        <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-purple)', lineHeight: 1 }}>{reduced}</div>
                                    </div>
                                </div>

                                {/* Centered Reduction Detail at the bottom */}
                                {originalSum > 0 && (originalSum !== reduced || reducedSum !== reduced) && (
                                    <div style={{
                                        textAlign: 'center',
                                        width: '100%',
                                        borderTop: '1px dashed var(--border-color)',
                                        paddingTop: 'var(--spacing-md)',
                                        marginTop: 'var(--spacing-xs)'
                                    }}>
                                        <div style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            background: 'var(--bg-main)',
                                            display: 'inline-block',
                                            padding: '4px 16px',
                                            borderRadius: 'var(--radius-full)',
                                            border: '1px solid var(--border-color)',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}>
                                            {originalSum} → {reducedSum} → {reduced}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Number Reduction */}
                <div className="card" style={{
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-md)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-xl)',
                    background: 'var(--bg-main)',
                    position: 'relative'
                }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                        <span style={{ color: 'var(--accent-gold)' }}>✦</span> {t('Number Reduction')}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--spacing-lg)' }}>
                        {language === 'en'
                            ? 'Reduce any large number using Numerology rules (Master numbers 11, 22, 33 are kept intact).'
                            : 'Réduisez n\'importe quel grand nombre avec les règles de la Numérologie (les Maîtres Nombres 11, 22, 33 sont préservés).'
                        }
                    </p>

                    <input
                        type="number"
                        value={numberInput}
                        onChange={(e) => setNumberInput(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        placeholder={t('e.g., 2026, 45, 999')}
                        className="input-field"
                        style={{
                            width: '100%',
                            marginBottom: 'var(--spacing-xl)',
                            padding: 'var(--spacing-md)',
                            fontSize: '1.1rem',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxShadow: 'inset var(--shadow-sm)'
                        }}
                    />

                    {numberInput && numReduced !== null && (
                        <div className="animate-fade-in" style={{
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))',
                            padding: 'var(--spacing-xl)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-sm)' }}>
                                {t('Reduced Form')}
                            </div>
                            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--accent-gold)', lineHeight: 1 }}>
                                {numReduced}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
