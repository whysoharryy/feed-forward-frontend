import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('donor');
    const [isLoading, setIsLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

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
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>

            {/* Main Area: Signup Form */}
            <div style={{
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
                background: 'linear-gradient(135deg, #f9fbf9 0%, #eaf3eb 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative background elements */}
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'var(--primary)', opacity: '0.04', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '50vw', height: '50vw', background: '#388e3c', opacity: '0.03', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0, pointerEvents: 'none' }}></div>

                <div className="card animate-fade-in" style={{ position: 'relative', zIndex: 1, maxWidth: '500px', width: '100%', background: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(46, 125, 50, 0.1)', borderRadius: '20px' }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Join FeedForward</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Create an account to redistribute food and reduce waste.</p>
                    </div>

                    <form onSubmit={handleSignup}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">I want to join the platform as a:</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div
                                    className={`card flex-center ${role === 'donor' ? 'active-role' : ''}`}
                                    style={{
                                        cursor: 'pointer', padding: '1rem', textAlign: 'center', flexDirection: 'column', gap: '0.5rem',
                                        borderColor: role === 'donor' ? 'var(--primary)' : 'var(--border-color)',
                                        background: role === 'donor' ? 'var(--secondary)' : '#fff'
                                    }}
                                    onClick={() => setRole('donor')}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>🏢</span>
                                    <strong style={{ fontSize: '0.9rem', color: role === 'donor' ? 'var(--primary-dark)' : 'var(--text-main)' }}>Food Donor</strong>
                                </div>
                                <div
                                    className={`card flex-center ${role === 'volunteer' ? 'active-role' : ''}`}
                                    style={{
                                        cursor: 'pointer', padding: '1rem', textAlign: 'center', flexDirection: 'column', gap: '0.5rem',
                                        borderColor: role === 'volunteer' ? 'var(--primary)' : 'var(--border-color)',
                                        background: role === 'volunteer' ? 'var(--secondary)' : '#fff'
                                    }}
                                    onClick={() => setRole('volunteer')}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>🚴</span>
                                    <strong style={{ fontSize: '0.9rem', color: role === 'volunteer' ? 'var(--primary-dark)' : 'var(--text-main)' }}>Volunteer</strong>
                                </div>
                                <div
                                    className={`card flex-center ${role === 'ngo' ? 'active-role' : ''}`}
                                    style={{
                                        cursor: 'pointer', padding: '1rem', textAlign: 'center', flexDirection: 'column', gap: '0.5rem',
                                        borderColor: role === 'ngo' ? 'var(--primary)' : 'var(--border-color)',
                                        background: role === 'ngo' ? 'var(--secondary)' : '#fff'
                                    }}
                                    onClick={() => setRole('ngo')}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>🏩</span>
                                    <strong style={{ fontSize: '0.9rem', color: role === 'ngo' ? 'var(--primary-dark)' : 'var(--text-main)' }}>NGO / Shelter</strong>
                                </div>
                                <div
                                    className={`card flex-center ${role === 'admin' ? 'active-role' : ''}`}
                                    style={{
                                        cursor: 'pointer', padding: '1rem', textAlign: 'center', flexDirection: 'column', gap: '0.5rem',
                                        borderColor: role === 'admin' ? 'var(--primary)' : 'var(--border-color)',
                                        background: role === 'admin' ? 'var(--secondary)' : '#fff'
                                    }}
                                    onClick={() => setRole('admin')}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                                    <strong style={{ fontSize: '0.9rem', color: role === 'admin' ? 'var(--primary-dark)' : 'var(--text-main)' }}>Platform Admin</strong>
                                </div>
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
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1.05rem' }} disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : <><UserPlus size={18} /> Create Account</>}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
                        <p>Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Log In here</Link></p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 900px) {
                    .hide-on-mobile { display: none !important; }
                }
                .active-role {
                    transform: scale(1.02);
                    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15) !important;
                }
            `}} />
        </div>
    );
};

export default Signup;
