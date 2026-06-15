import React from 'react';
import { Calendar, Plus, Search, Filter } from 'lucide-react';

export default function EventsPanel({ currentUser }) {
    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Organizer Dashboard</p>
                    <h1 className="text-3xl font-bold tracking-tight mt-1 text-slate-900">Events Management</h1>
                </div>
                <button className="bg-[#a855f7] hover:bg-[#9333ea] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95">
                    <Plus size={16} /> Create New Event
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Search events..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#a855f7] transition" />
                    </div>
                    <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm text-slate-500 hover:text-slate-800 transition w-full md:w-auto justify-center">
                        <Filter size={16} /> Filter Options
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                <th className="pb-3 pl-2">Event Name</th>
                                <th className="pb-3">Date</th>
                                <th className="pb-3">Location</th>
                                <th className="pb-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {[
                                { name: 'Summer Tech Summit', date: 'June 20, 2026', venue: 'Main Hall A', status: 'Active', color: 'text-emerald-600 bg-emerald-50' },
                                { name: 'Beach Yoga Session', date: 'June 22, 2026', venue: 'Bayfront Park', status: 'Draft', color: 'text-amber-600 bg-amber-50' },
                                { name: 'Jazz Night Showcase', date: 'June 24, 2026', venue: 'The Basement Lounge', status: 'Active', color: 'text-emerald-600 bg-emerald-50' }
                            ].map((evt, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition group cursor-pointer">
                                    <td className="py-4 pl-2 font-bold text-slate-800 group-hover:text-[#a855f7] transition">{evt.name}</td>
                                    <td className="py-4 text-slate-500 font-medium">{evt.date}</td>
                                    <td className="py-4 text-slate-500 font-medium">{evt.venue}</td>
                                    <td className="py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${evt.color}`}>
                                            {evt.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}