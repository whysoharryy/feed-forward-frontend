import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Package, Clock, CheckCircle, MessageCircle, Star, Award } from 'lucide-react';
import ExpiryTimer from '../components/ExpiryTimer';

const DonorDashboard = () => {
    const { currentUser } = useAuth();
    const [myListings, setMyListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadListings = async () => {
        try {
            const response = await api.get('/donations');
            const mine = response.data.donations || [];
            // Sort newest first
            mine.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setMyListings(mine);
        } catch (error) {
            console.error('Error loading donations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadListings();
        const interval = setInterval(loadListings, 10000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const pending = myListings.filter(l => l.status === 'pending_verification').length;
    const active = myListings.filter(l => l.status === 'verified').length;
    const completedCount = myListings.filter(l => l.status === 'completed' || l.status === 'claimed').length;
    
    // Average Rating Calculation
    const ratings = myListings.filter(l => l.feedback?.rating).map(l => l.feedback.rating);
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null;

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <p>Loading your donations...</p>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Donor Dashboard</h1>
                    <p style={{ margin: 0 }}>Track your food donations and impact.</p>
                </div>
                <Link to="/add-donation" className="btn btn-primary">
                    <Plus size={18} /> New Donation
                </Link>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '3rem' }}>
                <div className="card flex-center" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                    <Package size={32} color="var(--primary)" />
                    <h3 style={{ margin: 0 }}>{myListings.length}</h3>
                    <p style={{ margin: 0 }}>Total Donations</p>
                </div>
                <div className="card flex-center" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                    <Clock size={32} color="var(--warning)" />
                    <h3 style={{ margin: 0 }}>{pending}</h3>
                    <p style={{ margin: 0 }}>Pending Verify</p>
                </div>
                <div className="card flex-center" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                    <CheckCircle size={32} color="var(--success)" />
                    <h3 style={{ margin: 0 }}>{completedCount + active}</h3>
                    <p style={{ margin: 0 }}>Successful Aid</p>
                </div>
                <div className="card flex-center" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                    <Star size={32} fill="#ffc107" color="#ffc107" />
                    <h3 style={{ margin: 0 }}>{avgRating || 'N/A'}</h3>
                    <p style={{ margin: 0 }}>Average Rating</p>
                </div>
            </div>

            <h2>Your Recent Listings</h2>
            {myListings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>You haven't made any donations yet.</p>
                    <Link to="/add-donation" className="btn btn-primary" style={{ marginTop: '1rem' }}>Make your first donation</Link>
                </div>
            ) : (
                <div className="grid">
                    {myListings.map(listing => (
                        <div key={listing.id} className="card flex-between" style={{ position: 'relative' }}>
                            <div>
                                <div className="flex-center" style={{ width: 'fit-content', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <h3 style={{ margin: 0 }}>{listing.foodType}</h3>
                                    {listing.feedback && (
                                        <div className="badge badge-completed" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fff8e1', color: '#f57f17', border: '1px solid #ffe082' }}>
                                            <Star size={12} fill="#f57f17" /> {listing.feedback.rating}/5
                                        </div>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>{listing.quantity} units • Listed on {new Date(listing.timestamp).toLocaleDateString()}</span>
                                    {listing.status !== 'completed' && <ExpiryTimer expiryTime={listing.expiryTime} />}
                                </p>
                                
                                {listing.feedback?.comment && (
                                    <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', padding: '5px 10px', background: 'var(--bg-color)', borderRadius: '4px', borderLeft: '3px solid var(--primary)' }}>
                                        "{listing.feedback.comment}"
                                    </p>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}>
                                    <span className={`badge badge-${listing.status === 'completed' || listing.status === 'verified' ? 'completed' : listing.status === 'claimed' ? 'active' : 'pending'}`}>
                                        {listing.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    {listing.otp && listing.status === 'claimed' && (
                                        <div style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <span>OTP:</span>
                                            <span style={{ letterSpacing: '2px', fontSize: '1rem' }}>{listing.otp}</span>
                                        </div>
                                    )}
                                    {listing.status === 'claimed' && (
                                        <Link to={`/chat?chatId=${listing.id}`} className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <MessageCircle size={14} /> Coordinate
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div>
                                {listing.imageUrl && (
                                    <img
                                        src={listing.imageUrl}
                                        alt="Food"
                                        style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DonorDashboard;
