import type { ZodiacSign } from '../engine/astrology';

interface SignProps {
    sign: ZodiacSign;
    size?: number;
}

export function EarthSignEmoji({ sign, size = 24 }: SignProps) {
    return (
        <span
            title={sign.name}
            style={{
                fontSize: `${size}px`,
                lineHeight: 1,
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {sign.emoji}
        </span>
    );
}

export function SkySignEmoji({ sign, size = 24 }: { sign: { name: string, emoji: string }, size?: number }) {
    return (
        <span
            title={sign.name}
            style={{
                fontSize: `${size}px`,
                lineHeight: 1,
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'inherit'
            }}
        >
            {sign.emoji}
        </span>
    );
}
