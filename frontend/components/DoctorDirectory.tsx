import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Phone, User, Filter, Map, ChevronRight, Stethoscope, Star, Loader2 } from 'lucide-react';
import { ODISHA_DISTRICTS, SPECIALIZATIONS, DOCTOR_TYPES, DOCTORS_DATA } from '../data/doctors';
import { Doctor } from '../types';

const DoctorDirectory: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Khordha');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Simulate loading when switching districts
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [selectedDistrict]);

  const filteredDoctors = useMemo(() => {
    return DOCTORS_DATA.filter((doctor) => {
      const matchesDistrict = doctor.district === selectedDistrict;
      const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (doctor.hospital?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesSpecialization = selectedSpecialization === 'All' || doctor.specialization === selectedSpecialization;
      const matchesType = selectedType === 'All' || doctor.type === selectedType;
      
      return matchesDistrict && matchesSearch && matchesSpecialization && matchesType;
    });
  }, [selectedDistrict, searchQuery, selectedSpecialization, selectedType]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
            <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm mb-4"
          >
            <Stethoscope size={18} />
            Find Doctors in Odisha
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4"
          >
            Odisha <span className="text-blue-600">Doctor Directory</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Access a comprehensive list of healthcare professionals (Government & Private) across all 30 districts of Odisha. 
            Connect with specialized doctors instantly.
          </motion.p>
        </div>

        {/* Controls Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 mb-12 border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* District Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Map size={16} /> District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              >
                {ODISHA_DISTRICTS.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            {/* Doctor Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Filter size={16} /> Doctor Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              >
                {DOCTOR_TYPES.map(type => (
                  <option key={type} value={type}>{type === 'All' ? 'Private & Gov' : type}</option>
                ))}
              </select>
            </div>

            {/* Specialization Filter */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Filter size={16} /> Specialty
              </label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              >
                <option value="All">All Specialties</option>
                {SPECIALIZATIONS.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Search size={16} /> Search
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Doctor, hospital, specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pl-12 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-slate-500"
              >
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <p className="font-medium">Finding top doctors in {selectedDistrict}...</p>
              </motion.div>
            ) : filteredDoctors.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredDoctors.map((doctor, index) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl hover:border-blue-500/30 transition-all p-6 overflow-hidden relative"
                  >
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full group-hover:bg-blue-500/10 transition-colors" />

                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform relative">
                        <User size={32} />
                        <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter ${doctor.type === 'Government' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
                          {doctor.type}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                          {doctor.name}
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                          {doctor.specialization}
                        </p>
                        {doctor.hospital && (
                          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5 flex items-center gap-1">
                            <Stethoscope size={12} /> {doctor.hospital}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{doctor.rating}</span>
                          <span className="text-xs text-slate-400 ml-1">• {doctor.experience} Exp.</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-sm">
                        <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{doctor.location}, {doctor.district}</span>
                      </div>

                      <div className="pt-4 flex gap-3">
                        <a
                          href={`tel:${doctor.contact}`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                          <Phone size={18} />
                          Call Now
                        </a>
                        <button className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-all">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6">
                  <Search size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Doctors Found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  We couldn't find any doctors matching your search in {selectedDistrict}. 
                  Try adjusting your filters or search terms.
                </p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedSpecialization('All'); }}
                  className="mt-6 text-blue-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="mt-20 p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 text-center">
          <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">
            <strong>Disclaimer:</strong> This directory is for informational purposes. HealAI does not endorse specific doctors. 
            In case of medical emergencies, please visit the nearest hospital or call 108.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDirectory;
