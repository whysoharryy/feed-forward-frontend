import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Award, Globe, Utensils, Users, Building, TrendingUp, Calendar, Heart, Share2, Download, Wind, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const ImpactDashboard = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activePartners, setActivePartners] = useState([]);
    const [myDonations, setMyDonations] = useState([]);
    const [myTasks, setMyTasks] = useState([]);

    useEffect(() => {
        const loadImpactData = async () => {
            try {
                // All users can see platform-wide stats
                const statsRes = await api.get('/admin/stats');
                setStats(statsRes.data.stats);

                // Only admins can see the full partner list
                if (currentUser.role === 'admin') {
                    const usersRes = await api.get('/admin/users');
                    setActivePartners(usersRes.data.users.filter(u => u.role === 'donor' || u.role === 'ngo'));
                } else if (currentUser.role === 'volunteer') {
                    const tasksRes = await api.get('/tasks');
                    setMyTasks(tasksRes.data.tasks || []);
                    setActivePartners([]);
                } else {
                    const donationsRes = await api.get('/donations');
                    setMyDonations(donationsRes.data.donations || []);
                    setActivePartners([]);
                }
            } catch (error) {
                console.error('Error loading impact data:', error);
                toast.error('Could not load some impact data');
                // Set dummy stats to avoid infinite loading if stats fetch fails
                if (!stats) setStats({ totalFoodSaved: 0, co2Reduced: 0, activeVolunteers: 0 });
            } finally {
                setLoading(false);
            }
        };
        loadImpactData();
    }, [currentUser]);

    const exportCSV = () => {
        const config = getRoleMetrics();
        if (!config) return;

        const date = new Date().toLocaleDateString();
        let csvContent = "data:text/csv;charset=utf-8,";

        if (currentUser.role === 'donor') {
            // Detailed listing of items first
            csvContent += "Donated Items\n";
            csvContent += "Item Name,Quantity,Status,Listing Date,Listing Time\n";
            myDonations.forEach(d => {
                const dObj = d.timestamp ? new Date(d.timestamp) : null;
                const lDate = dObj ? dObj.toLocaleDateString() : "N/A";
                const lTime = dObj ? dObj.toLocaleTimeString() : "N/A";
                csvContent += `"${d.foodType || d.description || 'Donation'}","${d.quantity} units","${d.status.replace('_', ' ')}","${lDate}","${lTime}"\n`;
            });

            // Summary metrics after listing
            csvContent += "\nSummary Metrics\n";
            csvContent += "Metric,Value\n";
            config.metrics.forEach(m => {
                csvContent += `"${m.label}","${m.value} ${m.unit}"\n`;
            });
        } else {
            // Default global metrics for other roles
            csvContent += "Metric,Value\n"
                + `Total Food Saved,${stats.totalFoodSaved} units\n`
                + `CO2 Reduced,${stats.co2Reduced} kg\n`
                + `Active Volunteers,${stats.activeVolunteers}\n`
                + `Active Partners,${activePartners.length}`;
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `FeedForward_Impact_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Impact report downloaded as CSV');
    };

    if (loading || !stats) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><p>Quantifying impact...</p></div>;

    const getRoleMetrics = () => {
        switch (currentUser.role) {
            case 'admin': return {
                title: 'Global Platform Impact', subtitle: 'Cumulative results from all donors and volunteers.',
                metrics: [
                    { label: 'Total Salvaged', icon: <Globe size={28} />, color: '#2e7d32', unit: 'units', value: stats.totalFoodSaved },
                    { label: 'Active Donors', icon: <Users size={28} />, color: '#f9a825', unit: '', value: activePartners.filter(p => p.role === 'donor').length },
                    { label: 'Verified NGOs', icon: <Award size={28} />, color: '#6a1b9a', unit: '', value: activePartners.filter(p => p.role === 'ngo').length }
                ]
            };
            case 'donor': {
                const completed = myDonations.filter(d => d.status === 'completed');
                const uniqueNgos = new Set(completed.map(d => d.ngoId).filter(id => id)).size;
                const totalQuantity = completed.reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);

                return {
                    title: 'Your Social Impact', subtitle: 'Real-time record of your community contributions.',
                    metrics: [
                        { label: 'Total Units Saved', icon: <Award size={28} />, color: '#2e7d32', unit: 'units', value: totalQuantity },
                        { label: 'Successful Handovers', icon: <Sparkles size={28} />, color: '#0288d1', unit: 'delivered', value: completed.length },
                        { label: 'NGOs Impacted', icon: <Building size={28} />, color: '#6a1b9a', unit: 'orgs', value: uniqueNgos }
                    ]
                };
            }
            case 'ngo': {
                const completed = myDonations.filter(d => d.status === 'completed');
                const inTransit = myDonations.filter(d => d.status === 'claimed');
                const totalReceived = completed.reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);
                
                // Group by donor
                const donorStatsMap = completed.reduce((acc, d) => {
                    if (!acc[d.donorId]) {
                        acc[d.donorId] = { name: d.donorName || 'Local Business', quantity: 0, count: 0 };
                    }
                    acc[d.donorId].quantity += (parseFloat(d.quantity) || 0);
                    acc[d.donorId].count += 1;
                    return acc;
                }, {});
                const topDonors = Object.values(donorStatsMap).sort((a, b) => b.quantity - a.quantity);

                return {
                    title: 'Aid Intelligence Dashboard',
                    subtitle: 'Operational insights and donor network tracking.',
                    metrics: [
                        { label: 'Total Food Received', icon: <Utensils size={28} />, color: '#2e7d32', unit: 'units', value: totalReceived },
                        { label: 'Successful Collections', icon: <Award size={28} />, color: '#6a1b9a', unit: 'completed', value: completed.length },
                        { label: 'Ongoing Deliveries', icon: <TrendingUp size={28} />, color: '#f9a825', unit: 'active', value: inTransit.length }
                    ],
                    extra: (
                        <div className="card shadow-hover" style={{ marginTop: '2rem' }}>
                            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Users size={20} color="var(--primary)" /> Sourcing Network
                                </h3>
                                <span className="badge badge-active">{topDonors.length} active partners</span>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            <th style={{ padding: '0.75rem 0.5rem' }}>PARTNER NAME</th>
                                            <th style={{ padding: '0.75rem 0.5rem' }}>TOTAL AID PROVIDED</th>
                                            <th style={{ padding: '0.75rem 0.5rem' }}>PICKUP FREQUENCY</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topDonors.length > 0 ? topDonors.map((donor, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
                                                <td style={{ padding: '1rem 0.5rem' }}><strong>{donor.name}</strong></td>
                                                <td style={{ padding: '1rem 0.5rem' }}>{donor.quantity} units</td>
                                                <td style={{ padding: '1rem 0.5rem' }}>{donor.count} successful pickups</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No completed partnerships identified yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                };
            }
            case 'volunteer': {
                const completed = myTasks.filter(t => t.status === 'completed');
                const totalFood = completed.reduce((sum, t) => sum + (parseFloat(t.quantity) || 0), 0);
                
                return {
                    title: 'Your Delivery Milestones',
                    subtitle: 'Visualizing your individual contribution to the mission.',
                    metrics: [
                        { label: 'Total Food Moved', icon: <Utensils size={28} />, color: '#2e7d32', unit: 'units', value: totalFood },
                        { label: 'Successful Tasks', icon: <Award size={28} />, color: '#0288d1', unit: 'delivered', value: completed.length }
                    ]
                };
            }
            default: return null;
        }
    };

    const config = getRoleMetrics();
    if (!config) return null;

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
            <div className="flex-between">
                <div>
                    <h1>{config.title}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{config.subtitle}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={exportCSV}><Download size={18} /> Export CSV</button>
                </div>
            </div>

            <div className="grid" style={{ marginTop: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {config.metrics.map((m, i) => (
                    <div key={i} className="card shadow-hover" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', borderTop: `4px solid ${m.color}` }}>
                        <div style={{ color: m.color, marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{m.icon}</div>
                        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', fontWeight: 800 }}>{m.value}<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>{m.unit}</span></h2>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>{m.label}</p>
                    </div>
                ))}
            </div>

            {config.extra && config.extra}
        </div>
    );
};

export default ImpactDashboard;
