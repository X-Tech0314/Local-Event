import React, { useState } from 'react';

const initialUsers = [
    { id: 1, name: 'John Doe', role: 'Organizer', status: 'Active' },
    { id: 2, name: 'Jane Smith', role: 'Attendee', status: 'Suspended' },
    { id: 3, name: 'Sam Johnson', role: 'Organizer', status: 'Active' },
    { id: 4, name: 'Alice Williams', role: 'Attendee', status: 'Active' },
];

export default function UserManagement() {
    const [users, setUsers] = useState(initialUsers);

    const toggleUserStatus = (id) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
    };

    return (
        <div className="animate-fade-in bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500">Name</th>
                        <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500">Role</th>
                        <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                        <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/50">
                            <td className="p-5 font-bold text-slate-900 dark:text-white">{user.name}</td>
                            <td className="p-5 text-sm font-medium text-slate-500">{user.role}</td>
                            <td className="p-5">
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {user.status}
                                </span>
                            </td>
                            <td className="p-5 text-right">
                                {user.status === 'Active' ? (
                                    <button
                                        onClick={() => toggleUserStatus(user.id)}
                                        className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 border border-red-200 dark:border-red-900/50 px-3 py-1.5 rounded-none hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        Suspend
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => toggleUserStatus(user.id)}
                                        className="text-xs font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-800 border border-emerald-200 dark:border-emerald-900/50 px-3 py-1.5 rounded-none hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                    >
                                        Activate
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}