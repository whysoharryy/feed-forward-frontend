import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { Leaf, Menu, X, ArrowRight, ShieldCheck, Heart, MapPin, Camera, CheckSquare, BarChart3, Bell, Truck, Package, Search, Navigation, Sun, Moon, Languages } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// --- Animated Counter Helper ---
const Counter = ({ end, duration = 2, suffix = "", prefix = "" }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (inView) {
            let start = 0;
            const target = parseInt(end.replace(/,/g, ''));
            const incrementBase = target / (duration * 60);

            const timer = setInterval(() => {
                start += incrementBase;
                if (start > target) {
                    setCount(target);
                    clearInterval(timer);
                } else {
                    setCount(Math.ceil(start));
                }
            }, 1000 / 60);

            return () => clearInterval(timer);
        }
    }, [inView, end, duration]);

    return (
        <span ref={ref}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    const isDark = theme === 'dark';

    // References for parallax and spy
    const impactRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: impactRef,
        offset: ["start end", "end start"]
    });
    const yParallax = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

    // Handle scroll and active nav
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);

            const sections = ['home', 'how-it-works', 'features', 'impact', 'partners', 'contact'];
            const scrollPosition = window.scrollY + 100;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section);
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 70, // offset for fixed navbar
                behavior: 'smooth'
            });
            setMobileMenuOpen(false);
        }
    };

    // Color Palette mapping specifically requested
    const colors = {
        primary: isDark ? "#81C784" : "#1B5E20", // bright green for dark / dark green for light
        secondary: isDark ? "#A5D6A7" : "#4CAF50", // soft emerald
        accent1: isDark ? "#2E7D32" : "#A5D6A7", 
        accent2: isDark ? "#1A1A1A" : "#E8F5E9", // surface back
        white: isDark ? "#121212" : "#FFFFFF",
        textMain: isDark ? "#F9FAFB" : "#111827",
        textMuted: isDark ? "#9CA3AF" : "#4B5563",
        navBg: isDark ? "rgba(18, 18, 18, 0.9)" : "rgba(255, 255, 255, 0.95)",
        cardBg: isDark ? "#1E1E1E" : "#FFFFFF"
    };

    // Shared Styles
    const glassStyle = {
        background: isDark ? 'rgba(30, 30, 30, 0.75)' : 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(16px)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: isDark ? '0 8px 32px rgba(0, 0, 0, 0.4)' : '0 8px 32px rgba(27, 94, 32, 0.08)'
    };

    return (
        <div style={{ backgroundColor: colors.white, color: colors.textMain, overflowX: 'hidden', fontFamily: "'Inter', sans-serif", transition: 'background-color 0.3s' }}>

            {/* 1. CUSTOM STICKY NAVBAR */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0,
                    height: '75px',
                    display: 'flex',
                    alignItems: 'center',
                    alignItems: 'center',
                    background: scrolled ? colors.navBg : 'transparent',
                    backdropFilter: scrolled ? 'blur(10px)' : 'none',
                    boxShadow: scrolled ? (isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.05)') : 'none',
                    zIndex: 1000,
                    transition: 'all 0.3s ease',
                    borderBottom: scrolled && isDark ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}
            >
                <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => scrollTo('home')}>
                        <Leaf size={32} color={colors.primary} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.primary, letterSpacing: '-0.5px' }}>FeedForward</span>
                    </div>

                    {/* Desktop Nav */}
                    <div style={{ display: 'none', gap: '2rem', alignItems: 'center' }} className="desktop-nav">
                        {['home', 'how-it-works', 'features', 'impact', 'partners'].map((item) => (
                            <button
                                key={item}
                                onClick={() => scrollTo(item)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: '0.95rem', fontWeight: 600, textTransform: 'capitalize',
                                    color: activeSection === item ? colors.secondary : colors.textMuted,
                                    position: 'relative',
                                    transition: 'color 0.2s'
                                }}
                            >
                                {item.replace('-', ' ')}
                                {activeSection === item && (
                                    <motion.div layoutId="nav-indicator" style={{ position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px', background: colors.secondary, borderRadius: '2px' }} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div style={{ display: 'none', gap: '1.2rem', alignItems: 'center' }} className="desktop-nav">
                        <button onClick={toggleLanguage} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: colors.textMuted, fontSize: '0.9rem', fontWeight: 600 }}>
                            <Languages size={18} /> {language === 'hi' ? 'Hindi' : 'English'}
                        </button>
                        
                        <button onClick={toggleTheme} style={{ background: 'none', border: isDark ? '1px solid #333' : '1px solid #eee', padding: '0.4rem', borderRadius: '12px', cursor: 'pointer', color: isDark ? '#fbc02d' : '#555', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', fontWeight: 600, color: colors.primary, cursor: 'pointer', fontSize: '0.95rem' }}>Login</button>
                        <button onClick={() => navigate('/signup')} style={{ background: colors.primary, color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '9999px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.4)' : '0 4px 14px rgba(27,94,32,0.3)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            Donate Food
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="mobile-toggle" style={{ gap: '1rem', alignItems: 'center' }}>
                         <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#fbc02d' : '#555' }}>
                            {isDark ? <Sun size={24} /> : <Moon size={24} />}
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.primary }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Slide-in Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ position: 'fixed', top: '75px', right: 0, bottom: 0, width: '100%', maxWidth: '300px', background: colors.cardBg, zIndex: 999, padding: '2rem', boxShadow: isDark ? '-10px 0 30px rgba(0,0,0,0.5)' : '-10px 0 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: isDark ? '1px solid #333' : 'none' }}
                    >
                        {['home', 'how-it-works', 'features', 'impact', 'partners', 'contact'].map((item) => (
                            <button key={item} onClick={() => scrollTo(item)} style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '1.2rem', fontWeight: 600, color: activeSection === item ? colors.primary : colors.textMain, textTransform: 'capitalize' }}>
                                {item.replace('-', ' ')}
                            </button>
                        ))}
                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button onClick={() => navigate('/login')} style={{ background: 'none', border: `2px solid ${colors.primary}`, padding: '1rem', borderRadius: '12px', fontWeight: 600, color: colors.primary }}>Login</button>
                            <button onClick={() => navigate('/signup')} style={{ background: colors.primary, color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 600 }}>Donate Food</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. HERO SECTION */}
            <section id="home" style={{
                minHeight: '100vh',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                paddingTop: '75px', // offset for nav
                background: isDark ? `radial-gradient(at 0% 0%, #0d210e 0, transparent 50%), radial-gradient(at 50% 0%, #121212 0, transparent 50%), radial-gradient(at 100% 0%, #0d2e10 0, transparent 50%), #121212` : `linear-gradient(135deg, ${colors.accent2} 0%, #d1f2d3 100%)`, 
                overflow: 'hidden'
            }}>
                {/* Subtle Botanical Texture Overlay (CSS pattern) */}
                <div style={{ position: 'absolute', inset: 0, opacity: isDark ? 0.02 : 0.05, backgroundImage: 'radial-gradient(#1B5E20 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                {/* Animated SVG Leaves */}
                <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '20%', left: '10%', opacity: 0.2 }}>
                    <Leaf size={120} color={colors.primary} />
                </motion.div>
                <motion.div animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }} style={{ position: 'absolute', bottom: '15%', right: '5%', opacity: 0.15 }}>
                    <Leaf size={180} color={colors.secondary} />
                </motion.div>

                <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>

                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(76, 175, 80, 0.15)', padding: '0.5rem 1rem', borderRadius: '99px', color: colors.primary, fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                <Heart size={14} fill={colors.primary} /> Food Waste Redistribution Platform
                            </div>

                            <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', color: colors.primary, marginBottom: '1.5rem' }}>
                                Turning Surplus <br />
                                <span style={{ color: colors.secondary }}>Into Service.</span>
                            </h1>

                            <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.3rem)', color: colors.textMuted, marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '540px' }}>
                                We connect restaurants, hostels, and event organizers with trusted NGOs and volunteers to redistribute surplus edible food. Zero waste. Zero hunger.
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button onClick={() => navigate('/signup')} className="pill-btn-primary" style={{ background: colors.primary, color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '999px', fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '0 10px 25px rgba(27, 94, 32, 0.3)', transition: 'all 0.3s' }}>
                                    Donate Food <ArrowRight size={18} />
                                </button>
                                <button onClick={() => navigate('/signup')} className="pill-btn-outline" style={{ background: 'rgba(255,255,255,0.8)', color: colors.primary, border: `2px solid ${colors.secondary}`, padding: '1rem 2rem', borderRadius: '999px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s', backdropFilter: 'blur(5px)' }}>
                                    Join as NGO
                                </button>
                                <button 
                                    onClick={() => navigate('/signup')} 
                                    className="pill-btn-outline" 
                                    style={{ 
                                        background: 'rgba(255,255,255,0.7)', 
                                        color: '#f57c00', // Warning orange to stand out
                                        border: `2px solid #f57c00`, 
                                        padding: '1rem 2rem', 
                                        borderRadius: '999px', 
                                        fontSize: '1.1rem', 
                                        fontWeight: 700, 
                                        cursor: 'pointer', 
                                        transition: 'all 0.3s', 
                                        backdropFilter: 'blur(5px)',
                                        boxShadow: '0 4px 15px rgba(245, 124, 0, 0.1)'
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.background = '#f57c00';
                                        e.currentTarget.style.color = '#fff';
                                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 124, 0, 0.3)';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
                                        e.currentTarget.style.color = '#f57c00';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 124, 0, 0.1)';
                                    }}
                                >
                                    Volunteer with us
                                </button>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ position: 'relative' }}>
                            {/* Glassmorphism Floating Impact Cards structure */}
                            <div style={{ position: 'relative', height: '500px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {/* Center large visual (abstract) */}
                                <div style={{ width: '320px', height: '320px', borderRadius: '50%', background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, opacity: 0.8, filter: 'blur(10px)', animation: 'pulse 4s ease-in-out infinite alternate' }}></div>
                                <img src="/hero-volunteer.jpg" alt="Volunteers serving food" style={{ position: 'absolute', width: '300px', height: '400px', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 1, transform: 'rotate(2deg)' }} />

                                {/* Card 1 */}
                                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} style={{ ...glassStyle, position: 'absolute', top: '5%', left: '-10%', padding: '1.2rem', borderRadius: '16px', zIndex: 2, display: 'flex', gap: '1rem', alignItems: 'center', maxWidth: '250px' }}>
                                    <div style={{ background: colors.accent2, padding: '0.8rem', borderRadius: '50%', flexShrink: 0 }}><Heart fill={colors.secondary} color={colors.secondary} size={24} /></div>
                                    <div>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: colors.primary, fontStyle: 'italic', lineHeight: 1.4 }}>"Share food, share hope."</div>
                                    </div>
                                </motion.div>

                                {/* Card 2 */}
                                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} style={{ ...glassStyle, position: 'absolute', bottom: '15%', right: '-15%', padding: '1.2rem', borderRadius: '16px', zIndex: 2, display: 'flex', gap: '1rem', alignItems: 'center', maxWidth: '250px' }}>
                                    <div style={{ background: '#e0f2fe', padding: '0.8rem', borderRadius: '50%', flexShrink: 0 }}><Package color="#0288d1" size={24} /></div>
                                    <div>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: "#0288d1", fontStyle: 'italic', lineHeight: 1.4 }}>"Turn surplus into smiles."</div>
                                    </div>
                                </motion.div>

                                {/* Card 3 */}
                                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} style={{ ...glassStyle, position: 'absolute', top: '60%', left: '-10%', padding: '1rem', borderRadius: '16px', zIndex: 2, display: 'flex', gap: '0.8rem', alignItems: 'center', maxWidth: '250px' }}>
                                    <div style={{ background: '#fff3e0', padding: '0.6rem', borderRadius: '50%', flexShrink: 0 }}><ShieldCheck fill="#f57c00" color="#fff" size={20} /></div>
                                    <div>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: "#f57c00", fontStyle: 'italic', lineHeight: 1.4 }}>"Zero waste, zero hunger."</div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* 3. HOW IT WORKS / TIMELINE */}
            <section id="how-it-works" style={{ padding: '8rem 1.5rem', background: colors.white, borderTop: isDark ? '1px solid #1a1a1a' : 'none' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '2.5rem', color: colors.primary, marginBottom: '1rem' }}>How FeedForward Works</h2>
                        <p style={{ fontSize: '1.2rem', color: colors.textMuted, maxWidth: '600px', margin: '0 auto' }}>A seamless 3-step workflow connecting surplus to stomachs in real-time.</p>
                    </div>

                    {/* Interactive Horizontal Timeline */}
                    <div className="timeline-container" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        {/* Connecting Line (Desktop only effect handled via CSS fallback) */}
                        <div className="hide-mobile" style={{ position: 'absolute', top: '40px', left: '10%', right: '10%', height: '4px', background: `linear-gradient(90deg, ${colors.accent1}, ${colors.secondary})`, zIndex: 0, borderRadius: '4px' }}>
                            <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} style={{ width: '20px', height: '100%', background: '#fff', boxShadow: '0 0 10px #fff', borderRadius: '50%' }} />
                        </div>

                        {[
                            { step: '01', title: 'Donor Lists Surplus', desc: 'Take a quick photo. Our AI auto-tags categories. Live camera upload ensures freshness and prevents fraud.', icon: <Camera size={32} color={colors.primary} /> },
                            { step: '02', title: 'Smart Matching', desc: 'Nearby verified NGOs are instantly notified. They can accept the food with one tap based on their immediate requirement.', icon: <Search size={32} color={colors.secondary} /> },
                            { step: '03', title: 'Volunteer Delivers', desc: 'A registered volunteer is routed to pick up the food with real-time tracking, ensuring safe transit to the NGO.', icon: <Truck size={32} color="#f57c00" /> }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                className="hover-expand-card"
                                style={{
                                    background: isDark ? '#1e1e1e' : '#fff', padding: '2.5rem', borderRadius: '24px', position: 'relative', zIndex: 1,
                                    border: isDark ? '1px solid #333' : `1px solid ${colors.accent2}`, boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                                    transition: 'all 0.3s ease', cursor: 'pointer'
                                }}
                            >
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: isDark ? '#2e2e2e' : colors.accent2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: isDark ? `0 0 0 10px #1e1e1e, 0 0 20px rgba(0,0,0,0.2)` : `0 0 0 10px white, 0 0 20px ${colors.accent1}` }}>
                                    {item.icon}
                                </div>
                                <div style={{ fontSize: '3rem', fontWeight: 900, color: colors.accent2, position: 'absolute', top: '10px', right: '20px', lineHeight: 1 }}>{item.step}</div>
                                <h3 style={{ textAlign: 'center', fontSize: '1.4rem', color: colors.textMain, marginBottom: '1rem' }}>{item.title}</h3>
                                <p style={{ textAlign: 'center', color: colors.textMuted, lineHeight: 1.6 }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. FEATURES GRID */}
            <section id="features" style={{ padding: '8rem 1.5rem', background: colors.accent2 }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '2.5rem', color: colors.primary, marginBottom: '1rem' }}>Technology Built for Impact</h2>
                        <p style={{ fontSize: '1.1rem', color: colors.textMuted }}>Enterprise-grade logistics disguised as a simple app.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        {[
                            { title: 'Surplus Visibility', icon: <Search />, desc: 'Real-time discovery of verified food surplus items, ensuring NGOs can act quickly on available donations.' },
                            { title: 'Live Image Verification', icon: <Camera />, desc: 'Mandatory in-app camera captures eliminate stale food uploads and guarantee quality.' },
                            { title: 'Admin Approval', icon: <CheckSquare />, desc: 'A dedicated safety net. Platform admins review and verify bulk donations before they hit the feed.' },
                            { title: 'Impact Dashboard', icon: <BarChart3 />, desc: 'Automated CSR reporting. Generate detailed CSV reports of your CO2 and meal impact easily.' },
                            { title: 'Smart Notifications', icon: <Bell />, desc: 'Instant push alerts matching local surplus drop-offs with the closest available volunteers.' },
                            { title: 'Proximity Matching', icon: <MapPin />, desc: 'Intelligent algorithms prioritize matches within a 5km radius to preserve food temperature and reduce transit time.' }
                        ].map((feat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                                style={{
                                    background: isDark ? 'rgba(40,40,40,0.6)' : 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)',
                                    padding: '2rem', borderRadius: '1.5rem', /* 2xl corners */
                                    boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 4px 24px rgba(0,0,0,0.04)', display: 'flex', gap: '1.5rem',
                                    transition: 'transform 0.2s ease, background 0.2s', cursor: 'grab',
                                    border: isDark ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(50,50,50,0.8)' : '#fff'}
                                onMouseOut={e => e.currentTarget.style.background = isDark ? 'rgba(40,40,40,0.6)' : 'rgba(255,255,255,0.6)'}
                            >
                                <div style={{ background: colors.primary, color: '#fff', padding: '1rem', borderRadius: '1rem', height: 'fit-content' }}>
                                    {feat.icon}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', color: colors.textMain, marginBottom: '0.5rem' }}>{feat.title}</h4>
                                    <p style={{ color: colors.textMuted, fontSize: '0.95rem', lineHeight: 1.5 }}>{feat.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. IMPACT / PARALLAX SECTION */}
            <section id="impact" ref={impactRef} style={{ position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '6rem 1.5rem' }}>
                <motion.div
                    style={{
                        position: 'absolute', inset: -100,
                        backgroundImage: 'url("https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=2000")',
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        y: yParallax, zIndex: 0
                    }}
                />
                <div style={{ position: 'absolute', inset: 0, background: isDark ? 'linear-gradient(rgba(0, 0, 0, 0.9), rgba(12, 45, 14, 0.95))' : 'linear-gradient(rgba(17, 24, 39, 0.8), rgba(27, 94, 32, 0.9))', zIndex: 1 }}></div>

                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', maxWidth: '1000px', margin: '0 auto' }}>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, marginBottom: '4rem', lineHeight: 1.1, color: '#ffffff', textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}
                    >
                        Food Should Feed People,<br />
                        <span style={{ color: colors.accent1 }}>Not Landfills.</span>
                    </motion.h2>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem' }}>
                        {[
                            { value: '40', suffix: '%', label: 'Global Food Wasted' },
                            { value: '828', suffix: 'M', label: 'People Sleep Hungry' },
                            { value: '1', prefix: '$', suffix: 'T', label: 'Lost to the Economy' }
                        ].map((stat, i) => (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }} style={{ padding: '2rem', background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)', flex: '1 1 250px' }}>
                                <div style={{ fontSize: '4rem', fontWeight: 900, color: colors.accent1, lineHeight: 1, marginBottom: '0.5rem' }}>
                                    <Counter end={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 500, opacity: 0.9 }}>{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. PARTNERS & TESTIMONIALS */}
            <section id="partners" style={{ padding: '8rem 1.5rem', background: colors.white }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', color: colors.primary, marginBottom: '1rem' }}>Join an ecosystem of conscious brands and NGOs.</h2>
                    </div>

                    {/* Grayscale hover logos */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ background: isDark ? '#1a1a1a' : 'transparent', padding: '1rem', borderRadius: '12px' }}>
                                <motion.img
                                    src={`https://cdn-icons-png.flaticon.com/512/990/${990800 + i}.png`} // Placeholder generic icons
                                    alt={`Partner ${i}`}
                                    initial={{ opacity: 0.5, filter: isDark ? 'grayscale(100%) invert(0.8)' : 'grayscale(100%)' }}
                                    whileHover={{ opacity: 1, filter: isDark ? 'grayscale(0%) invert(0)' : 'grayscale(0%)', scale: 1.1 }}
                                    style={{ height: '50px', width: 'auto', objectFit: 'contain', cursor: 'pointer', transition: 'all 0.3s' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 7. FINAL CTA */}
            <section id="contact" style={{
                padding: '8rem 1.5rem',
                background: isDark ? `linear-gradient(135deg, #0d210e 0%, #000000 100%)` : `linear-gradient(135deg, ${colors.primary} 0%, #0d3811 100%)`,
                position: 'relative', overflow: 'hidden', color: '#fff', textAlign: 'center'
            }}>
                {/* Floating Leaves */}
                <motion.div animate={{ y: [0, -30, 0], x: [0, 20, 0], rotate: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity }} style={{ position: 'absolute', top: '10%', left: '20%', opacity: 0.2 }}><Leaf size={60} /></motion.div>
                <motion.div animate={{ y: [0, 40, 0], x: [0, -20, 0], rotate: [0, -15, 0] }} transition={{ duration: 9, repeat: Infinity }} style={{ position: 'absolute', bottom: '20%', right: '15%', opacity: 0.15 }}><Leaf size={80} /></motion.div>

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, color: '#ffffff' }}>Join The Movement.</h2>
                    <p style={{ fontSize: '1.2rem', color: colors.accent1, marginBottom: '4rem', lineHeight: 1.6 }}>Ready to make a difference? Whether you want to donate surplus food, register your NGO, or drive change directly in your neighborhood.</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/signup')} className="pill-btn-hover" style={{ background: isDark ? colors.secondary : '#fff', color: isDark ? '#121212' : colors.primary, padding: '1.2rem 2.5rem', borderRadius: '999px', fontWeight: 800, fontSize: '1.1rem', border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                            Donate Food Today
                        </button>
                        <button onClick={() => navigate('/signup')} style={{ background: 'transparent', color: '#fff', border: `2px solid ${colors.accent1}`, padding: '1.2rem 2.5rem', borderRadius: '999px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                            Register NGO
                        </button>
                        <button 
                            onClick={() => navigate('/signup')} 
                            style={{ 
                                background: 'transparent', 
                                color: isDark ? '#ffcc80' : '#ffcc80', 
                                border: `2px solid #ffcc80`, 
                                padding: '1.2rem 2.5rem', 
                                borderRadius: '999px', 
                                fontWeight: 800, 
                                fontSize: '1.1rem',
                                cursor: 'pointer', 
                                transition: 'all 0.3s' 
                            }} 
                            onMouseOver={e => {
                                e.currentTarget.style.background = '#ffcc80';
                                e.currentTarget.style.color = '#1B5E20';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }} 
                            onMouseOut={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#ffcc80';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            Volunteer With Us
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: isDark ? '#050a06' : '#0a1a0d', color: colors.accent1, padding: '3rem 1.5rem', textAlign: 'center', borderTop: isDark ? '1px solid #111' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Leaf size={24} /> <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>FeedForward App</span>
                </div>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, color: isDark ? '#666' : colors.accent1 }}>© {new Date().getFullYear()} FeedForward Technologies. Built for sustainable logistics.</p>
            </footer>

            {/* Additional Inline CSS for interactions */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-expand-card:hover {
                    transform: translateY(-10px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
                }
                .desktop-nav { display: flex !important; }
                .mobile-toggle { display: none !important; }
                @media (max-width: 900px) {
                    .desktop-nav { display: none !important; }
                    .mobile-toggle { display: flex !important; }
                    .hide-mobile { display: none !important; }
                }
                .mobile-toggle { display: flex; }
                .pill-btn-primary:active { transform: scale(0.95) !important; }
                .pill-btn-outline:hover { background: #4CAF50 !important; color: white !important; }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(1.1); opacity: 0.8; }
                }
            `}} />
        </div>
    );
};

export default LandingPage;
