import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Filter, MapPin, Clock, ArrowRight, MoreHorizontal, AlertCircle, Lock, Tag } from 'lucide-react';

export default function EventsPanel({ currentUser, setActivePanel }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Not authenticated. Please log in again.');
                return;
            }
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const errorText = await res.text().catch(() => '');
                throw new Error(`Server returned ${res.status}: ${errorText || res.statusText}`);
            }
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            if (err.message.includes('Failed to fetch') || err.message.includes('Network Error') || err.message.includes('401')) {
                console.warn('Backend unavailable or unauthorized, loading mock events.');
                const storedMocks = JSON.parse(localStorage.getItem('mockEvents') || '[]');
                setEvents([
                    ...storedMocks,
                    {
                        id: 'mock-evt-1',
                        title: 'Tech Meetup 2026',
                        startDateTime: new Date(Date.now() + 86400000).toISOString(),
                        barangay: 'Brgy. San Lorenzo',
                        city: 'Makati',
                        bannerUrl: ''
                    },
                    {
                        id: 'mock-evt-2',
                        title: 'Local Art Exhibit',
                        startDateTime: new Date(Date.now() - 86400000).toISOString(),
                        barangay: 'Brgy. South Triangle',
                        city: 'Quezon City',
                        bannerUrl: ''
                    }
                ]);
                return;
            }
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Events Directory</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage and track your published and drafted events.</p>
                </div>
                <button onClick={() => setActivePanel('create-event')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95">
                    <Plus size={18} strokeWidth={3} /> Create New Event
                </button>
            </div>
            
            {/* Command Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center relative overflow-hidden group">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
                    <input type="text" placeholder="Search event titles or venues..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all" />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95">
                        <Filter size={16} /> Filters
                    </button>
                    <div className="hidden md:flex border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-slate-50 dark:bg-slate-800">
                        <button className="px-4 py-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm text-sm font-bold text-slate-800 dark:text-white">Grid</button>
                        <button className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition">List</button>
                    </div>
                </div>
            </div>

            {/* Event Grid Deck */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="text-center py-20 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-200 dark:border-red-800">
                    <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
                    <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
                </div>
            ) : events.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center min-h-[400px] bg-slate-50/50 dark:bg-slate-900/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 p-8">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700 transform rotate-3 hover:rotate-6 transition-transform">
                        <Calendar className="text-purple-500 dark:text-purple-400" size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">It's quiet in here...</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 font-medium">You haven't launched any events yet. Tap the button below to start building your first unforgettable experience.</p>
                    <button onClick={() => setActivePanel('create-event')} className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/10 flex items-center gap-2 hover:-translate-y-1 active:scale-95">
                        <Plus size={18} strokeWidth={3} /> Create Event
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((evt) => {
                        const startDate = new Date(evt.startDateTime);
                        const endDate = new Date(evt.endDateTime);
                        const isUpcoming = startDate > new Date();
                        const status = isUpcoming ? 'Active' : 'Past';

                        const startStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const endStr = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        
                        const isMultiDay = startDate.toDateString() !== endDate.toDateString();
                        const timeDisplay = isMultiDay 
                            ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${startStr} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${endStr}`
                            : `${startStr} - ${endStr}`;

                        const venueDisplay = evt.venueName || "Custom Venue";
                        const microLocation = [evt.floorLevel, evt.wingSection, evt.boothNumber, evt.proximityAnchor].filter(Boolean).join(', ');
                        const fullAddress = [evt.streetAddress, evt.barangay, evt.city].filter(v => v && v !== 'N/A').join(', ');

                        return (
                            <div key={evt.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex flex-col relative">
                                {/* Event Thumbnail */}
                                <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                                    {evt.bannerUrl ? (
                                        <img src={evt.bannerUrl} alt={evt.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><Calendar size={48} /></div>
                                    )}
                                    
                                    {/* Status & Privacy Badge */}
                                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md bg-white/90 ${status === 'Active' ? 'text-emerald-500 border-emerald-500/20' : 'text-slate-500 border-slate-200'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                            {status}
                                        </span>
                                        {evt.accessType === 'Private' && (
                                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md bg-red-500/10 text-red-500 border-red-500/20">
                                                <Lock size={10} /> Private
                                            </span>
                                        )}
                                    </div>

                                    {/* Options Button */}
                                    <button className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>

                                {/* Event Details */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-md">{evt.category}</span>
                                        {evt.accessType === 'Private' && evt.verificationCode && (
                                            <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Code: {evt.verificationCode}</span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{evt.title}</h3>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                                <Calendar size={14} strokeWidth={2.5} />
                                            </div>
                                            <span>{dateStr}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                                <Clock size={14} strokeWidth={2.5} />
                                            </div>
                                            <span className="text-xs leading-normal">{timeDisplay}</span>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                                                <MapPin size={14} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{venueDisplay}</span>
                                                <span className="text-xs text-slate-500 line-clamp-1">{fullAddress}</span>
                                                {microLocation && (
                                                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">{microLocation}</span>
                                                )}
                                                {evt.mapUrl && (
                                                    <a 
                                                        href={evt.mapUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="text-[10px] text-purple-600 dark:text-purple-400 hover:text-purple-800 font-bold underline mt-1 flex items-center gap-1 w-max"
                                                    >
                                                        🗺️ View Map Location
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logistics Notes Box */}
                                    {evt.logisticsNotes && (
                                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 italic">
                                            <strong>Notes:</strong> {evt.logisticsNotes}
                                        </div>
                                    )}

                                    {/* Ticket Passes / Pricing Box */}
                                    {evt.ticketTiers && evt.ticketTiers.length > 0 ? (
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ticket Options</span>
                                                <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">Cap: {evt.maxCapacity}</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto pr-1">
                                                {evt.ticketTiers.map((tier, idx) => (
                                                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 p-2.5 rounded-xl flex items-center justify-between text-xs">
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{tier.tierName}</span>
                                                            <span className="text-[9px] text-slate-500 mt-0.5">
                                                                App: {tier.onlineSlots} | Door: {tier.f2fSlots}
                                                            </span>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <span className="font-black text-purple-600 dark:text-purple-400">
                                                                {tier.price === 0 ? "FREE" : `₱${tier.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                                            </span>
                                                            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">{tier.validityScope}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 text-xs text-slate-500">
                                            No ticket tiers configured.
                                        </div>
                                    )}

                                    {/* App Ticketing Window */}
                                    {evt.ticketSalesStart && evt.ticketSalesEnd && (
                                        <div className="mt-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-purple-500/5 border border-purple-500/10 px-2.5 py-1.5 rounded-lg">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                                            <span>App Ticketing: {new Date(evt.ticketSalesStart).toLocaleDateString([], { month: 'short', day: 'numeric' })} to {new Date(evt.ticketSalesEnd).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    )}

                                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center mt-auto">
                                        <p className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">ID: {evt.id.substring(0, 8)}</p>
                                        <button className="text-sm font-black text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Manage <ArrowRight size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}