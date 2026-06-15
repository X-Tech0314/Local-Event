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
    { id: 'attendees', label: 'Attendees', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings',  label: 'Settings',  icon: Settings },
    { id: 'create-event', label: 'Create Event', icon: Plus },
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
            case 'dashboard':  return <MainDashboard currentUser={currentUser} />;
            case 'events':     return <EventsPanel currentUser={currentUser} />;
            case 'venues':     return <VenuesPanel currentUser={currentUser} />;
            case 'attendees':  return <AttendeesPanel currentUser={currentUser} />;
            case 'analytics':  return <AnalyticsPanel currentUser={currentUser} />;
            case 'settings':   return <SettingsPanel currentUser={currentUser} />;
            case 'create-event': return <CreateEventPanel currentUser={currentUser} />;
            default:           return <MainDashboard currentUser={currentUser} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F9F8FC] font-sans">

            {/* ── Sidebar ── */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-6 sticky top-0 h-screen shrink-0 shadow-sm z-40">
                <div className="flex flex-col gap-6">
                    {/* Logo */}
                    <div className="flex items-center gap-2 select-none px-2 mb-2">
                        <img src={logo} alt="VenU Logo" className="h-8 w-auto drop-shadow-sm" />
                        <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500">VenU</span>
                    </div>

                    {/* User Profile Chip */}
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20 shrink-0">
                            {currentUser.firstName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 leading-tight truncate w-32">{currentUser.firstName} {currentUser.lastName.charAt(0)}.</p>
                            <p className="text-xs font-medium text-slate-500">{currentUser.role}</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1">
                        {navigationItems.map(({ id, label, icon: Icon }) => {
                            const isActive = activePanel === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setActivePanel(id)}
                                    className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-purple-50 text-purple-700 font-bold border border-purple-100'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                    }`}
                                >
                                    <Icon size={18} className={isActive ? 'text-purple-400' : ''} />
                                    <span>{label}</span>
                                    {isActive && (
                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Actions */}
                <div className="space-y-3">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all"
                    >
                        <LogOut size={15} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main Content Canvas ── */}
            <main className="flex-1 bg-[#F9F8FC] min-h-screen overflow-y-auto">
                {/* Top Bar */}
                <div className="sticky top-0 z-30 bg-[#F9F8FC]/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-end">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2.5 rounded-xl bg-white border border-slate-200 hover:border-purple-200 hover:shadow-sm text-slate-400 hover:text-purple-600 transition"
                            >
                                <Bell size={16} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
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
                </div>

                {/* Dynamic Panel */}
                <div className="p-8">
                    {renderPanel()}
                </div>
            </main>
        </div>
    );
}