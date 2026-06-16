import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Filter, MapPin, Clock, ArrowRight, MoreHorizontal, AlertCircle } from 'lucide-react';

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
            if (err.message.includes('Failed to fetch') || err.message.includes('Network Error')) {
                console.warn('Backend unavailable, loading mock events.');
                setEvents([
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
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
                <div className="relative w-full md:w-96 ml-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <Calendar className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No events found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't created any events yet.</p>
                    <button onClick={() => setActivePanel('create-event')} className="text-purple-600 dark:text-purple-400 font-bold hover:underline">
                        Create your first event
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((evt) => {
                        const evtDate = new Date(evt.startDateTime);
                        const isUpcoming = evtDate > new Date();
                        const status = isUpcoming ? 'Active' : 'Past';
                        
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
                                    
                                    {/* Status Badge */}
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md bg-white/90 ${status === 'Active' ? 'text-emerald-500 border-emerald-500/20' : 'text-slate-500 border-slate-200'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                                            {status}
                                        </span>
                                    </div>

                                    {/* Options Button */}
                                    <button className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>

                                {/* Event Details */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{evt.title}</h3>
                                    
                                    <div className="space-y-3 mt-auto">
                                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                                <Calendar size={14} strokeWidth={2.5} />
                                            </div>
                                            <span>{evtDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                                <Clock size={14} strokeWidth={2.5} />
                                            </div>
                                            <span>{evtDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                                <MapPin size={14} strokeWidth={2.5} />
                                            </div>
                                            <span className="truncate">{evt.barangay}, {evt.city}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">ID: {evt.id.substring(0, 8)}</p>
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