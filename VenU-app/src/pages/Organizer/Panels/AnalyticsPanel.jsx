import React from 'react';
import { BarChart3, TrendingUp, ArrowUpRight, Percent, Download, Calendar } from 'lucide-react';

export default function AnalyticsPanel({ currentUser }) {
    return (
        <div className="animate-fade-in space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Analytics & Insights</h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time performance tracking and conversion metrics.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm active:scale-95">
                        <Calendar size={16} /> Last 30 Days
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-500/30 active:scale-95">
                        <Download size={16} /> Export Report
                    </button>
                </div>
            </div>
            
            {/* Pro Tracking Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Primary Card (Dark Mode Contrast) */}
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-[40px] group-hover:opacity-100 opacity-50 transition-opacity duration-500"></div>
                    
                    <div className="flex justify-between items-start relative z-10 mb-6">
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                            <TrendingUp size={24} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                            <ArrowUpRight size={12} strokeWidth={3} /> +18.7% Spike
                        </span>
                    </div>
                    
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Sales Volume</p>
                        <p className="text-5xl font-black text-white tracking-tight">$42,850</p>
                    </div>
                </div>

                {/* Secondary Cards */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-500/5 rounded-full blur-[40px] group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
                    
                    <div className="flex justify-between items-start relative z-10 mb-6">
                        <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl text-[#A855F7]">
                            <Percent size={24} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                            <ArrowUpRight size={12} strokeWidth={3} /> +4.3%
                        </span>
                    </div>
                    
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Conversion</p>
                        <p className="text-5xl font-black text-slate-900 tracking-tight">64.2%</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/5 rounded-full blur-[40px] group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
                    
                    <div className="flex justify-between items-start relative z-10 mb-6">
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-500">
                            <BarChart3 size={24} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                            Steady Baseline
                        </span>
                    </div>
                    
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Page Engagements</p>
                        <p className="text-5xl font-black text-slate-900 tracking-tight">18.4K</p>
                    </div>
                </div>

            </div>

            {/* Gradient Metrics Breakdown */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <div className="mb-8">
                    <h3 className="text-sm font-black tracking-widest text-slate-800 uppercase flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#A855F7]"></div> Traffic Channel Metrics
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-1">Source distribution for event discovery</p>
                </div>

                <div className="space-y-6">
                    {[
                        { name: 'Direct Link Sharing', percentage: '45%', width: 'w-[45%]', color: 'from-[#A855F7] to-[#9333EA]' },
                        { name: 'Email Newsletters', percentage: '30%', width: 'w-[30%]', color: 'from-blue-500 to-indigo-500' },
                        { name: 'Social Platforms', percentage: '25%', width: 'w-[25%]', color: 'from-emerald-400 to-teal-500' }
                    ].map((bar, i) => (
                        <div key={i} className="group cursor-default">
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className="text-slate-800 group-hover:text-[#A855F7] transition-colors">{bar.name}</span>
                                <span className="text-slate-900 font-black">{bar.percentage}</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                                <div className={`h-full bg-gradient-to-r ${bar.color} rounded-full ${bar.width} transform origin-left group-hover:scale-y-110 transition-transform duration-300 shadow-sm`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}