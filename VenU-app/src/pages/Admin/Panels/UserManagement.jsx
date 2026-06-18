import React, { useState, useEffect } from 'react';
import { Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search & Pagination State
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const pageSize = 10;

    // Debounce search input so it doesn't spam the API on every keystroke
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setSearchTerm(searchInput);
            setCurrentPage(1); // Reset to first page on new search
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchInput]);

    // Fetch Users whenever search term or page changes
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users?search=${searchTerm}&page=${currentPage}&pageSize=${pageSize}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("API Response:", data); // Log the data so we can see it
                    setUsers(data.users || []);
                    setTotalPages(data.totalPages || 1);
                    setTotalUsers(data.totalCount || 0);
                } else {
                    const errorText = await res.text();
                    console.error("Failed to fetch users. Status:", res.status, "Response:", errorText);
                    alert(`Failed to load users (Status ${res.status}): ${errorText}`);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                alert(`Network Error: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [searchTerm, currentPage]);

    const toggleUserStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ Status: newStatus })
            });

            if (res.ok) {
                setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
            }
        } catch (err) {
            console.error("Error updating user status:", err);
        }
    };

    const handleDeleteUser = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setUsers(users.filter(u => u.id !== id));
                alert("User deleted successfully.");
            } else {
                const errorData = await res.json().catch(() => ({ message: "Unknown server error" }));
                alert(`Failed to delete: ${errorData.message || res.statusText}`);
            }
        } catch (err) {
            alert(`Network Error: ${err.message}`);
        }
    };

    return (
        <div className="animate-fade-in space-y-4">

            {/* Search Bar */}
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none px-4 py-2 shadow-sm">
                <Search size={18} className="text-slate-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search users by name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full bg-transparent text-slate-900 dark:text-white outline-none text-sm font-medium placeholder:text-slate-400"
                />
            </div>

            {/* Users Table */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500">Name</th>
                            <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500">Role</th>
                            <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                            <th className="p-5 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="p-10 text-center text-slate-400">Loading users...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-10 text-center text-slate-400 font-medium">No users found.</td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/50">
                                    <td className="p-5 font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</td>
                                    <td className="p-5 text-sm font-medium text-slate-500">{user.role}</td>
                                    <td className="p-5">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex justify-end items-center gap-2">
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

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                                                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-none border border-red-200 dark:border-red-900/50"
                                                title="Delete User"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center px-2 pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Showing {users.length} of {totalUsers} users
                </span>
                <div className="flex items-center gap-3">
                    <button
                        disabled={currentPage === 1 || loading}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className="p-2 rounded-none border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Page {currentPage} of {totalPages > 0 ? totalPages : 1}
                    </span>
                    <button
                        disabled={currentPage === totalPages || totalPages === 0 || loading}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-2 rounded-none border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}