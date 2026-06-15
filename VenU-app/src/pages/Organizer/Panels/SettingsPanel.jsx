import React, { useState, useRef } from 'react';
import { User, Camera, KeyRound, Eye, EyeOff, Building2, MapPin, FileText, UploadCloud, CheckCircle2, Shield, Bell } from 'lucide-react';
import { PHILIPPINE_GOVERNMENT_IDS } from '../../../utils/constants.js';

export default function SettingsPanel({ currentUser }) {
    const [activeTab, setActiveTab] = useState('profile');
    
    // Profile state
    const [profileImage, setProfileImage] = useState(null);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) setProfileImage(URL.createObjectURL(file));
    };

    const handleFileChange = (e, setter) => {
        const file = e.target.files[0];
        if (file) setter(URL.createObjectURL(file));
    };

    const handleSave = () => {
        alert("Successfully saved!");
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

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-purple-400 focus:bg-white transition";
    const labelCls = "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2";

    const Section = ({ title, children, className = "", icon: Icon }) => (
        <div className={`bg-white border border-slate-100 shadow-sm rounded-2xl p-6 mb-6 ${className}`}>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
                {Icon && <Icon size={18} className="text-[#a855f7]" />} {title}
            </h3>
            {children}
        </div>
    );

    const SaveBtn = ({ label }) => (
        <button onClick={handleSave} className="w-full mt-4 py-3 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold text-sm shadow-md transition-all active:scale-95">
            {label}
        </button>
    );

    const ToggleSwitch = ({ label, description, enabled, onChange }) => (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div className="pr-4">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`w-11 h-6 rounded-full flex items-center transition-all px-1 shrink-0 ${enabled ? 'bg-[#A855F7]' : 'bg-slate-300'}`}
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

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="mb-8">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Organizer Dashboard</p>
                <h1 className="text-3xl font-bold tracking-tight mt-1 text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500 mt-1">Manage your organizer profile, verification, and preferences.</p>
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
                    <div className="animate-fade-in space-y-6">
                        <Section title="Personal & Position Details" icon={User}>
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="flex flex-col items-center gap-3">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-full">
                                        Profile Picture
                                    </label>
                                    <div className="relative group w-24 h-24">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-2xl overflow-hidden shadow-md border-2 border-white">
                                            {profileImage ? (
                                                <img src={profileImage} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                currentUser?.firstName?.charAt(0) || "O"
                                            )}
                                        </div>
                                        <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 cursor-pointer transition">
                                            <Camera size={16} className="text-white" />
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-400 max-w-[120px] text-center">JPG or PNG. Max 2MB.</p>
                                </div>
                                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelCls}>First Name</label>
                                        <input type="text" defaultValue={currentUser?.firstName || ''} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Last Name</label>
                                        <input type="text" defaultValue={currentUser?.lastName || ''} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Official Position / Designation</label>
                                        <input type="text" placeholder="e.g. Event Organizer" className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Contact Number</label>
                                        <input type="text" placeholder="09XX XXX XXXX" className={inputCls} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelCls}>Corporate Email Address</label>
                                        <input type="email" defaultValue={currentUser?.email || ''} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed" disabled />
                                    </div>
                                </div>
                            </div>
                            <SaveBtn label="Save Personal Details" />
                        </Section>

                        <Section title="Organization/Business Profile Setup" icon={Building2}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                <div>
                                    <label className={labelCls}>Organization Type</label>
                                    <select className={`${inputCls} appearance-none`}>
                                        <option>LGU / Barangay / SK</option>
                                        <option>Corporate / Business</option>
                                        <option>Non-Profit Organization</option>
                                        <option>Independent / Freelance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Barangay / Council Name</label>
                                    <input type="text" placeholder="e.g. Barangay Socorro Council" className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Official Appointment / Oath of Office Document</label>
                                <div onClick={() => oathRef.current.click()} className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50/50 transition group">
                                    {oathDoc ? (
                                        <div className="flex flex-col items-center">
                                            <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                                            <p className="text-sm font-bold text-slate-700">Document Uploaded</p>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud size={32} className="text-slate-400 group-hover:text-purple-500 transition mb-3" />
                                            <p className="text-sm font-bold text-slate-700">Upload Appointment / Oath Document</p>
                                        </>
                                    )}
                                    <input type="file" ref={oathRef} onChange={(e) => handleFileChange(e, setOathDoc)} className="hidden" accept="image/*,.pdf" />
                                </div>
                            </div>
                            <SaveBtn label="Save Organization Profile" />
                        </Section>

                        <Section title="Official Base Coordinates (Address)" icon={MapPin}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <label className={labelCls}>Street Address</label>
                                    <input type="text" placeholder="House No., Street Name, Subdivision" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Region</label>
                                    <select className={`${inputCls} appearance-none`}><option>NCR</option></select>
                                </div>
                                <div>
                                    <label className={labelCls}>Province</label>
                                    <select className={`${inputCls} appearance-none`}><option>Metro Manila</option></select>
                                </div>
                                <div>
                                    <label className={labelCls}>City / Municipality</label>
                                    <select className={`${inputCls} appearance-none`}><option>Quezon City</option></select>
                                </div>
                                <div>
                                    <label className={labelCls}>Barangay</label>
                                    <select className={`${inputCls} appearance-none`}><option>Barangay Commonwealth</option></select>
                                </div>
                            </div>
                            <SaveBtn label="Save Address Updates" />
                        </Section>
                    </div>
                )}

                {/* ── VERIFICATION & BILLING TAB ── */}
                {activeTab === 'verification' && (
                    <div className="animate-fade-in space-y-6">
                        <Section title="Identity Verification" icon={FileText}>
                            <div className="mb-6">
                                <label className={labelCls}>Select Representative Gov't ID</label>
                                <select className={`${inputCls} appearance-none`}>
                                    {PHILIPPINE_GOVERNMENT_IDS.map(id => (
                                        <option key={id.id} value={id.name}>{id.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
                                <label className={labelCls}>ID Reference Number</label>
                                <input type="text" placeholder="e.g. A00000000000" className={inputCls} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div onClick={() => frontRef.current.click()} className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-300">
                                    {idFront ? <img src={idFront} alt="Front ID" className="h-20 object-contain rounded-md" /> : <p className="text-sm font-bold text-slate-700 mt-2">Upload ID Front Side</p>}
                                    <input type="file" ref={frontRef} onChange={(e) => handleFileChange(e, setIdFront)} className="hidden" accept="image/*" />
                                </div>
                                <div onClick={() => backRef.current.click()} className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-300">
                                    {idBack ? <img src={idBack} alt="Back ID" className="h-20 object-contain rounded-md" /> : <p className="text-sm font-bold text-slate-700 mt-2">Upload ID Back Side</p>}
                                    <input type="file" ref={backRef} onChange={(e) => handleFileChange(e, setIdBack)} className="hidden" accept="image/*" />
                                </div>
                            </div>
                            <div>
                                <div onClick={() => selfieRef.current.click()} className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-300">
                                    {idSelfie ? <img src={idSelfie} alt="Selfie" className="h-32 object-contain rounded-md" /> : <p className="text-sm font-bold text-slate-700 mt-2">Upload Selfie holding the Gov't ID</p>}
                                    <input type="file" ref={selfieRef} onChange={(e) => handleFileChange(e, setIdSelfie)} className="hidden" accept="image/*" />
                                </div>
                            </div>
                            <SaveBtn label="Submit Verification" />
                        </Section>

                        <Section title="Payout Wallets & Billing" icon={Shield}>
                            {wallets.length === 0 ? (
                                <div className="text-center p-8 bg-slate-50 border border-slate-200 rounded-xl">
                                    <p className="text-sm font-semibold text-slate-700 mb-2">No Payout Accounts Linked</p>
                                    <p className="text-xs text-slate-500 mb-5">Link a bank account or e-wallet to receive payout disbursements for ticket sales.</p>
                                    <button onClick={() => setShowAddWalletModal(true)} className="bg-white border border-slate-200 text-purple-600 font-bold px-5 py-2.5 rounded-xl text-sm hover:border-purple-300 shadow-sm transition">
                                        + Add Payout Method
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {wallets.map(wallet => (
                                            <div key={wallet.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full ${wallet.bg} flex items-center justify-center font-bold ${wallet.text}`}>
                                                        {wallet.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-800">{wallet.name}</p>
                                                        <p className="text-xs text-slate-500 font-medium">{wallet.value}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setWalletToUnlink(wallet)} className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline">
                                                    Unlink
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setShowAddWalletModal(true)} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition">
                                        + Link Another Payout Method
                                    </button>
                                </div>
                            )}
                        </Section>
                    </div>
                )}

                {/* ── NOTIFICATIONS TAB ── */}
                {activeTab === 'notifications' && (
                    <div className="animate-fade-in space-y-6">
                        <Section title="Notification Preferences" icon={Bell}>
                            <ToggleSwitch 
                                label="Email Notifications" 
                                description="Receive updates about your events, ticket sales, and platform announcements."
                                enabled={emailAlerts} 
                                onChange={setEmailAlerts} 
                            />
                            <ToggleSwitch 
                                label="SMS Alerts" 
                                description="Get text messages for urgent payout issues or critical security alerts."
                                enabled={smsAlerts} 
                                onChange={setSmsAlerts} 
                            />
                            <ToggleSwitch 
                                label="Marketing & Promos" 
                                description="Receive VenU organizer tips, promotional offers, and newsletters."
                                enabled={marketingAlerts} 
                                onChange={setMarketingAlerts} 
                            />
                        </Section>
                    </div>
                )}

                {/* ── SECURITY & PRIVACY TAB ── */}
                {activeTab === 'security' && (
                    <div className="animate-fade-in space-y-6">
                        <Section title="Update Password" icon={KeyRound}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                                <div>
                                    <label className={labelCls}>New Password (Min 8 chars)</label>
                                    <div className="relative">
                                        <input type={showNewPassword ? "text" : "password"} placeholder="••••••••" className={inputCls} />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Confirm New Password</label>
                                    <div className="relative">
                                        <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className={inputCls} />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <SaveBtn label="Save Password Updates" />
                        </Section>

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
                                <button onClick={() => alert("Successfully logged out of all other devices")} className="text-xs font-medium text-[#A855F7] hover:text-[#9333EA] hover:underline mt-2 transition-all">
                                    Log out of all other devices
                                </button>
                            </div>
                        </Section>

                        <Section title="Data Privacy & Transcript Privileges">
                            <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                Your data is handled strictly compliant with the Philippine Data Privacy Act of 2012 (NPC). You retain full control over your stored transcripts and cached identity documents.
                            </p>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <button onClick={handlePrintTranscript} className="border border-slate-200 text-slate-700 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 w-full md:w-auto text-center">
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

                        <Section title="Danger Zone" className="border-red-100 bg-red-50/20">
                            <p className="text-sm text-red-800 mb-4 font-bold">Once you delete your account, there is no going back. Please be certain.</p>
                            <button onClick={() => setShowDangerModal(true)} className="border border-red-200 text-red-600 hover:bg-red-50 bg-white font-bold px-5 py-3 rounded-xl transition-all text-sm active:scale-95 shadow-sm w-full md:w-auto">
                                Delete My Organizer Account Permanently
                            </button>
                        </Section>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showDangerModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-scale-in">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 border border-red-200 text-red-600 text-2xl font-bold">!</div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Account?</h2>
                        <p className="text-sm text-slate-500 mb-6">Are you sure you want to permanently delete your organizer account? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDangerModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={() => alert("Account Deletion Request Submitted.")} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-lg shadow-red-500/20">Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {walletToUnlink && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-scale-in">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 border border-red-200 text-red-600 text-2xl font-bold">!</div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Unlink Payment Method?</h2>
                        <p className="text-sm text-slate-500 mb-6">Are you sure you want to remove your <strong>{walletToUnlink.name}</strong> ending in <strong>{walletToUnlink.value.slice(-4)}</strong>?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setWalletToUnlink(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={() => { setWallets(wallets.filter(w => w.id !== walletToUnlink.id)); setWalletToUnlink(null); }} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-lg shadow-red-500/20">Yes, Unlink</button>
                        </div>
                    </div>
                </div>
            )}

            {showAddWalletModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 animate-scale-in">
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Add Payment Method</h2>
                        <p className="text-sm text-slate-500 mb-6">Enter your Philippine banking or e-wallet details.</p>
                        <div className="space-y-4 text-left">
                            <div>
                                <label className={labelCls}>Method Type</label>
                                <select className={`${inputCls} appearance-none`} value={walletForm.type} onChange={(e) => setWalletForm({ ...walletForm, type: e.target.value, provider: e.target.value === 'ewallet' ? 'GCash' : e.target.value === 'bank' ? 'BDO Unibank' : 'Visa' })}>
                                    <option value="ewallet">E-Wallet</option>
                                    <option value="bank">Bank Transfer</option>
                                    <option value="card">Credit/Debit Card</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Provider / Bank</label>
                                {walletForm.type === 'ewallet' ? (
                                    <select className={`${inputCls} appearance-none`} value={walletForm.provider} onChange={(e) => setWalletForm({ ...walletForm, provider: e.target.value })}>
                                        <option value="GCash">GCash</option>
                                        <option value="Maya">Maya</option>
                                        <option value="GrabPay">GrabPay</option>
                                    </select>
                                ) : walletForm.type === 'bank' ? (
                                    <select className={`${inputCls} appearance-none`} value={walletForm.provider} onChange={(e) => setWalletForm({ ...walletForm, provider: e.target.value })}>
                                        <option value="BDO Unibank">BDO Unibank</option>
                                        <option value="Bank of the Philippine Islands (BPI)">Bank of the Philippine Islands (BPI)</option>
                                        <option value="Metrobank">Metrobank</option>
                                        <option value="UnionBank">UnionBank</option>
                                        <option value="Security Bank">Security Bank</option>
                                    </select>
                                ) : (
                                    <select className={`${inputCls} appearance-none`} value={walletForm.provider} onChange={(e) => setWalletForm({ ...walletForm, provider: e.target.value })}>
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
                                    <div><label className={labelCls}>Expiry</label><input type="text" className={inputCls} placeholder="MM/YY" value={walletForm.expiry} onChange={(e) => setWalletForm({ ...walletForm, expiry: e.target.value })} /></div>
                                    <div><label className={labelCls}>CVV</label><input type="text" className={inputCls} placeholder="123" value={walletForm.cvv} onChange={(e) => setWalletForm({ ...walletForm, cvv: e.target.value })} /></div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => { setShowAddWalletModal(false); setWalletForm({ type: 'ewallet', provider: 'GCash', accountName: '', accountNumber: '', expiry: '', cvv: '' }); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={submitNewWallet} className="flex-1 py-2.5 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold text-sm transition-all shadow-lg shadow-purple-500/20">Save Payment Method</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}