import React, { useState } from 'react';
import { UploadCloud, User, Eye, EyeOff, Building, MapPin, ShieldAlert } from 'lucide-react';
import { PHILIPPINE_GOVERNMENT_IDS, philippineAddressData, passwordRules } from '../../utils/constants.js';
import { isContactValid, isEmailValid, validatePassword, isIdNumberValid } from '../../utils/validation.js';
import FileDropzone from '../common/FileDropzone.jsx';

export default function OrganizerRegister({ onSubmit, onClose, onToggleMode, createRole, setCreateRole }) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: Org Info
  const [orgType, setOrgType] = useState('Commercial/Private Business');
  const [companyName, setCompanyName] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [councilName, setCouncilName] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [orgDocFile, setOrgDocFile] = useState(null);

  // Step 3: Address
  const [street, setStreet] = useState('');
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');

  // Step 4: ID Verification
  const [idType, setIdType] = useState('');
  const [idFrontFile, setIdFrontFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [idReferenceNumber, setIdReferenceNumber] = useState('');
  const [merchantConsent, setMerchantConsent] = useState(false);

  // Touched state
  const [touched, setTouched] = useState({});
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const validation = validatePassword(password);

  const isTinValid = (v) => /^\d{3}-\d{3}-\d{3}-\d{3}$|^\d{9}$|^\d{12}$/.test(v.replace(/\s/g, ''));

  const isStep1Valid =
    firstName.trim() &&
    lastName.trim() &&
    position.trim() &&
    contactNumber.trim() && isContactValid(contactNumber) &&
    corporateEmail.trim() && isEmailValid(corporateEmail) &&
    password && Object.values(validation).every(Boolean) &&
    confirmPassword === password;

  const isStep2Valid =
    (orgType === 'Commercial/Private Business' && companyName.trim() && tinNumber.trim() && isTinValid(tinNumber) && orgDocFile) ||
    (orgType === 'LGU / Barangay / SK' && councilName.trim() && orgDocFile) ||
    (orgType === 'Accredited Student Organization' && universityName.trim() && orgDocFile);

  const isStep3Valid = street.trim() && region && province && city && barangay;

  const idRequiresBack = PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType)?.hasBackSide;
  const isStep4Valid =
    idType &&
    idFrontFile &&
    (!idRequiresBack || idBackFile) &&
    selfieFile &&
    idReferenceNumber.trim() && isIdNumberValid(idType, idReferenceNumber) &&
    merchantConsent;

  const canSubmit = isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && canSubmit) {
      onSubmit({
        role: 'Organizer',
        personal: { firstName, lastName, position, contactNumber, email: corporateEmail, password },
        address: { street, region, province, city, barangay },
        orgProfile: { orgType, companyName, tinNumber, councilName, universityName, document: orgDocFile },
        idVerification: { type: idType, front: idFrontFile, back: idBackFile, selfie: selfieFile, referenceNumber: idReferenceNumber },
      });
    }
  };



  const roles = ['Organizer', 'Attendee'];

  return (
    <div className="w-full max-w-4xl mx-4 lg:mx-8 bg-[#111827] border border-slate-800 rounded-2xl p-8 shadow-xl max-h-[90vh] overflow-y-auto relative transition-all duration-300 text-white scrollbar-thin">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.15em] text-[#A855F7] uppercase">
            Organizer Console
          </p>
          <h2 className="text-xl font-semibold text-white mt-1">
            Create Organizer Account
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-white/50 hover:text-white transition-colors pt-1 cursor-pointer"
        >
          Close
        </button>
      </div>

      <form className="space-y-5" onSubmit={handleFormSubmit}>
        {/* Role Selector */}
        <div className="flex bg-slate-800/60 rounded-full p-1">
          {roles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setCreateRole(r)}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer ${
                createRole === r
                  ? 'bg-[#A855F7] text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  stepNum === currentStep
                    ? 'w-6 bg-[#A855F7]'
                    : stepNum < currentStep
                    ? 'w-2 bg-[#A855F7]/50'
                    : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
            Step {currentStep} of 4
          </span>
        </div>

        {/* Form Input Card */}
        <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-2xl space-y-6 text-left">
          
          {/* SECTION 1: Personal & Position Block */}
          {currentStep === 1 && (
            <div className="animate-fadeIn">
              <h4 className="text-sm font-bold text-white/90 border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-[#A855F7]" /> 1. Personal & Position Details
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={() => touch('firstName')}
                      className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${
                        touched.firstName && !firstName.trim() ? 'border-red-500/60' : 'border-white/10 focus:border-[#A855F7]/50'
                      }`}
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={() => touch('lastName')}
                      className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${
                        touched.lastName && !lastName.trim() ? 'border-red-500/60' : 'border-white/10 focus:border-[#A855F7]/50'
                      }`}
                      placeholder="dela Cruz"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">Official Position / Designation</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      onBlur={() => touch('position')}
                      className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${
                        touched.position && !position.trim() ? 'border-red-500/60' : 'border-white/10 focus:border-[#A855F7]/50'
                      }`}
                      placeholder="Event Director"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">Contact Number</label>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      onBlur={() => touch('contactNumber')}
                      className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${
                        touched.contactNumber && (!contactNumber.trim() || !isContactValid(contactNumber))
                          ? 'border-red-500/60'
                          : 'border-white/10 focus:border-[#A855F7]/50'
                      }`}
                      placeholder="+639XXXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">Corporate Email Address</label>
                  <input
                    type="email"
                    value={corporateEmail}
                    onChange={(e) => setCorporateEmail(e.target.value)}
                    onBlur={() => touch('corporateEmail')}
                    className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${
                      touched.corporateEmail && (!corporateEmail.trim() || !isEmailValid(corporateEmail))
                        ? 'border-red-500/60'
                        : 'border-white/10 focus:border-[#A855F7]/50'
                    }`}
                    placeholder="director@company.ph"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">Password (Min 8 chars)</label>
                    <div className={`flex items-center rounded-lg border px-3 py-2 bg-slate-950/80 ${
                      touched.password && password.length < 8 ? 'border-red-500/60' : 'border-white/10 focus-within:border-[#A855F7]/50'
                    }`}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => touch('password')}
                        className="w-full bg-transparent text-white text-sm outline-none"
                        placeholder="Create password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-white/40 hover:text-white ml-2"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">Confirm Password</label>
                    <div className={`flex items-center rounded-lg border px-3 py-2 bg-slate-950/80 ${
                      touched.confirmPassword && confirmPassword !== password ? 'border-red-500/60' : 'border-white/10 focus-within:border-[#A855F7]/50'
                    }`}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => touch('confirmPassword')}
                        className="w-full bg-transparent text-white text-sm outline-none"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-white/40 hover:text-white ml-2"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-950/40 border border-white/5 px-3 py-2">
                  <p className="text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase mb-1.5">
                    Password Requirements:
                  </p>
                  <ul className="space-y-1">
                    {passwordRules.map((pr) => (
                      <li key={pr.key} className="flex items-center gap-2 text-xs">
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                            validation[pr.key] ? 'bg-green-400' : 'bg-white/10'
                          }`}
                        />
                        <span
                          className={`transition-colors duration-300 ${
                            validation[pr.key] ? 'text-green-400 font-medium' : 'text-white/30'
                          }`}
                        >
                          {pr.rule}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!isStep1Valid}
                    className={`w-full rounded-xl py-3 text-white text-xs font-semibold transition-all duration-300 cursor-pointer ${
                      isStep1Valid ? 'bg-[#A855F7] hover:bg-[#9333EA] shadow-md shadow-purple-500/20' : 'bg-purple-500/30 cursor-not-allowed opacity-50'
                    }`}
                  >
                    Next: Organization Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Organization Profile Setup */}
          {currentStep === 2 && (
            <div className="animate-fadeIn">
              <h4 className="text-sm font-bold text-white/90 border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
                <Building className="h-4 w-4 text-[#A855F7]" /> 2. Organization/Business Profile Setup
              </h4>
              <div className="space-y-4">
                <div className="text-slate-800">
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">Organization Type</label>
                  <select
                    value={orgType}
                    onChange={(e) => {
                      setOrgType(e.target.value);
                      setOrgDocFile(null);
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2.5 text-white text-sm outline-none focus:border-[#A855F7]/50 transition-colors [&>option]:bg-slate-950 [&>option]:text-white"
                  >
                    <option value="Commercial/Private Business">Commercial / Private Business</option>
                    <option value="LGU / Barangay / SK">LGU / Barangay / SK</option>
                    <option value="Accredited Student Organization">Accredited Student Organization</option>
                  </select>
                </div>

                {orgType === 'Commercial/Private Business' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1.5">Company Name</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          onBlur={() => touch('companyName')}
                          className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors bg-slate-950/80 ${
                            touched.companyName && !companyName.trim() ? 'border-red-500/60' : 'border-white/10 focus:border-[#A855F7]/50'
                          }`}
                          placeholder="Enter registered business name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/70 mb-1.5">TIN Number (Taxpayer ID)</label>
                        <input
                          type="text"
                          value={tinNumber}
                          onChange={(e) => setTinNumber(e.target.value)}
                          onBlur={() => touch('tinNumber')}
                          className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors bg-slate-950/80 ${
                            touched.tinNumber && (!tinNumber.trim() || !isTinValid(tinNumber))
                              ? 'border-red-500/60'
                              : 'border-white/10 focus:border-[#A855F7]/50'
                          }`}
                          placeholder="000-000-000-000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">DTI / SEC / BIR Form 2303 Certificate</label>
                      <FileDropzone
                        label="Upload Business Registration Document"
                        file={orgDocFile}
                        onFileChange={setOrgDocFile}
                        onRemove={() => setOrgDocFile(null)}
                        accept=".pdf,image/*"
                      />
                    </div>
                  </div>
                )}

                {orgType === 'LGU / Barangay / SK' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">Barangay / Council Name</label>
                      <input
                        type="text"
                        value={councilName}
                        onChange={(e) => setCouncilName(e.target.value)}
                        onBlur={() => touch('councilName')}
                        className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors bg-slate-950/80 ${
                          touched.councilName && !councilName.trim() ? 'border-red-500/60' : 'border-white/10 focus:border-[#A855F7]/50'
                        }`}
                        placeholder="e.g. Barangay Socorro Council"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">Official Appointment / Oath of Office Document</label>
                      <FileDropzone
                        label="Upload Appointment / Oath Document"
                        file={orgDocFile}
                        onFileChange={setOrgDocFile}
                        onRemove={() => setOrgDocFile(null)}
                        accept=".pdf,image/*"
                      />
                    </div>
                  </div>
                )}

                {orgType === 'Accredited Student Organization' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">University / College Name</label>
                      <input
                        type="text"
                        value={universityName}
                        onChange={(e) => setUniversityName(e.target.value)}
                        onBlur={() => touch('universityName')}
                        className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors bg-slate-950/80 ${
                          touched.universityName && !universityName.trim() ? 'border-red-500/60' : 'border-white/10 focus:border-[#A855F7]/50'
                        }`}
                        placeholder="e.g. University of the Philippines Diliman"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70 mb-1.5">OSA Accreditation / Adviser Endorsement Letter</label>
                      <FileDropzone
                        label="Upload Accreditation Certificate"
                        file={orgDocFile}
                        onFileChange={setOrgDocFile}
                        onRemove={() => setOrgDocFile(null)}
                        accept=".pdf,image/*"
                      />
                    </div>
                  </div>
                )}
                
                <div className="pt-2 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-3 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={!isStep2Valid}
                    className={`flex-[2] rounded-xl py-3 text-white text-xs font-semibold transition-all duration-300 cursor-pointer ${
                      isStep2Valid ? 'bg-[#A855F7] hover:bg-[#9333EA] shadow-md shadow-purple-500/20' : 'bg-purple-500/30 cursor-not-allowed opacity-50'
                    }`}
                  >
                    Next: Base Coordinates
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Official Base Coordinates */}
          {currentStep === 3 && (
            <div className="animate-fadeIn">
              <h4 className="text-sm font-bold text-white/90 border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#A855F7]" /> 3. Official Base Coordinates (Address)
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">Street Address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    onBlur={() => touch('street')}
                    className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors bg-slate-950/80 placeholder:text-white/25 ${
                      touched.street && !street.trim() ? 'border-red-500/60' : 'border-white/10'
                    }`}
                    placeholder="Unit, Building, Block & Lot No."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">Region</label>
                    <select
                      value={region}
                      onChange={(e) => {
                        setRegion(e.target.value);
                        setProvince('');
                        setCity('');
                        setBarangay('');
                        touch('region');
                      }}
                      className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-white text-sm outline-none [&>option]:bg-slate-950 [&>option]:text-white"
                    >
                      <option value="">Select Region</option>
                      {Object.keys(philippineAddressData).map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">Province</label>
                    <select
                      value={province}
                      disabled={!region}
                      onChange={(e) => {
                        setProvince(e.target.value);
                        setCity('');
                        setBarangay('');
                        touch('province');
                      }}
                      className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-white text-sm outline-none disabled:opacity-40 [&>option]:bg-slate-950 [&>option]:text-white"
                    >
                      <option value="">Select Province</option>
                      {region &&
                        Object.keys(philippineAddressData[region].provinces).map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">City / Municipality</label>
                    <select
                      value={city}
                      disabled={!province}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setBarangay('');
                        touch('city');
                      }}
                      className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-white text-sm outline-none disabled:opacity-40 [&>option]:bg-slate-950 [&>option]:text-white"
                    >
                      <option value="">Select City / Mun.</option>
                      {region && province &&
                        Object.keys(philippineAddressData[region].provinces[province].cities).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">Barangay</label>
                    <select
                      value={barangay}
                      disabled={!city}
                      onChange={(e) => {
                        setBarangay(e.target.value);
                        touch('barangay');
                      }}
                      className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-white text-sm outline-none disabled:opacity-40 [&>option]:bg-slate-950 [&>option]:text-white"
                    >
                      <option value="">Select Barangay</option>
                      {region && province && city &&
                        philippineAddressData[region].provinces[province].cities[city].map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-3 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    disabled={!isStep3Valid}
                    className={`flex-[2] rounded-xl py-3 text-white text-xs font-semibold transition-all duration-300 cursor-pointer ${
                      isStep3Valid ? 'bg-[#A855F7] hover:bg-[#9333EA] shadow-md shadow-purple-500/20' : 'bg-purple-500/30 cursor-not-allowed opacity-50'
                    }`}
                  >
                    Next: ID Verification
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Representative Identification Upload */}
          {currentStep === 4 && (
            <div className="animate-fadeIn">
              <h4 className="text-sm font-bold text-white/90 border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-[#A855F7]" /> 4. Representative ID Verification
              </h4>
              <div className="space-y-4">
                <div className="text-slate-800">
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">Select Representative Gov't ID</label>
                  <select
                    value={idType}
                    onChange={(e) => {
                      setIdType(e.target.value);
                      setIdFrontFile(null);
                      setIdBackFile(null);
                      setIdReferenceNumber('');
                      touch('idType');
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2.5 text-white text-sm outline-none focus:border-[#A855F7]/50 [&>option]:bg-slate-950 [&>option]:text-white"
                  >
                    <option value="">Choose ID Type</option>
                    {PHILIPPINE_GOVERNMENT_IDS.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                {idType && PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType) && (
                  <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start mb-4 animate-fadeIn">
                    <img
                      src={PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType).sampleUrl}
                      alt={PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType).name}
                      className="w-40 h-28 object-contain rounded-md border border-slate-200 bg-white shadow-sm flex-shrink-0"
                    />
                    <div className="text-left text-slate-800">
                      <h5 className="font-semibold text-xs uppercase tracking-wide mb-1">
                        {PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType).name} Reference
                      </h5>
                      <p className="text-slate-500 text-xs leading-relaxed mb-2">
                        {PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType).description}
                      </p>
                      <input
                        type="text"
                        value={idReferenceNumber}
                        onChange={(e) => setIdReferenceNumber(e.target.value.toUpperCase())}
                        onBlur={() => touch('idReferenceNumber')}
                        className={`w-full mt-1 px-3 py-2 border rounded-md text-sm outline-none font-mono bg-white ${
                          touched.idReferenceNumber && !isIdNumberValid(idType, idReferenceNumber)
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-slate-300 focus:border-[#A855F7]'
                        }`}
                        placeholder={PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType).placeholder}
                      />
                      {touched.idReferenceNumber && !isIdNumberValid(idType, idReferenceNumber) && (
                        <p className="text-[10px] text-red-500 mt-1 font-medium">Invalid ID format.</p>
                      )}
                    </div>
                  </div>
                )}

                {idType && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                    <FileDropzone
                      label="Upload ID Front Side"
                      file={idFrontFile}
                      onFileChange={setIdFrontFile}
                      onRemove={() => setIdFrontFile(null)}
                    />
                    
                    {idRequiresBack ? (
                      <FileDropzone
                        label="Upload ID Back Side"
                        file={idBackFile}
                        onFileChange={setIdBackFile}
                        onRemove={() => setIdBackFile(null)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/20 border border-white/5 text-center text-xs text-white/30 text-balance h-full min-h-[140px]">
                        This ID type (Passport/UMID) does not require a Back Side image.
                      </div>
                    )}
                  </div>
                )}

                {idType && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs font-semibold text-white/70 mb-1.5">Selfie Verification Photo</label>
                    <FileDropzone
                      label="Upload Selfie holding the Gov't ID"
                      file={selfieFile}
                      onFileChange={setSelfieFile}
                      onRemove={() => setSelfieFile(null)}
                    />
                  </div>
                )}

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-[#A855F7] h-4 w-4 mt-0.5 shrink-0"
                      checked={merchantConsent}
                      onChange={(e) => {
                        setMerchantConsent(e.target.checked);
                        touch('consent');
                      }}
                    />
                    <span className="text-white/60">
                      I agree to the <strong className="text-[#A855F7] hover:underline">Terms of Service for Event Organizers</strong> and consent to the collection and background verification of our uploaded official credentials in strict compliance with the <strong className="text-white">Philippine Data Privacy Act of 2012</strong>.
                    </span>
                  </label>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-[0.5] rounded-xl bg-slate-800 hover:bg-slate-700 py-3 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`flex-1 rounded-xl py-3 text-white text-xs font-semibold transition-all duration-300 cursor-pointer ${
                      canSubmit
                        ? 'bg-[#A855F7] hover:bg-[#9333EA] shadow-md shadow-purple-500/20 active:scale-[0.99]'
                        : 'bg-purple-500/30 cursor-not-allowed opacity-50 text-white/50'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Switch */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer animate-pulse"
          >
            Already have an account? <span className="text-[#A855F7] font-semibold">Sign In</span>
          </button>
        </div>
      </form>
    </div>
  );
}
