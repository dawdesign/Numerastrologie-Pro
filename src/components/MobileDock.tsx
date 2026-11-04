import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Calendar, Search, Hash, BookOpen } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useEffect, useState, useRef, useCallback } from 'react';
import './MobileDock.css';

const NAV_ITEMS = [
    { name: 'Calculator', shortEn: 'Calc', shortFr: 'Calcul', path: '/', icon: Compass },
    { name: 'Calendar/Horoscope', shortEn: 'Calendar', shortFr: 'Calendrier', path: '/calendar', icon: Calendar },
    { name: 'Equation/Finder', shortEn: 'Finder', shortFr: 'Recherche', path: '/equation', icon: Search },
    { name: 'Letterology', shortEn: 'Letters', shortFr: 'Lettres', path: '/letterology', icon: Hash },
    { name: 'Wiki', shortEn: 'Wiki', shortFr: 'Wiki', path: '/wiki', icon: BookOpen },
];

function detectMobilePlatform(): 'ios' | 'android' {
    if (typeof navigator === 'undefined') return 'ios';
    const ua = navigator.userAgent.toLowerCase();
    const uaDataPlatform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform?.toLowerCase() || '';
    if (/android/.test(ua) || /android/.test(uaDataPlatform)) {
        return 'android';
    }
    return 'ios';
}

export default function MobileDock() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, language } = useSettings();
    const [platform, setPlatform] = useState<'ios' | 'android'>(detectMobilePlatform);

    const pillRef = useRef<HTMLDivElement>(null);
    const selectorRef = useRef<HTMLDivElement>(null);

    const routeIndex = NAV_ITEMS.findIndex(
        (item) =>
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
    );

    const [activeIndex, setActiveIndex] = useState<number>(routeIndex);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // Physics / drag tracking refs
    const dragStateRef = useRef({
        active: false,
        pointerId: -1,
        startX: 0,
        lastX: 0,
        lastTime: 0,
        velocity: 0,
        currentIndexFloat: Math.max(0, routeIndex),
        hasMoved: false,
    });

    const prevRouteIndexRef = useRef<number>(routeIndex);

    // Dynamically detect platform changes (including live switching in Chrome DevTools Device Toolbar)
    useEffect(() => {
        const checkPlatform = () => {
            const detected = detectMobilePlatform();
            setPlatform((prev) => (prev !== detected ? detected : prev));
        };

        checkPlatform();
        window.addEventListener('resize', checkPlatform);
        window.addEventListener('orientationchange', checkPlatform);
        // Poll every 400ms so switching devices in DevTools with same dimensions also updates immediately
        const interval = window.setInterval(checkPlatform, 400);

        return () => {
            window.removeEventListener('resize', checkPlatform);
            window.removeEventListener('orientationchange', checkPlatform);
            window.clearInterval(interval);
        };
    }, []);

    // Apply selector transform with liquid squash & stretch
    const updateSelectorVisuals = useCallback(
        (indexFloat: number, scaleX: number, scaleY: number, animated: boolean) => {
            const el = selectorRef.current;
            if (!el) return;
            el.style.transition = animated
                ? 'transform 0.46s cubic-bezier(0.22, 1.35, 0.36, 1), opacity 0.2s ease, background 0.25s ease, box-shadow 0.25s ease'
                : 'none';
            el.style.transform = `translate3d(${indexFloat * 100}%, 0, 0) scale3d(${scaleX}, ${scaleY}, 1)`;
        },
        []
    );

    // Sync with route changes (including click jumps with liquid stretch)
    useEffect(() => {
        setActiveIndex(routeIndex);
        if (!dragStateRef.current.active) {
            if (routeIndex < 0) {
                // On /settings (outside dock): keep selector at last position but hidden via opacity
                prevRouteIndexRef.current = routeIndex;
                return;
            }

            const prevIdx = prevRouteIndexRef.current >= 0 ? prevRouteIndexRef.current : routeIndex;
            const dist = Math.abs(routeIndex - prevIdx);
            prevRouteIndexRef.current = routeIndex;

            if (dist > 0) {
                // Liquid stretch impulse when jumping between tabs
                const stretchX = Math.min(1.32, 1.08 + dist * 0.05);
                const squashY = Math.max(0.84, 1 - (stretchX - 1) * 0.45);
                updateSelectorVisuals(routeIndex, stretchX, squashY, true);
                const timer = setTimeout(() => {
                    if (!dragStateRef.current.active) {
                        updateSelectorVisuals(routeIndex, 1, 1, true);
                    }
                }, 170);
                return () => clearTimeout(timer);
            } else {
                updateSelectorVisuals(routeIndex, 1, 1, true);
            }
        }
    }, [routeIndex, updateSelectorVisuals]);

    const getIndexFloatFromClientX = (clientX: number): number => {
        const pill = pillRef.current;
        if (!pill) return Math.max(0, routeIndex);
        const rect = pill.getBoundingClientRect();
        const pad = 6; // horizontal inner padding of dock-pill
        const innerWidth = rect.width - pad * 2;
        const slotWidth = innerWidth / NAV_ITEMS.length;
        const relX = clientX - rect.left - pad - slotWidth / 2;
        const rawIdx = relX / slotWidth;
        // Rubber-band resistance past the edges (0 .. 4)
        if (rawIdx < 0) {
            return Math.max(-0.22, rawIdx * 0.22);
        }
        if (rawIdx > NAV_ITEMS.length - 1) {
            const over = rawIdx - (NAV_ITEMS.length - 1);
            return Math.min(NAV_ITEMS.length - 1 + 0.22, NAV_ITEMS.length - 1 + over * 0.22);
        }
        return rawIdx;
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        const pill = pillRef.current;
        if (!pill) return;

        pill.setPointerCapture(e.pointerId);
        const idxFloat = getIndexFloatFromClientX(e.clientX);
        const nearestIdx = Math.max(0, Math.min(NAV_ITEMS.length - 1, Math.round(idxFloat)));

        dragStateRef.current = {
            active: true,
            pointerId: e.pointerId,
            startX: e.clientX,
            lastX: e.clientX,
            lastTime: performance.now(),
            velocity: 0,
            currentIndexFloat: idxFloat,
            hasMoved: false,
        };

        setIsDragging(true);
        setActiveIndex(nearestIdx);

        // Immediate tactile liquid expansion on press
        updateSelectorVisuals(idxFloat, 1.08, 0.94, true);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const st = dragStateRef.current;
        if (!st.active || e.pointerId !== st.pointerId) return;

        const now = performance.now();
        const dt = Math.max(1, now - st.lastTime);
        const dx = e.clientX - st.lastX;

        if (Math.abs(e.clientX - st.startX) > 4) {
            st.hasMoved = true;
        }

        // Smooth velocity in px/ms
        const instantVel = dx / dt;
        st.velocity = st.velocity * 0.55 + instantVel * 0.45;
        st.lastX = e.clientX;
        st.lastTime = now;

        const idxFloat = getIndexFloatFromClientX(e.clientX);
        st.currentIndexFloat = idxFloat;

        const nearestIdx = Math.max(0, Math.min(NAV_ITEMS.length - 1, Math.round(idxFloat)));
        setActiveIndex((prev) => (prev !== nearestIdx ? nearestIdx : prev));

        // Calculate organic iOS liquid deformation:
        // 1. Velocity-based horizontal stretch & vertical squash
        // 2. Sub-slot tension (stretches wider when straddling between two icons)
        const frac = Math.abs(idxFloat - Math.round(idxFloat)); // 0 at center, 0.5 between two items
        const betweenTension = Math.sin(frac * Math.PI * 2) * 0.14; // peaks midway between items
        const speedStretch = Math.min(0.34, Math.abs(st.velocity) * 0.16);

        const scaleX = 1.06 + speedStretch + Math.max(0, betweenTension);
        const scaleY = Math.max(0.82, 1.02 - speedStretch * 0.48 - Math.max(0, betweenTension) * 0.35);

        updateSelectorVisuals(idxFloat, scaleX, scaleY, false);
    };

    const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
        const st = dragStateRef.current;
        if (!st.active || e.pointerId !== st.pointerId) return;

        st.active = false;
        setIsDragging(false);

        const idxFloat = getIndexFloatFromClientX(e.clientX);
        const targetIdx = Math.max(0, Math.min(NAV_ITEMS.length - 1, Math.round(idxFloat)));

        setActiveIndex(targetIdx);
        prevRouteIndexRef.current = targetIdx;

        // Snap into target slot with spring physics and restore 1:1 shape
        updateSelectorVisuals(targetIdx, 1, 1, true);

        const targetPath = NAV_ITEMS[targetIdx].path;
        if (location.pathname !== targetPath) {
            navigate(targetPath);
        }
    };

    const showSelector = activeIndex >= 0 || isDragging;

    return (
        <nav
            className={`native-dock-container no-print ${platform === 'ios' ? 'dock-ios' : 'dock-android'} ${isDragging ? 'is-dragging' : ''}`}
            aria-label="Mobile Navigation Dock"
        >
            <div
                ref={pillRef}
                className="dock-pill"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
            >
                {/* Full-zone Liquid Glass / Material Active Selector Bubble */}
                <div className="dock-selector-track" aria-hidden="true">
                    <div
                        ref={selectorRef}
                        className="dock-selector-bubble"
                        style={{
                            opacity: showSelector ? 1 : 0,
                            transform: `translate3d(${Math.max(0, routeIndex) * 100}%, 0, 0) scale3d(1, 1, 1)`,
                        }}
                    />
                </div>

                {NAV_ITEMS.map((item, idx) => {
                    const Icon = item.icon;
                    const isSelected = idx === activeIndex;
                    const label = language === 'fr' ? item.shortFr : item.shortEn;

                    return (
                        <button
                            key={item.path}
                            type="button"
                            className={`dock-item ${isSelected ? 'active' : ''}`}
                            title={t(item.name)}
                            onClick={() => {
                                if (!dragStateRef.current.hasMoved && location.pathname !== item.path) {
                                    navigate(item.path);
                                }
                            }}
                        >
                            <div className="dock-icon-wrapper">
                                <Icon size={20} strokeWidth={isSelected ? 2.4 : 1.85} />
                            </div>
                            <span className="dock-label">{label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
