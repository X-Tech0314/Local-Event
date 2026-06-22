import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  QrCode, CheckCircle, XCircle, Clock, AlertTriangle, RefreshCw,
  Loader2, Shield, Camera, CameraOff, ChevronDown, Wifi, WifiOff,
  Users, BarChart3, Zap, X
} from 'lucide-react';

// ── Inline Scanner Component ──────────────────────────────────────
function LiveScanner({ onScan, onStop }) {
  const scannerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    const scannerId = 'qr-organizer-reader';

    // Small delay lets the DOM mount the div before initializing
    const timer = setTimeout(() => {
      if (!document.getElementById(scannerId)) return;

      instanceRef.current = new Html5QrcodeScanner(
        scannerId,
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 1.5,
        },
        false // verbose=false (no console spam)
      );

      instanceRef.current.render(
        (decodedText) => {
          instanceRef.current?.clear().catch(() => {});
          onScan(decodedText);
        },
        () => {} // silent frame errors
      );
    }, 100);

    return () => {
      clearTimeout(timer);
      instanceRef.current?.clear().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="relative">
      {/* Scan Frame Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
        <div className="relative w-60 h-60">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-lg" />
          {/* Animated scan line */}
          <div className="absolute left-2 right-2 h-0.5 bg-purple-400/80 animate-[scanline_2s_ease-in-out_infinite]"
            style={{ animation: 'scanline 2s ease-in-out infinite' }}
          />
        </div>
      </div>
      {/* The scanner mounts here */}
      <div
        id="qr-organizer-reader"
        ref={scannerRef}
        className="w-full rounded-xl overflow-hidden [&_#qr-organizer-reader__scan_region]:!border-0 [&_video]:!rounded-xl"
      />
      {/* Stop button */}
      <button
        onClick={onStop}
        className="mt-3 w-full py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <CameraOff size={16} /> Stop Camera
      </button>
    </div>
  );
}

// ── Result Card ───────────────────────────────────────────────────
function ScanResultCard({ result, onDismiss }) {
  if (!result) return null;

  const isSuccess = result.success;
  const isConflict = result.alreadyCheckedIn;

  return (
    <div className={`rounded-2xl border p-6 animate-fade-in transition-all ${
      isSuccess
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50'
        : isConflict
        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'
        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${
            isSuccess
              ? 'bg-emerald-100 dark:bg-emerald-900/40'
              : isConflict
              ? 'bg-amber-100 dark:bg-amber-900/40'
              : 'bg-red-100 dark:bg-red-900/40'
          }`}>
            {isSuccess ? (
              <CheckCircle size={28} className="text-emerald-600 dark:text-emerald-400" />
            ) : isConflict ? (
              <AlertTriangle size={28} className="text-amber-600 dark:text-amber-400" />
            ) : (
              <XCircle size={28} className="text-red-600 dark:text-red-400" />
            )}
          </div>

          <div>
            <p className={`text-lg font-black ${
              isSuccess ? 'text-emerald-700 dark:text-emerald-300'
              : isConflict ? 'text-amber-700 dark:text-amber-300'
              : 'text-red-700 dark:text-red-300'
            }`}>
              {isSuccess ? '✅ Access Granted' : isConflict ? '⚠️ Already Checked In' : '❌ Access Denied'}
            </p>

            {result.attendeeName && (
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {result.attendeeName}
              </p>
            )}

            {result.ticketType && (
              <span className="inline-block px-3 py-1 bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700 mt-2">
                🎟️ {result.ticketType}
              </span>
            )}

            <p className={`text-sm mt-2 font-medium ${
              isSuccess ? 'text-emerald-600 dark:text-emerald-400'
              : isConflict ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-600 dark:text-red-400'
            }`}>
              {result.message}
            </p>
          </div>
        </div>

        <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

// ── Main QR Scanner Panel ─────────────────────────────────────────
export default function QRScannerPanel({ currentUser }) {
  const [scannerActive, setScannerActive] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventStats, setEventStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch organizer's published events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const active = data.filter(e => e.status === 'Published' || e.status === 'Full');
          setEvents(active);
          if (active.length > 0) setSelectedEventId(active[0].id);
        }
      } catch (err) {
        console.warn('Could not load events for scanner:', err);
      }
    };
    fetchEvents();
  }, []);

  // Fetch live stats whenever selected event changes
  useEffect(() => {
    if (!selectedEventId) return;
    fetchStats();
  }, [selectedEventId]);

  const fetchStats = async () => {
    if (!selectedEventId) return;
    setStatsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/checkin/event/${selectedEventId}/status`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (res.ok) setEventStats(await res.json());
    } catch (err) {
      console.warn('Stats fetch failed:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleScan = useCallback(async (decodedText) => {
    if (isValidating) return;
    setIsValidating(true);
    setScannerActive(false);
    setScanResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/checkin/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: decodedText })
      });

      const data = await res.json();
      const result = {
        ...data,
        success: res.ok && data.success,
        alreadyCheckedIn: res.status === 409,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rawToken: decodedText.slice(0, 16) + '...'
      };

      setScanResult(result);
      setRecentScans(prev => [result, ...prev].slice(0, 10));

      // Refresh stats after successful scan
      if (res.ok) {
        setTimeout(fetchStats, 500);
      }
    } catch (err) {
      setScanResult({
        success: false,
        message: 'Network error. Check your connection and try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setIsValidating(false);
    }
  }, [isValidating, selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg text-purple-600 dark:text-purple-400">
              <QrCode size={24} />
            </div>
            QR Check-In Scanner
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Scan attendee tickets to mark them as present at the gate.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={statsLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-all disabled:opacity-50"
        >
          <RefreshCw size={15} className={statsLoading ? 'animate-spin' : ''} />
          Refresh Stats
        </button>
      </div>

      {/* ── Event Selector ── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Scanning For Event
        </label>
        {events.length === 0 ? (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm text-amber-700 dark:text-amber-400 font-medium">
            ⚠️ No published events found. Publish an event first to use the scanner.
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setScanResult(null);
                setScannerActive(false);
              }}
              className="w-full px-4 py-3 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            >
              {events.map(evt => (
                <option key={evt.id} value={evt.id} className="bg-white dark:bg-slate-900">
                  {evt.title} ({evt.status})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* ── Live Stats Bar ── */}
      {eventStats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Registered</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{eventStats.totalRegistered}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50 p-4 text-center">
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Checked In</p>
            <p className="text-3xl font-black text-emerald-700 dark:text-emerald-300">{eventStats.checkedIn}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800/50 p-4 text-center">
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Still Pending</p>
            <p className="text-3xl font-black text-amber-700 dark:text-amber-300">{eventStats.pending}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Scanner Zone ── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera size={18} className="text-purple-600" />
              Camera Scanner
            </h2>
            <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
              scannerActive
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50'
                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${scannerActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {scannerActive ? 'Live' : 'Inactive'}
            </span>
          </div>

          {isValidating ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Validating ticket...</p>
            </div>
          ) : scannerActive ? (
            <LiveScanner onScan={handleScan} onStop={() => setScannerActive(false)} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                <QrCode size={40} className="text-slate-400 dark:text-slate-500" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-700 dark:text-slate-300">Ready to scan</p>
                <p className="text-xs text-slate-500 mt-1">Camera access required</p>
              </div>
              <button
                onClick={() => {
                  if (events.length === 0) return;
                  setScanResult(null);
                  setScannerActive(true);
                }}
                disabled={events.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera size={18} /> Start Scanner
              </button>
            </div>
          )}

          {/* Scan result card */}
          {!isValidating && !scannerActive && scanResult && (
            <ScanResultCard result={scanResult} onDismiss={() => setScanResult(null)} />
          )}

          {/* Rescan button after result */}
          {!isValidating && !scannerActive && scanResult && (
            <button
              onClick={() => {
                setScanResult(null);
                setScannerActive(true);
              }}
              className="w-full py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Scan Next Attendee
            </button>
          )}
        </div>

        {/* ── Recent Scans Log ── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-slate-500" />
              Recent Scans
            </h2>
            {recentScans.length > 0 && (
              <button
                onClick={() => setRecentScans([])}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {recentScans.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mb-3">
                <Zap size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No scans yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Scans will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-2 flex-1 overflow-y-auto max-h-[400px] pr-1">
              {recentScans.map((scan, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    scan.success
                      ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                      : scan.alreadyCheckedIn
                      ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
                      : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    scan.success ? 'bg-emerald-100 dark:bg-emerald-900/40'
                    : scan.alreadyCheckedIn ? 'bg-amber-100 dark:bg-amber-900/40'
                    : 'bg-red-100 dark:bg-red-900/40'
                  }`}>
                    {scan.success ? (
                      <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                    ) : scan.alreadyCheckedIn ? (
                      <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
                    ) : (
                      <XCircle size={16} className="text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {scan.attendeeName || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                      {scan.ticketType || '—'} · {scan.message?.slice(0, 40)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 shrink-0">
                    {scan.time}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Security note */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-[10px] text-slate-400">
            <Shield size={12} />
            <span>All check-ins are logged and verified server-side. Duplicate scans are rejected automatically.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
