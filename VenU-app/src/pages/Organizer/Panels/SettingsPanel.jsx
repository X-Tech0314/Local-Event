import React, { useState, useRef, useEffect } from 'react';
import { User, Camera, KeyRound, Eye, EyeOff, Building2, MapPin, FileText, UploadCloud, CheckCircle2, Shield, Bell, AlertTriangle } from 'lucide-react';
import { PHILIPPINE_GOVERNMENT_IDS } from '../../../utils/constants.js';
import axios from 'axios';

export default function SettingsPanel({ currentUser }) {
 const [activeTab, setActiveTab] = useState('profile');
 
  const [form, setForm] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    position: '',
    contactNumber: '',
    orgType: 'LGU / Barangay / SK',
    orgName: '',
    idType: '',
    idReferenceNumber: '',
    ...currentUser
  });
  const [isEditing, setIsEditing] = useState(false);

 useEffect(() => {
 const fetchUser = async () => {
 try {
 const token = localStorage.getItem('token');
 const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${currentUser.id}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 setForm(prev => ({ ...prev, ...res.data }));
 if (res.data.idFrontPath) setIdFront(res.data.idFrontPath);
 if (res.data.idBackPath) setIdBack(res.data.idBackPath);
 if (res.data.selfiePath) setIdSelfie(res.data.selfiePath);
 if (res.data.orgDocumentPath) setOathDoc(res.data.orgDocumentPath);
 } catch (err) {
 console.error("Failed to fetch user data:", err);
 }
 };
 if (currentUser?.id) {
 fetchUser();
 }
 }, [currentUser]);

 const set = (field) => (e) => {
 setForm(prev => ({ ...prev, [field]: e.target.value }));
 };

 // Profile state
 const [profileImage, setProfileImage] = useState(null);
 const [showNewPassword, setShowNewPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');

 // Document state
 const [oathDoc, setOathDoc] = useState(null);
 const [idFront, setIdFront] = useState(null);
 const [idBack, setIdBack] = useState(null);
 const [idSelfie, setIdSelfie] = useState(null);

 // Notifications state
 const [emailAlerts, setEmailAlerts] = useState(true);
 const [smsAlerts, setSmsAlerts] = useState(false);
 const [marketingAlerts, setMarketingAlerts] = useState(false);

 // Security & Danger state
 const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
 const [purgeCache, setPurgeCache] = useState(false);
 const [showDangerModal, setShowDangerModal] = useState(false);

 // Wallet state
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

 const oathRef = useRef(null);
 const frontRef = useRef(null);
 const backRef = useRef(null);
 const selfieRef = useRef(null);

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

 const handleImageChange = async (e) => {
 const file = e.target.files[0];
 if (file) {
 try {
 const url = await uploadFile(file);
 setProfileImage(url);
 } catch (err) {
 alert("Failed to upload profile image: " + err.message);
 }
 }
 };

 const handleFileChange = async (e, setter, formField) => {
 const file = e.target.files[0];
 if (file) {
 try {
 const url = await uploadFile(file);
 setter(url);
 if (formField) {
 setForm(prev => ({ ...prev, [formField]: url }));
 }
 } catch (err) {
 alert("Failed to upload document: " + err.message);
 }
 }
 };

 const handleSave = async () => {
 try {
 const token = localStorage.getItem('token');
 await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${currentUser.id}`, form, {
 headers: { Authorization: `Bearer ${token}` }
 });
 alert("Profile updated successfully!");
 const localUser = JSON.parse(localStorage.getItem('user') || '{}');
 localStorage.setItem('user', JSON.stringify({
 ...localUser,
 ...form,
 FirstName: form.firstName,
 LastName: form.lastName,
 ContactNumber: form.contactNumber,
 Region: form.region,
 Province: form.province,
 City: form.city,
        Barangay: form.barangay
      }));
      setIsEditing(false);
    } catch (err) {
 alert("Failed to update profile: " + (err.response?.data?.message || err.message));
 }
 };

 const handleUpdatePassword = async () => {
 if (!newPassword) {
 alert("Please enter a new password.");
 return;
 }
 if (newPassword !== confirmPassword) {
 alert("Passwords do not match.");
 return;
 }
 try {
 const token = localStorage.getItem('token');
 await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${currentUser.id}/password`, { newPassword }, {
 headers: { Authorization: `Bearer ${token}` }
 });
 alert("Password updated successfully!");
 setNewPassword('');
 setConfirmPassword('');
 } catch (err) {
 alert("Failed to update password: " + (err.response?.data?.message || err.message));
 }
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
 .label { font-weight: bold; color: #666; font-size: 12px; text-transform: ; }
 .val { font-size: 16px; margin-top: 4px; }
 </style>
 </head>
 <body>
 <h1>VenU Organizer Profile Metadata Transcript</h1>
 <p>Generated strictly compliant with the Philippine Data Privacy Act of 2012 (NPC).</p>
 <div class="section">
 <div class="label">Full Name</div>
 <div class="val">${currentUser?.firstName} ${currentUser?.lastName}</div>
 </div>
 <div class="section">
 <div class="label">Contact Email</div>
 <div class="val">${currentUser?.email}</div>
 </div>
 <div class="section">
 <div class="label">Role</div>
 <div class="val">Event Organizer</div>
 </div>
 </body>
 </html>
 `);
 printWindow.document.close();
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
 bg = 'bg-slate-200';
 text = 'text-slate-800 dark:text-slate-200';
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

  const SaveBtn = ({ label, onClick }) => (
    <div className="flex justify-end mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
      <button onClick={onClick || handleSave} className="px-8 py-2.5 rounded-none bg-purple-700 hover:bg-purple-800 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-bold text-sm active:scale-95 transition-all">
        {label}
      </button>
    </div>
  );

 const ToggleSwitch = ({ label, description, enabled, onChange }) => (
 <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-800 last:border-0 group cursor-pointer" onClick={() => onChange(!enabled)}>
 <div className="pr-4">
 <p className={`text-sm font-bold transition-colors ${enabled ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-300'}`}>{label}</p>
 {description && <p className="text-xs font-medium text-slate-500 mt-1">{description}</p>}
 </div>
 <div
 className={`w-12 h-7 rounded-full flex items-center transition-all px-1 shrink-0 ${enabled ? 'bg-purple-700 dark:bg-purple-500' : 'bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'}`}
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

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">Platform</p>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure your account preferences and security.</p>
      </div>

      {/* Pill Bar Tabs */}
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
        {/* ── PROFILE & IDENTITY TAB ── */}
        {activeTab === 'profile' && (
          <div className="animate-fade-in">
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
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <label className={labelCls}>Profile Picture</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" ref={selfieRef} />
                  <div 
                    className={`relative w-24 h-24 bg-purple-700 dark:bg-purple-500 flex items-center justify-center font-bold text-white text-3xl overflow-hidden group border-2 border-transparent hover:border-purple-400 dark:hover:border-purple-300 ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => isEditing && selfieRef.current?.click()}
                    title={isEditing ? "Click to change photo" : ""}
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      currentUser?.firstName?.charAt(0) || "O"
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1">
                      <Camera size={22} className="text-white" />
                      <span className="text-white text-[9px] font-bold uppercase tracking-wider">Upload</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center max-w-[96px]">JPG or PNG, min 400×400px</p>
                </div>
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>First Name</label>
                    <input type="text" value={form.firstName || ''} onChange={set('firstName')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name</label>
                    <input type="text" value={form.lastName || ''} onChange={set('lastName')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Role / Title</label>
                    <input type="text" value={form.position || ''} onChange={set('position')} placeholder="e.g. Organizer" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Number</label>
                    <input type="text" value={form.contactNumber || ''} onChange={set('contactNumber')} placeholder="+63 9XX XXX XXXX" className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Email Address</label>
                    <input type="email" value={form.email || ''} className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-none px-4 py-2.5 text-sm font-bold text-slate-400 dark:text-slate-600 cursor-not-allowed select-none" disabled />
                  </div>
                </div>
              </div>
              {isEditing && <SaveBtn label="Save Profile" />}
            </Section>

            <Section title="Organization Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div>
                  <label className={labelCls}>Organization Type</label>
                  <select value={form.orgType || 'LGU / Barangay / SK'} onChange={set('orgType')} className={`${inputCls} appearance-none ${isEditing ? 'cursor-pointer' : ''}`}>
                    <option value="LGU / Barangay / SK">LGU / Barangay / SK</option>
                    <option value="Commercial/Private Business">Commercial/Private Business</option>
                    <option value="Accredited Student Organization">Accredited Student Organization</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Organization Name</label>
                  <input type="text" value={form.orgName || ''} onChange={set('orgName')} placeholder="e.g. Genesis Events Corp." className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Business Permit / Document</label>
                <div onClick={() => isEditing && oathRef.current.click()} className={`border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-none bg-white dark:bg-slate-700 p-10 flex flex-col items-center justify-center text-center transition-all group ${isEditing ? 'cursor-pointer hover:border-purple-700 hover:bg-slate-50' : 'cursor-not-allowed opacity-80'}`}>
                  {oathDoc ? (
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full mb-3">
                        <CheckCircle2 size={32} strokeWidth={2.5} />
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Document Uploaded</p>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud size={32} className="text-slate-800 dark:text-slate-200 " />
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">Upload Document</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">PDF, JPG, or PNG under 5MB</p>
                    </>
                  )}
                  <input type="file" ref={oathRef} onChange={(e) => handleFileChange(e, setOathDoc, 'orgDocumentPath')} className="hidden" accept="image/*,.pdf" />
                </div>
              </div>
              {isEditing && <SaveBtn label="Update Organization" />}
            </Section>
          </div>
        )}

        {/* ── BILLING & VERIFICATION TAB ── */}
        {activeTab === 'verification' && (
          <div className="animate-fade-in">
            <Section title="Identity Verification">
              <div className="mb-6">
                <label className={labelCls}>Government ID Type</label>
                <select value={form.idType || ''} onChange={set('idType')} disabled={!isEditing} className={`${inputCls} appearance-none`}>
                  <option value="">Choose ID Type</option>
                  {PHILIPPINE_GOVERNMENT_IDS.map(id => (
                    <option key={id.id} value={id.id}>{id.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-8">
                <label className={labelCls}>ID Number</label>
                <input type="text" value={form.idReferenceNumber || ''} onChange={set('idReferenceNumber')} disabled={!isEditing} placeholder="e.g. A000-1234-5678" className={`${inputCls} font-mono`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div onClick={() => isEditing && frontRef.current.click()} className={`h-48 border-2 border-dashed ${isEditing ? 'border-purple-700/50 dark:border-purple-400/50 bg-slate-50/50 dark:bg-slate-700/50 cursor-pointer hover:border-purple-700 dark:hover:border-purple-400 hover:bg-slate-100 dark:hover:bg-slate-700' : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 cursor-not-allowed'} rounded flex flex-col items-center justify-center text-center transition-all overflow-hidden p-2`}>
                  {idFront ? <img src={idFront} alt="Front ID" className={`w-full h-full object-contain rounded ${!isEditing && 'opacity-70 grayscale-[0.2]'}`} /> : <p className={`text-sm font-bold ${isEditing ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>Upload Front Side</p>}
                  <input type="file" ref={frontRef} onChange={(e) => handleFileChange(e, setIdFront, 'idFrontPath')} className="hidden" accept="image/*" />
                </div>
                <div onClick={() => isEditing && backRef.current.click()} className={`h-48 border-2 border-dashed ${isEditing ? 'border-purple-700/50 dark:border-purple-400/50 bg-slate-50/50 dark:bg-slate-700/50 cursor-pointer hover:border-purple-700 dark:hover:border-purple-400 hover:bg-slate-100 dark:hover:bg-slate-700' : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 cursor-not-allowed'} rounded flex flex-col items-center justify-center text-center transition-all overflow-hidden p-2`}>
                  {idBack ? <img src={idBack} alt="Back ID" className={`w-full h-full object-contain rounded ${!isEditing && 'opacity-70 grayscale-[0.2]'}`} /> : <p className={`text-sm font-bold ${isEditing ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>Upload Back Side</p>}
                  <input type="file" ref={backRef} onChange={(e) => handleFileChange(e, setIdBack, 'idBackPath')} className="hidden" accept="image/*" />
                </div>
              </div>

              <div className="mb-6">
                <div onClick={() => isEditing && selfieRef.current.click()} className={`h-48 border-2 border-dashed ${isEditing ? 'border-purple-700/50 dark:border-purple-400/50 bg-slate-50/50 dark:bg-slate-700/50 cursor-pointer hover:border-purple-700 dark:hover:border-purple-400 hover:bg-slate-100 dark:hover:bg-slate-700' : 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 cursor-not-allowed'} rounded flex flex-col items-center justify-center text-center transition-all overflow-hidden p-2`}>
                  {idSelfie ? <img src={idSelfie} alt="Selfie" className={`w-full h-full object-contain rounded ${!isEditing && 'opacity-70 grayscale-[0.2]'}`} /> : <p className={`text-sm font-bold ${isEditing ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>Upload Selfie with ID</p>}
                  <input type="file" ref={selfieRef} onChange={(e) => handleFileChange(e, setIdSelfie, 'selfiePath')} className="hidden" accept="image/*" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                {!isEditing ? (
                  <button onClick={() => setIsEditing(true)} className="text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-1.5 rounded-none hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                    Edit Verification
                  </button>
                ) : (
                  <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                    Cancel
                  </button>
                )}
                {isEditing && (
                  <button onClick={handleSave} className="px-8 py-2.5 rounded-none bg-purple-700 hover:bg-purple-800 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-bold text-sm active:scale-95 transition-all">
                    Submit Verification
                  </button>
                )}
              </div>
            </Section>

            <Section title="Payout Methods">
              {wallets.length === 0 ? (
                <div className="text-center py-12 px-6 bg-slate-100 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 rounded-none">
                  <Shield size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" strokeWidth={1} />
                  <p className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Payout Methods Linked</p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">Link a verified bank account or e-wallet to receive ticket sales payouts.</p>
                  <button onClick={() => setShowAddWalletModal(true)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold px-8 py-3 rounded-none hover:border-purple-700 dark:border-purple-500 transition-all active:scale-95">
                    + Add Payout Method
                  </button>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    {wallets.map(wallet => (
                      <div key={wallet.id} className="border border-slate-200 dark:border-slate-700 rounded-none p-5 flex items-center justify-between hover:border-purple-700 dark:border-purple-500 transition-all group bg-white dark:bg-slate-800">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full ${wallet.bg} flex items-center justify-center font-bold text-lg ${wallet.text} group-hover:scale-110 transition-transform`}>
                            {wallet.icon}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">{wallet.name}</p>
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono mt-1">{wallet.value}</p>
                          </div>
                        </div>
                        <button onClick={() => setWalletToUnlink(wallet)} className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-none transition-colors">
                          Unlink
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setShowAddWalletModal(true)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-none text-sm font-semibold text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-1">
                    + Link New Payment Method
                  </button>
                </div>
              )}
            </Section>
          </div>
        )}

        {/* ── COMMUNICATION HUB TAB ── */}
        {activeTab === 'notifications' && (
          <div className="animate-fade-in">
            {/* High-Notice Banner */}
            <div className="bg-purple-700 dark:bg-purple-500 border border-purple-800 dark:border-purple-600 rounded-none p-8 mb-6 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-white/20 text-white rounded-none">
                  <Bell size={32} strokeWidth={2.5} />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold mb-2 text-white">Notifications Enabled</h2>
                  <p className="text-sm font-medium text-purple-100 max-w-lg">Customize how you receive system alerts, payouts, and updates.</p>
                </div>
              </div>
            </div>

            <Section title="Communication Preferences">
 <div className="space-y-2">
 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 hover:border-purple-500/30 transition-colors">
 <ToggleSwitch 
 label="Email Notifications" 
 description="Receive standard system logs: ticket sales, platform announcements, and schedule updates."
 enabled={emailAlerts} 
 onChange={setEmailAlerts} 
 />
 </div>
 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 hover:border-purple-500/30 transition-colors">
 <ToggleSwitch 
 label="SMS Alerts" 
 description="Direct text alerts for urgent payout failures, security breaches, or immediate action."
 enabled={smsAlerts} 
 onChange={setSmsAlerts} 
 />
 </div>
 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 hover:border-purple-500/30 transition-colors">
 <ToggleSwitch 
 label="Marketing & Promos" 
 description="Receive VenU organizer strategy guides, promotional offers, and newsletters."
 enabled={marketingAlerts} 
 onChange={setMarketingAlerts} 
 />
 </div>
 </div>
 </Section>
 </div>
 )}

        {/* ── SECURITY & ACCESS TAB ── */}
        {activeTab === 'security' && (
          <div className="animate-fade-in">
            <Section title="Password & Security">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className={labelCls}>New Password (Min 8 chars)</label>
                  <div className="relative">
                    <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-500 transition-colors">
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Verify Password</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 dark:text-slate-200 dark:hover:text-slate-500 transition-colors">
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <SaveBtn label="Update Password" onClick={handleUpdatePassword} />
            </Section>

            <Section title="Security Features">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-200 dark:border-slate-700 mb-6">
                <ToggleSwitch
                  label="Two-Factor Authentication (2FA)"
                  description="Require a secondary code during sign-in."
                  enabled={twoFactorEnabled}
                  onChange={setTwoFactorEnabled}
                />
              </div>
              
              <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-none bg-slate-50 dark:bg-slate-800">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Active Sessions</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-4">Current Session: <span className="text-slate-800 dark:text-slate-200 font-normal">Windows (Browser)</span></p>
                <button onClick={() => alert("Successfully signed out of all other sessions")} className="px-6 py-2.5 rounded-none border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors active:scale-95">
                  Sign Out All Other Sessions
                </button>
              </div>
            </Section>

            <Section title="Data & Privacy">
              <div className="bg-slate-800 dark:bg-slate-800 text-white p-6 rounded-none mb-6 relative overflow-hidden">
                <p className="text-sm font-medium text-slate-300 relative z-10">
                  Your data traces are handled securely and compliant with the <strong className="text-white">Philippine Data Privacy Act of 2012 (NPC)</strong>. You retain control over your data.
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-none border border-slate-200 dark:border-slate-700">
                <div className="flex-1">
                  <ToggleSwitch
                    label="Auto-delete Documents Post-Event"
                    description="Automatically delete uploaded ID and permit documents 30 days after an event finishes."
                    enabled={purgeCache}
                    onChange={setPurgeCache}
                  />
                </div>
                <button onClick={handlePrintTranscript} className="border border-purple-700 text-purple-700 dark:text-purple-400 font-bold text-xs px-6 py-2.5 rounded-none hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all active:scale-95 whitespace-nowrap">
                  Export Data
                </button>
              </div>
            </Section>

            {/* Completely Isolated Danger Zone */}
            <div className="mt-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-none p-8 relative overflow-hidden group">
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-none">
                  <AlertTriangle size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2 uppercase tracking-wider">Delete Account</h3>
                  <p className="text-sm font-medium text-red-900/70 dark:text-red-400/70 mb-6 max-w-xl">
                    Permanently delete your account, events, and all data. This action is irreversible.
                  </p>
                  <button onClick={() => setShowDangerModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-8 py-2.5 rounded-none transition-all active:scale-95 shadow-sm">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDangerModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-800 rounded-none w-full max-w-md overflow-hidden p-8 text-center animate-scale-in border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400">
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Delete Account?</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">Are you absolutely sure you want to permanently delete your account?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDangerModal(false)} className="flex-1 py-3 rounded-none border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">Cancel</button>
              <button onClick={() => alert("Account Deletion Initiated.")} className="flex-1 py-3 rounded-none bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all active:scale-95">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {walletToUnlink && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-800 rounded-none w-full max-w-sm overflow-hidden p-8 text-center animate-scale-in border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="w-16 h-16 rounded-none bg-red-50 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6 border border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400">
              <Shield size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">Unlink Method?</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">Are you sure you want to unlink <strong className="text-slate-800 dark:text-slate-200">{walletToUnlink.name}</strong> ending in <strong className="font-mono">{walletToUnlink.value.slice(-4)}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setWalletToUnlink(null)} className="flex-1 py-2.5 rounded-none border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">Cancel</button>
              <button onClick={() => { setWallets(wallets.filter(w => w.id !== walletToUnlink.id)); setWalletToUnlink(null); }} className="flex-1 py-2.5 rounded-none bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all active:scale-95">Unlink</button>
            </div>
          </div>
        </div>
      )}

      {showAddWalletModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-800 rounded-none w-full max-w-lg overflow-hidden p-8 animate-scale-in border border-slate-200 dark:border-slate-700 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">Add Payout Method</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">Enter the details for your payout method.</p>
            
            <div className="space-y-5 text-left">
              <div>
                <label className={labelCls}>Method Type</label>
                <select className={`${inputCls} appearance-none cursor-pointer`} value={walletForm.type} onChange={(e) => setWalletForm({ ...walletForm, type: e.target.value, provider: e.target.value === 'ewallet' ? 'GCash' : e.target.value === 'bank' ? 'BDO Unibank' : 'Visa' })}>
                  <option value="ewallet">Mobile E-Wallet</option>
                  <option value="bank">Traditional Bank Transfer</option>
                  <option value="card">Credit/Debit Network</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Provider / Bank</label>
                {walletForm.type === 'ewallet' ? (
                  <select className={`${inputCls} appearance-none cursor-pointer`} value={walletForm.provider} onChange={(e) => setWalletForm({ ...walletForm, provider: e.target.value })}>
                    <option value="GCash">GCash</option>
                    <option value="Maya">Maya</option>
                    <option value="GrabPay">GrabPay</option>
                  </select>
                ) : walletForm.type === 'bank' ? (
                  <select className={`${inputCls} appearance-none cursor-pointer`} value={walletForm.provider} onChange={(e) => setWalletForm({ ...walletForm, provider: e.target.value })}>
                    <option value="BDO Unibank">BDO Unibank</option>
                    <option value="Bank of the Philippine Islands (BPI)">Bank of the Philippine Islands (BPI)</option>
                    <option value="Metrobank">Metrobank</option>
                    <option value="UnionBank">UnionBank</option>
                    <option value="Security Bank">Security Bank</option>
                  </select>
                ) : (
                  <select className={`${inputCls} appearance-none cursor-pointer`} value={walletForm.provider} onChange={(e) => setWalletForm({ ...walletForm, provider: e.target.value })}>
                    <option value="Visa">Visa Network</option>
                    <option value="Mastercard">Mastercard Network</option>
                    <option value="JCB">JCB Network</option>
                  </select>
                )}
              </div>
              <div>
                <label className={labelCls}>Account Name</label>
                <input type="text" className={inputCls} placeholder="JUAN DELA CRUZ" value={walletForm.accountName} onChange={(e) => setWalletForm({ ...walletForm, accountName: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <label className={labelCls}>{walletForm.type === 'ewallet' ? 'Mobile Number' : walletForm.type === 'bank' ? 'Account Number' : 'Card Number'}</label>
                <input type="text" className={`${inputCls} font-mono`} placeholder={walletForm.type === 'ewallet' ? '09XXXXXXXXX' : walletForm.type === 'card' ? '0000 0000 0000 0000' : '0000000000'} value={walletForm.accountNumber} onChange={(e) => setWalletForm({ ...walletForm, accountNumber: e.target.value })} />
              </div>
              {walletForm.type === 'card' && (
                <div className="grid grid-cols-2 gap-5">
                  <div><label className={labelCls}>Expiry</label><input type="text" className={`${inputCls} font-mono`} placeholder="MM/YY" value={walletForm.expiry} onChange={(e) => setWalletForm({ ...walletForm, expiry: e.target.value })} /></div>
                  <div><label className={labelCls}>CVV</label><input type="text" className={`${inputCls} font-mono`} placeholder="123" value={walletForm.cvv} onChange={(e) => setWalletForm({ ...walletForm, cvv: e.target.value })} /></div>
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => { setShowAddWalletModal(false); setWalletForm({ type: 'ewallet', provider: 'GCash', accountName: '', accountNumber: '', expiry: '', cvv: '' }); }} className="flex-1 py-3 rounded-none border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">Cancel</button>
              <button onClick={submitNewWallet} className="flex-1 py-3 rounded-none bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm transition-all active:scale-95">Save Method</button>
            </div>
          </div>
        </div>
      )}
 </div>
 );
}
