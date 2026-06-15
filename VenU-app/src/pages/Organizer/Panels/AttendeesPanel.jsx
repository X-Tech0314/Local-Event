import React from 'react';
import { Users, Mail, CheckCircle2, Search } from 'lucide-react';

export default function AttendeesPanel({ currentUser }) {
    return (
        <>
            <div className="mb-8">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Organizer Dashboard</p>
                <h1 className="text-3xl font-bold tracking-tight mt-1 text-slate-900">Attendees</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Total Registered', count: '1,245', sub: '+12% this week' },
                    { label: 'Checked In', count: '892', sub: '71% arrival rate' },
                    { label: 'VIP Guests', count: '48', sub: 'All confirmed' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 shadow-sm p-5 rounded-2xl hover:border-purple-200 transition">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-2xl font-black mt-2 text-slate-900">{stat.count}</p>
                        <p className="text-xs font-medium text-[#a855f7] mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative max-w-sm mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Search by name or email..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#a855f7] transition" />
                </div>

                <div className="space-y-3">
                    {[
                        { name: 'Sarah Jenkins', email: 'sarah.j@example.com', ticket: 'VIP Pass', event: 'Summer Tech Summit' },
                        { name: 'Michael Chang', email: 'm.chang@example.com', ticket: 'General Admission', event: 'Jazz Night Showcase' },
                        { name: 'Emma Watson', email: 'emma@example.com', ticket: 'VIP Pass', event: 'Summer Tech Summit' }
                    ].map((attendee, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-purple-200 transition gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-[#a855f7] font-bold text-sm border border-purple-200">
                                    {attendee.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-800">{attendee.name}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Mail size={12} /> {attendee.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-6">
                                <div className="text-left sm:text-right">
                                    <p className="text-xs font-bold text-slate-700">{attendee.ticket}</p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{attendee.event}</p>
                                </div>
                                <div className="text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                                    <CheckCircle2 size={16} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}