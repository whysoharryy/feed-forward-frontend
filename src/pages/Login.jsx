import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Leaf, ChevronRight, ShieldCheck, Quote } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

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
                background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)',
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
                    <Quote size={40} fill="var(--accent)" color="var(--accent)" style={{ opacity: 0.3, position: 'absolute', top: '-20px', left: '2rem', transform: 'rotate(180deg)', background: 'var(--primary-dark)', borderRadius: '50%', padding: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} />
                    <p style={{ fontSize: '1.6rem', color: '#fff', fontStyle: 'italic', margin: 0, lineHeight: 1.5, fontWeight: 300, position: 'relative' }}>
                        "If you can't feed a hundred people, then feed just one."
                    </p>
                    <p style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: 600, margin: '1.5rem 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        — Mother Teresa
                    </p>
                </div>

                <div style={{ marginTop: 'auto', zIndex: 1, paddingTop: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <ShieldCheck size={24} color="var(--accent)" />
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
                background: 'var(--bg-color)'
            }}>
                <div className="card animate-fade-in" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div className="flex-center" style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: 'var(--secondary)', color: 'var(--primary)',
                            margin: '0 auto 1.5rem'
                        }}>
                            <Leaf size={32} />
                        </div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Log In</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Continue fighting food waste.</p>
                    </div>

                    <form onSubmit={handleLogin}>
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
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <div className="flex-between">
                                <label className="form-label">Password</label>
                                <a href="#" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem' }} disabled={isLoading}>
                            {isLoading ? 'Signing In...' : <>Sign In <ChevronRight size={18} /></>}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
                        <p>Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Join the Movement</Link></p>
                    </div>

                    {/* Demo Fast Logins - Kept for Reviewer Convenience */}
                    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                        <p style={{ fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>Demo Accounts (1-Click Login)</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => demoLogin('admin@feedforward.com')} disabled={isLoading}>Admin Mode</button>
                            <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#1565c0', borderColor: '#1565c0' }} onClick={() => demoLogin('donor@feedforward.com')} disabled={isLoading}>Donor Mode</button>
                            <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#c2185b', borderColor: '#c2185b' }} onClick={() => demoLogin('ngo@feedforward.com')} disabled={isLoading}>NGO Mode</button>
                            <button className="btn btn-outline" style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#e65100', borderColor: '#e65100' }} onClick={() => demoLogin('volunteer@feedforward.com')} disabled={isLoading}>Volunteer Mode</button>
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
