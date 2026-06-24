import React, { useState, useEffect, useCallback } from 'react';
import { Users, CalendarCheck, DollarSign, Clock, Check, AlertTriangle, XCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminDashboardHome({ pendingEvents, loadingEvents, setActiveTab }) {
    const [stats, setStats] = useState({ totalUsers: 0, activeEvents: 0, totalSales: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    const [authError, setAuthError] = useState(false);

    const [timeAlerts, setTimeAlerts] = useState([]);
    const [loadingAlerts, setLoadingAlerts] = useState(true);
    const [markingDone, setMarkingDone] = useState({});

    const fetchTimeAlerts = useCallback(async () => {
        try {
            setLoadingAlerts(true);
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/events?deleted=false`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return;

            const data = await res.json();
            const now = new Date();
            const alerts = [];

            for (const evt of data) {
                if (evt.status === 'Done' || evt.status === 'Deleted') continue;

                const start = new Date(evt.startDateTime);
                const end = evt.endDateTime ? new Date(evt.endDateTime) : null;
                const msTillStart = start - now;
                const hoursTillStart = msTillStart / (1000 * 60 * 60);

                // Event starting within 24 hours
                if (msTillStart > 0 && hoursTillStart <= 24) {
                    alerts.push({
                        id: evt.id,
                        name: evt.name,
                        startDateTime: evt.startDateTime,
                        endDateTime: evt.endDateTime,
                        status: evt.status,
                        type: 'nearing',
                        label: `Starts in ~${Math.round(hoursTillStart)}h`,
                    });
                }

                // Event that has ended (end time passed, or start time > 6h ago and no end time)
                if (end && end < now && evt.status === 'Published') {
                    const hoursAgo = (now - end) / (1000 * 60 * 60);
                    if (hoursAgo <= 72) {
                        alerts.push({
                            id: evt.id,
                            name: evt.name,
                            startDateTime: evt.startDateTime,
                            endDateTime: evt.endDateTime,
                            status: evt.status,
                            type: 'ended',
                            label: `Ended ~${Math.round(hoursAgo)}h ago`,
                        });
                    }
                } else if (!end && start < now && evt.status === 'Published') {
                    const hoursAgo = (now - start) / (1000 * 60 * 60);
                    if (hoursAgo >= 6 && hoursAgo <= 72) {
                        alerts.push({
                            id: evt.id,
                            name: evt.name,
                            startDateTime: evt.startDateTime,
                            status: evt.status,
                            type: 'ended',
                            label: `Started ~${Math.round(hoursAgo)}h ago (no end time)`,
                        });
                    }
                }
            }

            // Sort: ended first, then nearing
            alerts.sort((a, b) => (a.type === 'ended' ? -1 : 1));
            setTimeAlerts(alerts);
        } catch (err) {
            console.error("Failed to load event time alerts:", err);
        } finally {
            setLoadingAlerts(false);
        }
    }, []);

    const handleMarkDone = async (id, e) => {
        e.stopPropagation();
        setMarkingDone(prev => ({ ...prev, [id]: true }));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/events/${id}/done`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setTimeAlerts(prev => prev.filter(a => a.id !== id));
            }
        } catch (err) {
            console.error("Failed to mark event as done:", err);
        } finally {
            setMarkingDone(prev => ({ ...prev, [id]: false }));
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { setAuthError(true); setLoadingStats(false); return; }

                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });

                if (res.ok) {
                    const data = await res.json();
                    setStats({ totalUsers: data.totalUsers || 0, activeEvents: data.activeEvents || 0, totalSales: data.totalSales || 0 });
                    setAuthError(false);
                } else if (res.status === 401) {
                    setAuthError(true);
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
        fetchTimeAlerts();
    }, [fetchTimeAlerts]);

    return (
        <div className="animate-fade-in space-y-8">
            {authError && (
                <div className="p-4 bg-red-500/10 border border-red-500 text-red-500 text-xs font-bold uppercase tracking-wide">
                    Session identity verification failed. Please try logging out and logging back in.
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-none"><Users size={20} /></div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Users</h3>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                        {loadingStats ? '...' : authError ? '0' : stats.totalUsers.toLocaleString()}
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-none"><CalendarCheck size={20} /></div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Events</h3>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                        {loadingStats ? '...' : authError ? '0' : stats.activeEvents}
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-none"><DollarSign size={20} /></div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Ticket Sales</h3>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
                        {loadingStats ? '...' : authError ? '₱0' : `₱${stats.totalSales.toLocaleString()}`}
                    </p>
                </div>
            </div>

            {/* Bottom Grid: Time Alerts + Pending Approvals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Event Timeline Alerts (Left, 2/3 width) */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-none"><AlertTriangle size={16} /></div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Event Timeline Alerts</h3>
                            </div>
                            <button
                                onClick={() => setActiveTab('events')}
                                className="text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 hover:underline"
                            >
                                View All Events →
                            </button>
                        </div>

                        {loadingAlerts ? (
                            <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
                                <Loader2 size={18} className="animate-spin" />
                                <span className="text-sm">Checking event timelines...</span>
                            </div>
                        ) : timeAlerts.length === 0 ? (
                            <div className="text-center py-10">
                                <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No time-sensitive events right now.</p>
                                <p className="text-xs text-slate-400 mt-1">Events nearing or just ended will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {timeAlerts.map(alert => (
                                    <div
                                        key={alert.id}
                                        className={`flex items-center justify-between gap-4 p-4 border rounded-none ${
                                            alert.type === 'ended'
                                                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'
                                                : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3 min-w-0">
                                            {alert.type === 'ended'
                                                ? <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                                                : <Clock size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                            }
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{alert.name}</p>
                                                <p className={`text-xs font-semibold mt-0.5 ${alert.type === 'ended' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                    {alert.label}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {alert.startDateTime && new Date(alert.startDateTime).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    {alert.endDateTime && ` – ${new Date(alert.endDateTime).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
                                                </p>
                                            </div>
                                        </div>
                                        {alert.type === 'ended' && (
                                            <button
                                                onClick={(e) => handleMarkDone(alert.id, e)}
                                                disabled={markingDone[alert.id]}
                                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 rounded-none"
                                            >
                                                {markingDone[alert.id] ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                Mark Done
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Approvals (Right, 1/3 width) */}
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
        </div>
    );
}