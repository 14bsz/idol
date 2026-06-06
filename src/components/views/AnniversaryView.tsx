import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Plus, 
  Calendar, 
  Bell,
  Trash2,
  Sparkles,
  Clock
} from 'lucide-react';
import { format, parseISO, differenceInDays, addYears, isAfter, startOfDay } from 'date-fns';
import type { Anniversary, Idol } from '../../types';
import { cn } from '../../lib/utils';

const API_BASE_URL = 'http://localhost:8080/api';

interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

const request = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': token } : {})
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  const result = await response.json() as ApiResponse<T>;
  if (result.code !== 200) {
    throw new Error(result.message || '请求失败');
  }
  return result.data;
};

interface AnniversaryViewProps {
  idol: Idol;
  anniversaries: Anniversary[];
  onAnniversariesChange: (anniversaries: Anniversary[]) => void;
  onClose: () => void;
}

export const AnniversaryView = ({ idol, anniversaries, onAnniversariesChange, onClose }: AnniversaryViewProps) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const allAnniversaries = useMemo(() => {
    const today = startOfDay(new Date());
    const currentYear = today.getFullYear();
    
    const getNextOccurrence = (dateStr: string) => {
      const monthDay = dateStr.slice(5);
      let targetDate = parseISO(`${currentYear}-${monthDay}`);
      if (isAfter(today, targetDate)) {
        targetDate = addYears(targetDate, 1);
      }
      return targetDate;
    };

    const nextBirthday = getNextOccurrence(idol.birthday);
    const nextDebut = getNextOccurrence(idol.debutDate);

    const all = [
      { id: 'birthday', title: `${idol.name} 的生日`, dateStr: idol.birthday, nextDate: nextBirthday, type: 'birthday' as const },
      { id: 'debut', title: '出道纪念日', dateStr: idol.debutDate, nextDate: nextDebut, type: 'debut' as const },
      ...anniversaries.map(ann => {
        const nextOccurrence = getNextOccurrence(ann.date);
        return { ...ann, dateStr: ann.date, nextDate: nextOccurrence };
      })
    ].sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());

    return all;
  }, [idol, anniversaries]);

  const handleAdd = async () => {
    if (!newTitle || !newDate) return;
    
    setIsSaving(true);
    try {
      const newAnniversary = {
        idolId: idol.id,
        title: newTitle,
        date: newDate,
        color: '#FFB6C1'
      };
      
      const saved = await request<Anniversary>('/anniversaries', {
        method: 'POST',
        body: JSON.stringify(newAnniversary)
      });
      
      onAnniversariesChange([...anniversaries, saved]);
      setShowAdd(false);
      setNewTitle('');
      setNewDate('');
    } catch (error) {
      console.error('保存纪念日失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const removeAnniversary = async (id: string) => {
    setIsDeleting(id);
    try {
      await request(`/anniversaries/${id}`, { method: 'DELETE' });
      onAnniversariesChange(anniversaries.filter(a => a.id !== id));
    } catch (error) {
      console.error('删除纪念日失败:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[300] bg-brand-cream flex flex-col"
    >
      <header className="p-4 flex items-center justify-between border-b border-pink-100/50 bg-white/80 backdrop-blur-md">
        <button onClick={onClose} className="p-2 text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="font-serif text-lg font-bold">日程提醒</h2>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Memorable Days</span>
        </div>
        <button onClick={() => setShowAdd(true)} className="p-2 text-pink-400">
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {allAnniversaries.length > 0 && (
          <div className="bg-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <Sparkles className="absolute top-4 right-6 w-12 h-12 text-pink-400 opacity-20" />
            <div className="relative z-10 space-y-6">
              <div>
                <span className="text-[10px] text-white/50 uppercase tracking-[0.2em] font-black">Upcoming Milestone</span>
                <h3 className="text-2xl font-serif font-bold mt-2">{allAnniversaries[0].title}</h3>
                <p className="text-xs text-white/40 mt-1">下一个值得庆祝的时刻已为你倒计时</p>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-mono font-bold tracking-tighter text-pink-400">
                  {differenceInDays(allAnniversaries[0].nextDate, startOfDay(new Date()))}
                </span>
                <span className="text-xl font-bold opacity-60">DAYS LEFT</span>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-bold opacity-70">{format(allAnniversaries[0].nextDate, 'yyyy.MM.dd')}</span>
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Important
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-widest">全部日程</h4>
          {allAnniversaries.map((ann) => {
            const daysLeft = differenceInDays(ann.nextDate, startOfDay(new Date()));
            const isCustom = 'isCustom' in ann;
            return (
              <div key={ann.id} className="glass p-5 rounded-3xl flex items-center justify-between border-t border-white shadow-soft">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    ann.type === 'birthday' ? "bg-pink-100 text-pink-500" :
                    ann.type === 'debut' ? "bg-lavender-100 text-lavender-500" : "bg-blue-100 text-blue-500"
                  )}>
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">{ann.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono tracking-widest">{ann.dateStr}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-slate-700 block">D-{daysLeft}</span>
                    <span className="text-[9px] text-slate-300 font-bold uppercase">{format(ann.nextDate, 'MMM d')}</span>
                  </div>
                  {isCustom && (
                    <button 
                      onClick={() => removeAnniversary(ann.id)}
                      disabled={isDeleting === ann.id}
                      className="text-slate-200 hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {showAdd && (
        <div className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm flex items-end">
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="w-full bg-white rounded-t-[2.5rem] p-8 space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold">新增专属纪念日</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400"><Plus className="w-6 h-6 rotate-45" /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">纪念日标题</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：第一次线下见面"
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-pink-200 transition-all font-bold text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">具体日期</label>
                <input 
                  type="date" 
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-pink-200 transition-all font-bold text-sm"
                />
              </div>
              <button 
                onClick={handleAdd}
                disabled={isSaving}
                className="w-full py-4 rounded-2xl bg-pink-400 text-white font-bold shadow-lg hover:bg-pink-500 transition-colors disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '保存纪念日'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
