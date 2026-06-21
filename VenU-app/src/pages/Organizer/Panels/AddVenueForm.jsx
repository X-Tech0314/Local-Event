import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, ChevronRight, ChevronLeft, Building, UploadCloud, MapPin, Settings, FileText, Search, Loader2 } from 'lucide-react';
import usePsgc from '../../../hooks/usePsgc';

// ── Reusable styled select ────────────────────────────────────────────
const Sel = ({ label, value, onChange, disabled, loading, children, error }) => (
  <div>
    <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 flex items-center gap-1.5">
      {label}
      {loading && <Loader2 size={11} className="animate-spin text-purple-500" />}
    </label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled || loading}
      className={`w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border outline-none transition-colors ${error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-purple-500'} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </select>
    {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
  </div>
);

// ── Barangay search dropdown ──────────────────────────────────────────
function BarangaySearchSelect({ barangays, value, onChange, loading }) {
  const [query, setQuery] = useState('');
  const filtered = barangays.filter(b => b.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 flex items-center gap-1.5">
        Barangay
        {loading && <Loader2 size={11} className="animate-spin text-purple-500" />}
      </label>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder={loading ? "Loading barangays..." : barangays.length === 0 ? "Select a city first" : `Search ${barangays.length} barangays...`}
          value={query}
          onChange={e => setQuery(e.target.value)}
          disabled={barangays.length === 0 || loading}
          className="w-full bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-3 rounded-t border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        />
      </div>
      <div className="bg-slate-50 dark:bg-slate-800 border border-t-0 border-slate-200 dark:border-slate-700 rounded-b max-h-44 overflow-y-auto">
        {filtered.length === 0 && !loading && (
          <p className="text-xs text-slate-400 p-3 text-center">
            {barangays.length === 0 ? "Select a city to see barangays" : "No match found"}
          </p>
        )}
        {filtered.map(b => (
          <button
            key={b.code}
            type="button"
            onClick={() => { onChange(b); setQuery(b.name); }}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0 ${value === b.code ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
          >
            {b.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────
const steps = ['Core & Contact', 'Location', 'Logistics', 'Legal & Files'];

export default function AddVenueForm({ setViewMode }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '', type: '', floorArea: '', ceilingHeight: '',
    streetAddress: '', zipCode: '', landmarks: '', latitude: '', longitude: '',
    representativeName: '', mobileNumber: '', landline: '', email: '', websiteUrl: '',
    capacityTheater: '', capacityBanquet: '', capacityStanding: '', parkingSlots: '', operatingHours: '',
    hasAircon: false, hasSoundSystem: false, hasBackupGenerator: false, hasHoldingRooms: false,
    fsicNumber: '', businessPermitNumber: '', hasBirForm2303: false, hasSmokeDetectors: false, hasFireExits: false,
  });

  const [files, setFiles] = useState({ galleryImages: [], floorPlanFile: null, legalPermitsFile: null });
  const [loading, setLoading] = useState(false);

  // PSGC cascading location
  const {
    regions, provinces, cities, barangays,
    loading: psgcLoading,
    noProvinceRegion,
    psgcSel,
    selectRegion, selectProvince, selectCity, selectBarangay,
    getRegionName, getProvinceName, getCityName, getBarangayName,
  } = usePsgc();

  // Updated set function to validate fields in real-time as the user types
  const set = (key, val) => {
    setFormData(f => ({ ...f, [key]: val }));

    let error = null;

    // Real-time validation rules
    if (key === 'name' && !val.trim()) error = "Venue name is required.";
    if (key === 'type' && !val) error = "Please select a venue type.";

    // Realistic Floor Area Validation (10 to 500,000 sqm)
    if (key === 'floorArea') {
      if (!val) {
        error = "Valid floor area is required.";
      } else {
        const area = parseFloat(val);
        if (isNaN(area) || area < 10 || area > 500000) {
          error = "Enter a realistic area (10 to 500,000 sqm).";
        }
      }
    }

    if (key === 'streetAddress' && !val.trim()) error = "Street address is required.";

    if (key === 'representativeName' && val) {
      const nameRegex = /^[A-Za-z\s.\-]+$/;
      if (!nameRegex.test(val)) error = "Name can only contain letters, spaces, and basic punctuation (., -).";
    }

    if (key === 'ceilingHeight' && val) {
      const h = parseFloat(val);
      if (isNaN(h) || h < 2 || h > 100) error = "Enter a realistic height between 2 and 100 meters.";
    }

    if (key === 'capacityTheater' || key === 'capacityBanquet' || key === 'capacityStanding') {
      const cap = parseInt(val, 10);
      const area = parseFloat(formData.floorArea);
      if (val && (isNaN(cap) || cap < 0)) {
        error = "Capacity cannot be negative.";
      } else if (val && !isNaN(area) && area > 0) {
        let maxAllowed = area * 4; // Standing max
        if (key === 'capacityBanquet') maxAllowed = area * 1.5;
        if (key === 'capacityTheater') maxAllowed = area * 2;
        if (cap > maxAllowed) {
          error = `Capacity exceeds realistic limit for ${area} sqm. (Max: ~${Math.floor(maxAllowed)})`;
        }
      }
    }

    if (key === 'fsicNumber' && val && val.length < 5) error = "FSIC Number is too short to be valid.";
    if (key === 'businessPermitNumber' && val && val.length < 5) error = "Permit Number is too short.";

    if (key === 'mobileNumber' && val) {
      const phPhone = /^(09\d{9}|\+639\d{9})$/;
      if (!phPhone.test(val.trim().replace(/[-\s]/g, ''))) error = "Invalid PH mobile number (e.g., 09171234567).";
    }

    if (key === 'email' && val) {
      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailRegex.test(val)) error = "Email must be a valid Gmail address (e.g., name@gmail.com).";
    }

    setErrors(prev => ({ ...prev, [key]: error }));
  };

  const validateStep = (currentStep) => {
    const tempErrors = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) tempErrors.name = "Venue name is required.";
      if (!formData.type) tempErrors.type = "Please select a venue type.";

      // Realistic Floor Area Validation (10 to 500,000 sqm)
      const area = parseFloat(formData.floorArea);
      if (!formData.floorArea || isNaN(area) || area < 10 || area > 500000) {
        tempErrors.floorArea = "Please enter a realistic floor area (10 to 500,000 sqm).";
      }

      // Representative Name Validation (Letters, spaces, periods, hyphens only)
      if (formData.representativeName) {
        const nameRegex = /^[A-Za-z\s.\-]+$/;
        if (!nameRegex.test(formData.representativeName)) {
          tempErrors.representativeName = "Name can only contain letters, spaces, and basic punctuation (., -).";
        }
      }

      // Ceiling Height Validation (Realistic range: 2 to 100 meters)
      if (formData.ceilingHeight) {
        const h = parseFloat(formData.ceilingHeight);
        if (isNaN(h) || h < 2 || h > 100) {
          tempErrors.ceilingHeight = "Enter a realistic height between 2 and 100 meters.";
        }
      }

      if (formData.mobileNumber) {
        const phPhone = /^(09\d{9}|\+639\d{9})$/;
        if (!phPhone.test(formData.mobileNumber.trim().replace(/[-\s]/g, ''))) {
          tempErrors.mobileNumber = "Invalid PH mobile number (e.g., 09171234567).";
        }
      }

      // Email Validation (Must be a standard @gmail.com format)
      if (formData.email) {
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(formData.email)) {
          tempErrors.email = "Email must be a valid Gmail address (e.g., name@gmail.com).";
        }
      }
    }

    if (currentStep === 2) {
      if (!psgcSel.regionCode) tempErrors.region = "Region is required.";
      if (!psgcSel.cityMunCode) tempErrors.city = "City/Municipality is required.";
      if (!formData.streetAddress.trim()) tempErrors.streetAddress = "Street address is required.";
    }

    if (currentStep === 3) {
      const area = parseFloat(formData.floorArea);
      if (formData.capacityTheater && parseInt(formData.capacityTheater, 10) > area * 2) tempErrors.capacityTheater = `Max capacity is ~${Math.floor(area * 2)}`;
      if (formData.capacityBanquet && parseInt(formData.capacityBanquet, 10) > area * 1.5) tempErrors.capacityBanquet = `Max capacity is ~${Math.floor(area * 1.5)}`;
      if (formData.capacityStanding && parseInt(formData.capacityStanding, 10) > area * 4) tempErrors.capacityStanding = `Max capacity is ~${Math.floor(area * 4)}`;
    }

    if (currentStep === 4) {
      if (files.galleryImages.length < 3) tempErrors.galleryImages = "Please upload at least 3 gallery images.";
      if (formData.fsicNumber && formData.fsicNumber.length < 5) tempErrors.fsicNumber = "FSIC Number is too short to be valid.";
      if (formData.businessPermitNumber && formData.businessPermitNumber.length < 5) tempErrors.businessPermitNumber = "Permit Number is too short.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setLoading(true);

    // Force a 500ms delay so the spinner has time to render and spin visually
    await new Promise(resolve => setTimeout(resolve, 500));

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '') {
        payload.append(key, formData[key]);
      }
    });

    // PSGC names + codes
    payload.append('region', getRegionName(psgcSel.regionCode));
    payload.append('province', getProvinceName(psgcSel.provinceCode));
    payload.append('city', getCityName(psgcSel.cityMunCode));
    payload.append('barangay', getBarangayName(psgcSel.barangayCode));
    payload.append('regionCode', psgcSel.regionCode);
    payload.append('provinceCode', psgcSel.provinceCode);
    payload.append('cityMunCode', psgcSel.cityMunCode);
    payload.append('barangayCode', psgcSel.barangayCode);

    files.galleryImages.forEach(file => payload.append('GalleryImages', file));
    if (files.floorPlanFile) payload.append('FloorPlanFile', files.floorPlanFile);
    if (files.legalPermitsFile) payload.append('LegalPermitsFile', files.legalPermitsFile);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/venues/add-venue`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Venue registered successfully!');
      setViewMode('grid');
    } catch (err) {
      console.error(err);
      alert('Error creating venue. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const baseInputCls = "w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border outline-none focus:border-purple-500 transition-colors text-sm";
  const inputCls = (fieldName) => `${baseInputCls} ${errors[fieldName] ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-700'}`;
  const labelCls = "text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block";

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Building className="text-purple-600" size={28} />
            Register New Venue
          </h2>
          <p className="text-sm text-slate-500 mt-1">Publish your physical space to the VenU platform.</p>
        </div>
        <span className="text-purple-600 dark:text-purple-400 font-bold text-sm bg-purple-50 dark:bg-purple-900/30 px-4 py-1.5 rounded-full">
          Step {step} of {steps.length}
        </span>
      </div>

      {/* Step Progress */}
      <div className="flex gap-1 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${i < step ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
            <p className={`text-[10px] mt-1.5 font-semibold ${i + 1 === step ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>{s}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── STEP 1: Core Details & Contact ─────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="text-purple-500" size={17} /> Core Details & Contact
            </h3>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Venue Name *</label>
                <input required maxLength={50} className={inputCls('name')} value={formData.name} onChange={e => set('name', e.target.value)} placeholder="e.g. SMX Convention Center" />
                {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className={labelCls}>Venue Type *</label>
                <select required className={inputCls('type')} value={formData.type} onChange={e => set('type', e.target.value)}>
                  <option value="">Select Type</option>
                  <option value="Indoor">Indoor Space</option>
                  <option value="Outdoor">Outdoor / Open Air</option>
                  <option value="Exhibition">Exhibition Hall</option>
                  <option value="Stadium">Stadium / Arena</option>
                  <option value="Hotel Ballroom">Hotel Ballroom</option>
                  <option value="Function Hall">Function Hall</option>
                </select>
                {errors.type && <p className="text-[10px] text-red-400 mt-1">{errors.type}</p>}
              </div>
              <div>
                <label className={labelCls}>Floor Area (sqm) *</label>
                <input required type="number" min="10" max="500000" className={inputCls('floorArea')} value={formData.floorArea} onChange={e => set('floorArea', e.target.value)} placeholder="e.g. 2500" />
                {errors.floorArea && <p className="text-[10px] text-red-400 mt-1">{errors.floorArea}</p>}
              </div>
              <div>
                <label className={labelCls}>Ceiling Height (meters)</label>
                <input type="number" step="0.1" className={inputCls('ceilingHeight')} value={formData.ceilingHeight} onChange={e => set('ceilingHeight', e.target.value)} placeholder="e.g. 8.5" />
                {errors.ceilingHeight && <p className="text-[10px] text-red-400 mt-1">{errors.ceilingHeight}</p>}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 grid grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Representative Name</label>
                <input maxLength={50} className={inputCls('representativeName')} value={formData.representativeName} onChange={e => set('representativeName', e.target.value)} placeholder="Full name" />
                {errors.representativeName && <p className="text-[10px] text-red-400 mt-1">{errors.representativeName}</p>}
              </div>
              <div>
                <label className={labelCls}>Mobile Number</label>
                <input maxLength={50} placeholder="09XX-XXX-XXXX" className={inputCls('mobileNumber')} value={formData.mobileNumber} onChange={e => set('mobileNumber', e.target.value)} />
                {errors.mobileNumber && <p className="text-[10px] text-red-400 mt-1">{errors.mobileNumber}</p>}
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" maxLength={50} className={inputCls('email')} value={formData.email} onChange={e => set('email', e.target.value)} placeholder="venue@gmail.com" />
                {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className={labelCls}>Website URL <span className="text-slate-400 font-normal ml-1">(Optional)</span></label>
                <input type="url" maxLength={50} className={inputCls('websiteUrl')} value={formData.websiteUrl} onChange={e => set('websiteUrl', e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Location (PSGC) ─────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MapPin className="text-purple-500" size={17} /> Location & Coordinates
            </h3>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40 rounded-lg p-3 text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              Powered by the Philippine Standard Geographic Code (PSGC) — official PSA data for all administrative areas.
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Region */}
              <Sel
                label="Region *"
                value={psgcSel.regionCode}
                onChange={e => selectRegion(e.target.value)}
                loading={psgcLoading.regions}
                error={errors.region}
              >
                <option value="">— Select Region —</option>
                {regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
              </Sel>

              {/* Province */}
              <Sel
                label="Province"
                value={psgcSel.provinceCode}
                onChange={e => selectProvince(e.target.value)}
                disabled={!psgcSel.regionCode || noProvinceRegion}
                loading={psgcLoading.provinces}
                error={errors.province}
              >
                {noProvinceRegion
                  ? <option value="__direct__">N/A — Province-less Region (e.g. NCR)</option>
                  : <>
                    <option value="">— Select Province —</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </>
                }
              </Sel>

              {/* City / Municipality */}
              <Sel
                label="City / Municipality"
                value={psgcSel.cityMunCode}
                onChange={e => selectCity(e.target.value)}
                disabled={!psgcSel.provinceCode}
                loading={psgcLoading.cities}
                error={errors.city}
              >
                <option value="">— Select City / Municipality —</option>
                {cities.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </Sel>

              {/* Street Address */}
              <div>
                <label className={labelCls}>Street / Building Address *</label>
                <input maxLength={50} className={inputCls('streetAddress')} value={formData.streetAddress} onChange={e => set('streetAddress', e.target.value)} placeholder="Unit/Bldg No., Street Name" />
                {errors.streetAddress && <p className="text-[10px] text-red-400 mt-1">{errors.streetAddress}</p>}
              </div>
            </div>

            {/* Barangay — search filter */}
            <BarangaySearchSelect
              barangays={barangays}
              value={psgcSel.barangayCode}
              onChange={(b) => selectBarangay(b.code)}
              loading={psgcLoading.barangays}
            />

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Zip Code</label>
                <input maxLength={10} className={inputCls('zipCode')} value={formData.zipCode} onChange={e => set('zipCode', e.target.value)} placeholder="e.g. 1109" />
              </div>
              <div>
                <label className={labelCls}>Landmarks / Nearby Places</label>
                <input maxLength={50} className={inputCls('landmarks')} value={formData.landmarks} onChange={e => set('landmarks', e.target.value)} placeholder="e.g. Near Mall of Asia, beside SM" />
              </div>
            </div>

            {/* Location preview */}
            {(psgcSel.regionCode || psgcSel.cityMunCode) && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 border border-slate-200 dark:border-slate-700 text-sm space-y-1">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Location Preview</p>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {[
                    getBarangayName(psgcSel.barangayCode),
                    getCityName(psgcSel.cityMunCode),
                    getProvinceName(psgcSel.provinceCode),
                    getRegionName(psgcSel.regionCode),
                  ].filter(Boolean).join(', ')}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Codes: {[psgcSel.regionCode, psgcSel.provinceCode, psgcSel.cityMunCode, psgcSel.barangayCode].filter(Boolean).join(' · ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Logistics & Amenities ──────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Settings className="text-purple-500" size={17} /> Capacity, Logistics & Amenities
            </h3>
            <div className="grid grid-cols-3 gap-5">
              <div>
                <label className={labelCls}>Theater Capacity</label>
                <input type="number" min="0" className={inputCls('capacityTheater')} value={formData.capacityTheater} onChange={e => set('capacityTheater', e.target.value)} placeholder="0" />
                <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">Max seating in rows (e.g. seminars)</p>
                {errors.capacityTheater && <p className="text-[10px] text-red-400 mt-1">{errors.capacityTheater}</p>}
              </div>
              <div>
                <label className={labelCls}>Banquet Capacity</label>
                <input type="number" min="0" className={inputCls('capacityBanquet')} value={formData.capacityBanquet} onChange={e => set('capacityBanquet', e.target.value)} placeholder="0" />
                <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">Max seating with round tables (e.g. weddings)</p>
                {errors.capacityBanquet && <p className="text-[10px] text-red-400 mt-1">{errors.capacityBanquet}</p>}
              </div>
              <div>
                <label className={labelCls}>Standing / Cocktail</label>
                <input type="number" min="0" className={inputCls('capacityStanding')} value={formData.capacityStanding} onChange={e => set('capacityStanding', e.target.value)} placeholder="0" />
                <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">Max capacity with no chairs/tables</p>
                {errors.capacityStanding && <p className="text-[10px] text-red-400 mt-1">{errors.capacityStanding}</p>}
              </div>
              <div>
                <label className={labelCls}>Parking Slots</label>
                <input type="number" min="0" className={inputCls('parkingSlots')} value={formData.parkingSlots} onChange={e => set('parkingSlots', e.target.value)} placeholder="0" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Operating Hours</label>
                <input maxLength={50} className={inputCls('operatingHours')} value={formData.operatingHours} onChange={e => set('operatingHours', e.target.value)} placeholder="e.g. Mon–Sun, 8:00 AM – 10:00 PM" />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
              {[
                ['hasAircon', 'Airconditioning'],
                ['hasSoundSystem', 'Built-in Sound System'],
                ['hasBackupGenerator', 'Backup Generator'],
                ['hasHoldingRooms', 'Holding Rooms / Backstage'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors">
                  <input type="checkbox" className="w-4 h-4 accent-purple-600" checked={formData[key]} onChange={e => set(key, e.target.checked)} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 4: Legal & Files ───────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <UploadCloud className="text-purple-500" size={17} /> Legal Compliance & Files
            </h3>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>FSIC Number (Fire Safety)</label>
                <input maxLength={50} className={inputCls('fsicNumber')} value={formData.fsicNumber} onChange={e => set('fsicNumber', e.target.value)} placeholder="e.g. FSIC-2023-01234" />
                {errors.fsicNumber && <p className="text-[10px] text-red-400 mt-1">{errors.fsicNumber}</p>}
              </div>
              <div>
                <label className={labelCls}>Mayor's Permit / Business Permit No.</label>
                <input maxLength={50} className={inputCls('businessPermitNumber')} value={formData.businessPermitNumber} onChange={e => set('businessPermitNumber', e.target.value)} placeholder="e.g. BP-2023-012345" />
                {errors.businessPermitNumber && <p className="text-[10px] text-red-400 mt-1">{errors.businessPermitNumber}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ['hasBirForm2303', 'BIR Form 2303'],
                ['hasSmokeDetectors', 'Smoke Detectors'],
                ['hasFireExits', 'Fire Exits'],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                  <input type="checkbox" className="w-4 h-4 accent-purple-600" checked={formData[key]} onChange={e => set(key, e.target.checked)} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Venue Gallery <span className="text-purple-500">(Min. 3 images required)</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e => {
                    const filesArray = Array.from(e.target.files);
                    const oversized = filesArray.some(f => f.size > 5 * 1024 * 1024);
                    if (oversized) {
                       setErrors(prev => ({ ...prev, galleryImages: "Each image must be under 5MB." }));
                       return;
                    }
                    setFiles(f => ({ ...f, galleryImages: filesArray }));
                    // Real-time validation for files
                    setErrors(prev => ({ ...prev, galleryImages: filesArray.length < 3 ? "Please upload at least 3 gallery images." : null }));
                  }}
                  className={`text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 dark:file:bg-purple-900/50 dark:file:text-purple-400 hover:file:bg-purple-200 cursor-pointer ${errors.galleryImages ? 'border border-red-400 rounded-lg p-2' : ''}`}
                />
                {files.galleryImages.length > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{files.galleryImages.length} file(s) selected</p>
                )}
                {errors.galleryImages && <p className="text-[10px] text-red-400 mt-1">{errors.galleryImages}</p>}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Floor Plan / Blueprint (PDF/IMG)</label>
                <input type="file" onChange={e => {
                  if (e.target.files[0] && e.target.files[0].size > 5 * 1024 * 1024) {
                    alert("File must be under 5MB.");
                    e.target.value = '';
                    return;
                  }
                  setFiles(f => ({ ...f, floorPlanFile: e.target.files[0] }));
                }}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 dark:file:bg-slate-700 dark:file:text-slate-300 cursor-pointer" />
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Legal Permits Package (Zip/PDF)</label>
                <input type="file" onChange={e => {
                  if (e.target.files[0] && e.target.files[0].size > 10 * 1024 * 1024) {
                    alert("Permit package must be under 10MB.");
                    e.target.value = '';
                    return;
                  }
                  setFiles(f => ({ ...f, legalPermitsFile: e.target.files[0] }));
                }}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 dark:file:bg-slate-700 dark:file:text-slate-300 cursor-pointer" />
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation ──────────────────────────────────────────────── */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <button type="button" onClick={prevStep} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-lg flex items-center gap-2 transition-colors text-sm">
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <button type="button" onClick={() => setViewMode('grid')} className="text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              ← Cancel
            </button>
          )}

          {step < 4 ? (
            <button type="button" onClick={nextStep} className="px-7 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-purple-500/25 text-sm">
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <CheckCircle size={16} /> Submit Venue
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}