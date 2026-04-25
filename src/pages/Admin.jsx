import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Eye, 
  X,
  MapPin,
  FileText,
  Tag,
  ShieldAlert,
  LogOut,
  Paperclip,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { downloadReportFile, getReports, updateReportStatus } from '../services/api';
import { clearAuth } from '../utils/auth';

// --- HELPER COMPONENTS ---

const RiskBadge = ({ score }) => {
  if (score < 50) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">Past ({score})</span>;
  if (score < 80) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">O'rta ({score})</span>;
  return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">Yuqori ({score})</span>;
};

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'Qabul qilindi': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Qabul qilindi</span>;
    case 'Tekshirilmoqda': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 animate-pulse">Tekshirilmoqda</span>;
    case 'Hal qilindi': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Hal qilindi</span>;
    default: return null;
  }
};

// --- MAIN COMPONENT ---

export default function AdminPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  const [filters, setFilters] = useState({
    category: 'All',
    status: 'All',
    risk: 'All'
  });

  const normalizeReport = (report) => {
    const date = report.created_at ? new Date(report.created_at).toISOString().split('T')[0] : '';
    return {
      ...report,
      date,
      location: `${Number(report.lat).toFixed(4)}, ${Number(report.lng).toFixed(4)}`,
    };
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getReports(token);
        setReports(data.map(normalizeReport));
        setLoadError('');
      } catch (error) {
        console.error('Failed to load reports:', error);
        setLoadError("Murojaatlar yuklanmadi. Admin token yoki backendni tekshiring.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Derived Stats
  const todayDate = new Date().toISOString().split('T')[0];
  const totalReports = reports.length;
  const todayReports = reports.filter(r => r.date === todayDate).length;
  const highRiskReports = reports.filter(r => r.risk_score >= 80).length;
  const resolvedReports = reports.filter(r => r.status === 'Hal qilindi').length;

  // Filter Logic
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      let riskMatch = true;
      if (filters.risk === 'Low') riskMatch = r.risk_score < 50;
      if (filters.risk === 'Medium') riskMatch = r.risk_score >= 50 && r.risk_score < 80;
      if (filters.risk === 'High') riskMatch = r.risk_score >= 80;

      return (
        (filters.category === 'All' || r.category === filters.category) &&
        (filters.status === 'All' || r.status === filters.status) &&
        riskMatch
      );
    });
  }, [reports, filters]);

  // Actions
  const updateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const updatedReport = normalizeReport(await updateReportStatus(id, newStatus, token));
      setReports(prev => prev.map(r => r.id === id ? updatedReport : r));
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport(updatedReport);
      }
    } catch (error) {
      console.error('Failed to update report status:', error);
      setLoadError("Status yangilanmadi. Backend yoki admin tokenni tekshiring.");
    }
  };

  const handleDownloadFile = async (reportId, file) => {
    const token = localStorage.getItem('token');
    try {
      const blob = await downloadReportFile(reportId, file.id, token);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename || 'dalil';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download evidence:', error);
      setLoadError("Dalil faylini yuklab bo'lmadi.");
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <div className="flex-1 min-h-screen bg-[#0F172A] pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Admin Panel</h1>
            <p className="text-slate-400 mt-1 text-lg">Murojaatlarni boshqarish tizimi</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-colors border border-red-500/20"
          >
            <LogOut size={18} /> Tizimdan chiqish
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Jami Murojaatlar</p>
                <h3 className="text-4xl font-black text-white">{totalReports}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><BarChart3 size={24} /></div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Bugungi</p>
                <h3 className="text-4xl font-black text-white">{todayReports}</h3>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><Calendar size={24} /></div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Yuqori Risklar</p>
                <h3 className="text-4xl font-black text-red-400">{highRiskReports}</h3>
              </div>
              <div className="p-3 bg-red-500/10 rounded-xl text-red-400"><AlertTriangle size={24} /></div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 rounded-2xl border border-white/10 shadow-xl bg-white/5 backdrop-blur-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Hal qilinganlar</p>
                <h3 className="text-4xl font-black text-emerald-400">{resolvedReports}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><CheckCircle2 size={24} /></div>
            </div>
          </motion.div>
        </div>

        {/* FILTER BAR */}
        {loadError && (
          <div className="glass-panel rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-200">
            {loadError}
          </div>
        )}

        <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Filter size={18} /> <span className="font-medium">Filtrlar:</span>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select 
              className="bg-[#0F172A]/80 border border-white/10 text-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500/50 flex-1 md:flex-none"
              value={filters.category}
              onChange={e => setFilters({...filters, category: e.target.value})}
            >
              <option value="All">Barcha kategoriyalar</option>
              <option value="Ta'lim">Ta'lim</option>
              <option value="Tibbiyot">Tibbiyot</option>
              <option value="Boshqaruv">Boshqaruv</option>
              <option value="Sud-huquq">Sud-huquq</option>
              <option value="Moliya">Moliya</option>
              <option value="Bojxona">Bojxona</option>
              <option value="Transport">Transport</option>
            </select>

            <select 
              className="bg-[#0F172A]/80 border border-white/10 text-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500/50 flex-1 md:flex-none"
              value={filters.status}
              onChange={e => setFilters({...filters, status: e.target.value})}
            >
              <option value="All">Barcha statuslar</option>
              <option value="Qabul qilindi">Qabul qilindi</option>
              <option value="Tekshirilmoqda">Tekshirilmoqda</option>
              <option value="Hal qilindi">Hal qilindi</option>
            </select>

            <select 
              className="bg-[#0F172A]/80 border border-white/10 text-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500/50 flex-1 md:flex-none"
              value={filters.risk}
              onChange={e => setFilters({...filters, risk: e.target.value})}
            >
              <option value="All">Barcha risklar</option>
              <option value="High">Yuqori</option>
              <option value="Medium">O'rta</option>
              <option value="Low">Past</option>
            </select>
          </div>
        </div>

        {/* REPORT TABLE */}
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tashkilot nomi</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kategoriya</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Risk Score</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Dalillar</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sana</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">Murojaatlar yuklanmoqda...</td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">Murojaatlar topilmadi</td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4">
                        <p className="font-semibold text-white">{report.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin size={10} /> {report.location}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-300 bg-white/5 px-2 py-1 rounded-md border border-white/5">{report.category}</span>
                      </td>
                      <td className="p-4">
                        <RiskBadge score={report.risk_score} />
                      </td>
                      <td className="p-4">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold text-slate-300">
                          <Paperclip size={12} /> {report.files?.length || 0}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-400 whitespace-nowrap">
                        {report.date}
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <select 
                          value={report.status}
                          onChange={(e) => updateStatus(report.id, e.target.value)}
                          className="bg-[#0F172A] border border-white/10 text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500/50 cursor-pointer"
                        >
                          <option value="Qabul qilindi">Qabul qilindi</option>
                          <option value="Tekshirilmoqda">Tekshirilmoqda</option>
                          <option value="Hal qilindi">Hal qilindi</option>
                        </select>
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-panel bg-slate-900/90 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <ShieldAlert size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedReport.name}</h2>
                    <p className="text-sm text-slate-400">ID: #{selectedReport.id.toString().padStart(5, '0')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
                    <StatusBadge status={selectedReport.status} />
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Risk</p>
                    <RiskBadge score={selectedReport.risk_score} />
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Kategoriya</p>
                    <p className="text-sm font-semibold text-white flex items-center gap-1"><Tag size={14}/> {selectedReport.category}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sana</p>
                    <p className="text-sm font-semibold text-white flex items-center gap-1"><Calendar size={14}/> {selectedReport.date}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2"><FileText size={16}/> Muammo tavsifi</h3>
                    <div className="bg-[#0F172A]/50 rounded-2xl p-5 border border-white/5 text-slate-200 leading-relaxed">
                      {selectedReport.description}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2"><MapPin size={16}/> Joylashuv</h3>
                    <div className="bg-[#0F172A]/50 rounded-2xl p-4 border border-white/5 text-slate-200 font-medium">
                      {selectedReport.location}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2"><Paperclip size={16}/> Dalillar</h3>
                    <div className="bg-[#0F172A]/50 rounded-2xl p-4 border border-white/5">
                      {selectedReport.files?.length ? (
                        <div className="space-y-2">
                          {selectedReport.files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">{file.filename}</p>
                                <p className="text-xs text-slate-500">
                                  {file.content_type || 'file'} · {(Number(file.size || 0) / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                onClick={() => handleDownloadFile(selectedReport.id, file)}
                                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-300 transition-colors hover:bg-blue-500/20"
                              >
                                <Download size={14} /> Yuklab olish
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Dalil fayllari yuklanmagan.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
                  <button 
                    onClick={() => updateStatus(selectedReport.id, 'Hal qilindi')}
                    className="px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium rounded-xl transition-colors border border-emerald-500/20"
                  >
                    Hal qilindi deb belgilash
                  </button>
                  <button 
                    onClick={() => setSelectedReport(null)}
                    className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl transition-colors hover:bg-slate-200"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
