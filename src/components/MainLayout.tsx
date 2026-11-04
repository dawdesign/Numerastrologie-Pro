import { Outlet, Link, useLocation } from 'react-router-dom';
import { Compass, Calendar, Hash, BookOpen, Settings as SettingsIcon, Search } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import MobileDock from './MobileDock';

export default function MainLayout() {
    const location = useLocation();
    const { t } = useSettings();

    const links = [
        { name: 'Calculator', path: '/', icon: Compass },
        { name: 'Calendar/Horoscope', path: '/calendar', icon: Calendar },
        { name: 'Equation/Finder', path: '/equation', icon: Search },
        { name: 'Letterology', path: '/letterology', icon: Hash },
        { name: 'Wiki', path: '/wiki', icon: BookOpen },
        { name: 'Settings', path: '/settings', icon: SettingsIcon },
    ];

    const isSettingsActive = location.pathname.startsWith('/settings');

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header style={{
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-main)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div className="container mobile-header-container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '60px'
                }}>
                    <Link to="/" style={{ fontSize: 'clamp(0.9rem, 3vw, 1.25rem)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <img src="/logo.png" alt="Numerastrologie Pro Logo" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px', flexShrink: 0 }} />
                        Numerastrologie Pro
                    </Link>

                    <nav className="desktop-header-nav">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.9rem',
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? 'var(--text-main)' : 'var(--text-secondary)',
                                        transition: 'color 0.2s'
                                    }}
                                >
                                    <Icon size={16} />
                                    <span style={{ display: 'none' }} className="nav-label">{t(link.name)}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <Link
                        to="/settings"
                        className="mobile-header-settings"
                        title={t('Settings')}
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isSettingsActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
                            padding: '6px',
                            borderRadius: '8px',
                            transition: 'color 0.2s'
                        }}
                    >
                        <SettingsIcon size={20} strokeWidth={isSettingsActive ? 2.4 : 1.9} />
                    </Link>
                </div>
            </header>

            <main className="app-main-content" style={{ flex: 1, padding: 'clamp(12px, 2vh, 24px) 0', backgroundColor: 'var(--bg-secondary)' }}>
                <div className="container">
                    <Outlet />
                </div>
            </main>

            <footer className="app-footer" style={{
                borderTop: '1px solid var(--border-color)',
                padding: 'var(--spacing-xl) 0',
                background: 'var(--bg-main)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <p>{t('Numerastrologie Pro by DD22')}</p>
                </div>
            </footer>

            <MobileDock />
        </div>
    );
}
