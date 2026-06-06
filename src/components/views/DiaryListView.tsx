import { motion } from 'motion/react';
import { 
  Plus, 
  Sparkles,
  Heart,
  Share2,
  MoreHorizontal,
  Image as ImageIcon
} from 'lucide-react';
import type { DiaryEntry } from '../../types';

interface DiaryListViewProps {
  entries: DiaryEntry[];
  onAddEntry: () => void;
  onEntryClick: (entry: DiaryEntry) => void;
  onShare: (entry: DiaryEntry) => void;
}

export const DiaryListView = ({ entries, onAddEntry, onEntryClick, onShare }: DiaryListViewProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-6 pb-24"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight">时光日记</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Diary of starlight</p>
        </div>
        <button 
          onClick={onAddEntry}
          className="w-12 h-12 rounded-full bg-pink-400 text-white flex items-center justify-center shadow-lg hover:bg-pink-500 transition-all hover:scale-110 active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-8 relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-10 bottom-0 w-px bg-gradient-to-b from-pink-200 via-lavender-200 to-transparent" />

        {entries.map((entry, i) => (
          <motion.div 
            key={entry.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="pl-12 relative"
          >
            {/* Timeline Dot */}
            <div className="absolute left-[21px] top-1 w-[6px] h-[6px] rounded-full bg-white ring-4 ring-pink-100 z-10" />
            
            <div className="glass p-5 rounded-3xl shadow-soft space-y-4 border-t border-white/40 transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{entry.createdAt.replace(/-/g, '.')}</span>
                  <div className="w-1 H-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {entry.mood === 'heart' ? '心动' : 
                     entry.mood === 'excited' ? '狂喜' : 
                     entry.mood === 'healing' ? '治愈' : 
                     entry.mood === 'missing' ? '想念' : '破防'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => onShare(entry)} className="text-slate-400 hover:text-pink-400 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div onClick={() => onEntryClick(entry)} className="cursor-pointer space-y-4">
                <p className="text-sm text-slate-700 leading-relaxed font-light">
                  {entry.content}
                </p>
                
                {entry.images.length > 0 && (
                  <div className={cn(
                    "grid gap-2 overflow-hidden",
                    entry.images.length === 1 ? "grid-cols-1 h-48" : 
                    entry.images.length === 2 ? "grid-cols-2 h-32" : "grid-cols-3 h-24"
                  )}>
                    {entry.images.slice(0, 3).map((img, idx) => (
                      <div key={idx} className="relative group overflow-hidden rounded-xl">
                        <img 
                          src={img} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          alt="diary content" 
                        />
                        {idx === 2 && entry.images.length > 3 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-sm">
                            +{entry.images.length - 3}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                 <div className="flex -space-x-1">
                    <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center ring-2 ring-white">
                      <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                    </div>
                 </div>
                 <span className="text-[10px] text-slate-400">Recorded with love</span>
              </div>
            </div>
          </motion.div>
        ))}
        
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm italic">还没有写明日记哦，快来记录心动瞬间吧 ✨</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
