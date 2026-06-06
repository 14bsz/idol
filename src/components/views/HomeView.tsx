import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Plus, 
  ChevronRight,
  TrendingUp,
  Clock,
  Quote,
  X,
  Camera
} from 'lucide-react';
import { differenceInDays, parseISO, format, addYears, isAfter, startOfDay } from 'date-fns';
import type { Idol } from '../../types';
import { cn } from '../../lib/utils';

interface HomeViewProps {
  currentIdol: Idol;
  onAddIdol: () => void;
  onAnniversaryClick: () => void;
  onUpdateBanner: (bannerImage: string) => void;
  diaryCount?: number;
}

export const HomeView = ({ currentIdol, onAddIdol, onAnniversaryClick, onUpdateBanner, diaryCount = 0 }: HomeViewProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];

  const handleBannerClick = () => {
    setShowMenu(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onUpdateBanner(result);
      };
      reader.readAsDataURL(file);
    }
    setShowMenu(false);
  };

  const handleChangeBanner = () => {
    fileInputRef?.click();
  };

  const stats = useMemo(() => {
    const entryDate = parseISO(currentIdol.entryDate);
    const today = startOfDay(new Date());
    const daysInLove = Math.max(0, differenceInDays(today, entryDate));
    return { daysInLove };
  }, [currentIdol.entryDate]);

  const anniversaries = useMemo(() => {
    const today = startOfDay(new Date());
    const currentYear = today.getFullYear();
    
    const getNextDate = (dateStr: string) => {
      const monthDay = dateStr.slice(5);
      let targetDate = parseISO(`${currentYear}-${monthDay}`);
      if (isAfter(today, targetDate)) {
        targetDate = addYears(targetDate, 1);
      }
      return targetDate;
    };

    const nextBirthday = getNextDate(currentIdol.birthday);
    const nextDebut = getNextDate(currentIdol.debutDate);

    const all = [
      { title: `${currentIdol.name}生日`, date: nextBirthday, label: format(nextBirthday, 'MM.dd'), color: "bg-pink-300" },
      { title: "出道纪念日", date: nextDebut, label: format(nextDebut, 'MM.dd'), color: "bg-lavender-300" }
    ].sort((a, b) => a.date.getTime() - b.date.getTime())
     .map(item => ({
       ...item,
       days: differenceInDays(item.date, today)
     }));

    return all;
  }, [currentIdol]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6 pb-24"
    >
      <div className="relative h-72 rounded-3xl overflow-hidden shadow-soft group">
        <img 
          src={currentIdol.bannerImage || "https://picsum.photos/1000/500?random=15"} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt="banner"
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent cursor-pointer"
          onClick={handleBannerClick}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-bold">点击管理</span>
            </div>
          </div>
        </div>
        <input 
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <AnimatePresence>
          {showMenu && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 z-10"
                onClick={() => setShowMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-64"
              >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-pink-50">
                    <h3 className="font-bold text-slate-800 text-center">管理爱豆</h3>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onAddIdol();
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 rounded-2xl hover:bg-pink-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-pink-500" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-700 text-sm">切换/添加爱豆</div>
                        <div className="text-[10px] text-slate-400">管理您的心动列表</div>
                      </div>
                    </button>
                    <button
                      onClick={handleChangeBanner}
                      className="w-full px-4 py-3 flex items-center gap-3 rounded-2xl hover:bg-pink-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-lavender-100 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-lavender-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-700 text-sm">更换壁纸</div>
                        <div className="text-[10px] text-slate-400">上传新的壁纸照片</div>
                      </div>
                    </button>
                  </div>
                  <div className="p-2 border-t border-pink-50">
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-100 text-slate-500 font-bold text-sm hover:bg-slate-200 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl backdrop-blur-sm">
              <img src={currentIdol.avatar} className="w-full h-full object-cover" alt="avatar" />
            </div>
            <div className="text-white space-y-0.5">
              <h1 className="font-serif text-3xl font-bold tracking-tight">{currentIdol.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-90 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                  {currentIdol.nickname || "My Star"}
                </span>
                <span className="w-3 h-3 rounded-full border border-white/50" style={{ backgroundColor: currentIdol.supportColor }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass p-5 rounded-2xl shadow-soft flex flex-col items-center justify-center text-center border-t border-white/40"
        >
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center mb-3">
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">已入坑</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-3xl font-bold text-slate-800 tracking-tighter" style={{ fontVariantNumeric: 'tabular-nums' }}>{stats.daysInLove}</span>
            <span className="text-xs text-slate-400 font-bold">天</span>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass p-5 rounded-2xl shadow-soft flex flex-col items-center justify-center text-center border-t border-white/40"
        >
          <div className="w-10 h-10 rounded-full bg-lavender-100 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-lavender-600" />
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">时光记录</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-3xl font-bold text-slate-800 tracking-tighter" style={{ fontVariantNumeric: 'tabular-nums' }}>{diaryCount}</span>
            <span className="text-xs text-slate-400 font-bold">篇</span>
          </div>
        </motion.div>
      </div>

      <div className="glass p-6 rounded-3xl shadow-soft border-t border-white/40">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-serif font-bold text-xl flex items-center gap-3">
            <div className="w-2 h-8 bg-pink-300 rounded-full" />
            重要日程
          </h3>
          <button 
            onClick={onAnniversaryClick}
            className="text-xs font-bold text-pink-400 flex items-center gap-1 group"
          >
            全部
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="space-y-4">
          {anniversaries.slice(0, 1).map((item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onAnniversaryClick}
              className="flex items-center justify-between bg-white/60 p-4 rounded-2xl hover:bg-white/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-serif font-bold shadow-sm", item.color)}>
                  {item.label.split('.')[1]}
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-700 block">{item.title}</span>
                  <span className="text-[10px] text-slate-400 tracking-wider">ANNIVERSARY</span>
                </div>
              </div>
              <div className="text-right min-w-[90px]">
                <div className="flex items-baseline justify-end gap-0.5 text-pink-500">
                  <span className="text-[10px] font-bold">D-</span>
                  <span className="text-2xl font-mono font-bold leading-none tracking-tighter" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {item.days}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block font-bold tracking-tighter">{item.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={onAnniversaryClick}
          className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-pink-100 text-pink-300 text-sm font-bold flex items-center justify-center gap-2 hover:bg-pink-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          管理日程
        </button>
      </div>
    </motion.div>
  );
};
