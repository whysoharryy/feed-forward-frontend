import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogIn, Leaf, ChevronRight, ShieldCheck, Quote } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    const colors = {
        primary: '#1B5E20',
        primaryDark: '#0b260d',
        accent: '#81C784',
        bg: isDark ? '#111b21' : '#f8f9fa',
        card: isDark ? '#1e1e1e' : '#ffffff',
        textMain: isDark ? '#f0f0f0' : '#1f2937',
        textMuted: isDark ? '#9ca3af' : '#6b7280',
        border: isDark ? '#313d45' : '#e5e7eb',
        input: isDark ? '#2a3942' : '#ffffff',
        inputBorder: isDark ? '#2a3942' : '#e5e7eb',
        sidebarGradient: isDark 
            ? 'linear-gradient(135deg, #0b260d 0%, #1B5E20 100%)' 
            : 'linear-gradient(135deg, #1B5E20 0%, #388E3C 100%)'
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(email, password);
        setIsLoading(false);

        if (result.success) {
            toast.success(`Welcome back, ${result.user.name}!`);
            switch (result.user.role) {
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

    const demoLogin = async (roleEmail) => {
        setEmail(roleEmail);
        setPassword('password');
        setIsLoading(true);
        const result = await login(roleEmail, 'password');
        setIsLoading(false);

        if (result.success) {
            toast.success(`Welcome back, ${result.user.name}!`);
            switch (result.user.role) {
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
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>

            {/* Left Side: Emotional Storytelling & Impact (Visible on Tablet/Desktop) */}
            <div style={{
                flex: '1 1 50%',
                background: colors.sidebarGradient,
                color: 'white',
                padding: '4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
            }} className="hide-on-mobile">
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', opacity: 0.1 }}>
                    <Leaf size={400} />
                </div>

                <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem', zIndex: 1, color: '#fff' }}>
                    Welcome back to the movement.
                </h1>
                <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '3rem', maxWidth: '80%', zIndex: 1, color: 'rgba(255,255,255,0.9)' }}>
                    Every login is a step toward zero hunger and zero waste. Together, our community has achieved incredible milestones.
                </p>

                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '2.5rem', paddingTop: '3rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.2)', zIndex: 1, backdropFilter: 'blur(10px)', marginTop: '1rem', position: 'relative' }}>
                    <Quote size={40} fill={colors.accent} color={colors.accent} style={{ opacity: 0.3, position: 'absolute', top: '-20px', left: '2rem', transform: 'rotate(180deg)', background: colors.primaryDark, borderRadius: '50%', padding: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} />
                    <p style={{ fontSize: '1.6rem', color: '#fff', fontStyle: 'italic', margin: 0, lineHeight: 1.5, fontWeight: 300, position: 'relative' }}>
                        "If you can't feed a hundred people, then feed just one."
                    </p>
                    <p style={{ fontSize: '1rem', color: colors.accent, fontWeight: 600, margin: '1.5rem 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        — Mother Teresa
                    </p>
                </div>

                <div style={{ marginTop: 'auto', zIndex: 1, paddingTop: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <ShieldCheck size={24} color={colors.accent} />
                        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9, color: 'rgba(255,255,255,0.9)' }}>Secured by FeedForward Trust Network</p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div style={{
                flex: '1 1 50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: colors.bg
            }}>
                <div className="card animate-fade-in" style={{ 
                    maxWidth: '420px', 
                    width: '100%', 
                    padding: '2.5rem', 
                    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.08)',
                    background: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '1.5rem'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div className="flex-center" style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: isDark ? 'rgba(27, 94, 32, 0.2)' : 'rgba(27, 94, 32, 0.1)', 
                            color: colors.primary,
                            margin: '0 auto 1.5rem'
                        }}>
                            <Leaf size={32} />
                        </div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: colors.textMain }}>Log In</h2>
                        <p style={{ color: colors.textMuted }}>Continue fighting food waste.</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label className="form-label" style={{ color: colors.textMain }}>Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={isLoading}
                                style={{ background: colors.input, color: colors.textMain, border: `1px solid ${colors.inputBorder}` }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <div className="flex-between">
                                <label className="form-label" style={{ color: colors.textMain }}>Password</label>
                                <a href="#" style={{ fontSize: '0.8rem', color: colors.primary, textDecoration: 'none' }}>Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                                style={{ background: colors.input, color: colors.textMain, border: `1px solid ${colors.inputBorder}` }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontWeight: 600 }} disabled={isLoading}>
                            {isLoading ? 'Signing In...' : <>Sign In <ChevronRight size={18} /></>}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
                        <p style={{ color: colors.textMain }}>Don't have an account? <Link to="/signup" style={{ color: colors.primary, fontWeight: 'bold', textDecoration: 'none' }}>Join the Movement</Link></p>
                    </div>

                    {/* Demo Fast Logins - Kept for Reviewer Convenience */}
                    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${colors.border}` }}>
                        <p style={{ fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem', color: colors.textMuted }}>Demo Accounts (1-Click Login)</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.8rem', color: colors.textMain, borderColor: colors.border }} onClick={() => demoLogin('admin@feedforward.com')} disabled={isLoading}>Admin Mode</button>
                            <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#64b5f6', borderColor: isDark ? '#1a3a5e' : '#64b5f6' }} onClick={() => demoLogin('donor@feedforward.com')} disabled={isLoading}>Donor Mode</button>
                            <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#f06292', borderColor: isDark ? '#5a1d2d' : '#f06292' }} onClick={() => demoLogin('ngo@feedforward.com')} disabled={isLoading}>NGO Mode</button>
                            <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#ffb74d', borderColor: isDark ? '#523405' : '#ffb74d' }} onClick={() => demoLogin('volunteer@feedforward.com')} disabled={isLoading}>Volunteer Mode</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick style for hiding side panel on mobile */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 900px) {
                    .hide-on-mobile { display: none !important; }
                }
            `}} />
        </div>
    );
};

export default Login;
