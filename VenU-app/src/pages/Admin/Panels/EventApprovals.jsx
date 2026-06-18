import React from 'react';

export default function EventApprovals({ pendingEvents, loadingEvents, handleEventAction }) {
    if (loadingEvents) return <div className="text-center py-10 text-slate-400">Loading pending events...</div>;

    return (
        <div className="animate-fade-in bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500">Event Name</th>
                        <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500">Organizer</th>
                        <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500">Date</th>
                        <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingEvents.map(event => (
                        <tr key={event.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/50">
                            <td className="p-5 font-bold text-slate-900 dark:text-white">{event.name || event.title}</td>
                            <td className="p-5 text-sm font-medium text-slate-500">{event.organizer}</td>
                            <td className="p-5 text-sm font-medium text-slate-500">{event.date}</td>
                            <td className="p-5 text-right space-x-2">
                                <button
                                    onClick={() => handleEventAction(event.id, 'Approved')}
                                    className="text-xs font-bold uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-none"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleEventAction(event.id, 'Rejected')}
                                    className="text-xs font-bold uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-none"
                                >
                                    Reject
                                </button>
                            </td>
                        </tr>
                    ))}
                    {pendingEvents.length === 0 && (
                        <tr>
                            <td colSpan="4" className="p-10 text-center text-slate-400 font-medium">No events pending approval.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}