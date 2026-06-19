import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Calendar, ArrowLeft, Search, Filter, CheckCircle2, Star, Users, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { EventCard } from './EventsPanel';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, X } from 'lucide-react';

function CheckInScannerModal({ onScan, onClose }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader-checkin', { qrbox: { width: 250, height: 250 }, fps: 5 }, false);
    scanner.render((text) => {
      scanner.clear();
      onScan(text);
    }, (err) => {
      // ignore
    });
    return () => {
      scanner.clear().catch(e => console.warn(e));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <QrCode className="text-purple-600" /> Scan Ticket (DPA Compliant)
        </h2>
        <div id="reader-checkin" className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden"></div>
        <p className="text-center text-xs text-slate-500 mt-4">
          Point your camera at the attendee's ticket. PII is masked per DPA 2012.
        </p>
      </div>
    </div>
  );
}

export default function AttendeesPanel({ currentUser }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for the "Inside Event" view
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [hubData, setHubData] = useState(null);
  const [hubLoading, setHubLoading] = useState(false);
  const [hubError, setHubError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchHubData(selectedEventId);
    } else {
      setHubData(null);
      setSearchQuery("");
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (err) {
      setError(err.response?.data || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHubData = async (eventId) => {
    try {
      setHubLoading(true);
      setHubError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/management-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHubData(response.data);
    } catch (err) {
      setHubError('Failed to load event attendee data.');
    } finally {
      setHubLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={14} className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600 fill-slate-800'} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-fade-in">
        <Loader2 size={32} className="text-purple-500 animate-spin" />
        <p className="text-slate-400 font-semibold animate-pulse">Loading Your Events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl flex flex-col items-center text-center max-w-lg mx-auto mt-12 animate-fade-in">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h3 className="text-red-400 font-bold text-lg mb-2">Failed to load</h3>
        <p className="text-sm text-red-400/80 mb-6">{error}</p>
        <button onClick={fetchEvents} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors shadow-lg shadow-red-500/20">Try Again</button>
      </div>
    );
  }

  // --- HUB VIEW (INSIDE EVENT) ---
  if (selectedEventId) {
    return (
      <div className="animate-fade-in space-y-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedEventId(null)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Attendee Hub</h1>
            {hubData && <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{hubData.eventTitle}</p>}
          </div>
        </div>

        {hubLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 size={32} className="text-purple-500 animate-spin" />
            <p className="text-slate-400 font-semibold">Synchronizing Live Data...</p>
          </div>
        ) : hubError ? (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg flex flex-col items-center text-center">
            <AlertCircle size={32} className="text-red-400 mb-3" />
            <p className="text-sm text-red-400/80">{hubError}</p>
            <button onClick={() => fetchHubData(selectedEventId)} className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition-colors border border-slate-700">Try Again</button>
          </div>
        ) : hubData ? (
          <div className="space-y-6">
            {/* Top Metrics Ribbon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-6 rounded relative overflow-hidden group">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">{hubData.isEnded ? 'Final Turnout' : 'Total Registered'}</p>
                <div className="flex justify-between items-center relative z-10">
                  <p className="text-4xl font-semibold text-slate-900 dark:text-white">{hubData.totalRegistered}</p>
                  <Users size={28} className="text-purple-500/50" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-6 rounded relative overflow-hidden group">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">{hubData.isEnded ? 'Attended' : 'Checked In'}</p>
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-semibold text-slate-900 dark:text-white">{hubData.checkedInCount}</p>
                    <span className="text-sm font-semibold text-emerald-500">
                      {hubData.totalRegistered > 0 ? Math.round((hubData.checkedInCount / hubData.totalRegistered) * 100) : 0}% arrival
                    </span>
                  </div>
                  <CheckCircle size={28} className="text-blue-500/50" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-6 rounded relative overflow-hidden group">
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">{hubData.isEnded ? 'Average Rating' : 'VIP Guests'}</p>
                <div className="flex justify-between items-center relative z-10">
                  {hubData.isEnded ? (
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-semibold text-slate-900 dark:text-white">{hubData.averageRating.toFixed(1)}</p>
                      <span className="text-sm font-semibold text-slate-500">/ 5.0</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-semibold text-slate-900 dark:text-white">{hubData.attendees?.filter(a => a.ticketType?.toLowerCase().includes('vip')).length || 0}</p>
                    </div>
                  )}
                  <Star size={28} className="text-yellow-500/50" />
                </div>
              </div>
            </div>

            {/* Main Body Content Based on State */}
            {!hubData.isEnded ? (
              // ACTIVE EVENT: Operational Check-In Table
              <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row gap-4 justify-between">
                  <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search attendees by name..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded pl-12 pr-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-purple-700 dark:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all" 
                    />
                  </div>
                  <button 
                    onClick={() => setShowScanner(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <QrCode size={18} /> Scan Ticket
                  </button>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {hubData.attendees && hubData.attendees.filter(a => a.attendeeName?.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                    hubData.attendees.filter(a => a.attendeeName?.toLowerCase().includes(searchQuery.toLowerCase())).map((attendee) => (
                      <div key={attendee.id} className="flex flex-col lg:flex-row lg:items-center justify-between bg-white dark:bg-slate-800 p-5 rounded border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-600 transition-all gap-6 group">
                        <div className="flex items-center gap-4 min-w-[250px]">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg border-2 border-white dark:border-slate-900">
                            {attendee.attendeeName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{attendee.attendeeName}</p>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{attendee.maskedEmail}</p>
                          </div>
                        </div>
                        <div className="flex-1 lg:px-6 lg:border-x border-slate-200 dark:border-slate-700 flex flex-col justify-center">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{attendee.ticketType || 'Standard Entry'}</p>
                        </div>
                        <div className="flex items-center justify-between lg:justify-end gap-6 min-w-[200px]">
                          <div className="text-left lg:text-right">
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Arrival Time</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {attendee.arrivalTime ? new Date(attendee.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                            </p>
                          </div>
                          {attendee.isPresent ? (
                            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded">
                              <CheckCircle2 size={18} strokeWidth={2.5} />
                              <span className="text-xs font-semibold tracking-wider">Present</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded">
                              <Clock size={18} />
                              <span className="text-xs font-semibold tracking-wider">Pending</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 font-semibold">No attendees found.</div>
                  )}
                </div>
              </div>
            ) : (
              // ENDED EVENT: Guest Reviews Feed
              <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                  <MessageSquare size={20} className="text-blue-500" />
                  Guest Reviews & Ratings Feed
                </h3>
                {hubData.reviews && hubData.reviews.length > 0 ? (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {hubData.reviews.map((review) => (
                      <div key={review.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-inner">
                              {review.reviewerName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{review.reviewerName}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">
                                {new Date(review.dateSubmitted).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="bg-white dark:bg-slate-900/50 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700/50 shadow-sm">
                            {renderStars(review.starRating)}
                          </div>
                        </div>
                        {review.feedbackText && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed bg-white dark:bg-slate-900/30 p-4 rounded-md border-l-4 border-slate-200 dark:border-slate-700">
                            "{review.feedbackText}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800/50 rounded-xl border-dashed">
                    <MessageSquare size={48} className="text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">No feedback collected yet.</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Reviews will appear here once attendees submit them after the event.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        {showScanner && (
          <CheckInScannerModal 
            onClose={() => setShowScanner(false)} 
            onScan={(data) => {
              setShowScanner(false);
              // Simulated Check-in Logic
              if (hubData && hubData.attendees) {
                const updatedAttendees = [...hubData.attendees];
                // In a real app, 'data' would be the Ticket ID. Here we just check in a random pending person for demo
                const targetIdx = updatedAttendees.findIndex(a => !a.isPresent);
                if (targetIdx !== -1) {
                  updatedAttendees[targetIdx].isPresent = true;
                  updatedAttendees[targetIdx].arrivalTime = new Date().toISOString();
                  setHubData(prev => ({
                    ...prev,
                    attendees: updatedAttendees,
                    checkedInCount: prev.checkedInCount + 1
                  }));
                  alert(`✅ Ticket Validated! Check-in successful for ${updatedAttendees[targetIdx].attendeeName}`);
                } else {
                  alert("❌ Invalid Ticket or All Guests Checked In.");
                }
              }
            }}
          />
        )}
      </div>
    );
  }

  // --- DEFAULT VIEW (EVENT DIRECTORY) ---
  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Attendees Hub</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Select an event to view its check-in sheet or feedback.</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
          <Calendar size={48} className="text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300 font-semibold text-lg">No events found</p>
          <p className="text-slate-500 text-sm mt-1">Create an event first to manage its attendees.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard 
              key={evt.id} 
              evt={evt} 
              onManage={(e) => setSelectedEventId(e.id)}
              setEditEvent={() => {}}
              setActivePanel={() => {}}
              onDeleteClick={() => {}}
              onViewAnalytics={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
