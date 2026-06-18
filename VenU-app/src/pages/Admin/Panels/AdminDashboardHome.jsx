import React, { useState, useEffect } from 'react';
import { Users, CalendarCheck, DollarSign, Clock, Check } from 'lucide-react';

export default function AdminDashboardHome({ pendingEvents, loadingEvents, setActiveTab }) {
    const [stats, setStats] = useState({ totalUsers: 0, activeEvents: 0, totalSales: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');

                // If token isn't found locally, do not hit the server endpoint
                if (!token) {
                    setAuthError(true);
                    setLoadingStats(false);
                    return;
                }

                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        totalUsers: data.totalUsers || 0,
                        activeEvents: data.activeEvents || 0,
                        totalSales: data.totalSales || 0,
                    });
                    setAuthError(false);
                } else if (res.status === 401) {
                    console.warn("Session expired or unauthorized credentials.");
                    setAuthError(true);
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {authError && (
                    <div className="p-4 bg-red-500/10 border border-red-500 text-red-500 text-xs font-bold uppercase tracking-wide">
                        Session identity verification failed. Please try logging out and logging back in.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Users Card */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-none"><Users size={20} /></div>
                        </div>
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Users</h3>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                            {loadingStats ? '...' : authError ? '0' : stats.totalUsers.toLocaleString()}
                        </p>
                    </div>

                    {/* Active Events Card */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-none"><CalendarCheck size={20} /></div>
                        </div>
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Events</h3>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                            {loadingStats ? '...' : authError ? '0' : stats.activeEvents}
                        </p>
                    </div>

                    {/* Simulated Sales Card */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-none"><DollarSign size={20} /></div>
                        </div>
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Simulated Sales</h3>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                            {loadingStats ? '...' : authError ? '₱0' : `₱${stats.totalSales.toLocaleString()}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Pending Approvals List (Right Side) */}
            <div className="lg:col-span-1">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-none"><Clock size={16} /></div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Pending Approvals</h3>
                    </div>
                    <div className="space-y-4">
                        {loadingEvents ? (
                            <div className="text-center py-8 text-slate-400 text-sm font-medium">Loading events...</div>
                        ) : pendingEvents.length > 0 ? (
                            pendingEvents.map(event => (
                                <div key={event.id} className="p-4 bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-700">
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{event.name || event.title}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{event.organizer} • {event.date}</p>
                                    <button
                                        onClick={() => setActiveTab('events')}
                                        className="w-full mt-3 text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 hover:text-purple-800 flex items-center gap-1"
                                    >
                                        Review Now <Check size={12} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm font-medium">No events pending.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}