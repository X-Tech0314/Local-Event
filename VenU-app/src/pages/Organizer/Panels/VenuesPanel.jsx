import React from 'react';
import { MapPin, Plus, ExternalLink } from 'lucide-react';
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

export default function VenuesPanel({ currentUser }) {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Organizer Dashboard</p>
                    <h1 className="text-3xl font-bold tracking-tight mt-1 text-slate-900">Venues & Locations</h1>
                </div>
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-purple-500/25 active:scale-95">
                    <Plus size={16} /> Add New Venue
                </button>
            </div>

            {/* Map Section */}
            <div className="bg-white border border-slate-100 shadow-sm rounded-3xl overflow-hidden relative z-0 p-2">
                <div className="h-[400px] w-full rounded-2xl overflow-hidden relative">
                    <MapContainer center={[14.34, 120.94]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                        <TileLayer
                            attribution='&amp;copy; &lt;a href="https://www.openstreetmap.org/copyright"&gt;OSM&lt;/a&gt; &amp;copy; &lt;a href="https://carto.com/attributions"&gt;CARTO&lt;/a&gt;'
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
                                        <p className="text-xs font-semibold text-slate-700 mt-2 border-t border-slate-100 pt-2">
                                            Capacity: {venue.capacity}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4">Saved Venues</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockVenues.map((venue) => (
                        <div key={venue.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col justify-between group hover:border-purple-200 hover:shadow-md transition">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-[#a855f7] group-hover:scale-110 transition-transform shadow-sm">
                                        <MapPin size={20} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-50 text-[#a855f7]">
                                        {venue.type}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-800 group-hover:text-[#a855f7] transition mb-1">{venue.title}</h3>
                                <p className="text-sm font-medium text-slate-500 mb-4">{venue.location}</p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-semibold">
                                <span>Capacity: <strong className="text-slate-900">{venue.capacity}</strong></span>
                                <span className="flex items-center gap-1 hover:text-[#a855f7] cursor-pointer transition">Manage <ExternalLink size={12} /></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}