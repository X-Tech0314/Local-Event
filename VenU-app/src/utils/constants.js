export const philippineAddressData = {
  'NCR': {
    provinces: {
      'Metro Manila': {
        cities: {
          'Quezon City': ['Barangay Socorro', 'Barangay Commonwealth', 'Barangay Batasan Hills'],
          'Manila': ['Barangay 666', 'Barangay 888', 'Barangay 999'],
        }
      }
    }
  },
};

export const suffixes = ['None', 'Jr.', 'Sr.', 'III', 'IV', 'V', 'VI'];

export const PHILIPPINE_GOVERNMENT_IDS = [
  {
    id: "national_id",
    name: "Philippine National ID (PhilID)",
    hasBackSide: true,
    placeholder: "0000-0000-0000-0000",
    regex: /^\d{4}-\d{4}-\d{4}-\d{4}$/,
    description: "The 16-digit PhilSys Card Number (PCN) located on the front side.",
    sampleUrl: "/mockups/sample_national_id.png"
  },
  {
    id: "drivers_license",
    name: "Driver's License",
    hasBackSide: true,
    placeholder: "X00-00-000000",
    regex: /^[A-Z]\d{2}-\d{2}-\d{6}$/,
    description: "9-character alphanumeric format issued by the LTO.",
    sampleUrl: "/mockups/sample_drivers_license.png"
  },
  {
    id: "passport",
    name: "Philippine Passport",
    hasBackSide: false,
    placeholder: "P0000000A",
    regex: /^[A-Z]\d{7}[A-Z]|\b[A-Z]\d{8}\b$/,
    description: "Primary data page alphanumeric sequence issued by the DFA.",
    sampleUrl: "/mockups/sample_passport.png"
  },
  {
    id: "umid",
    name: "Unified Multi-Purpose ID (UMID)",
    hasBackSide: false,
    placeholder: "0000-0000000-0",
    regex: /^\d{4}-\d{7}-\d{1}$/,
    description: "12-digit Common Reference Number (CRN) issued by SSS/GSIS.",
    sampleUrl: "/mockups/sample_umid.png"
  },
  {
    id: "prc_id",
    name: "PRC ID (Professional License)",
    hasBackSide: true,
    placeholder: "0000000",
    regex: /^\d{7}$/,
    description: "7-digit license registration number issued by PRC.",
    sampleUrl: "/mockups/sample_prc_id.png"
  },
  {
    id: "postal_id",
    name: "Digitized Postal ID",
    hasBackSide: true,
    placeholder: "A00000000000",
    regex: /^[A-Z]\d{11}$/,
    description: "12-character alphanumeric format issued by PHLPost.",
    sampleUrl: "/mockups/sample_postal_id.png"
  },
  {
    id: "voters_id",
    name: "Voter's ID / Certification",
    hasBackSide: true,
    placeholder: "0000-0000A-A0000ABC00000",
    regex: /^[a-zA-Z0-9-]{10,25}$/,
    description: "Voter's VIN sequence issued by COMELEC.",
    sampleUrl: "/mockups/sample_voters_id.png"
  },
  {
    id: "tin_card",
    name: "TIN Card",
    hasBackSide: false,
    placeholder: "000-000-000-000",
    regex: /^\d{3}-\d{3}-\d{3}-\d{3}$/,
    description: "Taxpayer Identification Number sequence issued by BIR.",
    sampleUrl: "/mockups/sample_tin_card.png"
  },
  {
    id: "philhealth",
    name: "PhilHealth ID",
    hasBackSide: true,
    placeholder: "00-000000000-0",
    regex: /^\d{2}-\d{9}-\d{1}$/,
    description: "12-digit PhilHealth Identification Number (PIN).",
    sampleUrl: "/mockups/sample_philhealth.png"
  },
  {
    id: "student_id",
    name: "Student ID (School ID)",
    hasBackSide: true,
    placeholder: "Enter Student Number",
    regex: /^[a-zA-Z0-9-]{4,20}$/,
    description: "Institutional verification format issued by schools or universities.",
    sampleUrl: "/mockups/sample_student_id.png"
  },
  {
    id: "senior_citizen",
    name: "Senior Citizen ID",
    hasBackSide: true,
    placeholder: "Enter ID Number",
    regex: /^[a-zA-Z0-9-/]{4,20}$/,
    description: "OSCA registration tracking numbers issued by the LGU.",
    sampleUrl: "/mockups/sample_senior_citizen.png"
  },
  {
    id: "pwd_id",
    name: "PWD ID",
    hasBackSide: true,
    placeholder: "00-0000-000-0000000",
    regex: /^[a-zA-Z0-9-]{5,25}$/,
    description: "Persons with Disability tracking string issued by PDAO/LGU.",
    sampleUrl: "/mockups/sample_pwd_id.png"
  }
];

export const passwordRules = [
  { rule: 'At least 8 characters long', key: 'length' },
  { rule: 'Contains uppercase letter (A-Z)', key: 'uppercase' },
  { rule: 'Contains lowercase letter (a-z)', key: 'lowercase' },
  { rule: 'Contains number (0-9)', key: 'number' },
  { rule: 'Contains special character (!@#$%^&*)', key: 'special' },
];
