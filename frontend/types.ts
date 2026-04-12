
export type DiseaseType = 'diabetes' | 'heart' | 'kidney' | 'liver' | 'stroke' | 'ckd';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'number' | 'select';
  options?: { label: string; value: string | number }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  hidden?: boolean;
  defaultValue?: number | string;
  category?: string;
}

export interface DiseaseInfo {
  id: DiseaseType;
  title: string;
  description: string;
  icon: string;
  fields: FieldConfig[];
}

export interface PredictionResponse {
  riskLevel: 'Low' | 'Moderate' | 'High';
  confidence: number;
  analysis: string;
  suggestions: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  contact: string;
  location: string;
  district: string;
  type: 'Private' | 'Government';
  hospital?: string;
  experience?: string;
  rating?: number;
}
