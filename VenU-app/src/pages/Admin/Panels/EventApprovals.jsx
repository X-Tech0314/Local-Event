import React, { useState, useEffect } from 'react';
import { 
    Loader2, ChevronDown, ChevronUp, Image, MapPin, Users, Info, 
    Calendar, Trash2, RotateCcw, CheckCircle, XCircle, AlertTriangle, Archive, Search
} from 'lucide-react';

export default function EventApprovals() {
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'all', or 'trash'
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [expandedEventId, setExpandedEventId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Published', 'Done', 'Pending', 'Rejected'

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = '';
            if (activeTab === 'pending') {
                url = `${import.meta.env.VITE_API_URL}/api/admin/events/pending`;
            } else if (activeTab === 'all') {
                url = `${import.meta.env.VITE_API_URL}/api/admin/events?deleted=false`;
            } else if (activeTab === 'trash') {
                url = `${import.meta.env.VITE_API_URL}/api/admin/events?deleted=true`;
            }

            const res = await fetch(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || data || []);
            }
        } catch (err) {
            console.error("Error fetching events:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
        // Reset filter for other tabs
        if (activeTab === 'pending') {
            setStatusFilter('Pending');
        } else {
            setStatusFilter('All');
        }
    }, [activeTab]);

    const handleAction = async (e, id, action) => {
        if (e) e.stopPropagation();
        setActionLoading(prev => ({ ...prev, [id]: action }));
        try {
            const token = localStorage.getItem('token');
            let url = '';
            let method = 'PUT';

            if (action === 'Approved') {
                url = `${import.meta.env.VITE_API_URL}/api/admin/events/${id}/approved`;
            } else if (action === 'Rejected') {
                url = `${import.meta.env.VITE_API_URL}/api/admin/events/${id}/rejected`;
            } else if (action === 'Done') {
                url = `${import.meta.env.VITE_API_URL}/api/admin/events/${id}/done`;
            } else if (action === 'Delete') {
                if (!window.confirm("Move this event to the Recycle Bin?")) return;
                url = `${import.meta.env.VITE_API_URL}/api/admin/events/${id}`;
                method = 'DELETE';
            } else if (action === 'Restore') {
                url = `${import.meta.env.VITE_API_URL}/api/admin/events/${id}/restore`;
            } else if (action === 'PermanentDelete') {
                if (!window.confirm("PERMANENTLY DELETE this event? This action cannot be undone. All ticket sales, registrations, and reviews will be lost forever.")) return;
                url = `${import.meta.env.VITE_API_URL}/api/admin/events/${id}/permanent`;
                method = 'DELETE';
            }

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setEvents(prev => prev.filter(item => item.id !== id));
                alert(`Event action "${action}" processed successfully.`);
            } else {
                alert("Action failed. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Error processing event action.");
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const toggleExpand = (id) => {
        setExpandedEventId(prev => (prev === id ? null : id));
    };

    // Date Alert checks
    const getEventAlert = (event) => {
        if (event.status === 'Deleted' || event.status === 'Done') return null;
        const now = new Date();
        const start = new Date(event.startDateTime);
        const end = new Date(event.endDateTime);
        const diffMsStart = start - now;

        if (diffMsStart > 0 && diffMsStart <= 24 * 60 * 60 * 1000) {
            return { type: 'nearing', label: 'Nearing Start (<24h)', color: 'bg-amber-100 text-amber-800 border-amber-250 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30' };
        }
        if (now > end && event.status !== 'Done') {
            return { type: 'ended', label: 'Ended', color: 'bg-red-100 text-red-800 border-red-250 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30' };
        }
        return null;
    };

    // Filter events by Search & Status
    const filteredEvents = events.filter(evt => {
        const matchesSearch = (evt.name || evt.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (evt.organizer || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'All' || evt.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header section with Tabs */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Calendar className="text-purple-600" /> Event Administration Hub
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Approve pending submissions, monitor active listings, and manage soft-deleted events.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-slate-105 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700/60 self-start rounded-none">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all ${activeTab === 'pending' ? 'bg-white dark:bg-slate-900 text-purple-750 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-transparent'}`}
                    >
                        Pending Approvals ({events.filter(e => e.status === 'Pending').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-900 text-purple-755 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-transparent'}`}
                    >
                        All Events Directory
                    </button>
                    <button
                        onClick={() => setActiveTab('trash')}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-none transition-all ${activeTab === 'trash' ? 'bg-white dark:bg-slate-900 text-purple-755 dark:text-purple-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-transparent'}`}
                    >
                        <Archive size={12} className="inline mr-1" /> Recycle Bin
                    </button>
                </div>
            </div>

            {/* Filter Toolbar (Visible on All Events and Recycle Bin) */}
            {activeTab !== 'pending' && (
                <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-none">
                        <Search size={16} className="text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Search by event title or organizer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-slate-400 text-slate-900 dark:text-white"
                        />
                    </div>
                    {activeTab === 'all' && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-400 shrink-0">Filter Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs px-3 py-2 rounded-none font-bold uppercase"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Published">Published</option>
                                <option value="Done">Done</option>
                                <option value="Pending">Pending</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    )}
                </div>
            )}

            {/* Events List table */}
            {loading ? (
                <div className="flex justify-center items-center h-64 text-slate-500">
                    <Loader2 className="animate-spin mr-2" /> Loading event listings...
                </div>
            ) : filteredEvents.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-none p-10 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
                    {activeTab === 'pending' ? (
                        <>
                            <CheckCircle className="mx-auto text-emerald-500 mb-3" size={40} />
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">All events approved!</h3>
                            <p className="text-slate-500 mt-1">There are no pending events awaiting authorization.</p>
                        </>
                    ) : (
                        <>
                            <Info className="mx-auto text-slate-400 mb-3" size={40} />
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No events found</h3>
                            <p className="text-slate-500 mt-1">Try adjusting your filters or search queries.</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="animate-fade-in bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden rounded-none">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500 w-10"></th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Event Details</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Organizer</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Event Date</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500 text-center w-72">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.map(event => {
                                const isExpanded = expandedEventId === event.id;
                                const alert = getEventAlert(event);
                                const isLoading = actionLoading[event.id];

                                return (
                                    <React.Fragment key={event.id}>
                                        <tr 
                                            onClick={() => toggleExpand(event.id)}
                                            className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer transition-colors"
                                        >
                                            <td className="p-4 text-center">
                                                {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 dark:text-white text-sm">{event.name || event.title}</div>
                                                {alert && (
                                                    <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-none text-[10px] font-black uppercase tracking-wider border ${alert.color}`}>
                                                        <AlertTriangle size={10} /> {alert.label}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm font-semibold text-slate-500">{event.organizer}</td>
                                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{event.date}</td>
                                            <td className="p-4 text-sm">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-none text-xs font-black uppercase tracking-widest border ${
                                                    event.status === 'Published' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/20' :
                                                    event.status === 'Done' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/20' :
                                                    event.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/20' :
                                                    'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/20'
                                                }`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-center items-center gap-2">
                                                    {isLoading ? (
                                                        <Loader2 size={16} className="animate-spin text-slate-400" />
                                                    ) : (
                                                        <>
                                                            {/* ACTIONS FOR PENDING TAB */}
                                                            {activeTab === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => handleAction(e, event.id, 'Approved')}
                                                                        className="text-xs font-bold uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-none transition-colors border border-emerald-700 shadow-sm"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handleAction(e, event.id, 'Rejected')}
                                                                        className="text-xs font-bold uppercase tracking-widest text-white bg-red-500 hover:bg-red-650 px-3 py-1.5 rounded-none transition-colors border border-red-600"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </>
                                                            )}

                                                            {/* ACTIONS FOR ALL EVENTS TAB */}
                                                            {activeTab === 'all' && (
                                                                <>
                                                                    {event.status === 'Published' && (
                                                                        <button
                                                                            onClick={(e) => handleAction(e, event.id, 'Done')}
                                                                            className="text-xs font-bold uppercase tracking-widest text-slate-700 hover:text-slate-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 dark:bg-blue-955 dark:hover:bg-blue-900/40 dark:text-blue-450 px-3 py-1.5 rounded-none transition-colors"
                                                                            title="Mark event as Done and remove from public listings."
                                                                        >
                                                                            Mark Done
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={(e) => handleAction(e, event.id, 'Delete')}
                                                                        className="text-xs font-bold uppercase tracking-widest text-red-605 bg-red-50 hover:bg-red-100 border border-red-200 dark:bg-red-955 dark:hover:bg-red-900/40 dark:text-red-400 px-3 py-1.5 rounded-none transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Trash2 size={12} /> Delete
                                                                    </button>
                                                                </>
                                                            )}

                                                            {/* ACTIONS FOR RECYCLE BIN TAB */}
                                                            {activeTab === 'trash' && (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => handleAction(e, event.id, 'Restore')}
                                                                        className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/40 dark:text-emerald-450 px-3 py-1.5 rounded-none transition-colors flex items-center gap-1"
                                                                    >
                                                                        <RotateCcw size={12} /> Restore
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handleAction(e, event.id, 'PermanentDelete')}
                                                                        className="text-xs font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-750 border border-red-700 px-3 py-1.5 rounded-none transition-colors"
                                                                    >
                                                                        Delete Permanently
                                                                    </button>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr className="bg-slate-100/40 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700">
                                                <td colSpan="6" className="p-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-scale-in">
                                                        {/* Event Image Banner Preview */}
                                                        <div className="md:col-span-1">
                                                            <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                                                                <Image size={14} /> Uploaded Event Banner
                                                            </p>
                                                            {event.bannerUrl ? (
                                                                <div className="aspect-video w-full rounded border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-950 shadow-inner">
                                                                    <img 
                                                                        src={event.bannerUrl} 
                                                                        alt={event.name || event.title} 
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="aspect-video w-full rounded border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-950">
                                                                    <Image size={32} strokeWidth={1} className="mb-2" />
                                                                    <span className="text-xs font-medium">No banner image uploaded</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Event Information/Description */}
                                                        <div className="md:col-span-2 space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Category</h4>
                                                                    <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded text-sm font-semibold">
                                                                        {event.category || 'Uncategorized'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">Capacity Limit</h4>
                                                                    <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded text-sm font-semibold flex items-center gap-1.5">
                                                                        <Users size={14} /> {event.maxCapacity ? `${event.maxCapacity.toLocaleString()} max attendees` : 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                                                                    <MapPin size={12} /> Address / Venue Location
                                                                </h4>
                                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                     {event.location || 'No location specified'}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                                                                    <Info size={12} /> Event Description
                                                                </h4>
                                                                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-600 rounded-none shadow-inner">
                                                                     {event.description || 'No description provided.'}
                                                                </p>
                                                            </div>
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
        </div>
    );
}