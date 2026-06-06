import { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Heart, 
  Sparkles, 
  Calendar,
  MessageSquareHeart,
  ChevronLeft,
  ImageIcon,
  Share2,
  PenTool,
  Quote
} from 'lucide-react';
import type { DiaryEntry, Idol, CollectionItem } from '../../types';
import { cn } from '../../lib/utils';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { DAILY_QUOTES } from '../../types';

interface ReportViewProps {
  entries: DiaryEntry[];
  collections: CollectionItem[];
  currentIdol: Idol;
  onClose: () => void;
}

export const ReportView = ({ entries, collections, currentIdol, onClose }: ReportViewProps) => {
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const monthlyEntries = entries.filter(e => {
      const date = parseISO(e.createdAt);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    const monthlyCollections = collections.filter(c => {
      const date = parseISO(c.createdAt);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    // Mood calc
    const moodCounts = monthlyEntries.reduce((acc, e) => {
      acc[e.mood] = (acc[e.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

    // Tags calc
    const tagCounts = monthlyEntries.reduce((acc, e) => {
      (e.tags || []).forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(t => t[0]);

    // Active days calc
    const activeDaysSet = new Set([
      ...monthlyEntries.map(e => format(parseISO(e.createdAt), 'yyyy-MM-dd')),
      ...monthlyCollections.map(c => format(parseISO(c.createdAt), 'yyyy-MM-dd'))
    ]);

    // Words count
    const wordsCount = monthlyEntries.reduce((acc, e) => acc + (e.content?.length || 0), 0);

    // Best moments images
    const allImages = [
      ...monthlyEntries.flatMap(e => e.images),
      ...monthlyCollections.map(c => c.imageUrl)
    ].filter(Boolean);
    // shuffle and pick 2
    const bestMoments = allImages.sort(() => 0.5 - Math.random()).slice(0, 2);

    const randomQuote = DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)];

    return {
      count: monthlyEntries.length,
      collectionCount: monthlyCollections.length,
      imageCount: allImages.length,
      topMood: topMood ? topMood[0] : 'heart',
      topTags: topTags.length > 0 ? topTags : ['心动', '日常'],
      activeDays: activeDaysSet.size,
      wordsCount,
      bestMoments,
      monthName: format(now, 'MMMM'),
      quote: randomQuote
    };
  }, [entries, collections]);

  const getMoodConfig = (mood: string) => {
    switch(mood) {
      case 'heart': return { text: '满怀心动', emoji: '🥰', color: 'text-pink-500', bg: 'bg-pink-100/50' };
      case 'crying': return { text: '泪目感动', emoji: '😭', color: 'text-blue-500', bg: 'bg-blue-100/50' };
      case 'healing': return { text: '治愈温暖', emoji: '✨', color: 'text-amber-500', bg: 'bg-amber-100/50' };
      case 'excited': return { text: '狂喜不断', emoji: '🎉', color: 'text-rose-500', bg: 'bg-rose-100/50' };
      case 'missing': return { text: '深情想念', emoji: '🥺', color: 'text-purple-500', bg: 'bg-purple-100/50' };
      default: return { text: '满怀心动', emoji: '🥰', color: 'text-pink-500', bg: 'bg-pink-100/50' };
    }
  };

  const moodConfig = getMoodConfig(stats.topMood);


  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[300] bg-brand-cream flex flex-col"
    >
      <header className="p-4 flex items-center justify-between bg-white/60 backdrop-blur-md sticky top-0 z-50 border-b border-pink-100/30">
        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="font-serif text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">追星月报</h2>
        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-24">
        {/* Bento Grid Container */}
        <div className="grid grid-cols-2 gap-4 auto-rows-[minmax(100px,auto)]">
          
          {/* Main Hero Card (span 2 cols) */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="col-span-2 bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-soft border border-pink-100/80 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-50" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full border-4 border-white shadow-md overflow-hidden shrink-0">
                  <img src={currentIdol.avatar} className="w-full h-full object-cover" alt={currentIdol.name} />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-slate-800">{stats.monthName} 总结</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">WITH {currentIdol.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-pink-50/50 p-3 rounded-2xl text-center">
                  <div className="text-xl font-bold text-slate-700">{stats.activeDays}</div>
                  <div className="text-[10px] text-slate-400 mt-1">活跃天数</div>
                </div>
                <div className="bg-pink-50/50 p-3 rounded-2xl text-center">
                  <div className="text-xl font-bold text-slate-700">{stats.count}</div>
                  <div className="text-[10px] text-slate-400 mt-1">日记篇数</div>
                </div>
                <div className="bg-pink-50/50 p-3 rounded-2xl text-center">
                  <div className="text-xl font-bold text-slate-700">{stats.collectionCount}</div>
                  <div className="text-[10px] text-slate-400 mt-1">物料收藏</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mood Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={cn("col-span-1 rounded-[2rem] p-5 shadow-soft border border-white/50 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden", moodConfig.bg)}
          >
            <div className="text-4xl animate-bounce">{moodConfig.emoji}</div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">主打情绪</div>
              <div className={cn("text-lg font-bold", moodConfig.color)}>{moodConfig.text}</div>
            </div>
          </motion.div>

          {/* Tags Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="col-span-1 bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 shadow-soft border border-pink-100/80 flex flex-col justify-center"
          >
            <div className="text-[10px] font-bold text-purple-500 mb-3 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 高频词汇
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.topTags.map((tag, i) => (
                <span key={tag} className={cn(
                  "px-2 py-1.5 rounded-xl text-xs font-bold",
                  i === 0 ? "bg-pink-100/50 text-pink-600" : "bg-purple-50/50 text-purple-500"
                )}>
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Best Moments (span 2 cols) */}
          {stats.bestMoments.length > 0 && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="col-span-2 bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 shadow-soft border border-pink-100/80"
            >
              <div className="flex justify-between items-end mb-4">
                <div className="text-[10px] font-bold text-purple-500 uppercase tracking-widest flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> 最佳瞬间
                </div>
                <div className="text-[10px] text-purple-400/80">{stats.imageCount} 张相片</div>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x">
                {stats.bestMoments.map((img, idx) => (
                  <div key={idx} className="w-40 h-40 shrink-0 rounded-2xl overflow-hidden snap-center relative shadow-sm border border-white/50">
                    <img src={img} alt="Moment" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent mix-blend-overlay" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Words Count Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="col-span-2 bg-gradient-to-br from-pink-500 to-purple-500 rounded-[2rem] p-6 text-white shadow-soft relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20 mix-blend-overlay">
              <PenTool className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col gap-2">
              <div className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-100">
                {stats.wordsCount} <span className="text-sm font-sans text-white/90">字</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed max-w-[80%]">
                这个月，你用文字记录下了这么多关于 {currentIdol.name} 的点点滴滴。
              </p>
            </div>
          </motion.div>

          {/* Quote Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="col-span-2 bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 border border-pink-100/80 shadow-soft flex flex-col justify-center"
          >
            <Quote className="w-6 h-6 text-pink-400 mb-4" />
            <p className="text-[15px] text-slate-700 font-serif leading-loose italic text-justify">
              {stats.quote}
            </p>
          </motion.div>

        </div>
      </main>
    </motion.div>
  );
};
