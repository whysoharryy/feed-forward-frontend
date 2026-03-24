import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    Navigation, Filter, MapPin, Truck, Heart, ShieldCheck, 
    Clock, Layers, Star, Zap, Crosshair, Map as MapIcon, Key, Info, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CUSTOM ICONS ---
const createCustomIcon = (bgColor, iconColor, isPulsing = false) => {
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
            <div style="
                background-color: ${bgColor}; 
                width: 36px; height: 36px; 
                border-radius: 50%; 
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                border: 2px solid white;
                position: relative;
                ${isPulsing ? `animation: urgencyPulse 1.5s infinite;` : ''}
            ">
                <div style="background-color: ${iconColor}; width: 14px; height: 14px; border-radius: 50%;"></div>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
    });
};

const iconDonationGreen = createCustomIcon('#2E7D32', '#A5D6A7');
const iconDonationUrgent = createCustomIcon('#d32f2f', '#ffcdd2', true);
const iconNGOBlue = createCustomIcon('#1565C0', '#90CAF9');
const iconVolunteerOrange = createCustomIcon('#E65100', '#FFCC80');

// Map Controller for "Locate Me"
const MapController = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

const LiveMapPage = () => {
    // --- STATE ---
    const [userLocation, setUserLocation] = useState([19.0760, 72.8777]); // Default: Mumbai
    const [donations, setDonations] = useState([]);
    const [ngos, setNgos] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [heatZones, setHeatZones] = useState([]);
    
    // Nearest NGO highlight
    const [nearestNGO, setNearestNGO] = useState(null);

    // UI Toggles & Mobile Bottom Sheet
    const [layer, setLayer] = useState('street'); 
    const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
    
    // Filters
    const [filterFoodType, setFilterFoodType] = useState('All'); // All, Veg, Non-Veg
    const [filterUrgency, setFilterUrgency] = useState(false);
    const [filterDistance, setFilterDistance] = useState(10); // Check distance natively 
    const [showDonations, setShowDonations] = useState(true);
    const [showNGOs, setShowNGOs] = useState(true);
    const [showVolunteers, setShowVolunteers] = useState(true);

    // --- INITIAL DATA & MOCKS ---
    useEffect(() => {
        // Locate user
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
                (err) => console.log("Geolocation error, using default", err),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    useEffect(() => {
        generateMockData(userLocation);
    }, [userLocation]);

    const randomizeLoc = useCallback((loc, spread = 0.05) => {
        return [
            loc[0] + (Math.random() - 0.5) * spread,
            loc[1] + (Math.random() - 0.5) * spread
        ];
    }, []);

    const generateMockData = useCallback((baseLoc) => {
        // Parse from LocalStorage
        const lsFood = JSON.parse(localStorage.getItem('foodListings')) || [];
        const lsUsers = JSON.parse(localStorage.getItem('users')) || [];
        const lsTasks = JSON.parse(localStorage.getItem('tasks')) || [];

        // Distribute local storage food onto map
        const mappedFood = lsFood.map((f, i) => ({
            ...f,
            id: f.id || `ls_food_${i}`,
            location: randomizeLoc(baseLoc, 0.06),
            trust: f.trustScore || (4 + Math.random()).toFixed(1),
            expiryTime: Math.floor(Math.random() * 5 + 1), // hours
            urgency: Math.random() > 0.7 ? 'high' : 'medium',
            vegType: Math.random() > 0.3 ? 'Veg' : 'Non-Veg'
        }));

        const mockDonations = [
            { id: 'd1', title: 'Dal Makhani & Rice', items: 'Cooked', qty: '40 servings', urgency: 'high', location: randomizeLoc(baseLoc), trust: 4.8, expiryTime: 1, vegType: 'Veg', freshness: 'Excellent' },
            { id: 'd2', title: 'Fresh Vegetables', items: 'Produce', qty: '15 kg', urgency: 'low', location: randomizeLoc(baseLoc), trust: 4.5, expiryTime: 24, vegType: 'Veg', freshness: 'Good' },
            { id: 'd3', title: 'Chicken Curry', items: 'Cooked', qty: '20 servings', urgency: 'high', location: randomizeLoc(baseLoc), trust: 4.9, expiryTime: 0.5, vegType: 'Non-Veg', freshness: 'Fair' },
        ];
        
        const mappedNGOs = lsUsers.filter(u => u.role === 'ngo').map((n, i) => ({
            ...n, id: n.id || `ls_ngo_${i}`, location: randomizeLoc(baseLoc, 0.08)
        }));
        
        const mockNGOs = [
            { id: 'n1', name: 'Hope Shelter', need: 'High', location: randomizeLoc(baseLoc, 0.04) },
            { id: 'n2', name: 'Grace Orphanage', need: 'Medium', location: randomizeLoc(baseLoc, 0.05) }
        ];

        const mappedVols = lsUsers.filter(u => u.role === 'volunteer').map((v, i) => ({
            ...v, id: v.id || `ls_vol_${i}`, location: randomizeLoc(baseLoc, 0.06)
        }));

        const mockVols = [
            { id: 'v1', name: 'Raj Kumar', status: 'active', location: randomizeLoc(baseLoc, 0.02) },
            { id: 'v2', name: 'Anita Desai', status: 'idle', location: randomizeLoc(baseLoc, 0.03) }
        ];

        const calculatedDonations = [...mappedFood, ...mockDonations];
        const calculatedNGOs = [...mappedNGOs, ...mockNGOs];
        
        // Find nearest NGO
        if (calculatedNGOs.length > 0) {
            setNearestNGO(calculatedNGOs[0]); 
        }

        const mockTransportTasks = [
            { 
                id: 't1', volId: 'v1', 
                startLoc: calculatedDonations[0]?.location || randomizeLoc(baseLoc), 
                endLoc: calculatedNGOs[0]?.location || randomizeLoc(baseLoc), 
                eta: '12 mins', dist: '2.4 km' 
            }
        ];

        const mockHeatZones = [
            { center: randomizeLoc(baseLoc, 0.05), radius: 1000, intensity: 0.5 },
            { center: randomizeLoc(baseLoc, 0.07), radius: 1500, intensity: 0.3 }
        ];

        setDonations(calculatedDonations);
        setNgos(calculatedNGOs);
        setVolunteers([...mappedVols, ...mockVols]);
        setTasks(lsTasks.length > 0 ? lsTasks : mockTransportTasks);
        setHeatZones(mockHeatZones);
    }, [randomizeLoc]);

    // --- SIMULATED LIVE UPDATES ---
    useEffect(() => {
        const interval = setInterval(() => {
            setDonations(prev => {
                const newDonations = [...prev];
                // Remove a random old donation if list is too big
                if (Math.random() > 0.8 && newDonations.length > 5) {
                    newDonations.pop();
                }
                // Add new local donation
                if (Math.random() > 0.5) {
                    newDonations.unshift({
                        id: 'live_' + Date.now(),
                        title: 'Surplus Event Banquet',
                        qty: Math.floor(Math.random() * 50 + 10) + ' servings',
                        urgency: Math.random() > 0.6 ? 'high' : 'medium',
                        location: [userLocation[0] + (Math.random() - 0.5) * 0.04, userLocation[1] + (Math.random() - 0.5) * 0.04],
                        trust: (Math.random() * 1 + 4).toFixed(1),
                        expiryTime: Math.floor(Math.random() * 4 + 1),
                        vegType: Math.random() > 0.5 ? 'Veg' : 'Non-Veg',
                        freshness: 'Excellent'
                    });
                }
                return newDonations.slice(0, 20); // cap at 20
            });
        }, 6000); 

        return () => clearInterval(interval);
    }, [userLocation]);

    // --- HANDLERS & FILTERS ---
    const handleLocateMe = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLocation([pos.coords.latitude, pos.coords.longitude]);
            });
        }
    };

    const getMapLayer = () => {
        if (layer === 'satellite') {
            return <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" />;
        }
        return <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />;
    };

    const calculateDistance = (loc1, loc2) => {
        // Very rough approx distance in km for mock filtering
        const dx = loc1[0] - loc2[0];
        const dy = loc1[1] - loc2[1];
        return Math.sqrt(dx*dx + dy*dy) * 111; 
    };

    const filteredDonations = useMemo(() => {
        return donations.filter(d => {
            if (filterUrgency && d.urgency !== 'high') return false;
            if (filterFoodType !== 'All' && d.vegType !== filterFoodType) return false;
            if (calculateDistance(userLocation, d.location) > filterDistance) return false;
            return true;
        });
    }, [donations, filterUrgency, filterFoodType, filterDistance, userLocation]);

    // --- UI COMPONENTS ---
    const FloatingControls = () => (
        <div className="map-floating-panel hide-on-mobile">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#2E7D32' }}>
                    <Navigation size={20} /> Live Logistics
                </h2>
                <div style={{ fontSize: '0.8rem', background: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32', padding: '4px 8px', borderRadius: '12px', fontWeight: 700, animation: 'urgencyPulse 2s infinite' }}>LIVE</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600, color: '#666' }}>Smart Filters</div>
                
                {/* Food Type */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    {['All', 'Veg', 'Non-Veg'].map(type => (
                        <button key={type} className={`filter-chip ${filterFoodType === type ? 'active' : ''}`} onClick={() => setFilterFoodType(type)}>
                            {type}
                        </button>
                    ))}
                </div>
                
                {/* Urgency */}
                <button className={`filter-chip ${filterUrgency ? 'active-urgent' : ''}`} onClick={() => setFilterUrgency(!filterUrgency)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={14} /> Critical Expiry
                </button>

                {/* Distance Slider */}
                <div style={{ marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Search Radius</span>
                        <span>{filterDistance} km</span>
                    </label>
                    <input type="range" min="1" max="25" value={filterDistance} onChange={e => setFilterDistance(e.target.value)} style={{ width: '100%', accentColor: '#2E7D32' }} />
                </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600, color: '#666' }}>Map Layers</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="layer-toggle"><input type="checkbox" checked={showDonations} onChange={()=>setShowDonations(!showDonations)} /> <span style={{color: '#2E7D32', fontWeight: 600}}>Donations</span></label>
                    <label className="layer-toggle"><input type="checkbox" checked={showNGOs} onChange={()=>setShowNGOs(!showNGOs)} /> <span style={{color: '#1565C0', fontWeight: 600}}>NGOs</span></label>
                    <label className="layer-toggle"><input type="checkbox" checked={showVolunteers} onChange={()=>setShowVolunteers(!showVolunteers)} /> <span style={{color: '#E65100', fontWeight: 600}}>Volunteers</span></label>
                </div>
            </div>

            <div>
                <div style={{ fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600, color: '#666' }}>Base Map</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={`filter-chip ${layer === 'street' ? 'active' : ''}`} onClick={() => setLayer('street')}><MapIcon size={14}/> Street</button>
                    <button className={`filter-chip ${layer === 'satellite' ? 'active' : ''}`} onClick={() => setLayer('satellite')}><Layers size={14}/> Satellite</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="live-map-wrapper">
            <style>{`
                .live-map-wrapper { position: relative; width: 100vw; height: calc(100vh - 75px); overflow: hidden; background: #e0e0e0; font-family: 'Inter', sans-serif; }
                .leaflet-container { height: 100%; width: 100%; z-index: 10; }
                
                @keyframes urgencyPulse {
                    0% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); }
                    70% { box-shadow: 0 0 0 15px rgba(211, 47, 47, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
                }

                @keyframes dash {
                    to { stroke-dashoffset: -20; }
                }
                .animated-polyline { animation: dash 1s linear infinite; }

                /* Modern Glassmorphism Popup */
                .leaflet-popup-content-wrapper {
                    background: rgba(255, 255, 255, 0.95) !important;
                    backdrop-filter: blur(16px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    border-radius: 20px !important;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15) !important;
                    padding: 0 !important;
                }
                .leaflet-popup-content { margin: 0 !important; width: 280px !important; }
                .leaflet-popup-tip { background: rgba(255, 255, 255, 0.95) !important; }

                /* Floating Controls Panel + Buttons */
                .map-floating-panel {
                    position: absolute; top: 20px; left: 20px; z-index: 1000;
                    background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(16px);
                    padding: 1.5rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.6);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1); width: 320px;
                }
                
                .filter-chip {
                    padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
                    transition: all 0.2s; border: 1px solid #ddd; background: #fff; color: #555;
                }
                .filter-chip:hover { border-color: #aaa; }
                .filter-chip.active { background: #2E7D32; color: white; border-color: #2E7D32; }
                .filter-chip.active-urgent { background: #d32f2f; color: white; border-color: #d32f2f; }
                
                .layer-toggle {
                    display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer;
                }

                .action-btn {
                    position: absolute; right: 20px; background: white; border: none;
                    width: 50px; height: 50px; border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 1000;
                    color: #2E7D32; transition: all 0.2s; border: 1px solid rgba(0,0,0,0.05);
                }
                .action-btn:hover { transform: scale(1.05); }

                @media (max-width: 900px) {
                    .hide-on-mobile { display: none !important; }
                    .mobile-panel-toggle { display: flex !important; }
                }
                .mobile-panel-toggle { display: none; }
            `}</style>

            <FloatingControls />

            {/* Mobile Bottom Sheet Toggle */}
            <button className="action-btn mobile-panel-toggle" style={{ top: '20px', left: '20px', right: 'auto' }} onClick={() => setMobilePanelOpen(true)}>
                <Filter size={22} />
            </button>

            {/* Locate Me */}
            <button className="action-btn" style={{ top: '20px' }} onClick={handleLocateMe} title="Locate Me">
                <Crosshair size={22} />
            </button>

            {/* Highlight Nearest NGO */}
            <button className="action-btn" style={{ top: '80px' }} onClick={() => nearestNGO && setUserLocation(nearestNGO.location)} title="Find Nearest NGO">
                <ShieldCheck size={22} color="#1565C0" />
            </button>

            {/* Mobile Bottom Sheet */}
            <AnimatePresence>
                {mobilePanelOpen && (
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1100, background: '#fff', borderRadius: '24px 24px 0 0', padding: '1.5rem', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Map Controls</h3>
                            <button onClick={()=>setMobilePanelOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        {/* Simplified mobile controls */}
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '1rem' }}>
                            {['All', 'Veg', 'Non-Veg'].map(type => (
                                <button key={type} className={`filter-chip ${filterFoodType === type ? 'active' : ''}`} onClick={() => setFilterFoodType(type)}>{type}</button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                            <label className="layer-toggle"><input type="checkbox" checked={showDonations} onChange={()=>setShowDonations(!showDonations)} /> Donations</label>
                            <label className="layer-toggle"><input type="checkbox" checked={showNGOs} onChange={()=>setShowNGOs(!showNGOs)} /> NGOs</label>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <MapContainer center={userLocation} zoom={13} zoomControl={false} scrollWheelZoom={true}>
                <MapController center={userLocation} />
                {getMapLayer()}

                {/* Hunger Demand Heat Zones */}
                {heatZones.map((zone, idx) => (
                    <Circle 
                        key={idx} 
                        center={zone.center} 
                        radius={zone.radius}
                        pathOptions={{ color: '#d32f2f', fillColor: '#d32f2f', fillOpacity: zone.intensity, stroke: false }}
                    />
                ))}

                <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
                    {/* Donations */}
                    {showDonations && filteredDonations.map((d) => (
                        <Marker 
                            key={d.id} 
                            position={d.location} 
                            icon={d.expiryTime <= 2 || d.urgency === 'high' ? iconDonationUrgent : iconDonationGreen}
                        >
                            <Popup>
                                <div style={{ padding: '1.2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <span style={{ background: d.vegType === 'Veg' ? '#e8f5e9' : '#ffebee', color: d.vegType === 'Veg' ? '#2e7d32' : '#c62828', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                            {d.vegType}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: '#f57c00' }}>
                                            <Star size={14} fill="#f57c00" /> {d.trust}
                                        </div>
                                    </div>
                                    
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#111827', fontWeight: 800 }}>{d.title || d.items}</h3>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '12px 0' }}>
                                        <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Quantity</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111', display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={14}/> {d.qty || d.quantity}</div>
                                        </div>
                                        <div style={{ background: '#f3f4f6', padding: '8px', borderRadius: '8px' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Freshness</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: d.freshness === 'Excellent' ? '#2e7d32' : '#f57c00' }}>{d.freshness || 'Good'}</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: d.expiryTime <= 2 ? '#d32f2f' : '#2e7d32', fontWeight: 800, marginBottom: '16px' }}>
                                        <Clock size={18} /> Expiring in ~{d.expiryTime} hrs
                                    </div>
                                    
                                    <button style={{ width: '100%', padding: '12px', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: '0.2s', boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)' }} onMouseOver={e=>e.target.style.background='#1B5E20'} onMouseOut={e=>e.target.style.background='#2E7D32'}>
                                        Accept Donation
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    
                    {/* NGOs */}
                    {showNGOs && ngos.map(n => (
                        <Marker key={n.id} position={n.location} icon={iconNGOBlue}>
                            <Popup>
                                <div style={{ padding: '1rem', textAlign: 'center' }}>
                                    <ShieldCheck size={32} color="#1565C0" style={{ margin: '0 auto 8px' }} />
                                    <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#111', fontWeight: 800 }}>{n.name || n.organizationName}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666', background: '#e3f2fd', display: 'inline-block', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>Verified NGO</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Volunteers */}
                    {showVolunteers && volunteers.map(v => (
                        <Marker key={v.id} position={v.location} icon={iconVolunteerOrange}>
                            <Popup>
                                <div style={{ padding: '1rem', textAlign: 'center' }}>
                                    <Truck size={32} color="#E65100" style={{ margin: '0 auto 8px' }} />
                                    <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: '#111', fontWeight: 800 }}>{v.name}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: v.status === 'active' ? '#2E7D32' : '#f57c00', fontWeight: 700 }}>
                                        {v.status === 'active' ? '● En Route' : '● Available Now'}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>

                {/* Simulated Volunteer Routes */}
                {(showDonations || showNGOs) && tasks.map((t, idx) => {
                    const polyOptions = {
                        color: idx % 2 === 0 ? '#1565C0' : '#E65100', // varying colors for tasks
                        weight: 4, 
                        dashArray: '10, 15',
                        className: 'animated-polyline'
                    };
                    return (
                        <Polyline key={t.id} positions={[t.startLoc, t.endLoc]} pathOptions={polyOptions}>
                            <Popup>
                                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                                    <div style={{ fontWeight: 800, color: polyOptions.color, marginBottom: '6px' }}>Active Transit</div>
                                    <div style={{ fontSize: '0.85rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span><b>Distance:</b> {t.dist}</span>
                                        <span><b>ETA:</b> {t.eta}</span>
                                    </div>
                                </div>
                            </Popup>
                        </Polyline>
                    );
                })}

            </MapContainer>
        </div>
    );
};

export default LiveMapPage;
