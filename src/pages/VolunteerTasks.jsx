import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Map, PackageCheck, Navigation, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

const VolunteerTasks = () => {
    const { currentUser, refreshUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [activeTask, setActiveTask] = useState(null);
    const [otpMode, setOtpMode] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const loadData = async () => {
        try {
            const response = await api.get('/tasks');
            const { availableTasks, myActiveTasks } = response.data;

            setTasks(availableTasks || []);
            if (myActiveTasks && myActiveTasks.length > 0) {
                setActiveTask(myActiveTasks[0]); // Volunteer works 1 task at a time
            } else {
                setActiveTask(null);
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const acceptTask = async (task) => {
        setActionLoading(true);
        try {
            await api.post(`/tasks/accept/${task.id}`);
            toast.success('Task accepted! Proceed to pickup location.');
            loadData();
        } catch (error) {
            toast.error(error.message || 'Failed to accept task');
        } finally {
            setActionLoading(false);
        }
    };

    const verifyPickup = async () => {
        setActionLoading(true);
        try {
            await api.post(`/tasks/pickup/${activeTask.id}`, { otp: otpInput });
            setOtpMode(false);
            setOtpInput('');
            toast.success('Pickup verified. Deliver to NGO.');
            loadData();
        } catch (error) {
            toast.error(error.message || 'Invalid OTP');
        } finally {
            setActionLoading(false);
        }
    };

    const completeDelivery = async () => {
        setActionLoading(true);
        try {
            const response = await api.post(`/tasks/complete/${activeTask.id}`);
            toast.success(`Delivery completed! You earned ${response.data.karmaEarned} Karma Points.`, { icon: '🏆' });

            // Refresh user profile to get updated karma
            await refreshUser();
            loadData();
        } catch (error) {
            toast.error(error.message || 'Failed to complete delivery');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <p>Loading tasks...</p>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 0' }}>
            <h1>Volunteer Dispatch</h1>
            <p>Save food, help communities, and earn Karma.</p>

            {activeTask ? (
                <div className="card" style={{ marginTop: '2rem', border: '2px solid var(--primary)' }}>
                    <div className="flex-between">
                        <h2 style={{ margin: 0, color: 'var(--primary-dark)' }}>Active Mission</h2>
                        <span className="badge badge-active">{activeTask.status.replace('_', ' ').toUpperCase()}</span>
                    </div>

                    <div style={{ marginTop: '1.5rem', background: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                        <h3 style={{ margin: 0 }}>{activeTask.quantity}kg of {activeTask.foodType}</h3>
                        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                            <div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Pickup From:</p>
                                <strong>{activeTask.donorName}</strong>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Deliver To:</p>
                                <strong>{activeTask.ngoName}</strong>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        {activeTask.status === 'accepted' && !otpMode && (
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setOtpMode(true)} disabled={actionLoading}>
                                <PackageCheck size={18} /> I'm at the pickup location
                            </button>
                        )}

                        {otpMode && (
                            <div style={{ background: '#fff3e0', padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
                                <h4>Confirm Quality & Enter OTP</h4>
                                <p style={{ fontSize: '0.9rem' }}>Ask the donor for the 4-digit verification PIN (Demo code: <strong>1234</strong>).</p>
                                <div className="flex-center" style={{ gap: '1rem', marginTop: '1rem' }}>
                                    <input
                                        type="text"
                                        maxLength="4"
                                        className="form-control"
                                        style={{ width: '120px', textAlign: 'center', fontSize: '1.25rem', letterSpacing: '4px' }}
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value)}
                                        placeholder="____"
                                    />
                                    <button className="btn btn-primary" onClick={verifyPickup} disabled={actionLoading}>
                                        {actionLoading ? 'Verifying...' : 'Verify'}
                                    </button>
                                    <button className="btn btn-outline" onClick={() => setOtpMode(false)}>Cancel</button>
                                </div>
                            </div>
                        )}

                        {activeTask.status === 'in_transit' && (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-muted)' }}>Navigate to the NGO and handover the food safely.</p>
                                <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={completeDelivery} disabled={actionLoading}>
                                    {actionLoading ? 'Completing...' : <><Gift size={18} /> Confirm Handover & Complete</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ marginTop: '2rem' }}>
                    <h2>Available Tasks Near You</h2>
                    {tasks.length === 0 ? (
                        <div className="card text-center" style={{ padding: '3rem' }}>
                            <p>No active dispatch requests right now.</p>
                        </div>
                    ) : (
                        <div className="grid">
                            {tasks.map(task => (
                                <div key={task.id} className="card">
                                    <div className="flex-between">
                                        <h3 style={{ margin: 0 }}>{task.foodType}</h3>
                                        <span className="badge badge-pending">{task.quantity} kg</span>
                                    </div>
                                    <div style={{ marginTop: '1rem' }}>
                                        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <Map size={16} color="var(--primary)" /> <strong>{task.donorName}</strong>
                                            <Navigation size={12} color="var(--text-muted)" style={{ margin: '0 0.5rem' }} />
                                            <strong>{task.ngoName}</strong>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }} onClick={() => acceptTask(task)} disabled={actionLoading}>
                                        Accept Delivery Request (+150 Karma)
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VolunteerTasks;
