import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Plus, Search, Filter, MapPin, Clock, ArrowRight, AlertCircle, Lock, Edit2, Trash2, ChevronDown, Ticket, BarChart3 } from 'lucide-react';
import EventAnalyticsHub from './EventAnalyticsHub';

// ── Status config ────────────────────────────────────────────────
const STATUS_CONFIG = {
  Published: { label: 'Published', dot: 'bg-emerald-500 animate-pulse', badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  Done: { label: 'Done', dot: 'bg-slate-400', badge: 'bg-slate-100 dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600' },
  Full: { label: 'Full', dot: 'bg-amber-500', badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  Discontinued: { label: 'Discontinued', dot: 'bg-red-500', badge: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30' },
  Rescheduled: { label: 'Rescheduled', dot: 'bg-blue-500', badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
};

// ── Individual Event Card (hooks are valid here) ──────────────────
function EventCard({ evt, setEditEvent, setActivePanel, onDeleteClick, onViewAnalytics }) {
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

  const venueDisplay = evt.venueName || 'Custom Venue';
  const microLocation = [evt.floorLevel, evt.wingSection, evt.boothNumber, evt.proximityAnchor].filter(Boolean).join(', ');
  const fullAddress = [evt.streetAddress, evt.barangay, evt.city].filter(v => v && v !== 'N/A').join(', ');

  return (
    <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-800 hover:-translate-y-1 transition-all duration-300 group flex flex-col relative">

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
            onClick={() => setOpenMenu(o => !o)}
            className="h-8 px-2.5 rounded-full bg-black/30 backdrop-blur-md flex items-center gap-1 text-white text-[10px] font-bold hover:bg-black/50 transition"
          >
            <ChevronDown size={12} /> Status
          </button>
          {openMenu && (
            <div className="absolute top-10 right-0 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => handleStatusChange(key)}
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
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight mb-4 group-hover:text-slate-800 dark:text-slate-200 dark:group-hover:text-slate-500 transition-colors">{evt.title}</h3>

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
                <a href={evt.mapUrl} target="_blank" rel="noopener noreferrer"
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

        {/* App Ticketing Window */}
        {evt.ticketSalesStart && evt.ticketSalesEnd && (
          <div className="mt-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-700/5 dark:bg-slate-300/5 border border-purple-500/10 px-2.5 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <span>App Ticketing: {new Date(evt.ticketSalesStart).toLocaleDateString([], { month: 'short', day: 'numeric' })} to {new Date(evt.ticketSalesEnd).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center mt-auto">
          <p className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500">ID: {String(evt.id).substring(0, 8)}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewAnalytics(evt.id)}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
            >
              <BarChart3 size={13} strokeWidth={2.5} /> Analytics
            </button>
            <button
              onClick={() => onDeleteClick(evt)}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
            >
              <Trash2 size={13} strokeWidth={2.5} /> Delete
            </button>

            <button
              onClick={() => { setEditEvent(evt); setActivePanel('create-event'); }}
              className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 group-hover:gap-2 transition-all hover:text-purple-700 dark:hover:text-purple-400"
            >
              Manage <ArrowRight size={16} strokeWidth={3} />
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

  useEffect(() => {
    fetchEvents();
  }, []);

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

  if (analyticsEventId) {
    return <EventAnalyticsHub eventId={analyticsEventId} onBack={() => setAnalyticsEventId(null)} />;
  }

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

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" size={18} />
          <input type="text" placeholder="Search event titles or venues..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded pl-12 pr-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-700 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95">
            <Filter size={16} /> Filters
          </button>
          <div className="hidden md:flex border border-slate-200 dark:border-slate-700 rounded p-1 bg-slate-50 dark:bg-slate-800">
            <button className="px-4 py-2 bg-white dark:bg-slate-700 rounded-lg text-sm font-bold text-slate-800 dark:text-white">Grid</button>
            <button className="px-4 py-2 rounded-lg text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition">List</button>
          </div>
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
      ) : events.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard key={evt.id} evt={evt} setEditEvent={setEditEvent} setActivePanel={setActivePanel} onDeleteClick={setEventToDelete} onViewAnalytics={setAnalyticsEventId} />
          ))}
        </div>
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
    </div>
  );
}