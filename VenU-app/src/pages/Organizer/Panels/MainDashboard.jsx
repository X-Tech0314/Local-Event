import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, MapPin, Sparkles, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

// Helper component to adjust map bounds automatically
const MapBounds = ({ markers }) => {
    const map = useMap();
    useEffect(() => {
        if (markers && markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => m.coords));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [markers, map]);
    return null;
};

export default function MainDashboard({ currentUser, setActivePanel }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data);
                }
            } catch (error) {
                console.error("Failed to fetch events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Prepare map markers
    const mapMarkers = events
        .filter(e => e.latitude && e.longitude)
        .map(e => ({
            id: e.id,
            title: e.title,
            type: e.venueType || 'Venue',
            location: e.venueName || e.streetAddress || 'Location',
            coords: [e.latitude, e.longitude]
        }));

    // Prepare upcoming events
    const upcomingEvents = events
        .filter(e => new Date(e.startDateTime) > new Date())
        .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))
        .slice(0, 4)
        .map(e => {
            const d = new Date(e.startDateTime);
            const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
            const day = d.getDate().toString().padStart(2, '0');
            return {
                id: e.id,
                title: e.title,
                date: `${month} ${day}`,
                time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            };
        });

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

            {/* ── Main Layout Grid (Map + Upcoming Events) ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Event Map (7 columns) */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded border border-slate-200 dark:border-slate-700">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <MapPin size={16} className="text-purple-700 dark:text-purple-400" /> Event Map
                        </h3>
                        <div className="h-[340px] bg-slate-100 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 relative overflow-hidden z-0">
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-800/80 z-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
                                </div>
                            )}
                            <MapContainer center={[14.34, 120.94]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                                <MapBounds markers={mapMarkers} />
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                />
                                {mapMarkers.map((venue) => (
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

                {/* RIGHT COLUMN: Upcoming Events (5 columns) */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded border border-slate-200 dark:border-slate-700 h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <Calendar size={16} className="text-purple-700 dark:text-purple-400" /> Upcoming Events
                            </h3>
                            <button className="text-sm font-medium text-purple-700 dark:text-purple-400 hover:text-purple-700 transition">View All</button>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex justify-center items-center py-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                </div>
                            ) : upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event, idx) => (
                                    <div key={idx} onClick={() => setActivePanel('events')} className="flex bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-700 dark:border-purple-500 transition-all cursor-pointer group overflow-hidden relative">
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
                                ))
                            ) : (
                                <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800/50">
                                    <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No upcoming events</p>
                                    <p className="text-xs text-slate-500 mt-1">Create an event to see it here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}