import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, MapPin, Mail, Phone, FileText, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

export default function VenueApprovals() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  const fetchPendingVenues = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/venues/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVenues(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load pending venues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVenues();
  }, []);

  const handleVerify = async (id) => {
    if (!window.confirm("Are you sure you want to verify this venue?")) return;
    setActionLoading(`verify-${id}`);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/venues/${id}/verify`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVenues(venues.filter(v => v.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error verifying venue.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to REJECT and DELETE this venue? This action cannot be undone.")) return;
    setActionLoading(`reject-${id}`);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/venues/${id}/reject`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setVenues(venues.filter(v => v.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error rejecting venue.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <Loader2 className="animate-spin mr-2" /> Loading pending venues...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-3">
        <AlertCircle /> {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building className="text-purple-600" /> Pending Venues
          </h2>
          <p className="text-slate-500 text-sm mt-1">Review legal documents to verify venues.</p>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-4 py-1.5 rounded-full font-bold text-sm">
          {venues.length} Pending
        </div>
      </div>

      {venues.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-10 text-center shadow-sm border border-slate-200 dark:border-slate-700">
          <CheckCircle className="mx-auto text-emerald-500 mb-3" size={40} />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">All caught up!</h3>
          <p className="text-slate-500 mt-1">There are no pending venues awaiting verification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map(v => (
            <div key={v.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
                <h3 className="font-bold text-lg mb-1 truncate">{v.name}</h3>
                <span className="inline-block bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded font-medium mb-3">
                  {v.type}
                </span>
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="shrink-0 mt-0.5 text-slate-400" />
                    <span className="line-clamp-2">{v.location}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={16} className="shrink-0 text-slate-400" />
                    <span className="truncate">{v.email || 'No email provided'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={16} className="shrink-0 text-slate-400" />
                    <span>{v.mobileNumber || 'No mobile provided'}</span>
                  </p>
                </div>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 flex-1 space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Permit Numbers</p>
                  <div className="text-sm font-mono text-slate-700 dark:text-slate-300">
                    <div>FSIC: {v.fsicNumber || 'N/A'}</div>
                    <div>Mayor's: {v.businessPermitNumber || 'N/A'}</div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Legal Documents</p>
                  <div className="flex gap-2">
                    {v.legalPermitsUrl ? (
                      <a href={v.legalPermitsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded transition-colors">
                        <FileText size={14} /> View Permits
                      </a>
                    ) : (
                      <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-400 px-3 py-1.5 rounded">No Permits</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 flex gap-3">
                <button
                  onClick={() => handleReject(v.id)}
                  disabled={actionLoading !== null}
                  className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 font-bold rounded-lg text-sm transition-colors flex justify-center items-center gap-2"
                >
                  {actionLoading === `reject-${v.id}` ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                  Reject
                </button>
                <button
                  onClick={() => handleVerify(v.id)}
                  disabled={actionLoading !== null}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-sm transition-colors flex justify-center items-center gap-2 shadow-sm shadow-emerald-500/20"
                >
                  {actionLoading === `verify-${v.id}` ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
