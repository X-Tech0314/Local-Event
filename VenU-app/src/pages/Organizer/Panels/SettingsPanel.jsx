import React, { useState, useRef } from 'react';
import { User, Camera, KeyRound, Eye, EyeOff, Building2, MapPin, FileText, UploadCloud, CheckCircle2, Shield, Bell, AlertTriangle } from 'lucide-react';
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

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-[#A855F7] focus:ring-2 focus:ring-[#A855F7]/20 focus:bg-white transition-all font-medium";
    const labelCls = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2";

    const Section = ({ title, children, className = "", icon: Icon }) => (
        <div className={`bg-white border border-slate-100 shadow-sm rounded-3xl p-8 mb-6 ${className}`}>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                {Icon && <div className="p-2 rounded-xl bg-purple-50 text-[#A855F7]"><Icon size={18} strokeWidth={2.5} /></div>} {title}
            </h3>
            {children}
        </div>
    );

    const SaveBtn = ({ label }) => (
        <div className="pt-6 mt-6 border-t border-slate-100">
            <button onClick={handleSave} className="w-full md:w-auto px-8 py-3 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold text-sm shadow-lg shadow-purple-500/30 transition-all active:scale-95">
                {label}
            </button>
        </div>
    );

    const ToggleSwitch = ({ label, description, enabled, onChange }) => (
        <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 group cursor-pointer" onClick={() => onChange(!enabled)}>
            <div className="pr-4">
                <p className={`text-sm font-black transition-colors ${enabled ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>{label}</p>
                {description && <p className="text-xs font-medium text-slate-500 mt-1">{description}</p>}
            </div>
            <div
                className={`w-12 h-7 rounded-full flex items-center transition-all px-1 shrink-0 ${enabled ? 'bg-[#A855F7] shadow-inner' : 'bg-slate-200 border border-slate-300'}`}
            >
                <div className={`w-5 h-5 rounded-full bg-white transition-all transform shadow-sm ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
        </div>
    );

    const tabs = [
        { id: 'profile', label: 'Profile & Identity' },
        { id: 'verification', label: 'Billing & Verification' },
        { id: 'notifications', label: 'Communication Hub' },
        { id: 'security', label: 'Security & Access' }
    ];

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Platform Settings</h1>
                <p className="text-slate-500 font-medium mt-1">Configure your deployment preferences and security parameters.</p>
            </div>

            {/* Premium Pill Tabs */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto flex gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 text-center ${activeTab === tab.id
                            ? 'bg-[#A855F7] text-white shadow-md'
                            : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* ── PROFILE & IDENTITY TAB ── */}
                {activeTab === 'profile' && (
                    <div className="animate-fade-in space-y-6">
                        <Section title="Base Identification" icon={User}>
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="flex flex-col items-center gap-4">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-full">
                                        Avatar Sync
                                    </label>
                                    <div className="relative group w-32 h-32">
                                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#A855F7] to-indigo-600 flex items-center justify-center font-black text-white text-4xl overflow-hidden shadow-xl border-4 border-white transform transition-transform group-hover:scale-105">
                                            {profileImage ? (
                                                <img src={profileImage} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                currentUser?.firstName?.charAt(0) || "O"
                                            )}
                                        </div>
                                        <label className="absolute inset-0 bg-slate-900/60 rounded-3xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                                            <Camera size={20} className="text-white" />
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelCls}>Legal First Name</label>
                                        <input type="text" defaultValue={currentUser?.firstName || ''} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Legal Last Name</label>
                                        <input type="text" defaultValue={currentUser?.lastName || ''} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Official Designation</label>
                                        <input type="text" placeholder="e.g. Master Organizer" className={inputCls} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Secure Contact Line</label>
                                        <input type="text" placeholder="+63 9XX XXX XXXX" className={inputCls} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelCls}>Immutable Registry Email</label>
                                        <input type="email" defaultValue={currentUser?.email || ''} className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 cursor-not-allowed select-none" disabled />
                                    </div>
                                </div>
                            </div>
                            <SaveBtn label="Sync Personal Identity" />
                        </Section>

                        <Section title="Corporate Base / Entity Setup" icon={Building2}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className={labelCls}>Entity Structure</label>
                                    <select className={`${inputCls} appearance-none cursor-pointer`}>
                                        <option>LGU / Barangay / SK</option>
                                        <option>Corporate / Business</option>
                                        <option>Non-Profit Organization</option>
                                        <option>Independent / Freelance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Registered Entity Name</label>
                                    <input type="text" placeholder="e.g. Genesis Events Corp." className={inputCls} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>Base Operation Documents (Oath / Permit)</label>
                                <div onClick={() => oathRef.current.click()} className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#A855F7]/40 hover:bg-[#A855F7]/5 transition-all group">
                                    {oathDoc ? (
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full mb-3">
                                                <CheckCircle2 size={32} strokeWidth={2.5} />
                                            </div>
                                            <p className="text-sm font-black text-slate-800">Document Uploaded Successfully</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-4 bg-white shadow-sm border border-slate-100 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                                <UploadCloud size={32} className="text-[#A855F7]" />
                                            </div>
                                            <p className="text-sm font-black text-slate-800 mb-1">Inject Permit Document Here</p>
                                            <p className="text-xs font-medium text-slate-400">PDF, JPG, or PNG under 5MB</p>
                                        </>
                                    )}
                                    <input type="file" ref={oathRef} onChange={(e) => handleFileChange(e, setOathDoc)} className="hidden" accept="image/*,.pdf" />
                                </div>
                            </div>
                            <SaveBtn label="Update Corporate Base" />
                        </Section>
                    </div>
                )}

                {/* ── BILLING & VERIFICATION TAB ── */}
                {activeTab === 'verification' && (
                    <div className="animate-fade-in space-y-6">
                        <Section title="KYC Verification Matrix" icon={FileText}>
                            <div className="mb-6">
                                <label className={labelCls}>Authorized Government ID Selection</label>
                                <select className={`${inputCls} appearance-none cursor-pointer`}>
                                    {PHILIPPINE_GOVERNMENT_IDS.map(id => (
                                        <option key={id.id} value={id.name}>{id.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-8">
                                <label className={labelCls}>Unique ID Reference Node</label>
                                <input type="text" placeholder="e.g. A000-1234-5678" className={`${inputCls} font-mono tracking-widest`} />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div onClick={() => frontRef.current.click()} className="h-48 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#A855F7]/40 hover:bg-[#A855F7]/5 transition-all overflow-hidden p-2">
                                    {idFront ? <img src={idFront} alt="Front ID" className="w-full h-full object-contain rounded-xl" /> : <p className="text-xs font-black uppercase tracking-widest text-slate-500">Scan ID Front Side</p>}
                                    <input type="file" ref={frontRef} onChange={(e) => handleFileChange(e, setIdFront)} className="hidden" accept="image/*" />
                                </div>
                                <div onClick={() => backRef.current.click()} className="h-48 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#A855F7]/40 hover:bg-[#A855F7]/5 transition-all overflow-hidden p-2">
                                    {idBack ? <img src={idBack} alt="Back ID" className="w-full h-full object-contain rounded-xl" /> : <p className="text-xs font-black uppercase tracking-widest text-slate-500">Scan ID Back Side</p>}
                                    <input type="file" ref={backRef} onChange={(e) => handleFileChange(e, setIdBack)} className="hidden" accept="image/*" />
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <div onClick={() => selfieRef.current.click()} className="h-48 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#A855F7]/40 hover:bg-[#A855F7]/5 transition-all overflow-hidden p-2">
                                    {idSelfie ? <img src={idSelfie} alt="Selfie" className="w-full h-full object-contain rounded-xl" /> : <p className="text-xs font-black uppercase tracking-widest text-slate-500">Live Liveness Check (Selfie + ID)</p>}
                                    <input type="file" ref={selfieRef} onChange={(e) => handleFileChange(e, setIdSelfie)} className="hidden" accept="image/*" />
                                </div>
                            </div>
                            <SaveBtn label="Transmit KYC Data" />
                        </Section>

                        <Section title="Payout Pipelines (Wallets & Banks)" icon={Shield}>
                            {wallets.length === 0 ? (
                                <div className="text-center py-12 px-6 bg-slate-50 border border-slate-200 rounded-2xl">
                                    <Shield size={48} className="mx-auto text-slate-300 mb-4" strokeWidth={1} />
                                    <p className="text-lg font-black text-slate-900 mb-2">No Payout Pipelines Established</p>
                                    <p className="text-sm font-medium text-slate-500 mb-6 max-w-sm mx-auto">You must link a verified payout source to intercept ticketing revenue.</p>
                                    <button onClick={() => setShowAddWalletModal(true)} className="bg-white border border-slate-200 text-[#A855F7] font-bold px-8 py-3 rounded-xl shadow-sm hover:border-[#A855F7]/40 hover:shadow-md transition-all active:scale-95">
                                        + Establish Pipeline
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                        {wallets.map(wallet => (
                                            <div key={wallet.id} className="border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:border-[#A855F7]/40 hover:shadow-lg transition-all group bg-white">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl ${wallet.bg} flex items-center justify-center font-black text-lg ${wallet.text} shadow-sm group-hover:scale-110 transition-transform`}>
                                                        {wallet.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 leading-tight">{wallet.name}</p>
                                                        <p className="text-xs font-bold text-slate-500 font-mono mt-1">{wallet.value}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => setWalletToUnlink(wallet)} className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                                                    Unlink
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setShowAddWalletModal(true)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-500 hover:text-[#A855F7] hover:bg-[#A855F7]/5 hover:border-[#A855F7]/40 transition-all">
                                        + Establish Additional Pipeline
                                    </button>
                                </div>
                            )}
                        </Section>
                    </div>
                )}

                {/* ── COMMUNICATION HUB TAB (NOTICEABLE REDESIGN) ── */}
                {activeTab === 'notifications' && (
                    <div className="animate-fade-in space-y-6">
                        {/* High-Notice Banner */}
                        <div className="bg-gradient-to-br from-[#A855F7] to-indigo-600 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[50px] rounded-full pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/20">
                                    <Bell size={32} strokeWidth={2.5} className="animate-[wiggle_1s_ease-in-out_infinite]" />
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-2xl font-black tracking-tight mb-2">Communication Array is Active</h2>
                                    <p className="text-sm font-medium text-purple-100 max-w-lg">Customize how and when you intercept system critical alerts, financial disbursements, and platform updates. Ensure your primary channel remains unmuted.</p>
                                </div>
                            </div>
                        </div>

                        <Section title="Communication Preferences">
                            <div className="space-y-2">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#A855F7]/30 transition-colors">
                                    <ToggleSwitch 
                                        label="System Email Intel" 
                                        description="Receive standard system logs: ticket sales, platform announcements, and schedule updates."
                                        enabled={emailAlerts} 
                                        onChange={setEmailAlerts} 
                                    />
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#A855F7]/30 transition-colors">
                                    <ToggleSwitch 
                                        label="Critical SMS Override" 
                                        description="Direct text dispatches for urgent payout failures, security breaches, or immediate action."
                                        enabled={smsAlerts} 
                                        onChange={setSmsAlerts} 
                                    />
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#A855F7]/30 transition-colors">
                                    <ToggleSwitch 
                                        label="Marketing & Intel Briefs" 
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
                    <div className="animate-fade-in space-y-6">
                        <Section title="Cryptographic Access" icon={KeyRound}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className={labelCls}>New Encryption Key (Min 8 chars)</label>
                                    <div className="relative">
                                        <input type={showNewPassword ? "text" : "password"} placeholder="••••••••" className={inputCls} />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#A855F7] transition-colors">
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Verify Encryption Key</label>
                                    <div className="relative">
                                        <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className={inputCls} />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#A855F7] transition-colors">
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <SaveBtn label="Flash New Key" />
                        </Section>

                        <Section title="Account Security Protocols">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                                <ToggleSwitch
                                    label="Two-Factor Authentication (2FA) Protocol"
                                    description="Mandate a secondary cryptographic handshake during sign-in procedures."
                                    enabled={twoFactorEnabled}
                                    onChange={setTwoFactorEnabled}
                                />
                            </div>
                            
                            <div className="p-6 border border-slate-100 rounded-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Live Session Nodes</p>
                                <p className="text-sm font-bold text-slate-900 mb-4">Current Node: <span className="text-[#A855F7]">Antigravity IDE Workspace Client</span></p>
                                <button onClick={() => alert("Successfully severed all external connections")} className="px-6 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors active:scale-95">
                                    Sever All Other Node Connections
                                </button>
                            </div>
                        </Section>

                        <Section title="Data Governance & Transcripts">
                            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-inner mb-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#A855F7]/20 blur-2xl rounded-full"></div>
                                <p className="text-sm font-medium text-slate-300 relative z-10">
                                    Your data traces are handled strictly compliant with the <strong className="text-white">Philippine Data Privacy Act of 2012 (NPC)</strong>. You retain sovereign control over your metadata transcripts and cached KYC documents.
                                </p>
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex-1">
                                    <ToggleSwitch
                                        label="Purge Decentralized Cache Post-Event"
                                        description="Automatically obliterate document traces from server nodes 30 days after an event finishes."
                                        enabled={purgeCache}
                                        onChange={setPurgeCache}
                                    />
                                </div>
                                <button onClick={handlePrintTranscript} className="border-2 border-[#A855F7] text-[#A855F7] font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#A855F7]/10 transition-all active:scale-95 whitespace-nowrap">
                                    Export Metadata
                                </button>
                            </div>
                        </Section>

                        {/* Completely Isolated Danger Zone */}
                        <div className="mt-12 bg-red-50/50 border border-red-200 rounded-3xl p-8 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors pointer-events-none"></div>
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                                    <AlertTriangle size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-red-700 mb-2">Nuclear Option: Permanent Deletion</h3>
                                    <p className="text-sm font-medium text-red-900/70 mb-6 max-w-xl">
                                        Executing this protocol will permanently eradicate your organizer account, active deployments, and ticketing revenue history. This action is irreversible.
                                    </p>
                                    <button onClick={() => setShowDangerModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-black text-sm px-8 py-3 rounded-xl shadow-lg shadow-red-500/30 transition-all active:scale-95">
                                        Initiate Self-Destruct Sequence
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
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center animate-scale-in border border-slate-100">
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 border border-red-100 text-red-600">
                            <AlertTriangle size={32} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-3">Authorize Deletion?</h2>
                        <p className="text-sm font-medium text-slate-500 mb-8">Are you absolute sure you want to permanently erase your existence from the VenU network?</p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowDangerModal(false)} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95">Abort</button>
                            <button onClick={() => alert("Deletion Sequence Activated.")} className="flex-1 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/30 active:scale-95">Confirm Erase</button>
                        </div>
                    </div>
                </div>
            )}

            {walletToUnlink && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center animate-scale-in border border-slate-100">
                        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6 border border-red-100 text-red-500">
                            <Shield size={24} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 mb-2">Sever Pipeline?</h2>
                        <p className="text-sm font-medium text-slate-500 mb-8">Are you sure you want to sever your connection to <strong>{walletToUnlink.name}</strong> ending in <strong className="font-mono">{walletToUnlink.value.slice(-4)}</strong>?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setWalletToUnlink(null)} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95">Cancel</button>
                            <button onClick={() => { setWallets(wallets.filter(w => w.id !== walletToUnlink.id)); setWalletToUnlink(null); }} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/30 active:scale-95">Sever Link</button>
                        </div>
                    </div>
                </div>
            )}

            {showAddWalletModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden p-8 animate-scale-in border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Establish Pipeline</h2>
                        <p className="text-sm font-medium text-slate-500 mb-8">Input secure routing parameters for financial disbursements.</p>
                        
                        <div className="space-y-5 text-left">
                            <div>
                                <label className={labelCls}>Routing Infrastructure</label>
                                <select className={`${inputCls} appearance-none cursor-pointer`} value={walletForm.type} onChange={(e) => setWalletForm({ ...walletForm, type: e.target.value, provider: e.target.value === 'ewallet' ? 'GCash' : e.target.value === 'bank' ? 'BDO Unibank' : 'Visa' })}>
                                    <option value="ewallet">Mobile E-Wallet</option>
                                    <option value="bank">Traditional Bank Transfer</option>
                                    <option value="card">Credit/Debit Network</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Institution / Node</label>
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
                                <label className={labelCls}>Verified Legal Name</label>
                                <input type="text" className={inputCls} placeholder="JUAN DELA CRUZ" value={walletForm.accountName} onChange={(e) => setWalletForm({ ...walletForm, accountName: e.target.value.toUpperCase() })} />
                            </div>
                            <div>
                                <label className={labelCls}>{walletForm.type === 'ewallet' ? 'Mobile MSISDN' : walletForm.type === 'bank' ? 'Account Identifier' : '16-Digit Card Vector'}</label>
                                <input type="text" className={`${inputCls} font-mono`} placeholder={walletForm.type === 'ewallet' ? '09XXXXXXXXX' : walletForm.type === 'card' ? '0000 0000 0000 0000' : '0000000000'} value={walletForm.accountNumber} onChange={(e) => setWalletForm({ ...walletForm, accountNumber: e.target.value })} />
                            </div>
                            {walletForm.type === 'card' && (
                                <div className="grid grid-cols-2 gap-5">
                                    <div><label className={labelCls}>Expiration Matrix</label><input type="text" className={`${inputCls} font-mono`} placeholder="MM/YY" value={walletForm.expiry} onChange={(e) => setWalletForm({ ...walletForm, expiry: e.target.value })} /></div>
                                    <div><label className={labelCls}>Security Crypt (CVV)</label><input type="text" className={`${inputCls} font-mono`} placeholder="123" value={walletForm.cvv} onChange={(e) => setWalletForm({ ...walletForm, cvv: e.target.value })} /></div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4 mt-10 border-t border-slate-100 pt-6">
                            <button onClick={() => { setShowAddWalletModal(false); setWalletForm({ type: 'ewallet', provider: 'GCash', accountName: '', accountNumber: '', expiry: '', cvv: '' }); }} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95">Abort Request</button>
                            <button onClick={submitNewWallet} className="flex-1 py-3.5 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold text-sm transition-all shadow-lg shadow-purple-500/30 active:scale-95">Establish Route</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}