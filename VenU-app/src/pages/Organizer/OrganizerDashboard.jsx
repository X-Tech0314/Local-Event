import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, MapPin, Users, BarChart3, Settings, Plus, LogOut, Bell, Moon, Sun, QrCode } from 'lucide-react';
import { useTheme } from '../../ThemeContext.jsx';

// Panel File Imports
import MainDashboard from "./Panels/MainDashboard";
import EventsPanel from "./Panels/EventsPanel";
import VenuesPanel from "./Panels/VenuesPanel";
import AttendeesPanel from "./Panels/AttendeesPanel";
import AnalyticsPanel from "./Panels/AnalyticsPanel";
import SettingsPanel from "./Panels/SettingsPanel";
import CreateEventPanel from "./Panels/CreateEventPanel";
import QRScannerPanel from "./Panels/QRScannerPanel";
import logo from '../../assets/venu-logo3-transparent.png';

const navigationItems = [
    { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
    { id: 'events',      label: 'Events',      icon: Calendar },
    { id: 'venues',      label: 'Venues',      icon: MapPin },
    { id: 'create-event', label: 'Create Event', icon: Plus },
    { id: 'attendees',   label: 'Attendees',   icon: Users },
    { id: 'analytics',   label: 'Analytics',   icon: BarChart3 },
    { id: 'qr-scanner',  label: 'QR Scanner',  icon: QrCode },
    { id: 'settings',    label: 'Settings',    icon: Settings },
];

export default function OrganizerDashboard() {
    const navigate = useNavigate();
    const { darkMode, toggleDarkMode } = useTheme();
    const [activePanel, setActivePanel] = useState('dashboard');
    const [editEvent, setEditEvent] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('vnu_organizer_notifications');
        if (saved) return JSON.parse(saved);
        return [
            { id: 1, title: 'Welcome to VenU Organizer!', message: 'Start creating your first event today.', read: false, time: 'Just now' },
            { id: 2, title: 'Profile Setup', message: 'Please complete your organizer profile and verification.', read: false, time: '1h ago' }
        ];
    });

    React.useEffect(() => {
        localStorage.setItem('vnu_organizer_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (title, message) => {
        setNotifications(prev => [
            { id: Date.now(), title, message, read: false, time: 'Just now' },
            ...prev
        ]);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
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
        isVerified: loggedInUser?.IsVerified || loggedInUser?.isVerified || false,
        profileImage: loggedInUser?.ProfilePicture || loggedInUser?.profilePicture || null,
        name: `${loggedInUser?.FirstName || loggedInUser?.firstName || 'Guest'} ${loggedInUser?.LastName || loggedInUser?.lastName || 'User'}`.trim()
    };

    const renderPanel = () => {
        switch (activePanel) {
            case 'dashboard':  return <MainDashboard currentUser={currentUser} setActivePanel={setActivePanel} />;
            case 'events':     return <EventsPanel key={Date.now()} currentUser={currentUser} setActivePanel={setActivePanel} setEditEvent={setEditEvent} />;
            case 'venues':     return <VenuesPanel currentUser={currentUser} setActivePanel={setActivePanel} />;
            case 'attendees':  return <AttendeesPanel currentUser={currentUser} setActivePanel={setActivePanel} />;
            case 'analytics':  return <AnalyticsPanel currentUser={currentUser} setActivePanel={setActivePanel} />;
            case 'settings':   return <SettingsPanel currentUser={currentUser} setActivePanel={setActivePanel} />;
            case 'create-event': return <CreateEventPanel currentUser={currentUser} setActivePanel={setActivePanel} editEvent={editEvent} setEditEvent={setEditEvent} addNotification={addNotification} />;
            case 'qr-scanner':   return <QRScannerPanel currentUser={currentUser} setActivePanel={setActivePanel} />;
            default:             return <MainDashboard currentUser={currentUser} setActivePanel={setActivePanel} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-200 dark:bg-slate-900 font-sans">

            {/* Fixed Dark Sidebar */}
            <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 p-6 flex flex-col justify-between z-40">
                <div className="flex flex-col gap-8">
                    {/* Brand */}
                    <div className="flex items-center gap-2 select-none px-2 mb-2">
                        <img src={logo} alt="VenU Logo" className="h-8 w-auto" />
                        <span className="text-xl font-bold text-slate-900 dark:text-white">VenU</span>
                    </div>

                    {/* User Profile Overview */}
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded">
                        <img src={currentUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 dark:border-purple-900" />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span className="truncate">{currentUser.name}</span>
                                {currentUser.isVerified && (
                                    <span title="Verified Organizer" className="shrink-0 text-blue-500 bg-blue-50 dark:bg-blue-900/30 rounded-full p-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </p>
                            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Organizer</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-2">
                        {navigationItems.map(({ id, label, icon: Icon }) => {
                            const isActive = activePanel === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => {
                                        setEditEvent(null);
                                        setActivePanel(id);
                                    }}
                                    className={`w-full flex items-center gap-3 rounded px-4 py-3 text-sm font-medium ${
                                        isActive 
                                            ? 'bg-purple-700 dark:bg-purple-500 text-white' 
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
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
                        className="w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <LogOut size={16} strokeWidth={2.5} /> Log Out
                    </button>
                </div>
            </aside>

            {/* ── Main Content Canvas ── */}
            <main className="flex-1 bg-slate-200 dark:bg-slate-900 min-h-screen overflow-y-auto ml-64">
                {/* Top Bar */}
                <div className="sticky top-0 z-30 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-end">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`relative p-2.5 rounded bg-slate-50 dark:bg-slate-800 border ${showNotifications ? 'border-slate-400 text-slate-800 dark:text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                            >
                                <Bell size={18} className={unreadCount > 0 ? 'animate-pulse text-purple-700 dark:text-purple-400' : ''} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded bg-purple-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded h-2.5 w-2.5 bg-purple-700 dark:bg-purple-500 border-2 border-white dark:border-slate-800"></span>
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
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

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-white"
                            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
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