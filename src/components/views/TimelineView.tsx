import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Sparkles,
  History,
  Heart,
  Star,
  ChevronDown,
  Calendar
} from 'lucide-react';
import type { DiaryEntry, Idol } from '../../types';
import { cn } from '../../lib/utils';

interface TimelineViewProps {
  entries: DiaryEntry[];
  idol: Idol;
  onClose: () => void;
}

export const TimelineView = ({ entries, idol, onClose }: TimelineViewProps) => {
  const [collapsedYears, setCollapsedYears] = useState<string[]>([]);

  const groupedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const groups: Record<string, DiaryEntry[]> = {};
    
    sorted.forEach(entry => {
      const year = entry.createdAt.split('-')[0];
      if (!groups[year]) groups[year] = [];
      groups[year].push(entry);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [entries]);

  const toggleYear = (year: string) => {
    setCollapsedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed inset-0 z-[300] bg-brand-cream flex flex-col"
    >
      <header className="p-4 flex items-center justify-between border-b border-pink-100/50 bg-white/80 backdrop-blur-md">
        <button onClick={onClose} className="p-2 text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="font-serif text-lg font-bold">时光轴</h2>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Memories Timeline</span>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto p-6 no-scrollbar relative pt-10">
        <div className="absolute left-6 top-10 bottom-10 w-px bg-slate-200" />
        
        <div className="space-y-12">
          {groupedEntries.map(([year, yearEntries], groupIdx) => (
            <div key={year} className="space-y-6">
              {/* Year Header */}
              <div className="relative pl-12">
                <button 
                  onClick={() => toggleYear(year)}
                  className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-pink-50 flex items-center gap-3 active:scale-95 transition-all"
                >
                  <Calendar className="w-4 h-4 text-pink-400" />
                  <span className="font-serif font-bold text-lg text-slate-800">{year} 年</span>
                  <ChevronDown className={cn("w-4 h-4 text-slate-300 transition-transform", collapsedYears.includes(year) && "-rotate-90")} />
                </button>
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white ring-4 ring-pink-100" />
              </div>

              <AnimatePresence>
                {!collapsedYears.includes(year) && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-8 overflow-hidden"
                  >
                    {yearEntries.map((entry, i) => (
                      <motion.div 
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative pl-12"
                      >
                        <div className="absolute left-[-2px] top-6 w-2 h-2 rounded-full bg-slate-200" />
                        <div className="glass p-5 rounded-[2rem] shadow-soft border-t border-white space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-400 font-bold">{entry.createdAt.replace(/-/g, '.')}</span>
                            <div className="flex items-center gap-1">
                              {entry.tags?.map(tag => (
                                <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full bg-pink-50 text-pink-400 font-bold">{tag}</span>
                              ))}
                              <Star className="w-3 h-3 text-pink-200" />
                            </div>
                          </div>

                          <p className="text-sm text-slate-600 leading-relaxed font-light">
                            {entry.content}
                          </p>

                          {entry.images.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                              {entry.images.map((img, idx) => (
                                <img key={idx} src={img} className="w-24 h-24 rounded-xl object-cover shadow-sm" alt="timeline" />
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              entry.mood === 'heart' ? 'bg-pink-400' : 'bg-slate-300'
                            )} />
                            <span className="text-[9px] text-slate-300 uppercase font-bold tracking-widest">{entry.mood} mood</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Start marker */}
          <div className="relative pl-12 pb-10">
            <div className="absolute left-[-4px] top-5 w-3 h-3 rounded-full bg-slate-800 ring-4 ring-slate-100" />
            <div className="bg-slate-800 p-4 rounded-2xl inline-block shadow-lg text-white">
                <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">时光起始</span>
                <h4 className="text-sm font-bold mt-1">{idol.entryDate} 与 {idol.name} 的故事开始了</h4>
            </div>
          </div>
          
          {entries.length === 0 && (
            <div className="pl-12 py-10 text-slate-300 italic text-sm">
              还没有任何记忆被记录在时光轴上...
            </div>
          )}
        </div>
      </main>
    </motion.div>
  );
};
