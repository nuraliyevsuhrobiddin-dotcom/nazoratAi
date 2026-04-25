import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Users, Info, ShieldCheck, Tag, Target, Bot, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { jsPDF } from 'jspdf';

export default function SidePanel({ place, onClose }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      // Small delay for animation feedback
      await new Promise(resolve => setTimeout(resolve, 600));

      const doc = new jsPDF();
      
      const primaryColor = [15, 23, 42]; 
      const secondaryColor = [100, 116, 139]; 
      
      // Header Background
      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, 210, 40, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("Nazorat AI Hisobot", 105, 25, { align: "center" });

      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      
      // Meta Information
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Tashkilot nomi: ${place.name}`, 20, 55);
      doc.text(`ID: ${place.id.toString().padStart(6, '0')}`, 20, 62);
      doc.text(`Sana: ${new Date().toLocaleDateString('uz-UZ')}`, 20, 69);
      
      // Divider
      doc.setDrawColor(226, 232, 240); 
      doc.setLineWidth(0.5);
      doc.line(20, 75, 190, 75);
      
      let currentY = 85;
      
      const addSectionTitle = (title, y) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(title, 20, y);
        return y + 8;
      };

      // SECTION 1: Risk Summary
      currentY = addSectionTitle("1. Risk Summary", currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      const riskLevel = place.score < 50 ? 'Past' : place.score < 80 ? "O'rta" : 'Yuqori';
      doc.text(`Risk score: ${place.score}`, 20, currentY);
      doc.text(`Risk level: ${riskLevel}`, 20, currentY + 6);
      
      currentY += 16;
      
      // SECTION 2: Statistikalar
      currentY = addSectionTitle("2. Statistikalar", currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`Ishonch indeksi: ${place.trust_score}%`, 20, currentY);
      doc.text(`Murojaatlar soni: ${place.complaints}`, 20, currentY + 6);
      
      currentY += 16;
      
      // SECTION 3: AI Xulosa
      currentY = addSectionTitle("3. AI Xulosa", currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      const splitAiText = doc.splitTextToSize(place.ai_explanation || '', 170);
      doc.text(splitAiText, 20, currentY);
      currentY += (splitAiText.length * 5) + 10;
      
      // SECTION 4: So'nggi muammo
      currentY = addSectionTitle("4. So'nggi muammo", currentY);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      const splitIssue = doc.splitTextToSize(`"${place.issue || ''}"`, 170);
      doc.text(splitIssue, 20, currentY);
      currentY += (splitIssue.length * 5) + 10;
      
      // SECTION 5: Xulosa
      currentY = addSectionTitle("5. Xulosa", currentY);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Mazkur hudud monitoringga olindi va tekshiruv tavsiya etiladi", 20, currentY);
      
      // Footer
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184); 
      doc.text("Nazorat AI Avtomatlashtirilgan Tizimi", 105, 285, { align: "center" });

      doc.save("nazorat-ai-hisobot.pdf");
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };
  const getRiskDetails = (score) => {
    if (score < 50) return { label: 'Past xavf', color: 'text-green-400', bg: 'bg-green-500', border: 'border-green-500/30' };
    if (score < 80) return { label: 'O\'rta xavf', color: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500/30' };
    return { label: 'Yuqori xavf', color: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500/30' };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Qabul qilindi': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'Tekshirilmoqda': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'Hal qilindi': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <AnimatePresence>
      {place && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-24 right-4 md:right-8 z-50 w-[calc(100%-2rem)] md:w-[400px] glass-panel rounded-3xl shadow-2xl border border-white/10 flex flex-col max-h-[calc(100vh-8rem)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-white/5 relative shrink-0">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-slate-400 z-10"
              >
                <X size={18} />
              </button>
              <div className="pr-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border", getStatusColor(place.status))}>
                    {place.status}
                  </span>
                  <span className="text-slate-400 text-xs flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                    <Tag size={12} /> {place.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1 leading-tight">{place.name}</h2>
                <p className="text-slate-400 text-sm flex items-center gap-1">
                  <Info size={14} /> ID: {place.id.toString().padStart(6, '0')}
                </p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="flex items-end gap-4 mb-8">
                <div className="text-7xl font-black tracking-tighter text-white drop-shadow-lg">
                  {place.score}
                </div>
                <div className="pb-2">
                  <div className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Xavf darajasi</div>
                  <div className={cn("px-3 py-1.5 rounded-lg text-sm font-bold border", getRiskDetails(place.score).color, getRiskDetails(place.score).border, "bg-white/5 shadow-inner")}>
                    {getRiskDetails(place.score).label}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Korrupsiya indeksi ko'rsatkichi</span>
                    <span className="text-white font-bold">{place.score}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#0F172A]/80 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${place.score}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={cn("h-full rounded-full", getRiskDetails(place.score).bg)}
                    />
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0F172A]/60 rounded-2xl p-4 border border-white/5 shadow-lg">
                    <Target className="text-blue-400 mb-2" size={24} />
                    <div className="text-xs text-slate-400 mb-1 font-medium">Ishonch indeksi</div>
                    <div className="text-xl font-bold text-white">{place.trust_score}%</div>
                  </div>
                  <div className="bg-[#0F172A]/60 rounded-2xl p-4 border border-white/5 shadow-lg">
                    <Users className="text-purple-400 mb-2" size={24} />
                    <div className="text-xs text-slate-400 mb-1 font-medium">Murojaatlar</div>
                    <div className="text-xl font-bold text-white">{place.complaints} ta</div>
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot size={16} className="text-blue-400" />
                    <span className="text-sm font-bold text-blue-400">AI Xulosasi</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {place.ai_explanation}
                  </p>
                </div>

                {/* Issue Details */}
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-orange-400" /> So'nggi qayd etilgan muammo
                  </h3>
                  <div className="bg-[#0F172A]/40 rounded-xl p-4 border border-white/5 text-sm text-slate-300 italic">
                    "{place.issue}"
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-white/5 shrink-0 bg-[#0F172A]/50">
              <button 
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Hisobot tayyorlanmoqda...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> To'liq hisobotni yuklab olish
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
