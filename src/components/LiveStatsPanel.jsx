import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Layers, Sparkles } from 'lucide-react';

const isToday = (date) => {
  if (!date) return false;

  const reportDate = new Date(date);
  if (Number.isNaN(reportDate.getTime())) return false;

  const today = new Date();
  return (
    reportDate.getFullYear() === today.getFullYear() &&
    reportDate.getMonth() === today.getMonth() &&
    reportDate.getDate() === today.getDate()
  );
};

const getRiskScore = (report) => report.risk_score ?? report.score ?? 0;

export default function LiveStatsPanel({ reports = [] }) {
  const stats = useMemo(() => {
    const todayReports = reports.filter((report) => isToday(report.date));

    const mostDangerous = reports.reduce((currentHighest, report) => {
      if (!currentHighest) return report;
      return getRiskScore(report) > getRiskScore(currentHighest) ? report : currentHighest;
    }, null);

    const categoryCounts = reports.reduce((acc, report) => {
      if (!report.category) return acc;
      acc[report.category] = (acc[report.category] || 0) + 1;
      return acc;
    }, {});

    const topCategory = Object.entries(categoryCounts).reduce(
      (currentTop, [category, count]) => (
        count > currentTop.count ? { category, count } : currentTop
      ),
      { category: "Yo'q", count: 0 }
    );

    return {
      todayReportsCount: todayReports.length,
      mostDangerous,
      topCategory: topCategory.category,
    };
  }, [reports]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="absolute top-24 left-4 z-40 hidden md:flex flex-col gap-3 pointer-events-none"
    >
      <div className="glass-panel p-4 rounded-2xl w-64 border border-blue-500/20 shadow-xl pointer-events-auto">
        <div className="flex items-center gap-3 text-blue-300">
          <Sparkles size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">AI real-time analiz natijalari</span>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl w-64 border border-white/10 shadow-xl pointer-events-auto">
        <div className="flex items-center gap-3 mb-1 text-slate-400">
          <Activity size={16} className="text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">Bugungi Murojaatlar</span>
        </div>
        <motion.div
          key={stats.todayReportsCount}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white"
        >
          {stats.todayReportsCount} ta
        </motion.div>
      </div>

      <div className="glass-panel p-4 rounded-2xl w-64 border border-white/10 shadow-xl pointer-events-auto">
        <div className="flex items-center gap-3 mb-1 text-slate-400">
          <AlertTriangle size={16} className="text-red-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">Eng Xavfli Hudud</span>
        </div>
        <div className="text-lg font-bold text-white truncate">
          {stats.mostDangerous ? stats.mostDangerous.name : "Aniqlanmoqda"}
        </div>
        <motion.div
          key={stats.mostDangerous?.id ?? 'empty'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold text-red-400"
        >
          Risk: {stats.mostDangerous ? getRiskScore(stats.mostDangerous) : 0}/100
        </motion.div>
      </div>

      <div className="glass-panel p-4 rounded-2xl w-64 border border-white/10 shadow-xl pointer-events-auto">
        <div className="flex items-center gap-3 mb-1 text-slate-400">
          <Layers size={16} className="text-purple-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">Eng Ko'p Kategoriya</span>
        </div>
        <motion.div
          key={stats.topCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold text-white"
        >
          {stats.topCategory}
        </motion.div>
      </div>
    </motion.div>
  );
}
