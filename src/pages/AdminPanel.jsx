import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, XCircle, Users, BarChart3, ShieldAlert, Clock, Star } from 'lucide-react';
import ExpiryTimer from '../components/ExpiryTimer';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import toast from 'react-hot-toast';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('verifications');

    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const [donationsRes, usersRes, statsRes] = await Promise.all([
                api.get('/donations'),
                api.get('/admin/users'),
                api.get('/admin/stats'),
            ]);

            setListings(donationsRes.data.donations || []);
            setUsers(usersRes.data.users || []);
            setStats(statsRes.data.stats || null);
        } catch (error) {
            console.error('Error loading admin data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, []);

    const getAverageRating = (userId) => {
        const userListings = listings.filter(l => l.donorId === userId && l.feedback?.rating);
        if (userListings.length === 0) return null;
        const sum = userListings.reduce((acc, l) => acc + l.feedback.rating, 0);
        return (sum / userListings.length).toFixed(1);
    };

    const pendingListings = listings.filter(l => l.status === 'pending_verification');

    const handleVerification = async (listing, approved) => {
        try {
            await api.put(`/admin/verify/${listing.id}`, { approved });
            toast.success(`Listing ${approved ? 'approved' : 'rejected'}`);
            loadData();
        } catch (error) {
            toast.error(error.message || 'Verification failed');
        }
    };

    if (loading || !stats) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <p>Loading admin dashboard...</p>
            </div>
        );
    }

    // Simplified Analytics Meta-Stats
    const totalCount = listings.length;
    const deliveredCount = listings.filter(l => l.status === 'completed').length;
    const inTransitCount = listings.filter(l => l.status === 'claimed').length;
    const successRate = totalCount > 0 ? ((deliveredCount / totalCount) * 100).toFixed(0) : 0;

    const easyStats = {
        successRate: successRate + '%',
        totalVolume: listings.reduce((sum, l) => sum + (parseFloat(l.quantity) || 0), 0).toFixed(0),
        activeDeliveries: inTransitCount,
        rejectedCount: listings.filter(l => l.status === 'rejected').length
    };

    const statusCounts = {
        pending: listings.filter(l => l.status === 'pending_verification').length,
        verified: listings.filter(l => l.status === 'verified').length,
        claimed: inTransitCount,
        completed: deliveredCount,
        rejected: easyStats.rejectedCount,
    };

    const chartData = {
        labels: ['Awaiting Check', 'Ready for Pickup', 'On the Way', 'Delivered', 'Quality Rejected'],
        datasets: [{
            data: [statusCounts.pending, statusCounts.verified, statusCounts.claimed, statusCounts.completed, statusCounts.rejected],
            backgroundColor: ['#f57c00', '#2e7d32', '#0288d1', '#4caf50', '#d32f2f'],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
            <h1>Admin Dashboard</h1>

            {/* Overview Cards */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                <div className="card flex-center" style={{ flexDirection: 'column' }}>
                    <Users size={28} color="var(--info)" style={{ marginBottom: '0.5rem' }} />
                    <h3>{users.length}</h3>
                    <p style={{ margin: 0 }}>Total Users</p>
                </div>
                <div className="card flex-center" style={{ flexDirection: 'column' }}>
                    <ShieldAlert size={28} color="var(--warning)" style={{ marginBottom: '0.5rem' }} />
                    <h3>{pendingListings.length}</h3>
                    <p style={{ margin: 0 }}>Pending Verify</p>
                </div>
                <div className="card flex-center" style={{ flexDirection: 'column' }}>
                    <CheckCircle size={28} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
                    <h3>{listings.length}</h3>
                    <p style={{ margin: 0 }}>Total Listings</p>
                </div>
                <div className="card flex-center" style={{ flexDirection: 'column' }}>
                    <BarChart3 size={28} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                    <h3>{stats.totalFoodSaved} units</h3>
                    <p style={{ margin: 0 }}>Food Saved</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <button
                    className="btn"
                    style={{ background: activeTab === 'verifications' ? 'var(--secondary)' : 'transparent', color: 'var(--primary-dark)', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}
                    onClick={() => setActiveTab('verifications')}
                >
                    Verify Queue ({pendingListings.length})
                </button>
                <button
                    className="btn"
                    style={{ background: activeTab === 'analytics' ? 'var(--secondary)' : 'transparent', color: 'var(--primary-dark)', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}
                    onClick={() => setActiveTab('analytics')}
                >
                    Analytics
                </button>
                <button
                    className="btn"
                    style={{ background: activeTab === 'users' ? 'var(--secondary)' : 'transparent', color: 'var(--primary-dark)', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0' }}
                    onClick={() => setActiveTab('users')}
                >
                    User Moderation
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'verifications' && (
                <div>
                    {pendingListings.length === 0 ? (
                        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                            <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
                            <h3>All caught up!</h3>
                            <p>No listings pending verification.</p>
                        </div>
                    ) : (
                        <div className="grid">
                            {pendingListings.map(listing => (
                                <div key={listing.id} className="card" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                    <div style={{ width: '200px', height: '200px', flexShrink: 0 }}>
                                        <img
                                            src={listing.imageUrl}
                                            alt="Food to verify"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1, minWidth: '300px' }}>
                                        <div className="flex-between">
                                            <h3 style={{ margin: 0 }}>{listing.foodType}</h3>
                                            <span className="badge badge-pending">PENDING</span>
                                        </div>
                                        <p style={{ marginTop: '0.5rem', fontWeight: 600 }}>{listing.quantity} units • Listed by {listing.donorName}</p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{listing.description || 'No description provided.'}</p>

                                        <div style={{ background: 'var(--bg-color)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Expires In</p>
                                                <ExpiryTimer expiryTime={listing.expiryTime} />
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Listed At</p>
                                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>{new Date(listing.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>

                                        <div className="flex-between" style={{ marginTop: '1.5rem', gap: '1rem' }}>
                                            <button className="btn btn-outline" style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleVerification(listing, false)}>
                                                <XCircle size={18} /> Reject (Spoiled/Invalid)
                                            </button>
                                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleVerification(listing, true)}>
                                                <CheckCircle size={18} /> Approve (Safe)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="card">
                        <h3>Food Journey Overview</h3>
                        <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                            <Pie data={chartData} options={{
                                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } } }
                            }} />
                        </div>
                    </div>
                    <div className="card">
                        <h3>Platform Impact</h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li className="flex-between" style={{ paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                                <span>Platform Success Rate</span>
                                <strong style={{ fontSize: '1.2rem', color: 'var(--success)' }}>{easyStats.successRate}</strong>
                            </li>
                            <li className="flex-between" style={{ paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                                <span>Total Volume Handled</span>
                                <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{easyStats.totalVolume} units</strong>
                            </li>
                            <li className="flex-between" style={{ paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                                <span>Currently on the way</span>
                                <strong style={{ fontSize: '1.2rem', color: 'var(--info)' }}>{easyStats.activeDeliveries} deliveries</strong>
                            </li>
                            <li className="flex-between" style={{ paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-color)' }}>
                                <span>Rejected for Safety</span>
                                <strong style={{ fontSize: '1.2rem', color: 'var(--danger)' }}>{easyStats.rejectedCount} items</strong>
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Name</th>
                                <th style={{ padding: '1rem' }}>Role</th>
                                <th style={{ padding: '1rem' }}>Quality Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(u => u.role !== 'admin').map(user => {
                                const rating = getAverageRating(user.uid);
                                return (
                                    <tr key={user.uid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <strong>{user.name}</strong><br />
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</span>
                                        </td>
                                        <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{user.role}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {user.role === 'donor' ? (
                                                rating ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f57f17', fontWeight: 600 }}>
                                                        <Star size={14} fill="#f57f17" /> {rating}/5
                                                    </span>
                                                ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No ratings yet</span>
                                            ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
};

export default AdminPanel;
