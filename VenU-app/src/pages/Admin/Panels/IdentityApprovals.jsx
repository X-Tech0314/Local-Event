import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IdentityApprovals = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/identity-approvals`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setPendingUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching identity approvals:', error);
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/identity-approvals/${id}/approve`, {}, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setPendingUsers(pendingUsers.filter(u => u.id !== id));
            setSelectedUser(null);
        } catch (error) {
            console.error('Error approving identity:', error);
            alert("Failed to approve identity.");
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/identity-approvals/${selectedUser.id}/reject`, {
                reason: rejectReason
            }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setPendingUsers(pendingUsers.filter(u => u.id !== selectedUser.id));
            setShowRejectModal(false);
            setSelectedUser(null);
            setRejectReason('');
        } catch (error) {
            console.error('Error rejecting identity:', error);
            alert("Failed to reject identity.");
        }
    };

    if (loading) return <div className="text-gray-300 p-6">Loading pending approvals...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Pending Identity Approvals</h2>

            {pendingUsers.length === 0 ? (
                <div className="bg-slate-800 rounded-lg p-8 text-center text-gray-400">
                    No pending identity approvals at the moment.
                </div>
            ) : (
                <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">ID Type</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {pendingUsers.map(user => (
                                <tr key={user.id} className="hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-white">{user.firstName} {user.lastName}</div>
                                        <div className="text-xs text-slate-400">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            user.role === 'Organizer' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">
                                        {user.idType || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedUser(user)}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition-colors"
                                        >
                                            Review Documents
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Document Review Modal */}
            {selectedUser && !showRejectModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700 shadow-2xl">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
                            <h3 className="text-xl font-bold text-white">Review Documents: {selectedUser.firstName} {selectedUser.lastName}</h3>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Front ID</h4>
                                    <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 aspect-video flex items-center justify-center">
                                        {selectedUser.idFrontPath ? (
                                            <img src={selectedUser.idFrontPath} alt="Front ID" className="object-contain w-full h-full" />
                                        ) : <span className="text-slate-500">No image uploaded</span>}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Back ID</h4>
                                    <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 aspect-video flex items-center justify-center">
                                        {selectedUser.idBackPath ? (
                                            <img src={selectedUser.idBackPath} alt="Back ID" className="object-contain w-full h-full" />
                                        ) : <span className="text-slate-500">No image uploaded</span>}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <h4 className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Selfie with ID</h4>
                                    <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 aspect-video flex items-center justify-center md:h-96">
                                        {selectedUser.selfiePath ? (
                                            <img src={selectedUser.selfiePath} alt="Selfie" className="object-contain w-full h-full" />
                                        ) : <span className="text-slate-500">No image uploaded</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-700 flex justify-end space-x-4 sticky bottom-0 bg-slate-800 z-10">
                            <button 
                                onClick={() => setShowRejectModal(true)}
                                className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded font-medium transition-colors"
                            >
                                Reject Identity
                            </button>
                            <button 
                                onClick={() => handleApprove(selectedUser.id)}
                                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-medium transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                Approve & Verify
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
                    <div className="bg-slate-800 rounded-xl max-w-md w-full border border-slate-700 shadow-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Reject Identity Verification</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            Please provide a reason for rejecting the documents. This will be shown to the user so they can re-upload their IDs correctly.
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 mb-6 h-32"
                            placeholder="e.g., The front ID is too blurry to read the details. Please upload a clearer photo."
                        ></textarea>
                        <div className="flex justify-end space-x-4">
                            <button 
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleReject}
                                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IdentityApprovals;
