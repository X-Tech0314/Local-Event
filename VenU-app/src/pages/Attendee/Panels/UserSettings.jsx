import React, { useState, useRef } from 'react';
import { PHILIPPINE_GOVERNMENT_IDS } from '../../../utils/constants.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function UserSettings({ currentUser }) {
  const [form, setForm] = useState({ ...currentUser });
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  // Toggles state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [applyRegionalDiscount, setApplyRegionalDiscount] = useState(false);
  const [notifyLocal, setNotifyLocal] = useState(true);
  const [notifyReceipts, setNotifyReceipts] = useState(true);
  const [purgeCache, setPurgeCache] = useState(false);
  const [showDangerModal, setShowDangerModal] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5150/api/users/${currentUser.id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(form));
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5150/api/users/${currentUser.id}/password`, { newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert('Failed to update password: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5150/api/users/${currentUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      alert('Failed to delete account: ' + (err.response?.data?.message || err.message));
    }
  };

  // State and Refs for new functionality
  const [profilePhoto, setProfilePhoto] = useState(null);
  const photoInputRef = useRef(null);

  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  const [wallets, setWallets] = useState([]);

  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [walletToUnlink, setWalletToUnlink] = useState(null);
  const [walletForm, setWalletForm] = useState({
    type: 'ewallet',
    provider: 'GCash',
    accountName: '',
    accountNumber: '',
    expiry: '',
    cvv: ''
  });

  const handleAddWallet = () => {
    setShowAddWalletModal(true);
  };

  const submitNewWallet = () => {
    if (!walletForm.accountName || !walletForm.accountNumber) {
      alert("Please fill in the required fields (Account Name and Number).");
      return;
    }

    let icon = walletForm.provider ? walletForm.provider[0].toUpperCase() : 'W';
    let bg = 'bg-slate-100';
    let text = 'text-slate-600';
    let maskedValue = '';

    if (walletForm.type === 'ewallet') {
      bg = walletForm.provider === 'GCash' ? 'bg-blue-100' : 'bg-emerald-100';
      text = walletForm.provider === 'GCash' ? 'text-blue-600' : 'text-emerald-600';
      maskedValue = walletForm.accountNumber.length > 4 ? walletForm.accountNumber.substring(0, 4) + '******' + walletForm.accountNumber.slice(-2) : '****';
    } else if (walletForm.type === 'bank') {
      bg = 'bg-indigo-100';
      text = 'text-indigo-600';
      icon = 'B';
      maskedValue = '****' + walletForm.accountNumber.slice(-4);
    } else {
      bg = 'bg-purple-100';
      text = 'text-purple-600';
      icon = 'C';
      maskedValue = '**** **** **** ' + walletForm.accountNumber.slice(-4);
    }

    setWallets([...wallets, {
      id: Date.now().toString(),
      name: `${walletForm.provider}${walletForm.type === 'card' ? ' Card' : ''}`,
      icon: icon,
      bg: bg,
      text: text,
      value: maskedValue
    }]);

    setWalletForm({ type: 'ewallet', provider: 'GCash', accountName: '', accountNumber: '', expiry: '', cvv: '' });
    setShowAddWalletModal(false);
  };

  const handlePrintTranscript = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Data Privacy Transcript</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            h1 { color: #A855F7; }
            .section { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
            .val { font-size: 16px; margin-top: 4px; }
          </style>
        </head>
        <body>
          <h1>VenU Profile Metadata Transcript</h1>
          <p>Generated strictly compliant with the Philippine Data Privacy Act of 2012 (NPC).</p>
          <div class="section">
            <div class="label">Full Name</div>
            <div class="val">${form.firstName} ${form.lastName}</div>
          </div>
          <div class="section">
            <div class="label">Contact Email</div>
            <div class="val">${form.email}</div>
          </div>
          <div class="section">
            <div class="label">Role</div>
            <div class="val">${form.role}</div>
          </div>
          <div class="section">
            <div class="label">Address</div>
            <div class="val">${form.city}, ${form.province}, ${form.region}</div>
          </div>
          <p style="font-size: 12px; color: #999;">End of Transcript</p>
          <script>
            window.print();
            setTimeout(() => window.close(), 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const idConfig = idType ? PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType) : null;

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-purple-400 transition bg-slate-50 focus:bg-white";
  const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

  const Section = ({ title, children, className = "" }) => (
    <div className={`bg-white border border-slate-100 shadow-sm rounded-2xl p-6 mb-6 ${className}`}>
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3">{title}</h3>
      {children}
    </div>
  );

  const ToggleSwitch = ({ label, description, enabled, onChange, locked = false }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="pr-4">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => !locked && onChange(!enabled)}
        className={`w-11 h-6 rounded-full flex items-center transition-all px-1 shrink-0 ${enabled ? 'bg-[#A855F7]' : 'bg-slate-300'} ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${enabled ? 'translate-x-5 shadow-[0_0_8px_rgba(168,85,247,0.6)]' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile & Address' },
    { id: 'verification', label: 'Verification & Billing' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security & Privacy' }
  ];

  const SaveBtn = ({ label, onClick }) => (
    <button onClick={onClick || handleSaveProfile} className="w-full mt-6 py-3 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold text-sm shadow-md transition-all active:scale-95">
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Account</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account preferences, security, and verification.</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200 mb-8 overflow-x-auto pb-px">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'border-[#A855F7] text-[#A855F7]'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* ── PROFILE & ADDRESS TAB ── */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in">
            {/* Profile Image Management */}
            <Section title="Profile Image Management">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-3xl shadow-lg shrink-0 overflow-hidden">
                  {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : form.firstName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-2">
                    <input type="file" accept="image/*" className="hidden" ref={photoInputRef} onChange={(e) => { if (e.target.files[0]) setProfilePhoto(URL.createObjectURL(e.target.files[0])) }} />
                    <button onClick={() => photoInputRef.current?.click()} className="bg-[#A855F7] text-white hover:bg-[#9333EA] transition-all px-4 py-2 rounded-xl text-sm font-medium shadow-sm active:scale-95">
                      Change Photo
                    </button>
                    <button onClick={() => setProfilePhoto(null)} className="border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all px-4 py-2 rounded-xl text-sm font-medium active:scale-95">
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">Recommended: Square JPG or PNG, at least 400x400px.</p>
                </div>
              </div>
              <SaveBtn label="Save Profile Image" />
            </Section>

            {/* Personal Info */}
            <Section title="Personal Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className={labelCls}>First Name</label>
                  <input className={inputCls} value={form.firstName} onChange={set('firstName')} placeholder="First Name" />
                </div>
                <div>
                  <label className={labelCls}>Middle Name</label>
                  <input className={inputCls} value={form.middleName} onChange={set('middleName')} placeholder="Middle Name (optional)" />
                </div>
                <div>
                  <label className={labelCls}>Last Name</label>
                  <input className={inputCls} value={form.lastName} onChange={set('lastName')} placeholder="Last Name" />
                </div>
                <div>
                  <label className={labelCls}>Suffix</label>
                  <select className={inputCls} value={form.suffix} onChange={set('suffix')}>
                    {['None', 'Jr.', 'Sr.', 'III', 'IV', 'V', 'VI'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Age</label>
                  <input type="number" className={inputCls} value={form.age} onChange={set('age')} placeholder="Age" min="1" max="120" />
                </div>
                <div>
                  <label className={labelCls}>Contact Number</label>
                  <input className={inputCls} value={form.contactNumber} onChange={set('contactNumber')} placeholder="09XXXXXXXXX" />
                </div>
              </div>
              <SaveBtn label="Save Personal Information" />
            </Section>

            {/* Address Details */}
            <Section title="Address Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className={labelCls}>House / Unit / Bldg. No.</label>
                  <input className={inputCls} value={form.houseNo} onChange={set('houseNo')} placeholder="Block 1 Lot 2" />
                </div>
                <div>
                  <label className={labelCls}>Street Name</label>
                  <input className={inputCls} value={form.street} onChange={set('street')} placeholder="Lily St." />
                </div>
                <div>
                  <label className={labelCls}>Subdivision / Village (Optional)</label>
                  <input className={inputCls} value={form.subdivision} onChange={set('subdivision')} placeholder="Phase 3, Meadow Ville" />
                </div>
                <div>
                  <label className={labelCls}>Region</label>
                  <input className={inputCls} value={form.region} onChange={set('region')} placeholder="Region" />
                </div>
                <div>
                  <label className={labelCls}>Province</label>
                  <input className={inputCls} value={form.province} onChange={set('province')} placeholder="Province" />
                </div>
                <div>
                  <label className={labelCls}>City / Municipality</label>
                  <input className={inputCls} value={form.city} onChange={set('city')} placeholder="City / Municipality" />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className={labelCls}>Barangay</label>
                  <input className={inputCls} value={form.barangay} onChange={set('barangay')} placeholder="Barangay" />
                </div>
              </div>
              <SaveBtn label="Save Address Details" />
            </Section>
          </div>
        )}

        {/* ── VERIFICATION & BILLING TAB ── */}
        {activeTab === 'verification' && (
          <div className="animate-fade-in">
            {/* Identity Verification Status */}
            <Section title="Identity Verification Status">
              {idType ? (
                <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-semibold mb-6 shadow-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs">⏳</span>
                  Pending Admin Verification
                </div>
              ) : (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-semibold mb-6 shadow-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs">!</span>
                  Unverified Account - Please upload a valid ID
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Verified ID Type</label>
                  <select value={idType} onChange={(e) => setIdType(e.target.value)} className={inputCls}>
                    <option value="">Select ID Type</option>
                    {PHILIPPINE_GOVERNMENT_IDS.map(id => (
                      <option key={id.id} value={id.id}>{id.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>ID Reference / Serial Number</label>
                  <input className={inputCls} value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="e.g. P1234567A" />
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-5">
                <div className="flex items-center justify-between border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">F</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Front Side Document</p>
                      <p className="text-xs text-slate-500">{idFront ? 'Uploaded' : 'No document uploaded'}</p>
                    </div>
                  </div>
                  <input type="file" accept="image/*,application/pdf" className="hidden" ref={frontInputRef} onChange={(e) => e.target.files[0] && setIdFront(URL.createObjectURL(e.target.files[0]))} />
                  <div className="flex gap-2">
                    {idFront && <button onClick={() => window.open(idFront, '_blank')} className="text-sm font-medium text-[#A855F7] hover:underline">View</button>}
                    <button onClick={() => frontInputRef.current?.click()} className="text-sm font-medium text-slate-600 hover:text-slate-800 hover:underline">Update</button>
                  </div>
                </div>

                {idConfig?.hasBackSide && (
                  <div className="flex items-center justify-between border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">B</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Back Side Document</p>
                        <p className="text-xs text-slate-500">{idBack ? 'Uploaded' : 'No document uploaded'}</p>
                      </div>
                    </div>
                    <input type="file" accept="image/*,application/pdf" className="hidden" ref={backInputRef} onChange={(e) => e.target.files[0] && setIdBack(URL.createObjectURL(e.target.files[0]))} />
                    <div className="flex gap-2">
                      {idBack && <button onClick={() => window.open(idBack, '_blank')} className="text-sm font-medium text-[#A855F7] hover:underline">View</button>}
                      <button onClick={() => backInputRef.current?.click()} className="text-sm font-medium text-slate-600 hover:text-slate-800 hover:underline">Update</button>
                    </div>
                  </div>
                )}
              </div>
              <SaveBtn label="Save Verification Details" onClick={() => alert('Identity Verification Status Saved.')} />
            </Section>

            {/* Accessibility & Statutory Discounts */}
            <Section title="Accessibility & Statutory Discounts">
              {idType.includes('senior') || idType.includes('pwd') ? (
                <div className="bg-purple-50 text-purple-700 border border-purple-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-semibold shadow-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-xs">✓</span>
                  Statutory 20% Discount Automatically Applied to Paid Bookings
                </div>
              ) : (
                <ToggleSwitch
                  label="Apply Regional Sectoral Discounts"
                  description="Check validation criteria for Senior Citizen or PWD integration. Additional ID verification may be required."
                  enabled={applyRegionalDiscount}
                  onChange={setApplyRegionalDiscount}
                />
              )}
            </Section>

            {/* Linked Wallets & Method Repository */}
            <Section title="Linked Wallets & Method Repository">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wallets.map(wallet => (
                  <div key={wallet.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${wallet.bg} flex items-center justify-center ${wallet.text} font-bold`}>{wallet.icon}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{wallet.name}</p>
                        <p className="text-xs font-mono text-slate-500">{wallet.value}</p>
                      </div>
                    </div>
                    <button onClick={() => setWalletToUnlink(wallet)} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                      Unlink
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-6 pt-4 border-t border-slate-100">
                <button onClick={handleAddWallet} className="w-full py-3.5 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-[#A855F7] hover:bg-purple-50 hover:border-purple-300 transition-all flex items-center justify-center gap-1">
                  + Link New Payment Method
                </button>
              </div>
              <SaveBtn label="Save Payment Methods" onClick={() => alert('Linked Wallets Saved.')} />
            </Section>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === 'notifications' && (
          <div className="animate-fade-in">
            <Section title="Event Delivery & Alerts Management">
              <div className="space-y-1">
                <ToggleSwitch
                  label="Emergency Venue/Schedule Modifications"
                  description="Critical push alerts regarding event cancellations, venue changes, or safety notices."
                  enabled={true}
                  locked={true}
                />
                <ToggleSwitch
                  label="Hyper-Local Proximity Discovery Digests"
                  description={`Receive weekly updates on trending events in ${form.city} and ${form.barangay}.`}
                  enabled={notifyLocal}
                  onChange={setNotifyLocal}
                />
                <ToggleSwitch
                  label="Ticket Purchase Receipts & Invoice PDF Dispatches"
                  description="Automatically email a PDF copy of your ticket and official invoice after booking."
                  enabled={notifyReceipts}
                  onChange={setNotifyReceipts}
                />
              </div>
            </Section>
          </div>
        )}

        {/* ── SECURITY & PRIVACY TAB ── */}
        {activeTab === 'security' && (
          <div className="animate-fade-in">
            {/* Account Credentials */}
            <Section title="Account Credentials">
              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" className={inputCls} value={form.email} onChange={set('email')} placeholder="you@email.com" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                <div>
                  <label className={labelCls}>New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputCls} placeholder="New Password" />
                </div>
                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputCls} placeholder="Confirm New Password" />
                </div>
              </div>
              <SaveBtn label="Update Credentials" onClick={handleUpdatePassword} />
            </Section>

            {/* Security & Logins */}
            <Section title="Account Security & Logins">
              <div className="space-y-1">
                <ToggleSwitch
                  label="Two-Factor Authentication (2FA)"
                  description="Add an extra layer of security to your account during sign-in."
                  enabled={twoFactorEnabled}
                  onChange={setTwoFactorEnabled}
                />
              </div>
              <div className="pt-4 mt-2">
                <p className="text-sm font-semibold text-slate-800">Login Session Management</p>
                <p className="text-xs text-slate-500 mt-1">Current Active Session: <span className="font-medium text-slate-700">Antigravity IDE Workspace Client</span></p>
                <button className="text-xs font-medium text-[#A855F7] hover:text-[#9333EA] hover:underline mt-2 transition-all">
                  Log out of all other devices
                </button>
              </div>
            </Section>

            {/* Data Privacy & Transcript Privileges */}
            <Section title="Data Privacy & Transcript Privileges">
              <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                Your data is handled strictly compliant with the Philippine Data Privacy Act of 2012 (NPC). You retain full control over your stored transcripts and cached identity documents.
              </p>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <button onClick={handlePrintTranscript} className="border border-slate-200 text-slate-700 font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 w-full md:w-auto text-center">
                  Export Profile Metadata Transcript
                </button>
                <div className="flex-1 md:border-l md:border-slate-100 md:pl-6">
                  <ToggleSwitch
                    label="Purge Encrypted Government ID Cache Post-Event"
                    description="Automatically drop document files from server cache 30 days after an event finishes."
                    enabled={purgeCache}
                    onChange={setPurgeCache}
                  />
                </div>
              </div>
            </Section>

            {/* Danger Zone */}
            <Section title="Danger Zone" className="border-red-100 bg-red-50/20">
              <p className="text-sm text-red-800 mb-4 font-medium">Once you delete your account, there is no going back. Please be certain.</p>
              <button
                onClick={() => setShowDangerModal(true)}
                className="border border-red-200 text-red-600 hover:bg-red-50 bg-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm active:scale-95 shadow-sm"
              >
                Delete My Attendee Account Permanently
              </button>
            </Section>
          </div>
        )}

      </div>

      {/* Danger Modal */}
      {showDangerModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 border border-red-200 text-red-600 text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Account?</h2>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to permanently delete your account? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDangerModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-lg shadow-red-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Unlink Wallet Modal */}
      {walletToUnlink && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 border border-red-200 text-red-600 text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Unlink Payment Method?</h2>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to remove your <strong>{walletToUnlink.name}</strong> ending in <strong>{walletToUnlink.value.slice(-4)}</strong>? You will need to re-verify it to use it again.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setWalletToUnlink(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setWallets(wallets.filter(w => w.id !== walletToUnlink.id));
                  setWalletToUnlink(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-lg shadow-red-500/20"
              >
                Yes, Unlink
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Wallet Modal */}
      {showAddWalletModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 animate-scale-in">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Add Payment Method</h2>
            <p className="text-sm text-slate-500 mb-6">Enter your Philippine banking or e-wallet details.</p>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Method Type</label>
                <select className={inputCls} value={walletForm.type} onChange={(e) => setWalletForm({ ...walletForm, type: e.target.value, provider: e.target.value === 'ewallet' ? 'GCash' : e.target.value === 'bank' ? 'BDO Unibank' : 'Visa' })}>
                  <option value="ewallet">E-Wallet</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Provider / Bank</label>
                {walletForm.type === 'ewallet' ? (
                  <select className={inputCls} value={walletForm.provider} onChange={(e) => setWalletForm({ ...walletForm, provider: e.target.value })}>
                    <option value="GCash">GCash</option>
                    <option value="Maya">Maya</option>
                    <option value="GrabPay">GrabPay</option>
                  </select>
                ) : walletForm.type === 'bank' ? (
                  <select className={inputCls} value={walletForm.provider} onChange={(e) => setWalletForm({ ...walletForm, provider: e.target.value })}>
                    <option value="BDO Unibank">BDO Unibank</option>
                    <option value="Bank of the Philippine Islands (BPI)">Bank of the Philippine Islands (BPI)</option>
                    <option value="Metrobank">Metrobank</option>
                    <option value="UnionBank">UnionBank</option>
                    <option value="Security Bank">Security Bank</option>
                  </select>
                ) : (
                  <select className={inputCls} value={walletForm.provider} onChange={(e) => setWalletForm({ ...walletForm, provider: e.target.value })}>
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="JCB">JCB</option>
                  </select>
                )}
              </div>

              <div>
                <label className={labelCls}>Account / Cardholder Name</label>
                <input type="text" className={inputCls} placeholder="Juan Dela Cruz" value={walletForm.accountName} onChange={(e) => setWalletForm({ ...walletForm, accountName: e.target.value })} />
              </div>

              <div>
                <label className={labelCls}>{walletForm.type === 'ewallet' ? 'Mobile Number' : walletForm.type === 'bank' ? 'Account Number' : 'Card Number'}</label>
                <input type="text" className={inputCls} placeholder={walletForm.type === 'ewallet' ? '09XXXXXXXXX' : walletForm.type === 'card' ? '0000 0000 0000 0000' : '0000000000'} value={walletForm.accountNumber} onChange={(e) => setWalletForm({ ...walletForm, accountNumber: e.target.value })} />
              </div>

              {walletForm.type === 'card' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Expiry Date</label>
                    <input type="text" className={inputCls} placeholder="MM/YY" value={walletForm.expiry} onChange={(e) => setWalletForm({ ...walletForm, expiry: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>CVV</label>
                    <input type="text" className={inputCls} placeholder="123" value={walletForm.cvv} onChange={(e) => setWalletForm({ ...walletForm, cvv: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setShowAddWalletModal(false); setWalletForm({ type: 'ewallet', provider: 'GCash', accountName: '', accountNumber: '', expiry: '', cvv: '' }); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitNewWallet}
                className="flex-1 py-2.5 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold text-sm transition-all shadow-lg shadow-purple-500/20"
              >
                Save Payment Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
