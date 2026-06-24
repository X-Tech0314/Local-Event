import React, { useState, useEffect, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { BarChart3, Users, Clock, AlertTriangle, CheckCircle, Search, ChevronLeft, MapPin, Shield, QrCode, X, XCircle } from 'lucide-react';

// ── Inline scanner modal — shown when "Scan QR Code" is clicked ──────────────
function InlineScannerModal({ onScan, onClose }) {
    useEffect(() => {
        const scannerId = 'hub-qr-reader';
        const timer = setTimeout(() => {
            if (!document.getElementById(scannerId)) return;
            const scanner = new Html5QrcodeScanner(
                scannerId,
                { fps: 10, qrbox: { width: 220, height: 220 } },
                false
            );
            scanner.render((text) => {
                scanner.clear().catch(() => {});
                onScan(text);
            }, () => {});
            return () => scanner.clear().catch(() => {});
        }, 100);
        return () => clearTimeout(timer);
    }, [onScan]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <QrCode size={20} className="text-purple-600" /> Scan Attendee QR
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div id="hub-qr-reader" className="w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800" />
                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
                    Point camera at the attendee's ticket QR code.
                </p>
            </div>
        </div>
    );
}

export default function EventAnalyticsHub({ eventId, onBack }) {

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [scanMsg, setScanMsg] = useState(null);

    useEffect(() => {
        if (!eventId) return;
        fetchAnalytics();
    }, [eventId, search]);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = new URL(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/analytics`);
            if (search) url.searchParams.append('search', search);

            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                if (res.status === 403) throw new Error("Access Denied: You do not have permission to view analytics for this event.");
                throw new Error("Failed to load analytics data.");
            }

            const json = await res.json();
            setData(json);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Inline QR scan handler — called by the scanner modal
    const handleInlineScan = useCallback(async (decodedText) => {
        setShowScanner(false);
        setScanMsg({ status: 'loading', text: 'Validating...' });
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/checkin/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ token: decodedText })
            });
            const d = await res.json();
            setScanMsg({
                status: res.ok ? 'success' : res.status === 409 ? 'warn' : 'error',
                text: `${d.attendeeName || ''} — ${d.message}`
            });
            if (res.ok) setTimeout(fetchAnalytics, 600); // refresh ledger
        } catch {
            setScanMsg({ status: 'error', text: 'Network error. Try again.' });
        }
        setTimeout(() => setScanMsg(null), 5000);
    }, [eventId]);

    if (loading && !data) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[500px]">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-6 flex flex-col items-center justify-center text-center">
                <AlertTriangle size={32} className="text-red-500 mb-3" />
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-1">Analytics Unavailable</h3>
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                <button onClick={onBack} className="mt-4 text-purple-600 font-bold hover:underline">Return to Events</button>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="animate-fade-in space-y-8 relative min-h-[calc(100vh-4rem)]">
            {/* Inline QR Scanner Modal */}
            {showScanner && (
                <InlineScannerModal
                    onScan={handleInlineScan}
                    onClose={() => setShowScanner(false)}
                />
            )}

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div>
                    <button onClick={onBack} className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold text-sm hover:underline mb-2">
                        <ChevronLeft size={16} /> Back to Events
                    </button>
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                        {data.eventTitle} <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-full">Hub</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-sm flex items-center gap-1">
                        <MapPin size={14} /> Analytics & Secure Attendee Ledger
                    </p>
                </div>
                {/* QR Scanner Button */}
                <button
                    onClick={() => { setScanMsg(null); setShowScanner(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-600/20"
                >
                    <QrCode size={16} /> Scan QR Code
                </button>
            </div>

            {/* Scan Result Banner */}
            {scanMsg && (
                <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border text-sm font-semibold animate-fade-in ${
                    scanMsg.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'
                    : scanMsg.status === 'warn' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300'
                    : scanMsg.status === 'loading' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300'
                }`}>
                    {scanMsg.status === 'success' ? <CheckCircle size={16} /> : scanMsg.status === 'warn' ? <AlertTriangle size={16} /> : <XCircle size={16} />}
                    {scanMsg.text}
                    <button onClick={() => setScanMsg(null)} className="ml-auto opacity-60 hover:opacity-100"><X size={14} /></button>
                </div>
            )}

            {/* Executive Summary Ribbon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Registered */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg text-purple-600 dark:text-purple-400">
                            <Users size={20} strokeWidth={2.5} />
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Registered</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">{data.totalRegistered}</span>
                        {data.maxCapacity > 0 && <span className="text-sm text-slate-500 font-medium">/ {data.maxCapacity} cap</span>}
                    </div>
                </div>

                {/* Checked In */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <CheckCircle size={20} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
                            {data.arrivalRatePercentage.toFixed(1)}% Arrival Rate
                        </span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Checked In</p>
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{data.checkedInCount}</span>
                </div>

                {/* Capacity Status */}
                <div className={`p-6 rounded-xl border shadow-sm relative overflow-hidden ${data.isOverCapacity ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg border ${data.isOverCapacity ? 'bg-red-100 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}>
                            <AlertTriangle size={20} strokeWidth={2.5} />
                        </div>
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${data.isOverCapacity ? 'text-red-500' : 'text-slate-400'}`}>Capacity Standing</p>
                    <span className={`text-2xl font-bold ${data.isOverCapacity ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                        {data.isOverCapacity ? 'Over Capacity Warning' : 'Safe Boundaries'}
                    </span>
                </div>
            </div>

            {/* Attendee Ledger */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col mt-8">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Secure Attendee Ledger <Shield size={16} className="text-emerald-500" />
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Data privacy mode active. Emails masked per R.A. 10173.</p>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search names, emails, tickets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Attendee Info</th>
                                <th className="px-6 py-4">Ticket Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Arrival Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {data.attendees.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        No attendees found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                data.attendees.map((a) => (
                                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                {a.attendeeName}
                                                {a.isVerified && (
                                                    <span className="inline-flex items-center justify-center text-purple-600 dark:text-purple-400" title="Verified Profile">
                                                        <CheckCircle size={14} className="fill-purple-500/10" strokeWidth={2.5} />
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500">{a.maskedEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold rounded">
                                                {a.ticketType || 'Standard'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {a.isPresent ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800/50">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Present
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-800/50">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                            {a.arrivalTime ? (
                                                <>
                                                    <Clock size={14} className="text-purple-500" />
                                                    {new Date(a.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </>
                                            ) : (
                                                <span className="text-slate-400 italic">--</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
