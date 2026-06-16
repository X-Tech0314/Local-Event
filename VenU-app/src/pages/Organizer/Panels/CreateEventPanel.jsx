import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, MapPin, Calendar, Users, Lock, Unlock, Plus, Trash2, CheckCircle, ChevronRight, ChevronLeft, Map, Ticket, Music, Trophy, Star, Search, X } from 'lucide-react';
import TicketPreview from '../../../components/TicketPreview';

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

export default function CreateEventPanel({ currentUser, setActivePanel }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [venueSourcingMode, setVenueSourcingMode] = useState('registered'); // 'registered' or 'custom'
    const [selectedVenueId, setSelectedVenueId] = useState('');
    const [venueSearchQuery, setVenueSearchQuery] = useState('');

    const mockVenues = [
        { id: '11111111-1111-1111-1111-111111111111', name: 'SMX Convention Center', type: 'Exhibition Hall / Convention Center', address: 'Seashell Lane, Mall of Asia Complex, Pasay City', rating: 4.8, organizersUsed: 142 },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Philippine Arena', type: 'Exhibition Hall / Convention Center', address: 'Ciudad de Victoria, Santa Maria, Bulacan', rating: 4.9, organizersUsed: 89 },
        { id: '33333333-3333-3333-3333-333333333333', name: 'Whitespace Manila', type: 'Standalone Building / Street Address', address: '2314 Chino Roces Ave Extension, Makati', rating: 4.7, organizersUsed: 230 }
    ];

    const filteredVenues = mockVenues.filter(v => v.name.toLowerCase().includes(venueSearchQuery.toLowerCase()));

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
        TicketSalesStartDate: '',
        TicketSalesStartTime: '',
        TicketSalesEndDate: '',
        TicketSalesEndTime: '',
        StreetAddress: '',
        Region: '',
        Province: '',
        City: '',
        Barangay: '',
        ZipCode: '',
        Latitude: '',
        Longitude: '',
        MapUrl: '',
        VenueName: '',
        RegisterVenueToDB: false,
        VenueType: 'Mall / Commercial Complex',
        FloorLevel: '',
        WingSection: '',
        BoothNumber: '',
        ProximityAnchor: '',
        LogisticsNotes: '',
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
        if (formData.TicketTiers.length >= 10) {
            setErrors(prev => ({ ...prev, TicketTiers: '* Maximum of 10 ticket tiers allowed' }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            TicketTiers: [
                ...prev.TicketTiers,
                { TierName: '', OnlineSlots: 0, F2FSlots: 0, Price: admissionStrategy === 'Free Admission' ? 0 : '', ValidityScope: 'Full Event Multi-Pass (All Days)' }
            ]
        }));
        if (errors.TicketTiers) {
            setErrors(prev => { const e = { ...prev }; delete e.TicketTiers; return e; });
        }
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
        const maxCap = parseInt(formData.MaxCapacity) || 0;
        if (maxCap > 0) {
            const totalSlots = formData.TicketTiers.reduce((sum, t) => sum + (parseInt(t.OnlineSlots) || 0) + (parseInt(t.F2FSlots) || 0), 0);
            if (totalSlots !== maxCap) {
                setErrors(prev => ({ ...prev, TicketTiersSubmit: `* Total allocated slots across all tiers (${totalSlots}) must exactly match the Total Capacity Limit (${maxCap})` }));
                return;
            }
        }
        setErrors(prev => { const e = { ...prev }; delete e.TicketTiersSubmit; return e; });
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            let uploadedBannerUrl = formData.BannerUrl || '';

            if (formData.BannerFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', formData.BannerFile);

                const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/events/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: uploadFormData
                });

                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    uploadedBannerUrl = uploadResult.url;
                } else {
                    console.error('Failed to upload image banner');
                }
            }

            const startDateTime = formData.StartDate && formData.StartTime
                ? new Date(`${formData.StartDate}T${formData.StartTime}`).toISOString()
                : new Date().toISOString();

            const endDateTime = formData.EndDate && formData.EndTime
                ? new Date(`${formData.EndDate}T${formData.EndTime}`).toISOString()
                : new Date().toISOString();

            const ticketSalesStart = formData.TicketSalesStartDate && formData.TicketSalesStartTime
                ? new Date(`${formData.TicketSalesStartDate}T${formData.TicketSalesStartTime}`).toISOString()
                : new Date().toISOString();

            const ticketSalesEnd = formData.TicketSalesEndDate && formData.TicketSalesEndTime
                ? new Date(`${formData.TicketSalesEndDate}T${formData.TicketSalesEndTime}`).toISOString()
                : new Date().toISOString();

            const finalCategory = formData.Category === 'Others' ? formData.CustomCategory : formData.Category;

            const payload = {
                title: formData.Title,
                description: formData.Description,
                category: finalCategory,
                bannerUrl: uploadedBannerUrl,
                startDateTime: startDateTime,
                endDateTime: endDateTime,
                streetAddress: formData.StreetAddress || "N/A",
                barangay: formData.Barangay,
                city: formData.City,
                province: formData.Province,
                region: formData.Region,
                zipCode: formData.ZipCode,
                latitude: formData.Latitude ? parseFloat(formData.Latitude) : null,
                longitude: formData.Longitude ? parseFloat(formData.Longitude) : null,
                mapUrl: formData.MapUrl || '',
                venueSourcingMode: venueSourcingMode,
                venueId: venueSourcingMode === 'registered' ? selectedVenueId : null,
                venueName: formData.VenueName || '',
                venueType: formData.VenueType || '',
                floorLevel: formData.FloorLevel || '',
                wingSection: formData.WingSection || '',
                boothNumber: formData.BoothNumber || '',
                proximityAnchor: formData.ProximityAnchor || '',
                logisticsNotes: formData.LogisticsNotes || '',
                registerVenueToDB: formData.RegisterVenueToDB,
                accessType: formData.AccessType,
                verificationCode: formData.AccessType === 'Private' ? (formData.VerificationCode || '') : '',
                maxCapacity: parseInt(formData.MaxCapacity) || 0,
                ticketTiers: formData.TicketTiers.map(t => ({
                    tierName: t.TierName,
                    onlineSlots: parseInt(t.OnlineSlots) || 0,
                    f2fSlots: parseInt(t.F2FSlots) || 0,
                    price: admissionStrategy === 'Free Admission' ? 0.00 : parseFloat(t.Price) || 0.00,
                    validityScope: t.ValidityScope || 'Full Event Multi-Pass (All Days)'
                })),
                ticketSalesStart: ticketSalesStart,
                ticketSalesEnd: ticketSalesEnd
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
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
                const errText = await response.text();
                console.error('Failed to create event', errText);
                setErrors(prev => ({ ...prev, TicketTiersSubmit: `[API REJECTED] ${errText}` }));
                if (response.status === 401) throw new Error('401');
            }
        } catch (error) {
            if (error.message.includes('Failed to fetch') || error.message.includes('Network Error') || error.message.includes('401')) {
                console.warn('Backend unavailable, simulating event creation.');

                const existingMocks = JSON.parse(localStorage.getItem('mockEvents') || '[]');
                existingMocks.push({
                    id: `mock-evt-${Date.now()}`,
                    title: formData.Title,
                    startDateTime: formData.StartDate && formData.StartTime ? new Date(`${formData.StartDate}T${formData.StartTime}`).toISOString() : new Date().toISOString(),
                    barangay: (formData.VenueType === 'Mall / Commercial Complex' || formData.VenueType === 'Exhibition Hall / Convention Center') ? (formData.WingSection || formData.ProximityAnchor || 'Venue') : formData.Barangay,
                    city: (formData.VenueType === 'Mall / Commercial Complex' || formData.VenueType === 'Exhibition Hall / Convention Center') ? (formData.FloorLevel || 'Local') : formData.City,
                    bannerUrl: formData.BannerUrl || ''
                });
                localStorage.setItem('mockEvents', JSON.stringify(existingMocks));

                setShowSuccess(true);
                return;
            }
            console.error('Error submitting form', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center p-10 animate-fade-in text-center">

                <div className="bg-slate-900 dark:bg-slate-800 p-10 md:p-14 rounded-[2rem] shadow-xl border border-slate-800 dark:border-slate-700 max-w-2xl w-full relative overflow-hidden mb-10">
                    <div className="absolute -top-10 -right-10 text-8xl opacity-10 transform rotate-12 pointer-events-none">🎉</div>
                    <div className="absolute -bottom-10 -left-10 text-8xl opacity-10 transform -rotate-12 pointer-events-none">⭐</div>

                    <CheckCircle className="text-emerald-400 w-24 h-24 mb-6 mx-auto" />
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Congratulations on your event!</h2>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg mx-auto">Your event has been successfully published to the platform. We wish you the best of luck with your community gathering!</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => setActivePanel && setActivePanel('events')}
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white px-8 py-4 rounded-xl font-black shadow-sm active:scale-95 transition-all uppercase tracking-wider text-sm"
                    >
                        Go to Events Directory
                    </button>
                    <button
                        onClick={() => {
                            setShowSuccess(false);
                            setCurrentStep(1);
                            setFormData({
                                Title: '', Description: '', Category: 'Sports', CustomCategory: '', BannerFile: null, BannerUrl: '',
                                StartDate: '', StartTime: '', EndDate: '', EndTime: '',
                                TicketSalesStartDate: '', TicketSalesStartTime: '', TicketSalesEndDate: '', TicketSalesEndTime: '',
                                StreetAddress: '', Barangay: '', City: '',
                                Province: '', Region: '', ZipCode: '', Latitude: '', Longitude: '', MapUrl: '', AccessType: 'Public',
                                VerificationCode: '', MaxCapacity: '', TicketTiers: []
                            });
                            setErrors({});
                            setBannerPreview(null);
                        }}
                        className="border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 px-8 py-3 rounded-xl font-bold active:scale-95 transition-all"
                    >
                        Create Another Event
                    </button>
                </div>
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
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create New Event</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Publish a new community event to your audience.</p>
            </div>

            {/* Split Screen Wrapper Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[85vh] gap-0 bg-white dark:bg-slate-900 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">

                {/* COLUMN 1: WIZARD FORM INPUT WORKSPACE */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 lg:p-12 relative overflow-y-auto">
                    <div className="max-w-2xl mx-auto w-full">

                        {/* Step Tracker Ribbon */}
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-800 relative">
                            <div className="flex items-center gap-2 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${currentStep === 1 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm scale-110 ring-4 ring-slate-900/10 dark:ring-white/10' : currentStep > 1 ? 'bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                                    {currentStep > 1 ? <CheckCircle size={14} /> : 1}
                                </div>
                                <span className={`hidden sm:block font-bold text-xs tracking-wide transition-colors ${currentStep === 1 ? 'text-slate-900 dark:text-white' : currentStep > 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Basic Info</span>
                            </div>
                            <div className={`h-px flex-1 mx-2 transition-colors duration-500 ${currentStep >= 2 ? 'bg-slate-900/50 dark:bg-white/50' : 'bg-slate-200 dark:bg-slate-700'}`}></div>

                            <div className="flex items-center gap-2 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${currentStep === 2 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm scale-110 ring-4 ring-slate-900/10 dark:ring-white/10' : currentStep > 2 ? 'bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                                    {currentStep > 2 ? <CheckCircle size={14} /> : 2}
                                </div>
                                <span className={`hidden sm:block font-bold text-xs tracking-wide transition-colors ${currentStep === 2 ? 'text-slate-900 dark:text-white' : currentStep > 2 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Schedule</span>
                            </div>
                            <div className={`h-px flex-1 mx-2 transition-colors duration-500 ${currentStep >= 3 ? 'bg-slate-900/50 dark:bg-white/50' : 'bg-slate-200 dark:bg-slate-700'}`}></div>

                            <div className="flex items-center gap-2 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${currentStep === 3 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm scale-110 ring-4 ring-slate-900/10 dark:ring-white/10' : currentStep > 3 ? 'bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                                    {currentStep > 3 ? <CheckCircle size={14} /> : 3}
                                </div>
                                <span className={`hidden sm:block font-bold text-xs tracking-wide transition-colors ${currentStep === 3 ? 'text-slate-900 dark:text-white' : currentStep > 3 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Location</span>
                            </div>
                            <div className={`h-px flex-1 mx-2 transition-colors duration-500 ${currentStep >= 4 ? 'bg-slate-900/50 dark:bg-white/50' : 'bg-slate-200 dark:bg-slate-700'}`}></div>

                            <div className="flex items-center gap-2 z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${currentStep === 4 ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm scale-110 ring-4 ring-slate-900/10 dark:ring-white/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                                    4
                                </div>
                                <span className={`hidden sm:block font-bold text-xs tracking-wide transition-colors ${currentStep === 4 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>Ticketing</span>
                            </div>
                        </div>

                        {/* STEP 1: Core Event Specifications */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Event Title</label>
                                        <input
                                            type="text" name="Title" value={formData.Title} onChange={handleInputChange} onBlur={handleBlur}
                                            placeholder="Epic Summer Music Festival"
                                            className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${errors.Title ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500'}`}
                                        />
                                        {errors.Title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.Title}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Category Tag</label>
                                        <select
                                            name="Category" value={formData.Category} onChange={handleInputChange}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
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
                                                    className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${errors.CustomCategory ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500'}`}
                                                />
                                                {errors.CustomCategory && <p className="text-red-500 text-xs mt-1 font-medium">{errors.CustomCategory}</p>}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Event Description</label>
                                        <textarea
                                            name="Description" value={formData.Description} onChange={handleInputChange} onBlur={handleBlur}
                                            rows="4" placeholder="Describe the awesome experiences waiting for the attendees..."
                                            className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 transition-all resize-none ${errors.Description ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-purple-500'}`}
                                        ></textarea>
                                        {errors.Description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.Description}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Event Banner / Cover Thumbnail</label>
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleFileDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full h-[240px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group
                                            ${bannerPreview ? 'border-slate-300 dark:border-slate-600' : 'border-slate-300 dark:border-slate-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 bg-slate-50 dark:bg-slate-800'}`}
                                    >
                                        {bannerPreview ? (
                                            <>
                                                <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="bg-slate-900/80 text-white px-4 py-2 rounded-lg font-medium text-sm backdrop-blur-sm">Replace Image</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                <Upload size={28} className="mb-3" />
                                                <p className="font-bold text-sm mb-1 text-slate-600 dark:text-slate-400">Drag & drop your banner here</p>
                                                <p className="text-xs">Supports JPG, PNG (Max 5MB)</p>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <button
                                        onClick={() => {
                                            const tValid = validateField('Title', formData.Title);
                                            const dValid = validateField('Description', formData.Description);
                                            const cValid = formData.Category === 'Others' ? validateField('CustomCategory', formData.CustomCategory) : true;
                                            if (tValid && dValid && cValid) setCurrentStep(2);
                                        }}
                                        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm"
                                    >
                                        Continue to Schedule <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Schedule & Timestamps */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Calendar size={16} className="text-purple-600 dark:text-purple-400" /> Event Schedule</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Date</label>
                                            <input type="date" name="StartDate" value={formData.StartDate} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all ${errors.StartDate ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`} />
                                            {errors.StartDate && <p className="text-red-500 text-[10px]">{errors.StartDate}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Time</label>
                                            <input type="time" name="StartTime" value={formData.StartTime} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all ${errors.StartTime ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`} />
                                            {errors.StartTime && <p className="text-red-500 text-[10px]">{errors.StartTime}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">End Date</label>
                                            <input type="date" name="EndDate" value={formData.EndDate} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all ${errors.EndDate ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">End Time</label>
                                            <input type="time" name="EndTime" value={formData.EndTime} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all ${errors.EndTime ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`} />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                                        <Calendar size={16} className="text-purple-600 dark:text-purple-400" />
                                        Online App Ticketing Period
                                    </h3>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 ml-6">Define exactly when attendees can purchase digital e-tickets through the VenU mobile app.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ticket Sales Open Date</label>
                                            <input type="date" name="TicketSalesStartDate" value={formData.TicketSalesStartDate} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all ${errors.TicketSalesStartDate ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ticket Sales Open Time</label>
                                            <input type="time" name="TicketSalesStartTime" value={formData.TicketSalesStartTime} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all ${errors.TicketSalesStartTime ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">Ticket Sales Close Date</label>
                                            <input type="date" name="TicketSalesEndDate" value={formData.TicketSalesEndDate} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all ${errors.TicketSalesEndDate ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-2">Ticket Sales Close Time</label>
                                            <input type="time" name="TicketSalesEndTime" value={formData.TicketSalesEndTime} onChange={handleInputChange} onBlur={handleBlur} className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all ${errors.TicketSalesEndTime ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`} />
                                        </div>
                                    </div>
                                    {errors.TicketLifecycle && (
                                        <p className="text-red-500 text-xs font-bold mt-2">* Ticket sales must conclude before the event operational window ends.</p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                                    >
                                        <ChevronLeft size={18} /> Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            const sdValid = validateField('StartDate', formData.StartDate);
                                            const stValid = validateField('StartTime', formData.StartTime);

                                            if (sdValid && stValid) {
                                                const startD = new Date(formData.StartDate);
                                                const minD = new Date('2026-06-16');
                                                startD.setHours(0,0,0,0);
                                                minD.setHours(0,0,0,0);

                                                if (startD < minD) {
                                                    setErrors(prev => ({ ...prev, StartDate: '* Event start date cannot be before June 16, 2026' }));
                                                    return;
                                                }

                                                const evtEnd = formData.EndDate && formData.EndTime ? new Date(`${formData.EndDate}T${formData.EndTime}`) : null;
                                                const tktEnd = formData.TicketSalesEndDate && formData.TicketSalesEndTime ? new Date(`${formData.TicketSalesEndDate}T${formData.TicketSalesEndTime}`) : null;

                                                if (evtEnd && tktEnd && tktEnd >= evtEnd) {
                                                    setErrors(prev => ({ ...prev, TicketLifecycle: true }));
                                                } else {
                                                    setErrors(prev => { 
                                                        const e = { ...prev }; 
                                                        delete e.TicketLifecycle; 
                                                        delete e.StartDate; 
                                                        return e; 
                                                    });
                                                    setCurrentStep(3);
                                                }
                                            }
                                        }}
                                        className="flex-grow bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm"
                                    >
                                        Continue to Location <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Location Details */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><MapPin size={16} className="text-purple-600 dark:text-purple-400" /> Location Details</h3>
                                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mt-2 sm:mt-0 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                                            <button
                                                onClick={() => setVenueSourcingMode('registered')}
                                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${venueSourcingMode === 'registered' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                            >
                                                Search Registered Venues
                                            </button>
                                            <button
                                                onClick={() => setVenueSourcingMode('custom')}
                                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${venueSourcingMode === 'custom' ? 'bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                            >
                                                Enter Custom Venue
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">

                                        {venueSourcingMode === 'registered' ? (
                                            <div className="space-y-4 animate-fade-in">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="Search VenU Global Directory (e.g., SMX, Philippine Arena)..."
                                                        value={venueSearchQuery}
                                                        onChange={(e) => setVenueSearchQuery(e.target.value)}
                                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    {filteredVenues.map(venue => (
                                                        <div
                                                            key={venue.id}
                                                            onClick={() => {
                                                                setSelectedVenueId(venue.id);
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    VenueType: venue.type,
                                                                    StreetAddress: venue.address,
                                                                    VenueName: venue.name
                                                                }));
                                                            }}
                                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedVenueId === venue.id ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'}`}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className={`font-bold ${selectedVenueId === venue.id ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-white'}`}>{venue.name}</h4>
                                                                    <p className="text-xs text-slate-500 mt-1">{venue.address}</p>
                                                                </div>
                                                                <span className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                                                                    <CheckCircle size={10} /> Verified
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-3 text-xs font-bold text-slate-500">
                                                                <span className="flex items-center gap-1 text-amber-500"><Star size={12} fill="currentColor" /> {venue.rating}</span>
                                                                <span className="flex items-center gap-1"><Users size={12} /> Used by {venue.organizersUsed} Organizers</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {filteredVenues.length === 0 && (
                                                        <div className="text-center p-6 text-slate-500">No registered venues found. Try entering a custom venue.</div>
                                                    )}
                                                </div>
                                                {selectedVenueId && (
                                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-purple-700 dark:text-purple-300">
                                                        <strong>Location Locked:</strong> The venue details have been automatically populated and verified by the VenU Global Directory.
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-4 animate-fade-in">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Venue Name</label>
                                                    <input type="text" name="VenueName" value={formData.VenueName} onChange={handleInputChange} placeholder="e.g., Wency's Studio, Community Hall" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-all" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Venue Type</label>
                                                    <select
                                                        name="VenueType" value={formData.VenueType} onChange={handleInputChange} onBlur={handleBlur}
                                                        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition-all ${errors.VenueType ? 'border-red-400 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'}`}
                                                    >
                                                        <option value="Mall / Commercial Complex">Mall / Commercial Complex (Default)</option>
                                                        <option value="Exhibition Hall / Convention Center">Exhibition Hall / Convention Center</option>
                                                        <option value="Hotel / Function Room">Hotel / Function Room</option>
                                                        <option value="Standalone Building / Street Address">Standalone Building / Street Address</option>
                                                        <option value="Outdoor Space / Open Grounds">Outdoor Space / Open Grounds</option>
                                                    </select>
                                                </div>

                                                {(formData.VenueType === 'Mall / Commercial Complex' || formData.VenueType === 'Exhibition Hall / Convention Center') ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Floor Level</label>
                                                            <input type="text" name="FloorLevel" value={formData.FloorLevel} onChange={handleInputChange} placeholder="e.g., Level 3, Lower Ground Floor" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-all" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Wing / Section / Zone</label>
                                                            <input type="text" name="WingSection" value={formData.WingSection} onChange={handleInputChange} placeholder="e.g., Cyberzone, Bldg B, Atrium" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-all" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Booth / Stall / Table #</label>
                                                            <input type="text" name="BoothNumber" value={formData.BoothNumber} onChange={handleInputChange} placeholder="e.g., Booth A12, Stall 4" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-all" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Proximity Anchor / Landmark</label>
                                                            <input type="text" name="ProximityAnchor" value={formData.ProximityAnchor} onChange={handleInputChange} placeholder="e.g., Beside Starbucks, Near the central escalator" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-all" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Street Address</label>
                                                        <input type="text" name="StreetAddress" value={formData.StreetAddress} onChange={handleInputChange} onBlur={handleBlur} placeholder="123 Main Avenue, Building Floor..." className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-1 transition-all ${errors.StreetAddress ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`} />
                                                        {errors.StreetAddress && <p className="text-red-500 text-[10px] mt-1">{errors.StreetAddress}</p>}
                                                    </div>
                                                )}

                                                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        id="RegisterVenueToDB"
                                                        name="RegisterVenueToDB"
                                                        checked={formData.RegisterVenueToDB}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, RegisterVenueToDB: e.target.checked }))}
                                                        className="mt-1 w-4 h-4 text-purple-600 bg-white border-slate-300 rounded focus:ring-purple-500"
                                                    />
                                                    <div>
                                                        <label htmlFor="RegisterVenueToDB" className="text-sm font-bold text-purple-900 dark:text-purple-300 cursor-pointer">Register this venue to the VenU Global Directory</label>
                                                        <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">By checking this, you agree to make this venue publicly searchable by other organizers for their future events.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4">
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Seller & On-Site Logistics Comments (Optional)</label>
                                            <textarea name="LogisticsNotes" value={formData.LogisticsNotes} onChange={handleInputChange} rows="3" placeholder="e.g., Delivery vehicles must unload at Gate 4. Booth is located inside the tech zone—look for the purple banner. Please check in with the head marshal upon arrival." className="w-full bg-[#0b0f17] text-white border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all resize-none"></textarea>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Provide clear instructions to help attendees and vendors navigate the venue specifics.</p>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Region</label>
                                                <select
                                                    name="Region" value={formData.Region}
                                                    onChange={(e) => handleLocationChange('Region', e.target.value)} onBlur={handleBlur}
                                                    className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white outline-none transition-all ${errors.Region ? 'border-red-400 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'}`}
                                                >
                                                    <option value="">Select Region...</option>
                                                    {availableRegions.map(region => (
                                                        <option key={region} value={region}>{region}</option>
                                                    ))}
                                                </select>
                                                {errors.Region && <p className="text-red-500 text-[10px] mt-1">{errors.Region}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Province</label>
                                                <select
                                                    name="Province" value={formData.Province} disabled={!formData.Region}
                                                    onChange={(e) => handleLocationChange('Province', e.target.value)} onBlur={handleBlur}
                                                    className={`w-full ${!formData.Region ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-400 dark:text-slate-500' : 'bg-white dark:bg-slate-900'} border rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white outline-none transition-all ${errors.Province ? 'border-red-400 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'}`}
                                                >
                                                    <option value="">Select Province...</option>
                                                    {availableProvinces.map(prov => (
                                                        <option key={prov} value={prov}>{prov}</option>
                                                    ))}
                                                </select>
                                                {errors.Province && <p className="text-red-500 text-[10px] mt-1">{errors.Province}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">City / Muni</label>
                                                <select
                                                    name="City" value={formData.City} disabled={!formData.Province}
                                                    onChange={(e) => handleLocationChange('City', e.target.value)} onBlur={handleBlur}
                                                    className={`w-full ${!formData.Province ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-400 dark:text-slate-500' : 'bg-white dark:bg-slate-900'} border rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white outline-none transition-all ${errors.City ? 'border-red-400 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'}`}
                                                >
                                                    <option value="">Select City...</option>
                                                    {availableCities.map(city => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                                {errors.City && <p className="text-red-500 text-[10px] mt-1">{errors.City}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Barangay</label>
                                                <select
                                                    name="Barangay" value={formData.Barangay} disabled={!formData.City}
                                                    onChange={(e) => handleLocationChange('Barangay', e.target.value)} onBlur={handleBlur}
                                                    className={`w-full ${!formData.City ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed text-slate-400 dark:text-slate-500' : 'bg-white dark:bg-slate-900'} border rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white outline-none transition-all ${errors.Barangay ? 'border-red-400 focus:ring-1 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'}`}
                                                >
                                                    <option value="">Select Barangay...</option>
                                                    {availableBarangays.map(brgy => (
                                                        <option key={brgy} value={brgy}>{brgy}</option>
                                                    ))}
                                                </select>
                                                {errors.Barangay && <p className="text-red-500 text-[10px] mt-1">{errors.Barangay}</p>}
                                            </div>
                                        </div>

                                        <div className="pt-2 flex gap-4">
                                            <div className="w-1/3">
                                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Postal / ZIP Code</label>
                                                <input type="text" name="ZipCode" value={formData.ZipCode} onChange={handleInputChange} onBlur={handleBlur} maxLength={4} placeholder="1103" className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 ${errors.ZipCode ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'}`} />
                                                {errors.ZipCode && <p className="text-red-500 text-[10px] mt-1">{errors.ZipCode}</p>}
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Map / Location URL (Google Maps or Waze Link)</label>
                                                <input type="text" name="MapUrl" value={formData.MapUrl} onChange={handleInputChange} placeholder="https://maps.google.com/?q=..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                                    >
                                        <ChevronLeft size={18} /> Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            const addrValid = (formData.VenueType === 'Mall / Commercial Complex' || formData.VenueType === 'Exhibition Hall / Convention Center') ? true : validateField('StreetAddress', formData.StreetAddress);
                                            const regValid = validateField('Region', formData.Region);
                                            const provValid = validateField('Province', formData.Province);
                                            const cityValid = validateField('City', formData.City);
                                            const brgyValid = validateField('Barangay', formData.Barangay);
                                            const zipValid = validateField('ZipCode', formData.ZipCode);

                                            if (addrValid && regValid && provValid && cityValid && brgyValid && zipValid) {
                                                setCurrentStep(4);
                                            }
                                        }}
                                        className="flex-grow bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm"
                                    >
                                        Continue to Ticketing <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Ticketing Inventory, Tiers & Access Gates */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Lock size={16} className="text-purple-600 dark:text-purple-400" /> Privacy & Access Status</h3>

                                    <div className="flex bg-slate-200/50 dark:bg-slate-700/50 p-1 rounded-xl mb-4 max-w-sm">
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, AccessType: 'Public' }))}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${formData.AccessType === 'Public' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                                        >
                                            <Unlock size={14} /> Public Admission
                                        </button>
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, AccessType: 'Private' }))}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${formData.AccessType === 'Private' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                                        >
                                            <Lock size={14} className={formData.AccessType === 'Private' ? 'text-purple-600 dark:text-purple-400' : ''} /> Private/Invite
                                        </button>
                                    </div>

                                    {formData.AccessType === 'Private' && (
                                        <div className="animate-fade-in">
                                            <label className="block text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Mandatory Alphanumeric Invitation Access Code</label>
                                            <input
                                                type="text" name="VerificationCode" value={formData.VerificationCode} onChange={handleInputChange} placeholder="e.g. SECRET2026"
                                                className="w-full max-w-sm bg-white dark:bg-slate-900 border border-purple-500/50 dark:border-purple-500/30 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-mono tracking-widest text-sm"
                                            />
                                        </div>
                                    )}

                                    <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2"><Users size={16} className="text-purple-600 dark:text-purple-400" /> Digital E-Ticket Types</h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 ml-6">Configure the digital passes attendees will use on their phones. You can allocate slots for app purchases vs walk-in f2f sales.</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Admission Strategy</label>
                                                <select
                                                    value={admissionStrategy} onChange={(e) => setAdmissionStrategy(e.target.value)}
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-all"
                                                >
                                                    <option value="Free Admission">Free Admission</option>
                                                    <option value="Paid Admission">Paid Admission</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Capacity Limit</label>
                                                <input
                                                    type="number" name="MaxCapacity" value={formData.MaxCapacity} onChange={handleInputChange} onBlur={handleBlur} placeholder="e.g. 500" min="0"
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Ticket Tiers & Pricing</label>

                                            {formData.TicketTiers.map((tier, index) => (
                                                <div key={index} className="flex flex-col gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative group shadow-sm">
                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                                                        <div className="md:col-span-4">
                                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Tier Name</label>
                                                            <input type="text" value={tier.TierName} onChange={(e) => updateTicketTier(index, 'TierName', e.target.value)} placeholder="e.g. VIP E-Ticket" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500" />
                                                        </div>
                                                        <div className="md:col-span-4 flex gap-2">
                                                            <div className="w-1/2">
                                                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 truncate" title="Online E-Ticket Slots">App Slots</label>
                                                                <input type="number" value={tier.OnlineSlots} onChange={(e) => updateTicketTier(index, 'OnlineSlots', e.target.value)} placeholder="0" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500" />
                                                            </div>
                                                            <div className="w-1/2">
                                                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 truncate" title="On-Site F2F Slots">F2F Slots</label>
                                                                <input type="number" value={tier.F2FSlots} onChange={(e) => updateTicketTier(index, 'F2FSlots', e.target.value)} placeholder="0" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500" />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-3">
                                                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Price (₱)</label>
                                                            <input type="number" value={tier.Price} onChange={(e) => updateTicketTier(index, 'Price', e.target.value)} disabled={admissionStrategy === 'Free Admission'} placeholder={admissionStrategy === 'Free Admission' ? '0' : 'Price'} className={`w-full bg-slate-50 border rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-purple-500 ${admissionStrategy === 'Free Admission' ? 'dark:bg-slate-800 cursor-not-allowed border-slate-200 dark:border-slate-700 text-slate-400' : 'dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'}`} />
                                                        </div>
                                                        <div className="md:col-span-1 flex justify-end items-end h-full pb-1">
                                                            <button onClick={() => removeTicketTier(index)} className="text-red-400 hover:text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 p-2 rounded-lg transition-colors">
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-1">
                                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Validity Scope</label>
                                                        <select value={tier.ValidityScope} onChange={(e) => updateTicketTier(index, 'ValidityScope', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500">
                                                            <option value="Full Event Multi-Pass (All Days)">Full Event Multi-Pass (All Days)</option>
                                                            <option value="Single Day Pass">Single Day Pass</option>
                                                            <option value="Specific Session / Time-Slot">Specific Session / Time-Slot</option>
                                                            <option value="VIP / Backstage Access">VIP / Backstage Access</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            ))}

                                            <button onClick={addTicketTier} className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-xs mt-2">
                                                <Plus size={14} /> Add Tier Row
                                            </button>
                                            {errors.TicketTiers && <p className="text-red-500 text-xs font-bold mt-1">{errors.TicketTiers}</p>}
                                            {errors.TicketTiersSubmit && <p className="text-red-500 text-xs font-bold mt-1">{errors.TicketTiersSubmit}</p>}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                                        <button
                                            onClick={() => setCurrentStep(3)} disabled={isSubmitting}
                                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                                        >
                                            <ChevronLeft size={18} /> Back
                                        </button>
                                        <button
                                            onClick={handleSubmit} disabled={isSubmitting}
                                            className="flex-grow bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>Publish Event <CheckCircle size={18} /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                    {/* COLUMN 2: IMMERSIVE VISUAL INTERACTION CANVAS */}
                    <div className="lg:col-span-5 hidden lg:flex flex-col justify-center items-center bg-slate-100 dark:bg-slate-800 p-8 relative border-l border-slate-200 dark:border-slate-700 overflow-hidden">
                        {currentStep === 4 ? (
                            <div className="relative z-10 w-full max-w-[320px] animate-fade-in">
                                <h3 className="text-slate-500 dark:text-slate-400 font-black tracking-widest uppercase text-center mb-6 text-sm flex items-center justify-center gap-2">
                                    <Ticket size={16} className="text-purple-600 dark:text-purple-400" /> Live Ticket Preview
                                </h3>
                                {/* Holographic Ticket Stub replacing old inline element */}
                                <div className="relative transform transition-transform hover:scale-105 duration-300 shadow-sm rounded-3xl">
                                    <TicketPreview
                                        themeColor="#9333ea"
                                        eventData={{
                                            title: formData.Title,
                                            category: formData.Category === 'Others' ? formData.CustomCategory : formData.Category,
                                            image: bannerPreview,
                                            date: formData.StartDate ? new Date(formData.StartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD',
                                            time: formData.StartTime || 'TBD',
                                            tierName: formData.TicketTiers.length > 0 ? formData.TicketTiers[0].TierName : 'Standard',
                                            accessType: formData.AccessType,
                                            validityScope: formData.TicketTiers.length > 0 ? formData.TicketTiers[0].ValidityScope : null,
                                            venueType: formData.VenueType,
                                            floorLevel: formData.FloorLevel,
                                            wingSection: formData.WingSection,
                                            proximityAnchor: formData.ProximityAnchor,
                                            streetAddress: formData.StreetAddress,
                                            ticketId: "https://venu.com/preview"
                                        }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* The Core Graphic Layer (Human Interaction Mockup) */}
                                <div className="w-60 h-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[36px] shadow-sm relative flex flex-col justify-between p-4 overflow-hidden mt-16 z-10 animate-fade-in">
                                    {/* Phone Screen Mockup */}
                                    <div className="flex flex-col items-center justify-center pt-10">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-widest uppercase">VENU</span>
                                        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mt-2"></div>
                                        <div className="mt-8 space-y-3 w-full px-2">
                                            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                                            <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
                                            <div className="h-20 w-full bg-slate-100 dark:bg-slate-800 rounded-xl mt-4"></div>
                                        </div>
                                    </div>
                                    <div className="w-full h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-sm cursor-pointer">
                                        <span className="text-sm font-black text-white uppercase tracking-widest">Publish</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            );
}
