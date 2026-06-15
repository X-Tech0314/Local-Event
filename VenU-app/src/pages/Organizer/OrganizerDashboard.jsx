import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, MapPin, Users, BarChart3, Settings, Plus, LogOut, Bell } from 'lucide-react';

// Panel File Imports
import MainDashboard from "./Panels/MainDashboard";
import EventsPanel from "./Panels/EventsPanel";
import VenuesPanel from "./Panels/VenuesPanel";
import AttendeesPanel from "./Panels/AttendeesPanel";
import AnalyticsPanel from "./Panels/AnalyticsPanel";
import SettingsPanel from "./Panels/SettingsPanel";
import CreateEventPanel from "./Panels/CreateEventPanel";
import logo from '../../assets/venu-logo3-transparent.png';

const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events',    label: 'Events',    icon: Calendar },
    { id: 'venues',    label: 'Venues',    icon: MapPin },
    { id: 'create-event', label: 'Create Event', icon: Plus },
    { id: 'attendees', label: 'Attendees', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings',  label: 'Settings',  icon: Settings },
];

export default function OrganizerDashboard() {
    const navigate = useNavigate();
    const [activePanel, setActivePanel] = useState('dashboard');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Welcome to VenU Organizer!', message: 'Start creating your first event today.', read: false, time: '2m ago' },
        { id: 2, title: 'Profile Setup', message: 'Please complete your organizer profile and verification.', read: false, time: '1h ago' }
    ]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));

    // Load user from localStorage
    const savedUserStr = localStorage.getItem('user');
    const loggedInUser = savedUserStr ? JSON.parse(savedUserStr) : null;

    // Map backend PascalCase properties to camelCase, with fallbacks
    const currentUser = {
        id: loggedInUser?.Id || loggedInUser?.id || '',
        email: loggedInUser?.Email || loggedInUser?.email || '',
        role: loggedInUser?.Role || loggedInUser?.role || 'Organizer',
        firstName: loggedInUser?.FirstName || loggedInUser?.firstName || 'Guest',
        lastName: loggedInUser?.LastName || loggedInUser?.lastName || 'User',
        contactNumber: loggedInUser?.ContactNumber || loggedInUser?.contactNumber || '',
        region: loggedInUser?.Region || loggedInUser?.region || '',
        province: loggedInUser?.Province || loggedInUser?.province || '',
        city: loggedInUser?.City || loggedInUser?.city || '',
        barangay: loggedInUser?.Barangay || loggedInUser?.barangay || '',
    };

    const renderPanel = () => {
        switch (activePanel) {
            case 'dashboard':  return <MainDashboard currentUser={currentUser} setActivePanel={setActivePanel} />;
            case 'events':     return <EventsPanel currentUser={currentUser} setActivePanel={setActivePanel} />;
            case 'venues':     return <VenuesPanel currentUser={currentUser} setActivePanel={setActivePanel} />;
            case 'attendees':  return <AttendeesPanel currentUser={currentUser} setActivePanel={setActivePanel} />;
            case 'analytics':  return <AnalyticsPanel currentUser={currentUser} setActivePanel={setActivePanel} />;
            case 'settings':   return <SettingsPanel currentUser={currentUser} setActivePanel={setActivePanel} />;
            case 'create-event': return <CreateEventPanel currentUser={currentUser} setActivePanel={setActivePanel} />;
            default:           return <MainDashboard currentUser={currentUser} setActivePanel={setActivePanel} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F9F8FC] font-sans">

            {/* Fixed Dark Sidebar */}
            <aside className="w-64 bg-slate-950 border-r border-slate-900 h-screen fixed left-0 top-0 p-6 flex flex-col justify-between z-40 shadow-2xl">
                <div className="flex flex-col gap-8">
                    {/* Brand */}
                    <div className="flex items-center gap-2 select-none px-2 mb-2">
                        <img src={logo} alt="VenU Logo" className="h-8 w-auto drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        <span className="text-xl font-black tracking-tight text-white drop-shadow-md">VenU</span>
                    </div>

                    {/* User Profile Overview */}
                    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl shadow-inner">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A855F7] to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_10px_rgba(168,85,247,0.5)] shrink-0 border border-white/10">
                            {currentUser.firstName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-white leading-tight truncate">{currentUser.firstName} {currentUser.lastName}</p>
                            <p className="text-[10px] font-black text-[#A855F7] uppercase tracking-widest mt-1">Organizer Node</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                        {navigationItems.map(({ id, label, icon: Icon }) => {
                            const isActive = activePanel === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setActivePanel(id)}
                                    className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 ${
                                        isActive 
                                            ? 'bg-gradient-to-r from-[#A855F7] to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-white/10' 
                                            : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
                                    }`}
                                >
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                                    <span className="tracking-wide">{label}</span>
                                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_5px_rgba(255,255,255,0.8)]" />}
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
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent transition-all"
                    >
                        <LogOut size={16} strokeWidth={2.5} /> Log Out
                    </button>
                </div>
            </aside>

            {/* ── Main Content Canvas ── */}
            <main className="flex-1 bg-[#F9F8FC] min-h-screen overflow-y-auto ml-64">
                {/* Top Bar */}
                <div className="sticky top-0 z-30 bg-[#F9F8FC]/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-end">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-3 rounded-2xl bg-white border transition-all duration-300 ${showNotifications ? 'border-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.3)] text-[#A855F7]' : 'border-slate-100 shadow-sm text-slate-400 hover:border-[#A855F7]/50 hover:text-[#A855F7]'}`}
                            >
                                <Bell size={18} className={unreadCount > 0 ? 'animate-[wiggle_2s_ease-in-out_infinite]' : ''} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A855F7] opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A855F7] border-2 border-white"></span>
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute top-full right-0 mt-4 w-[360px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100/50 z-50 overflow-hidden animate-fade-in origin-top-right">
                                    <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-black text-slate-900 tracking-tight">Notifications</h3>
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
                                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
                                        <button onClick={() => { setShowNotifications(false); setActivePanel('settings'); }} className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-[#A855F7] transition-colors">
                                            View Communication Hub
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Dynamic Panel */}
                <div className="p-8">
                    {renderPanel()}
                </div>
            </main>
        </div>
    );
}