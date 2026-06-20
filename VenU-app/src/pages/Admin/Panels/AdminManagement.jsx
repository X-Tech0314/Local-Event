import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); // For Create button
    const [actionLoading, setActionLoading] = useState({}); // For Table action buttons
    const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });

    useEffect(() => {
        const fetchAdmins = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/admins`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (res.ok) {
                    const data = await res.json();
                    setAdmins(data || []);
                } else {
                    const errorText = await res.text();
                    console.error("Failed to fetch admins. Status:", res.status, "Response:", errorText);
                    alert(`Failed to load admin list (Status ${res.status}): ${errorText}`);
                }
            } catch (err) {
                console.error("Network Error fetching admins:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdmins();
    }, []);

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Disable button & show spinner

        // UI/UX: Normalize email to prevent duplicate casing issues
        const normalizedEmail = adminForm.email.trim().toLowerCase();

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/admins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...adminForm, email: normalizedEmail })
            });

            if (res.ok) {
                const newAdmin = await res.json();
                setAdmins([...admins, newAdmin]);
                setAdminForm({ name: '', email: '', password: '' });
                alert("Admin created successfully!");
            } else {
                const errorData = await res.json().catch(() => ({ message: "Unknown server error" }));
                alert(`Failed to create admin: ${errorData.message || res.statusText}`);
            }
        } catch (err) {
            console.error("Error creating admin:", err);
            alert(`Network Error: ${err.message}`);
        } finally {
            setIsSubmitting(false); // Re-enable button
        }
    };

    const handleDeleteAdmin = async (id) => {
        if (!window.confirm("Are you sure you want to delete this admin?")) return;

        setActionLoading(prev => ({ ...prev, [id]: 'delete' }));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/admins/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setAdmins(admins.filter(a => a.id !== id));
                alert("Admin deleted successfully!");
            } else {
                const errorData = await res.json().catch(() => ({ message: "Unknown server error" }));
                alert(`Failed to delete admin: ${errorData.message || res.statusText}`);
            }
        } catch (err) {
            console.error("Error deleting admin:", err);
            alert(`Network Error: ${err.message}`);
        } finally {
            setActionLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleToggleRole = async (admin, isSuperadmin) => {
        const newRole = isSuperadmin ? "Admin" : "Superadmin";

        setActionLoading(prev => ({ ...prev, [admin.id]: 'role' }));
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/admins/${admin.id}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ Role: newRole })
            });

            if (res.ok) {
                setAdmins(admins.map(a => a.id === admin.id ? { ...a, role: newRole } : a));

                // --- AUTO LOGOUT LOGIC (Bulletproof) ---
                const loggedInUserStr = localStorage.getItem('user');
                const loggedInUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;

                const loggedInId = String(loggedInUser?.Id || loggedInUser?.id || '').toLowerCase();
                const targetAdminId = String(admin.id || '').toLowerCase();

                // If they were a Superadmin, are being demoted to Admin, and it's their own account
                if (isSuperadmin && loggedInId === targetAdminId) {
                    alert("You have demoted your own account. You will now be logged out.");
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                    return;
                }

                alert(`${admin.name || admin.firstName} is now a ${newRole}!`);
            } else {
                const errorData = await res.json().catch(() => ({ message: "Unknown server error" }));
                alert(`Failed to update role: ${errorData.message || res.statusText}`);
            }
        } catch (err) {
            alert(`Network Error: ${err.message}`);
        } finally {
            setActionLoading(prev => ({ ...prev, [admin.id]: false }));
        }
    };

    // UI/UX: Form Validation - disable button until valid
    const isFormValid = adminForm.name.trim() !== '' &&
        adminForm.email.trim() !== '' &&
        adminForm.password.trim().length >= 6;

    return (
        // Changed to flex layout to maximize table width
        <div className="animate-fade-in flex flex-col lg:flex-row gap-8">

            {/* Admin Creation Form - Fixed width on large screens */}
            <div className="lg:w-80 lg:shrink-0">
                <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm lg:sticky lg:top-24">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Create New Admin</h3>
                    <form onSubmit={handleCreateAdmin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Name</label>
                            <input
                                type="text" required value={adminForm.name}
                                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-700 rounded-none p-3 text-sm font-medium outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Email</label>
                            <input
                                type="email" required value={adminForm.email}
                                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-700 rounded-none p-3 text-sm font-medium outline-none focus:border-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Temp Password (Min 6 chars)</label>
                            <input
                                type="text" required value={adminForm.password}
                                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-700 rounded-none p-3 text-sm font-medium outline-none focus:border-purple-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!isFormValid || isSubmitting}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-sm py-3 rounded-none flex items-center justify-center gap-2 mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Creating...
                                </>
                            ) : (
                                <>
                                    <Plus size={16} /> Create Admin
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Existing Admins Table - Takes up all remaining space */}
            <div className="flex-1 min-w-0">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Existing Administrators</h3>
                    </div>
                    {loading ? (
                        <div className="p-10 text-center text-slate-400 flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin" /> Loading admins...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Name</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Email</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500">Role</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admins.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-10 text-center text-slate-400 font-medium">No administrators found.</td>
                                        </tr>
                                    ) : (
                                        admins.map(admin => {
                                            const isSuperadmin = String(admin.role).toLowerCase() === 'superadmin';
                                            const displayName = admin.name || `${admin.firstName} ${admin.lastName}`;
                                            const isLoading = actionLoading[admin.id];

                                            return (
                                                <tr key={admin.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/50">
                                                    <td className="p-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                        {displayName}
                                                    </td>
                                                    <td className="p-4 text-sm font-medium text-slate-500">{admin.email}</td>
                                                    <td className="p-4">
                                                        <span className={`text-xs font-black uppercase px-2 py-1 rounded-full ${isSuperadmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                            {isSuperadmin ? 'Superadmin' : 'Admin'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-end items-center gap-2 whitespace-nowrap">
                                                            {isLoading ? (
                                                                <Loader2 size={16} className="animate-spin text-slate-400" />
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleToggleRole(admin, isSuperadmin)}
                                                                        className={`px-3 py-1.5 rounded-none text-xs font-bold uppercase tracking-widest border transition-colors ${isSuperadmin
                                                                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                                            : 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                                                                            }`}
                                                                    >
                                                                        {isSuperadmin ? 'Demote' : 'Promote'}
                                                                    </button>

                                                                    <button
                                                                        onClick={() => handleDeleteAdmin(admin.id)}
                                                                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-none border border-red-200 dark:border-red-900/50"
                                                                        title="Delete Admin"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}