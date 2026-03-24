import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Plus, Package, Clock, CheckCircle } from 'lucide-react';

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
    const completed = myListings.filter(l => l.status === 'completed' || l.status === 'claimed').length;

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

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '3rem' }}>
                <div className="card flex-center" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                    <Package size={32} color="var(--primary)" />
                    <h3 style={{ margin: 0 }}>{myListings.length}</h3>
                    <p style={{ margin: 0 }}>Total Donations</p>
                </div>
                <div className="card flex-center" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                    <Clock size={32} color="var(--warning)" />
                    <h3 style={{ margin: 0 }}>{pending}</h3>
                    <p style={{ margin: 0 }}>Pending Verification</p>
                </div>
                <div className="card flex-center" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                    <CheckCircle size={32} color="var(--success)" />
                    <h3 style={{ margin: 0 }}>{completed + active}</h3>
                    <p style={{ margin: 0 }}>Verified & Claimed</p>
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
                        <div key={listing.id} className="card flex-between">
                            <div>
                                <h3 style={{ marginBottom: '0.25rem' }}>{listing.foodType}</h3>
                                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                    {listing.quantity} kg • Listed on {new Date(listing.timestamp).toLocaleDateString()}
                                </p>
                                <span className={`badge badge-${listing.status === 'completed' || listing.status === 'verified' ? 'completed' : 'pending'}`}>
                                    {listing.status.replace('_', ' ').toUpperCase()}
                                </span>
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
