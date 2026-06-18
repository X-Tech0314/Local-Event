import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const initialAdmins = [
    { id: 1, name: 'Alice Admin', email: 'alice@venu.com' },
    { id: 2, name: 'Bob Superadmin', email: 'bob@venu.com' },
];

export default function AdminManagement() {
    const [admins, setAdmins] = useState(initialAdmins);
    const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });

    const handleCreateAdmin = (e) => {
        e.preventDefault();
        setAdmins([...admins, { id: Date.now(), ...adminForm }]);
        setAdminForm({ name: '', email: '', password: '' });
    };

    const handleDeleteAdmin = (id) => {
        setAdmins(admins.filter(a => a.id !== id));
    };

    return (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Admin Creation Form */}
            <div className="lg:col-span-1">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm sticky top-24">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Create New Admin</h3>
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Name</label>
                            <input
                                type="text" required value={adminForm.name}
                                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none p-3 text-sm font-medium outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Email</label>
                            <input
                                type="email" required value={adminForm.email}
                                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none p-3 text-sm font-medium outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Temp Password</label>
                            <input
                                type="text" required value={adminForm.password}
                                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-none p-3 text-sm font-medium outline-none focus:border-purple-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-sm py-3 rounded-none flex items-center justify-center gap-2 mt-4"
                        >
                            <Plus size={16} /> Create Admin
                        </button>
                    </form>
                </div>
            </div>

            {/* Existing Admins Table */}
            <div className="lg:col-span-2">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Existing Administrators</h3>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500">Name</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500">Email</th>
                                <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(admin => (
                                <tr key={admin.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/50">
                                    <td className="p-5 font-bold text-slate-900 dark:text-white">{admin.name}</td>
                                    <td className="p-5 text-sm font-medium text-slate-500">{admin.email}</td>
                                    <td className="p-5 text-right">
                                        <button
                                            onClick={() => handleDeleteAdmin(admin.id)}
                                            className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-none border border-red-200 dark:border-red-900/50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}