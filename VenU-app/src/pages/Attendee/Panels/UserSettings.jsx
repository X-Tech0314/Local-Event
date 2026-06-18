import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { PHILIPPINE_GOVERNMENT_IDS } from '../../../utils/constants.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function UserSettings({ currentUser }) {
  const [form, setForm] = useState({
    firstName: currentUser?.firstName || '',
    middleName: currentUser?.middleName || '',
    lastName: currentUser?.lastName || '',
    suffix: currentUser?.suffix || '',
    dateOfBirth: currentUser?.dateOfBirth || '',
    contactNumber: currentUser?.contactNumber || '',
    houseNo: currentUser?.houseNo || '',
    streetName: currentUser?.streetName || '',
    subdivision: currentUser?.subdivision || '',
    zipCode: currentUser?.zipCode || '',
    region: currentUser?.region || '',
    province: currentUser?.province || '',
    city: currentUser?.city || '',
    barangay: currentUser?.barangay || '',
    idType: currentUser?.idType || '',
    idReferenceNumber: currentUser?.idReferenceNumber || '',
    idFrontPath: currentUser?.idFrontPath || '',
    idBackPath: currentUser?.idBackPath || '',
    email: currentUser?.email || '',
    ...currentUser
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${currentUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm(prev => ({ ...prev, ...res.data }));
        if (res.data.dateOfBirth) {
          // ensure it's mapped properly if the date format comes back as ISO
          setForm(prev => ({ ...prev, dateOfBirth: res.data.dateOfBirth.split('T')[0] }));
        }
        setIdType(res.data.idType || '');
        setIdNumber(res.data.idReferenceNumber || '');
        if (res.data.idFrontPath) setIdFront(res.data.idFrontPath);
        if (res.data.idBackPath) setIdBack(res.data.idBackPath);
        if (res.data.selfiePath) setIdSelfie(res.data.selfiePath);
      } catch (err) {
        if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
          console.warn('Backend unavailable, using local mock data.');
          return; // just keep the current user state which we seeded from form state init
        }
        console.error('Failed to fetch user data:', err);
      }
    };
    if (currentUser?.id) fetchUser();
  }, [currentUser]);

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
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${currentUser.id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(form));
      setIsEditing(false);
    } catch (err) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        alert('Profile updated locally (Backend offline).');
        localStorage.setItem('user', JSON.stringify(form));
        setIsEditing(false);
        return;
      }
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
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${currentUser.id}/password`, { newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        alert('Password update simulated (Backend offline).');
        setNewPassword('');
        setConfirmPassword('');
        return;
      }
      alert('Failed to update password: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${currentUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (err) {
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        alert('Account deletion simulated (Backend offline).');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        return;
      }
      alert('Failed to delete account: ' + (err.response?.data?.message || err.message));
    }
  };

  const uploadFile = async (file) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/events/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data.url;
  };

  const handleIdUpload = async (e, setter, formField) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const url = await uploadFile(file);
        setter(url);
        setForm(prev => ({ ...prev, [formField]: url }));
      } catch (err) {
        alert('Failed to upload file: ' + err.message);
      }
    }
  };

  const handleSaveVerification = async () => {
    try {
      const token = localStorage.getItem('token');
      const updatedForm = {
        ...form,
        idType: idType,
        idReferenceNumber: idNumber
      };
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${currentUser.id}`, updatedForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Verification details saved successfully!');
      localStorage.setItem('user', JSON.stringify(updatedForm));
      setForm(updatedForm);
    } catch (err) {
      alert('Failed to save verification details: ' + (err.response?.data?.message || err.message));
    }
  };

  // State and Refs for new functionality
  const [profilePhoto, setProfilePhoto] = useState(null);
  const photoInputRef = useRef(null);

  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [idSelfie, setIdSelfie] = useState(null);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);
  const selfieInputRef = useRef(null);

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

  const labelCls = "block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2";
  const inputCls = "w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-700 dark:focus:border-purple-400 transition-all font-medium disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-500 disabled:dark:text-slate-400 disabled:cursor-not-allowed";

  const Section = ({ title, children, className = "", action }) => (
    <div className={`bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-none p-6 mb-6 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3 mb-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );

  const ToggleSwitch = ({ label, description, enabled, onChange, locked = false }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700 last:border-0 group cursor-pointer" onClick={() => !locked && onChange(!enabled)}>
      <div className="pr-4">
        <p className={`text-sm font-bold transition-colors ${enabled ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300'}`}>{label}</p>
        {description && <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
      </div>
      <div
        className={`w-12 h-7 rounded-full flex items-center transition-all px-1 shrink-0 ${enabled ? 'bg-purple-700 dark:bg-purple-500' : 'bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'} ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white transition-all transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'verification', label: 'Billing & Verification' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' }
  ];

  const SaveBtn = ({ label, onClick }) => (
    <div className="flex justify-end mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
      <button onClick={onClick || handleSaveProfile} className="px-8 py-2.5 rounded-none bg-purple-700 hover:bg-purple-800 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-bold text-sm active:scale-95 transition-all">
        {label}
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">Account</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences, security, and verification.</p>
      </div>

      {/* Pill Bar Tabs — matches Organizer style */}
      <div className="bg-slate-50 dark:bg-slate-800 p-1.5 mb-8 overflow-x-auto flex gap-1 border border-slate-200 dark:border-slate-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 text-sm font-bold whitespace-nowrap flex-1 text-center ${
              activeTab === tab.id
                ? 'bg-purple-700 dark:bg-purple-500 text-white'
                : 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-700'
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
            {/* ── Basic Information (Profile Photo + Personal Info merged) ── */}
            <Section 
              title="Basic Information" 
              action={
                !isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-1.5 rounded-none hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    Edit Profile
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    Cancel
                  </button>
                )
              }
            >
              <div className="flex flex-col sm:flex-row gap-8">

                {/* Clickable Profile Avatar */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <label className={labelCls}>Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={photoInputRef}
                    onChange={(e) => { if (e.target.files[0]) setProfilePhoto(URL.createObjectURL(e.target.files[0])) }}
                  />
                    <div
                      className={`relative w-24 h-24 bg-purple-700 dark:bg-purple-500 flex items-center justify-center font-bold text-white text-3xl overflow-hidden group border-2 border-transparent hover:border-purple-400 dark:hover:border-purple-300 ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                      onClick={() => isEditing && photoInputRef.current?.click()}
                      title={isEditing ? "Click to change photo" : ""}
                    >
                    {profilePhoto
                      ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      : (form.firstName?.charAt(0) || 'U')}
                    {/* Camera icon overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1">
                      <Camera size={22} className="text-white" />
                      <span className="text-white text-[9px] font-bold uppercase tracking-wider">Upload</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center max-w-[96px]">JPG or PNG, min 400×400px</p>
                </div>

                {/* Personal Info Fields */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>First Name</label>
                    <input className={inputCls} value={form.firstName} onChange={set('firstName')} disabled={!isEditing} />
                  </div>
                  <div>
                    <label className={labelCls}>Middle Name</label>
                    <input className={inputCls} value={form.middleName} onChange={set('middleName')} disabled={!isEditing} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name</label>
                    <input className={inputCls} value={form.lastName} onChange={set('lastName')} disabled={!isEditing} />
                  </div>
                  <div>
                    <label className={labelCls}>Suffix</label>
                    <input className={inputCls} value={form.suffix} onChange={set('suffix')} placeholder="Jr., Sr., III" disabled={!isEditing} />
                  </div>
                  <div>
                    <label className={labelCls}>Date of Birth</label>
                    <input type="date" className={inputCls} value={form.dateOfBirth} onChange={set('dateOfBirth')} disabled={!isEditing} />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Number</label>
                    <input className={inputCls} value={form.contactNumber} onChange={set('contactNumber')} placeholder="+63" disabled={!isEditing} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Email Address</label>
                    <input type="email" value={form.email || ''} onChange={set('email')} className={inputCls} disabled />
                  </div>
                </div>

              </div>
              {isEditing && <SaveBtn label="Save Basic Information" />}
            </Section>

            {/* Address Details */}
            <Section title="Address Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className={labelCls}>House / Unit / Block No.</label>
                  <input className={inputCls} value={form.houseNo} onChange={set('houseNo')} placeholder="House No." disabled={!isEditing} />
                </div>
                 <div className="md:col-span-2">
                  <label className={labelCls}>Street Name</label>
                  <input className={inputCls} value={form.streetName} onChange={set('streetName')} placeholder="Street Name" disabled={!isEditing} />
                </div>
                <div>
                  <label className={labelCls}>Subdivision / Village</label>
                  <input className={inputCls} value={form.subdivision} onChange={set('subdivision')} placeholder="Subdivision" disabled={!isEditing} />
                </div>
                <div>
                  <label className={labelCls}>Zip Code</label>
                  <input className={inputCls} value={form.zipCode} onChange={set('zipCode')} placeholder="Zip Code" disabled={!isEditing} />
                </div>
                <div>
                  <label className={labelCls}>Region</label>
                  <input className={inputCls} value={form.region} onChange={set('region')} placeholder="Region" disabled={!isEditing} />
                </div>
                <div>
                  <label className={labelCls}>Province</label>
                  <input className={inputCls} value={form.province} onChange={set('province')} placeholder="Province" disabled={!isEditing} />
                </div>
                <div>
                  <label className={labelCls}>City / Municipality</label>
                  <input className={inputCls} value={form.city} onChange={set('city')} placeholder="City" disabled={!isEditing} />
                </div>
                <div>
                  <label className={labelCls}>Barangay</label>
                  <input className={inputCls} value={form.barangay} onChange={set('barangay')} placeholder="Barangay" disabled={!isEditing} />
                </div>
              </div>
              {isEditing && <SaveBtn label="Save Address Details" />}
            </Section>

            {/* Personalized Preferences */}
            <Section title="Personalized Preferences">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select the types of events you are interested in to improve your Discovery recommendations.</p>
              <div className="flex flex-wrap gap-3">
                {['Music & Concerts', 'Tech & Innovation', 'Sports & Athletics', 'Business & Corporate', 'Arts & Culture', 'Food & Drink'].map(cat => {
                  const current = form.preferredCategories || [];
                  const isSelected = current.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setForm({
                          ...form,
                          preferredCategories: isSelected ? current.filter(c => c !== cat) : [...current, cat]
                        });
                      }}
                      className={`px-4 py-2 border rounded-none text-sm font-bold transition-all ${
                        isSelected 
                          ? 'bg-purple-700 dark:bg-purple-500 border-purple-700 dark:border-purple-500 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-400 hover:text-purple-700 dark:hover:text-purple-400'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
              {isEditing && <SaveBtn label="Save Preferences" />}
            </Section>
          </div>
        )}

        {/* ── VERIFICATION & BILLING TAB ── */}
        {activeTab === 'verification' && (
          <div className="animate-fade-in">
            {/* Identity Verification Status */}
            <Section title="Identity Verification Status">
              {idType ? (
                <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded-none px-4 py-3 flex items-center gap-3 text-sm font-semibold mb-6 shadow-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs">⏳</span>
                  Pending Admin Verification
                </div>
              ) : (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-none px-4 py-3 flex items-center gap-3 text-sm font-semibold mb-6 shadow-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs">!</span>
                  Unverified Account - Please upload a valid ID
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Verified ID Type</label>
                  <select value={idType} onChange={(e) => { setIdType(e.target.value); setForm(prev => ({ ...prev, idType: e.target.value })); }} className={inputCls} disabled={!isEditing}>
                    <option value="">Select ID Type</option>
                    {PHILIPPINE_GOVERNMENT_IDS.map(id => (
                      <option key={id.id} value={id.id}>{id.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>ID Reference / Serial Number</label>
                  <input className={inputCls} value={idNumber} onChange={(e) => { setIdNumber(e.target.value); setForm(prev => ({ ...prev, idReferenceNumber: e.target.value })); }} placeholder="e.g. P1234567A" disabled={!isEditing} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div onClick={() => isEditing && frontInputRef.current?.click()} className={`h-48 border-2 border-dashed ${isEditing ? 'border-purple-700/50 dark:border-purple-400/50 bg-slate-50/50 dark:bg-slate-700/50 cursor-pointer hover:border-purple-700 dark:hover:border-purple-400 hover:bg-slate-100 dark:hover:bg-slate-700' : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 cursor-not-allowed'} rounded flex flex-col items-center justify-center text-center transition-all overflow-hidden p-2`}>
                    {idFront ? <img src={idFront} alt="Front ID" className={`w-full h-full object-contain rounded ${!isEditing && 'opacity-70 grayscale-[0.2]'}`} /> : <p className={`text-sm font-bold ${isEditing ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>Upload Front Side</p>}
                    <input type="file" ref={frontInputRef} onChange={(e) => handleIdUpload(e, setIdFront, 'IdFrontPath')} className="hidden" accept="image/*" />
                  </div>
                  
                  {idConfig?.hasBackSide && (
                    <div onClick={() => isEditing && backInputRef.current?.click()} className={`h-48 border-2 border-dashed ${isEditing ? 'border-purple-700/50 dark:border-purple-400/50 bg-slate-50/50 dark:bg-slate-700/50 cursor-pointer hover:border-purple-700 dark:hover:border-purple-400 hover:bg-slate-100 dark:hover:bg-slate-700' : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 cursor-not-allowed'} rounded flex flex-col items-center justify-center text-center transition-all overflow-hidden p-2`}>
                      {idBack ? <img src={idBack} alt="Back ID" className={`w-full h-full object-contain rounded ${!isEditing && 'opacity-70 grayscale-[0.2]'}`} /> : <p className={`text-sm font-bold ${isEditing ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>Upload Back Side</p>}
                      <input type="file" ref={backInputRef} onChange={(e) => handleIdUpload(e, setIdBack, 'IdBackPath')} className="hidden" accept="image/*" />
                    </div>
                )}
              </div>

              <div className="mb-6">
                <div onClick={() => isEditing && selfieInputRef.current?.click()} className={`h-48 border-2 border-dashed ${isEditing ? 'border-purple-700/50 dark:border-purple-400/50 bg-slate-50/50 dark:bg-slate-700/50 cursor-pointer hover:border-purple-700 dark:hover:border-purple-400 hover:bg-slate-100 dark:hover:bg-slate-700' : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 cursor-not-allowed'} rounded flex flex-col items-center justify-center text-center transition-all overflow-hidden p-2`}>
                  {idSelfie ? <img src={idSelfie} alt="Selfie" className={`w-full h-full object-contain rounded ${!isEditing && 'opacity-70 grayscale-[0.2]'}`} /> : <p className={`text-sm font-bold ${isEditing ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>Upload Selfie with ID</p>}
                  <input type="file" ref={selfieInputRef} onChange={(e) => handleIdUpload(e, setIdSelfie, 'SelfiePath')} className="hidden" accept="image/*" />
                </div>
              </div>
              <SaveBtn label="Save Verification Details" onClick={handleSaveVerification} />
            </Section>

            {/* Accessibility & Statutory Discounts */}
            <Section title="Accessibility & Statutory Discounts">
              {idType.includes('senior') || idType.includes('pwd') ? (
                <div className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50 rounded-none px-4 py-3 flex items-center gap-3 text-sm font-bold shadow-sm">
                  <span className="flex items-center justify-center w-6 h-6 rounded-none bg-purple-500 text-white text-xs">✓</span>
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
                  <div key={wallet.id} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-none p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-none ${wallet.bg} flex items-center justify-center ${wallet.text} font-bold`}>{wallet.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{wallet.name}</p>
                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">{wallet.value}</p>
                      </div>
                    </div>
                    <button onClick={() => setWalletToUnlink(wallet)} className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                      Unlink
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button onClick={handleAddWallet} className="w-full py-3.5 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-none text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all flex items-center justify-center gap-1">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-none bg-slate-50 dark:bg-slate-800 mt-4">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Active Sessions</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">Current Session: <span className="text-slate-800 dark:text-slate-200 font-normal">Antigravity IDE Workspace Client</span></p>
                <button onClick={() => alert("Successfully signed out of all other sessions")} className="px-6 py-2.5 rounded-none border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors active:scale-95">
                  Sign Out All Other Sessions
                </button>
              </div>
            </Section>

            {/* Data Privacy & Transcript Privileges */}
            <Section title="Data Privacy & Transcript Privileges">
              <div className="bg-slate-800 dark:bg-slate-800 text-white p-6 rounded-none mb-6 relative overflow-hidden">
                <p className="text-sm font-medium text-slate-300 relative z-10">
                  Your data is handled strictly compliant with the <strong className="text-white">Philippine Data Privacy Act of 2012 (NPC)</strong>. You retain full control over your stored transcripts and cached identity documents.
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-200 dark:border-slate-700">
                <div className="flex-1">
                  <ToggleSwitch
                    label="Auto-delete Documents Post-Event"
                    description="Automatically drop document files from server cache 30 days after an event finishes."
                    enabled={purgeCache}
                    onChange={setPurgeCache}
                  />
                </div>
                <button onClick={handlePrintTranscript} className="border border-purple-700 text-purple-700 dark:text-purple-400 font-bold text-xs px-6 py-2.5 rounded-none hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all active:scale-95 whitespace-nowrap">
                  Export Profile Metadata Transcript
                </button>
              </div>
            </Section>

            {/* Danger Zone */}
            <Section title="Danger Zone" className="border-red-100 bg-red-50/20">
              <p className="text-sm text-red-800 mb-4 font-medium">Once you delete your account, there is no going back. Please be certain.</p>
              <button
                onClick={() => setShowDangerModal(true)}
                className="border border-red-200 text-red-600 hover:bg-red-50 bg-white font-semibold px-5 py-2.5 rounded-none transition-all text-sm active:scale-95 shadow-sm"
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
          <div className="bg-white rounded-none shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 border border-red-200 text-red-600 text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Account?</h2>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to permanently delete your account? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDangerModal(false)}
                className="flex-1 py-2.5 rounded-none border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-none bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all"
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
          <div className="bg-white rounded-none shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 border border-red-200 text-red-600 text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Unlink Payment Method?</h2>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to remove your <strong>{walletToUnlink.name}</strong> ending in <strong>{walletToUnlink.value.slice(-4)}</strong>? You will need to re-verify it to use it again.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setWalletToUnlink(null)}
                className="flex-1 py-2.5 rounded-none border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setWallets(wallets.filter(w => w.id !== walletToUnlink.id));
                  setWalletToUnlink(null);
                }}
                className="flex-1 py-2.5 rounded-none bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all"
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
          <div className="bg-white rounded-none shadow-2xl w-full max-w-md overflow-hidden p-6 animate-scale-in">
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
                className="flex-1 py-2.5 rounded-none border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitNewWallet}
                className="flex-1 py-2.5 rounded-none bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold text-sm transition-all"
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
