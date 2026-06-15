import React from 'react';

export default function CreateEventPanel() {
    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm animate-fade-in text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Create New Event</h2>
            <p className="text-sm text-slate-500 mb-6">The event creation form will be integrated here.</p>
            <div className="h-64 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50">
                <span className="text-slate-400 font-medium">[ Event Creation Form Placeholder ]</span>
            </div>
        </div>
    );
}
