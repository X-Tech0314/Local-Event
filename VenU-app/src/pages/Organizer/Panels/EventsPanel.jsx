import React from 'react';
import { Calendar, Plus, Search, Filter, MapPin, Clock, ArrowRight, MoreHorizontal } from 'lucide-react';

export default function EventsPanel({ currentUser, setActivePanel }) {
    const events = [
        { name: 'Summer Tech Summit', date: 'June 20, 2026', time: '09:00 AM', venue: 'Main Hall A', status: 'Active', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', color: 'from-purple-500 to-indigo-600', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', dot: 'bg-emerald-500' },
        { name: 'Beach Yoga Session', date: 'June 22, 2026', time: '06:30 AM', venue: 'Bayfront Park', status: 'Draft', image: 'https://images.unsplash.com/photo-1522845015757-50bce044e5da?w=800&q=80', color: 'from-amber-500 to-orange-600', badge: 'bg-amber-500/10 text-amber-600 border-amber-500/20', dot: 'bg-amber-500' },
        { name: 'Jazz Night Showcase', date: 'June 24, 2026', time: '08:00 PM', venue: 'The Basement Lounge', status: 'Active', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80', color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', dot: 'bg-emerald-500' },
        { name: 'Startup Pitch Deck', date: 'July 01, 2026', time: '02:00 PM', venue: 'Silicon District Hub', status: 'Active', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?w=800&q=80', color: 'from-blue-500 to-indigo-600', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', dot: 'bg-emerald-500' }
    ];

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Events Directory</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage and track your published and drafted events.</p>
                </div>
                <button onClick={() => setActivePanel('create-event')} className="bg-[#A855F7] hover:bg-[#9333EA] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2 active:scale-95">
                    <Plus size={18} strokeWidth={3} /> Create New Event
                </button>
            </div>
            
            {/* Command Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#A855F7]"></div>
                <div className="relative w-full md:w-96 ml-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search event titles or venues..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#A855F7] focus:ring-2 focus:ring-[#A855F7]/20 focus:bg-white transition-all" />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all active:scale-95">
                        <Filter size={16} /> Filters
                    </button>
                    <div className="hidden md:flex border border-slate-200 rounded-xl p-1 bg-slate-50">
                        <button className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-bold text-slate-800">Grid</button>
                        <button className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 hover:text-slate-800 transition">List</button>
                    </div>
                </div>
            </div>

            {/* Event Grid Deck */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((evt, i) => (
                    <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative">
                        
                        {/* Event Thumbnail */}
                        <div className="h-48 relative overflow-hidden">
                            <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                            <img src={evt.image} alt={evt.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                            
                            {/* Status Badge */}
                            <div className="absolute top-4 left-4 z-20">
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md bg-white/90 ${evt.badge.replace('bg-', 'text-').replace('/10', '')}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${evt.dot} ${evt.status === 'Active' ? 'animate-pulse' : ''}`}></span>
                                    {evt.status}
                                </span>
                            </div>

                            {/* Options Button */}
                            <button className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>

                        {/* Event Details */}
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 group-hover:text-[#A855F7] transition-colors">{evt.name}</h3>
                            
                            <div className="space-y-3 mt-auto">
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#A855F7]">
                                        <Calendar size={14} strokeWidth={2.5} />
                                    </div>
                                    <span>{evt.date}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#A855F7]">
                                        <Clock size={14} strokeWidth={2.5} />
                                    </div>
                                    <span>{evt.time}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#A855F7]">
                                        <MapPin size={14} strokeWidth={2.5} />
                                    </div>
                                    <span>{evt.venue}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: EVT-{1000 + i}</p>
                                <button className="text-sm font-black text-[#A855F7] flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Manage <ArrowRight size={16} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}