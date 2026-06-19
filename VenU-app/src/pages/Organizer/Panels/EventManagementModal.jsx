import React, { useState, useEffect } from 'react';
import { X, Star, Users, CheckCircle, AlertCircle, MessageSquare, Loader2, Calendar } from 'lucide-react';
import axios from 'axios';

export default function EventManagementModal({ eventId, onClose, onEdit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (eventId) {
      fetchSummary();
    }
  }, [eventId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/${eventId}/management-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err) {
      console.error('Error fetching management summary:', err);
      setError(err.response?.data || 'Failed to load event data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-slate-600 fill-slate-800'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4 duration-300"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Calendar size={18} className="text-purple-400" />
              Event Management Hub
            </h2>
            {data && <p className="text-sm font-semibold text-slate-400 mt-1">{data.eventTitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { onClose(); onEdit(); }}
              className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-bold rounded-lg transition-colors border border-slate-600"
            >
              Edit Event
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 size={32} className="text-purple-500 animate-spin" />
              <p className="text-slate-400 font-semibold text-sm animate-pulse">Synchronizing Live Data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg flex flex-col items-center text-center">
              <AlertCircle size={32} className="text-red-400 mb-3" />
              <h3 className="text-red-400 font-bold mb-1">Network Error</h3>
              <p className="text-sm text-red-400/80">{error}</p>
              <button 
                onClick={fetchSummary}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition-colors border border-slate-700"
              >
                Try Again
              </button>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Top Metrics Summary Matrix */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-lg">
                    <CheckCircle size={24} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Checked-In</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-slate-100">{data.checkedInCount}</span>
                      <span className="text-sm font-semibold text-slate-500">/ {data.totalRegistered} guests</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-xl flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <Star size={24} className="text-yellow-400 fill-yellow-400/20" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Rating</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-slate-100">{data.averageRating.toFixed(1)}</span>
                      <span className="text-sm font-semibold text-slate-500">/ 5.0 ({data.totalReviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guest Reviews Feed */}
              <div className="mt-8">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-400" />
                  Guest Feedback Feed
                </h3>
                
                {data.reviews && data.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {data.reviews.map((review) => (
                      <div key={review.id} className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-lg hover:bg-slate-800/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                              {review.reviewerName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-200">{review.reviewerName}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">
                                {new Date(review.dateSubmitted).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700/50">
                            {renderStars(review.starRating)}
                          </div>
                        </div>
                        {review.feedbackText && (
                          <p className="text-sm text-slate-400 mt-3 leading-relaxed bg-slate-900/30 p-3 rounded-md border-l-2 border-slate-700">
                            "{review.feedbackText}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-800/20 border border-slate-800/50 rounded-xl border-dashed">
                    <MessageSquare size={32} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-semibold">No feedback collected yet.</p>
                    <p className="text-xs text-slate-500 mt-1">Reviews will appear here once attendees submit them after the event.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
