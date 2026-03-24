import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MapPin, Clock, Star, HandHeart } from 'lucide-react';
import toast from 'react-hot-toast';

const LiveFeed = () => {
    const { currentUser } = useAuth();
    const [feed, setFeed] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadFeed = async () => {
        try {
            const response = await api.get('/donations');
            const all = response.data.donations || [];
            // Feed shows verified items not yet claimed
            setFeed(all.filter(l => l.status === 'verified').sort((a, b) => new Date(a.expiryTime) - new Date(b.expiryTime)));
            setMyClaims(all.filter(l => l.ngoId === currentUser.uid));
        } catch (error) {
            console.error('Error loading feed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeed();
        const interval = setInterval(loadFeed, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleClaim = async (listing) => {
        if (window.confirm(`Are you sure you want to claim ${listing.quantity}kg of ${listing.foodType}?`)) {
            try {
                await api.post(`/ngo/claim/${listing.id}`);
                toast.success('Food claimed! A volunteer will be dispatched soon.');
                loadFeed();
            } catch (error) {
                toast.error(error.message || 'Failed to claim donation');
            }
        }
    };

    const getTimeLeft = (expiryTime) => {
        const diff = new Date(expiryTime) - Date.now();
        if (diff <= 0) return 'Expired';
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hrs}h ${mins}m remaining`;
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <p>Loading donation feed...</p>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
            <h1>Live Donation Feed</h1>
            <p>Discover surplus food verified for safety. Claim to request delivery.</p>

            {feed.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem', marginTop: '2rem' }}>
                    <HandHeart size={48} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3>No donations available right now.</h3>
                    <p>Check back later as donors list more food.</p>
                </div>
            ) : (
                <div className="grid" style={{ marginTop: '2rem' }}>
                    {feed.map(listing => (
                        <div key={listing.id} className="card flex-between" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
                                <div style={{ width: '120px', height: '120px', flexShrink: 0 }}>
                                    <img
                                        src={listing.imageUrl}
                                        alt="Food"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="flex-between">
                                        <h2 style={{ margin: 0 }}>{listing.foodType}</h2>
                                        <span className="badge badge-active" style={{ background: '#e1f5fe', color: '#0288d1' }}>
                                            <Clock size={12} style={{ marginRight: '4px' }} /> {getTimeLeft(listing.expiryTime)}
                                        </span>
                                    </div>
                                    <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                                        {listing.quantity} kg • From: {listing.donorName}
                                    </p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{listing.description || 'No description'}</p>

                                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                                        <div className="flex-center" style={{ gap: '0.25rem', color: 'var(--success)' }}>
                                            <Star size={16} fill="currentColor" /> Trust Verified
                                        </div>
                                        <div className="flex-center" style={{ gap: '0.25rem', color: 'var(--text-muted)' }}>
                                            <MapPin size={16} /> ~2.4 km away
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginLeft: '1.5rem', alignSelf: 'center' }}>
                                <button className="btn btn-primary" onClick={() => handleClaim(listing)}>
                                    Claim Shipment
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {myClaims.length > 0 && (
                <div style={{ marginTop: '4rem' }}>
                    <h2>Your Claimed Deliveries</h2>
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {myClaims.map(c => (
                            <div key={c.id} className="card">
                                <h4>{c.foodType} ({c.quantity}kg)</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>From: {c.donorName}</p>
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className={`badge badge-${c.status === 'completed' ? 'completed' : 'pending'}`}>
                                        {c.status === 'completed' ? 'DELIVERED' : 'AWAITING VOLUNTEER'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveFeed;
