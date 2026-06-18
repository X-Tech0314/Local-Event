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

function MapUpdater({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 17, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

const cityCoordinates = {
  'Imus': [14.4296, 120.9367],
  'Dasmariñas': [14.3296, 120.9367],
  'Bacoor': [14.4613, 120.9416],
  'Silang': [14.2269, 120.9740],
  'General Trias': [14.3855, 120.8805],
  'Tagaytay': [14.1008, 120.9453],
  'Makati': [14.5547, 121.0244],
  'Manila': [14.5995, 120.9842],
  'Default': [14.5995, 120.9842]
};

function getCoordinatesForEvent(event, index = 0) {
  if (event.latitude && event.longitude) {
    return [event.latitude, event.longitude];
  }
  const baseCoords = cityCoordinates[event.city] || cityCoordinates['Default'];
  // Add slight offset so markers don't overlap perfectly if they have the same city
  return [baseCoords[0] + (index * 0.002), baseCoords[1] - (index * 0.002)];
}

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

function getRecommendedEvents(events, user) {
  // Sort events so that those in the same barangay come first, then same city, then others
  const sortedEvents = [...events].sort((a, b) => {
    if (a.barangay === user.barangay && b.barangay !== user.barangay) return -1;
    if (a.barangay !== user.barangay && b.barangay === user.barangay) return 1;
    if (a.city === user.city && b.city !== user.city) return -1;
    if (a.city !== user.city && b.city === user.city) return 1;
    return 0;
  });

  return { events: sortedEvents, scope: 'All Events' };
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

function EventCard({ event, onSelect, onLocationClick, isSaved, onToggleSave }) {
  const eventId = event.eventId || event.id;
  return (
    <div
      onClick={() => onSelect(event)}
      className="bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 group cursor-pointer relative flex flex-col h-full"
    >
      <div className="h-56 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 z-10"></div>
        <img src={event.image} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform" />

        <button 
          onClick={(e) => onToggleSave && onToggleSave(e, eventId)}
          className={`absolute top-4 right-4 z-20 p-2 rounded-full backdrop-blur-md border ${isSaved ? 'bg-purple-500/90 border-purple-400 text-white shadow-md' : 'bg-black/40 hover:bg-black/60 border-white/20 text-white/70 hover:text-white'} transition-all`}
        >
          <Heart size={16} fill={isSaved ? "currentColor" : "none"} strokeWidth={isSaved ? 0 : 2} />
        </button>

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
          <p
            className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-3 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              if (onLocationClick) onLocationClick(event);
            }}
          >
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
  const [accountNumber, setAccountNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const tiers = event.ticketTiers && event.ticketTiers.length > 0 ? event.ticketTiers : ["General Admission"];
  const [selectedTier, setSelectedTier] = useState(tiers[0]);
  const codeMatches = accessCode === event.verificationCode;
  const markerRef = React.useRef(null);
  const isPaid = event.isPaid || event.price > 0;

  const isPaymentValid = () => {
    if (!isPaid) return true;
    if (paymentMethod === 'gcash') return accountNumber.length === 11;
    if (paymentMethod === 'gotyme') return accountNumber.length >= 8;
    return false;
  };

  React.useEffect(() => {
    // Small timeout to ensure map has initialized
    const timer = setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCheckout = () => {
    onSuccess({
      event,
      ticketId: generateTicketId(),
      tier: selectedTier,
      quantity,
      paymentMethod: isPaid ? paymentMethod : null,
      accountNumber: isPaid ? accountNumber : null,
      claimedAt: new Date().toLocaleString()
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end overflow-hidden">
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[event.latitude || 14.5995, event.longitude || 120.9842]} 
          zoom={16} 
          scrollWheelZoom={false} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
          <Marker position={[event.latitude || 14.5995, event.longitude || 120.9842]} ref={markerRef}>
            <Popup className="rounded-none overflow-hidden shadow-2xl border-0 p-0 m-0 w-[300px]" autoPan={false}>
              <div className="font-sans">
                <div className="h-28 w-full bg-slate-200 relative">
                  <img src={event.image} className="w-full h-full object-cover" alt="Venue" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <span className="absolute bottom-2 left-2 text-[10px] font-black uppercase tracking-widest text-white px-2 py-1 bg-purple-700 dark:bg-purple-500/80 rounded-none backdrop-blur-sm">
                    {event.category}
                  </span>
                </div>
                <div className="p-4 relative">
                  {event.isRecommended && (
                    <span className="absolute -top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 shadow-sm rounded-none">
                      <Star size={8} className="inline mr-1" />
                      Recommended
                    </span>
                  )}
                  <h4 className="font-black text-slate-900 leading-tight mb-1 text-base">{event.title}</h4>
                  <p className="text-[11px] font-medium text-slate-500 mb-3 flex items-start gap-1 leading-tight"><MapPin size={10} className="shrink-0 mt-0.5" /> <span className="line-clamp-2">{event.address}</span></p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                    <div className="bg-slate-50 p-2 border border-slate-100 text-center">
                      <span className="block font-black text-slate-400 uppercase tracking-widest text-[8px] mb-0.5">Capacity</span>
                      <span className="font-bold text-slate-800">{event.capacity || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-50 p-2 border border-slate-100 text-center">
                      <span className="block font-black text-slate-400 uppercase tracking-widest text-[8px] mb-0.5">Rating</span>
                      <span className="font-bold text-slate-800 flex items-center justify-center gap-0.5"><Star size={10} className="text-amber-500" fill="currentColor" /> {event.averageRating || 4.5} ({event.totalReviews || 12})</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[10px] text-slate-600 mb-0 bg-slate-50 p-2 border border-slate-100">
                    <p><span className="font-black text-slate-800">Contact:</span> {event.contactPerson || 'N/A'}</p>
                    <p><span className="font-black text-slate-800">Details:</span> {event.contactDetails || 'N/A'}</p>
                    <p><span className="font-black text-slate-800">Floors:</span> {event.numberOfFloors || 1}</p>
                    <p><span className="font-black text-slate-800">Area:</span> {event.floorArea ? `${event.floorArea} sq m` : 'N/A'}</p>
                    <p><span className="font-black text-slate-800">Ceiling:</span> {event.ceilingHeight ? `${event.ceilingHeight} m` : 'N/A'}</p>
                    <p><span className="font-black text-slate-800">Best for:</span> <span className="capitalize">{event.recommendedFor || 'All events'}</span></p>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity cursor-pointer" onClick={onClose} />
      </div>

      <div className="w-full max-w-md bg-slate-50 dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-slide-in-right relative z-10 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between relative z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <div className="pr-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest mb-3 border border-white/10">
              <Ticket size={10} /> Secure Checkout
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{event.title}</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
              <MapPin size={14} /> {event.barangay || event.address}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 shadow-sm">
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 custom-scrollbar">
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Select Admission Tier</p>
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shadow-inner">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors active:scale-95 border border-slate-200 dark:border-slate-600"
                >-</button>
                <span className="text-sm font-black text-slate-900 dark:text-white w-4 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-700 text-slate-800 dark:text-white font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors active:scale-95 border border-slate-200 dark:border-slate-600"
                >+</button>
              </div>
            </div>
            <div className="space-y-3">
              {tiers.map((tier) => (
                <label 
                  key={tier} 
                  onClick={() => setSelectedTier(tier)}
                  className={`flex items-center justify-between p-4 rounded-none border-2 cursor-pointer ${selectedTier === tier ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTier === tier ? 'border-purple-500' : 'border-slate-300 dark:border-slate-600'}`}>
                      {selectedTier === tier && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                    </div>
                    <span className={`text-sm font-bold ${selectedTier === tier ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{tier}</span>
                  </div>
                  {isPaid && <span className={`font-black ${selectedTier === tier ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'}`}>₱{event.price}</span>}
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

          {isPaid && (
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

              <div className="bg-white dark:bg-slate-800 p-5 border border-slate-200 dark:border-slate-700 mb-6 relative overflow-hidden group shadow-sm">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="flex gap-4 items-center mb-5">
                  <div className="w-20 h-20 bg-white border-2 border-slate-200 p-1 shrink-0 shadow-sm relative group-hover:border-purple-300 transition-colors">
                    {/* Mock QR Code using CSS grid patterns */}
                    <div className="w-full h-full bg-[linear-gradient(45deg,#0f172a_25%,transparent_25%,transparent_75%,#0f172a_75%,#0f172a),linear-gradient(45deg,#0f172a_25%,transparent_25%,transparent_75%,#0f172a_75%,#0f172a)]" style={{backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px'}}></div>
                    <div className="absolute inset-2 border-[3px] border-white pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent flex items-end justify-center pb-1 pointer-events-none">
                      <span className="text-[6px] font-black uppercase text-slate-800 tracking-widest bg-white/50 px-1 backdrop-blur-sm">Scan to Pay</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pay To</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase leading-none mb-1 line-clamp-1">{event.contactPerson || event.organizer?.firstName || 'VenU Organizer'}</p>
                    <p className="text-xs font-medium text-purple-600 dark:text-purple-400 tracking-wider font-mono bg-purple-50 dark:bg-purple-900/20 inline-block px-1.5 py-0.5 rounded-sm border border-purple-100 dark:border-purple-500/20">{paymentMethod === 'gcash' ? '0912 345 6789' : '102 391 848 102'}</p>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                    Your {paymentMethod === 'gcash' ? 'GCash Number' : 'Account Number'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={paymentMethod === 'gcash' ? "09XXXXXXXXX" : "Account Number"}
                    maxLength={paymentMethod === 'gcash' ? 11 : 20}
                    className={`w-full bg-slate-50 dark:bg-slate-900 border-2 px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-purple-500/20 outline-none text-slate-900 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 ${
                      accountNumber.length > 0 && !isPaymentValid()
                        ? 'border-red-400 focus:border-red-500 text-red-600'
                        : accountNumber.length > 0 && isPaymentValid()
                          ? 'border-emerald-500 focus:border-emerald-600'
                          : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'
                    }`}
                  />
                  {accountNumber.length > 0 && !isPaymentValid() && (
                    <p className="text-[10px] text-red-500 mt-1.5 font-semibold">Invalid {paymentMethod === 'gcash' ? 'GCash number (11 digits required)' : 'account number'}</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-none p-5 shadow-inner">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">
                  <span>Price per ticket</span>
                  <span>₱{event.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">
                  <span>Quantity</span>
                  <span>x {quantity}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-4 font-medium border-t border-dashed border-slate-200 dark:border-slate-700 pt-3">
                  <span>Subtotal</span>
                  <span>₱{(event.price * quantity).toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Due</span>
                  <span className="text-2xl font-black text-purple-700 dark:text-purple-400">₱{(event.price * quantity).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {!isPaid && event.accessType === 'Public' && (
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
          ) : isPaid ? (
            <button 
              disabled={!isPaymentValid()}
              onClick={handleCheckout} 
              className={`w-full py-4 rounded-none text-sm font-bold uppercase tracking-wide flex justify-center items-center gap-2 transition-colors ${
                isPaymentValid()
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm active:scale-95' 
                  : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
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
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
}

function TicketModal({ ticket, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm animate-scale-in relative group perspective-1000">
        <div className="bg-white rounded-none overflow-hidden shadow-2xl relative z-10 transform transition-transform preserve-3d">
          <div className="relative p-6 pb-12 text-white text-center overflow-hidden">
            <div className="absolute inset-0 bg-slate-900">
              {ticket.event?.image && (
                <img src={ticket.event.image} alt="Event Banner" className="w-full h-full object-cover opacity-70 mix-blend-overlay" />
              )}
              <div className={`absolute inset-0 bg-gradient-to-br ${ticket.event?.color || 'from-purple-500 to-indigo-600'} opacity-80 mix-blend-multiply`}></div>
            </div>
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 shadow-inner">
                <CheckCircle2 size={12} /> Confirmed
              </span>
              <h2 className="text-2xl font-black leading-tight drop-shadow-md">{ticket.event.title}</h2>
            </div>
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

  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [reviewingEvent, setReviewingEvent] = useState(null);
  const [selectedWalletCategory, setSelectedWalletCategory] = useState('All');
  const [otherCategoryQuery, setOtherCategoryQuery] = useState('');
  const [liveEvents, setLiveEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [mapCenter, setMapCenter] = useState(null);
  
  const [savedEvents, setSavedEvents] = useState(() => {
    const saved = localStorage.getItem('vnu_user_saved_events');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [walletView, setWalletView] = useState('upcoming');

  React.useEffect(() => {
    localStorage.setItem('vnu_user_saved_events', JSON.stringify(savedEvents));
  }, [savedEvents]);

  const toggleSaveEvent = (e, eventId) => {
    e.stopPropagation();
    setSavedEvents(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };
  
  const [mapEvents, setMapEvents] = useState([]);
  const [mapSearchQuery, setMapSearchQuery] = useState('');

  const dynamicGeocode = async (address) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    } catch (e) {
      console.error("Dynamic geocoding failed:", e);
    }
    return null;
  };

  useEffect(() => {
    const fetchMapEvents = async () => {
      try {
        const response = await fetch('http://localhost:5150/api/Locations/explore');
        if (response.ok) {
          const data = await response.json();
          
          const processedEvents = await Promise.all(data.map(async (event, index) => {
             if (!event.latitude || event.latitude === 0 || !event.longitude || event.longitude === 0) {
                // Throttle requests slightly based on index to avoid 429 Too Many Requests
                await new Promise(r => setTimeout(r, index * 600));
                
                const coords = await dynamicGeocode(event.address);
                if (coords) {
                   event.latitude = coords.lat;
                   event.longitude = coords.lon;
                   event.isRecommended = true; 
                } else {
                   const baseCoords = cityCoordinates[currentUser.city] || cityCoordinates['Default'];
                   event.latitude = baseCoords[0] + (index * 0.002);
                   event.longitude = baseCoords[1] - (index * 0.002);
                   event.isRecommended = true;
                }
             }
             return event;
          }));
          
          setMapEvents(processedEvents);
        }
      } catch (err) {
        console.error("Failed to fetch map events:", err);
      }
    };
    fetchMapEvents();
  }, [currentUser.city]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5150/api/Events/published');
        if (response.ok) {
          const data = await response.json();
          const transformed = data.map(e => ({
            id: e.id,
            title: e.title,
            category: e.category,
            barangay: e.barangay,
            city: e.city,
            date: new Date(e.startDateTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            time: new Date(e.startDateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            accessType: e.accessType,
            verificationCode: e.verificationCode,
            isPaid: e.requiresTicket && e.ticketTiers.some(t => t.price > 0),
            price: e.ticketTiers.length > 0 ? Math.min(...e.ticketTiers.map(t => t.price)) : 0,
            ticketTiers: e.ticketTiers.length > 0 ? e.ticketTiers.map(t => t.tierName) : ["General Admission"],
            image: e.bannerUrl || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
            color: "from-purple-500 to-indigo-600"
          }));
          setLiveEvents(transformed.length > 0 ? transformed : mockEvents);
        } else {
          setLiveEvents(mockEvents);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setLiveEvents(mockEvents);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const [tickets, setTickets] = useState(() => {
    const savedTickets = localStorage.getItem('vnu_user_tickets');
    return savedTickets ? JSON.parse(savedTickets) : [];
  });


  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('vnu_user_notifications');
    if (saved) return JSON.parse(saved);
    return [{ id: Date.now(), title: 'Welcome to VenU!', message: 'Explore local premium events in your area.', read: false, time: 'Just now' }];
  });

  React.useEffect(() => {
    localStorage.setItem('vnu_user_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title, message) => {
    setNotifications(prev => [
      { id: Date.now(), title, message, read: false, time: 'Just now' },
      ...prev
    ]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));

  const navItems = [
    { id: 'dashboard', label: 'Discovery', icon: LayoutDashboard },
    { id: 'mytickets', label: 'Ticket Wallet', icon: Ticket },
    { id: 'map', label: 'Global Radar', icon: MapPin },
    { id: 'settings', label: 'Configuration', icon: Settings },
  ];

  const { events: recommended, scope } = getRecommendedEvents(liveEvents.length > 0 ? liveEvents : mockEvents, currentUser);

  const filtered = recommended.filter((e) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      e.title.toLowerCase().includes(searchLower) ||
      e.category.toLowerCase().includes(searchLower) ||
      (e.barangay && e.barangay.toLowerCase().includes(searchLower)) ||
      (e.city && e.city.toLowerCase().includes(searchLower)) ||
      (e.venueName && e.venueName.toLowerCase().includes(searchLower)) ||
      (e.verificationCode && e.verificationCode.toLowerCase() === searchLower);
      
    if (showSavedOnly) {
      return matchesSearch && savedEvents.includes(e.eventId || e.id);
    }
    return matchesSearch;
  });

  const filteredTickets = tickets.filter((t) => {
    if (selectedWalletCategory === 'All') return true;

    const eventCat = (t.event.category || '').toLowerCase();
    const filterCat = selectedWalletCategory.toLowerCase();

    if (filterCat.includes('tech') && (eventCat.includes('tech') || eventCat.includes('innov'))) return true;
    if (filterCat.includes('music') && (eventCat.includes('music') || eventCat.includes('concert'))) return true;
    if (filterCat.includes('sport') && (eventCat.includes('sport') || eventCat.includes('athletic'))) return true;
    if (filterCat.includes('business') && (eventCat.includes('business') || eventCat.includes('corp'))) return true;
    if (filterCat.includes('birthday') && eventCat.includes('birthday')) return true;
    if (filterCat.includes('wedding') && eventCat.includes('wedding')) return true;

    if (filterCat === 'others') {
      if (!eventCat.includes('tech') && !eventCat.includes('innov') && 
          !eventCat.includes('music') && !eventCat.includes('concert') &&
          !eventCat.includes('sport') && !eventCat.includes('athletic') &&
          !eventCat.includes('business') && !eventCat.includes('corp') &&
          !eventCat.includes('birthday') && !eventCat.includes('wedding')) {
          
        if (otherCategoryQuery.trim() !== '') {
          return eventCat.includes(otherCategoryQuery.toLowerCase().trim());
        }
        return true;
      }
    }

    return false;
  });

  const mockPastTickets = React.useMemo(() => [
    {
      ticketId: 'VNU-PAST-001',
      tier: 'VIP Pass',
      event: {
        eventId: 'past-1',
        title: 'VenU Beta Launch Party',
        date: 'December 10, 2025',
        time: '8:00 PM',
        barangay: 'BGC, Taguig',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
        category: 'Music & Concerts'
      }
    }
  ], []);

  const groupedTickets = React.useMemo(() => {
    const map = new Map();
    filteredTickets.forEach(t => {
      // Group strictly by title to prevent duplicates from mismatched local storage data structures
      const key = (t.event.title || 'Unknown Event').trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, { event: t.event, tickets: [] });
      }
      map.get(key).tickets.push(t);
    });
    return Array.from(map.values());
  }, [filteredTickets]);

  const handleSuccess = (newTicket) => {
    setSelectedEvent(null);
    const updatedTickets = [newTicket, ...tickets];
    setTickets(updatedTickets);
    localStorage.setItem('vnu_user_tickets', JSON.stringify(updatedTickets));
    setConfirmedTicket(newTicket);

    const qty = newTicket.quantity || 1;
    addNotification('🎫 Ticket Confirmed', `Successfully purchased ${qty} pass${qty > 1 ? 'es' : ''} for ${newTicket.event.title}.`);
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

  const handleLocationClick = (event, index = 0) => {
    const coords = getCoordinatesForEvent(event, index);
    setMapCenter(coords);
    setActiveTab('map');
  };

  return (
    <div className="flex min-h-screen bg-slate-200 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">

      {/* ── Fixed Premium Dark Sidebar ──────────────────────────────────────────── */}
      <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 p-6 flex flex-col justify-between z-40 shadow-2xl">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2 select-none px-2 mb-2">
            <img src={logo} alt="VenU Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">VenU</span>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-none shadow-inner">
            <div className="w-10 h-10 rounded-full bg-purple-700 dark:bg-purple-500 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_10px_rgba(168,85,247,0.5)] shrink-0 border border-white/10">
              {currentUser.firstName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">{currentUser.firstName}</p>
              <p className="text-[10px] font-black text-purple-700 dark:text-purple-500 uppercase tracking-widest mt-1">Explorer Node</p>
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
                        <div key={notif.id} className={`p-5 border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 cursor-pointer relative group ${notif.read ? 'opacity-60' : ''}`}>
                          {!notif.read && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-700 dark:bg-purple-500 rounded-r-md"></div>
                          )}
                          <div className="flex justify-between items-start mb-1.5 pl-2">
                            <h4 className={`text-sm font-black ${notif.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>{notif.title}</h4>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{notif.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-medium pl-2">{notif.message}</p>
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
                    <p className="text-xs text-purple-700 dark:text-purple-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-2 justify-center md:justify-start">
                      <SparklesIcon /> Explore Events
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                      Find your next <span className="text-purple-700 dark:text-purple-400">experience.</span>
                    </h1>
                  </div>

                  <div className="w-full md:w-[450px] relative group">
                    <div className="relative bg-slate-50 dark:bg-slate-700/50 backdrop-blur-md border border-slate-200 dark:border-slate-600 rounded-none p-2 flex items-center shadow-lg">
                      <div className="p-3 text-slate-400 dark:text-slate-500">
                        <Search size={20} strokeWidth={2.5} />
                      </div>
                      <input
                        id="global-search-input"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search events, venues, access codes..."
                        className="w-full bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-sm outline-none px-2 pr-4"
                      />
                      <button 
                        onClick={() => {
                          const input = document.getElementById('global-search-input');
                          if (input) input.focus();
                        }}
                        className="bg-white text-slate-900 px-4 py-2.5 rounded-none text-xs font-black uppercase tracking-widest hover:bg-slate-100 shadow-sm"
                      >
                        Scan
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 px-2 gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-700 dark:bg-purple-500 animate-pulse"></div> {scope}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowSavedOnly(!showSavedOnly)}
                    className={`text-xs font-bold uppercase tracking-wide px-4 py-2 flex items-center gap-2 transition-all ${
                      showSavedOnly 
                        ? 'bg-purple-600 text-white shadow-sm' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Heart size={14} fill={showSavedOnly ? "currentColor" : "none"} /> Saved Favorites
                  </button>
                  <span className="text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 px-4 py-2 rounded-full shadow-sm">
                    {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-800/50 group-hover:bg-purple-50/30"></div>
                  <div className="relative z-10">
                    <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-500">
                      <Search size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No events found</h3>
                    <p className="text-sm font-medium text-slate-500 mt-2 max-w-sm mx-auto">No events match your current query. Try adjusting your filters.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filtered.map((event, index) => (
                    <EventCard 
                      key={event.eventId || event.id} 
                      event={event} 
                      onSelect={setSelectedEvent} 
                      onLocationClick={() => handleLocationClick(event, index)}
                      isSaved={savedEvents.includes(event.eventId || event.id)}
                      onToggleSave={toggleSaveEvent}
                    />
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
                
                <div className="flex justify-center mt-6">
                  <div className="bg-slate-100 dark:bg-slate-800 p-1 flex items-center shadow-sm">
                    <button
                      onClick={() => setWalletView('upcoming')}
                      className={`px-6 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${walletView === 'upcoming' ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                      Upcoming Passes
                    </button>
                    <button
                      onClick={() => setWalletView('past')}
                      className={`px-6 py-2 text-sm font-bold uppercase tracking-wide transition-colors ${walletView === 'past' ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                      Past Event History
                    </button>
                  </div>
                </div>
              </div>

              {walletView === 'upcoming' ? (
                <>
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
                            {type.name === 'Others' && isSelected ? (
                              <input
                                autoFocus
                                type="text"
                                value={otherCategoryQuery}
                                onChange={(e) => setOtherCategoryQuery(e.target.value)}
                                placeholder="Type category..."
                                className="bg-transparent text-white placeholder:text-purple-200 outline-none w-full min-w-[100px]"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="truncate">{type.name}</span>
                            )}
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
                  {groupedTickets.map((group) => {
                    const t = group.tickets[0]; // Representative event
                    const count = group.tickets.length;
                    return (
                    <div
                      key={group.event.eventId || group.event.title}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none overflow-hidden relative group hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                    >
                      <div className="p-5 flex gap-4">
                        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700 overflow-visible relative">
                          <img src={t.event.image} alt="" className="w-full h-full object-cover shadow-sm" />
                          {count > 1 && (
                            <span className="absolute -top-3 -right-3 bg-purple-600 text-white font-black text-[10px] w-6 h-6 flex items-center justify-center rounded-full shadow-md ring-2 ring-slate-50 dark:ring-slate-800 z-10 animate-bounce-in">
                              {count}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-black text-slate-900 dark:text-white mt-1 truncate text-base leading-tight">
                            {t.event.title}
                          </h3>
                          <div className="mt-2 space-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <p className="flex items-center gap-1.5"><Calendar size={12} /> {t.event.date} @ {t.event.time}</p>
                            <p
                              className="flex items-center gap-1.5 truncate cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLocationClick(t.event);
                              }}
                            >
                              <MapPin size={12} /> {t.event.barangay || t.event.address}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
                        {group.tickets.map(ticket => (
                          <div key={ticket.ticketId} className="px-5 py-3 flex items-center justify-between hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-colors">
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-black tracking-widest text-purple-600 dark:text-purple-400 uppercase bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 border border-purple-100 dark:border-purple-800/50 self-start rounded-none">
                                {ticket.tier}
                              </span>
                              <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-300 tracking-wider">
                                {ticket.ticketId}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                title="View Full Digital Pass"
                                onClick={() => setConfirmedTicket(ticket)}
                                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-none"
                              >
                                <Eye size={14} strokeWidth={2.5} />
                              </button>
                              <button
                                title="Download Ticket Image (.png)"
                                onClick={(e) => handleDownloadTicket(ticket, e)}
                                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-none"
                              >
                                <Download size={14} strokeWidth={2.5} />
                              </button>
                              <button
                                title="Void / Delete Pass"
                                onClick={(e) => handleDeleteTicket(ticket.ticketId, ticket.event.title, e)}
                                className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-none"
                              >
                                <Trash2 size={14} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )})}
                </div>
              )}
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {mockPastTickets.map((t) => (
                  <div
                    key={t.ticketId}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none overflow-hidden flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <div className="p-5 flex gap-4 grayscale hover:grayscale-0 transition-all">
                      <div className="w-20 h-20 bg-slate-200 dark:bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                        <img src={t.event.image} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <CheckCircle2 size={24} className="text-white/80" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase bg-slate-200 dark:bg-slate-900/50 px-2 py-0.5 border border-slate-300 dark:border-slate-700">
                          {t.tier}
                        </span>
                        <h3 className="font-black text-slate-900 dark:text-white mt-1 truncate text-base leading-tight">
                          {t.event.title}
                        </h3>
                        <div className="mt-2 space-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <p className="flex items-center gap-1.5"><Calendar size={12} /> {t.event.date}</p>
                          <p className="flex items-center gap-1.5"><MapPin size={12} /> {t.event.barangay}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900 px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-slate-500 dark:text-slate-400 tracking-wider">
                        {t.ticketId}
                      </span>
                      <button
                        onClick={() => {
                          setReviewingEvent(t.event);
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-widest shadow-sm rounded-none flex items-center gap-2 transition-colors"
                      >
                        <Star size={14} fill="currentColor" /> Leave Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="animate-fade-in flex flex-col md:flex-row h-[85vh] gap-6 max-w-full">
              
              {/* Left Column: List & Search */}
              <div className="w-full md:w-[380px] flex flex-col bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden relative z-10 shrink-0">
                <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                      <MapPin size={24} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Locations</h1>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search locations or events..."
                      value={mapSearchQuery}
                      onChange={(e) => setMapSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:outline-none focus:border-purple-500 transition-colors shadow-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100/50 dark:bg-slate-900/50 p-4 space-y-3">
                  {mapEvents
                    .filter(e => e.title.toLowerCase().includes(mapSearchQuery.toLowerCase()) || e.address.toLowerCase().includes(mapSearchQuery.toLowerCase()) || e.venueName.toLowerCase().includes(mapSearchQuery.toLowerCase()))
                    .map((event) => (
                    <div 
                      key={event.eventId} 
                      onClick={() => setMapCenter([event.latitude, event.longitude])}
                      className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-purple-500 hover:shadow-md transition-all group"
                    >
                      <h4 className="font-black text-slate-900 dark:text-white leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{event.title}</h4>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2 flex items-start gap-1.5 leading-snug">
                        <MapPin size={12} className="shrink-0 mt-0.5 text-purple-500" /> 
                        <span className="line-clamp-2">{event.venueName} - {event.address}</span>
                      </p>
                    </div>
                  ))}
                  {mapEvents.length === 0 && (
                    <div className="text-center py-10 opacity-60">
                      <MapPin size={32} className="mx-auto mb-2 text-slate-400" />
                      <p className="text-sm font-bold text-slate-500">No events found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: MapContainer */}
              <div className="flex-1 relative border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden bg-slate-200 dark:bg-slate-800 min-h-[400px]">
                <div className="h-full w-full relative z-10">
                  <MapContainer center={mapCenter || cityCoordinates['Default']} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                    <MapUpdater center={mapCenter} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    {mapEvents.map((event, i) => (
                      <Marker key={event.eventId} position={[event.latitude, event.longitude]}>
                        <Popup className="rounded-none overflow-hidden shadow-2xl border-0 p-0 m-0 w-[300px]">
                          <div className="font-sans">
                            <div className="h-28 w-full bg-slate-200 relative">
                              <img src={event.image} className="w-full h-full object-cover" alt="Venue" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                              <span className="absolute bottom-2 left-2 text-[10px] font-black uppercase tracking-widest text-white px-2 py-1 bg-purple-700 dark:bg-purple-500/80 rounded-none backdrop-blur-sm">
                                {event.category}
                              </span>
                            </div>
                            <div className="p-4 relative">
                              {event.isRecommended && (
                                <span className="absolute -top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 shadow-sm rounded-none">
                                  <Star size={8} className="inline mr-1" />
                                  Recommended
                                </span>
                              )}
                              <h4 className="font-black text-slate-900 leading-tight mb-1 text-base">{event.title}</h4>
                              <p className="text-[11px] font-medium text-slate-500 mb-3 flex items-start gap-1 leading-tight"><MapPin size={10} className="shrink-0 mt-0.5" /> <span className="line-clamp-2">{event.address}</span></p>

                              <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                                <div className="bg-slate-50 p-2 border border-slate-100 text-center">
                                  <span className="block font-black text-slate-400 uppercase tracking-widest text-[8px] mb-0.5">Capacity</span>
                                  <span className="font-bold text-slate-800">{event.capacity || 'N/A'}</span>
                                </div>
                                <div className="bg-slate-50 p-2 border border-slate-100 text-center">
                                  <span className="block font-black text-slate-400 uppercase tracking-widest text-[8px] mb-0.5">Rating</span>
                                  <span className="font-bold text-slate-800 flex items-center justify-center gap-0.5"><Star size={10} className="text-amber-500" fill="currentColor" /> {event.averageRating} ({event.totalReviews})</span>
                                </div>
                              </div>

                              <div className="space-y-1 text-[10px] text-slate-600 mb-4 bg-slate-50 p-2 border border-slate-100">
                                <p><span className="font-black text-slate-800">Contact:</span> {event.contactPerson || 'N/A'}</p>
                                <p><span className="font-black text-slate-800">Details:</span> {event.contactDetails || 'N/A'}</p>
                                <p><span className="font-black text-slate-800">Floors:</span> {event.numberOfFloors || 1}</p>
                                <p><span className="font-black text-slate-800">Area:</span> {event.floorArea ? `${event.floorArea} sq m` : 'N/A'}</p>
                                <p><span className="font-black text-slate-800">Ceiling:</span> {event.ceilingHeight ? `${event.ceilingHeight} m` : 'N/A'}</p>
                                <p><span className="font-black text-slate-800">Best for:</span> <span className="capitalize">{event.recommendedFor || 'All events'}</span></p>
                              </div>

                              <button onClick={() => setSelectedEvent(event)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs py-2 uppercase tracking-widest transition-colors shadow-sm">
                                Buy Tickets
                              </button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
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
      {reviewingEvent && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-none w-full max-w-md shadow-2xl overflow-hidden animate-scale-in border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-5 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="text-amber-400" fill="currentColor" size={20} /> Leave a Review
              </h3>
              <button onClick={() => setReviewingEvent(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">How was your experience at</p>
              <p className="text-base font-black text-slate-900 dark:text-white mb-6 leading-tight">{reviewingEvent.title}?</p>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} className="text-slate-300 hover:text-amber-400 transition-colors focus:outline-none focus:text-amber-400">
                    <Star size={36} />
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Detailed Feedback</label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500 transition-colors min-h-[100px]" 
                  placeholder="Tell us what you loved about the event..."
                ></textarea>
              </div>

              <button 
                onClick={() => {
                  setReviewingEvent(null);
                  addNotification("⭐ Review Submitted", `Thank you for reviewing ${reviewingEvent.title}!`);
                }}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-black uppercase tracking-widest text-sm py-3.5 rounded-none shadow-md transition-all active:scale-95"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}