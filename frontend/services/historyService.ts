import { DiseaseType, PredictionResponse } from '../types';

export interface HistoryItem {
  id: string;
  date: string;
  disease: DiseaseType;
  result: PredictionResponse;
  patientName: string;
}

const STORAGE_KEY = 'healai_history';

export const saveToHistory = (disease: DiseaseType, result: PredictionResponse, patientName: string): HistoryItem => {
  const history = getHistory();
  const newItem: HistoryItem = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    disease,
    result,
    patientName,
  };
  
  const updatedHistory = [newItem, ...history].slice(0, 50); // Keep last 50 items
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  return newItem;
};

export const getHistory = (): HistoryItem[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};
