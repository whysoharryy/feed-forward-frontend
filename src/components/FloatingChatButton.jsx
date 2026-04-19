import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const FloatingChatButton = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadTotal, setUnreadTotal] = useState(0);

    useEffect(() => {
        if (!currentUser) return;
        
        const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let total = 0;
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const unread = data.unreadCount?.[currentUser.uid] || 0;
                total += unread;
            });
            setUnreadTotal(total);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Do not show on the chat page itself, login, signup, or landing
    const hiddenRoutes = ['/', '/login', '/signup', '/chat'];
    if (!currentUser || hiddenRoutes.includes(location.pathname)) {
        return null;
    }

    return (
        <div 
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer'
            }}
            onClick={() => navigate('/chat')}
        >
            <style>{`
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                .floating-chat-btn {
                    width: 60px;
                    height: 60px;
                    background-color: #25D366; /* WhatsApp Green */
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: white;
                    box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4);
                    position: relative;
                    transition: all 0.3s ease;
                }
                .floating-chat-btn:hover {
                    transform: scale(1.08) translateY(-3px);
                    box-shadow: 0 6px 20px rgba(37, 211, 102, 0.6);
                }
                .floating-chat-btn::before {
                    content: '';
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-color: #25D366;
                    border-radius: 50%;
                    z-index: -1;
                    animation: pulse-ring 2s infinite ease-out;
                }
            `}</style>
            <div className="floating-chat-btn">
                <MessageCircle size={32} strokeWidth={2.5} />
                
                {unreadTotal > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        backgroundColor: '#ff3b3b',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        {unreadTotal > 99 ? '99+' : unreadTotal}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloatingChatButton;
