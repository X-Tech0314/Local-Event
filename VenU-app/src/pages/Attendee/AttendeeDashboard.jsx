import React, { useState } from 'react';
import {
  LayoutDashboard, MapPin, Ticket, Settings, Search, Lock,
  Tag, CheckCircle2, X, ChevronRight, Calendar, Clock,
  CreditCard, Smartphone, Star, User, Bell, LogOut, QrCode, Shield
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
    image: null,
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
    image: null,
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
    image: null,
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
    <div className="grid grid-cols-8 gap-0.5 w-28 h-28">
      {grid.map((filled, i) => (
        <div key={i} className={`rounded-sm ${filled ? 'bg-slate-900' : 'bg-white'}`} />
      ))}
    </div>
  );
}

// ── Event Card Component ──────────────────────────────────────────────────────
function EventCard({ event, onSelect }) {
  return (
    <div
      onClick={() => onSelect(event)}
      className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 cursor-pointer hover:shadow-md hover:border-purple-200 hover:-translate-y-1 transition-all duration-300 group"
    >
      {/* Color Banner */}
      <div className={`h-28 rounded-xl mb-4 flex items-center justify-center ${event.accessType === 'Private'
        ? 'bg-gradient-to-br from-purple-100 to-indigo-100'
        : event.isPaid
          ? 'bg-gradient-to-br from-amber-50 to-orange-100'
          : 'bg-gradient-to-br from-emerald-50 to-teal-100'
        }`}>
        <Calendar className={`h-10 w-10 opacity-30 ${event.accessType === 'Private' ? 'text-purple-600' : event.isPaid ? 'text-amber-600' : 'text-emerald-600'
          }`} />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide">
          {event.category}
        </span>
        {event.accessType === 'Private' && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
            <Lock size={9} /> PRIVATE
          </span>
        )}
        {event.isPaid && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
            <Tag size={9} /> ₱{event.price}
          </span>
        )}
        {!event.isPaid && event.accessType === 'Public' && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
            <CheckCircle2 size={9} /> FREE ADMISSION
          </span>
        )}
      </div>

      <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-purple-700 transition-colors">
        {event.title}
      </h4>
      <div className="mt-2 space-y-1">
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <MapPin size={11} className="text-slate-400" /> {event.barangay}
        </p>
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <Clock size={11} className="text-slate-400" /> {event.date} · {event.time}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{event.ticketTiers.length} tier{event.ticketTiers.length > 1 ? 's' : ''}</span>
        <span className="text-xs font-semibold text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          View Details <ChevronRight size={12} />
        </span>
      </div>
    </div>
  );
}

// ── Ticketing Drawer ──────────────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="w-96 bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Event Ticketing</p>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{event.title}</h2>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <MapPin size={11} /> {event.barangay} · {event.date}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition mt-1">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Tier Selector */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Tier</p>
            <div className="space-y-2">
              {event.ticketTiers.map((tier) => (
                <label key={tier} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedTier === tier ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <input type="radio" name="tier" checked={selectedTier === tier} onChange={() => setSelectedTier(tier)} className="accent-purple-600" />
                  <span className={`text-sm font-medium ${selectedTier === tier ? 'text-purple-700' : 'text-slate-700'}`}>{tier}</span>
                </label>
              ))}
            </div>
          </div>

          {/* FLOW 1: Private — Access Code Gate */}
          {event.accessType === 'Private' && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Shield size={12} /> Access Verification
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="Enter Access Code (e.g. VIP2026)"
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-mono tracking-widest outline-none transition-all ${accessCode && !codeMatches
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : codeMatches
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 focus:border-purple-400'
                    }`}
                />
                {codeMatches && (
                  <CheckCircle2 className="absolute right-3 top-3 text-emerald-500" size={18} />
                )}
              </div>
              {accessCode && !codeMatches && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">❌ Invalid access code. Please try again.</p>
              )}
              {codeMatches && (
                <p className="text-xs text-emerald-600 mt-1.5 font-medium">✅ Access code verified! You're on the list.</p>
              )}
            </div>
          )}

          {/* FLOW 2: Paid — Payment Method */}
          {event.isPaid && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <CreditCard size={12} /> Payment Method
              </p>
              <div className="space-y-2">
                {[
                  { id: 'gcash', label: 'Simulated GCash Transfer', icon: '💸' },
                  { id: 'gotyme', label: 'Simulated GoTyme Digital Bank Pay', icon: '🏦' },
                ].map((method) => (
                  <label key={method.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentMethod === method.id ? 'border-purple-400 bg-purple-50' : 'border-slate-200 hover:border-slate-300'
                    }`}>
                    <input type="radio" name="payment" checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-purple-600" />
                    <span className="text-base">{method.icon}</span>
                    <span className={`text-sm font-medium ${paymentMethod === method.id ? 'text-purple-700' : 'text-slate-700'}`}>{method.label}</span>
                  </label>
                ))}
              </div>

              {/* Price Summary */}
              <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Ticket ({selectedTier})</span>
                  <span>₱{event.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400 mb-3">
                  <span>Service Fee</span>
                  <span>₱0.00</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-purple-700">₱{event.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* FLOW 3: Free Public */}
          {!event.isPaid && event.accessType === 'Public' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={28} />
              <p className="text-sm font-semibold text-emerald-800">Free Admission</p>
              <p className="text-xs text-emerald-600 mt-1">No payment required. Claim your pass instantly!</p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-6 border-t border-slate-100">
          {event.accessType === 'Private' ? (
            <button
              disabled={!codeMatches}
              onClick={handleCheckout}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${codeMatches
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
              {codeMatches ? '🎟️ Confirm VIP Access' : '🔒 Enter Access Code to Unlock'}
            </button>
          ) : event.isPaid ? (
            <button onClick={handleCheckout} className="w-full py-3.5 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 active:scale-95 transition-all">
              💳 Pay ₱{event.price.toLocaleString()} · Confirm
            </button>
          ) : (
            <button onClick={handleCheckout} className="w-full py-3.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 active:scale-95 transition-all">
              🎟️ Claim Free Admission Pass
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Ticket Success Modal ──────────────────────────────────────────────────────
function TicketModal({ ticket, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition">
            <X size={14} />
          </button>
          <CheckCircle2 className="mx-auto mb-2" size={36} />
          <h2 className="text-lg font-bold">Ticket Confirmed!</h2>
          <p className="text-purple-200 text-xs mt-1">{ticket.event.title}</p>
        </div>

        {/* QR Code */}
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="bg-white border-2 border-dashed border-slate-200 p-4 rounded-2xl">
            <QrMockup />
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Confirmation ID</p>
            <p className="text-base font-mono font-bold text-slate-900 tracking-wider">{ticket.ticketId}</p>
          </div>

          <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Event</span>
              <span className="font-semibold text-slate-800 text-right max-w-[55%] leading-tight">{ticket.event.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tier</span>
              <span className="font-semibold text-slate-800">{ticket.tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-semibold text-slate-800">{ticket.event.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Venue</span>
              <span className="font-semibold text-slate-800">{ticket.event.barangay}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center">Present this QR code at the event entrance. Screenshot or save this confirmation.</p>

          <button onClick={onClose} className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition active:scale-95 shadow-lg shadow-purple-500/25">
            Done — Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────────────────────────────
// Settings are now handled by the imported UserSettings component.

// ── Main Attendee Dashboard ───────────────────────────────────────────────────
export default function AttendeeDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  // Load user from localStorage
  const savedUserStr = localStorage.getItem('user');
  const loggedInUser = savedUserStr ? JSON.parse(savedUserStr) : null;

  // Map backend PascalCase properties to camelCase, with fallbacks
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
    { id: 1, title: 'Welcome to VenU!', message: 'Explore local events in your area.', read: false, time: '2m ago' },
    { id: 2, title: 'Upcoming Event', message: 'Basketball League Inter-Barangay starts tomorrow.', read: false, time: '1h ago' }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));

  const navItems = [
    { id: 'dashboard', label: 'Discover', icon: LayoutDashboard },
    { id: 'mytickets', label: 'My Tickets', icon: Ticket },
    { id: 'map', label: 'Event Map', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
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
    <div className="flex min-h-screen bg-[#F9F8FC]">

      {/* ── Fixed Left Sidebar ─────────────────────────────────────────────── */}
      <aside className="w-64 bg-[#FFFFFF] border-r border-slate-200 h-screen fixed left-0 top-0 p-6 flex flex-col justify-between z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2 select-none px-2 mb-2">
            <img src={logo} alt="VenU Logo" className="h-8 w-auto drop-shadow-sm" />
            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500">VenU</span>
          </div>

          {/* User Chip */}
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-100 p-3 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow shrink-0">
              {currentUser.firstName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{currentUser.firstName}</p>
              <p className="text-xs text-purple-500 font-medium">Attendee</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-purple-50 text-purple-700 font-semibold border border-purple-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'
                    }`}
                >
                  <Icon size={18} className={isActive ? 'text-purple-600' : ''} />
                  <span>{label}</span>
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sign Out */}
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </aside>

      {/* ── Right Viewport Canvas ──────────────────────────────────────────── */}
      <main className="ml-64 flex-1 p-8 min-h-screen">

        {/* ── DASHBOARD VIEW ── */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Attendee Portal</p>
                <h1 className="text-3xl font-bold text-slate-900 mt-1">
                  Hey, <span className="text-[#A855F7]">{currentUser.firstName.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-sm text-slate-500 mt-1">Discover local events near {currentUser.barangay}.</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300 transition shadow-sm relative"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-fade-in">
                    <div className="flex items-center justify-between p-4 border-b border-slate-50">
                      <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs font-semibold text-purple-600 hover:text-purple-700">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500">No new notifications</div>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${notif.read ? 'opacity-60' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-semibold text-slate-800">{notif.title}</h4>
                              <span className="text-[10px] font-medium text-slate-400">{notif.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, categories, barangays..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-purple-400 transition shadow-sm"
              />
            </div>

            {/* Proximity Scope Label */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{scope}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Based on your registered location and preferences</p>
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full">
                {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {/* Event Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-24 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <MapPin className="mx-auto text-slate-300 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-slate-700">No Events Found</h3>
                <p className="text-sm text-slate-400 mt-2">Try searching a different keyword or check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((event) => (
                  <EventCard key={event.id} event={event} onSelect={setSelectedEvent} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MY TICKETS VIEW ── */}
        {activeTab === 'mytickets' && (
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Your Tickets</p>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">My Tickets</h1>
            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-12 text-center">
              <Ticket className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-slate-700">No Tickets Yet</h3>
              <p className="text-sm text-slate-400 mt-2">Claim or purchase your first ticket from Discover.</p>
              <button onClick={() => setActiveTab('dashboard')} className="mt-5 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition shadow-lg shadow-purple-500/20 active:scale-95">
                Browse Events
              </button>
            </div>
          </div>
        )}

        {/* ── MAP VIEW ── */}
        {activeTab === 'map' && (
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Explore</p>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Event Map</h1>
            <div className="bg-white border border-slate-100 shadow-sm rounded-3xl overflow-hidden relative z-0 p-2">
              <div className="h-[520px] w-full bg-slate-50 relative rounded-2xl overflow-hidden">
                <MapContainer center={[14.3296, 120.9367]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 10 }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  {mockEvents.map((event, i) => (
                    <Marker key={event.id} position={event.city === 'Imus' ? [14.4296, 120.9367] : [14.3296 + (i * 0.01), 120.9367 - (i * 0.01)]}>
                      <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
                        <div className="font-sans min-w-[160px] p-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{event.category}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 leading-tight mb-1">{event.title}</h4>
                          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock size={10}/> {event.date} · {event.time}</p>
                          <p className="text-xs font-semibold text-slate-700 mt-2 border-t border-slate-100 pt-2 flex items-center gap-1"><MapPin size={12} className="text-purple-500"/>{event.barangay}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS VIEW ── */}
        {activeTab === 'settings' && <UserSettings currentUser={currentUser} />}
      </main>

      {/* ── Ticketing Drawer ── */}
      {selectedEvent && (
        <TicketingDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSuccess={handleSuccess}
        />
      )}

      {/* ── Success Ticket Modal ── */}
      {confirmedTicket && (
        <TicketModal
          ticket={confirmedTicket}
          onClose={() => setConfirmedTicket(null)}
        />
      )}
    </div>
  );
}
