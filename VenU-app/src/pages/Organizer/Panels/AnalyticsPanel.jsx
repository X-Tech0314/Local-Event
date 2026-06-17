import React from 'react';
import { BarChart3, TrendingUp, ArrowUpRight, Percent, Download, Calendar } from 'lucide-react';

export default function AnalyticsPanel({ currentUser }) {
    return (
        <div className="animate-fade-in space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Analytics & Insights</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time performance tracking and conversion metrics.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded text-sm font-bold transition-all active:scale-95">
                        <Calendar size={16} /> Last 30 Days
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-700 dark:hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 px-6 py-3 rounded text-sm font-bold transition-all active:scale-95">
                        <Download size={16} /> Export Report
                    </button>
                </div>
            </div>

            {/* Pro Tracking Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Primary Card (Dark Mode Contrast) */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover: transition-all duration-300">
                    <div className="flex justify-between items-start relative z-10 mb-6">
                        <div className="p-3 bg-slate-100 dark:bg-slate-700 border border-purple-100 dark:border-purple-800 rounded text-emerald-400">
                            <TrendingUp size={24} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-white bg-emerald-500 px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">
                            <ArrowUpRight size={12} strokeWidth={3} /> +18.7% Spike
                        </span>
                    </div>

                    <div className="relative z-10">
                        <p className="text-[10px] font-semibold text-slate-400 mb-1">Gross Sales Volume</p>
                        <p className="text-5xl font-semibold text-slate-900 dark:text-white ">₱42,850</p>
                    </div>
                </div>

                {/* Secondary Cards */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover: transition-all duration-300">
                    <div className="flex justify-between items-start relative z-10 mb-6">
                        <div className="p-3 bg-slate-100 dark:bg-slate-700 border border-purple-100 dark:border-purple-800 rounded text-slate-800 dark:text-slate-200 ">
                            <Percent size={24} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-white bg-emerald-500 px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">
                            <ArrowUpRight size={12} strokeWidth={3} /> +4.3%
                        </span>
                    </div>

                    <div className="relative z-10">
                        <p className="text-[10px] font-semibold text-slate-400 mb-1">Ticket Conversion</p>
                        <p className="text-5xl font-semibold text-slate-900 dark:text-white ">64.2%</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover: transition-all duration-300">
                    <div className="flex justify-between items-start relative z-10 mb-6">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded text-blue-600 dark:text-blue-400">
                            <BarChart3 size={24} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-white bg-emerald-500 px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">
                            Steady Baseline
                        </span>
                    </div>

                    <div className="relative z-10">
                        <p className="text-[10px] font-semibold text-slate-400 mb-1">Page Engagements</p>
                        <p className="text-5xl font-semibold text-slate-900 dark:text-white ">18.4K</p>
                    </div>
                </div>

            </div>

            {/* Gradient Metrics Breakdown */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded border border-slate-200 dark:border-slate-800 ">
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-700 dark:bg-slate-300"></div> Traffic Channel Metrics
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Source distribution for event discovery</p>
                </div>

                <div className="space-y-6">
                    {[
                        { name: 'Direct Link Sharing', percentage: '45%', width: 'w-[45%]', color: 'bg-slate-700 dark:bg-slate-300' },
                        { name: 'Email Newsletters', percentage: '30%', width: 'w-[30%]', color: 'bg-blue-500' },
                        { name: 'Social Platforms', percentage: '25%', width: 'w-[25%]', color: 'bg-emerald-500' }
                    ].map((bar, i) => (
                        <div key={i} className="group cursor-default">
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className="text-slate-800 dark:text-slate-200 group-hover:text-slate-800 dark:text-slate-200 dark:group-hover:text-slate-500 transition-colors">{bar.name}</span>
                                <span className="text-slate-900 dark:text-white font-bold">{bar.percentage}</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                <div className={`h-full ${bar.color} rounded-full ${bar.width} transform origin-left group-hover:scale-y-110 transition-transform duration-300`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
