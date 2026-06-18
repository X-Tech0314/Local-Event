import React, { useState } from 'react';
import OrganizerRegister from './OrganizerRegister.jsx';
import { PHILIPPINE_GOVERNMENT_IDS } from '../../utils/constants.js';
import { isNameValid, isContactValid, isEmailValid, calculateAge, validatePassword, isIdNumberValid } from '../../utils/validation.js';
import TermsAndPrivacyModal from './TermsAndPrivacyModal.jsx';

import PersonalDetails from './RegisterSteps/PersonalDetails.jsx';
import AddressDetails from './RegisterSteps/AddressDetails.jsx';
import IdVerification from './RegisterSteps/IdVerification.jsx';
import usePsgc from '../../hooks/usePsgc.js';

export default function RegisterForm({ onSubmit, onClose, onToggleMode, createRole, setCreateRole }) {
  // Register Fields
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('None');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Address Fields
  const [houseNo, setHouseNo] = useState('');
  const [streetName, setStreetName] = useState('');
  const [subdivision, setSubdivision] = useState('');
  const [zipCode, setZipCode] = useState('');

  // PSGC cascading location hook
  const {
    regions, provinces, cities, barangays,
    loading: psgcLoading,
    noProvinceRegion,
    psgcSel,
    selectRegion, selectProvince, selectCity, selectBarangay,
    getRegionName, getProvinceName, getCityName, getBarangayName,
  } = usePsgc();

  // ID Verification
  const [idType, setIdType] = useState('');
  const [idFrontFile, setIdFrontFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);
  const [idReferenceNumber, setIdReferenceNumber] = useState('');
  const [dataPrivacyConsent, setDataPrivacyConsent] = useState(false);
  const [tosConsent, setTosConsent] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);

  const roles = ['Organizer', 'Attendee'];

  const calculatedAge = calculateAge(dateOfBirth);

  // ─── Validation Constants ────────────────────────────────────────────────
  const MAX_NAME_LENGTH = 30;
  const MIN_AGE = createRole === 'Organizer' ? 25 : 18;
  const MAX_AGE = 100;

  // Max length checks (middle name only checked when there's input)
  const isFirstNameTooLong = firstName.length > MAX_NAME_LENGTH;
  const isLastNameTooLong = lastName.length > MAX_NAME_LENGTH;
  const isMiddleNameTooLong = middleName.trim().length > 0 && middleName.length > MAX_NAME_LENGTH;
  const isEmailTooLong = createEmail.length > MAX_NAME_LENGTH;

  // Age bounds: lower bound depends on role, upper bound is 100 for both
  const isAgeValid = dateOfBirth && calculatedAge >= MIN_AGE && calculatedAge <= MAX_AGE;

  // ─── Touched / Dirty State ────────────────────────────────────────────────
  const [touched, setTouched] = useState({});
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const validation = validatePassword(createPassword);

  // ─── Wizard Step Guards ───────────────────────────────────────────────────
  const isStep1Valid =
    firstName.trim() && isNameValid(firstName) && !isFirstNameTooLong &&
    lastName.trim() && isNameValid(lastName) && !isLastNameTooLong &&
    !isMiddleNameTooLong &&
    isAgeValid &&
    contactNumber.trim() && isContactValid(contactNumber) &&
    createEmail.trim() && isEmailValid(createEmail) && !isEmailTooLong &&
    createPassword && Object.values(validation).every(Boolean) &&
    confirmPassword && createPassword === confirmPassword;

  const isStep2Valid =
    houseNo.trim() &&
    streetName.trim() &&
    zipCode.trim() &&
    psgcSel.regionCode &&
    (psgcSel.provinceCode || noProvinceRegion) &&
    psgcSel.cityMunCode &&
    psgcSel.barangayCode;

  const idRequiresBack = PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType)?.hasBackSide;
  const isStep3Valid = idType && idFrontFile && (!idRequiresBack || idBackFile) && idReferenceNumber.trim() && isIdNumberValid(idType, idReferenceNumber);
  const isStep4Valid = dataPrivacyConsent && tosConsent;

  const canCreate = isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && canCreate) {
      onSubmit({
        role: 'Attendee',
        personal: { firstName, middleName, lastName, suffix, dateOfBirth, contactNumber, email: createEmail, password: createPassword },
        address: { 
          houseNo, streetName, subdivision, zipCode, 
          region: getRegionName(psgcSel.regionCode), 
          province: getProvinceName(psgcSel.provinceCode), 
          city: getCityName(psgcSel.cityMunCode), 
          barangay: getBarangayName(psgcSel.barangayCode) 
        },
        idVerification: { type: idType, front: idFrontFile, back: idBackFile, referenceNumber: idReferenceNumber },
      });
    }
  };

  if (createRole === 'Organizer') {
    return (
      <OrganizerRegister
        onSubmit={onSubmit}
        onClose={onClose}
        onToggleMode={onToggleMode}
        createRole={createRole}
        setCreateRole={setCreateRole}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-4 lg:mx-8 bg-[#111827] border border-slate-800 rounded-2xl p-8 shadow-xl max-h-[90vh] overflow-y-auto relative transition-all duration-300 text-white scrollbar-thin">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.15em] text-[#A855F7] uppercase">
            Join the community
          </p>
          <h2 className="text-xl font-semibold text-white mt-1">
            Create your account
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

      <form
        className="space-y-5"
        onSubmit={handleFormSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
          }
        }}
      >
        {/* Role Selector */}
        <div className="flex bg-slate-800/60 rounded-full p-1">
          {roles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setCreateRole(r);
                if (r === 'Organizer' && idType.includes('Student ID')) {
                  setIdType('');
                }
              }}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all duration-300 cursor-pointer ${createRole === r
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
                className={`h-1.5 rounded-full transition-all duration-300 ${stepNum === currentStep
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

          {currentStep === 1 && (
            <PersonalDetails
              {...{
                firstName, setFirstName,
                middleName, setMiddleName,
                lastName, setLastName,
                suffix, setSuffix,
                dateOfBirth, setDateOfBirth,
                contactNumber, setContactNumber,
                createEmail, setCreateEmail,
                createPassword, setCreatePassword,
                confirmPassword, setConfirmPassword,
                showPassword, setShowPassword,
                showConfirmPassword, setShowConfirmPassword,
                touched, touch,
                isAgeValid, validation, createRole, calculatedAge,
                // New validation props
                MAX_NAME_LENGTH,
                MIN_AGE, MAX_AGE,
                isFirstNameTooLong,
                isLastNameTooLong,
                isMiddleNameTooLong,
                isEmailTooLong,
              }}
            />
          )}

          {currentStep === 2 && (
            <AddressDetails
              {...{ 
                houseNo, setHouseNo, streetName, setStreetName, subdivision, setSubdivision, zipCode, setZipCode, 
                regions, provinces, cities, barangays,
                psgcLoading, noProvinceRegion, psgcSel,
                selectRegion, selectProvince, selectCity, selectBarangay,
                touched, touch 
              }}
            />
          )}

          {currentStep === 3 && (
            <IdVerification
              {...{ idType, setIdType, idFrontFile, setIdFrontFile, idBackFile, setIdBackFile, idReferenceNumber, setIdReferenceNumber, touched, touch, idRequiresBack }}
            />
          )}

          {/* SECTION 4: Legal Compliance */}
          {currentStep === 4 && (
            <div>
              <h4 className="text-sm font-bold text-white/90 border-b border-white/5 pb-2 mb-4">4. Legal Compliance</h4>
              <div className="pt-2 text-white/70 space-y-4">
                <div>
                  <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-[#A855F7] h-4 w-4 mt-0.5 shrink-0"
                      checked={tosConsent}
                      onChange={(e) => { setTosConsent(e.target.checked); touch('tos'); }}
                    />
                    <span>
                      I agree to the <strong className="text-[#A855F7] hover:underline cursor-pointer" onClick={() => setShowTermsModal(true)}>Terms of Service</strong> and acknowledge my responsibilities as an attendee.
                    </span>
                  </label>
                  {touched.tos && !tosConsent && (
                    <p className="text-[10px] text-red-400 mt-2 font-medium">You must agree to the Terms of Service.</p>
                  )}
                </div>

                <div>
                  <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-[#A855F7] h-4 w-4 mt-0.5 shrink-0"
                      checked={dataPrivacyConsent}
                      onChange={(e) => { setDataPrivacyConsent(e.target.checked); touch('consent'); }}
                    />
                    <span>
                      I agree to the collection and processing of my data in compliance with the{' '}
                      <strong className="text-white/90 hover:underline cursor-pointer" onClick={() => setShowTermsModal(true)}>Philippine Data Privacy Act of 2012 (NPC)</strong>.
                    </span>
                  </label>
                  {touched.consent && !dataPrivacyConsent && (
                    <p className="text-[10px] text-red-400 mt-2 font-medium">You must agree to the data privacy terms.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step Navigation Buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-3 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Back
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1 && isStep1Valid) setCurrentStep(2);
                else if (currentStep === 2 && isStep2Valid) setCurrentStep(3);
                else if (currentStep === 3 && isStep3Valid) setCurrentStep(4);
              }}
              disabled={
                (currentStep === 1 && !isStep1Valid) ||
                (currentStep === 2 && !isStep2Valid) ||
                (currentStep === 3 && !isStep3Valid)
              }
              className={`flex-1 rounded-xl py-3 text-white text-sm font-semibold transition-all duration-300 cursor-pointer ${((currentStep === 1 && isStep1Valid) ||
                  (currentStep === 2 && isStep2Valid) ||
                  (currentStep === 3 && isStep3Valid))
                  ? 'bg-[#A855F7] hover:bg-[#9333EA] shadow-md shadow-purple-500/20 active:scale-[0.99]'
                  : 'bg-purple-500/30 cursor-not-allowed opacity-50 text-white/50'
                }`}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canCreate}
              className={`flex-1 rounded-xl py-3 text-white text-sm font-semibold transition-all duration-300 cursor-pointer ${canCreate
                  ? 'bg-[#A855F7] hover:bg-[#9333EA] shadow-md shadow-purple-500/20 active:scale-[0.99]'
                  : 'bg-purple-500/30 cursor-not-allowed text-white/50'
                }`}
            >
              Create Account
            </button>
          )}
        </div>

        {/* Toggle option */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onToggleMode}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Already have an account? <span className="text-[#A855F7] font-semibold">Sign In</span>
          </button>
        </div>
      </form>
      
      <TermsAndPrivacyModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
}