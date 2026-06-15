import React from 'react';
import { Calendar, Users, Ticket, ArrowUpRight, ArrowRight, MapPin } from 'lucide-react';
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

// ── Platform Summary Stat Cards ──────────────────────────────────────────────
const statCards = [
    {
        icon: Calendar,
        label: 'Total Active Events',
        value: '12',
        sub: '+3 this week',
        trend: 'up',
    },
    {
        icon: Users,
        label: 'Platform Enrollments',
        value: '5,240',
        sub: '4,832 Attendees · 408 Organizers',
        trend: 'up',
    },
    {
        icon: Ticket,
        label: 'Ticket Transactions',
        value: '₱ 219,500',
        sub: '+18.7% vs last month',
        trend: 'up',
    },
];

export default function MainDashboard({ currentUser }) {
    return (
        <>
            {/* ── Page Header ──────────────────────────────────────────────── */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Welcome Back</p>
                    <h1 className="text-3xl font-bold tracking-tight mt-1 text-slate-900">
                        Hey, <span className="text-[#a855f7]">{currentUser?.firstName || 'Alex'}</span> 👋
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Here's what's happening across your platform today.</p>
                </div>
            </div>

            {/* ── Platform Summary Stats Row ────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {statCards.map(({ icon: Icon, label, value, sub, trend }) => (
                    <div
                        key={label}
                        className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 flex items-start justify-between group hover:border-purple-200/60 hover:shadow-md transition-all duration-300"
                    >
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
                            <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
                            <p className={`text-xs mt-2 flex items-center gap-0.5 font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {trend === 'up' && <ArrowUpRight size={12} />}
                                {sub}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-[#a855f7] group-hover:scale-110 transition-transform duration-300">
                            <Icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Blueprint Layout Grid ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT 2 COLUMNS */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Event Performance */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-semibold tracking-wide text-slate-400 uppercase mb-4">Event Performance</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Events</p>
                                <p className="text-3xl font-bold mt-2 text-[#a855f7]">12</p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Bookings</p>
                                <p className="text-3xl font-bold mt-2 text-slate-900">4,832</p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</p>
                                <p className="text-3xl font-bold mt-2 text-slate-900">₱19,500</p>
                            </div>
                        </div>
                    </div>

                    {/* Venue Map */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-semibold tracking-wide text-slate-400 uppercase mb-4">Venue Map</h3>
                        <div className="h-72 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden p-1.5">
                            <MapContainer center={[14.34, 120.94]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 10, borderRadius: '0.75rem' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                />
                                {mockVenues.map((venue) => (
                                    <Marker key={venue.id} position={venue.coords}>
                                        <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
                                            <div className="font-sans min-w-[160px] p-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                                                        <MapPin size={14} />
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">{venue.type}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-900 leading-tight mb-1">{venue.title}</h4>
                                                <p className="text-xs text-slate-500">{venue.location}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                    {/* Upcoming Events */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-semibold tracking-wide text-slate-400 uppercase mb-4">Upcoming Events</h3>
                        <div className="space-y-3">
                            {['Summer Tech Summit', 'Beach Yoga Retreat', 'Jazz Night Live'].map((event, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition cursor-pointer group">
                                    <div>
                                        <p className="font-semibold text-sm text-slate-800 group-hover:text-[#a855f7] transition">{event}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">June {20 + idx * 2}, 2026</p>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-400 group-hover:text-[#a855f7] transition" />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
