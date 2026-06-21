import React from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { suffixes, passwordRules } from '../../../utils/constants.js';
import { isNameValid, isContactValid, isEmailValid } from '../../../utils/validation.js';

export default function PersonalDetails({
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
  isAgeValid,
  validation,
  createRole,
  calculatedAge,
  // New validation props
  MAX_NAME_LENGTH,
  MIN_AGE,
  MAX_AGE,
  isFirstNameTooLong,
  isLastNameTooLong,
  isMiddleNameTooLong,
  isEmailTooLong,
  // Real-time check props
  isCheckingEmail,
  emailExists,
  isCheckingContact,
  contactExists,
  passwordStrength
}) {
  // Derive which age error (if any) should be shown
  const isAgeNaN = isNaN(calculatedAge);
  const isAgeNegative = !isAgeNaN && calculatedAge < 0;
  const isAgeTooYoung = !isAgeNaN && calculatedAge >= 0 && calculatedAge < MIN_AGE;
  const isAgeTooOld = !isAgeNaN && calculatedAge > MAX_AGE;

  // Custom Contact Validation: Must be 10 digits starting with 9
  const isContactValidFormat = (num) => /^9\d{9}$/.test(num);

  return (
    <div>
      <h4 className="text-sm font-bold text-white/90 border-b border-white/5 pb-2 mb-4">1. Personal Details</h4>
      <div className="space-y-4 text-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => touch('firstName')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${(touched.firstName && (!firstName.trim() || !isNameValid(firstName))) || isFirstNameTooLong
                ? 'border-red-500/60 focus:border-red-400'
                : 'border-white/10 focus:border-[#A855F7]/50'
                }`}
              placeholder="Juan"
            />
            {touched.firstName && !firstName.trim() && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">First name is required.</p>
            )}
            {touched.firstName && firstName.trim() && !isNameValid(firstName) && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Only letters, spaces, hyphens, or apostrophes (min 2 characters).</p>
            )}
            {isFirstNameTooLong && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">
                First Name must be at most {MAX_NAME_LENGTH} characters (currently {firstName.length}).
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Middle Name (Optional)</label>
            <input
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              onBlur={() => touch('middleName')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${(touched.middleName && middleName.trim() && !isNameValid(middleName)) || isMiddleNameTooLong
                ? 'border-red-500/60 focus:border-red-400'
                : 'border-white/10 focus:border-[#A855F7]/50'
                }`}
              placeholder="Santos"
            />
            {touched.middleName && middleName.trim() && !isNameValid(middleName) && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Only letters, spaces, hyphens, or apostrophes.</p>
            )}
            {isMiddleNameTooLong && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">
                Middle Name must be at most {MAX_NAME_LENGTH} characters (currently {middleName.length}).
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => touch('lastName')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${(touched.lastName && (!lastName.trim() || !isNameValid(lastName))) || isLastNameTooLong
                ? 'border-red-500/60 focus:border-red-400'
                : 'border-white/10 focus:border-[#A855F7]/50'
                }`}
              placeholder="dela Cruz"
            />
            {touched.lastName && !lastName.trim() && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Last name is required.</p>
            )}
            {touched.lastName && lastName.trim() && !isNameValid(lastName) && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Only letters, spaces, hyphens, or apostrophes (min 2 characters).</p>
            )}
            {isLastNameTooLong && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">
                Last Name must be at most {MAX_NAME_LENGTH} characters (currently {lastName.length}).
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Suffix</label>
            <select
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-white text-sm outline-none focus:border-[#A855F7]/50 transition-colors [&>option]:bg-slate-950 [&>option]:text-white"
            >
              {suffixes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              onBlur={() => touch('dateOfBirth')}
              className={`w-full rounded-lg border px-3 py-2 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${touched.dateOfBirth && (!dateOfBirth || !isAgeValid)
                ? 'border-red-500/60 focus:border-red-400'
                : 'border-white/10 focus:border-[#A855F7]/50'
                }`}
            />
            {touched.dateOfBirth && !dateOfBirth && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Date of Birth is required.</p>
            )}
            {touched.dateOfBirth && dateOfBirth && isAgeNaN && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">
                Please enter a valid date of birth.
              </p>
            )}
            {touched.dateOfBirth && dateOfBirth && isAgeNegative && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">
                Date of Birth cannot be in the future. (Current calculated age: {calculatedAge})
              </p>
            )}
            {touched.dateOfBirth && dateOfBirth && isAgeTooYoung && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">
                {createRole === 'Organizer'
                  ? `Organizers must be at least ${MIN_AGE} years old.`
                  : `Attendees must be at least ${MIN_AGE} years old.`} (Current calculated age: {calculatedAge})
              </p>
            )}
            {touched.dateOfBirth && dateOfBirth && isAgeTooOld && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">
                Age must not exceed {MAX_AGE} years old. (Current calculated age: {calculatedAge})
              </p>
            )}
          </div>

          {/* NEW CONTACT NUMBER INPUT WITH +63 PREFIX */}
          <div className="min-w-0">
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Contact Number</label>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-2 rounded-lg border border-white/10 bg-slate-800/80 text-white/70 text-sm font-medium shrink-0">
                +63
              </span>
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))} // Strip non-digits
                  onBlur={() => touch('contactNumber')}
                  maxLength={10}
                  className={`w-full rounded-lg border px-3 py-2 pr-10 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${touched.contactNumber && (!contactNumber.trim() || !isContactValidFormat(contactNumber)) || contactExists
                    ? 'border-red-500/60 focus:border-red-400'
                    : 'border-white/10 focus:border-[#A855F7]/50'
                    }`}
                  placeholder="9171234567"
                />
                {isCheckingContact && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 size={16} className="animate-spin text-[#A855F7]" />
                  </div>
                )}
              </div>
            </div>
            {touched.contactNumber && !contactNumber.trim() && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Contact number is required.</p>
            )}
            {touched.contactNumber && contactNumber.trim() && !isContactValidFormat(contactNumber) && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Must be exactly 10 digits starting with 9.</p>
            )}
            {contactExists && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">This contact number is already registered.</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1.5">Email Address</label>
          <div className="relative">
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              onBlur={() => touch('createEmail')}
              className={`w-full rounded-lg border px-3 py-2 pr-10 text-white text-sm outline-none transition-colors placeholder:text-white/25 bg-slate-950/80 ${(touched.createEmail && (!createEmail.trim() || !isEmailValid(createEmail))) || isEmailTooLong || emailExists
                ? 'border-red-500/60 focus:border-red-400'
                : 'border-white/10 focus:border-[#A855F7]/50'
                }`}
              placeholder="juan.delacruz@example.ph"
            />
            {isCheckingEmail && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 size={16} className="animate-spin text-[#A855F7]" />
              </div>
            )}
          </div>
          {touched.createEmail && !createEmail.trim() && (
            <p className="text-[10px] text-red-400 mt-1 font-medium">Email address is required.</p>
          )}
          {touched.createEmail && createEmail.trim() && !isEmailValid(createEmail) && (
            <p className="text-[10px] text-red-400 mt-1 font-medium">Enter a valid email address (e.g. juan@example.ph).</p>
          )}
          {isEmailTooLong && (
            <p className="text-[10px] text-red-400 mt-1 font-medium">
              Email must be at most {MAX_NAME_LENGTH} characters (currently {createEmail.length}).
            </p>
          )}
          {emailExists && (
            <p className="text-[10px] text-red-400 mt-1 font-medium">This email is already registered.</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Password</label>
            <div className={`flex items-center rounded-lg border px-3 py-2 bg-slate-950/80 ${touched.createPassword && (!createPassword || !Object.values(validation).every(Boolean))
              ? 'border-red-500/60'
              : 'border-white/10 focus-within:border-[#A855F7]/50'
              }`}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                onBlur={() => touch('createPassword')}
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/25"
                placeholder="Create password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {touched.createPassword && !createPassword && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Password is required.</p>
            )}

            {/* Password Strength Meter */}
            {createPassword.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-bold ${passwordStrength.text}`}>{passwordStrength.label}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${passwordStrength.color} ${passwordStrength.width} transition-all duration-300`}></div>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Confirm Password</label>
            <div className={`flex items-center rounded-lg border px-3 py-2 bg-slate-950/80 ${touched.confirmPassword && (!confirmPassword || createPassword !== confirmPassword)
              ? 'border-red-500/60'
              : 'border-white/10 focus-within:border-[#A855F7]/50'
              }`}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => touch('confirmPassword')}
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/25"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="ml-2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {touched.confirmPassword && !confirmPassword && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Please confirm your password.</p>
            )}
            {touched.confirmPassword && confirmPassword && createPassword !== confirmPassword && (
              <p className="text-[10px] text-red-400 mt-1 font-medium">Passwords do not match.</p>
            )}
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
                  className={`h-1.5 w-1.5 rounded-full shrink-0 transition-colors duration-300 ${validation[pr.key] ? 'bg-green-400' : 'bg-white/10'
                    }`}
                />
                <span
                  className={`transition-colors duration-300 ${validation[pr.key] ? 'text-green-400 font-medium' : 'text-white/30'
                    }`}
                >
                  {pr.rule}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}