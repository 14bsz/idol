import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { 
  Download, 
  Share2, 
  X, 
  Sparkles,
  Camera,
  Heart
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DiaryEntry, Idol } from '../../types';

interface CardGeneratorProps {
  entry: DiaryEntry;
  idol: Idol;
  onClose: () => void;
}

const templates = [
  { id: 'minimal-korean', name: '韩系简约', bgColor: 'bg-white', textColor: 'text-slate-800' },
  { id: 'dreamy-gradient', name: '梦幻渐变', bgColor: 'bg-gradient-to-tr from-[#FFF5F7] via-[#FFF0F6] to-[#F0F7FF]', textColor: 'text-slate-700' },
  { id: 'vintage-paper', name: '复古报刊', bgColor: 'bg-[#f4f1ea]', textColor: 'text-[#4a4a4a]' },
  { id: 'dark-idol', name: '酷飒黑金', bgColor: 'bg-slate-900', textColor: 'text-white' },
];

export const CardGenerator = ({ entry, idol, onClose }: CardGeneratorProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `idol-time-${entry.id}.png`;
      link.href = dataUrl;
      link.click();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-[1000] flex flex-col items-center justify-center p-6 backdrop-blur-md"
    >
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-sm space-y-4">
        <div className="flex justify-end pr-2">
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all backdrop-blur-xl border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Preview Container */}
        <div className="relative group">
          <div 
             ref={cardRef}
             className={cn(
               "aspect-[3/4] w-full rounded-[2rem] p-8 shadow-2xl flex flex-col justify-between overflow-hidden relative",
               selectedTemplate.bgColor,
               selectedTemplate.textColor
             )}
          >
            {/* Header */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden shadow-sm">
                   <img src={idol.avatar} className="w-full h-full object-cover" alt="idol" />
                </div>
                <div>
                   <span className="text-[10px] block opacity-60 tracking-widest font-bold">WITH</span>
                   <span className="text-xs font-serif font-bold italic tracking-tight">{idol.name}</span>
                </div>
              </div>
              <Sparkles className="w-5 h-5 opacity-40" />
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col justify-center py-6 z-10">
               {entry.images[0] && (
                 <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-lg">
                    <img src={entry.images[0]} className="w-full h-full object-cover" alt="diary" />
                 </div>
               )}
               <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-current opacity-10" />
                    <Heart className="w-3 h-3 opacity-40 fill-current" />
                    <div className="h-px flex-1 bg-current opacity-10" />
                  </div>
                  <p className={cn(
                    "text-center italic leading-loose",
                    entry.template === 'serif' ? 'font-serif text-lg' : 'text-sm font-medium'
                  )}>
                    "{entry.content.slice(0, 80)}{entry.content.length > 80 ? '...' : ''}"
                  </p>
               </div>
            </div>

            {/* Footer */}
            <div className="text-center space-y-1 z-10">
              <div className="text-[10px] font-mono tracking-widest opacity-40">
                {new Date(entry.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}
              </div>
              <div className="text-[8px] tracking-[0.2em] font-black opacity-30 mt-2">
                IDOL TIME DIARY • MEMORY CARD
              </div>
            </div>
            
            {/* Decorative Background Elements */}
            {selectedTemplate.id === 'minimal-korean' && (
               <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/30 rounded-full blur-3xl -translate-y-10 translate-x-10" />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
             {templates.map((t) => (
               <button
                 key={t.id}
                 onClick={() => setSelectedTemplate(t)}
                 className={cn(
                   "whitespace-nowrap px-4 py-2 rounded-2xl text-[10px] font-bold transition-all border",
                   selectedTemplate.id === t.id ? "bg-white text-slate-800 border-white shadow-lg scale-105" : "bg-white/10 text-white/60 border-white/10"
                 )}
               >
                 {t.name}
               </button>
             ))}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex-1 bg-white text-slate-800 py-4 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform disabled:opacity-50"
            >
              {isGenerating ? "生成中..." : (
                <>
                  <Download className="w-5 h-5" />
                  保存到相册
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-12 px-6 py-3 bg-white rounded-full shadow-2xl flex items-center gap-3"
          >
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-green-500" />
            </div>
            <span className="text-xs font-bold text-slate-700">卡片已成功保存到相册 ✨</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
