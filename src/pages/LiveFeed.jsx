import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { MapPin, Clock, Star, HandHeart, MessageCircle } from 'lucide-react';
import ExpiryTimer from '../components/ExpiryTimer';
import toast from 'react-hot-toast';

const LiveFeed = () => {
    const { currentUser } = useAuth();
    const [feed, setFeed] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    // Feedback State
    const [feedbackOpen, setFeedbackOpen] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

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
        if (window.confirm(`Are you sure you want to claim ${listing.quantity} units of ${listing.foodType}?`)) {
            try {
                await api.post(`/ngo/claim/${listing.id}`);
                toast.success('Food claimed! A volunteer will be dispatched soon.');
                loadFeed();
            } catch (error) {
                toast.error(error.message || 'Failed to claim donation');
            }
        }
    };

    const submitFeedback = async (donationId) => {
        try {
            await api.post(`/ngo/feedback/${donationId}`, { rating, comment });
            toast.success('Successfully submitted!');
            setFeedbackOpen(null);
            setRating(5);
            setComment('');
            loadFeed();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit feedback');
        }
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
                                        <div style={{ flexShrink: 0 }}>
                                            <p style={{ margin: '0 0 4px', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', textAlign: 'right' }}>Expires In</p>
                                            <ExpiryTimer expiryTime={listing.expiryTime} />
                                        </div>
                                    </div>
                                    <p style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                                        {listing.quantity} units • From: {listing.donorName}
                                    </p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{listing.description || 'No description'}</p>

                                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                                        <div className="flex-center" style={{ gap: '0.25rem', color: 'var(--success)' }}>
                                            <HandHeart size={16} fill="currentColor" /> Community Listing
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
                                <h4>{c.foodType} ({c.quantity} units)</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>From: {c.donorName}</p>
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className={`badge badge-${c.status === 'completed' ? 'completed' : 'pending'}`}>
                                        {c.status === 'completed' ? 'DELIVERED' : 'AWAITING VOLUNTEER'}
                                    </span>
                                    {c.status !== 'completed' && (
                                        <button
                                            onClick={() => window.location.href = `/chat?chatId=${c.id}`}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        >
                                            <MessageCircle size={14} /> Chat
                                        </button>
                                    )}
                                </div>
                                {c.status === 'completed' && !c.feedback && feedbackOpen !== c.id && (
                                    <button onClick={() => setFeedbackOpen(c.id)} className="btn btn-outline" style={{ marginTop: '10px', fontSize: '0.85rem', padding: '0.3rem 0.6rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Star size={14} /> Rate Food
                                    </button>
                                )}
                                {c.feedback && (
                                    <div style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Star size={14} fill="gold" color="gold" /> {c.feedback.rating}/5 Rated
                                        {c.feedback.comment && <span style={{ fontStyle: 'italic', marginLeft: '5px' }}>"{c.feedback.comment}"</span>}
                                    </div>
                                )}
                                {feedbackOpen === c.id && (
                                    <div style={{ marginTop: '15px', background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                                        <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600 }}>Rate Food Quality:</p>
                                        <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star
                                                    key={star}
                                                    size={22}
                                                    fill={star <= rating ? "gold" : "none"}
                                                    color={star <= rating ? "gold" : "#ccc"}
                                                    style={{ cursor: 'pointer', transition: '0.2s' }}
                                                    onClick={() => setRating(star)}
                                                />
                                            ))}
                                        </div>
                                        <textarea
                                            placeholder="Any comments about the quality? (Optional)"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem' }}
                                            rows={2}
                                        />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className="btn btn-primary" onClick={() => submitFeedback(c.id)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', flex: 1 }}>Submit</button>
                                            <button className="btn btn-outline" onClick={() => setFeedbackOpen(null)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveFeed;
