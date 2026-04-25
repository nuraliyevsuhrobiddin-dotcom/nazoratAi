import { useEffect, useState } from 'react';
import { getPlaces } from '../services/api';
import MapComponent from '../components/Map';
import SidePanel from '../components/SidePanel';
import LiveStatsPanel from '../components/LiveStatsPanel';
import { Loader2, AlertCircle, MapPin, Flame, Plus } from 'lucide-react';
import { cn } from '../utils/cn';

const normalizeReport = (report) => {
  const riskScore = report.risk_score ?? report.score ?? 0;

  return {
    ...report,
    risk_score: riskScore,
    score: riskScore,
    date: report.date ?? new Date().toISOString(),
  };
};

const createFakeReport = () => {
  const categories = ['Boshqaruv', 'Sud-huquq', 'Moliya', 'Bojxona', "Ta'lim", 'Tibbiyot'];
  const names = [
    'Yangi monitoring hududi',
    'Tezkor murojaat nuqtasi',
    'AI tekshiruv signali',
    'Fuqarolar xabari markazi',
  ];
  const riskScore = Math.floor(Math.random() * 101);
  const category = categories[Math.floor(Math.random() * categories.length)];

  return normalizeReport({
    id: Date.now(),
    name: `${names[Math.floor(Math.random() * names.length)]} #${Math.floor(Math.random() * 900 + 100)}`,
    category,
    risk_score: riskScore,
    complaints: Math.floor(Math.random() * 20) + 1,
    date: new Date().toISOString(),
    lat: 41.311081 + (Math.random() - 0.5) * 0.16,
    lng: 69.240562 + (Math.random() - 0.5) * 0.16,
    issue: 'Test rejimida qo‘shilgan soxta murojaat',
    status: 'Qabul qilindi',
    trust_score: Math.floor(Math.random() * 60) + 40,
    ai_explanation: 'Real-time statistika yangilanishini tekshirish uchun vaqtinchalik test ma’lumoti.',
  });
};

export default function MapPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [viewMode, setViewMode] = useState('markers'); // 'markers' or 'heatmap'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPlaces();
        setReports(data.map(normalizeReport));
      } catch {
        setError('Ma\'lumotlarni yuklashda xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0F172A] pt-[72px]">
      
      {/* View Mode Toggle */}
      <div className="absolute top-24 right-4 md:right-1/2 md:translate-x-1/2 z-40 glass-panel rounded-full p-1 flex items-center border border-white/10 shadow-xl pointer-events-auto">
        <button
          onClick={() => setViewMode('markers')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
            viewMode === 'markers' 
              ? "bg-white text-slate-900 shadow-md" 
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <MapPin size={16} /> <span className="hidden sm:inline">Markerlar</span>
        </button>
        <button
          onClick={() => setViewMode('heatmap')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
            viewMode === 'heatmap' 
              ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md shadow-red-500/30" 
              : "text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Flame size={16} /> <span className="hidden sm:inline">Issiqlik xaritasi</span>
        </button>
      </div>

      <button
        onClick={() => setReports((currentReports) => [createFakeReport(), ...currentReports])}
        className="absolute top-40 right-4 z-40 flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/15 px-4 py-2 text-sm font-bold text-green-200 shadow-xl backdrop-blur-md transition-all hover:bg-green-500/25 active:scale-95 md:top-52"
      >
        <Plus size={16} />
        Add fake report
      </button>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0F172A]/80 backdrop-blur-md">
          <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
          <p className="text-slate-300 font-medium">Xarita ma'lumotlari yuklanmoqda...</p>
        </div>
      )}

      {/* Error Overlay */}
      {error && !loading && (
        <div className="absolute top-36 left-1/2 -translate-x-1/2 z-50 glass-panel border-red-500/30 px-6 py-4 rounded-2xl flex items-center gap-3 text-red-200">
          <AlertCircle size={20} className="text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <LiveStatsPanel reports={reports} />

      <MapComponent 
        places={reports} 
        onMarkerClick={(place) => setSelectedPlace(place)} 
        viewMode={viewMode}
      />

      <SidePanel 
        place={selectedPlace} 
        onClose={() => setSelectedPlace(null)} 
      />
    </div>
  );
}
