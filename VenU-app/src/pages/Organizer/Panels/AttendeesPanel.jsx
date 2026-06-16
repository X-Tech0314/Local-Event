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
 <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Attendees Hub</h1>
 <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Monitor registrations and live check-in statuses.</p>
 </div>
 <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-6 py-3 rounded font-bold transition-all flex items-center gap-2 active:scale-95">
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
 <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-6 rounded relative overflow-hidden group hover: transition-all duration-300">
 <div className="flex justify-between items-start relative z-10">
 <div>
 <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-2">{stat.label}</p>
 <p className="text-4xl font-semibold text-slate-900 dark:text-white">{stat.count}</p>
 </div>
 <div className="p-3 rounded bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-purple-900/30 group-hover:text-slate-800 dark:text-slate-200 dark:group-hover:text-slate-500 transition-colors">
 <stat.icon size={24} strokeWidth={2.5} />
 </div>
 </div>
 <p className={`text-xs font-bold mt-4 relative z-10 ${idx === 0 ? 'text-slate-800 dark:text-slate-200 ' : idx === 1 ? 'text-slate-700 dark:text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>
 {stat.sub}
 </p>
 </div>
 ))}
 </div>

 {/* Main Attendee Registry */}
 <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
 
 {/* Registry Command Bar */}
 <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-800/50">
 <div className="relative w-full md:w-[400px]">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
 <input type="text" placeholder="Search by name, email, or ticket ID..." className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded pl-12 pr-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-700 dark:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all " />
 </div>
 <div className="flex gap-3 w-full md:w-auto">
 <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95">
 <Filter size={16} /> Filter by Event
 </button>
 </div>
 </div>

 {/* Registry List */}
 <div className="p-6 space-y-4">
 {attendees.map((attendee, idx) => (
 <div key={idx} className="flex flex-col lg:flex-row lg:items-center justify-between bg-white dark:bg-slate-800 p-5 rounded border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-600 hover: transition-all gap-6 group">
 
 {/* User Identity */}
 <div className="flex items-center gap-4 min-w-[250px]">
 <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${attendee.avatarColor} flex items-center justify-center text-white font-semibold text-lg border-2 border-white dark:border-slate-900`}>
 {attendee.name.split(' ').map(n => n[0]).join('')}
 </div>
 <div>
 <p className="font-semibold text-slate-900 dark:text-white leading-tight group-hover:text-slate-800 dark:text-slate-200 dark:group-hover:text-slate-500 transition-colors">{attendee.name}</p>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1"><Mail size={12} className="text-slate-400" /> {attendee.email}</p>
 </div>
 </div>

 {/* Ticket Details */}
 <div className="flex-1 lg:px-6 lg:border-x border-slate-200 dark:border-slate-700 flex flex-col justify-center">
 <div className="flex items-center gap-2 mb-1">
 <Ticket size={14} className={attendee.ticket.includes('VIP') ? 'text-slate-700 dark:text-slate-300' : 'text-slate-800 dark:text-slate-200 '} />
 <p className={`text-xs font-semibold ${attendee.ticket.includes('VIP') ? 'text-slate-700 dark:text-slate-300' : 'text-slate-800 dark:text-slate-200 '}`}>
 {attendee.ticket}
 </p>
 </div>
 <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{attendee.event}</p>
 </div>

 {/* Check-In Status */}
 <div className="flex items-center justify-between lg:justify-end gap-6 min-w-[200px]">
 <div className="text-left lg:text-right">
 <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Arrival Time</p>
 <p className="text-sm font-bold text-slate-900 dark:text-white">{attendee.time}</p>
 </div>
 
 {attendee.checkedIn ? (
 <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded">
 <CheckCircle2 size={18} strokeWidth={2.5} />
 <span className="text-xs font-semibold tracking-wider">Present</span>
 </div>
 ) : (
 <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded">
 <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
 <span className="text-xs font-semibold tracking-wider">Pending</span>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>
 
 {/* Pagination Footer */}
 <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
 <p>Showing 4 of 1,245 attendees</p>
 <div className="flex gap-2">
 <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition">Previous</button>
 <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-white transition ">Next</button>
 </div>
 </div>
 </div>
 </div>
 );
}
