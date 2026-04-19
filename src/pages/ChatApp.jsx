import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, doc, orderBy, addDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Image as ImageIcon, Check, CheckCheck, User, ArrowLeft, Clock, MoreVertical, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatApp = () => {
    const { currentUser } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const location = useLocation();
    const navigate = useNavigate();
    const scrollRef = useRef();
    const fileInputRef = useRef();

    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState({});
    
    // UI states
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [attachmentPreview, setAttachmentPreview] = useState(null);
    const [loading, setLoading] = useState(true);

    const colors = {
        bg: isDark ? '#111b21' : '#f0f2f5',
        sidebarBg: isDark ? '#111b21' : '#ffffff',
        chatBg: isDark ? '#0b141a' : '#efeae2',
        headerBg: isDark ? '#202c33' : '#f0f2f5',
        border: isDark ? '#2a3942' : '#ddd',
        borderLight: isDark ? '#202c33' : '#f0f0f0',
        itemHover: isDark ? '#202c33' : '#f5f6f6',
        activeChat: isDark ? '#2a3942' : '#ebebeb',
        textMain: isDark ? '#e9edef' : '#111',
        textSecondary: isDark ? '#d1d7db' : '#333',
        textMuted: isDark ? '#8696a0' : '#888',
        msgSelf: isDark ? '#005c4b' : '#dcf8c6',
        msgOther: isDark ? '#202c33' : '#fff',
        inputArea: isDark ? '#202c33' : '#f0f2f5',
        inputBg: isDark ? '#2a3942' : '#fff',
        partnerRole: { donor: '#1565C0', ngo: '#2e7d32', volunteer: '#E65100' }
    };

    // 1. Fetch Chat Threads (List)
    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by recent
            chatList.sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));
            setChats(chatList);
            setLoading(false);

            // Auto-select chat if passed via URL (e.g., ?chatId=xxx)
            const searchParams = new URLSearchParams(location.search);
            const targetChatId = searchParams.get('chatId');
            if (targetChatId && !activeChat) {
                const target = chatList.find(c => c.id === targetChatId);
                if (target) handleSelectChat(target);
            }
        }, (error) => {
            console.error("Firestore Error fetching chats:", error);
            toast.error("Error loading chats: Check Firestore permissions or indexes.");
            setLoading(false);
        });

        // Fallback to prevent infinite loading screen
        const fallbackTimer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => {
            unsubscribe();
            clearTimeout(fallbackTimer);
        };
    }, [currentUser, location.search, activeChat]);

    // 2. Fetch Active Chat Messages
    useEffect(() => {
        if (!activeChat) return;

        const q = query(collection(db, `chats/${activeChat.id}/messages`), orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            
            // Mark read
            const unreadCount = activeChat.unreadCount?.[currentUser.uid] || 0;
            if (unreadCount > 0) {
                updateDoc(doc(db, 'chats', activeChat.id), {
                    [`unreadCount.${currentUser.uid}`]: 0
                }).catch(console.error);
            }

            // Mark incoming messages as read
            snapshot.docChanges().forEach(change => {
                const msgData = change.doc.data();
                if (change.type === 'added' && msgData.senderId !== currentUser.uid && msgData.status !== 'read') {
                    updateDoc(doc(db, `chats/${activeChat.id}/messages`, change.doc.id), { status: 'read' });
                }
            });
            
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }, (error) => {
            console.error("Firestore error loading messages:", error);
            toast.error("Error loading messages.");
        });

        // Track typing indicator
        const typingUnsub = onSnapshot(doc(db, 'chats', activeChat.id), (doc) => {
            if (doc.exists()) setTypingUsers(doc.data().typing || {});
        }, (error) => {
            console.error("Firestore error loading typing info:", error);
        });

        return () => { unsubscribe(); typingUnsub(); };
    }, [activeChat, currentUser]);

    // 3. Handlers
    const handleSelectChat = (chat) => {
        setActiveChat(chat);
        setSidebarOpen(false); // Mobile closing sidebar
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachmentPreview) || !activeChat) return;

        const msgText = newMessage.trim();
        const base64Img = attachmentPreview;
        setNewMessage('');
        setAttachmentPreview(null);
        setIsTyping(false);

        // Update typing status eagerly
        updateDoc(doc(db, 'chats', activeChat.id), { [`typing.${currentUser.uid}`]: false }).catch(() => {});

        try {
            await addDoc(collection(db, `chats/${activeChat.id}/messages`), {
                text: msgText,
                imageUrl: base64Img || null,
                senderId: currentUser.uid,
                timestamp: serverTimestamp(),
                status: 'sent'
            });

            // Update parent chat
            const updates = {
                lastMessage: base64Img ? '📷 Image attached' : msgText,
                lastMessageTime: new Date().toISOString()
            };
            
            // Increment unread for others
            activeChat.participants.forEach(pid => {
                if (pid !== currentUser.uid) {
                    updates[`unreadCount.${pid}`] = (activeChat.unreadCount?.[pid] || 0) + 1;
                }
            });

            await updateDoc(doc(db, 'chats', activeChat.id), updates);
        } catch (error) {
            console.error(error);
            toast.error('Failed to send message');
        }
    };



    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (!activeChat) return;
        
        if (!isTyping) {
            setIsTyping(true);
            updateDoc(doc(db, 'chats', activeChat.id), { [`typing.${currentUser.uid}`]: true });
        }
        
        // Clear typing flag
        clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => {
            setIsTyping(false);
            updateDoc(doc(db, 'chats', activeChat.id), { [`typing.${currentUser.uid}`]: false });
        }, 1500);
    };

    const handleFileAttach = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1048576) return toast.error('Image size must be less than 1MB'); // Base64 limit protection
        
        const reader = new FileReader();
        reader.onload = (e) => setAttachmentPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getChatPartnerName = (chat) => {
        const others = chat.participants.filter(id => id !== currentUser.uid);
        if (others.length === 0) return 'Archived Chat';
        if (others.length === 1) return chat.participantDetails?.[others[0]]?.name || 'Unknown User';
        
        // Multi-party chat
        const names = others.map(id => chat.participantDetails?.[id]?.name || 'User');
        if (names.length === 2) return `${names[0]} & ${names[1]}`;
        return `${names[0]} + ${names.length - 1} others`;
    };
    
    const getChatPartnerRole = (chat) => {
        const others = chat.participants.filter(id => id !== currentUser.uid);
        if (others.length === 0) return 'user';
        if (others.length > 1) return 'logistics'; // special class for group avatar
        return chat.participantDetails?.[others[0]]?.role || 'user';
    };

    const getOtherTypingName = () => {
        if (!activeChat) return null;
        const typingId = Object.keys(typingUsers).find(id => id !== currentUser.uid && typingUsers[id]);
        return typingId ? activeChat.participantDetails?.[typingId]?.name : null;
    };


    if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading Communications Hub...</div>;

    const otherTyping = getOtherTypingName();

    return (
        <div className="chat-container">
            <style>{`
                .chat-container { display: flex; height: calc(100vh - 75px); background: ${colors.bg}; font-family: 'Inter', sans-serif; overflow: hidden; margin-left: calc(-50vw + 50%); width: 100vw; color: ${colors.textMain}; }
                .chat-sidebar { width: 350px; background: ${colors.sidebarBg}; border-right: 1px solid ${colors.border}; display: flex; flex-direction: column; z-index: 10; transition: 0.3s; }
                .chat-main { flex: 1; display: flex; flex-direction: column; background: ${colors.chatBg}; position: relative; }
                
                .chat-header { padding: 15px 20px; background: ${colors.headerBg}; border-bottom: 1px solid ${colors.border}; display: flex; align-items: center; justify-content: space-between; }
                .chat-list { flex: 1; overflow-y: auto; }
                .chat-list-item { padding: 15px 20px; border-bottom: 1px solid ${colors.borderLight}; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 15px; }
                .chat-list-item:hover { background: ${colors.itemHover}; }
                .chat-list-item.active { background: ${colors.activeChat}; }
                
                .avatar { width: 48px; height: 48px; border-radius: 50%; background: #2e7d32; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.2rem; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .avatar.donor { background: ${colors.partnerRole.donor}; }
                .avatar.ngo { background: ${colors.partnerRole.ngo}; }
                .avatar.volunteer { background: ${colors.partnerRole.volunteer}; }
                .avatar.logistics { background: #455a64; font-size: 0.9rem; }
                
                .message-area { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
                .message-bubble { max-width: 65%; padding: 10px 14px; border-radius: 12px; position: relative; font-size: 0.95rem; line-height: 1.4; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
                .msg-self { align-self: flex-end; background: ${colors.msgSelf}; border-top-right-radius: 2px; color: ${isDark ? '#e9edef' : '#111'}; }
                .msg-other { align-self: flex-start; background: ${colors.msgOther}; border-top-left-radius: 2px; color: ${isDark ? '#e9edef' : '#111'}; }
                
                .msg-meta { display: flex; align-items: center; justify-content: flex-end; gap: 4px; font-size: 0.7rem; color: ${colors.textMuted}; margin-top: 4px; }
                
                .input-area { padding: 15px 20px; background: ${colors.inputArea}; display: flex; align-items: center; gap: 10px; border-top: 1px solid ${colors.border}; }
                .chat-input { flex: 1; padding: 12px 20px; border: none; border-radius: 24px; font-size: 1rem; outline: none; box-shadow: 0 1px 2px rgba(0,0,0,0.1); background: ${colors.inputBg}; color: ${colors.textMain}; }
                .chat-input::placeholder { color: ${colors.textMuted}; }
                .icon-btn { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${colors.textMuted}; cursor: pointer; transition: 0.2s; border: none; background: transparent; }
                .icon-btn:hover { background: rgba(255,255,255,0.05); }
                .send-btn { background: #2e7d32; color: white; width: 45px; height: 45px; transition: transform 0.2s; }
                .send-btn:hover { background: #1b5e20; transform: scale(1.05); }
                .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                .typing-indicator { padding: 10px 20px; color: ${colors.textMuted}; font-size: 0.85rem; font-style: italic; position: absolute; bottom: 75px; background: transparent; }

                .badge-count { background: #2e7d32; color: white; font-size: 0.75rem; border-radius: 10px; padding: 2px 8px; font-weight: 700; }

                @media (max-width: 768px) {
                    .chat-sidebar { position: absolute; width: 100%; height: 100%; transform: translateX(${sidebarOpen ? '0' : '-100%'}); }
                    .back-btn { display: flex !important; margin-right: 10px; cursor: pointer; color: ${colors.textMain}; }
                }

                /* Scrollbar Styling */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-thumb { background: ${isDark ? '#374045' : '#ccc'}; border-radius: 3px; }
                ::-webkit-scrollbar-track { background: transparent; }
            `}</style>

            {/* SIDEBAR: Chat List */}
            <div className="chat-sidebar">
                <div className="chat-header">
                    <h2 style={{ margin: 0, fontSize: '1.4rem', color: colors.textMain }}>Messages</h2>
                    <MoreVertical className="icon-btn" size={20} />
                </div>
                
                <div className="chat-list">
                    {chats.length === 0 ? (
                        <div style={{ padding: '30px 20px', textAlign: 'center', color: colors.textMuted }}>
                            No active conversations.<br/>Claim a donation to start coordinating.
                        </div>
                    ) : (
                        chats.map(chat => {
                            const partnerName = getChatPartnerName(chat);
                            const role = getChatPartnerRole(chat);
                            const unread = chat.unreadCount?.[currentUser.uid] > 0;
                            
                            return (
                                <div 
                                    key={chat.id} 
                                    className={`chat-list-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                                    onClick={() => handleSelectChat(chat)}
                                >
                                    <div className={`avatar ${role}`}>{role === 'logistics' ? '3P' : partnerName.charAt(0)}</div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', color: colors.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {partnerName}
                                            </h4>
                                            <span style={{ fontSize: '0.75rem', color: unread ? '#2e7d32' : colors.textMuted, fontWeight: unread ? 800 : 500 }}>
                                                {formatTime(chat.lastMessageTime)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: colors.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: unread ? 700 : 400 }}>
                                                {chat.lastMessage || 'Start of conversation'}
                                            </p>
                                            {unread && <span className="badge-count">{chat.unreadCount[currentUser.uid]}</span>}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: colors.textMuted, marginTop: '4px' }}>
                                            Subject: <span style={{ fontWeight: 600 }}>{chat.foodType}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* MAIN: Active Chat View */}
            <div className="chat-main" style={{ backgroundImage: isDark ? 'none' : 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain' }}>
                {activeChat ? (
                    <>
                        <div className="chat-header">
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div className="back-btn" style={{ display: 'none' }} onClick={() => setSidebarOpen(true)}>
                                    <ArrowLeft size={24} />
                                </div>
                                <div className={`avatar ${getChatPartnerRole(activeChat)}`} style={{ width: 40, height: 40, marginRight: 15 }}>
                                    {getChatPartnerRole(activeChat) === 'logistics' ? '3P' : getChatPartnerName(activeChat).charAt(0)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: colors.textMain }}>{getChatPartnerName(activeChat)}</h3>
                                    <div style={{ fontSize: '0.8rem', color: colors.textMuted, marginTop: '2px' }}>
                                        {activeChat.foodType}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="icon-btn"><Info size={20}/></button>
                            </div>
                        </div>

                        <div className="message-area">
                            <div style={{ textAlign: 'center', margin: '15px 0' }}>
                                <span style={{ background: isDark ? '#1a2e35' : '#e1f5fe', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', color: isDark ? '#00bfa5' : '#555', boxShadow: '0 1px 1px rgba(0,0,0,0.05)', border: isDark ? '1px solid currentColor' : 'none' }}>
                                    🔒 Messages are end-to-end secured. Coordinating logistics for: <b>{activeChat.foodType}</b>
                                </span>
                            </div>

                            {messages.map((msg, index) => {
                                const isSelf = msg.senderId === currentUser.uid;
                                return (
                                    <div key={msg.id || index} className={`message-bubble ${isSelf ? 'msg-self' : 'msg-other'}`}>
                                        {!isSelf && (
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: activeChat.participantDetails?.[msg.senderId]?.role === 'donor' ? colors.partnerRole.donor : activeChat.participantDetails?.[msg.senderId]?.role === 'volunteer' ? colors.partnerRole.volunteer : colors.partnerRole.ngo, marginBottom: '4px' }}>
                                                {activeChat.participantDetails?.[msg.senderId]?.name || 'Partner'} • <span style={{ textTransform: 'uppercase', fontSize: '0.65rem', opacity: 0.8 }}>{activeChat.participantDetails?.[msg.senderId]?.role || 'User'}</span>
                                            </div>
                                        )}
                                        {msg.imageUrl && (
                                            <img src={msg.imageUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '8px' }} />
                                        )}
                                        
                                            <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                                        
                                        <div className="msg-meta">
                                            {formatTime(msg.timestamp)}
                                            {isSelf && (
                                                <span style={{ color: msg.status === 'read' ? '#53bdeb' : '#888', marginLeft: '2px', display: 'flex' }}>
                                                    {msg.status === 'sent' ? <Check size={14} /> : <CheckCheck size={14} />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            <div ref={scrollRef} style={{ float:"left", clear: "both" }}></div>
                        </div>

                        {otherTyping && (
                            <div className="typing-indicator">
                                {otherTyping} is typing...
                            </div>
                        )}

                        {attachmentPreview && (
                            <div style={{ padding: '10px 20px', background: '#e9edef', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ position: 'relative' }}>
                                    <img src={attachmentPreview} alt="preview" style={{ height: '60px', borderRadius: '8px' }}/>
                                    <button onClick={() => setAttachmentPreview(null)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer' }}><X size={12}/></button>
                                </div>
                            </div>
                        )}

                        <form className="input-area" onSubmit={handleSend}>
                            <button type="button" className="icon-btn" onClick={() => fileInputRef.current.click()}><ImageIcon size={22} /></button>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileAttach} />
                            

                            
                            <input 
                                type="text" 
                                className="chat-input" 
                                placeholder="Type a message to coordinate..." 
                                value={newMessage}
                                onChange={handleTyping}
                            />
                            
                            <button type="submit" className="icon-btn send-btn" disabled={!newMessage.trim() && !attachmentPreview}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: colors.textMuted }}>
                        <div style={{ background: isDark ? '#2a3942' : '#e0e0e0', width: 200, height: 200, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                            <Clock size={80} color={isDark ? '#54656f' : '#a0a0a0'} />
                        </div>
                        <h2 style={{ color: isDark ? '#d1d7db' : '#525252', fontWeight: 300 }}>FeedForward Logistics Chat</h2>
                        <p style={{ maxWidth: '400px', textAlign: 'center', lineHeight: '1.5' }}>
                            Select a chat on the left to coordinate food pickup and delivery securely with real-time updates.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatApp;
