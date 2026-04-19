import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Leaf, LogOut, User, MessageCircle, Languages, Volume2, Sun, Moon, BarChart3 } from 'lucide-react';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const { language, toggleLanguage, playTextToSpeech, isSpeaking } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    if (location.pathname === '/') {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (!currentUser) return '/';
        switch (currentUser.role) {
            case 'admin': return '/admin';
            case 'donor': return '/dashboard';
            case 'ngo': return '/feed';
            case 'volunteer': return '/tasks';
            default: return '/';
        }
    };

    return (
        <nav style={{
            background: 'var(--surface-color)',
            boxShadow: 'var(--shadow-sm)',
            padding: '1rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link to={getDashboardLink()} className="flex-center" style={{ textDecoration: 'none', color: 'var(--primary)', gap: '0.5rem' }}>
                        <Leaf size={28} />
                        <h2 style={{ margin: 0 }}>FeedForward</h2>
                    </Link>

                    {/* Language Settings */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={toggleLanguage} className="btn" style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '5px', background: language === 'hi' ? '#fff3e0' : '#f0f4f8', color: language === 'hi' ? '#e65100' : '#1976d2', border: '1px solid currentColor', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 700 }}>
                            <Languages size={16} />
                            {language === 'hi' ? 'हिंदी (Hi)' : 'English'}
                        </button>

                        <button onClick={playTextToSpeech} className="btn" style={{ padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', gap: '5px', background: isSpeaking ? '#ffebee' : '#e8f5e9', color: isSpeaking ? '#c62828' : '#2e7d32', border: '1px solid currentColor', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
                            <Volume2 size={16} /> {isSpeaking ? (language === 'hi' ? 'रोकें' : 'Stop') : (language === 'hi' ? 'सुनें' : 'Read')}
                        </button>
                    </div>
                </div>

                <div className="flex-center" style={{ gap: '1.5rem' }}>
                    {currentUser && currentUser.role !== 'volunteer' && (
                        <Link to="/impact" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <BarChart3 size={18} /> Impact
                        </Link>
                    )}
                    {currentUser ? (
                        <>
                            <div className="flex-center" style={{ gap: '1rem' }}>
                                <Link to="/profile" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Profile</Link>
                            </div>
                            <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <User size={18} />
                                <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                                <span className="badge badge-active" style={{ textTransform: 'capitalize' }}>{currentUser.role}</span>

                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline"
                                style={{ padding: '0.4rem 1rem' }}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
                            <Link to="/signup" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Get Started</Link>
                        </>
                    )}

                    {/* Dark/Light Mode Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="btn"
                        style={{
                            padding: '0.5rem',
                            background: theme === 'dark' ? '#333' : '#f0f0f0',
                            color: theme === 'dark' ? '#ffc107' : '#555',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
