import React from 'react';
import { Users, Mail, CheckCircle2, Search, Filter, Download, Ticket, Sparkles } from 'lucide-react';

export default function AttendeesPanel({ currentUser }) {
    const attendees = [
        { name: 'Sarah Jenkins', email: 'sarah.j@example.com', ticket: 'VIP Pass', event: 'Summer Tech Summit', avatarColor: 'from-purple-500 to-indigo-600', time: '10:45 AM', checkedIn: true },
        { name: 'Michael Chang', email: 'm.chang@example.com', ticket: 'General Admission', event: 'Jazz Night Showcase', avatarColor: 'from-emerald-500 to-teal-600', time: '11:20 AM', checkedIn: true },
        { name: 'Emma Watson', email: 'emma@example.com', ticket: 'VIP Pass', event: 'Summer Tech Summit', avatarColor: 'from-amber-500 to-orange-500', time: '--:--', checkedIn: false },
        { name: 'David Rodriguez', email: 'david.r@example.com', ticket: 'Early Bird Pass', event: 'Startup Pitch Deck', avatarColor: 'from-blue-500 to-indigo-500', time: '09:15 AM', checkedIn: true },
    ];

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Attendees Hub</h1>
                    <p className="text-slate-500 font-medium mt-1">Monitor registrations and live check-in statuses.</p>
                </div>
                <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95">
                    <Download size={18} strokeWidth={2.5} /> Export Manifest
                </button>
            </div>
            
            {/* Premium Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Registered', count: '1,245', sub: '+12% this week', color: 'from-[#A855F7] to-[#9333EA]', icon: Users },
                    { label: 'Checked In', count: '892', sub: '71% arrival rate', color: 'from-blue-500 to-indigo-600', icon: CheckCircle2 },
                    { label: 'VIP Guests', count: '48', sub: 'All confirmed', color: 'from-emerald-500 to-teal-600', icon: Sparkles }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 shadow-sm p-6 rounded-3xl relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className={`absolute -right-6 -bottom-6 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`}></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                <p className="text-4xl font-black tracking-tight text-slate-900">{stat.count}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-[#A855F7]/10 group-hover:text-[#A855F7] transition-colors">
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        <p className={`text-xs font-bold mt-4 relative z-10 ${idx === 0 ? 'text-[#A855F7]' : idx === 1 ? 'text-blue-500' : 'text-emerald-500'}`}>
                            {stat.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* Main Attendee Registry */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                
                {/* Registry Command Bar */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Search by name, email, or ticket ID..." className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#A855F7] focus:ring-2 focus:ring-[#A855F7]/20 transition-all shadow-sm" />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm active:scale-95">
                            <Filter size={16} /> Filter by Event
                        </button>
                    </div>
                </div>

                {/* Registry List */}
                <div className="p-6 space-y-4">
                    {attendees.map((attendee, idx) => (
                        <div key={idx} className="flex flex-col lg:flex-row lg:items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 hover:border-[#A855F7]/30 hover:shadow-md transition-all gap-6 group">
                            
                            {/* User Identity */}
                            <div className="flex items-center gap-4 min-w-[250px]">
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${attendee.avatarColor} flex items-center justify-center text-white font-black text-lg shadow-md border-2 border-white`}>
                                    {attendee.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 leading-tight group-hover:text-[#A855F7] transition-colors">{attendee.name}</p>
                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-1"><Mail size={12} className="text-slate-400" /> {attendee.email}</p>
                                </div>
                            </div>

                            {/* Ticket Details */}
                            <div className="flex-1 lg:px-6 lg:border-x border-slate-100 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <Ticket size={14} className={attendee.ticket.includes('VIP') ? 'text-amber-500' : 'text-[#A855F7]'} />
                                    <p className={`text-xs font-black uppercase tracking-widest ${attendee.ticket.includes('VIP') ? 'text-amber-500' : 'text-[#A855F7]'}`}>
                                        {attendee.ticket}
                                    </p>
                                </div>
                                <p className="text-sm font-bold text-slate-700">{attendee.event}</p>
                            </div>

                            {/* Check-In Status */}
                            <div className="flex items-center justify-between lg:justify-end gap-6 min-w-[200px]">
                                <div className="text-left lg:text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Arrival Time</p>
                                    <p className="text-sm font-bold text-slate-900">{attendee.time}</p>
                                </div>
                                
                                {attendee.checkedIn ? (
                                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-xl">
                                        <CheckCircle2 size={18} strokeWidth={2.5} />
                                        <span className="text-xs font-black uppercase tracking-wider">Present</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-slate-50 text-slate-400 border border-slate-200 px-4 py-2 rounded-xl">
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div>
                                        <span className="text-xs font-black uppercase tracking-wider">Pending</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Pagination Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-500">
                    <p>Showing 4 of 1,245 attendees</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-white hover:text-slate-800 transition">Previous</button>
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-slate-300 text-slate-800 transition shadow-sm">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}