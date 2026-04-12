import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  TrendingUp,
  Clock,
  User,
  ChevronRight,
  ArrowLeft,
  PieChart as PieChartIcon,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import GlassCard from './GlassCard';
import { HistoryItem } from '../services/historyService';
import { DISEASES } from '../constants';
import { downloadAdminExcel } from '../services/localService';

interface DashboardProps {
  history: HistoryItem[];
  onSelectDisease: (id: string) => void;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const Dashboard: React.FC<DashboardProps> = ({ history, onSelectDisease }) => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : '';

  const handleExcelDownload = async () => {
    try {
      const blob = await downloadAdminExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `healai_data_export_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download Excel');
    }
  };

  const stats = useMemo(() => {
    const total = history.length;
    const highRisk = history.filter(h => h.result.riskLevel === 'High').length;
    const lowRisk = total - highRisk;
    const riskRate = total > 0 ? Math.round((highRisk / total) * 100) : 0;
    
    // Group by disease
    const byDisease = history.reduce((acc, curr) => {
      acc[curr.disease] = (acc[curr.disease] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, highRisk, lowRisk, riskRate, byDisease };
  }, [history]);

  const patients = useMemo(() => {
    const grouped: Record<string, HistoryItem[]> = {};
    history.forEach(item => {
      const name = item.patientName || 'Unknown Patient';
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(item);
    });
    return Object.entries(grouped).map(([name, items]) => ({
      name,
      items: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      lastDate: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date,
      highRiskCount: items.filter(i => i.result.riskLevel === 'High').length,
      totalScans: items.length
    })).sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime());
  }, [history]);

  const chartData = useMemo(() => {
    return Object.entries(stats.byDisease).map(([key, value]) => ({
      name: DISEASES.find(d => d.id === key)?.title || key,
      value
    }));
  }, [stats]);

  const riskData = useMemo(() => {
    return [
      { name: 'Healthy', value: stats.lowRisk },
      { name: 'High Risk', value: stats.highRisk }
    ];
  }, [stats]);

  const selectedPatientData = useMemo(() => {
    if (!selectedPatient) return null;
    return patients.find(p => p.name === selectedPatient);
  }, [selectedPatient, patients]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-7xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {selectedPatient && (
              <button 
                onClick={() => setSelectedPatient(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            {selectedPatient ? `${selectedPatient}'s History` : 'Health Dashboard'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {selectedPatient 
              ? `Viewing diagnostic reports for ${selectedPatient}` 
              : 'Overview of patient diagnostics and health metrics.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Calendar size={16} />
            {new Date().toLocaleDateString()}
          </div>
          {role === 'ADMIN' && (
            <button
              onClick={handleExcelDownload}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/20"
              title="Download all data (Excel)"
            >
              <Download size={16} />
              Download Excel
            </button>
          )}
        </div>
      </div>

      {!selectedPatient && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassCard className="p-6 flex items-center gap-4 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Scans</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</h3>
              </div>
            </GlassCard>

            <GlassCard className="p-6 flex items-center gap-4 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Healthy Results</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.lowRisk}</h3>
              </div>
            </GlassCard>

            <GlassCard className="p-6 flex items-center gap-4 bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30">
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Risk Alerts</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.highRisk}</h3>
              </div>
            </GlassCard>

            <GlassCard className="p-6 flex items-center gap-4 bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/30">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Risk Rate</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.riskRate}%</h3>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Charts Section */}
            <GlassCard className="p-6">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                 <PieChartIcon size={20} className="text-emerald-500" />
                 Disease Distribution
               </h3>
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                     <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 12}} />
                     <YAxis tick={{fill: '#94a3b8', fontSize: 12}} />
                     <Tooltip 
                       contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                       cursor={{ fill: 'transparent' }}
                     />
                     <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </GlassCard>

            <GlassCard className="p-6">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                 <Activity size={20} className="text-blue-500" />
                 Risk Overview
               </h3>
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={riskData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {riskData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                       ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     />
                     <Legend />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
            </GlassCard>
          </div>

          {/* Patients List */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="text-emerald-500" size={20} />
              Recent Patients
            </h3>
            
            {patients.length === 0 ? (
              <GlassCard className="p-12 flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 border-dashed border-2 border-slate-200 dark:border-slate-700 bg-transparent">
                <Users className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-lg font-medium mb-2">No Patients Recorded</p>
                <p className="text-sm">Start a new assessment to begin tracking patient history.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map((patient) => (
                  <GlassCard 
                    key={patient.name}
                    className="p-4 cursor-pointer hover:border-emerald-500/50 transition-all hover:shadow-lg group"
                    onClick={() => setSelectedPatient(patient.name)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{patient.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{patient.totalScans} Tests</p>
                        </div>
                      </div>
                      <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform" size={20} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Last Visit</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {new Date(patient.lastDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Risk Alerts</span>
                        <span className={`font-bold ${patient.highRiskCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {patient.highRiskCount}
                        </span>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {selectedPatient && selectedPatientData && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {selectedPatientData.items.map((item) => (
            <GlassCard key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group hover:border-emerald-500/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  item.result.riskLevel === 'High'
                    ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' 
                    : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {item.result.riskLevel === 'High' ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                    {DISEASES.find(d => d.id === item.disease)?.title || item.disease} Assessment
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                    <Calendar size={14} />
                    {new Date(item.date).toLocaleDateString()}
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                    <Clock size={14} />
                    {new Date(item.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pl-16 sm:pl-0">
                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Risk Probability</span>
                  <div className="flex items-center gap-2 justify-end">
                    <span className={`font-mono font-bold text-xl ${
                      item.result.riskLevel === 'High' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {item.result.confidence}%
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => onSelectDisease(item.disease)}
                  className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl transition-colors"
                >
                  Retest
                </button>
              </div>
            </GlassCard>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;
