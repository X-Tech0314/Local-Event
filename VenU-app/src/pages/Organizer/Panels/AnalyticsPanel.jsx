import React from 'react';
import { BarChart3, TrendingUp, ArrowUpRight, Percent } from 'lucide-react';
export default function AnalyticsPanel({ currentUser }) {
    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mt-1 text-slate-900">Analytics Overview</h1>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket Conversion</p>
                        <p className="text-3xl font-black mt-2 text-slate-900">64.2%</p>
                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 mt-1"><ArrowUpRight size={12} /> +4.3% vs last month</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl text-[#a855f7] border border-purple-100"><Percent size={24} /></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Sales Volume</p>
                        <p className="text-3xl font-black mt-2 text-slate-900">$42,850</p>
                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 mt-1"><ArrowUpRight size={12} /> +18.7% target spike</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl text-[#a855f7] border border-purple-100"><TrendingUp size={24} /></div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Page Engagements</p>
                        <p className="text-3xl font-black mt-2 text-slate-900">18.4K</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">Steady retention baseline</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl text-[#a855f7] border border-purple-100"><BarChart3 size={24} /></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-semibold tracking-wide text-slate-500 uppercase mb-4">Traffic Channel Metrics</h3>
                <div className="space-y-4">
                    {[
                        { name: 'Direct Link Sharing', percentage: '45%', width: 'w-[45%]' },
                        { name: 'Email Newsletters', percentage: '30%', width: 'w-[30%]' },
                        { name: 'Social Platforms', percentage: '25%', width: 'w-[25%]' }
                    ].map((bar, i) => (
                        <div key={i}>
                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                <span className="text-slate-800">{bar.name}</span>
                                <span className="text-slate-500">{bar.percentage}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div className={`h-full bg-[#a855f7] rounded-full ${bar.width}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}