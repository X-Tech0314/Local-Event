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
      className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  const [formData, setFormData] = useState({
    name: '', type: '', floorArea: '', ceilingHeight: '',
    streetAddress: '', landmarks: '', latitude: '', longitude: '',
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

  const set = (key, val) => setFormData(f => ({ ...f, [key]: val }));

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    Object.keys(formData).forEach(key => payload.append(key, formData[key]));

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

  const inputCls = "w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500 transition-colors text-sm";
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
                <input required className={inputCls} value={formData.name} onChange={e => set('name', e.target.value)} placeholder="e.g. SMX Convention Center" />
              </div>
              <div>
                <label className={labelCls}>Venue Type *</label>
                <select required className={inputCls} value={formData.type} onChange={e => set('type', e.target.value)}>
                  <option value="">Select Type</option>
                  <option value="Indoor">Indoor Space</option>
                  <option value="Outdoor">Outdoor / Open Air</option>
                  <option value="Exhibition">Exhibition Hall</option>
                  <option value="Stadium">Stadium / Arena</option>
                  <option value="Hotel Ballroom">Hotel Ballroom</option>
                  <option value="Function Hall">Function Hall</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Floor Area (sqm) *</label>
                <input required type="number" min="1" className={inputCls} value={formData.floorArea} onChange={e => set('floorArea', e.target.value)} placeholder="e.g. 2500" />
              </div>
              <div>
                <label className={labelCls}>Ceiling Height (meters)</label>
                <input type="number" step="0.1" className={inputCls} value={formData.ceilingHeight} onChange={e => set('ceilingHeight', e.target.value)} placeholder="e.g. 8.5" />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 grid grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Representative Name</label>
                <input className={inputCls} value={formData.representativeName} onChange={e => set('representativeName', e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <label className={labelCls}>Mobile Number</label>
                <input placeholder="09XX-XXX-XXXX" className={inputCls} value={formData.mobileNumber} onChange={e => set('mobileNumber', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" className={inputCls} value={formData.email} onChange={e => set('email', e.target.value)} placeholder="venue@example.com" />
              </div>
              <div>
                <label className={labelCls}>Website URL</label>
                <input type="url" className={inputCls} value={formData.websiteUrl} onChange={e => set('websiteUrl', e.target.value)} placeholder="https://..." />
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
              >
                <option value="">— Select City / Municipality —</option>
                {cities.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </Sel>

              {/* Street Address */}
              <div>
                <label className={labelCls}>Street / Building Address</label>
                <input className={inputCls} value={formData.streetAddress} onChange={e => set('streetAddress', e.target.value)} placeholder="Unit/Bldg No., Street Name" />
              </div>
            </div>

            {/* Barangay — search filter */}
            <BarangaySearchSelect
              barangays={barangays}
              value={psgcSel.barangayCode}
              onChange={(b) => selectBarangay(b.code)}
              loading={psgcLoading.barangays}
            />

            <div>
              <label className={labelCls}>Landmarks / Nearby Places</label>
              <input className={inputCls} value={formData.landmarks} onChange={e => set('landmarks', e.target.value)} placeholder="e.g. Near Mall of Asia, beside SM" />
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
                <input type="number" className={inputCls} value={formData.capacityTheater} onChange={e => set('capacityTheater', e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className={labelCls}>Banquet Capacity</label>
                <input type="number" className={inputCls} value={formData.capacityBanquet} onChange={e => set('capacityBanquet', e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className={labelCls}>Standing / Cocktail</label>
                <input type="number" className={inputCls} value={formData.capacityStanding} onChange={e => set('capacityStanding', e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className={labelCls}>Parking Slots</label>
                <input type="number" className={inputCls} value={formData.parkingSlots} onChange={e => set('parkingSlots', e.target.value)} placeholder="0" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Operating Hours</label>
                <input className={inputCls} value={formData.operatingHours} onChange={e => set('operatingHours', e.target.value)} placeholder="e.g. Mon–Sun, 8:00 AM – 10:00 PM" />
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
                <input className={inputCls} value={formData.fsicNumber} onChange={e => set('fsicNumber', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Mayor's Permit / Business Permit No.</label>
                <input className={inputCls} value={formData.businessPermitNumber} onChange={e => set('businessPermitNumber', e.target.value)} />
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
                <input type="file" multiple accept="image/*" onChange={e => setFiles(f => ({ ...f, galleryImages: Array.from(e.target.files) }))}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 dark:file:bg-purple-900/50 dark:file:text-purple-400 hover:file:bg-purple-200 cursor-pointer" />
                {files.galleryImages.length > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{files.galleryImages.length} file(s) selected</p>
                )}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Floor Plan / Blueprint (PDF/IMG)</label>
                <input type="file" onChange={e => setFiles(f => ({ ...f, floorPlanFile: e.target.files[0] }))}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 dark:file:bg-slate-700 dark:file:text-slate-300 cursor-pointer" />
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Legal Permits Package (Zip/PDF)</label>
                <input type="file" onChange={e => setFiles(f => ({ ...f, legalPermitsFile: e.target.files[0] }))}
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
            <button type="submit" disabled={loading} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 disabled:opacity-50 text-sm">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {loading ? 'Submitting...' : 'Submit Venue'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
