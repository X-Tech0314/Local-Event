import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Building, MapPin, Mail, Phone, FileText, CheckCircle, XCircle, 
    Loader2, AlertCircle, Eye, EyeOff, Image, FileSpreadsheet,
    ChevronDown, ChevronUp, Trash2, RotateCcw, Archive
} from 'lucide-react';

export default function VenueApprovals() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'all', or 'trash'
  const [venues, setVenues] = useState([]);
  const [allVenues, setAllVenues] = useState([]);
  const [deletedVenues, setDeletedVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allLoading, setAllLoading] = useState(false);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [expandedVenueId, setExpandedVenueId] = useState(null);

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

  const fetchAllVenues = async () => {
    try {
      setAllLoading(true);
      setError('');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/venues`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAllVenues(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load venues directory.');
    } finally {
      setAllLoading(false);
    }
  };

  const fetchDeletedVenues = async () => {
    try {
      setDeletedLoading(true);
      setError('');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/venues?deleted=true`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeletedVenues(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load deleted venues.');
    } finally {
      setDeletedLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingVenues();
    } else if (activeTab === 'all') {
      fetchAllVenues();
    } else if (activeTab === 'trash') {
      fetchDeletedVenues();
    }
  }, [activeTab]);

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

  const handleToggleVisibility = async (id, isCurrentlyHidden) => {
    setActionLoading(`visibility-${id}`);
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/venues/${id}/toggle-visibility`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const newHidden = res.data.isHidden;
      setAllVenues(allVenues.map(v => v.id === id ? { ...v, isHidden: newHidden } : v));
    } catch (err) {
      console.error(err);
      alert('Error toggling venue visibility.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteVenue = async (id, name) => {
    if (!window.confirm(`Are you sure you want to move "${name}" to the Recycle Bin?`)) return;
    setActionLoading(`delete-${id}`);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/venues/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAllVenues(allVenues.filter(v => v.id !== id));
      alert("Venue moved to Recycle Bin.");
    } catch (err) {
      console.error(err);
      alert('Error deleting venue.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreVenue = async (id, name) => {
    setActionLoading(`restore-${id}`);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/venues/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeletedVenues(deletedVenues.filter(v => v.id !== id));
      alert(`Venue "${name}" has been restored successfully!`);
    } catch (err) {
      console.error(err);
      alert('Error restoring venue.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDeleteVenue = async (id, name) => {
    if (!window.confirm(`PERMANENTLY DELETE "${name}"?\n\nThis action cannot be undone. All related venue data will be permanently removed.`)) return;
    setActionLoading(`permanent-${id}`);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/venues/${id}/permanent`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeletedVenues(deletedVenues.filter(v => v.id !== id));
      alert("Venue permanently deleted.");
    } catch (err) {
      console.error(err);
      alert('Error permanently deleting venue.');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedVenueId(prev => (prev === id ? null : id));
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-center gap-3">
        <AlertCircle /> {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building className="text-purple-600" /> Venue Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Verify legal documents and manage venue visibility on user dashboards.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700/60 self-start rounded-none">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-transparent'}`}
          >
            Pending ({venues.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-transparent'}`}
          >
            All Venues ({allVenues.length})
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all ${activeTab === 'trash' ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-transparent'}`}
          >
            🗑 Recycle Bin ({deletedVenues.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: PENDING APPROVALS ── */}
      {activeTab === 'pending' && (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-64 text-slate-500">
              <Loader2 className="animate-spin mr-2" /> Loading pending venues...
            </div>
          ) : venues.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-none p-10 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <CheckCircle className="mx-auto text-emerald-500 mb-3" size={40} />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">All caught up!</h3>
              <p className="text-slate-500 mt-1">There are no pending venues awaiting verification.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
              {venues.map(v => (
                <div key={v.id} className="bg-white dark:bg-slate-800 rounded-none overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col shadow-md">
                  {/* Core Header info */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-black text-lg mb-1 truncate text-slate-900 dark:text-white" title={v.name}>{v.name}</h3>
                      <span className="shrink-0 inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs px-2.5 py-1 rounded-none font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-800/40">
                        {v.type}
                      </span>
                    </div>
                    <div className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <p className="flex items-start gap-2">
                        <MapPin size={16} className="shrink-0 mt-0.5 text-slate-400" />
                        <span className="line-clamp-2">{v.location}</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-700/40 pt-2.5">
                        <p className="flex items-center gap-2 truncate">
                          <Mail size={15} className="shrink-0 text-slate-400" />
                          <span className="truncate">{v.email || 'No email'}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone size={15} className="shrink-0 text-slate-400" />
                          <span>{v.mobileNumber || 'No mobile'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Permits & Legal Documents */}
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-700/50 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Permit Numbers</p>
                      <div className="text-xs font-mono text-slate-700 dark:text-slate-300 space-y-0.5">
                        <div>FSIC: <span className="font-semibold text-slate-800 dark:text-slate-200">{v.fsicNumber || 'N/A'}</span></div>
                        <div>Mayor's: <span className="font-semibold text-slate-800 dark:text-slate-200">{v.businessPermitNumber || 'N/A'}</span></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Legal Uploads</p>
                      <div className="flex flex-col gap-1.5">
                        {v.legalPermitsUrl ? (
                          <a href={v.legalPermitsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-none transition-colors self-start border border-blue-200 dark:border-blue-900/20">
                            <FileText size={13} /> Legal Permits Package
                          </a>
                        ) : (
                          <span className="text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-400 px-2.5 py-1 rounded-none self-start">No Permits</span>
                        )}
                        {v.floorPlanUrl ? (
                          <a href={v.floorPlanUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/25 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-none transition-colors self-start border border-indigo-200 dark:border-indigo-900/20">
                            <FileText size={13} /> Floor Plan Blueprint
                          </a>
                        ) : (
                          <span className="text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-400 px-2.5 py-1 rounded-none self-start">No Floor Plan</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gallery */}
                  {v.images && v.images.length > 0 && (
                    <div className="p-5 border-b border-slate-100 dark:border-slate-700/50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Image size={12} /> Venue Gallery</p>
                      <div className="grid grid-cols-4 gap-2">
                        {v.images.slice(0, 8).map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square block rounded-none border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900 hover:opacity-90 transition-opacity group relative">
                            <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider">View</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-5 flex gap-3 mt-auto">
                    <button
                      onClick={() => handleReject(v.id)}
                      disabled={actionLoading !== null}
                      className="flex-1 py-2 bg-slate-100 hover:bg-red-50 dark:bg-slate-700 dark:hover:bg-red-900/30 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-bold rounded-none text-sm transition-colors flex justify-center items-center gap-2 border border-slate-200 dark:border-slate-600 hover:border-red-300"
                    >
                      {actionLoading === `reject-${v.id}` ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                      Reject
                    </button>
                    <button
                      onClick={() => handleVerify(v.id)}
                      disabled={actionLoading !== null}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-none text-sm transition-colors flex justify-center items-center gap-2 shadow-sm border border-emerald-700"
                    >
                      {actionLoading === `verify-${v.id}` ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TAB 2: ALL VENUES DIRECTORY ── */}
      {activeTab === 'all' && (
        <>
          {allLoading ? (
            <div className="flex justify-center items-center h-64 text-slate-500">
              <Loader2 className="animate-spin mr-2" /> Loading venues directory...
            </div>
          ) : allVenues.length === 0 ? (
            <div className="text-center py-10 text-slate-400">No registered venues found.</div>
          ) : (
            <div className="animate-fade-in bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden rounded-none">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500 w-10"></th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Venue Name</th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Type</th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Location</th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500 text-center w-72">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allVenues.map(v => {
                    const isExpanded = expandedVenueId === v.id;
                    return (
                      <React.Fragment key={v.id}>
                        <tr
                          onClick={() => toggleExpand(v.id)}
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer transition-colors"
                        >
                          <td className="p-4 text-center">
                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                          </td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{v.name}</td>
                          <td className="p-4 text-sm font-semibold text-slate-500">{v.type}</td>
                          <td className="p-4 text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs" title={v.location}>{v.location}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {v.isVerified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800/40 rounded-none">
                                  <CheckCircle size={10} /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 border border-amber-200 dark:border-amber-800/40 rounded-none">
                                  Pending
                                </span>
                              )}
                              {v.isHidden && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 border border-slate-200 dark:border-slate-600 rounded-none">
                                  Hidden
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-center items-center gap-2">
                              <button
                                onClick={() => handleToggleVisibility(v.id, v.isHidden)}
                                disabled={actionLoading !== null}
                                title={v.isHidden ? 'Show Venue' : 'Hide Venue'}
                                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 border font-bold uppercase transition-all rounded-none ${v.isHidden ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'}`}
                              >
                                {actionLoading === `visibility-${v.id}` ? <Loader2 size={12} className="animate-spin" /> : v.isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                                {v.isHidden ? 'Show' : 'Hide'}
                              </button>
                              <button
                                onClick={() => handleDeleteVenue(v.id, v.name)}
                                disabled={actionLoading !== null}
                                className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 text-xs px-2.5 py-1.5 border border-red-200 dark:border-red-900/30 font-bold uppercase transition-all rounded-none"
                              >
                                {actionLoading === `delete-${v.id}` ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                Move to Bin
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-100/40 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700">
                            <td colSpan="6" className="p-6">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                                      <FileSpreadsheet size={13} /> Legal Verification Numbers
                                    </h4>
                                    <div className="text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1 bg-white dark:bg-slate-800 p-3 rounded-none border border-slate-200 dark:border-slate-700/50 shadow-sm">
                                      <div>FSIC Permit: <span className="font-semibold text-slate-900 dark:text-white">{v.fsicNumber || 'N/A'}</span></div>
                                      <div>Business Permit: <span className="font-semibold text-slate-900 dark:text-white">{v.businessPermitNumber || 'N/A'}</span></div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                                      <FileText size={13} /> Legal Permits &amp; Blueprints
                                    </h4>
                                    <div className="flex flex-col gap-2">
                                      {v.legalPermitsUrl ? (
                                        <a href={v.legalPermitsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/25 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-none transition-colors self-start border border-blue-200 dark:border-blue-900/20">
                                          <FileText size={13} /> View Permits Package
                                        </a>
                                      ) : (
                                        <span className="text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-none self-start border border-slate-200 dark:border-slate-700/50">No Legal Permits uploaded</span>
                                      )}
                                      {v.floorPlanUrl ? (
                                        <a href={v.floorPlanUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/25 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-none transition-colors self-start border border-indigo-200 dark:border-indigo-900/20">
                                          <FileText size={13} /> View Floor Plan Blueprint
                                        </a>
                                      ) : (
                                        <span className="text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-none self-start border border-slate-200 dark:border-slate-700/50">No Floor Plan uploaded</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="lg:col-span-2">
                                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                                    <Image size={13} /> Venue Gallery
                                  </h4>
                                  {v.images && v.images.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2 bg-white dark:bg-slate-800 p-3 rounded-none border border-slate-200 dark:border-slate-700/50 shadow-inner">
                                      {v.images.map((url, idx) => (
                                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square w-full rounded-none border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-900 hover:opacity-90 transition-opacity block group relative shadow-sm">
                                          <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider">View</span>
                                        </a>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 dark:border-slate-700 rounded text-slate-400 bg-white dark:bg-slate-800">
                                      <Image size={24} className="mb-1 text-slate-300" />
                                      <span className="text-xs">No gallery images uploaded</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── TAB 3: RECYCLE BIN ── */}
      {activeTab === 'trash' && (
        <>
          {deletedLoading ? (
            <div className="flex justify-center items-center h-64 text-slate-500">
              <Loader2 className="animate-spin mr-2" /> Loading recycle bin...
            </div>
          ) : deletedVenues.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-none p-10 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
              <Archive className="mx-auto text-slate-400 mb-3" size={40} />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Recycle Bin is Empty</h3>
              <p className="text-slate-500 mt-1">There are no deleted venues in the recycle bin.</p>
            </div>
          ) : (
            <div className="animate-fade-in bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden rounded-none">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500 w-10"></th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Venue Name</th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Type</th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Location</th>
                    <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500 text-center w-72">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedVenues.map(v => {
                    const isExpanded = expandedVenueId === v.id;
                    return (
                      <React.Fragment key={v.id}>
                        <tr
                          onClick={() => toggleExpand(v.id)}
                          className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer transition-colors"
                        >
                          <td className="p-4 text-center">
                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                          </td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">{v.name}</td>
                          <td className="p-4 text-sm font-semibold text-slate-500">{v.type}</td>
                          <td className="p-4 text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs" title={v.location}>{v.location}</td>
                          <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-center items-center gap-3">
                              <button
                                onClick={() => handleRestoreVenue(v.id, v.name)}
                                disabled={actionLoading !== null}
                                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs px-3 py-1.5 border border-emerald-200 dark:border-emerald-900/30 font-bold uppercase transition-all rounded-none"
                              >
                                {actionLoading === `restore-${v.id}` ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                                Restore
                              </button>
                              <button
                                onClick={() => handlePermanentDeleteVenue(v.id, v.name)}
                                disabled={actionLoading !== null}
                                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 border border-red-700 font-bold uppercase transition-all rounded-none"
                              >
                                {actionLoading === `permanent-${v.id}` ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                Delete Permanently
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-100/40 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700">
                            <td colSpan="5" className="p-6">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                                      <FileSpreadsheet size={13} /> Legal Verification Numbers
                                    </h4>
                                    <div className="text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1 bg-white dark:bg-slate-800 p-3 rounded-none border border-slate-200 dark:border-slate-700/50 shadow-sm">
                                      <div>FSIC Permit: <span className="font-semibold text-slate-900 dark:text-white">{v.fsicNumber || 'N/A'}</span></div>
                                      <div>Business Permit: <span className="font-semibold text-slate-900 dark:text-white">{v.businessPermitNumber || 'N/A'}</span></div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                                      <FileText size={13} /> Legal Permits &amp; Blueprints
                                    </h4>
                                    <div className="flex flex-col gap-2">
                                      {v.legalPermitsUrl ? (
                                        <a href={v.legalPermitsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-blue-50 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-none self-start border border-blue-200 dark:border-blue-900/20">
                                          <FileText size={13} /> View Permits Package
                                        </a>
                                      ) : (
                                        <span className="text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-none self-start border border-slate-200 dark:border-slate-700/50">No Legal Permits uploaded</span>
                                      )}
                                      {v.floorPlanUrl ? (
                                        <a href={v.floorPlanUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-none self-start border border-indigo-200 dark:border-indigo-900/20">
                                          <FileText size={13} /> View Floor Plan Blueprint
                                        </a>
                                      ) : (
                                        <span className="text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-none self-start border border-slate-200 dark:border-slate-700/50">No Floor Plan uploaded</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="lg:col-span-2">
                                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                                    <Image size={13} /> Venue Gallery
                                  </h4>
                                  {v.images && v.images.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-2 bg-white dark:bg-slate-800 p-3 rounded-none border border-slate-200 dark:border-slate-700/50 shadow-inner">
                                      {v.images.map((url, idx) => (
                                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square w-full rounded-none border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-900 hover:opacity-90 transition-opacity block group relative shadow-sm">
                                          <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider">View</span>
                                        </a>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 dark:border-slate-700 rounded text-slate-400 bg-white dark:bg-slate-800">
                                      <Image size={24} className="mb-1 text-slate-300" />
                                      <span className="text-xs">No gallery images uploaded</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
