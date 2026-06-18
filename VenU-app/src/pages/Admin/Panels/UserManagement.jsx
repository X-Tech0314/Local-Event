import React, { useState, useEffect } from 'react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (res.ok) {
                    const data = await res.json();
                    // Assuming your API returns an array of users. Adjust mapping if necessary.
                    setUsers(data.users || data || []);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const toggleUserStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
            }
        } catch (err) {
            console.error("Error updating user status:", err);
        }
    };

    if (loading) return <div className="text-center py-10 text-slate-400">Loading users...</div>;

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
                            <td className="p-5 font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</td>
                            <td className="p-5 text-sm font-medium text-slate-500">{user.role}</td>
                            <td className="p-5">
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {user.status}
                                </span>
                            </td>
                            <td className="p-5 text-right">
                                {user.status === 'Active' ? (
                                    <button
                                        onClick={() => toggleUserStatus(user.id, user.status)}
                                        className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 border border-red-200 dark:border-red-900/50 px-3 py-1.5 rounded-none hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        Suspend
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => toggleUserStatus(user.id, user.status)}
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