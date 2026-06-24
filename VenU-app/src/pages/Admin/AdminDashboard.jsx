import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CalendarCheck, Crown, LogOut, Moon, Sun, ShieldCheck, ShieldAlert, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import logo from "../../assets/venu-logo3-transparent.png";

// Import Panels
import AdminDashboardHome from './Panels/AdminDashboardHome';
import UserManagement from './Panels/UserManagement';
import EventApprovals from './Panels/EventApprovals';
import AdminManagement from './Panels/AdminManagement';
import IdentityApprovals from './Panels/IdentityApprovals';
import VenueImageApprovals from './Panels/VenueImageApprovals';
import VenueApprovals from './Panels/VenueApprovals';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { darkMode, toggleDarkMode } = useTheme();

    // Get real role from localStorage
    const savedUserStr = localStorage.getItem('user');
    const loggedInUser = savedUserStr ? JSON.parse(savedUserStr) : null;

    // Bulletproof role extraction
    const rawRole = loggedInUser?.Role || loggedInUser?.role || '';
    const cleanRole = String(rawRole).trim().toLowerCase();
    
    // Only allow actual admins
    const [role, setRole] = useState(
        (cleanRole === 'superadmin' || cleanRole === 'admin') ? cleanRole : 'unauthorized'
    );

    const [activeTab, setActiveTab] = useState('dashboard');
    const [pendingEvents, setPendingEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'superadmin'] },
        { id: 'users', label: 'User Management', icon: Users, roles: ['admin', 'superadmin'] },
        { id: 'identity', label: 'Identity Approvals', icon: ShieldCheck, roles: ['admin', 'superadmin'] },
        { id: 'events', label: 'Event Approvals', icon: CalendarCheck, roles: ['admin', 'superadmin'] },
        { id: 'venues', label: 'Venue Approvals', icon: Building, roles: ['admin', 'superadmin'] },
        { id: 'images', label: 'Image Moderation', icon: ShieldAlert, roles: ['admin', 'superadmin'] },
        { id: 'admins', label: 'Admin Management', icon: Crown, roles: ['superadmin'] },
    ];

    // Fetch Pending Events
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    useEffect(() => {
        let cancelled = false;
        const fetchEvents = async () => {
            setLoadingEvents(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/events/pending`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (!res.ok) throw new Error('Failed to fetch events');
                const data = await res.json();
                if (!cancelled) setPendingEvents(data.events || data || []);
            } catch (err) {
                console.error("Error fetching pending events:", err);
            } finally {
                if (!cancelled) setLoadingEvents(false);
            }
        };
        fetchEvents();
        return () => { cancelled = true; };
    }, []);

    // Handle Approve/Reject
    const handleEventAction = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/events/${id}/${action.toLowerCase()}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                setPendingEvents(pendingEvents.filter(e => e.id !== id));
            }
        } catch (err) {
            console.error(`Failed to ${action} event:`, err);
        }
    };

    if (role === 'unauthorized') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white flex-col gap-4">
                <ShieldAlert size={64} className="text-red-500" />
                <h1 className="text-3xl font-bold">403 Forbidden</h1>
                <p className="text-slate-400">Your account ({rawRole || 'No Role'}) does not have Admin privileges.</p>
                <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-purple-600 rounded font-bold hover:bg-purple-700">
                    Return to Login
                </button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-200 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 p-6 flex flex-col justify-between z-40 shadow-2xl">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-2 select-none px-2 mb-2">
                        <img src={logo} alt="VenU Logo" className="h-8 w-auto" />
                        <span className="text-xl font-bold text-slate-900 dark:text-white">VenU Admin</span>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded">
                        <div className="w-10 h-10 rounded-full bg-purple-700 dark:bg-purple-500 flex items-center justify-center font-medium text-white text-sm shrink-0">
                            {role === 'superadmin' ? <Crown size={18} /> : <Users size={18} />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight truncate">
                                {loggedInUser?.FirstName || 'Admin'} {loggedInUser?.LastName || ''}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">{role} Account</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {navItems.map(({ id, label, icon: Icon, roles }) => {
                            if (!roles.includes(role)) return null;
                            const isActive = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`w-full flex items-center gap-3 rounded-none px-4 py-3.5 text-sm font-bold transition-all ${isActive ? 'bg-purple-700 dark:bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-white/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
                                >
                                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-500'} />
                                    <span className="tracking-wide">{label}</span>
                                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-none text-xs font-bold text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent"
                >
                    <LogOut size={16} strokeWidth={2.5} /> Log Out
                </button>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
                {/* Topbar */}
                <div className="sticky top-0 z-30 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                    </h1>
                    <div className="flex items-center gap-4">
                        {/* Dark Mode Toggle Button Restored */}
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
                    {activeTab === 'dashboard' && <AdminDashboardHome pendingEvents={pendingEvents} loadingEvents={loadingEvents} setActiveTab={setActiveTab} />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'identity' && <IdentityApprovals />}
                    { activeTab === 'events' && <EventApprovals pendingEvents={pendingEvents} loadingEvents={loadingEvents} handleEventAction={handleEventAction} /> }
                    { activeTab === 'venues' && <VenueApprovals /> }
                    { activeTab === 'images' && <VenueImageApprovals /> }
                    {activeTab === 'admins' && role === 'superadmin' && <AdminManagement />}
                </div>
            </main>
        </div>
    );
}