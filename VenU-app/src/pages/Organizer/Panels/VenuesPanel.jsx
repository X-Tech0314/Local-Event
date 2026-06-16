import React from 'react';
import { MapPin, Plus, ExternalLink, Navigation, Building } from 'lucide-react';
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
    { id: 1, title: 'Grand Plaza Hall', capacity: '500 People', location: 'Downtown Hub', type: 'Indoor', coords: [14.33, 120.94], img: 'https://images.unsplash.com/photo-1519167758481-83f5c1d6834b?w=800&q=80' },
    { id: 2, title: 'Sunset Open Amphitheater', capacity: '1,200 People', location: 'Coastal Ridge', type: 'Outdoor', coords: [14.34, 120.93], img: 'https://images.unsplash.com/photo-1540039155732-d6928222aeb9?w=800&q=80' },
    { id: 3, title: 'The Metro Tech Lab', capacity: '150 People', location: 'Silicon District', type: 'Hybrid', coords: [14.35, 120.95], img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' }
];

export default function VenuesPanel({ currentUser }) {
    return (
        <div className="animate-fade-in space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Venues Directory</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage physical spaces and coordinates for your deployments.</p>
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95">
                    <Plus size={18} strokeWidth={3} /> Add New Venue
                </button>
            </div>

            {/* Map Section */}
            <div className="relative">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden relative z-10 p-2">
                    <div className="absolute top-6 left-6 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                        <Navigation size={16} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Global Coverage</span>
                    </div>
                    
                    <div className="h-[450px] w-full rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-700">
                        <MapContainer center={[14.34, 120.94]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                            {mockVenues.map((venue) => (
                                <Marker key={venue.id} position={venue.coords}>
                                    <Popup className="rounded-2xl overflow-hidden shadow-2xl border-0 p-0 m-0 w-[240px]">
                                        <div className="font-sans">
                                            <div className="h-24 w-full bg-slate-200 relative">
                                                <img src={venue.img} className="w-full h-full object-cover" alt="Venue" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                                <span className="absolute bottom-2 left-2 text-[10px] font-black uppercase tracking-widest text-white px-2 py-1 bg-[#A855F7]/80 rounded-md backdrop-blur-sm">
                                                    {venue.type}
                                                </span>
                                            </div>
                                            <div className="p-3">
                                                <h4 className="font-black text-slate-900 leading-tight mb-1 text-sm">{venue.title}</h4>
                                                <p className="text-[11px] font-medium text-slate-500 mb-2 flex items-center gap-1"><MapPin size={10} /> {venue.location}</p>
                                                <div className="pt-2 border-t border-slate-100">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacity: <span className="text-slate-800">{venue.capacity}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </div>

            {/* Saved Venues Grid */}
            <div>
                <div className="flex items-center gap-2 mb-6 mt-4">
                    <Building size={20} className="text-purple-600 dark:text-purple-400" />
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Saved Coordinates</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockVenues.map((venue) => (
                        <div key={venue.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden flex flex-col group hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                            
                            <div className="h-40 w-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors z-10"></div>
                                <img src={venue.img} alt={venue.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute top-4 left-4 z-20">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-purple-600 dark:text-purple-400 shadow-sm">
                                        {venue.type}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-grow flex flex-col justify-between relative bg-white dark:bg-slate-900">
                                <div className="absolute -top-8 right-6 z-20">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-colors text-slate-500 dark:text-slate-400">
                                        <MapPin size={20} strokeWidth={2.5} />
                                    </div>
                                </div>
                                
                                <div className="mb-6">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-tight mb-2 pr-12">{venue.title}</h3>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{venue.location}</p>
                                </div>
                                
                                <div className="pt-5 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-semibold">
                                    <div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">Capacity Limit</p>
                                        <p className="text-slate-900 dark:text-white font-black">{venue.capacity}</p>
                                    </div>
                                    <button className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-bold px-4 py-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl transition-colors">
                                        Manage <ExternalLink size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}