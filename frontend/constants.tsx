
import { DiseaseInfo } from './types';

export const DISEASES: DiseaseInfo[] = [
  {
    id: 'diabetes',
    title: 'Diabetes',
    description: 'Analysis of blood sugar, BMI, and family history to predict glycemic risk.',
    icon: '🩸',
    fields: [
      { name: 'pregnancies', label: 'Pregnancies', type: 'number', min: 0, max: 20, step: 1, description: 'Number of times pregnant', category: 'History' },
      { name: 'glucose', label: 'Glucose', type: 'number', min: 0, max: 300, step: 1, description: 'Plasma glucose concentration (mg/dL)', category: 'Clinical Metrics' },
      { name: 'bloodPressure', label: 'Blood Pressure', type: 'number', min: 0, max: 150, step: 1, description: 'Diastolic blood pressure (mm Hg)', category: 'Clinical Metrics' },
      { name: 'skinThickness', label: 'Skin Thickness', type: 'number', min: 0, max: 100, step: 1, description: 'Triceps skin fold thickness (mm)', category: 'Clinical Metrics' },
      { name: 'insulin', label: 'Insulin', type: 'number', min: 0, max: 900, step: 1, description: '2-Hour serum insulin (mu U/ml)', category: 'Clinical Metrics' },
      { name: 'bmi', label: 'BMI', type: 'number', min: 0, max: 70, step: 0.1, description: 'Body mass index (weight in kg/(height in m)^2)', category: 'Clinical Metrics' },
      { name: 'dpf', label: 'Pedigree Function', type: 'number', min: 0, max: 3, step: 0.001, description: 'Diabetes pedigree function', category: 'History' },
      { name: 'age', label: 'Age', type: 'number', min: 0, max: 120, step: 1, description: 'Age in years', category: 'Personal Info' },
    ]
  },
  {
    id: 'heart',
    title: 'Heart Disease',
    description: 'Multi-parameter cardiac health screening focusing on cardiovascular efficiency.',
    icon: '❤️',
    fields: [
      { name: 'age', label: 'Age', type: 'number', min: 0, max: 120, step: 1, category: 'Personal Info' },
      { name: 'sex', label: 'Sex', type: 'select', options: [{ label: 'Male', value: 1 }, { label: 'Female', value: 0 }], category: 'Personal Info' },
      { name: 'cp', label: 'Chest Pain Type', type: 'select', options: [
          { label: 'Typical Angina', value: 0 },
          { label: 'Atypical Angina', value: 1 },
          { label: 'Non-anginal Pain', value: 2 },
          { label: 'Asymptomatic', value: 3 }
      ], category: 'Clinical Signs' },
      { name: 'trestbps', label: 'Resting Blood Pressure', type: 'number', min: 80, max: 200, description: 'mm Hg', category: 'Clinical Signs' },
      { name: 'chol', label: 'Cholesterol', type: 'number', min: 100, max: 600, description: 'mg/dl', category: 'Clinical Signs' },
      { name: 'fbs', label: 'Fasting Blood Sugar > 120 mg/dl', type: 'select', options: [{ label: 'True', value: 1 }, { label: 'False', value: 0 }], category: 'Clinical Signs' },
      { name: 'restecg', label: 'Resting ECG', type: 'select', options: [
        { label: 'Normal', value: 0 },
        { label: 'ST-T Wave Abnormality', value: 1 },
        { label: 'Left Ventricular Hypertrophy', value: 2 }
      ], category: 'Test Results' },
      { name: 'thalach', label: 'Max Heart Rate', type: 'number', min: 60, max: 220, category: 'Test Results' },
      { name: 'exang', label: 'Exercise Induced Angina', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'Test Results' },
      { name: 'oldpeak', label: 'ST Depression', type: 'number', min: 0, max: 10, step: 0.1, description: 'Induced by exercise relative to rest', category: 'Advanced Cardiac' },
      { name: 'slope', label: 'Slope of Peak Exercise ST', type: 'select', options: [
        { label: 'Upsloping', value: 1 },
        { label: 'Flat', value: 2 },
        { label: 'Downsloping', value: 3 }
      ], category: 'Advanced Cardiac' },
      { name: 'ca', label: 'Major Vessels (Fluoroscopy)', type: 'select', options: [
        { label: '0', value: 0 },
        { label: '1', value: 1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 }
      ], category: 'Advanced Cardiac' },
      { name: 'thal', label: 'Thallium Stress Test', type: 'select', options: [
        { label: 'Normal', value: 3 },
        { label: 'Fixed Defect', value: 6 },
        { label: 'Reversable Defect', value: 7 }
      ], category: 'Advanced Cardiac' }
    ]
  },
  {
    id: 'kidney',
    title: 'Kidney Disease',
    description: 'Renal function assessment analyzing electrolyte balance and blood chemistry.',
    icon: '🧬',
    fields: [
      { name: 'id', label: 'ID', type: 'number', hidden: true, defaultValue: 0, category: 'Personal Info' },
      { name: 'age', label: 'Age', type: 'number', min: 0, max: 120, category: 'Personal Info' },
      { name: 'bp', label: 'Blood Pressure', type: 'number', min: 50, max: 180, category: 'Vitals' },
      { name: 'sg', label: 'Specific Gravity', type: 'number', min: 1.005, max: 1.025, step: 0.005, category: 'Urine Analysis' },
      { name: 'al', label: 'Albumin', type: 'number', min: 0, max: 5, category: 'Urine Analysis' },
      { name: 'su', label: 'Sugar', type: 'number', min: 0, max: 5, category: 'Urine Analysis' },
      { name: 'rbc', label: 'Red Blood Cells', type: 'select', options: [{ label: 'Normal', value: 1 }, { label: 'Abnormal', value: 0 }], category: 'Urine Analysis' },
      { name: 'pc', label: 'Pus Cell', type: 'select', options: [{ label: 'Normal', value: 1 }, { label: 'Abnormal', value: 0 }], category: 'Urine Analysis' },
      { name: 'pcc', label: 'Pus Cell Clumps', type: 'select', options: [{ label: 'Present', value: 1 }, { label: 'Not Present', value: 0 }], category: 'Urine Analysis' },
      { name: 'ba', label: 'Bacteria', type: 'select', options: [{ label: 'Present', value: 1 }, { label: 'Not Present', value: 0 }], category: 'Urine Analysis' },
      { name: 'bgr', label: 'Blood Glucose Random', type: 'number', min: 0, max: 500, category: 'Blood Chemistry' },
      { name: 'bu', label: 'Blood Urea', type: 'number', min: 0, max: 200, category: 'Blood Chemistry' },
      { name: 'sc', label: 'Serum Creatinine', type: 'number', min: 0.1, max: 20, step: 0.1, category: 'Blood Chemistry' },
      { name: 'sod', label: 'Sodium', type: 'number', min: 100, max: 200, category: 'Blood Chemistry' },
      { name: 'pot', label: 'Potassium', type: 'number', min: 1, max: 10, step: 0.1, category: 'Blood Chemistry' },
      { name: 'hemo', label: 'Hemoglobin', type: 'number', min: 3, max: 20, step: 0.1, category: 'Hematology' },
      { name: 'pcv', label: 'Packed Cell Volume', type: 'number', min: 10, max: 60, category: 'Hematology' },
      { name: 'wc', label: 'White Blood Cell Count', type: 'number', min: 2000, max: 20000, category: 'Hematology' },
      { name: 'rc', label: 'Red Blood Cell Count', type: 'number', min: 2, max: 8, step: 0.1, category: 'Hematology' },
      { name: 'htn', label: 'Hypertension', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'Medical History' },
      { name: 'dm', label: 'Diabetes Mellitus', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'Medical History' },
      { name: 'cad', label: 'Coronary Artery Disease', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'Medical History' },
      { name: 'appet', label: 'Appetite', type: 'select', options: [{ label: 'Good', value: 0 }, { label: 'Poor', value: 1 }], category: 'General Health' },
      { name: 'pe', label: 'Pedal Edema', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'General Health' },
      { name: 'ane', label: 'Anemia', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'General Health' },
    ]
  },
  {
    id: 'liver',
    title: 'Liver Disease',
    description: 'Hepatological health check using bilirubin levels and enzyme concentrations.',
    icon: '🧪',
    fields: [
      { name: 'age', label: 'Age', type: 'number', min: 0, max: 120, category: 'Personal Info' },
      { name: 'gender', label: 'Gender', type: 'select', options: [{ label: 'Male', value: 1 }, { label: 'Female', value: 0 }], category: 'Personal Info' },
      { name: 'total_bilirubin', label: 'Total Bilirubin', type: 'number', min: 0.1, max: 10, step: 0.1, category: 'Bilirubin Profile' },
      { name: 'direct_bilirubin', label: 'Direct Bilirubin', type: 'number', min: 0.1, max: 10, step: 0.1, category: 'Bilirubin Profile' },
      { name: 'alkaline_phosphotase', label: 'Alkaline Phosphotase', type: 'number', min: 10, max: 3000, category: 'Enzymes' },
      { name: 'alamine_aminotransferase', label: 'Alamine Aminotransferase', type: 'number', min: 10, max: 2000, category: 'Enzymes' },
      { name: 'aspartate_aminotransferase', label: 'Aspartate Aminotransferase', type: 'number', min: 10, max: 5000, category: 'Enzymes' },
      { name: 'total_protiens', label: 'Total Protiens', type: 'number', min: 1, max: 10, step: 0.1, category: 'Proteins' },
      { name: 'albumin', label: 'Albumin', type: 'number', min: 1, max: 6, step: 0.1, category: 'Proteins' },
      { name: 'ag_ratio', label: 'Albumin/Globulin Ratio', type: 'number', min: 0.1, max: 3, step: 0.1, category: 'Proteins' },
    ]
  },
  {
    id: 'stroke',
    title: 'Stroke Prediction',
    description: 'Neurological risk assessment based on lifestyle factors and clinical indicators.',
    icon: '🧠',
    fields: [
      { name: 'gender', label: 'Gender', type: 'select', options: [{ label: 'Male', value: 1 }, { label: 'Female', value: 0 }, { label: 'Other', value: 2 }], category: 'Personal Info' },
      { name: 'age', label: 'Age', type: 'number', min: 0, max: 120, category: 'Personal Info' },
      { name: 'hypertension', label: 'Hypertension', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'Medical History' },
      { name: 'heart_disease', label: 'Heart Disease', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'Medical History' },
      { name: 'ever_married', label: 'Ever Married', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'Personal Info' },
      { name: 'work_type', label: 'Work Type', type: 'select', options: [
        { label: 'Private', value: 0 },
        { label: 'Self-employed', value: 1 },
        { label: 'Govt_job', value: 2 },
        { label: 'Children', value: 3 },
        { label: 'Never_worked', value: 4 }
      ], category: 'Personal Info' },
      { name: 'residence_type', label: 'Residence Type', type: 'select', options: [{ label: 'Urban', value: 1 }, { label: 'Rural', value: 0 }], category: 'Personal Info' },
      { name: 'avg_glucose_level', label: 'Avg Glucose Level', type: 'number', min: 50, max: 300, step: 0.1, category: 'Clinical Metrics' },
      { name: 'bmi', label: 'BMI', type: 'number', min: 10, max: 60, step: 0.1, category: 'Clinical Metrics' },
      { name: 'smoking_status', label: 'Smoking Status', type: 'select', options: [
        { label: 'formerly smoked', value: 0 },
        { label: 'never smoked', value: 1 },
        { label: 'smokes', value: 2 },
        { label: 'Unknown', value: 3 }
      ], category: 'Personal Info' },
    ]
  },
  {
    id: 'ckd',
    title: 'CKD Analysis',
    description: 'Advanced Chronic Kidney Disease screening with comprehensive renal parameters.',
    icon: '🧪',
    fields: [
      { name: 'age', label: 'Age', type: 'number', min: 0, max: 120, category: 'Personal Info' },
      { name: 'bp', label: 'Blood Pressure', type: 'number', min: 50, max: 180, category: 'Vitals' },
      { name: 'sg', label: 'Specific Gravity', type: 'number', min: 1.005, max: 1.025, step: 0.005, category: 'Urine Analysis' },
      { name: 'al', label: 'Albumin', type: 'number', min: 0, max: 5, category: 'Urine Analysis' },
      { name: 'su', label: 'Sugar', type: 'number', min: 0, max: 5, category: 'Urine Analysis' },
      { name: 'rbc', label: 'Red Blood Cells', type: 'select', options: [{ label: 'Normal', value: 1 }, { label: 'Abnormal', value: 0 }], category: 'Urine Analysis' },
      { name: 'pc', label: 'Pus Cell', type: 'select', options: [{ label: 'Normal', value: 1 }, { label: 'Abnormal', value: 0 }], category: 'Urine Analysis' },
      { name: 'pcc', label: 'Pus Cell Clumps', type: 'select', options: [{ label: 'Present', value: 1 }, { label: 'Not Present', value: 0 }], category: 'Urine Analysis' },
      { name: 'ba', label: 'Bacteria', type: 'select', options: [{ label: 'Present', value: 1 }, { label: 'Not Present', value: 0 }], category: 'Urine Analysis' },
      { name: 'bgr', label: 'Blood Glucose Random', type: 'number', min: 0, max: 500, category: 'Blood Chemistry' },
      { name: 'bu', label: 'Blood Urea', type: 'number', min: 0, max: 200, category: 'Blood Chemistry' },
      { name: 'sc', label: 'Serum Creatinine', type: 'number', min: 0.1, max: 20, step: 0.1, category: 'Blood Chemistry' },
      { name: 'sod', label: 'Sodium', type: 'number', min: 100, max: 200, category: 'Blood Chemistry' },
      { name: 'pot', label: 'Potassium', type: 'number', min: 1, max: 10, step: 0.1, category: 'Blood Chemistry' },
      { name: 'hemo', label: 'Hemoglobin', type: 'number', min: 3, max: 20, step: 0.1, category: 'Hematology' },
      { name: 'pcv', label: 'Packed Cell Volume', type: 'number', min: 10, max: 60, category: 'Hematology' },
      { name: 'wc', label: 'White Blood Cell Count', type: 'number', min: 2000, max: 20000, category: 'Hematology' },
      { name: 'rc', label: 'Red Blood Cell Count', type: 'number', min: 2, max: 8, step: 0.1, category: 'Hematology' },
      { name: 'htn', label: 'Hypertension', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'Medical History' },
      { name: 'dm', label: 'Diabetes Mellitus', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'Medical History' },
      { name: 'cad', label: 'Coronary Artery Disease', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'Medical History' },
      { name: 'appet', label: 'Appetite', type: 'select', options: [{ label: 'Good', value: 0 }, { label: 'Poor', value: 1 }], category: 'General Health' },
      { name: 'pe', label: 'Pedal Edema', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'General Health' },
      { name: 'ane', label: 'Anemia', type: 'select', options: [{ label: 'Yes', value: 1 }, { label: 'No', value: 0 }], category: 'General Health' },
    ]
  }
];
