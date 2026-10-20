import React from 'react';
import { Lock } from 'lucide-react';

interface LockedBoxProps {
    minHeight?: string | number;
    size?: number;
    title?: string;
    style?: React.CSSProperties;
    showLabel?: boolean;
}

export const LockedBox: React.FC<LockedBoxProps> = ({
    minHeight = '100%',
    size = 28,
    title,
    style = {},
    showLabel = false,
}) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                minHeight,
                color: 'var(--text-tertiary, #888888)',
                padding: '12px 8px',
                boxSizing: 'border-box',
                userSelect: 'none',
                opacity: 0.65,
                ...style,
            }}
            title={title || 'Locked in Numerastrologie Pro'}
        >
            <Lock size={size} strokeWidth={2.2} />
            {showLabel && (
                <span
                    style={{
                        marginTop: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'inherit',
                    }}
                >
                    Pro
                </span>
            )}
        </div>
    );
};

export default LockedBox;
