import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, MapPin, Calendar, Users, Lock, Unlock, Plus, Trash2, CheckCircle, ChevronRight, ChevronLeft, Map, Ticket, Music, Trophy } from 'lucide-react';

const locationData = {
    "NCR": {
        "Metro Manila": {
            "Quezon City": ["Brgy. Laging Handa", "Brgy. Kamuning", "Brgy. Sacred Heart"],
            "Manila": ["Brgy. 1", "Brgy. 2", "Brgy. 3"],
            "Pasig": ["Brgy. Kapitolyo", "Brgy. Oranbo", "Brgy. San Antonio"]
        }
    },
    "Region IV-A": {
        "Cavite": {
            "Dasmariñas": ["Dasmariñas, Cavite", "Brgy. San Jose", "Brgy. Paliparan"],
            "Imus": ["Brgy. Buhay na Tubig", "Brgy. Carsadang Bago", "Brgy. Malagasang"],
            "Bacoor": ["Brgy. Molino", "Brgy. Niog", "Brgy. Panapaan"]
        },
        "Laguna": {
            "Santa Rosa": ["Brgy. Balibago", "Brgy. Dila", "Brgy. Macabling"],
            "Calamba": ["Brgy. Real", "Brgy. Halang", "Brgy. Parian"]
        },
        "Batangas": {
            "Lipa": ["Brgy. Marawoy", "Brgy. Tambo", "Brgy. Balintawak"],
            "Batangas City": ["Brgy. Alangilan", "Brgy. Kumintang", "Brgy. Balagtas"]
        }
    }
};

export default function CreateEventPanel({ currentUser }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    const [formData, setFormData] = useState({
        Title: '',
        Description: '',
        Category: 'Sports',
        CustomCategory: '',
        BannerFile: null,
        BannerUrl: '',
        StartDate: '',
        StartTime: '',
        EndDate: '',
        EndTime: '',
        StreetAddress: '',
        Region: '',
        Province: '',
        City: '',
        Barangay: '',
        ZipCode: '',
        Latitude: '',
        Longitude: '',
        AccessType: 'Public',
        VerificationCode: '',
        MaxCapacity: '',
        TicketTiers: []
    });

    const [errors, setErrors] = useState({});
    const [admissionStrategy, setAdmissionStrategy] = useState('Paid Admission');

    const fileInputRef = useRef(null);

    const validateField = (name, value) => {
        let errorMsg = '';
        if (!value || value.toString().trim() === '') {
            errorMsg = `* ${name.replace(/([A-Z])/g, ' $1').trim()} is required`;
        }
        
        if (name === 'ZipCode' && value) {
            if (!/^\d{4}$/.test(value)) {
                errorMsg = '* ZIP Code must be 4 numeric digits';
            }
        }
        
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
        return errorMsg === '';
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleLocationChange = (level, value) => {
        const updates = { [level]: value };
        
        if (level === 'Region') {
            updates.Province = '';
            updates.City = '';
            updates.Barangay = '';
        } else if (level === 'Province') {
            updates.City = '';
            updates.Barangay = '';
        } else if (level === 'City') {
            updates.Barangay = '';
        }

        setFormData(prev => ({ ...prev, ...updates }));
        
        setErrors(prev => {
            const newErrors = { ...prev };
            if (newErrors[level]) delete newErrors[level];
            if (level === 'Region') { delete newErrors.Province; delete newErrors.City; delete newErrors.Barangay; }
            if (level === 'Province') { delete newErrors.City; delete newErrors.Barangay; }
            if (level === 'City') { delete newErrors.Barangay; }
            return newErrors;
        });
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        processFile(file);
    };

    const processFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            setFormData(prev => ({ ...prev, BannerFile: file }));
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const addTicketTier = () => {
        setFormData(prev => ({
            ...prev,
            TicketTiers: [
                ...prev.TicketTiers,
                { TierName: '', AllocatedSlots: 0, Price: admissionStrategy === 'Free Admission' ? 0 : '' }
            ]
        }));
    };

    const updateTicketTier = (index, field, value) => {
        const newTiers = [...formData.TicketTiers];
        newTiers[index][field] = value;
        setFormData(prev => ({ ...prev, TicketTiers: newTiers }));
    };

    const removeTicketTier = (index) => {
        const newTiers = [...formData.TicketTiers];
        newTiers.splice(index, 1);
        setFormData(prev => ({ ...prev, TicketTiers: newTiers }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const startDateTime = formData.StartDate && formData.StartTime 
                ? new Date(`${formData.StartDate}T${formData.StartTime}`).toISOString() 
                : new Date().toISOString();
            
            const endDateTime = formData.EndDate && formData.EndTime 
                ? new Date(`${formData.EndDate}T${formData.EndTime}`).toISOString() 
                : new Date().toISOString();

            const finalCategory = formData.Category === 'Others' ? formData.CustomCategory : formData.Category;

            const payload = {
                title: formData.Title,
                description: formData.Description,
                category: finalCategory,
                bannerUrl: formData.BannerUrl || '',
                startDateTime: startDateTime,
                endDateTime: endDateTime,
                streetAddress: formData.StreetAddress,
                barangay: formData.Barangay,
                city: formData.City,
                province: formData.Province,
                region: formData.Region,
                zipCode: formData.ZipCode,
                latitude: formData.Latitude ? parseFloat(formData.Latitude) : null,
                longitude: formData.Longitude ? parseFloat(formData.Longitude) : null,
                accessType: formData.AccessType,
                verificationCode: formData.AccessType === 'Private' ? formData.VerificationCode : null,
                maxCapacity: parseInt(formData.MaxCapacity) || 0,
                ticketTiers: formData.TicketTiers.map(t => ({
                    tierName: t.TierName,
                    allocatedSlots: parseInt(t.AllocatedSlots) || 0,
                    price: admissionStrategy === 'Free Admission' ? 0.00 : parseFloat(t.Price) || 0.00
                }))
            };

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setShowSuccess(true);
            } else {
                console.error('Failed to create event', await response.text());
            }
        } catch (error) {
            console.error('Error submitting form', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-10 animate-fade-in text-center">
                <CheckCircle className="text-[#A855F7] w-24 h-24 mb-6 shadow-lg shadow-purple-500/20 rounded-full bg-white" />
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Event Published!</h2>
                <p className="text-slate-500 text-lg max-w-md mx-auto">Your event has been successfully scheduled and loaded into the platform discovery loops.</p>
                <button 
                    onClick={() => {
                        setShowSuccess(false);
                        setCurrentStep(1);
                        setFormData({
                            Title: '', Description: '', Category: 'Sports', CustomCategory: '', BannerFile: null, BannerUrl: '',
                            StartDate: '', StartTime: '', EndDate: '', EndTime: '', StreetAddress: '', Barangay: '', City: '',
                            Province: '', Region: '', ZipCode: '', Latitude: '', Longitude: '', AccessType: 'Public',
                            VerificationCode: '', MaxCapacity: '', TicketTiers: []
                        });
                        setErrors({});
                        setBannerPreview(null);
                    }}
                    className="mt-8 bg-[#a855f7] hover:bg-[#9333ea] text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
                >
                    Create Another Event
                </button>
            </div>
        );
    }

    const availableRegions = Object.keys(locationData);
    const availableProvinces = formData.Region ? Object.keys(locationData[formData.Region] || {}) : [];
    const availableCities = formData.Province && formData.Region ? Object.keys(locationData[formData.Region][formData.Province] || {}) : [];
    const availableBarangays = formData.City && formData.Province && formData.Region ? (locationData[formData.Region][formData.Province][formData.City] || []) : [];

    return (
        <div className="w-full max-w-7xl mx-auto pb-10">
            {/* Global Horizontal Progress Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create New Event</h1>
                <p className="text-slate-500 mt-2 font-medium">Publish a new community event to your audience.</p>
            </div>

            {/* Split Screen Wrapper Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[85vh] gap-0 bg-slate-50/30 overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                
                {/* COLUMN 1: WIZARD FORM INPUT WORKSPACE */}
                <div className="lg:col-span-7 bg-white p-8 lg:p-12 relative overflow-y-auto">
                    <div className="max-w-2xl mx-auto w-full">
                        
                        {/* Step Tracker Ribbon with Glowing Active States */}
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 relative">
                            <div className="flex items-center gap-3 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${currentStep === 1 ? 'bg-[#A855F7] text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-110 ring-4 ring-[#A855F7]/20' : currentStep > 1 ? 'bg-[#A855F7]/10 border border-[#A855F7]/30 text-[#A855F7]' : 'bg-slate-100 text-slate-400'}`}>
                                    {currentStep > 1 ? <CheckCircle size={14} /> : 1}
                                </div>
                                <span className={`font-bold text-xs tracking-wide transition-colors ${currentStep === 1 ? 'text-[#A855F7]' : currentStep > 1 ? 'text-slate-900' : 'text-slate-400'}`}>Basic Info</span>
                            </div>
                            <div className={`h-px flex-1 mx-4 transition-colors duration-500 ${currentStep >= 2 ? 'bg-[#A855F7]/50' : 'bg-slate-100'}`}></div>
                            
                            <div className="flex items-center gap-3 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${currentStep === 2 ? 'bg-[#A855F7] text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-110 ring-4 ring-[#A855F7]/20' : currentStep > 2 ? 'bg-[#A855F7]/10 border border-[#A855F7]/30 text-[#A855F7]' : 'bg-slate-100 text-slate-400'}`}>
                                    {currentStep > 2 ? <CheckCircle size={14} /> : 2}
                                </div>
                                <span className={`font-bold text-xs tracking-wide transition-colors ${currentStep === 2 ? 'text-[#A855F7]' : currentStep > 2 ? 'text-slate-900' : 'text-slate-400'}`}>Logistics</span>
                            </div>
                            <div className={`h-px flex-1 mx-4 transition-colors duration-500 ${currentStep >= 3 ? 'bg-[#A855F7]/50' : 'bg-slate-100'}`}></div>
                            
                            <div className="flex items-center gap-3 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${currentStep === 3 ? 'bg-[#A855F7] text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-110 ring-4 ring-[#A855F7]/20' : 'bg-slate-100 text-slate-400'}`}>
                                    3
                                </div>
                                <span className={`font-bold text-xs tracking-wide transition-colors ${currentStep === 3 ? 'text-[#A855F7]' : 'text-slate-400'}`}>Ticketing</span>
                            </div>
                        </div>

                        {/* STEP 1: Core Event Specifications */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Title</label>
                                        <input 
                                            type="text" name="Title" value={formData.Title} onChange={handleInputChange} onBlur={handleBlur}
                                            placeholder="Epic Summer Music Festival"
                                            className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 transition-all ${errors.Title ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#A855F7] focus:ring-[#A855F7]'}`}
                                        />
                                        {errors.Title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.Title}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category Tag</label>
                                        <select 
                                            name="Category" value={formData.Category} onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition-all"
                                        >
                                            <option value="Sports">Sports</option>
                                            <option value="Concerts">Concerts</option>
                                            <option value="Festivals">Festivals</option>
                                            <option value="Private Gatherings">Private Gatherings</option>
                                            <option value="Others">Others</option>
                                        </select>
                                        
                                        {formData.Category === 'Others' && (
                                            <div className="mt-3 animate-fade-in">
                                                <input 
                                                    type="text" name="CustomCategory" value={formData.CustomCategory} onChange={handleInputChange} onBlur={handleBlur}
                                                    placeholder="Specify Custom Category"
                                                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 transition-all ${errors.CustomCategory ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#A855F7] focus:ring-[#A855F7]'}`}
                                                />
                                                {errors.CustomCategory && <p className="text-red-500 text-xs mt-1 font-medium">{errors.CustomCategory}</p>}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Description</label>
                                        <textarea 
                                            name="Description" value={formData.Description} onChange={handleInputChange} onBlur={handleBlur}
                                            rows="4" placeholder="Describe the awesome experiences waiting for the attendees..."
                                            className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 transition-all resize-none ${errors.Description ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-[#A855F7] focus:ring-[#A855F7]'}`}
                                        ></textarea>
                                        {errors.Description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.Description}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Banner / Cover Thumbnail</label>
                                    <div 
                                        onDragOver={(e) => e.preventDefault()} 
                                        onDrop={handleFileDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full h-[240px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group
                                            ${bannerPreview ? 'border-slate-300' : 'border-slate-300 hover:border-[#A855F7]/50 hover:bg-[#A855F7]/5 bg-slate-50'}`}
                                    >
                                        {bannerPreview ? (
                                            <>
                                                <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="bg-slate-900/80 text-white px-4 py-2 rounded-lg font-medium text-sm backdrop-blur-sm">Replace Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400 group-hover:text-[#A855F7] transition-colors">
                                                <Upload size={28} className="mb-3" />
                                                <p className="font-bold text-sm mb-1 text-slate-600">Drag & drop your banner here</p>
                                                <p className="text-xs">Supports JPG, PNG (Max 5MB)</p>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-slate-100">
                                    <button 
                                        onClick={() => {
                                            const tValid = validateField('Title', formData.Title);
                                            const dValid = validateField('Description', formData.Description);
                                            const cValid = formData.Category === 'Others' ? validateField('CustomCategory', formData.CustomCategory) : true;
                                            if (tValid && dValid && cValid) setCurrentStep(2);
                                        }}
                                        className="w-full bg-[#A855F7] hover:bg-[#9333ea] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-lg shadow-purple-500/20"
                                    >
                                        Continue to Logistics <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Logistics, Timestamps & Base Coordinates */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Calendar size={16} className="text-[#A855F7]" /> Decoupled Chronological Schedule</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                                            <input type="date" name="StartDate" value={formData.StartDate} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white border rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 transition-all ${errors.StartDate ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-[#A855F7]'}`} />
                                            {errors.StartDate && <p className="text-red-500 text-[10px]">{errors.StartDate}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
                                            <input type="time" name="StartTime" value={formData.StartTime} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white border rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 transition-all ${errors.StartTime ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-[#A855F7]'}`} />
                                            {errors.StartTime && <p className="text-red-500 text-[10px]">{errors.StartTime}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">End Date</label>
                                            <input type="date" name="EndDate" value={formData.EndDate} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white border rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 transition-all ${errors.EndDate ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-[#A855F7]'}`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">End Time</label>
                                            <input type="time" name="EndTime" value={formData.EndTime} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white border rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 transition-all ${errors.EndTime ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-[#A855F7]'}`} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><MapPin size={16} className="text-[#A855F7]" /> Location Details</h3>
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Street Address</label>
                                            <input type="text" name="StreetAddress" value={formData.StreetAddress} onChange={handleInputChange} onBlur={handleBlur} placeholder="123 Main Avenue, Building Floor..." className={`w-full bg-white border rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 transition-all ${errors.StreetAddress ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-[#A855F7]'}`} />
                                            {errors.StreetAddress && <p className="text-red-500 text-[10px] mt-1">{errors.StreetAddress}</p>}
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Region</label>
                                                <select 
                                                    name="Region" value={formData.Region} 
                                                    onChange={(e) => handleLocationChange('Region', e.target.value)} onBlur={handleBlur}
                                                    className={`w-full bg-white border rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none transition-all ${errors.Region ? 'border-red-400 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7]'}`}
                                                >
                                                    <option value="">Select Region...</option>
                                                    {availableRegions.map(region => (
                                                        <option key={region} value={region}>{region}</option>
                                                    ))}
                                                </select>
                                                {errors.Region && <p className="text-red-500 text-[10px] mt-1">{errors.Region}</p>}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Province</label>
                                                <select 
                                                    name="Province" value={formData.Province} disabled={!formData.Region}
                                                    onChange={(e) => handleLocationChange('Province', e.target.value)} onBlur={handleBlur}
                                                    className={`w-full ${!formData.Region ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-white'} border rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none transition-all ${errors.Province ? 'border-red-400 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7]'}`}
                                                >
                                                    <option value="">Select Province...</option>
                                                    {availableProvinces.map(prov => (
                                                        <option key={prov} value={prov}>{prov}</option>
                                                    ))}
                                                </select>
                                                {errors.Province && <p className="text-red-500 text-[10px] mt-1">{errors.Province}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">City / Muni</label>
                                                <select 
                                                    name="City" value={formData.City} disabled={!formData.Province}
                                                    onChange={(e) => handleLocationChange('City', e.target.value)} onBlur={handleBlur}
                                                    className={`w-full ${!formData.Province ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-white'} border rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none transition-all ${errors.City ? 'border-red-400 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7]'}`}
                                                >
                                                    <option value="">Select City...</option>
                                                    {availableCities.map(city => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                                {errors.City && <p className="text-red-500 text-[10px] mt-1">{errors.City}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Barangay</label>
                                                <select 
                                                    name="Barangay" value={formData.Barangay} disabled={!formData.City}
                                                    onChange={(e) => handleLocationChange('Barangay', e.target.value)} onBlur={handleBlur}
                                                    className={`w-full ${!formData.City ? 'bg-slate-100 cursor-not-allowed text-slate-400' : 'bg-white'} border rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none transition-all ${errors.Barangay ? 'border-red-400 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7]'}`}
                                                >
                                                    <option value="">Select Barangay...</option>
                                                    {availableBarangays.map(brgy => (
                                                        <option key={brgy} value={brgy}>{brgy}</option>
                                                    ))}
                                                </select>
                                                {errors.Barangay && <p className="text-red-500 text-[10px] mt-1">{errors.Barangay}</p>}
                                            </div>
                                        </div>
                                        
                                        <div className="pt-2">
                                            <div className="w-1/3">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Postal / ZIP Code</label>
                                                <input type="text" name="ZipCode" value={formData.ZipCode} onChange={handleInputChange} onBlur={handleBlur} maxLength={4} placeholder="1103" className={`w-full bg-white border rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 ${errors.ZipCode ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-[#A855F7]'}`} />
                                                {errors.ZipCode && <p className="text-red-500 text-[10px] mt-1">{errors.ZipCode}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex gap-3">
                                    <button 
                                        onClick={() => setCurrentStep(1)}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                                    >
                                        <ChevronLeft size={18} /> Back
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const sdValid = validateField('StartDate', formData.StartDate);
                                            const stValid = validateField('StartTime', formData.StartTime);
                                            const addrValid = validateField('StreetAddress', formData.StreetAddress);
                                            const regValid = validateField('Region', formData.Region);
                                            const provValid = validateField('Province', formData.Province);
                                            const cityValid = validateField('City', formData.City);
                                            const brgyValid = validateField('Barangay', formData.Barangay);
                                            const zipValid = validateField('ZipCode', formData.ZipCode);
                                            
                                            if (sdValid && stValid && addrValid && regValid && provValid && cityValid && brgyValid && zipValid) {
                                                setCurrentStep(3);
                                            }
                                        }}
                                        className="flex-grow bg-[#A855F7] hover:bg-[#9333ea] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-lg shadow-purple-500/20"
                                    >
                                        Continue to Ticketing <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Ticketing Inventory, Tiers & Access Gates */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Lock size={16} className="text-[#A855F7]" /> Privacy & Access Status</h3>
                                    
                                    <div className="flex bg-slate-200/50 p-1 rounded-xl mb-4 max-w-sm">
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, AccessType: 'Public' }))}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${formData.AccessType === 'Public' ? 'bg-[#A855F7] text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            <Unlock size={14} /> Public Admission
                                        </button>
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, AccessType: 'Private' }))}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${formData.AccessType === 'Private' ? 'bg-white text-slate-900 shadow-md border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                                        >
                                            <Lock size={14} className={formData.AccessType === 'Private' ? 'text-[#A855F7]' : ''} /> Private/Invite
                                        </button>
                                    </div>

                                    {formData.AccessType === 'Private' && (
                                        <div className="animate-fade-in">
                                            <label className="block text-[10px] font-bold text-[#A855F7] uppercase tracking-wider mb-1">Mandatory Alphanumeric Invitation Access Code</label>
                                            <input 
                                                type="text" name="VerificationCode" value={formData.VerificationCode} onChange={handleInputChange} placeholder="e.g. SECRET2026"
                                                className="w-full max-w-sm bg-white border border-[#A855F7]/50 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#A855F7] transition-all font-mono tracking-widest text-sm"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Users size={16} className="text-[#A855F7]" /> Ticketing Inventory Tiers</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Admission Strategy</label>
                                            <select 
                                                value={admissionStrategy} onChange={(e) => setAdmissionStrategy(e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#A855F7] transition-all"
                                            >
                                                <option value="Free Admission">Free Admission</option>
                                                <option value="Paid Admission">Paid Admission</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Capacity Limit</label>
                                            <input 
                                                type="number" name="MaxCapacity" value={formData.MaxCapacity} onChange={handleInputChange} onBlur={handleBlur} placeholder="e.g. 500" min="0"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#A855F7] transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Dynamic Allocation Tiers Matrix</label>
                                        
                                        {formData.TicketTiers.map((tier, index) => (
                                            <div key={index} className="flex gap-2 items-end bg-white p-3 rounded-xl border border-slate-200 relative group shadow-sm">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tier Name</label>
                                                    <input type="text" value={tier.TierName} onChange={(e) => updateTicketTier(index, 'TierName', e.target.value)} placeholder="e.g. VIP" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#A855F7]" />
                                                </div>
                                                <div className="w-24">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Slots</label>
                                                    <input type="number" value={tier.AllocatedSlots} onChange={(e) => updateTicketTier(index, 'AllocatedSlots', e.target.value)} placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#A855F7]" />
                                                </div>
                                                <div className="w-28 relative">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Price</label>
                                                    {admissionStrategy === 'Free Admission' ? (
                                                        <input type="text" value="0.00" disabled className="w-full bg-slate-50 border border-slate-200/60 rounded-lg px-2 py-2 text-sm text-slate-400 font-bold text-center cursor-not-allowed" />
                                                    ) : (
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-2 text-slate-400 font-bold text-sm">$</span>
                                                            <input type="number" step="0.01" value={tier.Price} onChange={(e) => updateTicketTier(index, 'Price', e.target.value)} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-6 pr-2 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#A855F7]" />
                                                        </div>
                                                    )}
                                                </div>
                                                <button onClick={() => removeTicketTier(index)} className="w-10 h-[38px] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors flex items-center justify-center border border-red-100 hover:border-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}

                                        <button onClick={addTicketTier} className="w-full border-2 border-dashed border-slate-200 hover:border-[#A855F7]/50 text-slate-500 hover:text-[#A855F7] bg-slate-50 hover:bg-[#A855F7]/5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs mt-2">
                                            <Plus size={14} /> Add Tier Row
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex gap-3">
                                    <button 
                                        onClick={() => setCurrentStep(2)} disabled={isSubmitting}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                                    >
                                        <ChevronLeft size={18} /> Back
                                    </button>
                                    <button 
                                        onClick={handleSubmit} disabled={isSubmitting}
                                        className="flex-grow bg-[#A855F7] hover:bg-[#9333ea] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>Publish Event <CheckCircle size={18} /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMN 2: IMMERSIVE VISUAL INTERACTION CANVAS */}
                <div className="lg:col-span-5 hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 relative border-l border-slate-800 overflow-hidden">
                    {/* Abstract Backdrop Depth */}
                    <div className="absolute w-72 h-72 rounded-full bg-purple-600/20 blur-[80px] top-12 right-12 pointer-events-none"></div>
                    <div className="absolute w-64 h-64 rounded-full bg-indigo-500/20 blur-[80px] bottom-12 left-12 pointer-events-none"></div>

                    {/* The Core Graphic Layer (Human Interaction Mockup) */}
                    <div className="w-60 h-[420px] bg-slate-900 border-[6px] border-slate-800 rounded-[36px] shadow-2xl relative rotate-3 transform transition-transform hover:rotate-0 duration-500 flex flex-col justify-between p-4 overflow-hidden mt-16 z-10">
                        {/* Phone Screen Mockup */}
                        <div className="flex flex-col items-center justify-center pt-10">
                            <span className="text-3xl font-black text-white tracking-widest uppercase opacity-90 drop-shadow-lg">VENU</span>
                            <div className="w-12 h-1 bg-slate-700 rounded-full mt-2"></div>
                            <div className="mt-8 space-y-3 w-full px-2">
                                <div className="h-4 w-full bg-slate-800 rounded-md"></div>
                                <div className="h-4 w-3/4 bg-slate-800 rounded-md"></div>
                                <div className="h-20 w-full bg-slate-800/50 rounded-xl mt-4"></div>
                            </div>
                        </div>
                        <div className="w-full h-12 bg-[#A855F7] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse cursor-pointer">
                            <span className="text-sm font-black text-white uppercase tracking-widest">Publish</span>
                        </div>
                    </div>

                    {/* Dynamic Floating Event Artifacts Stack (Rising Cards) */}
                    <div className="absolute inset-0 pointer-events-none">
                        
                        {/* Floating Card 1 */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl absolute w-52 transition-all hover:scale-105 duration-300 top-16 left-4 -rotate-6 animate-[pulse_4s_ease-in-out_infinite] z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                    <Music size={18} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">New Event</span>
                                    <span className="text-xs font-bold text-white tracking-wide">Epic Concert Live</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Card 2 */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl absolute w-52 transition-all hover:scale-105 duration-300 top-40 -right-6 rotate-6 z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <Trophy size={18} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Tournament</span>
                                    <span className="text-xs font-bold text-white tracking-wide">Grassroots Open Active</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Card 3 */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl shadow-2xl absolute w-52 transition-all hover:scale-105 duration-300 bottom-36 left-2 -rotate-3 z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                    <Unlock size={18} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Invite Only</span>
                                    <span className="text-xs font-bold text-white tracking-wide">Access Lock Unlocked</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
