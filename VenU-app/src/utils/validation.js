import { PHILIPPINE_GOVERNMENT_IDS } from './constants.js';

export const isNameValid = (v) => /^[a-zA-ZÀ-ÿ\s'\-.]{2,50}$/.test(v.trim());

export const isContactValid = (v) => /^(\+639\d{9}|09\d{9})$/.test(v.replace(/\s/g, ''));

export const isEmailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export const isAgeNumberValid = (v) => { 
  const n = parseInt(v, 10); 
  return !isNaN(n) && n >= 1 && n <= 120; 
};

export const validatePassword = (pwd = '') => ({
  length: pwd.length >= 8,
  uppercase: /[A-Z]/.test(pwd),
  lowercase: /[a-z]/.test(pwd),
  number: /\d/.test(pwd),
  special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(pwd),
});

export const isIdNumberValid = (idTypeId, value) => {
  if (!idTypeId) return false;
  const config = PHILIPPINE_GOVERNMENT_IDS.find(id => id.id === idTypeId);
  if (!config) return value.trim().length > 4;
  return config.regex.test(value.trim());
};
