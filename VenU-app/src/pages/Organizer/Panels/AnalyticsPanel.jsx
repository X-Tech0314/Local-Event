import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, ArrowUpRight, Percent, Download, Calendar, Users, Ticket, Eye, AlertCircle, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Quick preset options
const DATE_PRESETS = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 90 Days' },
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'ytd', label: 'Year to Date' },
    { key: 'all', label: 'All Time' },
];

// Convert the selected range into actual start/end ISO strings for the API
const computeRange = (range, customStart, customEnd) => {
    const now = new Date();
    let end = new Date(now);
    end.setHours(23, 59, 59, 999);
    let start = new Date(now);
    start.setHours(0, 0, 0, 0);

    switch (range) {
        case '7d':
            start.setDate(end.getDate() - 6);
            break;
        case '30d':
            start.setDate(end.getDate() - 29);
            break;
        case '90d':
            start.setDate(end.getDate() - 89);
            break;
        case 'this_month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'last_month':
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end.setFullYear(now.getFullYear());
            end.setMonth(now.getMonth() - 1);
            end.setDate(new Date(now.getFullYear(), now.getMonth(), 0).getDate());
            end.setHours(23, 59, 59, 999);
            break;
        case 'ytd':
            start = new Date(now.getFullYear(), 0, 1);
            break;
        case 'all':
            start = new Date(2000, 0, 1);
            break;
        case 'custom':
            if (customStart) start = new Date(customStart + 'T00:00:00');
            if (customEnd) end = new Date(customEnd + 'T23:59:59');
            break;
        default:
            start.setDate(end.getDate() - 29);
    }
    return { start: start.toISOString(), end: end.toISOString() };
};

// Human-readable label for the button
const computeLabel = (range, customStart, customEnd) => {
    if (range === 'custom' && customStart && customEnd) {
        const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${fmt(customStart)} – ${fmt(customEnd)}`;
    }
    const preset = DATE_PRESETS.find(p => p.key === range);
    return preset ? preset.label : 'Last 30 Days';
};

export default function AnalyticsPanel({ currentUser }) {
    // ─── Dynamic Metrics State ───────────────────────────────────────────
    const [metrics, setMetrics] = useState({
        grossSales: 0,
        ticketConversion: 0,
        pageEngagements: 0,
        totalTicketsSold: 0,
        totalRegistrants: 0,
        totalEventsTracked: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ─── Date Range State ────────────────────────────────────────────────
    const [range, setRange] = useState('30d');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    const dateRangeLabel = computeLabel(range, customStart, customEnd);

    const [exporting, setExporting] = useState(false);

    // Close date picker on outside click
    useEffect(() => {
        const handler = (e) => {
            if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [range, customStart, customEnd]);

    // ─── Fetch from backend (graceful fallback to 0s if no backend yet) ───
    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMetrics({ grossSales: 0, ticketConversion: 0, pageEngagements: 0, totalTicketsSold: 0, totalRegistrants: 0, totalEventsTracked: 0 });
                return;
            }
            const { start, end } = computeRange(range, customStart, customEnd);
            const params = new URLSearchParams({ range, start, end });
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analytics/overview?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data = await res.json();

            setMetrics({
                grossSales: data.grossSales || 0,
                ticketConversion: data.ticketConversion || 0,
                pageEngagements: data.pageEngagements || 0,
                totalTicketsSold: data.totalTicketsSold || 0,
                totalRegistrants: data.totalRegistrants || 0,
                totalEventsTracked: data.totalEventsTracked || 0,
            });
        } catch (err) {
            console.warn('Analytics backend unavailable, showing zeros:', err.message);
            setMetrics({ grossSales: 0, ticketConversion: 0, pageEngagements: 0, totalTicketsSold: 0, totalRegistrants: 0, totalEventsTracked: 0 });
        } finally {
            setLoading(false);
        }
    };

    // ─── Formatters ────────────────────────────────────────────────────────
    const formatCurrency = (v) => `₱${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatNumber = (v) => {
        const n = Number(v);
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
        return n.toLocaleString('en-US');
    };
    const formatPercent = (v) => `${Number(v).toFixed(1)}%`;

    // ─── Date Picker Handlers ─────────────────────────────────────────────
    const handlePresetClick = (key) => {
        setRange(key);
        setCustomStart('');
        setCustomEnd('');
    };

    const handleCustomStartChange = (e) => {
        setCustomStart(e.target.value);
        if (e.target.value || customEnd) setRange('custom');
    };

    const handleCustomEndChange = (e) => {
        setCustomEnd(e.target.value);
        if (e.target.value || customStart) setRange('custom');
    };

    // ─── Export Report (PDF) ──────────────────────────────────────────────
    const handleExportReport = () => {
        setExporting(true);
        try {
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 40;
            const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            const orgName = (currentUser?.firstName || 'organizer') + (currentUser?.lastName ? '_' + currentUser.lastName : '');

            // ── Header Band ──
            doc.setFillColor(168, 85, 247);
            doc.rect(0, 0, pageWidth, 80, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(20);
            doc.text('VenU Analytics Report', margin, 38);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('Real-time performance tracking and conversion metrics', margin, 58);

            doc.setFontSize(9);
            const genAt = new Date().toLocaleString();
            doc.text(`Generated: ${genAt}`, pageWidth - margin, 38, { align: 'right' });
            doc.text(`Range: ${dateRangeLabel}`, pageWidth - margin, 58, { align: 'right' });

            // ── Organizer Info ──
            let y = 110;
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('Organizer', margin, y);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(
                `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || 'Unknown',
                margin + 80, y
            );

            // ── Date Range Detail ──
            const { start, end } = computeRange(range, customStart, customEnd);
            y += 18;
            doc.setTextColor(100, 116, 139);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`Period: ${new Date(start).toLocaleDateString()} to ${new Date(end).toLocaleDateString()}`, margin, y);

            // ── Overview Metrics Table ──
            y += 24;
            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('Overview Metrics', margin, y);
            y += 8;

            autoTable(doc, {
                startY: y,
                head: [['Metric', 'Value']],
                body: [
                    ['Gross Sales Volume (PHP)', formatCurrency(metrics.grossSales)],
                    ['Ticket Conversion Rate', formatPercent(metrics.ticketConversion)],
                    ['Page Engagements', formatNumber(metrics.pageEngagements)],
                    ['Total Tickets Sold', formatNumber(metrics.totalTicketsSold)],
                    ['Total Registrants', formatNumber(metrics.totalRegistrants)],
                    ['Total Events Tracked', formatNumber(metrics.totalEventsTracked)],
                ],
                theme: 'striped',
                headStyles: { fillColor: [168, 85, 247], textColor: 255, fontStyle: 'bold' },
                bodyStyles: { textColor: [30, 41, 59] },
                alternateRowStyles: { fillColor: [248, 245, 255] },
                margin: { left: margin, right: margin },
                styles: { font: 'helvetica', fontSize: 10, cellPadding: 6 },
            });

            // ── Footer ──
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.setDrawColor(226, 232, 240);
            doc.line(margin, pageHeight - 50, pageWidth - margin, pageHeight - 50);

            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(
                'All metrics reflect real-time data from the VenU platform. Generated by VenU Organizer Dashboard.',
                margin, pageHeight - 35
            );
            doc.text(
                '© 2026 VenU Technologies Inc. | In strict compliance with the Philippine Data Privacy Act of 2012.',
                margin, pageHeight - 22
            );

            // ── Save ──
            doc.save(`venu-analytics_${orgName}_${stamp}.pdf`);
        } catch (err) {
            console.error('PDF export failed:', err);
            alert('PDF export failed: ' + err.message);
        } finally {
            setExporting(false);
        }
    };

    // Compute display values
    const displayGross = formatCurrency(metrics.grossSales);
    const displayConversion = formatPercent(metrics.ticketConversion);
    const displayEngagements = formatNumber(metrics.pageEngagements);

    // Secondary stat cards configuration
    const secondaryStats = [
        { icon: Ticket, label: 'Tickets Sold', value: formatNumber(metrics.totalTicketsSold), color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', ring: 'border-purple-200 dark:border-purple-800' },
        { icon: Users, label: 'Registrants', value: formatNumber(metrics.totalRegistrants), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', ring: 'border-emerald-200 dark:border-emerald-800' },
        { icon: Eye, label: 'Page Views', value: formatNumber(metrics.pageEngagements), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', ring: 'border-blue-200 dark:border-blue-800' },
        { icon: Calendar, label: 'Events Tracked', value: formatNumber(metrics.totalEventsTracked), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', ring: 'border-amber-200 dark:border-amber-800' },
    ];

    return (
        <div className="animate-fade-in space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Analytics & Insights</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time performance tracking and conversion metrics.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* ── Improved Date Range Picker ── */}
                    <div className="relative" ref={datePickerRef}>
                        <button
                            onClick={() => setShowDatePicker(s => !s)}
                            className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded text-sm font-bold transition-all active:scale-95 cursor-pointer min-w-[180px]"
                        >
                            <Calendar size={16} />
                            <span className="truncate">{dateRangeLabel}</span>
                            <ChevronDown size={14} className={`transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
                        </button>

                        {showDatePicker && (
                            <div className="absolute top-full right-0 mt-2 w-[340px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden">
                                {/* Preset Section */}
                                <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">Quick Presets</p>
                                    <div className="grid grid-cols-2 gap-1">
                                        {DATE_PRESETS.map((preset) => (
                                            <button
                                                key={preset.key}
                                                onClick={() => handlePresetClick(preset.key)}
                                                className={`text-left px-3 py-2 text-xs font-bold rounded transition-colors ${range === preset.key
                                                    ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Range Section */}
                                <div className="p-3">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">Custom Range</p>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 px-1">Start Date</label>
                                            <input
                                                type="date"
                                                value={customStart}
                                                max={customEnd || new Date().toISOString().split('T')[0]}
                                                onChange={handleCustomStartChange}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 px-1">End Date</label>
                                            <input
                                                type="date"
                                                value={customEnd}
                                                min={customStart || undefined}
                                                max={new Date().toISOString().split('T')[0]}
                                                onChange={handleCustomEndChange}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-500 transition-colors"
                                            />
                                        </div>
                                        {range === 'custom' && (!customStart || !customEnd) && (
                                            <p className="text-[10px] text-amber-500 font-medium px-1">Please select both start and end dates.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex justify-between items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        onClick={() => { handlePresetClick('30d'); }}
                                        className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => setShowDatePicker(false)}
                                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded transition-colors cursor-pointer"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Export Report — PDF download */}
                    <button
                        onClick={handleExportReport}
                        disabled={exporting}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-700 dark:hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 px-6 py-3 rounded text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <Download size={16} /> {exporting ? 'Generating PDF…' : 'Export Report'}
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
                    <AlertCircle className="text-red-500 shrink-0" size={18} />
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                    <button onClick={fetchAnalytics} className="ml-auto text-xs font-bold text-red-700 dark:text-red-400 hover:underline">Retry</button>
                </div>
            )}

            {/* Pro Tracking Cards (Top Row — 3 columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gross Sales */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded border border-slate-200 dark:border-slate-800 relative overflow-hidden group transition-all duration-300">
                    <div className="flex justify-between items-start relative z-10 mb-6">
                        <div className="p-3 bg-slate-100 dark:bg-slate-700 border border-purple-100 dark:border-purple-800 rounded text-emerald-400">
                            <TrendingUp size={24} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-white bg-slate-400 px-3 py-1.5 rounded-full">
                            {loading ? 'Loading…' : 'Live'}
                        </span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-semibold text-slate-400 mb-1">Gross Sales Volume</p>
                        <p className={`text-5xl font-semibold text-slate-900 dark:text-white ${loading ? 'animate-pulse' : ''}`}>{displayGross}</p>
                        <p className="text-[10px] text-slate-400 mt-2">{metrics.totalTicketsSold} ticket(s) sold</p>
                    </div>
                </div>

                {/* Ticket Conversion */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded border border-slate-200 dark:border-slate-800 relative overflow-hidden group transition-all duration-300">
                    <div className="flex justify-between items-start relative z-10 mb-6">
                        <div className="p-3 bg-slate-100 dark:bg-slate-700 border border-purple-100 dark:border-purple-800 rounded text-slate-800 dark:text-slate-200">
                            <Percent size={24} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-white bg-slate-400 px-3 py-1.5 rounded-full">
                            {loading ? 'Loading…' : 'Live'}
                        </span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-semibold text-slate-400 mb-1">Ticket Conversion</p>
                        <p className={`text-5xl font-semibold text-slate-900 dark:text-white ${loading ? 'animate-pulse' : ''}`}>{displayConversion}</p>
                        <p className="text-[10px] text-slate-400 mt-2">{metrics.totalRegistrants} registrant(s)</p>
                    </div>
                </div>

                {/* Page Engagements */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded border border-slate-200 dark:border-slate-800 relative overflow-hidden group transition-all duration-300">
                    <div className="flex justify-between items-start relative z-10 mb-6">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded text-blue-600 dark:text-blue-400">
                            <BarChart3 size={24} strokeWidth={2.5} />
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-white bg-slate-400 px-3 py-1.5 rounded-full">
                            {loading ? 'Loading…' : 'Live'}
                        </span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-semibold text-slate-400 mb-1">Page Engagements</p>
                        <p className={`text-5xl font-semibold text-slate-900 dark:text-white ${loading ? 'animate-pulse' : ''}`}>{displayEngagements}</p>
                        <p className="text-[10px] text-slate-400 mt-2">{metrics.totalEventsTracked} event(s) tracked</p>
                    </div>
                </div>
            </div>

            {/* ── Secondary Stats (2x2 Larger Grid) ─────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {secondaryStats.map((s, i) => (
                    <div
                        key={i}
                        className={`bg-white dark:bg-slate-800 p-8 border ${s.ring} hover:-translate-y-1 transition-all duration-300 group`}
                    >
                        <div className="flex items-center gap-5">
                            <div className={`p-5 ${s.bg} border ${s.ring} shrink-0`}>
                                <s.icon size={32} strokeWidth={2.5} className={s.color} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-1">{s.label}</p>
                                <p className={`text-5xl font-bold text-slate-900 dark:text-white leading-none ${loading ? 'animate-pulse' : ''}`}>
                                    {s.value}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                                    {loading ? 'Loading…' : 'Live data'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}