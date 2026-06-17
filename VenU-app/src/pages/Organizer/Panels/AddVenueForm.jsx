import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle, ChevronRight, ChevronLeft, Building, UploadCloud, MapPin, Settings, FileText } from 'lucide-react';

export default function AddVenueForm({ setViewMode }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', type: '', floorArea: '', ceilingHeight: '',
    streetAddress: '', barangay: '', city: '', province: '', landmarks: '', latitude: '', longitude: '',
    representativeName: '', mobileNumber: '', landline: '', email: '', websiteUrl: '',
    capacityTheater: '', capacityBanquet: '', capacityStanding: '', parkingSlots: '', operatingHours: '',
    hasAircon: false, hasSoundSystem: false, hasBackupGenerator: false, hasHoldingRooms: false,
    fsicNumber: '', businessPermitNumber: '', hasBirForm2303: false, hasSmokeDetectors: false, hasFireExits: false,
  });

  const [files, setFiles] = useState({ galleryImages: [], floorPlanFile: null, legalPermitsFile: null });
  const [loading, setLoading] = useState(false);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = new FormData();
    Object.keys(formData).forEach(key => payload.append(key, formData[key]));
    
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
      alert('Venue created successfully!');
      setViewMode('grid'); // Return to venues list
    } catch (err) {
      console.error(err);
      alert('Error creating venue. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-in">
      <div className="flex justify-between items-end mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Building className="text-purple-600" size={32} />
            Register New Venue
          </h2>
          <p className="text-sm text-slate-500 mt-2">Publish your physical space to the VenU platform.</p>
        </div>
        <span className="text-purple-600 dark:text-purple-500 font-bold tracking-wider uppercase text-sm bg-purple-50 dark:bg-purple-900/30 px-4 py-1.5 rounded-full">
          Step {step} of 4
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* STEP 1: Core & Contact */}
        {step === 1 && (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2">
              <FileText className="text-purple-500" size={20} /> 1. Core Details & Contact
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">Venue Name *</label>
                <input required className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">Venue Type *</label>
                <select required className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="">Select Type</option><option value="Indoor">Indoor Space</option><option value="Outdoor">Outdoor / Open Air</option><option value="Exhibition">Exhibition Hall</option><option value="Stadium">Stadium / Arena</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">Floor Area (sqm) *</label>
                <input required type="number" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.floorArea} onChange={e => setFormData({...formData, floorArea: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">Ceiling Height (meters)</label>
                <input type="number" step="0.1" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.ceilingHeight} onChange={e => setFormData({...formData, ceilingHeight: e.target.value})} />
              </div>
              <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 pt-6 mt-2 grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">Mobile Number</label>
                  <input placeholder="09XX-XXX-XXXX" pattern="^09\d{2}-\d{3}-\d{4}$" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">Representative Email</label>
                  <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location */}
        {step === 2 && (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2">
              <MapPin className="text-purple-500" size={20} /> 2. Location & Coordinates
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">Province</label>
                <input className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">City</label>
                <input className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">Street Address</label>
                <input className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.streetAddress} onChange={e => setFormData({...formData, streetAddress: e.target.value})} />
              </div>
            </div>
            {/* Map Integration Placeholder */}
            <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-500 mt-4 relative overflow-hidden group">
               <MapPin size={32} className="text-slate-400 mb-2 group-hover:-translate-y-2 transition-transform" />
               <span className="font-semibold">[ Map Pin Selection Coming Soon ]</span>
               <span className="text-xs mt-1">This will automatically set Latitude/Longitude</span>
               <div className="absolute inset-x-0 bottom-0 bg-slate-200 dark:bg-slate-700 p-2 text-xs flex justify-between">
                 <span>Lat: {formData.latitude || 'N/A'}</span>
                 <span>Lng: {formData.longitude || 'N/A'}</span>
               </div>
            </div>
          </div>
        )}

        {/* STEP 3: Logistics */}
        {step === 3 && (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2">
              <Settings className="text-purple-500" size={20} /> 3. Logistics & Amenities
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">Theater Capacity</label>
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.capacityTheater} onChange={e => setFormData({...formData, capacityTheater: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">Banquet Capacity</label>
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.capacityBanquet} onChange={e => setFormData({...formData, capacityBanquet: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">Parking Slots</label>
                <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.parkingSlots} onChange={e => setFormData({...formData, parkingSlots: e.target.value})} />
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4 mt-4">
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"><input type="checkbox" className="w-4 h-4 accent-purple-600" checked={formData.hasAircon} onChange={e => setFormData({...formData, hasAircon: e.target.checked})} /> <span className="font-medium text-slate-700 dark:text-slate-300">Airconditioning</span></label>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"><input type="checkbox" className="w-4 h-4 accent-purple-600" checked={formData.hasSoundSystem} onChange={e => setFormData({...formData, hasSoundSystem: e.target.checked})} /> <span className="font-medium text-slate-700 dark:text-slate-300">Built-in Sound System</span></label>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"><input type="checkbox" className="w-4 h-4 accent-purple-600" checked={formData.hasBackupGenerator} onChange={e => setFormData({...formData, hasBackupGenerator: e.target.checked})} /> <span className="font-medium text-slate-700 dark:text-slate-300">Backup Generator</span></label>
              <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors"><input type="checkbox" className="w-4 h-4 accent-purple-600" checked={formData.hasHoldingRooms} onChange={e => setFormData({...formData, hasHoldingRooms: e.target.checked})} /> <span className="font-medium text-slate-700 dark:text-slate-300">Holding Rooms / Backstage</span></label>
            </div>
          </div>
        )}

        {/* STEP 4: Legal & Files */}
        {step === 4 && (
          <div className="animate-fade-in space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-2">
              <UploadCloud className="text-purple-500" size={20} /> 4. Legal Compliance & Files
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">FSIC Number (Fire Safety)</label>
                <input className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.fsicNumber} onChange={e => setFormData({...formData, fsicNumber: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 block">Mayor's Permit Number</label>
                <input className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 outline-none focus:border-purple-500" value={formData.businessPermitNumber} onChange={e => setFormData({...formData, businessPermitNumber: e.target.value})} />
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6 mt-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Venue Gallery (Min 3 Images)</label>
                <input type="file" multiple accept="image/*" onChange={e => setFiles({...files, galleryImages: Array.from(e.target.files)})} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 dark:file:bg-purple-900/50 dark:file:text-purple-400 hover:file:bg-purple-200" />
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Floor Plan / Blueprint (PDF/IMG)</label>
                <input type="file" onChange={e => setFiles({...files, floorPlanFile: e.target.files[0]})} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 dark:file:bg-slate-700 dark:file:text-slate-300 hover:file:bg-slate-300" />
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Legal Permits (Zip/PDF)</label>
                <input type="file" onChange={e => setFiles({...files, legalPermitsFile: e.target.files[0]})} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 dark:file:bg-slate-700 dark:file:text-slate-300 hover:file:bg-slate-300" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800 mt-8">
          {step > 1 ? (
            <button type="button" onClick={prevStep} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded flex items-center gap-2 transition-colors">
              <ChevronLeft size={18}/> Back
            </button>
          ) : (
            <button type="button" onClick={() => setViewMode('grid')} className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              Cancel
            </button>
          )}
          
          {step < 4 ? (
            <button type="button" onClick={nextStep} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded flex items-center gap-2 transition-colors shadow-lg shadow-purple-500/20">
              Next <ChevronRight size={18}/>
            </button>
          ) : (
            <button type="submit" disabled={loading} className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 disabled:opacity-50">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><CheckCircle size={18}/> Submit Venue</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
