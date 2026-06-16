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
        color: 'bg-slate-100 dark:bg-slate-700',
        shadow: ''
    },
    {
        icon: Users,
        label: 'Platform Enrollments',
        value: '5,240',
        sub: '4,832 Attendees · 408 Organizers',
        trend: 'up',
        color: 'bg-slate-100 dark:bg-slate-700',
        shadow: ''
    },
    {
        icon: Ticket,
        label: 'Ticket Transactions',
        value: '₱ 219,500',
        sub: '+18.7% vs last month',
        trend: 'up',
        color: 'bg-slate-100 dark:bg-slate-700',
        shadow: ''
    },
];

export default function MainDashboard({ currentUser, setActivePanel }) {
    return (
        <div className="animate-fade-in space-y-8">
            {/* ── Header ──────────────────────────────────────────────── */}
            <div className="relative rounded overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 lg:p-10">
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={14} className="text-slate-500" />
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Platform Overview</p>
                        </div>
                        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
                            Welcome back, <span className="text-purple-700 dark:text-purple-400">{currentUser?.firstName || 'Alex'}</span>
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm font-medium">Your event metrics are looking excellent today.</p>
                    </div>
                    <button onClick={() => setActivePanel('analytics')} className="bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-700 dark:hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 px-5 py-2.5 rounded text-sm font-medium transition-all active:scale-95 flex items-center gap-2">
                        View Analytics <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map(({ icon: Icon, label, value, sub, trend, color, shadow }, idx) => (
                    <div
                        key={idx}
                        className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-6 group transition-all duration-300 relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
                            </div>
                            <div className={`p-3 rounded ${color} bg-slate-100 dark:bg-slate-700 border border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-400 transform group-hover:scale-105 transition-transform duration-300`}>
                                <Icon size={20} strokeWidth={2} />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 relative z-10">
                            <p className={`text-xs flex items-center gap-1 font-medium ${trend === 'up' ? 'text-purple-700 dark:text-purple-400' : 'text-slate-400'}`}>
                                {trend === 'up' && <ArrowUpRight size={14} strokeWidth={2} />}
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
                    <div className="bg-white dark:bg-slate-800 p-8 rounded border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                Key Metrics
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-100 dark:bg-slate-700 p-5 rounded border border-slate-200 dark:border-slate-600">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Events</p>
                                <p className="text-xl font-semibold mt-1 text-slate-900 dark:text-white">12</p>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-700 p-5 rounded border border-slate-200 dark:border-slate-600">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Bookings</p>
                                <p className="text-xl font-semibold mt-1 text-slate-900 dark:text-white">4,832</p>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-700 p-5 rounded border border-slate-200 dark:border-slate-600">
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Revenue (PHP)</p>
                                <p className="text-xl font-semibold mt-1 text-slate-900 dark:text-white">19,500</p>
                            </div>
                        </div>
                    </div>

                    {/* Venue Map */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded border border-slate-200 dark:border-slate-700">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <MapPin size={16} className="text-purple-700 dark:text-purple-400" /> Event Map
                        </h3>
                        <div className="h-[340px] bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 relative overflow-hidden">
                            <MapContainer center={[14.34, 120.94]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                />
                                {mockVenues.map((venue) => (
                                    <Marker key={venue.id} position={venue.coords}>
                                        <Popup className="rounded overflow-hidden border border-slate-200 dark:border-slate-600">
                                            <div className="font-sans min-w-[160px] p-2">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="p-1 bg-purple-50 dark:bg-purple-900/20 rounded text-purple-700 dark:text-purple-400">
                                                        <MapPin size={12} />
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{venue.type}</span>
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
                    <div className="bg-white dark:bg-slate-800 p-8 rounded border border-slate-200 dark:border-slate-700 h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Calendar size={16} className="text-purple-700 dark:text-purple-400" /> Upcoming Events
                            </h3>
                            <button className="text-sm font-medium text-purple-700 dark:text-purple-400 hover:text-purple-700 transition">View All</button>
                        </div>
                        
                        <div className="space-y-4">
                            {[
                                { title: 'Summer Tech Summit', date: 'JUN 20', time: '09:00 AM' },
                                { title: 'Beach Yoga Retreat', date: 'JUN 22', time: '06:30 AM' },
                                { title: 'Jazz Night Live', date: 'JUN 24', time: '08:00 PM' },
                                { title: 'Startup Pitch Deck', date: 'JUL 01', time: '02:00 PM' }
                            ].map((event, idx) => (
                                <div key={idx} className="flex bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-700 dark:border-purple-500 transition-all cursor-pointer group overflow-hidden relative">
                                    <div className="bg-purple-50 dark:bg-slate-600 w-20 flex flex-col items-center justify-center text-purple-700 dark:text-purple-300 py-3 relative">
                                        <span className="text-xs font-medium opacity-80">{event.date.split(' ')[0]}</span>
                                        <span className="text-lg font-semibold">{event.date.split(' ')[1]}</span>
                                    </div>
                                    
                                    <div className="flex-1 p-4 flex justify-between items-center bg-white dark:bg-slate-800 relative">
                                        <div className="absolute left-0 top-2 bottom-2 w-px border-l border-slate-200 dark:border-slate-700"></div>
                                        <div className="pl-3">
                                            <p className="font-medium text-slate-900 dark:text-white group-hover:text-purple-700 dark:text-purple-400 dark:group-hover:text-purple-400 transition-colors">{event.title}</p>
                                            <p className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-1">{event.time}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover:bg-purple-100 dark:group-hover:bg-slate-600 group-hover:text-purple-700 dark:text-purple-400 transition-colors">
                                            <ArrowRight size={14} />
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
