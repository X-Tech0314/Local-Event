import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, MapPin, Ticket, Settings, Search, Lock,
  Tag, CheckCircle2, X, ChevronRight, Calendar, Clock,
  CreditCard, Smartphone, Star, User, Bell, LogOut, QrCode, Shield, ArrowRight, Music, Moon, Sun, Download, Trash2, Eye,
  Trophy, Briefcase, Gift, Heart, MoreHorizontal
} from 'lucide-react';
import logo from "../../assets/venu-logo3-transparent.png";
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';

import UserSettings from './Panels/UserSettings';

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

// ── Static Mock Data ──────────────────────────────────────────────────────────
const mockEvents = [
  {
    id: 1,
    title: "Exclusive Recognition Gala",
    category: "Private Gatherings",
    barangay: "Dasmariñas, Cavite",
    city: "Dasmariñas",
    date: "July 12, 2026",
    time: "6:00 PM",
    accessType: "Private",
    verificationCode: "VIP2026",
    isPaid: false,
    price: 0,
    ticketTiers: ["VIP Invite"],
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: 2,
    title: "Summer Rhythm Music Festival",
    category: "Music & Concerts",
    barangay: "Imus, Cavite",
    city: "Imus",
    date: "August 3, 2026",
    time: "4:00 PM",
    accessType: "Public",
    verificationCode: null,
    isPaid: true,
    price: 500,
    ticketTiers: ["General Admission", "VIP Rock-In Pass"],
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: 3,
    title: "Barangay Grassroots Basketball Open",
    category: "Sports & Athletics",
    barangay: "Dasmariñas, Cavite",
    city: "Dasmariñas",
    date: "July 20, 2026",
    time: "8:00 AM",
    accessType: "Public",
    verificationCode: null,
    isPaid: false,
    price: 0,
    ticketTiers: ["Free General Pass"],
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
    color: "from-emerald-500 to-teal-600",
  },
];

// ── Map organizer-created backend events → attendee event schema ──────────────
// Organizer events (from EventsPanel) use: { id, title, category, startDateTime,
// endDateTime, barangay, city, streetAddress, bannerUrl, ticketTiers: [{tierName,
// price, onlineSlots, f2fSlots, validityScope}], accessType, verificationCode,
// venueName, status, ... }
// Attendee UI expects: { id, title, category, barangay (display), city, date
// (string), time (string), accessType, verificationCode, isPaid, price,
// ticketTiers: [strings], image, color (Tailwind gradient), status }
const CATEGORY_GRADIENTS = {
  'Music & Concerts': 'from-amber-500 to-orange-600',
  'Sports & Athletics': 'from-emerald-500 to-teal-600',
  'Tech & Innovation': 'from-purple-500 to-indigo-600',
  'Technology': 'from-purple-500 to-indigo-600',
  'Business & Corp': 'from-blue-500 to-cyan-600',
  'Birthdays': 'from-pink-500 to-rose-600',
  'Weddings': 'from-rose-400 to-pink-600',
  'Private Gatherings': 'from-purple-500 to-indigo-600',
  'Arts': 'from-fuchsia-500 to-purple-600',
  'Others': 'from-slate-500 to-slate-700',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80';

function mapBackendEvent(evt) {
  if (!evt) return null;

  const startDate = new Date(evt.startDateTime);
  const isValidDate = !isNaN(startDate.getTime());
  const dateStr = isValidDate
    ? startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Date TBA';
  const timeStr = isValidDate
    ? startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '';

  // Build a readable location label from whatever address parts the organizer provided
  const locationParts = [evt.barangay, evt.city].filter(v => v && v !== 'N/A');
  const locationLabel = locationParts.join(', ') || evt.venueName || 'Venue TBA';

  // Convert organizer ticket tier objects into attendee-friendly tier name strings,
  // and derive a representative price (first paid tier wins).
  let tierNames = [];
  let isPaid = false;
  let price = 0;

  if (Array.isArray(evt.ticketTiers) && evt.ticketTiers.length > 0) {
    tierNames = evt.ticketTiers
      .map(t => (typeof t === 'string' ? t : (t.tierName || t.name || 'General Admission')))
      .filter(Boolean);
    const paidTier = evt.ticketTiers.find(t => Number(t?.price) > 0);
    if (paidTier) {
      isPaid = true;
      price = Number(paidTier.price);
    }
  }
  if (tierNames.length === 0) tierNames = ['General Admission'];

  return {
    id: evt.id,
    title: evt.title || 'Untitled Event',
    category: evt.category || 'Others',
    barangay: locationLabel,   // display string (matches mock format like "Dasmariñas, Cavite")
    city: evt.city || '',      // kept separate for city-based recommendation filtering
    date: dateStr,
    time: timeStr,
    accessType: evt.accessType || 'Public',
    verificationCode: evt.verificationCode || null,
    isPaid,
    price,
    ticketTiers: tierNames,
    image: evt.bannerUrl || FALLBACK_IMAGE,
    color: CATEGORY_GRADIENTS[evt.category] || CATEGORY_GRADIENTS['Others'],
    status: evt.status,
    // Preserve organizer-only fields for richer detail views (map pins, etc.)
    streetAddress: evt.streetAddress,
    venueName: evt.venueName,
    mapUrl: evt.mapUrl,
  };
}

function getRecommendedEvents(events, user) {
  // 1. Sort events so the user's location is at the top
  const sortedEvents = [...events].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.barangay === user.barangay) scoreA += 10;
    if (b.barangay === user.barangay) scoreB += 10;

    if (a.city === user.city) scoreA += 5;
    if (b.city === user.city) scoreB += 5;

    return scoreB - scoreA;
  });

  // 2. Look at the #1 most recommended event to determine the Scope Title
  let scopeTitle = 'Trending Events Across the Philippines';
  const topEvent = sortedEvents[0];

  if (topEvent) {
    if (topEvent.barangay === user.barangay) {
      scopeTitle = `Near You in ${user.barangay}`;
    } else if (topEvent.city === user.city) {
      scopeTitle = `Events in ${user.city}`;
    }
  }

  return {
    events: sortedEvents,
    scope: scopeTitle
  };
}

function generateTicketId() {
  return 'VNU-' + Math.random().toString(36).toUpperCase().slice(2, 8) + '-' + Date.now().toString().slice(-4);
}

function QrMockup() {
  const grid = Array.from({ length: 64 }, (_, i) => Math.random() > 0.5);
  return (
    <div className="grid grid-cols-8 gap-0.5 w-full h-full">
      {grid.map((filled, i) => (
        <div key={i} className={`rounded-none ${filled ? 'bg-slate-900' : 'bg-transparent'}`} />
      ))}
    </div>
  );
}

function EventCard({ event, onSelect }) {
  return (
    <div
      onClick={() => onSelect(event)}
      className="bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 group cursor-pointer relative flex flex-col h-full"
    >
      <div className="h-56 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 z-10"></div>
        <img src={event.image} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform" />

        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md bg-white/90 shadow-sm ${event.accessType === 'Private' ? 'text-purple-600 border-purple-200' : event.isPaid ? 'text-amber-600 border-amber-200' : 'text-emerald-600 border-emerald-200'}`}>
            {event.accessType === 'Private' ? <Lock size={10} /> : event.isPaid ? <Tag size={10} /> : <CheckCircle2 size={10} />}
            {event.accessType === 'Private' ? 'Private' : event.isPaid ? `₱${event.price}` : 'Free'}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 z-20">
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20">
            {event.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow relative bg-slate-50 dark:bg-slate-800">
        <div className="absolute -top-8 right-6 z-20">
          <div className="w-14 h-14 rounded-none bg-purple-50 dark:bg-slate-600 flex flex-col items-center justify-center text-purple-700 dark:text-purple-300 font-black shadow-lg shadow-black/20 group-hover:-translate-y-1 transition-transform">
            <span className="text-[10px] tracking-widest opacity-80 uppercase leading-none">{new Date(event.date).toLocaleString('en-us', { month: 'short' })}</span>
            <span className="text-xl leading-tight">{new Date(event.date).getDate()}</span>
          </div>
        </div>

        <h4 className="font-black text-slate-900 dark:text-white text-xl leading-tight group-hover:text-purple-700 dark:text-purple-500 pr-16 mb-4">
          {event.title}
        </h4>

        <div className="space-y-3 mt-auto mb-6">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-3">
            <span className="p-2 rounded-none bg-slate-50 dark:bg-slate-900 text-purple-700 dark:text-purple-500 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30"><MapPin size={14} /></span> {event.barangay}
          </p>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-3">
            <span className="p-2 rounded-none bg-slate-50 dark:bg-slate-900 text-purple-700 dark:text-purple-500 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30"><Clock size={14} /></span> {event.time}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{event.ticketTiers.length} Tier{event.ticketTiers.length > 1 ? 's' : ''} Available</span>
          <span className="text-sm font-black text-purple-700 dark:text-purple-500 flex items-center gap-1 group-hover:gap-2">
            Get Tickets <ChevronRight size={16} strokeWidth={3} />
          </span>
        </div>
      </div>
    </div>
  );
}

function TicketingDrawer({ event, onClose, onSuccess }) {
  const [accessCode, setAccessCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [selectedTier, setSelectedTier] = useState(event.ticketTiers[0]);
  const codeMatches = accessCode === event.verificationCode;

  const handleCheckout = () => {
    onSuccess({
      event,
      ticketId: generateTicketId(),
      tier: selectedTier,
      paymentMethod: event.isPaid ? paymentMethod : null,
      claimedAt: new Date().toLocaleString()
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />

      <div className="w-full max-w-md bg-slate-50 dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-slide-in-right relative z-10 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between relative z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="pr-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest mb-3 border border-white/10">
              <Ticket size={10} /> Secure Checkout
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{event.title}</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
              <MapPin size={14} /> {event.barangay}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 shadow-sm">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 custom-scrollbar">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Select Admission Tier</p>
            <div className="space-y-3">
              {event.ticketTiers.map((tier) => (
                <label key={tier} className={`flex items-center justify-between p-4 rounded-none border-2 cursor-pointer ${selectedTier === tier ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTier === tier ? 'border-purple-500' : 'border-slate-300 dark:border-slate-600'}`}>
                      {selectedTier === tier && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                    </div>
                    <span className={`text-sm font-bold ${selectedTier === tier ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{tier}</span>
                  </div>
                  {event.isPaid && <span className={`font-black ${selectedTier === tier ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`}>₱{event.price}</span>}
                </label>
              ))}
            </div>
          </div>

          {event.accessType === 'Private' && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-none border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Shield size={14} className="text-purple-500" /> Pass Verification
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="ENTER ACCESS CODE"
                  className={`w-full bg-slate-50 dark:bg-slate-900 border-2 rounded-none px-4 py-4 text-center font-bold tracking-[0.1em] uppercase text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 ${accessCode && !codeMatches
                    ? 'border-red-400 focus:border-red-500'
                    : codeMatches
                      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'
                    }`}
                />
              </div>
              {accessCode && !codeMatches && (
                <p className="text-xs text-red-500 mt-3 font-semibold text-center">Invalid Pass Code.</p>
              )}
              {codeMatches && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-semibold text-center">Code verified. You're on the list.</p>
              )}
            </div>
          )}

          {event.isPaid && (
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <CreditCard size={14} className="text-purple-500" /> Payment Method
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: 'gcash', label: 'GCash', icon: '📱' },
                  { id: 'gotyme', label: 'GoTyme', icon: '🏦' },
                ].map((method) => (
                  <label key={method.id} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-none border-2 cursor-pointer ${paymentMethod === method.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="hidden" />
                    <span className="text-2xl">{method.icon}</span>
                    <span className={`text-xs font-bold uppercase tracking-wide ${paymentMethod === method.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{method.label}</span>
                  </label>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-none p-5">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">
                  <span>Subtotal</span>
                  <span>₱{event.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-4 font-medium">
                  <span>Platform Fee</span>
                  <span>₱0.00</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Due</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">₱{event.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {!event.isPaid && event.accessType === 'Public' && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-none p-6 text-center shadow-sm">
              <CheckCircle2 className="text-emerald-500 dark:text-emerald-400 mx-auto mb-3" size={36} strokeWidth={2.5} />
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-1">Free Admission Guaranteed</p>
              <p className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/70">No payment required. Claim your pass directly.</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md relative z-20">
          {event.accessType === 'Private' ? (
            <button
              disabled={!codeMatches}
              onClick={handleCheckout}
              className={`w-full py-4 rounded-none text-sm font-bold uppercase tracking-wide ${codeMatches
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm active:scale-95'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                }`}
            >
              {codeMatches ? 'Confirm Registration' : 'Enter Access Code'}
            </button>
          ) : event.isPaid ? (
            <button onClick={handleCheckout} className="w-full py-4 rounded-none text-sm font-bold uppercase tracking-wide bg-purple-600 hover:bg-purple-700 text-white shadow-sm active:scale-95 flex justify-center items-center gap-2">
              <Lock size={16} /> Authorize Payment
            </button>
          ) : (
            <button onClick={handleCheckout} className="w-full py-4 rounded-none text-sm font-bold uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 flex justify-center items-center gap-2">
              <SparklesIcon /> Claim Free Pass
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SparklesIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>;
}

function TicketModal({ ticket, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm animate-scale-in relative group perspective-1000">
        <div className="bg-white rounded-none overflow-hidden shadow-2xl relative z-10 transform transition-transform preserve-3d">
          <div className={`bg-gradient-to-br ${ticket.event.color || 'from-purple-500 to-indigo-600'} p-6 pb-12 text-white text-center relative`}>
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md">
              <X size={14} strokeWidth={3} />
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 shadow-inner">
              <CheckCircle2 size={12} /> Confirmed
            </span>
            <h2 className="text-2xl font-black leading-tight">{ticket.event.title}</h2>
          </div>

          <div className="relative flex justify-between items-center -mt-4 z-20">
            <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md -ml-4 shadow-inner"></div>
            <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-2"></div>
            <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md -mr-4 shadow-inner"></div>
          </div>

          <div className="p-8 pt-6 flex flex-col items-center bg-white relative">
            <div className="w-40 h-40 bg-white border border-slate-200 shadow-sm rounded-none p-4 mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-slate-50"></div>
              <div className="relative z-10 w-full h-full">
                <QrMockup />
              </div>
            </div>

            <div className="text-center w-full mb-6">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Ticket ID</p>
              <div className="bg-slate-50 border border-slate-100 rounded-none py-2 px-4 font-mono font-black text-slate-900 tracking-widest text-sm shadow-inner">
                {ticket.ticketId}
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-y-4 gap-x-6 text-left">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Tier</p>
                <p className="font-bold text-slate-900 leading-tight text-sm">{ticket.tier}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Date</p>
                <p className="font-bold text-slate-900 leading-tight text-sm">{ticket.event.date}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Venue</p>
                <p className="font-bold text-slate-900 leading-tight text-sm">{ticket.event.barangay}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
            <button onClick={onClose} className="text-xs font-black uppercase tracking-widest text-purple-700 dark:text-purple-500 hover:text-purple-900">
              Close Pass
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useTheme } from '../../ThemeContext';

export default function AttendeeDashboard() {
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [selectedWalletCategory, setSelectedWalletCategory] = useState('All');

  // ── Fetch events created by organizers from the shared /api/events endpoint ──
  // Same endpoint used by EventsPanel.jsx on the organizer side. We map the
  // organizer event schema → attendee schema and surface only Published events.
  const [events, setEvents] = useState(mockEvents); // start with mocks to avoid empty UI flicker
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setEventsLoading(true);
      setEventsError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events/public`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        const rawEvents = Array.isArray(data) ? data : (data.events || []);
        // Attendees should only discover Published events (not Draft / Discontinued)
        const visible = rawEvents
          .map(mapBackendEvent)
          .filter(evt => evt && (!evt.status || evt.status === 'Published'));
        if (visible.length > 0) {
          setEvents(visible);
        } else {
          // API responded but has no published events yet — keep mocks so the UI isn't empty
          setEvents(mockEvents);
        }
      } catch (err) {
        if (cancelled) return;
        console.warn('Events API unavailable, falling back to mock events:', err.message);
        setEventsError(err.message);
        setEvents(mockEvents);
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [tickets, setTickets] = useState(() => {
    const savedTickets = localStorage.getItem('vnu_user_tickets');
    return savedTickets ? JSON.parse(savedTickets) : [];
  });

  const savedUserStr = localStorage.getItem('user');
  const loggedInUser = savedUserStr ? JSON.parse(savedUserStr) : null;

  const currentUser = {
    id: loggedInUser?.Id || loggedInUser?.id || '',
    email: loggedInUser?.Email || loggedInUser?.email || '',
    role: loggedInUser?.Role || loggedInUser?.role || 'Attendee',
    firstName: loggedInUser?.FirstName || loggedInUser?.firstName || 'Guest',
    lastName: loggedInUser?.LastName || loggedInUser?.lastName || 'User',
    contactNumber: loggedInUser?.ContactNumber || loggedInUser?.contactNumber || '',
    region: loggedInUser?.Region || loggedInUser?.region || '',
    province: loggedInUser?.Province || loggedInUser?.province || '',
    city: loggedInUser?.City || loggedInUser?.city || '',
    barangay: loggedInUser?.Barangay || loggedInUser?.barangay || '',
    preferredCategories: []
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Welcome to VenU!', message: 'Explore local premium events in your area.', read: false, time: '2m ago' },
    { id: 2, title: 'Upcoming VIP Event', message: 'The Music Festival access codes are dispatching now.', read: false, time: '1h ago' }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));

  const navItems = [
    { id: 'dashboard', label: 'Discovery', icon: LayoutDashboard },
    { id: 'mytickets', label: 'Ticket Wallet', icon: Ticket },
    { id: 'map', label: 'Event Map', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const { events: recommended, scope } = getRecommendedEvents(events, currentUser);

  const filtered = recommended.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase()) ||
    e.barangay.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTickets = tickets.filter((t) => {
    if (selectedWalletCategory === 'All') return true;
    return t.event.category === selectedWalletCategory;
  });

  const handleSuccess = (newTicket) => {
    setSelectedEvent(null);
    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    localStorage.setItem('vnu_user_tickets', JSON.stringify(updatedTickets));
    setConfirmedTicket(newTicket);
  };

  const handleDeleteTicket = (ticketId, eventTitle, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to void and remove your pass for "${eventTitle}"?`)) {
      const updatedTickets = tickets.filter(t => t.ticketId !== ticketId);
      setTickets(updatedTickets);
      localStorage.setItem('vnu_user_tickets', JSON.stringify(updatedTickets));
    }
  };

  // ── High Quality Image Snapshot Download Engine ───────────────────────────
  const handleDownloadTicket = (ticket, e) => {
    e.stopPropagation();

    const gradientColor = ticket.event.color || 'from-purple-500 to-indigo-600';
    let cssGradient = 'linear-gradient(135deg, #a855f7, #4f46e5)';
    if (gradientColor.includes('emerald')) {
      cssGradient = 'linear-gradient(135deg, #10b981, #0d9488)';
    } else if (gradientColor.includes('amber')) {
      cssGradient = 'linear-gradient(135deg, #f59e0b, #ea580c)';
    }

    // Build the visual container to render off-screen
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = '384px';
    container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
    container.style.backgroundColor = '#0f172a';
    container.style.padding = '40px 20px';

    // Randomize dynamic local fake pixels for snapshot
    const qrPixels = Array.from({ length: 64 }, () =>
      `<div style="background-color: ${Math.random() > 0.5 ? '#0f172a' : 'transparent'}; width:100%; height:100%;"></div>`
    ).join('');

    container.innerHTML = `
      <div style="width: 100%; background: white; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); overflow: hidden; position: relative;">
        <div style="background: ${cssGradient}; padding: 32px 24px 48px 24px; text-align: center; color: white;">
          <div style="display: inline-flex; align-items: center; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px;">✓ Confirmed</div>
          <h2 style="font-size: 24px; font-weight: 900; line-height: 1.2; margin: 0;">${ticket.event.title}</h2>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: -16px; position: relative; z-index: 20;">
          <div style="width: 32px; height: 32px; background: #0f172a; border-radius: 50%; margin-left: -16px;"></div>
          <div style="flex: 1; border-top: 2px dashed #cbd5e1; margin: 0 8px;"></div>
          <div style="width: 32px; height: 32px; background: #0f172a; border-radius: 50%; margin-right: -16px;"></div>
        </div>
        <div style="padding: 32px; padding-top: 24px; text-align: center;">
          <div style="width: 160px; height: 160px; border: 1px solid #e2e8f0; padding: 16px; margin: 0 auto 24px auto; display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; background: #fff;">
            ${qrPixels}
          </div>
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 900; margin-bottom: 4px;">Ticket ID</div>
          <div style="background: #f8fafc; border: 1px solid #f1f5f9; padding: 8px 16px; font-family: monospace; font-weight: 900; color: #0f172a; letter-spacing: 0.15em; font-size: 14px; margin-bottom: 24px;">${ticket.ticketId}</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; row-gap: 16px; column-gap: 24px; text-align: left;">
            <div>
              <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 900; margin-bottom: 4px;">Tier</div>
              <p style="font-weight: 700; color: #0f172a; font-size: 14px; margin: 0; line-height: 1.2;">${ticket.tier}</p>
            </div>
            <div>
              <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 900; margin-bottom: 4px;">Date</div>
              <p style="font-weight: 700; color: #0f172a; font-size: 14px; margin: 0; line-height: 1.2;">${ticket.event.date}</p>
            </div>
            <div style="grid-column: span 2;">
              <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 900; margin-bottom: 4px;">Venue</div>
              <p style="font-weight: 700; color: #0f172a; font-size: 14px; margin: 0; line-height: 1.2;">${ticket.event.barangay}</p>
            </div>
          </div>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 16px; text-align: center; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #a855f7;">VenU Premium Pass</div>
      </div>
    `;

    document.body.appendChild(container);

    // Render snapshot and prompt save
    html2canvas(container, {
      backgroundColor: '#0f172a',
      scale: 2, // Double resolution scale for clear QR pixel snapshot
      logging: false,
      useCORS: true
    }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `VenU-Pass-${ticket.ticketId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      document.body.removeChild(container);
    }).catch((err) => {
      console.error("Error drawing passport asset:", err);
      document.body.removeChild(container);
    });
  };

  const eventTypes = [
    { name: 'All', icon: Ticket },
    { name: 'Tech & Innovation', icon: Star },
    { name: 'Music & Concerts', icon: Music },
    { name: 'Sports & Athletics', icon: Trophy },
    { name: 'Business & Corp', icon: Briefcase },
    { name: 'Birthdays', icon: Gift },
    { name: 'Weddings', icon: Heart },
    { name: 'Others', icon: MoreHorizontal },
  ];

  return (
    <div className="flex min-h-screen bg-slate-200 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">

      {/* ── Fixed Premium Dark Sidebar ──────────────────────────────────────────── */}
      <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 p-6 flex flex-col justify-between z-40 shadow-2xl">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2 select-none px-2 mb-2">
            <img src={logo} alt="VenU Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">VenU</span>
          </div>

          {/* User Profile Overview — matches Organizer Dashboard card style */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded">
            <div className="w-10 h-10 rounded-full bg-purple-700 dark:bg-purple-500 flex items-center justify-center font-medium text-white text-sm shrink-0">
              {currentUser.firstName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight truncate">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Attendee Account</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 rounded-none px-4 py-3.5 text-sm font-bold ${isActive
                    ? 'bg-purple-700 dark:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-white/10'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent'
                    }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span className="tracking-wide">{label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                  {id === 'mytickets' && tickets.length > 0 && (
                    <span className="ml-auto bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs font-black px-2 py-0.5 rounded-full">{tickets.length}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-xs font-bold text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent"
        >
          <LogOut size={16} strokeWidth={2.5} /> Log Out
        </button>
      </aside>

      {/* ── Main Viewport Canvas ───────────────────────────────────────────── */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
        <div className="sticky top-0 z-30 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-end">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border ${showNotifications ? 'border-slate-400 text-slate-800 dark:text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
              >
                <Bell size={18} className={unreadCount > 0 ? 'animate-pulse text-purple-700 dark:text-purple-400' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-none h-2.5 w-2.5 bg-purple-700 dark:bg-purple-500 border-2 border-white dark:border-slate-800"></span>
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-4 w-[360px] bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-none shadow-2xl border border-slate-100/50 dark:border-slate-700/50 z-50 overflow-hidden animate-fade-in origin-top-right">
                  <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="bg-purple-700 dark:bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs font-bold text-purple-700 dark:text-purple-500 hover:text-purple-700">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-300">
                          <Bell size={20} />
                        </div>
                        <p className="text-sm font-bold text-slate-400">All caught up!</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`p-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 cursor-pointer relative group ${notif.read ? 'opacity-60' : ''}`}>
                          {!notif.read && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-700 dark:bg-purple-500 rounded-r-md"></div>
                          )}
                          <div className="flex justify-between items-start mb-1.5 pl-2">
                            <h4 className={`text-sm font-black ${notif.read ? 'text-slate-600' : 'text-slate-900'}`}>{notif.title}</h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium pl-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-white"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-none p-10 relative overflow-hidden mb-12 shadow-md border border-slate-200 dark:border-slate-700">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="text-center md:text-left">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-2 justify-center md:justify-start">
                      <SparklesIcon /> Explore Events
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                      Find your next <span className="text-slate-700 dark:text-slate-300">experience.</span>
                    </h1>
                  </div>

                  <div className="w-full md:w-[450px] relative group">
                    <div className="relative bg-slate-50 dark:bg-slate-700/50 backdrop-blur-md border border-slate-200 dark:border-slate-600 rounded-none p-2 flex items-center shadow-lg">
                      <div className="p-3 text-slate-400 dark:text-slate-500">
                        <Search size={20} strokeWidth={2.5} />
                      </div>
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search events, venues, access codes..."
                        className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-sm outline-none px-2 pr-4"
                      />
                      <button className="bg-white text-slate-900 px-4 py-2.5 rounded-none text-xs font-black uppercase tracking-widest hover:bg-slate-100 shadow-sm">
                        Scan
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-8 px-2">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-700 dark:bg-purple-500 animate-pulse"></div> {scope}
                  </h2>
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 px-4 py-1.5 rounded-full shadow-sm">
                  {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
                </span>
              </div>

              {eventsLoading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                  <div className="w-12 h-12 border-4 border-purple-700 dark:border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Loading events from organizers…</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-800/50 group-hover:bg-purple-50/30"></div>
                  <div className="relative z-10">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-500">
                      <Search size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No events found</h3>
                    <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm mx-auto">No events match your current query. Try adjusting your filters.</p>
                    {eventsError && (
                      <p className="text-xs text-amber-500 mt-3 font-medium">Showing sample events (organizer API unreachable: {eventsError}).</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filtered.map((event) => (
                    <EventCard key={event.id} event={event} onSelect={setSelectedEvent} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'mytickets' && (
            <div className="animate-fade-in max-w-6xl mx-auto">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-none flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-purple-400">
                  <Ticket size={28} strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">My Tickets</h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Your purchased and saved event tickets.</p>
              </div>

              <div className="mb-10 bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200 dark:border-slate-800 rounded-none">
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-1">Filter by Event Type</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {eventTypes.map((type) => {
                    const TypeIcon = type.icon;
                    const isSelected = selectedWalletCategory === type.name;
                    return (
                      <button
                        key={type.name}
                        onClick={() => setSelectedWalletCategory(type.name)}
                        className={`flex items-center gap-3 p-3 text-sm font-bold border transition-all ${isSelected
                          ? 'bg-purple-700 dark:bg-purple-600 border-purple-600 text-white shadow-md'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                      >
                        <TypeIcon size={16} className={isSelected ? 'text-white' : 'text-slate-400'} />
                        <span className="truncate">{type.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredTickets.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-none p-16 text-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent group-hover:via-purple-500"></div>
                  <QrCode className="mx-auto text-slate-200 dark:text-slate-700 mb-6 group-hover:text-purple-200 dark:group-hover:text-purple-800" size={64} strokeWidth={1} />
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Tickets Found</h3>
                  <p className="text-sm font-medium text-slate-400 mt-2 mb-8 max-w-sm mx-auto">
                    {tickets.length === 0
                      ? "You haven't purchased any tickets yet. Browse events to find something you like."
                      : "No passes match this specific event type filter."}
                  </p>
                  {tickets.length === 0 && (
                    <button onClick={() => setActiveTab('dashboard')} className="px-8 py-3.5 rounded-none bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-sm active:scale-95 flex items-center gap-2 mx-auto">
                      <Search size={16} /> Explore Events
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredTickets.map((t) => (
                    <div
                      key={t.ticketId}
                      onClick={() => setConfirmedTicket(t)}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none overflow-hidden relative group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                    >
                      <div className="p-5 flex gap-4">
                        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                          <img src={t.event.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-black tracking-widest text-purple-600 dark:text-purple-400 uppercase bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 border border-purple-100 dark:border-purple-800/50">
                            {t.tier}
                          </span>
                          <h3 className="font-black text-slate-900 dark:text-white mt-1.5 truncate text-base leading-tight">
                            {t.event.title}
                          </h3>
                          <div className="mt-2 space-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <p className="flex items-center gap-1.5"><Calendar size={12} /> {t.event.date} @ {t.event.time}</p>
                            <p className="flex items-center gap-1.5 truncate"><MapPin size={12} /> {t.event.barangay}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-100 dark:bg-slate-900 px-5 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-300 tracking-wider">
                          {t.ticketId}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            title="View Full Digital Pass"
                            onClick={() => setConfirmedTicket(t)}
                            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                          >
                            <Eye size={14} strokeWidth={2.5} />
                          </button>
                          <button
                            title="Download Ticket Image (.png)"
                            onClick={(e) => handleDownloadTicket(t, e)}
                            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            <Download size={14} strokeWidth={2.5} />
                          </button>
                          <button
                            title="Void / Delete Pass"
                            onClick={(e) => handleDeleteTicket(t.ticketId, t.event.title, e)}
                            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-none">
                  <MapPin size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Locations</h1>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Explore events happening around you on the map.</p>
                </div>
              </div>

              <div className="relative">
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-none overflow-hidden relative z-10 p-2">
                  <div className="h-[600px] w-full rounded-none overflow-hidden relative border border-slate-200 dark:border-slate-700">
                    <MapContainer center={[14.3296, 120.9367]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      />
                      {events.map((event, i) => (
                        <Marker key={event.id} position={event.city === 'Imus' ? [14.4296, 120.9367] : [14.3296 + (i * 0.01), 120.9367 - (i * 0.01)]}>
                          <Popup className="rounded-none overflow-hidden shadow-2xl border-0 p-0 m-0 w-[240px]">
                            <div className="font-sans">
                              <div className="h-24 w-full bg-slate-200 relative">
                                <img src={event.image} className="w-full h-full object-cover" alt="Venue" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <span className="absolute bottom-2 left-2 text-[10px] font-black uppercase tracking-widest text-white px-2 py-1 bg-purple-700 dark:bg-purple-500/80 rounded-none backdrop-blur-sm">
                                  {event.category}
                                </span>
                              </div>
                              <div className="p-3">
                                <h4 className="font-black text-slate-900 leading-tight mb-1 text-sm">{event.title}</h4>
                                <p className="text-[11px] font-medium text-slate-500 mb-2 flex items-center gap-1"><MapPin size={10} /> {event.barangay}</p>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && <UserSettings currentUser={currentUser} />}
        </div>
      </main>

      {selectedEvent && (
        <TicketingDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSuccess={handleSuccess}
        />
      )}

      {confirmedTicket && (
        <TicketModal
          ticket={confirmedTicket}
          onClose={() => setConfirmedTicket(null)}
        />
      )}
    </div>
  );
}