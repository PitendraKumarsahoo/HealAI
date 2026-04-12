
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { getPublicPrediction } from '../services/localService';
import { PredictionResponse } from '../types';

interface HealthFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPredictionComplete: (results: string) => void;
}

const HealthFormModal: React.FC<HealthFormModalProps> = ({ isOpen, onClose, onPredictionComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [predictionResults, setPredictionResults] = useState<{ diabetes: PredictionResponse; heart: PredictionResponse } | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    heightCm: '',
    weightKg: '',
    bmi: '',
    systolic: '',
    diastolic: '',
    heartRate: '',
    respiratoryRate: '',
    temperature: '',
    spo2: '',
    bloodSugarType: 'fasting',
    bloodSugar: '',
    cholesterol: '',
    activityLevel: 'medium',
    smoking: 'no',
    alcohol: 'no',
    breathingIssue: 'no',
    wellBeing: 'good',
    symptoms: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const numericValue = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  };

  const ageValue = numericValue(formData.age);

  const ageGroup = useMemo(() => {
    if (ageValue === undefined) return 'unknown';
    if (ageValue <= 17) return 'child';
    if (ageValue <= 40) return 'adult';
    if (ageValue <= 60) return 'middle';
    return 'senior';
  }, [ageValue]);

  useEffect(() => {
    const height = numericValue(formData.heightCm);
    const weight = numericValue(formData.weightKg);
    if (!height || !weight) return;
    const bmi = weight / Math.pow(height / 100, 2);
    const formatted = bmi ? bmi.toFixed(1) : '';
    if (formatted && formatted !== formData.bmi) {
      setFormData(prev => ({ ...prev, bmi: formatted }));
    }
  }, [formData.heightCm, formData.weightKg]);

  const ranges = useMemo(() => {
    const heartRate = ageGroup === 'child' ? { min: 70, max: 100, unit: 'bpm' } : { min: 60, max: 100, unit: 'bpm' };
    const bmi = ageGroup === 'child' ? { min: 14.0, max: 24.0, unit: '' } : { min: 18.5, max: 24.9, unit: '' };
    const systolic = ageGroup === 'child' ? { min: 90, max: 115, unit: 'mm Hg' } : ageGroup === 'middle' ? { min: 90, max: 130, unit: 'mm Hg' } : ageGroup === 'senior' ? { min: 90, max: 140, unit: 'mm Hg' } : { min: 90, max: 120, unit: 'mm Hg' };
    const diastolic = ageGroup === 'child' ? { min: 55, max: 75, unit: 'mm Hg' } : ageGroup === 'middle' ? { min: 60, max: 85, unit: 'mm Hg' } : ageGroup === 'senior' ? { min: 60, max: 90, unit: 'mm Hg' } : { min: 60, max: 80, unit: 'mm Hg' };
    return {
      systolic,
      diastolic,
      heartRate,
      respiratoryRate: { min: 12, max: 18, unit: 'breaths/min' },
      temperature: { min: 36.5, max: 37.3, unit: '°C' },
      spo2: { min: 95, max: 100, unit: '%' },
      fastingGlucose: { min: 70, max: 99, unit: 'mg/dL' },
      randomGlucose: { min: 70, max: 140, unit: 'mg/dL' },
      bmi
    };
  }, [ageGroup]);

  const getStatus = (value: number | undefined, min: number, max: number) => {
    if (value === undefined) return 'unknown';
    if (value < min) return 'low';
    if (value > max) return 'high';
    return 'normal';
  };

  const statusColor = (status: string) => {
    if (status === 'normal') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300';
    if (status === 'high') return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300';
    if (status === 'low') return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300';
  };

  const metricStatuses = useMemo(() => {
    const values = {
      systolic: numericValue(formData.systolic),
      diastolic: numericValue(formData.diastolic),
      heartRate: numericValue(formData.heartRate),
      respiratoryRate: numericValue(formData.respiratoryRate),
      temperature: numericValue(formData.temperature),
      spo2: numericValue(formData.spo2),
      bloodSugar: numericValue(formData.bloodSugar),
      bmi: numericValue(formData.bmi)
    };
    const sugarRange = formData.bloodSugarType === 'random' ? ranges.randomGlucose : ranges.fastingGlucose;
    return {
      systolic: getStatus(values.systolic, ranges.systolic.min, ranges.systolic.max),
      diastolic: getStatus(values.diastolic, ranges.diastolic.min, ranges.diastolic.max),
      heartRate: getStatus(values.heartRate, ranges.heartRate.min, ranges.heartRate.max),
      respiratoryRate: getStatus(values.respiratoryRate, ranges.respiratoryRate.min, ranges.respiratoryRate.max),
      temperature: getStatus(values.temperature, ranges.temperature.min, ranges.temperature.max),
      spo2: getStatus(values.spo2, ranges.spo2.min, ranges.spo2.max),
      bloodSugar: getStatus(values.bloodSugar, sugarRange.min, sugarRange.max),
      bmi: getStatus(values.bmi, ranges.bmi.min, ranges.bmi.max)
    };
  }, [formData, ranges]);

  const wellnessScore = useMemo(() => {
    const statuses = Object.values(metricStatuses);
    const usable = statuses.filter(s => s !== 'unknown');
    if (usable.length === 0) return 0;
    const normalCount = usable.filter(s => s === 'normal').length;
    let score = Math.round((normalCount / usable.length) * 100);
    if (formData.activityLevel === 'low') score -= 5;
    if (formData.activityLevel === 'medium') score -= 2;
    if (formData.smoking === 'yes') score -= 10;
    if (formData.alcohol === 'yes') score -= 5;
    return Math.max(0, score);
  }, [metricStatuses, formData.activityLevel, formData.smoking, formData.alcohol]);

  const alerts = useMemo(() => {
    const list: string[] = [];
    const add = (condition: boolean, text: string) => {
      if (condition) list.push(text);
    };
    add(metricStatuses.systolic === 'high' || metricStatuses.systolic === 'low', 'Systolic blood pressure is outside the normal range.');
    add(metricStatuses.diastolic === 'high' || metricStatuses.diastolic === 'low', 'Diastolic blood pressure is outside the normal range.');
    add(metricStatuses.heartRate === 'high' || metricStatuses.heartRate === 'low', 'Heart rate is outside the normal range.');
    add(metricStatuses.respiratoryRate === 'high' || metricStatuses.respiratoryRate === 'low', 'Respiratory rate is outside the normal range.');
    add(metricStatuses.temperature === 'high' || metricStatuses.temperature === 'low', 'Body temperature is outside the normal range.');
    add(metricStatuses.spo2 === 'high' || metricStatuses.spo2 === 'low', 'Oxygen saturation is outside the normal range.');
    add(metricStatuses.bloodSugar === 'high' || metricStatuses.bloodSugar === 'low', 'Blood sugar is outside the normal range.');
    add(metricStatuses.bmi === 'high' || metricStatuses.bmi === 'low', 'BMI is outside the normal range.');
    add(formData.breathingIssue === 'yes', 'Reported breathing discomfort. Consider medical guidance if symptoms persist.');
    add(formData.wellBeing === 'unwell', 'You reported feeling unwell today.');
    add(!!formData.symptoms.trim(), 'You listed symptoms. If they persist, consider medical guidance.');
    add(formData.smoking === 'yes', 'Smoking can increase cardiovascular risk.');
    add(formData.alcohol === 'yes', 'Alcohol can impact blood pressure and sleep quality.');
    add(formData.activityLevel === 'low', 'Low activity level may affect long‑term health.');
    return list;
  }, [metricStatuses, formData.breathingIssue, formData.wellBeing, formData.symptoms, formData.smoking, formData.alcohol, formData.activityLevel]);

  const applyNormalDefaults = () => {
    const age = numericValue(formData.age) || 30;
    const gender = formData.gender;
    const defaultsByAge = {
      child: {
        height: gender === 'male' ? 140 : 138,
        weight: gender === 'male' ? 35 : 33,
        systolic: 105,
        diastolic: 65,
        heartRate: 85
      },
      adult: {
        height: gender === 'male' ? 172 : 160,
        weight: gender === 'male' ? 70 : 58,
        systolic: 118,
        diastolic: 76,
        heartRate: 72
      },
      middle: {
        height: gender === 'male' ? 170 : 158,
        weight: gender === 'male' ? 72 : 62,
        systolic: 122,
        diastolic: 80,
        heartRate: 74
      },
      senior: {
        height: gender === 'male' ? 168 : 155,
        weight: gender === 'male' ? 68 : 58,
        systolic: 128,
        diastolic: 82,
        heartRate: 78
      }
    };
    const group = ageGroup === 'unknown' ? 'adult' : ageGroup;
    const preset = defaultsByAge[group as keyof typeof defaultsByAge];
    setFormData(prev => ({
      ...prev,
      systolic: String(preset.systolic),
      diastolic: String(preset.diastolic),
      heartRate: String(preset.heartRate),
      respiratoryRate: '14',
      temperature: '36.8',
      spo2: age >= 70 ? '95' : '98',
      bloodSugarType: 'fasting',
      bloodSugar: '92',
      cholesterol: group === 'child' ? '160' : '180',
      heightCm: String(preset.height),
      weightKg: String(preset.weight)
    }));
  };

  const clamp = (value: number, min?: number, max?: number) => {
    let result = value;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return result;
  };

  const runPredictions = async () => {
    setLoading(true);
    setPredictionError(null);
    try {
        const age = clamp(Number(formData.age) || 30, 10, 120);
        const diastolic = clamp(Number(formData.diastolic) || ranges.diastolic.min, ranges.diastolic.min, ranges.diastolic.max);
        const systolic = clamp(Number(formData.systolic) || ranges.systolic.min, ranges.systolic.min, ranges.systolic.max);
        const glucose = clamp(Number(formData.bloodSugar) || 100, 0, 400);
        const bmi = clamp(Number(formData.bmi) || 22, 0, 80);
        const cholesterol = clamp(Number(formData.cholesterol) || 180, 0, 600);
        const heightCm = clamp(Number(formData.heightCm) || 0, 1, 250);
        const weightKg = clamp(Number(formData.weightKg) || 0, 1, 250);
        const heartRate = clamp(Number(formData.heartRate) || ranges.heartRate.min, ranges.heartRate.min, ranges.heartRate.max);
        const respiratoryRate = clamp(Number(formData.respiratoryRate) || ranges.respiratoryRate.min, ranges.respiratoryRate.min, ranges.respiratoryRate.max);
        const temperature = clamp(Number(formData.temperature) || 36.8, 30, 45);
        const spo2 = clamp(Number(formData.spo2) || 98, 0, 100);

        setFormData(prev => ({
          ...prev,
          age: String(age),
          systolic: String(systolic),
          diastolic: String(diastolic),
          bloodSugar: String(glucose),
          bmi: String(bmi),
          cholesterol: String(cholesterol),
          heightCm: String(heightCm),
          weightKg: String(weightKg),
          heartRate: String(heartRate),
          respiratoryRate: String(respiratoryRate),
          temperature: String(temperature),
          spo2: String(spo2)
        }));

        const diabetesData = {
            pregnancies: 0,
            glucose,
            bloodPressure: diastolic,
            skinThickness: 20,
            insulin: 80,
            bmi,
            dpf: 0.5,
            age
        };

        const heartData = {
            age,
            sex: formData.gender === 'male' ? 1 : 0,
            cp: 0,
            trestbps: systolic,
            chol: cholesterol,
            fbs: formData.bloodSugarType === 'random' ? (glucose > 140 ? 1 : 0) : (glucose > 120 ? 1 : 0),
            restecg: 0,
            thalach: Math.max(60, 220 - age),
            exang: 0,
            oldpeak: 0,
            slope: 1,
            ca: 0,
            thal: 3
        };

        const [diabetesResult, heartResult] = await Promise.all([
            getPublicPrediction('diabetes', diabetesData),
            getPublicPrediction('heart', heartData)
        ]);

        setPredictionResults({ diabetes: diabetesResult, heart: heartResult });
        
        let summary = "Here is your wellness summary:\n\n";
        summary += `✅ **Wellness Score**: ${wellnessScore}%\n`;
        summary += `BP: ${systolic}/${diastolic} mm Hg | HR: ${heartRate} bpm | SpO2: ${spo2}%\n`;
        const sugarLabel = formData.bloodSugarType === 'random' ? 'Random' : 'Fasting';
        summary += `Glucose (${sugarLabel}): ${glucose} mg/dL | BMI: ${bmi}\n`;
        summary += `Feeling: ${formData.wellBeing}${formData.symptoms.trim() ? ` | Symptoms: ${formData.symptoms}` : ''}\n`;

        if (formData.breathingIssue === 'yes' || spo2 < 95) {
          summary += `\n⚠️ **Breathing/Oxygen Note**: Consider medical guidance if symptoms persist or SpO2 is low.\n`;
        }

        summary += `\n🩸 **Diabetes Risk**: ${diabetesResult.riskLevel} (${diabetesResult.confidence}%)\n`;
        if (diabetesResult.riskLevel !== 'Low') {
             summary += `Suggestion: ${diabetesResult.suggestions[0]}\n`;
        }

        summary += `\n❤️ **Heart Health Risk**: ${heartResult.riskLevel} (${heartResult.confidence}%)\n`;
        if (heartResult.riskLevel !== 'Low') {
             summary += `Suggestion: ${heartResult.suggestions[0]}\n`;
        }

        summary += `\nThis is a screening score, not a diagnosis. If you feel unwell, consult a medical professional.`;
        onPredictionComplete(summary);
    } catch (error) {
        console.error("Prediction failed", error);
        setPredictionError("Prediction failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-sm p-4 pt-20"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 h-[84vh] max-h-[84vh] flex flex-col sm:mr-6"
        >
          <div className="bg-emerald-600 p-4 flex items-center justify-between text-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`p-1 rounded-full transition-colors ${step === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-emerald-700'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <Activity className="w-5 h-5" />
              <h2 className="font-semibold text-lg">Wellness Check</h2>
            </div>
            <button onClick={onClose} className="hover:bg-emerald-700 p-1 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            <div className="flex gap-2 mb-6">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Basic Information</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Age</label>
                  <input 
                    type="number" 
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min={10}
                    max={120}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                    placeholder="e.g. 30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Gender</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">How do you feel today?</label>
                  <select 
                    name="wellBeing"
                    value={formData.wellBeing}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                  >
                    <option value="good">Good</option>
                    <option value="okay">Okay</option>
                    <option value="unwell">Unwell</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Symptoms (optional)</label>
                  <input 
                    type="text" 
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleChange}
                    placeholder="e.g. headache, cough"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {ageGroup === 'unknown' ? 'Enter your age to load the correct ranges.' : `Age group: ${ageGroup === 'child' ? '10–17' : ageGroup === 'adult' ? '18–40' : ageGroup === 'middle' ? '41–60' : '60+'}`}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Health Metrics</h3>
                  <button
                    type="button"
                    onClick={applyNormalDefaults}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                  >
                    Use Normal Values
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Systolic BP</label>
                    <input 
                      type="number" 
                      name="systolic"
                      value={formData.systolic}
                      onChange={handleChange}
                    min={0}
                      placeholder="e.g. 120"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Normal 90–120 {ranges.systolic.unit}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Diastolic BP</label>
                    <input 
                      type="number" 
                      name="diastolic"
                      value={formData.diastolic}
                      onChange={handleChange}
                    min={0}
                      placeholder="e.g. 80"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Normal 60–80 {ranges.diastolic.unit}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Heart Rate</label>
                    <input 
                      type="number" 
                      name="heartRate"
                      value={formData.heartRate}
                      onChange={handleChange}
                    min={0}
                      placeholder="e.g. 72"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Normal {ranges.heartRate.min}–{ranges.heartRate.max} {ranges.heartRate.unit}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Respiratory Rate</label>
                    <input 
                      type="number" 
                      name="respiratoryRate"
                      value={formData.respiratoryRate}
                      onChange={handleChange}
                    min={0}
                      placeholder="e.g. 14"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Normal 12–18 breaths/min</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Temperature</label>
                    <input 
                      type="number" 
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleChange}
                    min={30}
                    max={45}
                    step={0.1}
                      placeholder="e.g. 36.8"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Normal 36.5–37.3 °C</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Oxygen Saturation (SpO2)</label>
                    <input 
                      type="number" 
                      name="spo2"
                      value={formData.spo2}
                      onChange={handleChange}
                    min={0}
                    max={100}
                      placeholder="e.g. 98"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Normal 95–100 %</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Blood Sugar Type</label>
                    <select 
                      name="bloodSugarType"
                      value={formData.bloodSugarType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    >
                      <option value="fasting">Fasting</option>
                      <option value="random">Random</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Blood Sugar</label>
                    <input 
                      type="number" 
                      name="bloodSugar"
                      value={formData.bloodSugar}
                      onChange={handleChange}
                    min={0}
                      placeholder="e.g. 92"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {formData.bloodSugarType === 'random' ? 'Normal 70–140 mg/dL' : 'Normal 70–99 mg/dL'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Cholesterol</label>
                    <input 
                      type="number" 
                      name="cholesterol"
                      value={formData.cholesterol}
                      onChange={handleChange}
                    min={0}
                      placeholder="e.g. 180"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Height (cm)</label>
                    <input 
                      type="number" 
                      name="heightCm"
                      value={formData.heightCm}
                      onChange={handleChange}
                    min={1}
                      placeholder="e.g. 170"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Weight (kg)</label>
                    <input 
                      type="number" 
                      name="weightKg"
                      value={formData.weightKg}
                      onChange={handleChange}
                    min={1}
                      placeholder="e.g. 68"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">BMI</label>
                    <input 
                      type="number" 
                      name="bmi"
                      value={formData.bmi}
                      onChange={handleChange}
                    min={0}
                      placeholder="e.g. 22.0"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Normal {ranges.bmi.min}–{ranges.bmi.max}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Physical Activity</label>
                    <select 
                      name="activityLevel"
                      value={formData.activityLevel}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Smoking</label>
                    <select 
                      name="smoking"
                      value={formData.smoking}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Alcohol</label>
                    <select 
                      name="alcohol"
                      value={formData.alcohol}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Breathing Problem</label>
                    <select 
                      name="breathingIssue"
                      value={formData.breathingIssue}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && !predictionResults && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Wellness Score</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                      {ageGroup === 'unknown' ? 'Based on entered values' : `Ranges for ${ageGroup === 'child' ? '10–17' : ageGroup === 'adult' ? '18–40' : ageGroup === 'middle' ? '41–60' : '60+'}`}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold ${wellnessScore >= 75 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : wellnessScore >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'}`}>
                    {wellnessScore}%
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className={`px-3 py-2 rounded-lg ${statusColor(metricStatuses.systolic)}`}>Systolic {formData.systolic || '--'}</div>
                  <div className={`px-3 py-2 rounded-lg ${statusColor(metricStatuses.diastolic)}`}>Diastolic {formData.diastolic || '--'}</div>
                  <div className={`px-3 py-2 rounded-lg ${statusColor(metricStatuses.heartRate)}`}>Heart Rate {formData.heartRate || '--'}</div>
                  <div className={`px-3 py-2 rounded-lg ${statusColor(metricStatuses.respiratoryRate)}`}>Resp Rate {formData.respiratoryRate || '--'}</div>
                  <div className={`px-3 py-2 rounded-lg ${statusColor(metricStatuses.temperature)}`}>Temp {formData.temperature || '--'}</div>
                  <div className={`px-3 py-2 rounded-lg ${statusColor(metricStatuses.spo2)}`}>SpO2 {formData.spo2 || '--'}</div>
                  <div className={`px-3 py-2 rounded-lg ${statusColor(metricStatuses.bloodSugar)}`}>Glucose {formData.bloodSugar || '--'}</div>
                  <div className={`px-3 py-2 rounded-lg ${statusColor(metricStatuses.bmi)}`}>BMI {formData.bmi || '--'}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg text-left text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500">Age/Gender:</span> <span className="font-medium dark:text-white">{formData.age || '--'} / {formData.gender}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Blood Pressure:</span> <span className="font-medium dark:text-white">{formData.systolic || '--'}/{formData.diastolic || '--'} mm Hg</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Blood Sugar:</span> <span className="font-medium dark:text-white">{formData.bloodSugarType === 'random' ? 'Random' : 'Fasting'} {formData.bloodSugar || '--'} mg/dL</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Feeling:</span> <span className="font-medium dark:text-white">{formData.wellBeing}</span></div>
                  {formData.symptoms.trim() && (
                    <div className="flex justify-between"><span className="text-slate-500">Symptoms:</span> <span className="font-medium dark:text-white">{formData.symptoms}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-slate-500">Lifestyle:</span> <span className="font-medium dark:text-white">{formData.activityLevel} activity, {formData.smoking === 'yes' ? 'smoker' : 'non-smoker'}, {formData.alcohol === 'yes' ? 'alcohol' : 'no alcohol'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Breathing Issue:</span> <span className="font-medium dark:text-white">{formData.breathingIssue === 'yes' ? 'Yes' : 'No'}</span></div>
                </div>
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-lg text-sm space-y-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Alerts</p>
                  {alerts.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400">No alerts based on the values entered.</p>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                      {alerts.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  This is a screening overview and not a medical diagnosis.
                </div>
              </div>
            )}

            {predictionResults && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Analysis Results</h3>
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold ${wellnessScore >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    Score: {wellnessScore}%
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold dark:text-white">Diabetes Screening</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${predictionResults.diabetes.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {predictionResults.diabetes.riskLevel} Risk
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {predictionResults.diabetes.analysis}
                    </p>
                    {predictionResults.diabetes.suggestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Recommendation</p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">{predictionResults.diabetes.suggestions[0]}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold dark:text-white">Heart Health Screening</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${predictionResults.heart.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {predictionResults.heart.riskLevel} Risk
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {predictionResults.heart.analysis}
                    </p>
                    {predictionResults.heart.suggestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Recommendation</p>
                        <p className="text-xs text-slate-500 dark:text-slate-300">{predictionResults.heart.suggestions[0]}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  <strong>Note:</strong> These results are generated by AI screening models. This is not a formal medical diagnosis. Please consult a healthcare professional for clinical evaluation.
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-xl font-bold transition-all"
                >
                  Close & View Summary
                </button>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between bg-slate-50 dark:bg-slate-800/50">
            {predictionResults ? (
               <div />
            ) : step > 1 ? (
              <button 
                onClick={handleBack}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
                <div />
            )}
            
            {!predictionResults && (
              step < 3 ? (
                <button 
                  onClick={handleNext}
                  disabled={step === 1 && (!formData.age)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={runPredictions}
                  disabled={loading}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Run Prediction
                </button>
              )
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HealthFormModal;
