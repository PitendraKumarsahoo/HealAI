import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DISEASES } from './constants';
import { DiseaseType, PredictionResponse } from './types';
import { getLocalPrediction, getRemoteHistory } from './services/localService';
import { saveToHistory, getHistory, HistoryItem, clearHistory } from './services/historyService';
import { generatePDF } from './utils/pdfGenerator';
import Background3D from './components/Background3D';
import GlassCard from './components/GlassCard';
import Dashboard from './components/Dashboard';
import DoctorDirectory from './components/DoctorDirectory';
import NearbyMedicalServices from './components/NearbyMedicalServices';
import AIVoiceAssistant from './components/AIVoiceAssistant';
import Auth3D from './components/Auth3D';
import Chatbot from './components/Chatbot';
import HealthFormModal from './components/HealthFormModal';
import { login, register } from './services/authService';
import { 
  Activity, 
  ChevronRight, 
  ClipboardList, 
  Download, 
  History, 
  LayoutDashboard, 
  RefreshCw, 
  Stethoscope, 
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  LogOut,
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
  Home,
  Shield,
  Zap,
  Brain,
  ArrowRight,
  Search,
  Mic,
  MapPin
} from 'lucide-react';

type ViewMode = 'home' | 'dashboard' | 'assessment' | 'result' | 'doctors' | 'voice' | 'nearby';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('home');
  const [selectedDisease, setSelectedDisease] = useState<DiseaseType | null>(null);
  const [formData, setFormData] = useState<Record<string, number | string>>({});
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [patientName, setPatientName] = useState<string>('');
  const [showQuickFillModal, setShowQuickFillModal] = useState<boolean>(false);
  const [qfGender, setQfGender] = useState<'male' | 'female'>('male');
  const [qfAge, setQfAge] = useState<number>(30);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | ''>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState<string>(localStorage.getItem('role') || '');
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or system preference
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });

  // Health Assistant State
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [lastPredictionResult, setLastPredictionResult] = useState<string | null>(null);
  
  const handleHealthFormPrediction = (result: string) => {
    setLastPredictionResult(result);
  };

  const activeDisease = DISEASES.find(d => d.id === selectedDisease);

  useEffect(() => {
    const loadHistory = async () => {
      if (isAuthenticated) {
        try {
          const remoteHistory = await getRemoteHistory(userRole);
          setHistory(remoteHistory);
        } catch (e) {
          console.error("Failed to load remote history", e);
          setHistory(getHistory());
        }
      } else {
        setHistory(getHistory());
      }
    };
    loadHistory();
  }, [isAuthenticated, userRole, view]); // Reload when view changes (e.g. to dashboard)

  // Theme Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleDiseaseSelect = (id: DiseaseType) => {
    const disease = DISEASES.find(d => d.id === id);
    const defaults: Record<string, number | string> = {};
    if (disease) {
      disease.fields.forEach(f => {
        if (f.defaultValue !== undefined) {
          defaults[f.name] = f.defaultValue;
        }
      });
    }
    setSelectedDisease(id);
    setPrediction(null);
    setFormData(defaults);
    setError(null);
    setView('assessment');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    clearHistory();
    setHistory([]);
    setIsAuthenticated(false);
    setUserRole('');
    setPatientName('');
    setView('home');
  };

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuickFill = () => {
    if (!activeDisease) return;
    setShowQuickFillModal(true);
  };

  const applyQuickFill = (gender: 'male' | 'female', age: number) => {
    if (!activeDisease) return;
    const d = activeDisease.id;
    const sampleData: Record<string, number | string> = {};
    setPatientGender(gender);
    if (d === 'diabetes') {
      sampleData['pregnancies'] = 0;
      sampleData['glucose'] = 95;
      sampleData['bloodPressure'] = 78;
      sampleData['skinThickness'] = 20;
      sampleData['insulin'] = 85;
      sampleData['bmi'] = gender === 'male' ? 23 : 22;
      sampleData['dpf'] = 0.5;
      sampleData['age'] = age;
    } else if (d === 'heart') {
      sampleData['age'] = age;
      sampleData['sex'] = gender === 'male' ? 1 : 0;
      sampleData['cp'] = 2;
      sampleData['trestbps'] = 120;
      sampleData['chol'] = 190;
      sampleData['fbs'] = 0;
      sampleData['restecg'] = 0;
      sampleData['thalach'] = Math.max(60, 220 - age);
      sampleData['exang'] = 0;
      sampleData['oldpeak'] = 0;
      sampleData['slope'] = 1;
      sampleData['ca'] = 0;
      sampleData['thal'] = 3;
    } else if (d === 'kidney') {
      sampleData['id'] = 0;
      sampleData['age'] = age;
      sampleData['bp'] = 120;
      sampleData['sg'] = 1.015;
      sampleData['al'] = 0;
      sampleData['su'] = 0;
      sampleData['rbc'] = 1;
      sampleData['pc'] = 1;
      sampleData['pcc'] = 0;
      sampleData['ba'] = 0;
      sampleData['bgr'] = 100;
      sampleData['bu'] = 30;
      sampleData['sc'] = 1.0;
      sampleData['sod'] = 140;
      sampleData['pot'] = 4.0;
      sampleData['hemo'] = gender === 'male' ? 14.5 : 13.5;
      sampleData['pcv'] = 45;
      sampleData['wc'] = 7000;
      sampleData['rc'] = 5.0;
      sampleData['htn'] = 0;
      sampleData['dm'] = 0;
      sampleData['cad'] = 0;
      sampleData['appet'] = 0;
      sampleData['pe'] = 0;
      sampleData['ane'] = 0;
    } else if (d === 'liver') {
      sampleData['age'] = age;
      sampleData['gender'] = gender === 'male' ? 1 : 0;
      sampleData['total_bilirubin'] = 0.8;
      sampleData['direct_bilirubin'] = 0.2;
      sampleData['alkaline_phosphotase'] = 100;
      sampleData['alamine_aminotransferase'] = 30;
      sampleData['aspartate_aminotransferase'] = 30;
      sampleData['total_protiens'] = 7.0;
      sampleData['albumin'] = gender === 'male' ? 4.5 : 4.3;
      sampleData['ag_ratio'] = 1.5;
    }
    activeDisease.fields.forEach(f => {
      if (sampleData[f.name] === undefined) {
        sampleData[f.name] = f.defaultValue ?? (f.type === 'select' ? (f.options?.[0]?.value ?? 0) : 0);
      }
    });
    setFormData(sampleData);
    setShowQuickFillModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisease) return;
    if (!patientName || patientName.trim() === '') {
      setError('Please enter patient name');
      return;
    }
    if (!isAuthenticated) {
      setError('Please login to run analysis');
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await getLocalPrediction(selectedDisease, formData, patientName);
      setPrediction(result);
      saveToHistory(selectedDisease, result, patientName);
      setHistory(getHistory());
      setView('result');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    setSelectedDisease(null);
    setPrediction(null);
    setFormData({});
    setError(null);
    setView('home');
  };

  const goToDashboard = () => {
    setSelectedDisease(null);
    setPrediction(null);
    setFormData({});
    setError(null);
    setView('dashboard');
  };

  const goToDoctors = () => {
    setSelectedDisease(null);
    setPrediction(null);
    setFormData({});
    setError(null);
    setView('doctors');
  };

  const goToVoice = () => {
    setSelectedDisease(null);
    setPrediction(null);
    setFormData({});
    setError(null);
    setView('voice');
  };

  const goToNearby = () => {
    setSelectedDisease(null);
    setPrediction(null);
    setFormData({});
    setError(null);
    setView('nearby');
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
        active 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
          : 'text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const groupedFields = useMemo(() => {
    if (!activeDisease) return {};
    return activeDisease.fields.reduce((acc, field) => {
      if (field.hidden) return acc;
      const category = field.category || 'General Information';
      if (!acc[category]) acc[category] = [];
      acc[category].push(field);
      return acc;
    }, {} as Record<string, typeof activeDisease.fields>);
  }, [activeDisease]);

  const progress = useMemo(() => {
    if (!activeDisease) return 0;
    const visibleFields = activeDisease.fields.filter(f => !f.hidden);
    const filledFields = visibleFields.filter(f => formData[f.name] !== undefined && formData[f.name] !== '');
    return Math.round((filledFields.length / visibleFields.length) * 100);
  }, [activeDisease, formData]);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-x-hidden relative">
      {isDarkMode && <Background3D />}
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={goHome}>
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.7 }}
              className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 dark:from-emerald-400 dark:to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"
            >
              <Stethoscope size={24} />
            </motion.div>
            <div>
              <h1 className="font-bold text-xl text-slate-900 dark:text-white leading-none tracking-tight">HealAI</h1>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase mt-0.5">Pro Diagnostic Suite</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <nav className="hidden xl:flex items-center gap-1">
              <NavButton active={view === 'home'} onClick={goHome} icon={<Home size={18} />} label="Home" />
              <NavButton active={view === 'dashboard'} onClick={goToDashboard} icon={<LayoutDashboard size={18} />} label="Dashboard" />
              <NavButton active={view === 'doctors'} onClick={goToDoctors} icon={<Search size={18} />} label="Doctors" />
              <NavButton active={view === 'voice'} onClick={goToVoice} icon={<Mic size={18} />} label="AI Voice" />
              <NavButton active={view === 'nearby'} onClick={goToNearby} icon={<MapPin size={18} />} label="Nearby" />
            </nav>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block mx-2" />
            
            <div className="flex items-center gap-2">
              {!isAuthenticated ? (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-all px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  <Shield size={16} />
                  <span>Login</span>
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Role</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{userRole}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                    title="Logout"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              )}
              
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col relative max-w-7xl mx-auto w-full pt-20 z-10">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 w-full">
          <AnimatePresence mode="wait">
            
            {/* HOME VIEW */}
            {view === 'home' && (
              <motion.section 
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full space-y-24 pb-20"
              >
                {/* Hero Section */}
                <div className="relative pt-12 pb-20 overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>

                  <div className="flex flex-col items-center text-center max-w-4xl mx-auto px-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8"
                    >
                      <Sparkles size={14} />
                      Next-Gen Medical AI
                    </motion.div>

                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[0.9]"
                    >
                      Precision Health <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">Diagnostics.</span>
                    </motion.h2>
                    
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed mb-12 font-medium"
                    >
                      Empowering healthcare through advanced neural networks. Get clinical-grade diagnostic insights in seconds, powered by local AI.
                    </motion.p>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap items-center justify-center gap-4"
                    >
                      <button
                        onClick={() => document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-2xl transition-all hover:scale-105 flex items-center gap-3"
                      >
                        Start Analysis
                        <ArrowRight size={20} />
                      </button>
                      <button
                        onClick={() => setShowHealthModal(true)}
                        className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-bold rounded-2xl shadow-xl transition-all hover:scale-105 flex items-center gap-3"
                      >
                        <Activity size={20} className="text-emerald-500" />
                        Wellness Check
                      </button>
                    </motion.div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto px-4">
                  {[
                    { label: 'Accuracy Rate', value: '98.4%', color: 'text-emerald-500' },
                    { label: 'Data Points', value: '50k+', color: 'text-blue-500' },
                    { label: 'Response Time', value: '< 2s', color: 'text-purple-500' },
                    { label: 'Privacy', value: '100%', color: 'text-cyan-500' }
                  ].map((stat, i) => (
                    <GlassCard key={i} className="p-6 text-center">
                      <p className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </GlassCard>
                  ))}
                </div>

                {/* Main Feature Showcases */}
                <div className="space-y-32">
                  {/* Feature 1: AI Voice */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto px-4">
                    <motion.div 
                      initial={{ opacity: 0, x: -40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="space-y-8"
                    >
                      <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <Mic size={28} />
                      </div>
                      <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
                        Speak to your <br />
                        <span className="text-emerald-500">AI Assistant.</span>
                      </h3>
                      <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        Natural language processing meets healthcare. Our multilingual voice assistant understands your symptoms and provides instant clinical guidance in English, Hindi, and Odia.
                      </p>
                      <ul className="space-y-4">
                        {['Real-time Voice Recognition', 'Multilingual Support (En/Hi/Or)', 'Word-by-word Highlighting'].map((f, i) => (
                          <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold">
                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <CheckCircle2 size={14} className="text-emerald-500" />
                            </div>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <button 
                        onClick={goToVoice}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 relative z-10"
                      >
                        <span className="relative z-10">Try Voice Assistant</span>
                        <ArrowRight size={18} className="relative z-10" />
                      </button>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="relative group flex flex-col items-center gap-6"
                    >
                      <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] group-hover:bg-emerald-500/30 transition-all pointer-events-none" />
                      <GlassCard 
                        onClick={goToVoice}
                        className="aspect-video w-full relative overflow-hidden p-0 border-2 border-emerald-500/20 cursor-pointer hover:border-emerald-500/50 transition-all duration-500 z-10"
                      >
                        <img 
                          src="https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=1000" 
                          alt="AI Voice Healthcare" 
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4].map(i => (
                                <motion.div 
                                  key={i}
                                  animate={{ height: [10, 24, 10] }}
                                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                  className="w-1 bg-emerald-400 rounded-full"
                                />
                              ))}
                            </div>
                            <span className="text-white font-bold text-sm tracking-widest uppercase">Listening...</span>
                          </div>
                          <p className="text-emerald-100 text-sm font-medium italic">"I have a slight fever and headache, what should I do?"</p>
                        </div>
                      </GlassCard>
                      
                      <button 
                        onClick={goToVoice}
                        className="w-full max-w-sm px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 flex items-center justify-center gap-3 group z-10 relative"
                      >
                        <Mic size={20} />
                        <span className="relative z-10">Try Voice Assistant</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform relative z-10" />
                      </button>
                    </motion.div>
                  </div>

                  {/* Feature 2: Maps & Doctors */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto px-4">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="order-2 lg:order-1 relative group"
                    >
                      <div className="absolute inset-0 bg-blue-500/20 blur-[80px] group-hover:bg-blue-500/30 transition-all" />
                      <GlassCard className="aspect-video relative overflow-hidden p-0 border-2 border-blue-500/20">
                        <img 
                          src="https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=1000" 
                          alt="Medical Services" 
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="flex items-center gap-2 mb-2 text-blue-400">
                            <MapPin size={18} />
                            <span className="text-white font-bold text-sm tracking-widest uppercase">Nearby Centers</span>
                          </div>
                          <p className="text-blue-100 text-sm font-medium">Instant location-based hospital & clinic discovery.</p>
                        </div>
                      </GlassCard>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="order-1 lg:order-2 space-y-8"
                    >
                      <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                        <Search size={28} />
                      </div>
                      <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
                        Find Care <br />
                        <span className="text-blue-500">Instantly.</span>
                      </h3>
                      <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        Access a comprehensive directory of specialized doctors across Odisha or find the nearest medical facilities using our intelligent mapping system.
                      </p>
                      <div className="flex gap-4">
                        <button 
                          onClick={goToDoctors}
                          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all"
                        >
                          Doctor Directory
                        </button>
                        <button 
                          onClick={goToNearby}
                          className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                          Nearby Services
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Modules Section */}
                <div id="modules" className="scroll-mt-32 max-w-6xl mx-auto px-4">
                  <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                      Diagnostic <span className="text-emerald-500">Engines.</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                      Select a specialized analysis module to begin your professional assessment.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {DISEASES.map((disease, index) => (
                      <GlassCard
                        key={disease.id}
                        onClick={() => handleDiseaseSelect(disease.id)}
                        className="p-8 flex flex-col group cursor-pointer hover:border-emerald-500/50 transition-all duration-500 relative overflow-hidden"
                      >
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        
                        <div className="flex items-center justify-between mb-8">
                          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                            {disease.icon || <Activity />}
                          </div>
                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight size={20} className="text-emerald-500" />
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-emerald-500 transition-colors">
                          {disease.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 flex-1">
                          {disease.description}
                        </p>
                        
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                          Launch Module
                          <div className="h-px flex-1 bg-emerald-500/20" />
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>

                {/* Team Section / Footer Credits */}
                <div className="max-w-6xl mx-auto px-4 pt-32 pb-20">
                  <div className="relative">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <GlassCard className="p-12 md:p-20 text-center relative overflow-hidden border-2 border-white/10 dark:border-slate-800/50 shadow-2xl">
                      {/* Animated Top Border */}
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" 
                      />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16"
                      >
                        <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">
                          The Minds Behind <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">HealAI.</span>
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-sm">Development Team</p>
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
                        {[
                          { 
                            name: 'Pitendra Kumar Sahoo', 
                            role: 'Lead AI Engineer', 
                            icon: <Brain className="text-emerald-500" size={24} />,
                            photo: "pitendra.jpg"
                          },
                          { 
                            name: 'Omm Prakash Sahu', 
                            role: 'Frontend Architect', 
                            icon: <LayoutDashboard className="text-blue-500" size={24} />,
                            photo: "omm.jpg"
                          },
                          { 
                            name: 'Rakesh Rath', 
                            role: 'Backend Specialist', 
                            icon: <Shield className="text-purple-500" size={24} />,
                            photo: "rakesh.jpg"
                          }
                        ].map((member, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            whileHover={{ y: -10 }}
                            className="group p-8 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-700/50 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500"
                          >
                            <div className="relative w-24 h-24 mx-auto mb-6">
                              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500 opacity-20" />
                              <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-100 dark:border-slate-700 p-1">
                                <img 
                                  src={member.photo} 
                                  alt={member.name} 
                                  className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
                                />
                              </div>
                              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform duration-500">
                                {member.icon}
                              </div>
                            </div>
                            <p className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-emerald-500 transition-colors">{member.name}</p>
                            <div className="h-px w-8 bg-slate-200 dark:bg-slate-700 mx-auto mb-4 group-hover:w-16 transition-all duration-500" />
                            <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{member.role}</p>
                          </motion.div>
                        ))}
                      </div>

                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="pt-16 border-t border-slate-100 dark:border-slate-800/50"
                      >
                        <div className="inline-block relative">
                          <motion.div
                            animate={{ 
                              scale: [1, 1.1, 1],
                              opacity: [0.5, 0.8, 0.5]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full"
                          />
                          <p className="relative text-2xl md:text-4xl font-black tracking-tighter text-slate-400 dark:text-slate-500 flex items-center justify-center gap-4">
                            MADE BY TEAM 
                            <span className="text-slate-900 dark:text-white px-6 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] transform hover:scale-110 transition-all duration-500 cursor-default">
                              PRO
                            </span>
                          </p>
                        </div>
                      </motion.div>
                    </GlassCard>
                  </div>
                </div>
              </motion.section>
            )}
            {showLoginModal && (
              <Auth3D 
                onClose={() => setShowLoginModal(false)}
                onSuccess={(role) => {
                  setIsAuthenticated(true);
                  setUserRole(role);
                  setShowLoginModal(false);
                  setAuthError(null);
                  if (role === 'USER') setView('home');
                  else setView('dashboard');
                }}
              />
            )}

            {/* DASHBOARD VIEW */}
            {view === 'dashboard' && (
              <Dashboard 
                key="dashboard"
                history={history} 
                onSelectDisease={handleDiseaseSelect} 
              />
            )}

            {/* DOCTOR DIRECTORY VIEW */}
            {view === 'doctors' && (
              <DoctorDirectory key="doctors" />
            )}

            {view === 'voice' && (
              <div className="w-full flex flex-col items-center">
                 <div className="mb-12 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Multilingual AI Voice Assistant</h2>
                    <p className="text-slate-600 dark:text-slate-400">Interact with HealAI using high-quality Text-to-Speech in English, Hindi, and Odia.</p>
                 </div>
                 <AIVoiceAssistant key="voice" />
              </div>
            )}

            {view === 'nearby' && (
              <NearbyMedicalServices key="nearby" />
            )}

            {/* ASSESSMENT VIEW */}
            {view === 'assessment' && selectedDisease && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <button 
                        onClick={goHome}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <ChevronRight className="rotate-180" size={24} />
                      </button>
                      {activeDisease?.title} Assessment
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 ml-10">
                      Complete the clinical parameters below for analysis.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-10 md:ml-0">
                    <button 
                      onClick={handleQuickFill}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                    >
                      <Sparkles size={16} />
                      Quick Fill
                    </button>
                    <button 
                      onClick={() => setShowHealthModal(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                    >
                      <Activity size={16} />
                      Wellness Check
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Form Column */}
                  <div className="lg:col-span-2 space-y-6">
                    <GlassCard className="p-6 md:p-8">
                      <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
                            Patient
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 md:col-span-2">
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Patient Name
                              </label>
                              <input
                                type="text"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white"
                                required
                                placeholder="Enter full name"
                              />
                            </div>
                          <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                              Gender
                            </label>
                            <select
                              value={patientGender}
                              onChange={(e) => {
                                const g = e.target.value as 'male' | 'female';
                                setPatientGender(g);
                                if (selectedDisease === 'diabetes' && g === 'male') {
                                  setFormData(prev => ({ ...prev, pregnancies: 0 }));
                                }
                              }}
                              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none text-slate-900 dark:text-white"
                            >
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                          </div>
                        </div>
                        {Object.entries(groupedFields).map(([category, fields]) => (
                          <div key={category} className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
                              {category}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {fields.map(field => (
                                <div key={field.name} className="space-y-1.5">
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {field.label}
                                  </label>
                                  {field.type === 'select' ? (
                                    <div className="relative">
                                      <select
                                        value={formData[field.name] ?? ''}
                                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all appearance-none text-slate-900 dark:text-white"
                                        required={!field.hidden}
                                      >
                                        <option value="">Select option</option>
                                        {field.options?.map(opt => (
                                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                      </select>
                                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                  ) : (
                                    <input
                                      type="number"
                                      value={formData[field.name] ?? ''}
                                      onChange={(e) => handleInputChange(field.name, Number(e.target.value))}
                                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white"
                                      required={!field.hidden && !(selectedDisease === 'diabetes' && field.name === 'pregnancies' && patientGender === 'male')}
                                      disabled={selectedDisease === 'diabetes' && field.name === 'pregnancies' && patientGender === 'male'}
                                      step={field.step}
                                      min={field.min}
                                      max={field.max}
                                      placeholder={`e.g. ${field.defaultValue}`}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {error && (
                          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
                            <AlertTriangle size={20} />
                            <p className="text-sm font-medium">{error}</p>
                          </div>
                        )}
                        <div className="pt-4 flex items-center gap-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {loading ? (
                              <>
                                <RefreshCw className="animate-spin" size={20} />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Activity size={20} />
                                Run Analysis
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </GlassCard>
                  </div>

                  {/* Sidebar / Results */}
                  <div className="space-y-6">
                    {/* Progress Card */}
                    <GlassCard className="p-6">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-4">Form Progress</h3>
                      <div className="h-4 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden mb-2">
                        <motion.div 
                          className="h-full bg-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-right text-sm text-slate-500 dark:text-slate-400 font-medium">{progress}% Complete</p>
                    </GlassCard>

                    <AnimatePresence></AnimatePresence>
                  </div>
                </div>
                {showQuickFillModal && (
                  <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center px-4">
                    <GlassCard className="p-6 w-full max-w-md">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Fill</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                          <select
                            value={qfGender}
                            onChange={(e) => setQfGender(e.target.value as 'male' | 'female')}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age</label>
                          <input
                            type="number"
                            value={qfAge}
                            min={1}
                            max={120}
                            onChange={(e) => setQfAge(Number(e.target.value))}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => applyQuickFill(qfGender, qfAge)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl"
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowQuickFillModal(false)}
                            className="flex-1 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl py-2.5"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                )}
              </motion.div>
            )}
            {view === 'result' && selectedDisease && prediction && (
              <motion.section 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {patientName} – {activeDisease?.title} Assessment
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-3">
                    Comprehensive analysis with clinical recommendations
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <GlassCard className="p-8">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">Patient Information</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Patient Name</p>
                          <p className="font-bold text-slate-900 dark:text-white text-lg">{patientName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Age</p>
                          <p className="font-bold text-slate-900 dark:text-white text-lg">{formData.age || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Assessment Type</p>
                          <p className="font-bold text-slate-900 dark:text-white text-lg">{activeDisease?.title}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Analysis Date</p>
                          <p className="font-bold text-slate-900 dark:text-white text-lg">{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Summary</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Risk Score {prediction.confidence}%</p>
                        </div>
                        <div className={`px-4 py-2 rounded-xl ${prediction.riskLevel === 'High' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300' : prediction.riskLevel === 'Moderate' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'}`}>
                          {prediction.riskLevel} Risk
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Clinical Analysis</h4>
                        <p className="text-slate-700 dark:text-slate-300">{prediction.analysis}</p>
                      </div>
                    </GlassCard>
                    <GlassCard className="p-8">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Suggestions</h4>
                      <ul className="space-y-4">
                        {prediction.suggestions.map((rec, i) => {
                          const [title, desc] = rec.split(': ');
                          return (
                            <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                              <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 mt-1 flex-shrink-0" size={18} />
                              <div>
                                {desc ? (
                                  <>
                                    <span className="font-bold block text-slate-900 dark:text-white mb-1">{title}</span>
                                    <span className="text-sm leading-relaxed block text-slate-600 dark:text-slate-400">{desc}</span>
                                  </>
                                ) : (
                                  <span>{rec}</span>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </GlassCard>
                  </div>
                  <div className="space-y-6">
                    <GlassCard className="p-6">
                      <div className="space-y-4">
                        <button
                          onClick={() => activeDisease && generatePDF(activeDisease, patientName || 'Unknown', formData, prediction, new Date().toISOString())}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
                        >
                          <Download size={20} />
                          Download Professional Report
                        </button>
                        <button
                          onClick={() => setView('assessment')}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-500"
                        >
                          <ChevronRight className="rotate-180" size={20} />
                          Back to Assessment
                        </button>
                        <button
                          onClick={goHome}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-500"
                        >
                          <Home size={20} />
                          Start New Assessment
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
        <Chatbot 
          onOpenHealthForm={() => setShowHealthModal(true)} 
          lastPredictionResult={lastPredictionResult}
        />
        <HealthFormModal 
          isOpen={showHealthModal} 
          onClose={() => setShowHealthModal(false)}
          onPredictionComplete={handleHealthFormPrediction}
        />
      </div>
    </div>
  );
};

export default App;
