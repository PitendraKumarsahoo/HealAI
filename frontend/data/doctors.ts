import { Doctor } from '../types';

export const ODISHA_DISTRICTS = [
  'Khordha', 'Cuttack', 'Puri', 'Ganjam', 'Balasore', 'Mayurbhanj', 'Sundargarh', 
  'Sambalpur', 'Kendrapara', 'Jagatsinghpur', 'Nayagarh', 'Dhenkanal', 'Angul', 
  'Koraput', 'Rayagada', 'Malkangiri', 'Bolangir', 'Bargarh', 'Kalahandi', 
  'Nuapada', 'Kandhamal', 'Jajpur', 'Bhadrak', 'Keonjhar', 'Subarnapur', 
  'Deogarh', 'Jharsuguda', 'Nabarangpur', 'Gajapati'
];

export const SPECIALIZATIONS = [
  'General Physician',
  'Diabetologist',
  'Cardiologist',
  'Nephrologist',
  'Hepatologist',
  'Endocrinologist',
  'Internal Medicine',
  'Pediatrician',
  'Orthopedic Surgeon'
];

export const DOCTOR_TYPES = ['All', 'Private', 'Government'];

const BASE_DOCTORS_DATA: Doctor[] = [
  // --- Khordha (Bhubaneswar focus) ---
  // Government (AIIMS, Capital Hospital, RMRC)
  { id: 'kh-g1', name: 'Dr. Gitanjali Batmanabane', specialization: 'Internal Medicine', contact: '0674-2476789', location: 'AIIMS Bhubaneswar', district: 'Khordha', type: 'Government', hospital: 'AIIMS Bhubaneswar', experience: '30+ Years', rating: 4.9 },
  { id: 'kh-g2', name: 'Dr. Debasish Hota', specialization: 'General Physician', contact: '0674-2391983', location: 'Unit-6, Bhubaneswar', district: 'Khordha', type: 'Government', hospital: 'Capital Hospital', experience: '25+ Years', rating: 4.7 },
  { id: 'kh-g3', name: 'Dr. Binod Patro', specialization: 'Endocrinologist', contact: '0674-2476000', location: 'Sijua, Bhubaneswar', district: 'Khordha', type: 'Government', hospital: 'AIIMS Bhubaneswar', experience: '22+ Years', rating: 4.8 },
  // Private (Apollo, AMRI, Care, SUM)
  { id: 'kh-p1', name: 'Dr. Madhabananda Kar', specialization: 'General Physician', contact: '0674-6661016', location: 'Old Sainik School Road', district: 'Khordha', type: 'Private', hospital: 'Apollo Hospitals', experience: '28+ Years', rating: 4.9 },
  { id: 'kh-p2', name: 'Dr. J.P. Dash', specialization: 'Cardiologist', contact: '0674-6666600', location: 'Khandagiri, Bhubaneswar', district: 'Khordha', type: 'Private', hospital: 'AMRI Hospitals', experience: '35+ Years', rating: 4.9 },
  { id: 'kh-p3', name: 'Dr. S.N. Panda', specialization: 'Diabetologist', contact: '0674-3021900', location: 'Prachi Enclave, Chandrasekharpur', district: 'Khordha', type: 'Private', hospital: 'Care Hospitals', experience: '20+ Years', rating: 4.8 },
  { id: 'kh-p4', name: 'Dr. Kishalaya Datta', specialization: 'Internal Medicine', contact: '0674-2386292', location: 'SUM Hospital, K8 Road', district: 'Khordha', type: 'Private', hospital: 'IMS & SUM Hospital', experience: '18+ Years', rating: 4.7 },

  // --- Cuttack (SCB, Shanti Memorial, Ashwini) ---
  // Government (SCB Medical College)
  { id: 'ct-g1', name: 'Dr. Datteswar Hota', specialization: 'General Physician', contact: '0671-2414354', location: 'Mangalabag, Cuttack', district: 'Cuttack', type: 'Government', hospital: 'SCB Medical College & Hospital', experience: '32+ Years', rating: 4.9 },
  { id: 'ct-g2', name: 'Dr. Sidhartha Das', specialization: 'Diabetologist', contact: '0671-2414147', location: 'SCB Campus, Cuttack', district: 'Cuttack', type: 'Government', hospital: 'SCB Medical College (Dept of Medicine)', experience: '28+ Years', rating: 4.8 },
  { id: 'ct-g3', name: 'Dr. S.C. Singh', specialization: 'Cardiologist', contact: '0671-2414080', location: 'Mangalabag, Cuttack', district: 'Cuttack', type: 'Government', hospital: 'SCB Medical College', experience: '25+ Years', rating: 4.8 },
  // Private (Ashwini, Shanti Memorial)
  { id: 'ct-p1', name: 'Dr. Subrat Jena', specialization: 'Cardiologist', contact: '0671-2363007', location: 'Sector-1, CDA, Cuttack', district: 'Cuttack', type: 'Private', hospital: 'Ashwini Hospital', experience: '24+ Years', rating: 4.9 },
  { id: 'ct-p2', name: 'Dr. Rekha Das', specialization: 'Pediatrician', contact: '0671-2415231', location: 'Thoria Sahi, Cuttack', district: 'Cuttack', type: 'Private', hospital: 'Shanti Memorial Hospital', experience: '20+ Years', rating: 4.7 },

  // --- Ganjam (MKCG Berhampur) ---
  // Government (MKCG)
  { id: 'gj-g1', name: 'Dr. Santosh Kumar Mishra', specialization: 'Internal Medicine', contact: '0680-2292746', location: 'Brahmapur, Ganjam', district: 'Ganjam', type: 'Government', hospital: 'MKCG Medical College & Hospital', experience: '26+ Years', rating: 4.8 },
  { id: 'gj-g2', name: 'Dr. Suchitra Dash', specialization: 'General Physician', contact: '0680-2292706', location: 'Medical Road, Berhampur', district: 'Ganjam', type: 'Government', hospital: 'MKCG Medical College', experience: '22+ Years', rating: 4.7 },
  // Private (Amit Hospital, City Hospital Berhampur)
  { id: 'gj-p1', name: 'Dr. Sunil Kumar Hota', specialization: 'Cardiologist', contact: '0680-2224444', location: 'Berhampur, Ganjam', district: 'Ganjam', type: 'Private', hospital: 'Amit Hospital', experience: '18+ Years', rating: 4.8 },

  // --- Sambalpur (VIMSAR Burla) ---
  // Government (VIMSAR)
  { id: 'sb-g1', name: 'Dr. Lalit Meher', specialization: 'Internal Medicine', contact: '0663-2430768', location: 'Burla, Sambalpur', district: 'Sambalpur', type: 'Government', hospital: 'VIMSAR Medical College', experience: '30+ Years', rating: 4.9 },
  { id: 'sb-g2', name: 'Dr. Braja Mohan Mishra', specialization: 'General Physician', contact: '0663-2430269', location: 'Burla, Sambalpur', district: 'Sambalpur', type: 'Government', hospital: 'VIMSAR Hospital', experience: '25+ Years', rating: 4.8 },
  // Private (Sambalpur Nursing Home)
  { id: 'sb-p1', name: 'Dr. Rajendra Sahoo', specialization: 'Orthopedic Surgeon', contact: '0663-2521101', location: 'Sambalpur Town', district: 'Sambalpur', type: 'Private', hospital: 'Sambalpur Nursing Home', experience: '15+ Years', rating: 4.7 },

  // --- Sundargarh (Rourkela focus) ---
  // Government (RGH Rourkela, IGH)
  { id: 'sd-g1', name: 'Dr. S.S. Pati', specialization: 'General Physician', contact: '0661-2500001', location: 'Sector-19, Rourkela', district: 'Sundargarh', type: 'Government', hospital: 'Ispat General Hospital (IGH)', experience: '28+ Years', rating: 4.8 },
  { id: 'sd-g2', name: 'Dr. R.C. Behera', specialization: 'Internal Medicine', contact: '0661-2401000', location: 'Panposh, Rourkela', district: 'Sundargarh', type: 'Government', hospital: 'Rourkela Government Hospital (RGH)', experience: '24+ Years', rating: 4.7 },
  // Private (JP Hospital, Vesaj Patel)
  { id: 'sd-p1', name: 'Dr. D.K. Mishra', specialization: 'Cardiologist', contact: '0661-2464100', location: 'Dandiapali, Rourkela', district: 'Sundargarh', type: 'Private', hospital: 'JP Hospital & Research Centre', experience: '20+ Years', rating: 4.9 },

  // --- Balasore ---
  { id: 'bl-g1', name: 'Dr. Sudhir Ghosh', specialization: 'General Physician', contact: '06782-262290', location: 'Balasore Town', district: 'Balasore', type: 'Government', hospital: 'District Headquarter Hospital (DHH) Balasore', experience: '22+ Years', rating: 4.7 },
  { id: 'bl-p1', name: 'Dr. S.K. Mohapatra', specialization: 'Diabetologist', contact: '06782-241234', location: 'Balasore', district: 'Balasore', type: 'Private', hospital: 'Balasore Life Line Hospital', experience: '15+ Years', rating: 4.6 },

  // --- Puri ---
  { id: 'pu-g1', name: 'Dr. B.K. Pradhan', specialization: 'Internal Medicine', contact: '06752-222048', location: 'Puri Town', district: 'Puri', type: 'Government', hospital: 'DHH Puri', experience: '25+ Years', rating: 4.7 },

  // --- Mayurbhanj (PRM Medical College) ---
  { id: 'mb-g1', name: 'Dr. K.C. Mohanta', specialization: 'General Physician', contact: '06792-252601', location: 'Baripada', district: 'Mayurbhanj', type: 'Government', hospital: 'PRM Medical College & Hospital', experience: '24+ Years', rating: 4.8 },

  // --- Jajpur ---
  { id: 'jp-g1', name: 'Dr. Ashutosh Nayak', specialization: 'General Physician', contact: '06728-222046', location: 'Jajpur Town', district: 'Jajpur', type: 'Government', hospital: 'DHH Jajpur', experience: '18+ Years', rating: 4.7 },

  // --- Koraput (SLN Medical College) ---
  { id: 'kp-g1', name: 'Dr. Bijay Kumar Dash', specialization: 'Internal Medicine', contact: '06852-250102', location: 'Koraput', district: 'Koraput', type: 'Government', hospital: 'SLN Medical College & Hospital', experience: '26+ Years', rating: 4.8 },

  // --- Bolangir (BB Medical College) ---
  { id: 'bo-g1', name: 'Dr. S.K. Satpathy', specialization: 'General Physician', contact: '06652-232333', location: 'Bolangir', district: 'Bolangir', type: 'Government', hospital: 'BB Medical College & Hospital', experience: '22+ Years', rating: 4.7 },
];

// Generic data for remaining districts to ensure coverage with realistic hospital names
const GENERATED_DOCTORS_DATA: Doctor[] = ['Puri', 'Mayurbhanj', 'Kendrapara', 'Jagatsinghpur', 'Nayagarh', 'Dhenkanal', 'Angul', 'Koraput', 'Rayagada', 'Malkangiri', 'Bargarh', 'Kalahandi', 'Nuapada', 'Kandhamal', 'Subarnapur', 'Deogarh', 'Jharsuguda', 'Nabarangpur', 'Gajapati', 'Bhadrak', 'Keonjhar'].flatMap(district => {
  const existing = BASE_DOCTORS_DATA.filter(d => d.district === district).length;
  if (existing >= 2) return []; // Skip if already populated

  return [
    { 
      id: `g-${district}-1`, 
      name: `Dr. Ramesh ${district} Sahoo`, 
      specialization: 'General Physician', 
      contact: '067XX-XXXXXX', 
      location: `${district} Town`, 
      district: district, 
      type: 'Government' as const, 
      hospital: `District Headquarter Hospital (${district})`, 
      experience: '15+ Years', 
      rating: 4.6 
    },
    { 
      id: `p-${district}-1`, 
      name: `Dr. Priya ${district} Dash`, 
      specialization: 'Diabetologist', 
      contact: '943XXXXXXX', 
      location: `${district} Main Road`, 
      district: district, 
      type: 'Private' as const, 
      hospital: `${district} City Clinic`, 
      experience: '12+ Years', 
      rating: 4.5 
    },
    { 
      id: `g-${district}-2`, 
      name: `Dr. Alok ${district} Mohanty`, 
      specialization: 'Internal Medicine', 
      contact: '067XX-XXXXXX', 
      location: `${district} Medical Square`, 
      district: district, 
      type: 'Government' as const, 
      hospital: `SDH ${district}`, 
      experience: '18+ Years', 
      rating: 4.7 
    }
  ];
});

export const DOCTORS_DATA: Doctor[] = [...BASE_DOCTORS_DATA, ...GENERATED_DOCTORS_DATA];
