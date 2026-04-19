import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserPlus, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('donor');
    const [isLoading, setIsLoading] = useState(false);

    const { signup } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const isDark = theme === 'dark';

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await signup(name, email, password, role);
        setIsLoading(false);

        if (result.success) {
            toast.success('Welcome to FeedForward!');
            switch (role) {
                case 'admin': navigate('/admin'); break;
                case 'donor': navigate('/dashboard'); break;
                case 'ngo': navigate('/feed'); break;
                case 'volunteer': navigate('/tasks'); break;
                default: navigate('/');
            }
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', background: 'var(--bg-color)', transition: 'background 0.3s' }}>

            {/* Main Area: Signup Form */}
            <div style={{
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
                background: isDark
                    ? 'radial-gradient(circle at top right, #1a2e1d 0%, #121212 100%)'
                    : 'linear-gradient(135deg, #f9fbf9 0%, #eaf3eb 100%)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'background 0.3s'
            }}>
                {/* Decorative background elements */}
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'var(--primary)', opacity: isDark ? '0.08' : '0.04', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '50vw', height: '50vw', background: '#388e3c', opacity: isDark ? '0.06' : '0.03', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>

                <div className="card animate-fade-in" style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '500px',
                    width: '100%',
                    background: 'var(--surface-color)',
                    boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(0,0,0,0.08)',
                    border: isDark ? '1px solid #333' : '1px solid rgba(46, 125, 50, 0.1)',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    backdropFilter: isDark ? 'blur(10px)' : 'none'
                }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Join FeedForward</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Create an account to redistribute food and reduce waste.</p>
                    </div>

                    <form onSubmit={handleSignup}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">I want to join the platform as a:</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {[
                                    { id: 'donor', label: 'Food Donor', icon: '🏢' },
                                    { id: 'volunteer', label: 'Volunteer', icon: '🚴' },
                                    { id: 'ngo', label: 'NGO / Shelter', icon: '🏩' },
                                    { id: 'admin', label: 'Platform Admin', icon: '🛡️' }
                                ].map((r) => (
                                    <div
                                        key={r.id}
                                        className={`card flex-center ${role === r.id ? 'active-role' : ''}`}
                                        style={{
                                            cursor: 'pointer', padding: '1rem', textAlign: 'center', flexDirection: 'column', gap: '0.5rem',
                                            borderColor: role === r.id ? 'var(--primary)' : 'var(--border-color)',
                                            background: role === r.id ? (isDark ? 'rgba(46, 125, 50, 0.2)' : 'var(--secondary)') : 'var(--bg-color)',
                                            transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            borderRadius: '16px'
                                        }}
                                        onClick={() => setRole(r.id)}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>{r.icon}</span>
                                        <strong style={{ fontSize: '0.9rem', color: role === r.id ? 'var(--primary-dark)' : 'var(--text-main)' }}>{r.label}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Name / Organization Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name or Business"
                                required
                                disabled={isLoading}
                                style={{ borderRadius: '12px' }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={isLoading}
                                style={{ borderRadius: '12px' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a secure password"
                                required
                                minLength="6"
                                disabled={isLoading}
                                style={{ borderRadius: '12px' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.05rem',
                                borderRadius: '14px',
                                background: 'var(--primary)',
                                fontWeight: '700'
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : <><UserPlus size={18} /> Create Account</>}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
                        <p style={{ color: 'var(--text-muted)' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Log In here</Link>
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 900px) {
                    .hide-on-mobile { display: none !important; }
                }
                .active-role {
                    transform: scale(1.05);
                    box-shadow: 0 8px 16px rgba(46, 125, 50, 0.2) !important;
                    border-width: 2px !important;
                }
            `}} />
        </div>
    );
};

export default Signup;
