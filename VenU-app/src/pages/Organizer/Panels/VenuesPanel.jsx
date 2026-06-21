import React, { useState, useEffect } from 'react';
import { MapPin, Plus, ExternalLink, Navigation, Building, AlertCircle, Phone, Mail, User, ChevronLeft, ChevronRight, Shield, Layers, CheckCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import AddVenueForm from './AddVenueForm';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// ── Parse venueImages from JSON string or array ────────────────────
function parseImages(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}

// ── Image Carousel ─────────────────────────────────────────────────
function ImageCarousel({ images, fallback, alt, autoPlay = true, interval = 3000 }) {
  const [idx, setIdx] = useState(0);
  const all = images.length > 0 ? images : (fallback ? [fallback] : []);

  useEffect(() => {
    if (!autoPlay || all.length <= 1) return;
    const timer = setInterval(() => {
      setIdx(i => (i + 1) % all.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, all.length]);

  if (all.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700">
        <Building size={32} className="text-slate-400" />
      </div>
    );
  }
  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + all.length) % all.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % all.length); };
  return (
    <div className="relative w-full h-full group/carousel">
      <img src={all[idx]} alt={alt} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
      {all.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity">
            <ChevronLeft size={14} />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity">
            <ChevronRight size={14} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-30">
            {all.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white scale-125' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Capacity label helper ──────────────────────────────────────────
function formatCapacity(n) {
  if (!n || n === 0) return 'N/A';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M people`;
  if (n >= 100_000) return `${(n / 1_000).toFixed(0)}K people`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K people`;
  return `${n.toLocaleString()} people`;
}

// ── Recenter Map Hook ────────────────────────────────────────────────
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.setView(coords, 16, { animate: true });
    }
  }, [coords, map]);
  return null;
}

export default function VenuesPanel({ currentUser }) {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => { fetchVenues(); }, []);

  const fetchVenues = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) { setError('Not authenticated. Please log in again.'); return; }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/venues/with-events-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setVenues(data);
    } catch (err) {
      setError('Could not connect to server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Venues with valid lat/lng for map pins
  const mappableVenues = venues.filter(v => v.latitude && v.longitude);

  if (viewMode === 'add') {
    return (
      <div className="p-4 md:p-8 animate-fade-in">
        <AddVenueForm setViewMode={(mode) => {
          setViewMode(mode);
          if (mode === 'grid') fetchVenues();
        }} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 animate-fade-in relative min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Venues Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage physical spaces and coordinates for your event deployments.
          </p>
        </div>
        <button onClick={() => setViewMode('add')} className="bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-700 dark:hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 px-6 py-3 rounded font-bold transition-all flex items-center gap-2 active:scale-95">
          <Plus size={18} strokeWidth={3} /> Add New Venue
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      )}
      {/* Split View Container */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        
        {/* Left Column: Venues Grid (60%) */}
        <div className="w-full lg:w-[60%] order-2 lg:order-1">
          <div className="flex items-center gap-2 mb-6">
            <Building size={20} className="text-slate-800 dark:text-slate-200" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Saved Venues</h2>
            <span className="ml-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{venues.length}</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : venues.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center min-h-[300px] bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8">
              <Building size={40} className="text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No venues yet</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Venues you register during event creation will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {venues.map((venue) => {
                const images = parseImages(venue.venueImages);
                const address = [venue.streetAddress, venue.barangay, venue.city, venue.province].filter(Boolean).join(', ');
                return (
                  <div
                    key={venue.id}
                    onClick={() => setSelectedVenue(venue)}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    {/* Image */}
                    <div className="h-44 w-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-colors z-10" />
                      <ImageCarousel images={images} alt={venue.name} />
                      {/* Type badge */}
                      <div className="absolute top-3 left-3 z-20">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-800 dark:text-slate-200">
                          {venue.type}
                        </span>
                      </div>
                      {/* Active Events Badge */}
                      {venue.activeEventsCount > 0 && (
                        <div className="absolute top-3 right-3 z-20">
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-purple-600 text-white shadow-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            {venue.activeEventsCount} Active {venue.activeEventsCount === 1 ? 'Event' : 'Events'}
                          </span>
                        </div>
                      )}
                      {/* Image count */}
                      {images.length > 1 && (
                        <div className="absolute bottom-3 right-3 z-20">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/50 text-white backdrop-blur-md">
                            {images.length} photos
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-5 flex-grow flex flex-col">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors leading-tight mb-1">
                          {venue.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{address}</p>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded p-2.5">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Capacity</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCapacity(venue.maxCapacity)}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded p-2.5">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Times Used</p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{venue.organizersUsedCount || 0}</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {venue.latitude && venue.longitude ? (
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setSelectedVenue(venue); 
                            }}
                            className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                          >
                            <MapPin size={13} strokeWidth={2.5} /> View on Map
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">No coords</span>
                        )}
                        <span className="text-xs text-slate-400">
                          {venue.rating ? `${venue.rating.toFixed(1)} ★` : 'New'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Map (40%) */}
        <div className="w-full lg:w-[40%] order-1 lg:order-2">
          <div className="sticky top-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded overflow-hidden p-2 shadow-xl">
            <div className="relative">
              <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-lg">
                <Navigation size={14} className="text-purple-600" />
                <span className="text-[10px] font-semibold text-slate-900 dark:text-white">
                  {mappableVenues.length} Pinned
                </span>
              </div>
              <div className="h-[500px] w-full rounded overflow-hidden relative border border-slate-200 dark:border-slate-700">
                <MapContainer
                  center={mappableVenues.length > 0
                    ? [Number(mappableVenues[0].latitude), Number(mappableVenues[0].longitude)]
                    : [14.34, 120.94]}
                  zoom={11}
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  
                  {/* The RecenterMap helper component handles centering map to selected venue */}
                  {selectedVenue && selectedVenue.latitude && selectedVenue.longitude && (
                    <RecenterMap coords={[Number(selectedVenue.latitude), Number(selectedVenue.longitude)]} />
                  )}

                  {/* Marker Cluster Wrapper */}
                  <MarkerClusterGroup chunkedLoading>
                    {mappableVenues.map((venue) => {
                      const images = parseImages(venue.venueImages);
                      const firstImg = images[0] || null;
                      return (
                        <Marker key={venue.id} position={[Number(venue.latitude), Number(venue.longitude)]}>
                          <Popup className="rounded overflow-hidden border-0 p-0 m-0 w-[240px]">
                            <div className="font-sans">
                              <div className="h-24 w-full bg-slate-200 relative">
                                {firstImg ? (
                                  <img src={firstImg} className="w-full h-full object-cover" alt={venue.name} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                    <Building size={24} className="text-slate-400" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white px-2 py-1 bg-purple-600/80 rounded backdrop-blur-sm">
                                  {venue.type}
                                </span>
                              </div>
                              <div className="p-3">
                                <h4 className="font-semibold text-slate-900 leading-tight mb-1 text-sm">{venue.name}</h4>
                                <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
                                  <MapPin size={10} /> {venue.barangay}, {venue.city}
                                </p>
                                
                                {venue.activeEventsCount > 0 && (
                                  <div className="mb-2 border-l-2 border-purple-500 pl-2">
                                    <span className="text-[10px] font-bold text-purple-600 flex items-center gap-1">
                                      📅 {venue.activeEventsCount} Active Events
                                    </span>
                                  </div>
                                )}

                                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                                  <span className="text-[10px] font-semibold text-slate-500">
                                    Cap: <span className="text-slate-800">{formatCapacity(venue.maxCapacity)}</span>
                                  </span>
                                  {venue.mapUrl && (
                                    <a href={venue.mapUrl} target="_blank" rel="noopener noreferrer"
                                      className="text-[10px] text-purple-600 font-bold flex items-center gap-0.5 hover:underline">
                                      Maps <ExternalLink size={9} />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MarkerClusterGroup>
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedVenue && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            {/* Modal image */}
            <div className="h-52 relative">
              {(() => {
                const imgs = parseImages(selectedVenue.venueImages);
                return <ImageCarousel images={imgs} alt={selectedVenue.name} />;
              })()}
              <button
                onClick={() => setSelectedVenue(null)}
                className="absolute top-3 right-3 z-30 bg-black/40 hover:bg-black/70 text-white p-1.5 rounded-full"
              >
                ✕
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="absolute bottom-4 left-4 z-20">
                <span className="text-[10px] font-bold text-white bg-purple-600 px-2.5 py-1 rounded-full">{selectedVenue.type}</span>
                {selectedVenue.isVerified && <span className="ml-2 text-[10px] font-bold text-white bg-emerald-500 px-2.5 py-1 rounded-full">✓ Verified</span>}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedVenue.name}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {[selectedVenue.streetAddress, selectedVenue.barangay, selectedVenue.city, selectedVenue.province].filter(Boolean).join(', ')}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Capacity</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{formatCapacity(selectedVenue.maxCapacity)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Times Used</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{selectedVenue.organizersUsedCount || 0}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rating</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
                    <span className="text-amber-500 text-sm">★</span> {selectedVenue.rating ? selectedVenue.rating.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sqft</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{selectedVenue.squareFootage > 0 ? selectedVenue.squareFootage.toLocaleString() : '—'}</p>
                </div>
              </div>

              {(selectedVenue.contactPerson || selectedVenue.contactNumber || selectedVenue.contactEmail) && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">Contact Details</p>
                  {selectedVenue.contactPerson && (
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <User size={14} className="text-purple-500" /> <span className="font-medium">{selectedVenue.contactPerson}</span>
                    </div>
                  )}
                  {selectedVenue.contactNumber && (
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Phone size={14} className="text-purple-500" /> <span className="font-medium">{selectedVenue.contactNumber}</span>
                    </div>
                  )}
                  {selectedVenue.contactEmail && (
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Mail size={14} className="text-purple-500" />
                      <a href={`mailto:${selectedVenue.contactEmail}`} className="font-medium text-purple-600 hover:underline">{selectedVenue.contactEmail}</a>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {selectedVenue.mapUrl && (
                  <a
                    href={selectedVenue.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors"
                  >
                    <MapPin size={16} /> Open in Maps
                  </a>
                )}
                <button
                  onClick={() => setSelectedVenue(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}