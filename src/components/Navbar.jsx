import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, User, MapPin } from 'lucide-react';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
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
                <Link to={getDashboardLink()} className="flex-center" style={{ textDecoration: 'none', color: 'var(--primary)', gap: '0.5rem' }}>
                    <Leaf size={28} />
                    <h2 style={{ margin: 0 }}>FeedForward</h2>
                </Link>

                <div className="flex-center" style={{ gap: '1.5rem' }}>
                    <Link to="/live-map" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={18} /> Live Map
                    </Link>
                    {currentUser ? (
                        <>
                            <div className="flex-center" style={{ gap: '1rem' }}>
                                <Link to="/profile" className="btn btn-secondary" style={{ padding: '0.2rem 0.6rem', fontSize: '0.85rem' }}>Profile</Link>
                            </div>
                            <div className="flex-center" style={{ gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <User size={18} />
                                <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                                <span className="badge badge-active" style={{ textTransform: 'capitalize' }}>{currentUser.role}</span>
                                {currentUser.karma !== undefined && (
                                    <span className="badge" style={{ background: 'var(--accent)', color: '#fff' }}>✨ {currentUser.karma} KP</span>
                                )}
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
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
