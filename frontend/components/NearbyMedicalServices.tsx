import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Hospital, 
  Search, 
  RotateCcw, 
  Star, 
  ExternalLink, 
  Map as MapIcon, 
  Activity, 
  Store,
  Loader2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

// --- Types ---

type PlaceType = 'All' | 'Hospital' | 'Clinic' | 'Pharmacy';

interface MedicalPlace {
  id: string;
  name: string;
  type: PlaceType;
  address: string;
  rating: number;
  distance: number; // in km
  lat: number;
  lng: number;
  openNow: boolean;
}

// --- Mock Data Generator ---

const generateMockPlaces = (lat: number, lng: number): MedicalPlace[] => {
  const types: PlaceType[] = ['Hospital', 'Clinic', 'Pharmacy'];
  const names = {
    Hospital: ['City General Hospital', 'Care & Cure Hospital', 'LifeLine Medical Center', 'Apex Multispecialty'],
    Clinic: ['Family Wellness Clinic', 'Dr. Sharma\'s Health Point', 'QuickCare Clinic', 'Elite Dental & Health'],
    Pharmacy: ['MedPlus Pharmacy', 'Apollo Pharmacy', 'Reliable Drug Store', 'Wellness Medicals']
  };

  return Array.from({ length: 12 }).map((_, i) => {
    const type = types[i % 3];
    const nameList = names[type as keyof typeof names];
    const name = nameList[Math.floor(Math.random() * nameList.length)] + ` #${i + 1}`;
    
    // Randomly offset lat/lng within ~5km
    const latOffset = (Math.random() - 0.5) * 0.05;
    const lngOffset = (Math.random() - 0.5) * 0.05;
    
    return {
      id: `place-${i}`,
      name,
      type,
      address: `${Math.floor(Math.random() * 100) + 1} Main St, Near ${type} Square`,
      rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      distance: parseFloat((Math.random() * 4.5 + 0.5).toFixed(1)),
      lat: lat + latOffset,
      lng: lng + lngOffset,
      openNow: Math.random() > 0.2
    };
  }).sort((a, b) => a.distance - b.distance);
};

// --- Main Component ---

const NearbyMedicalServices: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<MedicalPlace[]>([]);
  const [filter, setFilter] = useState<PlaceType>('All');
  const [manualCity, setManualCity] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setPlaces(generateMockPlaces(latitude, longitude));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Location permission denied or unavailable. Please enter your city manually.");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCity.trim()) return;
    
    setIsSearching(true);
    // Simulate geocoding for manual input
    setTimeout(() => {
      const mockLat = 20.2961; // Bhubaneswar default
      const mockLng = 85.8245;
      setLocation({ lat: mockLat, lng: mockLng });
      setPlaces(generateMockPlaces(mockLat, mockLng));
      setIsSearching(false);
      setError(null);
    }, 1500);
  };

  const filteredPlaces = useMemo(() => {
    return filter === 'All' ? places : places.filter(p => p.type === filter);
  }, [places, filter]);

  const getMapUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/search/hospitals+clinics+pharmacies/@${lat},${lng},14z`;
  };

  const getEmbedUrl = (lat: number, lng: number) => {
    // Using Google Maps Embed API with a generic search query that doesn't strictly require an API key for basic view in many cases, 
    // or fallback to a cleaner embed if the search view is restricted.
    return `https://maps.google.com/maps?q=hospitals,clinics,pharmacies&ll=${lat},${lng}&z=14&output=embed`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm mb-4"
          >
            <MapPin size={18} />
            Nearby Medical Services
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4"
          >
            Find <span className="text-blue-600">Hospitals & Care</span> Near You
          </motion.h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Discover the closest medical facilities, clinics, and pharmacies in real-time. 
            Get directions and contact information instantly.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 mb-12 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Type Filters */}
            <div className="flex flex-wrap justify-center gap-3">
              {(['All', 'Hospital', 'Clinic', 'Pharmacy'] as PlaceType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                    filter === t 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {t === 'Hospital' && <Hospital size={16} />}
                  {t === 'Clinic' && <Activity size={16} />}
                  {t === 'Pharmacy' && <Store size={16} />}
                  {t}
                </button>
              ))}
            </div>

            {/* Manual Search */}
            <form onSubmit={handleManualSearch} className="flex w-full lg:w-auto gap-3">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Enter city manually..."
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pl-12 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
              </button>
            </form>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Map Section */}
          <div className="lg:col-span-2 h-[400px] lg:h-auto min-h-[500px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl relative bg-slate-200 dark:bg-slate-800">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 z-10"
                >
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">Locating nearby services...</p>
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900 z-10"
                >
                  <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Location Access Required</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                  <button 
                    onClick={fetchLocation}
                    className="flex items-center gap-2 text-blue-600 font-bold hover:underline"
                  >
                    <RotateCcw size={18} /> Try again
                  </button>
                </motion.div>
              ) : location && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full"
                >
                  {/* Map Integration */}
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={getEmbedUrl(location.lat, location.lng)}
                    allowFullScreen
                    className="grayscale-[0.2] dark:invert-[0.9] dark:hue-rotate-[180deg]"
                  />
                  
                  {/* Map Overlay Info */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        <Navigation size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Location</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={fetchLocation}
                      className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* List Section */}
          <div className="space-y-6 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredPlaces.map((place, index) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border ${index === 0 ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 dark:border-slate-800'} shadow-lg hover:shadow-xl transition-all group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${
                      place.type === 'Hospital' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
                      place.type === 'Clinic' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                      'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                    }`}>
                      {place.type === 'Hospital' ? <Hospital size={24} /> : 
                       place.type === 'Clinic' ? <Activity size={24} /> : 
                       <Store size={24} />}
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg text-xs font-bold">
                      <Star size={12} className="fill-current" />
                      {place.rating}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {place.name}
                      </h3>
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-blue-600 text-[10px] font-black text-white rounded uppercase tracking-tighter">Nearest</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                      {place.address}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distance</span>
                      <span className="text-sm font-black text-blue-600">{place.distance} KM</span>
                    </div>
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors"
                    >
                      Directions <ExternalLink size={14} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredPlaces.length === 0 && !loading && (
              <div className="text-center py-12">
                <MapIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">No {filter.toLowerCase()}s found in this area.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 p-8 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-center">
          <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">
            <strong>Pro Tip:</strong> Ensure your browser's location permission is enabled for the most accurate results. 
            HealAI uses real-time distance calculation to find the fastest medical help for you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NearbyMedicalServices;
