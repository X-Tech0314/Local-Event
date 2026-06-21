import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle, Image as ImageIcon, ExternalLink, CalendarDays } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function VenueImageApprovals() {
    const [pendingImages, setPendingImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchPendingImages();
    }, []);

    const fetchPendingImages = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/moderate-image/pending`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch pending images');
            const data = await res.json();
            setPendingImages(data);
        } catch (err) {
            console.error("Error fetching images:", err);
            toast.error("Failed to load pending images.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (imageId, action) => {
        setProcessingId(imageId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/moderate-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ imageId, action })
            });

            if (res.ok) {
                toast.success(`Image ${action.toLowerCase()} successfully`);
                setPendingImages(prev => prev.filter(img => img.id !== imageId));
            } else {
                const data = await res.json();
                toast.error(data.message || `Failed to ${action} image.`);
            }
        } catch (err) {
            console.error(`Failed to process action ${action}:`, err);
            toast.error("An error occurred.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ImageIcon className="text-purple-600 dark:text-purple-400" size={24} />
                        Venue Image Moderation
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Review uploaded venue images that fell into the AI Gray Zone (35% - 79% risk score).
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
            ) : pendingImages.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">There are no pending venue images requiring your review.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingImages.map((img) => (
                        <div key={img.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative group aspect-video bg-slate-100 dark:bg-slate-900">
                                <img 
                                    src={img.cloudinaryUrl} 
                                    alt="Pending Moderation" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <a href={img.cloudinaryUrl} target="_blank" rel="noreferrer" className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-colors">
                                        <ExternalLink size={20} />
                                    </a>
                                </div>
                                <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                                    <AlertTriangle size={14} />
                                    Risk: {img.aiScore}%
                                </div>
                            </div>
                            
                            <div className="p-5">
                                <h4 className="font-bold text-slate-900 dark:text-white truncate" title={img.venueName}>
                                    {img.venueName}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                                    <CalendarDays size={14} />
                                    Uploaded: {new Date(img.createdAt).toLocaleDateString()}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mt-6">
                                    <button
                                        onClick={() => handleAction(img.id, 'APPROVED')}
                                        disabled={processingId === img.id}
                                        className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-500/10 dark:hover:bg-green-500/20 text-green-700 dark:text-green-400 font-bold text-sm transition-colors disabled:opacity-50"
                                    >
                                        <Check size={16} strokeWidth={3} /> Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(img.id, 'REJECTED')}
                                        disabled={processingId === img.id}
                                        className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 font-bold text-sm transition-colors disabled:opacity-50"
                                    >
                                        <X size={16} strokeWidth={3} /> Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
