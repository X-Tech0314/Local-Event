import React from 'react';
import { Calendar, Users, Ticket, ArrowUpRight, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const mockVenues = [
    { id: 1, title: 'Grand Plaza Hall', capacity: '500 People', location: 'Downtown Hub', type: 'Indoor', coords: [14.33, 120.94] },
    { id: 2, title: 'Sunset Open Amphitheater', capacity: '1,200 People', location: 'Coastal Ridge', type: 'Outdoor', coords: [14.34, 120.93] },
    { id: 3, title: 'The Metro Tech Lab', capacity: '150 People', location: 'Silicon District', type: 'Hybrid', coords: [14.35, 120.95] }
];

const statCards = [
    {
        icon: Calendar,
        label: 'Total Active Events',
        value: '12',
        sub: '+3 this week',
        trend: 'up',
        color: 'from-[#A855F7] to-[#9333EA]',
        shadow: 'shadow-purple-500/20'
    },
    {
        icon: Users,
        label: 'Platform Enrollments',
        value: '5,240',
        sub: '4,832 Attendees · 408 Organizers',
        trend: 'up',
        color: 'from-blue-500 to-indigo-600',
        shadow: 'shadow-blue-500/20'
    },
    {
        icon: Ticket,
        label: 'Ticket Transactions',
        value: '₱ 219,500',
        sub: '+18.7% vs last month',
        trend: 'up',
        color: 'from-emerald-500 to-teal-600',
        shadow: 'shadow-emerald-500/20'
    },
];

export default function MainDashboard({ currentUser, setActivePanel }) {
    return (
        <div className="animate-fade-in space-y-8">
            {/* ── Dynamic Gradient Banner Header ──────────────────────────────────────────────── */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl p-8 lg:p-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#A855F7]/30 blur-[100px] pointer-events-none rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 blur-[100px] pointer-events-none rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={16} className="text-[#A855F7]" />
                            <p className="text-xs text-slate-400 uppercase tracking-[0.2em] font-bold">Platform Overview</p>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-white">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A855F7] to-indigo-400">{currentUser?.firstName || 'Alex'}</span>
                        </h1>
                        <p className="text-slate-300 mt-2 font-medium">Your event metrics are looking exceptional today. Let's make an impact.</p>
                    </div>
                    <button onClick={() => setActivePanel('analytics')} className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-6 py-3 rounded-xl font-bold backdrop-blur-md transition-all active:scale-95 shadow-lg shadow-black/20 flex items-center gap-2">
                        View Live Analytics <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* ── Premium Glassmorphic Stat Cards ────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map(({ icon: Icon, label, value, sub, trend, color, shadow }, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 group hover:shadow-xl transition-all duration-500 relative overflow-hidden"
                    >
                        <div className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${color} opacity-[0.03] group-hover:opacity-[0.08] rounded-full blur-2xl transition-opacity duration-500`}></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tight">{value}</p>
                            </div>
                            <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg ${shadow} transform group-hover:scale-110 transition-transform duration-500`}>
                                <Icon size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 relative z-10">
                            <p className={`text-xs flex items-center gap-1 font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {trend === 'up' && <ArrowUpRight size={14} strokeWidth={3} />}
                                {sub}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Blueprint Layout Grid ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Map & Analytics (7 columns) */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Event Performance */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black tracking-widest text-slate-800 uppercase flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse"></div> Performance Index
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-[#A855F7]/30 transition-colors">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Events</p>
                                <p className="text-3xl font-black mt-2 text-[#a855f7]">12</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-blue-500/30 transition-colors">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Bookings</p>
                                <p className="text-3xl font-black mt-2 text-slate-900">4,832</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-emerald-500/30 transition-colors">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Revenue (PHP)</p>
                                <p className="text-3xl font-black mt-2 text-slate-900">19,500</p>
                            </div>
                        </div>
                    </div>

                    {/* Venue Map */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-black tracking-widest text-slate-800 uppercase flex items-center gap-2 mb-6">
                            <MapPin size={16} className="text-[#A855F7]" /> Geolocation Coverage
                        </h3>
                        <div className="h-[340px] bg-slate-900 rounded-2xl border-4 border-slate-800 relative overflow-hidden shadow-inner">
                            <MapContainer center={[14.34, 120.94]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                />
                                {mockVenues.map((venue) => (
                                    <Marker key={venue.id} position={venue.coords}>
                                        <Popup className="rounded-xl overflow-hidden shadow-2xl border-0">
                                            <div className="font-sans min-w-[160px] p-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-1.5 bg-purple-100 rounded-lg text-[#A855F7]">
                                                        <MapPin size={14} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#A855F7]">{venue.type}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-900 leading-tight mb-1">{venue.title}</h4>
                                                <p className="text-xs font-medium text-slate-500">{venue.location}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Ticket Event Stack (5 columns) */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black tracking-widest text-slate-800 uppercase flex items-center gap-2">
                                <Calendar size={16} className="text-[#A855F7]" /> Upcoming Deployments
                            </h3>
                            <button className="text-xs font-bold text-[#A855F7] hover:text-purple-700 transition">View All</button>
                        </div>
                        
                        <div className="space-y-4">
                            {[
                                { title: 'Summer Tech Summit', date: 'JUN 20', color: 'bg-purple-600', time: '09:00 AM' },
                                { title: 'Beach Yoga Retreat', date: 'JUN 22', color: 'bg-emerald-500', time: '06:30 AM' },
                                { title: 'Jazz Night Live', date: 'JUN 24', color: 'bg-indigo-600', time: '08:00 PM' },
                                { title: 'Startup Pitch Deck', date: 'JUL 01', color: 'bg-amber-500', time: '02:00 PM' }
                            ].map((event, idx) => (
                                <div key={idx} className="flex bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#A855F7]/30 hover:shadow-lg transition-all cursor-pointer group overflow-hidden relative">
                                    {/* Ticket Stub Left side */}
                                    <div className={`${event.color} w-20 flex flex-col items-center justify-center text-white py-4 shadow-inner relative`}>
                                        <div className="w-4 h-4 bg-white rounded-full absolute -top-2 -right-2 shadow-inner"></div>
                                        <div className="w-4 h-4 bg-white rounded-full absolute -bottom-2 -right-2 shadow-inner"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{event.date.split(' ')[0]}</span>
                                        <span className="text-2xl font-black">{event.date.split(' ')[1]}</span>
                                    </div>
                                    
                                    {/* Ticket Main Body */}
                                    <div className="flex-1 p-5 flex justify-between items-center bg-white relative">
                                        <div className="absolute left-0 top-2 bottom-2 w-px border-l-2 border-dashed border-slate-200"></div>
                                        <div className="pl-2">
                                            <p className="font-bold text-slate-900 group-hover:text-[#A855F7] transition-colors">{event.title}</p>
                                            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{event.time}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#A855F7] group-hover:text-white transition-colors transform group-hover:-rotate-45">
                                            <ArrowRight size={14} strokeWidth={3} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
