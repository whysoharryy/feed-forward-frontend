import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Award, Star, Zap, TrendingUp } from 'lucide-react';

const Profile = () => {
    const { currentUser } = useAuth();
    const [volunteers, setVolunteers] = useState([]);
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                const response = await api.get('/leaderboard');
                setVolunteers(response.data.volunteers || []);
                setDonors(response.data.partners || []);
            } catch (error) {
                console.log('Leaderboard data not available:', error.message);
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, []);

    const renderBadges = () => {
        if (currentUser.role === 'volunteer') {
            const k = currentUser.karma || 0;
            return (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    {k >= 100 && <span className="badge badge-active"><Award size={14} style={{ marginRight: 4 }} /> Bronze Saver</span>}
                    {k >= 500 && <span className="badge" style={{ background: '#e0e0e0', color: '#424242' }}><Star size={14} style={{ marginRight: 4 }} /> Silver Runner</span>}
                    {k >= 1000 && <span className="badge" style={{ background: '#fff8e1', color: '#f57f17' }}><Zap size={14} style={{ marginRight: 4 }} /> Gold Hero</span>}
                    {k < 100 && <span className="badge badge-pending">Complete 1 delivery to earn Bronze</span>}
                </div>
            );
        }
        return (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <span className="badge badge-completed"><Star size={14} style={{ marginRight: 4 }} /> Trusted Partner</span>
            </div>
        );
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
            <h1>Your Profile</h1>

            <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>

                {/* Profile Info */}
                <div className="card">
                    <div className="flex-center" style={{ width: '80px', height: '80px', background: 'var(--primary)', color: 'white', borderRadius: '50%', fontSize: '2rem', margin: '0 auto 1rem' }}>
                        {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <h2 style={{ textAlign: 'center', margin: 0 }}>{currentUser.name}</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{currentUser.role}</p>

                    <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginTop: '1.5rem', textAlign: 'center' }}>
                        {currentUser.role === 'volunteer' ? (
                            <>
                                <h3 style={{ margin: 0, color: 'var(--accent)', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <TrendingUp /> {currentUser.karma}
                                </h3>
                                <p style={{ margin: 0 }}>Karma Points</p>
                            </>
                        ) : (
                            <>
                                <h3 style={{ margin: 0, color: 'var(--success)', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <Star fill="currentColor" /> {currentUser.trustRating}/100
                                </h3>
                                <p style={{ margin: 0 }}>Trust Rating</p>
                            </>
                        )}
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <h4 style={{ marginBottom: '0.5rem' }}>Badges Unlocked</h4>
                        {renderBadges()}
                    </div>
                </div>

                {/* Gamification Leaderboards */}
                <div className="card">
                    <h2>Platform Leaderboards</h2>

                    {loading ? (
                        <p>Loading leaderboards...</p>
                    ) : (
                        <>
                            <div style={{ marginTop: '1.5rem' }}>
                                <h3 style={{ borderBottom: '2px solid var(--primary)', display: 'inline-block', paddingBottom: '0.25rem' }}>Top Volunteers (Karma)</h3>
                                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                                    {volunteers.slice(0, 5).map((v, i) => (
                                        <li key={v.uid} className="flex-between" style={{ padding: '0.75rem', background: i % 2 === 0 ? 'var(--bg-color)' : 'transparent', borderRadius: 'var(--radius-sm)' }}>
                                            <div className="flex-center" style={{ gap: '1rem' }}>
                                                <strong style={{ width: '24px', opacity: 0.5 }}>#{i + 1}</strong>
                                                <span>{v.name}</span>
                                            </div>
                                            <strong style={{ color: 'var(--accent)' }}>{v.karma} pts</strong>
                                        </li>
                                    ))}
                                    {volunteers.length === 0 && <li style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>No volunteer data available</li>}
                                </ul>
                            </div>

                            <div style={{ marginTop: '2.5rem' }}>
                                <h3 style={{ borderBottom: '2px solid var(--success)', display: 'inline-block', paddingBottom: '0.25rem' }}>Most Trusted Partners</h3>
                                <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
                                    {donors.slice(0, 5).map((d, i) => (
                                        <li key={d.uid} className="flex-between" style={{ padding: '0.75rem', background: i % 2 === 0 ? 'var(--bg-color)' : 'transparent', borderRadius: 'var(--radius-sm)' }}>
                                            <div className="flex-center" style={{ gap: '1rem' }}>
                                                <strong style={{ width: '24px', opacity: 0.5 }}>#{i + 1}</strong>
                                                <span>{d.name} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>({d.role})</span></span>
                                            </div>
                                            <strong style={{ color: 'var(--success)' }}>{d.trustRating}/100</strong>
                                        </li>
                                    ))}
                                    {donors.length === 0 && <li style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>No partner data available</li>}
                                </ul>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Profile;
