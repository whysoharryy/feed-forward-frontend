import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Camera, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const AddDonation = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [foodType, setFoodType] = useState('Cooked Meals');
    const [quantity, setQuantity] = useState('');
    const [description, setDescription] = useState('');
    const [freshness, setFreshness] = useState(5); // 1-10
    const [image, setImage] = useState(null);

    // Camera Refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraActive, setCameraActive] = useState(false);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch (err) {
            toast.error('Could not access camera. Please allow permissions.');
            console.error('Camera error:', err);
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);

            // Add timestamp watermark
            context.fillStyle = 'rgba(0,0,0,0.5)';
            context.fillRect(0, canvasRef.current.height - 30, canvasRef.current.width, 30);
            context.fillStyle = 'white';
            context.font = '16px Arial';
            context.fillText(new Date().toLocaleString(), 10, canvasRef.current.height - 10);

            const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
            setImage(dataUrl);
            stopCamera();
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            setCameraActive(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            toast.error('Proof of food is mandatory!');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/donations', {
                foodType,
                quantity: parseFloat(quantity),
                description,
                freshness,
                imageUrl: image,
                lat: 0,
                lng: 0,
            });

            toast.success('Donation submitted for verification!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.message || 'Failed to submit donation');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cleanup camera on unmount
    React.useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 0', maxWidth: '600px' }}>
            <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Submit Donation</h1>

            <div className="card">
                {step === 1 && (
                    <div>
                        <h3>Step 1: Food Details</h3>
                        <div className="form-group" style={{ marginTop: '1.5rem' }}>
                            <label className="form-label">Food Category</label>
                            <select className="form-control" value={foodType} onChange={(e) => setFoodType(e.target.value)}>
                                <option value="Cooked Meals">Cooked Meals (e.g., Rice, Curry)</option>
                                <option value="Packaged Food">Packaged Food & Snacks</option>
                                <option value="Raw Produce">Raw Produce (Vegetables/Fruits)</option>
                                <option value="Bakery">Bakery Items & Breads</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Approximate Quantity (kg)</label>
                            <input
                                type="number"
                                className="form-control"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="e.g. 5"
                                min="0.5" step="0.5"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description (Optional)</label>
                            <textarea
                                className="form-control"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Any specific handling instructions or details..."
                                rows="3"
                            />
                        </div>

                        <div className="flex-between">
                            <div></div>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    if (!quantity) toast.error('Please enter quantity');
                                    else setStep(2);
                                }}
                            >
                                Next <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h3>Step 2: Verification Quality</h3>

                        <div className="form-group" style={{ marginTop: '1.5rem' }}>
                            <label className="form-label">Freshness Gauge (1-10)</label>
                            <div className="flex-between" style={{ gap: '1rem' }}>
                                <input
                                    type="range"
                                    min="1" max="10"
                                    value={freshness}
                                    onChange={(e) => setFreshness(parseInt(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                                <span className="badge badge-active" style={{ fontSize: '1rem' }}>{freshness}/10</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>* 10 means freshly cooked/prepared, 1 means near expiry.</p>
                        </div>

                        <div className="form-group" style={{ marginTop: '2rem' }}>
                            <label className="form-label">Proof of Quality (Mandatory)</label>
                            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>We require a live timestamped photo of the food to prevent fraud and ensure safety.</p>

                            {!image ? (
                                <div style={{ textAlign: 'center' }}>
                                    {cameraActive ? (
                                        <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                                            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', background: '#000' }} />
                                            <button
                                                type="button"
                                                onClick={captureImage}
                                                className="btn btn-primary"
                                                style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)' }}
                                            >
                                                <Camera size={18} /> Capture Photo
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <button type="button" onClick={startCamera} className="btn btn-outline" style={{ width: '100%', padding: '2rem 0', borderStyle: 'dashed', flexDirection: 'column', gap: '0.5rem' }}>
                                                <Camera size={32} />
                                                <span>Start Camera</span>
                                            </button>

                                            <label className="btn btn-outline" style={{ width: '100%', padding: '2rem 0', borderStyle: 'dashed', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                <span>Upload Image</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => setImage(reader.result);
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    )}
                                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                                </div>
                            ) : (
                                <div style={{ position: 'relative' }}>
                                    <img src={image} alt="Captured food" style={{ width: '100%', borderRadius: 'var(--radius-sm)', maxHeight: '400px', objectFit: 'contain' }} />
                                    <button
                                        type="button"
                                        onClick={() => setImage(null)}
                                        className="btn btn-secondary"
                                        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.2rem 0.5rem' }}
                                    >
                                        Retake
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex-between" style={{ marginTop: '2rem' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                                <ArrowLeft size={18} /> Back
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={!image || isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : <><Check size={18} /> Submit Listing</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddDonation;
