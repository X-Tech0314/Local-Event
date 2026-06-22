import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Edit, Copy, ChevronDown, CheckCircle, Clock, Ban, Lock, MapPin, Calendar, Ticket, Tag, ArrowRight, Star, Settings, Plus, Search, Filter, BarChart3, AlertCircle, Navigation, Building, ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import EventAnalyticsHub from './EventAnalyticsHub';
import EventManagementModal from './EventManagementModal';
import LocationEventFilter from '../../../components/LocationEventFilter';

// ── Status config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  Published: { label: 'Published', dot: 'bg-emerald-500 animate-pulse', badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  Pending: { label: 'Pending Verify', dot: 'bg-amber-500 animate-pulse', badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  Done: { label: 'Done', dot: 'bg-slate-400', badge: 'bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600' },
  Full: { label: 'Full', dot: 'bg-amber-500', badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  Discontinued: { label: 'Discontinued', dot: 'bg-red-500', badge: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' },
  Rescheduled: { label: 'Rescheduled', dot: 'bg-blue-500', badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
};

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 1.5 });
  }, [center, map]);
  return null;
}

// ── Individual Event Card (hooks are valid here) ──────────────────
export function EventCard({ evt, setEditEvent, setActivePanel, onDeleteClick, onViewAnalytics, onManage, onSelect }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(
    evt.status || (new Date(evt.startDateTime) > new Date() ? 'Published' : 'Done')
  );
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sConf = STATUS_CONFIG[currentStatus] || STATUS_CONFIG['Published'];

  const handleStatusChange = async (newStatus) => {
    setCurrentStatus(newStatus);
    setOpenMenu(false);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_URL}/api/events/${evt.id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn('Status update failed, reflected locally only:', err);
    }
  };

  const startDate = new Date(evt.startDateTime);
  const endDate = evt.endDateTime ? new Date(evt.endDateTime) : null;
  const startStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endStr = endDate ? endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const isMultiDay = endDate && startDate.toDateString() !== endDate.toDateString();
  const timeDisplay = isMultiDay
    ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${startStr} – ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${endStr}`
    : endStr ? `${startStr} – ${endStr}` : startStr;

  const isEnded = endDate && endDate < new Date();

  const venueDisplay = evt.venueName || 'Custom Venue';
  const microLocation = [evt.floorLevel, evt.wingSection, evt.boothNumber, evt.proximityAnchor].filter(Boolean).join(', ');
  const fullAddress = [evt.streetAddress, evt.barangay, evt.city].filter(v => v && v !== 'N/A').join(', ');

  return (
    <div onClick={(e) => onSelect && onSelect(evt)} className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-800 hover:-translate-y-1 transition-all duration-300 group flex flex-col relative cursor-pointer">

      {/* Event Thumbnail */}
      <div className="h-48 relative bg-slate-100 dark:bg-slate-800">
        {/* Image clipped separately */}
        <div className="absolute inset-0 overflow-hidden rounded-t">
          <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10" />
          {evt.bannerUrl ? (
            <img src={evt.bannerUrl} alt={evt.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><Calendar size={48} /></div>
          )}
        </div>

        {/* Status Badge — outside image clip so it renders on top */}
        <div className="absolute top-4 left-4 z-30 flex gap-2">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border backdrop-blur-sm ${sConf.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sConf.dot}`} />
            {sConf.label}
          </span>
          {evt.accessType === 'Private' && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold border backdrop-blur-md bg-red-500/10 text-red-500 border-red-500/20">
              <Lock size={10} /> Private
            </span>
          )}
        </div>

        {/* Status Dropdown — outside image clip so menu isn't cropped */}
        <div className="absolute top-4 right-4 z-30" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setOpenMenu(o => !o); }}
            className="h-8 px-2.5 rounded-full bg-black/30 backdrop-blur-md flex items-center gap-1 text-white text-[10px] font-bold hover:bg-black/50 transition"
          >
            <ChevronDown size={12} /> Status
          </button>
          {openMenu && (
            <div className="absolute top-10 right-0 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={(e) => { e.stopPropagation(); handleStatusChange(key); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center gap-2 transition-colors ${currentStatus === key
                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dot.replace(' animate-pulse', '')}`} />
                  {cfg.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Details */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-2">
          <span className="text-[10px] font-bold tracking-wider text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md">{evt.category}</span>
          {evt.accessType === 'Private' && evt.verificationCode && (
            <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Code: {evt.verificationCode}</span>
          )}
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-slate-800 dark:text-slate-200 dark:group-hover:text-slate-500 transition-colors">{evt.title}</h3>
        {evt.description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
            {evt.description}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
              <Calendar size={14} strokeWidth={2.5} />
            </div>
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
              <Clock size={14} strokeWidth={2.5} />
            </div>
            <span className="text-xs leading-normal">{timeDisplay}</span>
          </div>
          <div className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0 mt-0.5">
              <MapPin size={14} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-bold text-slate-800 dark:text-slate-200">{venueDisplay}</span>
              <span className="text-xs text-slate-500 line-clamp-1">{fullAddress}</span>
              {microLocation && <span className="text-[10px] text-slate-800 dark:text-slate-200 font-semibold mt-0.5">{microLocation}</span>}
              {evt.mapUrl && (
                <a href={evt.mapUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="text-[10px] text-slate-800 dark:text-slate-200 hover:text-slate-700 font-bold underline mt-1 flex items-center gap-1 w-max">
                  🗺️ View Map Location
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Logistics Notes */}
        {evt.logisticsNotes && (
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400 italic">
            <strong>Notes:</strong> {evt.logisticsNotes}
          </div>
        )}

        {/* Ticket Tiers */}
        {evt.ticketTiers && evt.ticketTiers.length > 0 ? (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">Ticket Options</span>
              <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold">Cap: {evt.maxCapacity}</span>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto pr-1">
              {evt.ticketTiers.map((tier, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 p-2.5 rounded flex items-center justify-between text-xs">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{tier.tierName}</span>
                    <span className="text-[9px] text-slate-500 mt-0.5">App: {tier.onlineSlots} | Door: {tier.f2fSlots}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {tier.price === 0 ? 'FREE' : `₱${tier.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    </span>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">{tier.validityScope}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
              <Ticket size={10} /> Free / Walk-in Entry
            </span>
          </div>
        )}

        {/* App Ticketing Window or Date Ended Badge */}
        {isEnded ? (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex flex-col gap-2">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full w-max border border-red-500/20">
              <Ban size={10} /> Date Ended
            </div>
            {(evt.totalReviews !== undefined && evt.totalReviews > 0) && (
              <div className="flex items-center gap-1.5 mt-1">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {Number(evt.averageRating).toFixed(1)} / 5.0
                </span>
                <span className="text-[9px] text-slate-500 font-semibold">({evt.totalReviews} reviews)</span>
              </div>
            )}
            {(evt.totalReviews !== undefined && evt.totalReviews === 0) && (
              <div className="flex items-center gap-1.5 mt-1">
                <Star size={12} className="text-slate-400" />
                <span className="text-[9px] text-slate-500 font-semibold">No reviews yet</span>
              </div>
            )}
          </div>
        ) : evt.ticketSalesStart && evt.ticketSalesEnd ? (
          <div className="mt-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-700/5 dark:bg-slate-300/5 border border-purple-500/10 px-2.5 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span>App Ticketing: {new Date(evt.ticketSalesStart).toLocaleDateString([], { month: 'short', day: 'numeric' })} to {new Date(evt.ticketSalesEnd).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center mt-auto">
          <p className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500">ID: {String(evt.id).substring(0, 8)}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); onViewAnalytics(evt.id); }}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
            >
              <BarChart3 size={13} strokeWidth={2.5} /> Analytics
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteClick(evt); }}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              <Trash2 size={13} strokeWidth={2.5} /> Delete
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onManage(evt); }}
              className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 group-hover:gap-2 transition-all hover:text-purple-700 dark:hover:text-purple-400"
            >
              Manage <Settings size={14} className="ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Events Panel ─────────────────────────────────────────────
export default function EventsPanel({ currentUser, setActivePanel, setEditEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [analyticsEventId, setAnalyticsEventId] = useState(null);
  const [managementEventId, setManagementEventId] = useState(null);
  const [geocodedEvents, setGeocodedEvents] = useState([]);
  const [mapCenter, setMapCenter] = useState([14.34, 120.94]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ region: '', province: '', city: '', category: '', status: '' });

  // ── Derived: count active filters ──
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // ── Derived: filtered event list ──
  const filteredEvents = events.filter((evt) => {
    const q = searchQuery.toLowerCase();
    if (q && !evt.title?.toLowerCase().includes(q) && !evt.venueName?.toLowerCase().includes(q) && !evt.city?.toLowerCase().includes(q)) return false;
    if (filters.category && evt.category !== filters.category) return false;
    if (filters.status && (evt.status || '').toLowerCase() !== filters.status.toLowerCase()) return false;
    if (filters.cityName) {
      // Use the name for matching
      const evtCity = (evt.city || '').toLowerCase();
      const filterCity = filters.cityName.toLowerCase();
      if (!evtCity.includes(filterCity) && evtCity !== filterCity) return false;
    } else if (filters.provinceName) {
      const evtProv = (evt.province || '').toLowerCase();
      const filterProv = filters.provinceName.toLowerCase();
      if (!evtProv.includes(filterProv) && evtProv !== filterProv) return false;
    } else if (filters.regionName) {
      const evtReg = (evt.region || '').toLowerCase();
      const filterReg = filters.regionName.toLowerCase();
      if (!evtReg.includes(filterReg) && evtReg !== filterReg) return false;
    }
    return true;
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (filteredEvents.length === 0) {
      setGeocodedEvents([]);
      return;
    }
    const geocode = async () => {
      const coded = [];
      for (const evt of filteredEvents) {
        // 1. Use exact coordinates from the database if provided
        if (evt.latitude && evt.longitude && evt.latitude !== 0 && evt.longitude !== 0) {
          coded.push({ ...evt, lat: evt.latitude, lon: evt.longitude });
          continue;
        }

        // 2. Fallback to OpenStreetMap text search if no coords exist
        const addressQuery = [evt.streetAddress, evt.barangay, evt.city].filter(v => v && v !== 'N/A').join(', ');
        if (!addressQuery) continue;

        const cacheKey = `geo_${addressQuery}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          coded.push({ ...evt, ...JSON.parse(cached) });
          continue;
        }

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}`);
          const data = await res.json();
          if (data && data.length > 0) {
            const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            sessionStorage.setItem(cacheKey, JSON.stringify(coords));
            coded.push({ ...evt, ...coords });
          }
          await new Promise(r => setTimeout(r, 600)); // be nice to nominatim
        } catch (e) {
          console.warn('Geocoding failed for', addressQuery);
        }
      }
      setGeocodedEvents(coded);
      if (coded.length > 0) {
        setMapCenter([coded[0].lat, coded[0].lon]);
      }
    };
    geocode();
  }, [filteredEvents]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) { setError('Not authenticated. Please log in again.'); return; }
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
          { id: 'mock-evt-1', title: 'Tech Meetup 2026', category: 'Technology', startDateTime: new Date(Date.now() + 86400000).toISOString(), endDateTime: new Date(Date.now() + 86400000 * 2).toISOString(), barangay: 'Brgy. San Lorenzo', city: 'Makati', bannerUrl: '', ticketTiers: [], status: 'Published' },
          { id: 'mock-evt-2', title: 'Local Art Exhibit', category: 'Arts', startDateTime: new Date(Date.now() - 86400000).toISOString(), endDateTime: new Date(Date.now()).toISOString(), barangay: 'Brgy. South Triangle', city: 'Quezon City', bannerUrl: '', ticketTiers: [], status: 'Done' }
        ]);
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${eventToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete event');
      setEvents(events.filter(e => e.id !== eventToDelete.id));
      setEventToDelete(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Events Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage and track your published and drafted events.</p>
        </div>
        <button onClick={() => setActivePanel('create-event')} className="bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-700 dark:hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 px-6 py-3 rounded font-bold transition-all flex items-center gap-2 active:scale-95">
          <Plus size={18} strokeWidth={3} /> Create New Event
        </button>
      </div>

      {/* Map Section */}
      {!loading && filteredEvents.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded overflow-hidden p-2">
          <div className="relative">
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-lg">
              <Navigation size={16} className="text-purple-600" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {geocodedEvents.length} Mapped Event{geocodedEvents.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="h-[350px] w-full rounded overflow-hidden relative border border-slate-200 dark:border-slate-700 z-0">
              <MapContainer
                center={mapCenter}
                zoom={14}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <MapUpdater center={mapCenter} />
                <MarkerClusterGroup chunkedLoading>
                  {geocodedEvents.map((evt) => (
                    <Marker key={evt.id} position={[evt.lat, evt.lon]}>
                      <Popup className="rounded overflow-hidden border-0 p-0 m-0 w-[240px]">
                        <div className="font-sans">
                          <div className="h-24 w-full bg-slate-200 relative">
                            {evt.bannerUrl ? (
                              <img src={evt.bannerUrl} className="w-full h-full object-cover" alt={evt.title} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                <Calendar size={24} className="text-slate-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white px-2 py-1 bg-purple-600/80 rounded backdrop-blur-sm">
                              {evt.category}
                            </span>
                          </div>
                          <div className="p-3 bg-white dark:bg-slate-900">
                            <h4 className="font-semibold text-slate-900 dark:text-white leading-tight mb-1 text-sm">{evt.title}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                              <MapPin size={10} className="text-purple-500" /> {[evt.barangay, evt.city].filter(Boolean).join(', ')}
                            </p>
                            
                            <div className="mb-2 border-l-2 border-purple-500 pl-2">
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                📅 {new Date(evt.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-auto">
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                Cap: <span className="text-slate-800 dark:text-white">{evt.maxCapacity || 'N/A'}</span>
                              </span>
                              <button onClick={() => setSelectedEvent(evt)} className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5 hover:underline bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">
                                Details <ExternalLink size={9} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event titles or venues..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded pl-12 pr-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-700 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <LocationEventFilter
            mode="events"
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters({ region: '', province: '', city: '', category: '', status: '' })}
            activeCount={activeFilterCount}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-700 dark:border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
          <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
        </div>
      ) : filteredEvents.length === 0 && events.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center min-h-[400px] bg-slate-50/50 dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 p-8">
          <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700 transform rotate-3 hover:rotate-6 transition-transform">
            <Calendar className="text-slate-600 dark:text-slate-400" size={32} />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">It's quiet in here...</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 font-medium">You haven't launched any events yet. Tap the button below to start building your first unforgettable experience.</p>
          <button onClick={() => setActivePanel('create-event')} className="bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-700 dark:hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 px-8 py-3.5 rounded font-bold transition-all flex items-center gap-2 hover:-translate-y-1 active:scale-95">
            <Plus size={18} strokeWidth={3} /> Create Event
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center min-h-[300px] bg-slate-50/50 dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 p-8">
          <Filter className="text-slate-400 mb-3" size={32} />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No events match your filters</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Try adjusting or clearing your filters.</p>
          <button
            onClick={() => { setFilters({ region: '', province: '', city: '', category: '', status: '' }); setSearchQuery(''); }}
            className="text-sm font-bold text-purple-600 hover:text-purple-800 underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <EventCard
              key={evt.id}
              evt={evt}
              setEditEvent={setEditEvent}
              setActivePanel={setActivePanel}
              onDeleteClick={setEventToDelete}
              onViewAnalytics={setAnalyticsEventId}
              onManage={(e) => setManagementEventId(e.id)}
              onSelect={(evt) => {
                setSelectedEvent(evt);
                const geo = geocodedEvents.find(g => g.id === evt.id);
                if (geo) setMapCenter([geo.lat, geo.lon]);
              }}
            />
          ))}
        </div>
      )}

      {/* Event Analytics Modal */}
      {analyticsEventId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900">
          <EventAnalyticsHub eventId={analyticsEventId} onBack={() => setAnalyticsEventId(null)} />
        </div>
      )}

      {/* Event Management & Feedback Modal */}
      {managementEventId && (
        <EventManagementModal
          eventId={managementEventId}
          onClose={() => setManagementEventId(null)}
          onEdit={() => {
            const ev = events.find(e => e.id === managementEventId);
            if (ev) {
              setManagementEventId(null);
              setEditEvent(ev);
              setActivePanel('create-event');
            }
          }}
        />
      )}

      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform scale-100 animate-slide-up relative">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-full">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Event</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Are you sure you want to delete <strong>{eventToDelete.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEventToDelete(null)} className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteEvent} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors">
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="h-52 relative">
              {selectedEvent.bannerUrl ? (
                <img src={selectedEvent.bannerUrl} alt={selectedEvent.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <Calendar size={48} className="text-slate-300 dark:text-slate-600" />
                </div>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-3 right-3 z-30 bg-black/40 hover:bg-black/70 text-white p-1.5 rounded-full"
              >
                ✕
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="absolute bottom-4 left-4 z-20">
                <span className="text-[10px] font-bold text-white bg-purple-600 px-2.5 py-1 rounded-full">{selectedEvent.category}</span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedEvent.title}</h2>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin size={14} className="text-purple-500" />
                  {[selectedEvent.streetAddress, selectedEvent.barangay, selectedEvent.city].filter(Boolean).join(', ')}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Capacity</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{selectedEvent.maxCapacity || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-1">{selectedEvent.status || 'Published'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Access</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-1">{selectedEvent.accessType || 'Public'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rating</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
                    <span className="text-amber-500 text-sm">★</span> {selectedEvent.averageRating ? Number(selectedEvent.averageRating).toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>

              {selectedEvent.accessType === 'Private' && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 flex flex-col items-center justify-center border border-purple-200 dark:border-purple-800/50">
                  <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Private Access Code</p>
                  <p className="text-2xl font-mono font-black text-slate-900 dark:text-white tracking-[0.2em]">{selectedEvent.verificationCode || 'NOT SET'}</p>
                </div>
              )}

              {selectedEvent.logisticsNotes && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Logistics Notes</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{selectedEvent.logisticsNotes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {selectedEvent.mapUrl && (
                  <a
                    href={selectedEvent.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-colors"
                  >
                    <MapPin size={16} /> Open in Maps
                  </a>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
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