import React, { useState } from 'react';
import OrganizerRegister from './OrganizerRegister.jsx';
import { PHILIPPINE_GOVERNMENT_IDS } from '../../utils/constants.js';
import { isNameValid, isContactValid, isEmailValid, isAgeNumberValid, validatePassword, isIdNumberValid } from '../../utils/validation.js';

import PersonalDetails from './RegisterSteps/PersonalDetails.jsx';
import AddressDetails from './RegisterSteps/AddressDetails.jsx';
import IdVerification from './RegisterSteps/IdVerification.jsx';

export default function RegisterForm({ onSubmit, onClose, onToggleMode, createRole, setCreateRole }) {
  // Register Fields
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('None');
  const [age, setAge] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Address Fields
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [subdivision, setSubdivision] = useState('');
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');

  // ID Verification
  const [idType, setIdType] = useState('');
  const [idFrontFile, setIdFrontFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);
  const [idReferenceNumber, setIdReferenceNumber] = useState('');
  const [dataPrivacyConsent, setDataPrivacyConsent] = useState(false);

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);

  const roles = ['Organizer', 'Attendee'];

  // ─── Field-level Validators ───────────────────────────────────────────────
  const parsedAge = parseInt(age, 10);
  const isAgeValid = age && isAgeNumberValid(age) && (createRole === 'Organizer' ? parsedAge >= 25 : parsedAge >= 18);

  // ─── Touched / Dirty State ────────────────────────────────────────────────
  const [touched, setTouched] = useState({});
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const validation = validatePassword(createPassword);

  // ─── Wizard Step Guards ───────────────────────────────────────────────────
  const isStep1Valid =
    firstName.trim() && isNameValid(firstName) &&
    lastName.trim() && isNameValid(lastName) &&
    isAgeValid &&
    contactNumber.trim() && isContactValid(contactNumber) &&
    createEmail.trim() && isEmailValid(createEmail) &&
    createPassword && Object.values(validation).every(Boolean) &&
    confirmPassword && createPassword === confirmPassword;

  const isStep2Valid =
    houseNo.trim() &&
    street.trim() &&
    region &&
    province &&
    city &&
    barangay;

  const idRequiresBack = PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idType)?.hasBackSide;
  const isStep3Valid = idType && idFrontFile && (!idRequiresBack || idBackFile) && idReferenceNumber.trim() && isIdNumberValid(idType, idReferenceNumber);
  const isStep4Valid = dataPrivacyConsent;

  const canCreate = isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit && canCreate) {
      onSubmit({
        role: createRole,
        firstName,
        middleName,
        lastName,
        suffix,
        age,
        contactNumber,
        email: createEmail,
        password: createPassword,
        address: { houseNo, street, subdivision, region, province, city, barangay },
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

      <form className="space-y-5" onSubmit={handleFormSubmit}>
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
          
          {currentStep === 1 && (
            <PersonalDetails
              {...{ firstName, setFirstName, middleName, setMiddleName, lastName, setLastName, suffix, setSuffix, age, setAge, contactNumber, setContactNumber, createEmail, setCreateEmail, createPassword, setCreatePassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, touched, touch, isAgeValid, validation, createRole }}
            />
          )}

          {currentStep === 2 && (
            <AddressDetails
              {...{ houseNo, setHouseNo, street, setStreet, subdivision, setSubdivision, region, setRegion, province, setProvince, city, setCity, barangay, setBarangay, touched, touch }}
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
              <div className="pt-2 text-white/70">
                <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="accent-[#A855F7] h-4 w-4 mt-0.5 shrink-0"
                    checked={dataPrivacyConsent}
                    onChange={(e) => { setDataPrivacyConsent(e.target.checked); touch('consent'); }}
                  />
                  <span>
                    I agree to the collection and processing of my data in compliance with the{' '}
                    <strong className="text-white/90">Philippine Data Privacy Act of 2012 (NPC)</strong>.
                  </span>
                </label>
                {touched.consent && !dataPrivacyConsent && (
                  <p className="text-[10px] text-red-400 mt-2 font-medium">You must agree to the data privacy terms.</p>
                )}
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
              className={`flex-1 rounded-xl py-3 text-white text-sm font-semibold transition-all duration-300 cursor-pointer ${
                ((currentStep === 1 && isStep1Valid) ||
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
              className={`flex-1 rounded-xl py-3 text-white text-sm font-semibold transition-all duration-300 cursor-pointer ${
                canCreate
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
    </div>
  );
}
