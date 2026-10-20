import LockedBox from '../components/LockedBox';
import { useSettings } from '../context/SettingsContext';

export default function Settings() {
    const { theme, language, toggleTheme, toggleLanguage, t } = useSettings();

    return (
        <div className="animate-fade-in" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)', paddingBottom: 'var(--spacing-2xl)'
        }}>
            <h1 style={{ textAlign: 'center' }}>{t('Settings')}</h1>
            
            <div className="card" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                {/* Theme Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                        {t('Theme')}: {theme === 'light' ? t('Light Mode') : t('Dark Mode')}
                    </div>
                    <button onClick={toggleTheme} className="btn btn-outline">
                        {theme === 'light' ? '🌙 ' + t('Dark Mode') : '☀️ ' + t('Light Mode')}
                    </button>
                </div>

                {/* Language Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                        {t('Language')}: {language === 'en' ? 'English' : 'Français'}
                    </div>
                    <button onClick={toggleLanguage} className="btn btn-outline">
                        {language === 'en' ? '🇫🇷 Français' : '🇬🇧 English'}
                    </button>
                </div>

                {/* Compatibility Outlines Toggle - Locked in free version */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-lg)' }}>
                    <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                            {t('Compatibility Outlines')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                            {t('Locked in free version')}
                        </div>
                    </div>
                    <div style={{ width: '40px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LockedBox size={20} style={{ padding: 0 }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
