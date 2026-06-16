import React, { useState } from 'react';
import {
  LayoutDashboard, MapPin, Ticket, Settings, Search, Lock,
  Tag, CheckCircle2, X, ChevronRight, Calendar, Clock,
  CreditCard, Smartphone, Star, User, Bell, LogOut, QrCode, Shield, ArrowRight, Music, Moon, Sun
} from 'lucide-react';
import logo from "../../assets/venu-logo3-transparent.png";
import { useNavigate } from 'react-router-dom';

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
    category: "Concerts",
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
    category: "Sports",
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

// ── Proximity Matching Engine ─────────────────────────────────────────────────
function getRecommendedEvents(events, user) {
  const byBarangay = events.filter(
    (e) => e.barangay === user.barangay && (user.preferredCategories || []).includes(e.category)
  );
  if (byBarangay.length > 0) return { events: byBarangay, scope: `Near You in ${user.barangay}` };

  const byCity = events.filter((e) => e.city === user.city);
  if (byCity.length > 0) return { events: byCity, scope: `Events in ${user.city || 'your city'}` };

  return { events, scope: 'Trending Events Across the Philippines' };
}

// ── Unique Ticket ID Generator ────────────────────────────────────────────────
function generateTicketId() {
  return 'VNU-' + Math.random().toString(36).toUpperCase().slice(2, 8) + '-' + Date.now().toString().slice(-4);
}

// ── QR Code Mockup Grid ───────────────────────────────────────────────────────
function QrMockup() {
  const grid = Array.from({ length: 64 }, (_, i) => Math.random() > 0.5);
  return (
    <div className="grid grid-cols-8 gap-0.5 w-full h-full">
      {grid.map((filled, i) => (
        <div key={i} className={`rounded-sm ${filled ? 'bg-slate-900' : 'bg-transparent'}`} />
      ))}
    </div>
  );
}

// ── Premium Event Card Component ──────────────────────────────────────────────
function EventCard({ event, onSelect }) {
  return (
    <div
      onClick={() => onSelect(event)}
      className="bg-white dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:-translate-y-1 transition-transform group cursor-pointer relative flex flex-col h-full"
    >
      {/* Immersive Image Header */}
      <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors z-10"></div>
        <img src={event.image} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
        
        {/* Glowing Badge Area */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold border backdrop-blur-md bg-white/90 shadow-sm ${event.accessType === 'Private' ? 'text-slate-700 dark:text-slate-300 border-purple-200' : event.isPaid ? 'text-slate-700 dark:text-slate-300 border-amber-200' : 'text-slate-700 dark:text-slate-300 border-emerald-500/20'}`}>
                {event.accessType === 'Private' ? <Lock size={10} /> : event.isPaid ? <Tag size={10} /> : <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse`}></span>}
                {event.accessType === 'Private' ? 'Private' : event.isPaid ? `₱${event.price}` : 'Free'}
            </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-6 flex flex-col flex-grow relative bg-white dark:bg-slate-800">
        <div className="absolute -top-6 right-6 z-20">
            <div className="bg-purple-50 dark:bg-slate-600 w-16 flex flex-col items-center justify-center text-purple-700 dark:text-purple-300 py-2 rounded shadow-md border border-slate-200 dark:border-slate-500 group-hover:-translate-y-1 transition-transform">
                <span className="text-xs font-medium opacity-80 uppercase">{new Date(event.date).toLocaleString('en-us', { month: 'short' })}</span>
                <span className="text-lg font-semibold">{new Date(event.date).getDate()}</span>
            </div>
        </div>

        <div className="flex justify-between items-start gap-2 mb-2 pr-16">
          <span className="text-[10px] font-bold tracking-wider text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md">{event.category}</span>
        </div>
        <h4 className="font-semibold text-slate-900 dark:text-white text-xl leading-tight mb-4 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
          {event.title}
        </h4>
        
        <div className="space-y-3 mt-auto mb-6">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
              <Calendar size={14} strokeWidth={2.5} />
            </div>
            <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
              <Clock size={14} strokeWidth={2.5} />
            </div>
            <span className="text-xs leading-normal">{event.time}</span>
          </div>
          <div className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
            <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0 mt-0.5">
              <MapPin size={14} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-bold text-slate-800 dark:text-slate-200">{event.city}</span>
              <span className="text-xs text-slate-500 line-clamp-1">{event.barangay}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">Ticket Options</span>
          <button className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 group-hover:gap-2 transition-all">
            Get Tickets <ArrowRight size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Immersive Ticketing Drawer ────────────────────────────────────────────────
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
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Dark Blur Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-slide-in-right relative z-10 overflow-hidden">
        
        {/* Header */}
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
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700 shadow-sm">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 custom-scrollbar">
          {/* Tier Selector */}
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Select Admission Tier</p>
            <div className="space-y-3">
              {event.ticketTiers.map((tier) => (
                <label key={tier} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedTier === tier ? `border-purple-500 bg-purple-50 dark:bg-purple-900/10` : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80'}`}>
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

          {/* FLOW 1: Private — Access Code Gate */}
          {event.accessType === 'Private' && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Shield size={14} className="text-purple-500" /> Pass Verification
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="ENTER ACCESS CODE"
                  className={`w-full bg-white dark:bg-slate-900 border-2 rounded-xl px-4 py-4 text-center font-bold tracking-[0.1em] uppercase text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 ${accessCode && !codeMatches
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

          {/* FLOW 2: Paid — Payment Method */}
          {event.isPaid && (
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <CreditCard size={14} className="text-purple-500" /> Payment Method
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: 'gcash', label: 'GCash', icon: '📱', color: 'blue' },
                  { id: 'gotyme', label: 'GoTyme', icon: '🏦', color: 'indigo' },
                ].map((method) => (
                  <label key={method.id} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="hidden" />
                    <span className="text-2xl">{method.icon}</span>
                    <span className={`text-xs font-bold uppercase tracking-wide ${paymentMethod === method.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{method.label}</span>
                  </label>
                ))}
              </div>

              {/* Price Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
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

          {/* FLOW 3: Free Public */}
          {!event.isPaid && event.accessType === 'Public' && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-6 text-center shadow-sm">
              <CheckCircle2 className="text-emerald-500 dark:text-emerald-400 mx-auto mb-3" size={36} strokeWidth={2.5} />
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-1">Free Admission Guaranteed</p>
              <p className="text-sm font-medium text-emerald-600/70 dark:text-emerald-400/70">No payment required. Claim your pass directly.</p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md relative z-20">
          {event.accessType === 'Private' ? (
            <button
              disabled={!codeMatches}
              onClick={handleCheckout}
              className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wide transition-all ${codeMatches
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm active:scale-95'
                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
                }`}
            >
              {codeMatches ? 'Confirm Registration' : 'Enter Access Code'}
            </button>
          ) : event.isPaid ? (
            <button onClick={handleCheckout} className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wide bg-purple-600 hover:bg-purple-700 text-white shadow-sm active:scale-95 transition-all flex justify-center items-center gap-2">
              <Lock size={16} /> Authorize Payment
            </button>
          ) : (
            <button onClick={handleCheckout} className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95 transition-all flex justify-center items-center gap-2">
              <SparklesIcon /> Claim Free Pass
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SparklesIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
}

// ── Ticket Modal ──────────────────────────────────────────────────
function TicketModal({ ticket, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm animate-scale-in relative group perspective-1000">

        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10 transform transition-transform duration-500 preserve-3d">
            
            {/* Header Strip */}
            <div className={`bg-gradient-to-br ${ticket.event.color} p-6 pb-12 text-white text-center relative`}>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30 mix-blend-overlay pointer-events-none"></div>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 transition backdrop-blur-md">
                    <X size={14} strokeWidth={3} />
                </button>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 shadow-inner">
                    <CheckCircle2 size={12} /> Confirmed
                </span>
                <h2 className="text-2xl font-black leading-tight">{ticket.event.title}</h2>
            </div>

            {/* Perforation Line */}
            <div className="relative flex justify-between items-center -mt-4 z-20">
                <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md -ml-4 shadow-inner"></div>
                <div className="flex-1 border-t-2 border-dashed border-slate-300 mx-2"></div>
                <div className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md -mr-4 shadow-inner"></div>
            </div>

            {/* Body */}
            <div className="p-8 pt-6 flex flex-col items-center bg-white relative">
                {/* QR Code Container */}
                <div className="w-40 h-40 bg-white border border-slate-200 shadow-sm rounded-2xl p-4 mb-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-slate-50"></div>
                    <div className="relative z-10 w-full h-full">
                        <QrMockup />
                    </div>
                </div>

                <div className="text-center w-full mb-6">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Ticket ID</p>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-4 font-mono font-black text-slate-900 tracking-widest text-sm shadow-inner">
                        {ticket.ticketId}
                    </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-y-4 gap-x-6 text-left">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Tier</p>
                        <p className="font-bold text-slate-900 leading-tight">{ticket.tier}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Date</p>
                        <p className="font-bold text-slate-900 leading-tight">{ticket.event.date}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-0.5">Venue</p>
                        <p className="font-bold text-slate-900 leading-tight">{ticket.event.barangay}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
                <button onClick={onClose} className="text-xs font-black uppercase tracking-widest text-[#A855F7] hover:text-purple-700 transition-colors">
                    Close Pass
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────────────────────────────
// Settings are handled by the imported UserSettings component.

import { useTheme } from '../../ThemeContext';

// ── Main Attendee Dashboard ───────────────────────────────────────────────────
export default function AttendeeDashboard() {
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [confirmedTicket, setConfirmedTicket] = useState(null);

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
    { id: 'map', label: 'Global Radar', icon: MapPin },
    { id: 'settings', label: 'Configuration', icon: Settings },
  ];

  const { events: recommended, scope } = getRecommendedEvents(mockEvents, currentUser);

  const filtered = recommended.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase()) ||
    e.barangay.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuccess = (ticket) => {
    setSelectedEvent(null);
    setConfirmedTicket(ticket);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900 font-sans">

      {/* Fixed Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 p-6 flex flex-col justify-between z-40">
        <div className="flex flex-col gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2 select-none px-2 mb-2">
            <img src={logo} alt="VenU Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">VenU</span>
          </div>

          {/* User Profile Overview */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded">
            <div className="w-10 h-10 rounded bg-purple-600 dark:bg-purple-500 flex items-center justify-center font-medium text-white text-sm shrink-0">
              {currentUser.firstName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight truncate">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Attendee Account</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 rounded px-4 py-3 text-sm font-medium transition-colors ${
                      isActive 
                          ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
                  <span className="tracking-wide">{label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded bg-white" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Utilities */}
        <div className="space-y-2">
          <button 
              onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate('/');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
              <LogOut size={16} strokeWidth={2.5} /> Log Out
          </button>
        </div>
      </aside>

      {/* ── Main Viewport Canvas ───────────────────────────────────────────── */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 relative overflow-x-hidden">
        
        {/* Top Notification Bar (Replicated from Organizer) */}
        <div className="sticky top-0 z-30 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-end">
            <div className="flex items-center gap-3">
                <button 
                    onClick={toggleDarkMode}
                    className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-white transition-colors"
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2.5 rounded bg-white dark:bg-slate-800 border transition-colors ${showNotifications ? 'border-slate-400 text-slate-800 dark:text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                    >
                        <Bell size={18} className={unreadCount > 0 ? 'animate-pulse text-purple-700 dark:text-purple-400' : ''} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A855F7] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A855F7] border-2 border-white"></span>
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-4 w-[360px] bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100/50 dark:border-slate-700/50 z-50 overflow-hidden animate-fade-in origin-top-right">
                            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="bg-[#A855F7] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} New</span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-xs font-bold text-[#A855F7] hover:text-purple-700 transition-colors">
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
                                        <div key={notif.id} className={`p-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors cursor-pointer relative group ${notif.read ? 'opacity-60' : ''}`}>
                                            {!notif.read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#A855F7] rounded-r-md"></div>
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
            </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto w-full">
            {/* ── DASHBOARD VIEW (DISCOVERY) ── */}
            {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
                {/* Header Canvas */}
                <div className="relative rounded overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 lg:p-10 mb-8 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative z-10 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 mb-1">
                            <SparklesIcon />
                            <span className="text-xs uppercase tracking-widest font-medium">Attendee Portal</span>
                        </div>
                        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
                            Welcome back, <span className="text-purple-700 dark:text-purple-400 font-bold">{currentUser.firstName}</span>
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
                            Your discovery feeds are looking excellent today.
                        </p>
                    </div>

                    {/* Floating Command Palette Search */}
                    <div className="w-full md:w-[450px] relative group z-10">
                        <div className="relative bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 flex items-center shadow-sm">
                            <div className="p-3 text-slate-400">
                                <Search size={20} strokeWidth={2.5} />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search events, venues, access codes..."
                                className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm outline-none px-2 pr-4"
                            />
                            <button className="bg-purple-700 hover:bg-purple-800 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-4 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-colors shadow-sm">
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Proximity Scope Label */}
                <div className="flex items-center justify-between mb-8 px-2">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse"></div> {scope}
                    </h2>
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 px-4 py-1.5 rounded-full shadow-sm">
                    {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
                </span>
                </div>

                {/* Event Grid */}
                {filtered.length === 0 ? (
                <div className="text-center py-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-800/50 group-hover:bg-purple-50/30 transition-colors duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-500">
                            <Search size={32} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No events found</h3>
                        <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm mx-auto">No events match your current query. Try adjusting your filters.</p>
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

            {/* ── TICKET WALLET VIEW ── */}
            {activeTab === 'mytickets' && (
            <div className="animate-fade-in max-w-4xl mx-auto">
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600 dark:text-purple-400">
                        <Ticket size={28} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">My Tickets</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">Your purchased and saved event tickets.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded p-16 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent group-hover:via-purple-500 transition-colors duration-500"></div>
                    <QrCode className="mx-auto text-slate-200 dark:text-slate-700 mb-6 group-hover:text-purple-200 dark:group-hover:text-purple-800 transition-colors duration-500" size={64} strokeWidth={1} />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Tickets Yet</h3>
                    <p className="text-sm font-medium text-slate-400 mt-2 mb-8 max-w-sm mx-auto">You haven't purchased any tickets yet. Browse events to find something you like.</p>
                    <button onClick={() => setActiveTab('dashboard')} className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition shadow-sm active:scale-95 flex items-center gap-2 mx-auto">
                        <Search size={16} /> Explore Events
                    </button>
                </div>
            </div>
            )}

            {/* ── MAP VIEW ── */}
            {activeTab === 'map' && (
            <div className="animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl">
                        <MapPin size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Locations</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Explore events happening around you on the map.</p>
                    </div>
                </div>

                <div className="relative">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded overflow-hidden relative z-10 p-2">
                        <div className="h-[600px] w-full rounded overflow-hidden relative border border-slate-200 dark:border-slate-700">
                            <MapContainer center={[14.3296, 120.9367]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                            />
                            {mockEvents.map((event, i) => (
                                <Marker key={event.id} position={event.city === 'Imus' ? [14.4296, 120.9367] : [14.3296 + (i * 0.01), 120.9367 - (i * 0.01)]}>
                                <Popup className="rounded-2xl overflow-hidden shadow-2xl border-0 p-0 m-0 w-[240px]">
                                    <div className="font-sans">
                                        <div className="h-24 w-full bg-slate-200 relative">
                                            <img src={event.image} className="w-full h-full object-cover" alt="Venue" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                            <span className="absolute bottom-2 left-2 text-[10px] font-black uppercase tracking-widest text-white px-2 py-1 bg-[#A855F7]/80 rounded-md backdrop-blur-sm">
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

            {/* ── SETTINGS VIEW ── */}
            {activeTab === 'settings' && <UserSettings currentUser={currentUser} />}
        </div>
      </main>

      {/* ── Overlays ── */}
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
