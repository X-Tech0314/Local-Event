import React from 'react';
import { Users, CalendarCheck, DollarSign, Clock, Check } from 'lucide-react';

export default function AdminDashboardHome({ pendingEvents, setActiveTab }) {
    return (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Users Card */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-none"><Users size={20} /></div>
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">+12%</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Users</h3>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">1,245</p>
                    </div>

                    {/* Active Events Card */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-none"><CalendarCheck size={20} /></div>
                            <span className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">LIVE</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Active Events</h3>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">42</p>
                    </div>

                    {/* Simulated Sales Card */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-none"><DollarSign size={20} /></div>
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">+4.5%</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Simulated Sales</h3>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">₱45,200</p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Platform Overview</h3>
                    <div className="h-48 flex items-end justify-between gap-4">
                        {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-purple-100 dark:bg-purple-900/40 rounded-none relative overflow-hidden" style={{ height: `${height}%` }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-purple-600 to-purple-400 dark:from-purple-500 dark:to-purple-300 rounded-none"></div>
                                </div>
                                <span className="text-xs font-bold text-slate-400">Day {i + 1}</span>
                            </div>
                        ))}
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
                        {pendingEvents.map(event => (
                            <div key={event.id} className="p-4 bg-white dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{event.name}</h4>
                                <p className="text-xs text-slate-500 mt-1">{event.organizer} • {event.date}</p>
                                <button
                                    onClick={() => setActiveTab('events')}
                                    className="w-full mt-3 text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 hover:text-purple-800 flex items-center gap-1"
                                >
                                    Review Now <Check size={12} />
                                </button>
                            </div>
                        ))}
                        {pendingEvents.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-sm font-medium">No events pending.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}