import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle, Clock } from 'lucide-react';

const ExpiryTimer = ({ expiryTime }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        if (!expiryTime) return null;
        const difference = new Date(expiryTime) - new Date();
        if (difference <= 0) return { expired: true, totalMs: 0 };

        return {
            expired: false,
            totalMs: difference,
            h: Math.floor((difference / (1000 * 60 * 60))),
            m: Math.floor((difference / 1000 / 60) % 60),
            s: Math.floor((difference / 1000) % 60)
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const nextTime = calculateTimeLeft();
            setTimeLeft(nextTime);
        }, 1000);
        return () => clearInterval(timer);
    }, [expiryTime]);

    if (!timeLeft) return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.85rem' }}>
            <Clock size={14} /> <span>No Expiry Set</span>
        </div>
    );

    if (timeLeft.expired) {
        return (
            <div className="expiry-badge expired" style={{ 
                color: '#dc2626', 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                fontSize: '0.85rem',
                backgroundColor: '#fee2e2',
                padding: '4px 8px',
                borderRadius: '6px'
            }}>
                <AlertTriangle size={14} /> EXPIRED
            </div>
        );
    }

    const isUrgent = timeLeft.totalMs < 1000 * 60 * 60 * 2; // Less than 2 hours

    return (
        <div className={`expiry-badge ${isUrgent ? 'urgent animate-pulse' : ''}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isUrgent ? '#fee2e2' : '#f3f4f6',
            color: isUrgent ? '#dc2626' : '#4b5563',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            width: 'fit-content',
            border: isUrgent ? '1px solid #f87171' : '1px solid #e5e7eb'
        }}>
            <Timer size={14} />
            <span>{timeLeft.h}h {timeLeft.m}m {timeLeft.s}s</span>
        </div>
    );
};

export default ExpiryTimer;
