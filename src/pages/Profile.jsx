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
                        <h3 style={{ margin: 0, color: 'var(--success)', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <Award /> Verified
                        </h3>
                        <p style={{ margin: 0 }}>{currentUser.role === 'volunteer' ? 'Active Volunteer' : 'Social Impact Account'}</p>
                    </div>
                </div>

                {/* Account Details */}
                <div className="card">
                    <h2>Account Overview</h2>
                    <p style={{ color: 'var(--text-muted)' }}>You are part of the FeedForward collective, helping reduce food waste and support communities.</p>
                    
                    <div style={{ marginTop: '2rem' }}>
                        <div className="flex-between" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                            <span>Email</span>
                            <strong>{currentUser.email}</strong>
                        </div>
                        <div className="flex-between" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                            <span>Member Since</span>
                            <strong>{new Date(currentUser.createdAt).toLocaleDateString()}</strong>
                        </div>
                        <div className="flex-between" style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)' }}>
                            <span>Account Type</span>
                            <span className="badge badge-active">{currentUser.role.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
