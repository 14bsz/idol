import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Check, 
  Settings, 
  ChevronRight,
  Camera,
  Heart,
  Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Idol } from '../../types';

interface SwitchIdolViewProps {
  idols: Idol[];
  currentIdolId: string;
  onSwitch: (id: string) => void;
  onAdd: (idol: Idol) => void;
  onClose: () => void;
}

export const SwitchIdolView = ({ idols, currentIdolId, onSwitch, onAdd, onClose }: SwitchIdolViewProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newAvatar, setNewAvatar] = useState('https://picsum.photos/400/400?random=7');
  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBirthday, setNewBirthday] = useState('1997-09-01');
  const [newDebutDate, setNewDebutDate] = useState('2013-06-13');

  const handleAdd = () => {
    if (!newName) return;
    const newIdol: Idol = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName,
      nickname: newNickname,
      avatar: newAvatar,
      entryDate: newEntryDate,
      birthday: newBirthday,
      debutDate: newDebutDate,
      supportColor: '#FFC0CB'
    };
    onAdd(newIdol);
    setShowAddForm(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm bg-brand-cream rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
      >
        <header className="p-6 flex items-center justify-between border-b border-pink-100/50 bg-white">
          <div className="flex flex-col">
            <h2 className="font-serif text-xl font-bold text-slate-800">切换/新增爱豆</h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Multi-Idol Manager</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300">
            <X className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {!showAddForm ? (
            <>
              <div className="space-y-3">
                {idols.map(idol => (
                  <button
                    key={idol.id}
                    onClick={() => onSwitch(idol.id)}
                    className={cn(
                      "w-full p-4 rounded-3xl flex items-center justify-between transition-all group border",
                      idol.id === currentIdolId 
                        ? "bg-white border-pink-200 shadow-md scale-[1.02]" 
                        : "bg-white/50 border-transparent hover:bg-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={idol.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-soft" alt={idol.name} />
                        {idol.id === currentIdolId && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-pink-400 rounded-full flex items-center justify-center border-2 border-white">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-slate-700">{idol.name}</h4>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{idol.nickname || "MY STAR"}</p>
                      </div>
                    </div>
                    {idol.id !== currentIdolId && (
                      <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-pink-300 transition-colors" />
                    )}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setShowAddForm(true)}
                className="w-full py-6 rounded-3xl border-2 border-dashed border-pink-100 flex flex-col items-center justify-center text-pink-300 hover:bg-pink-50 transition-all"
              >
                <Plus className="w-8 h-8 mb-2" />
                <span className="text-sm font-bold tracking-tight">开启一段新的心动故事</span>
              </button>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="relative group">
                  <img src={newAvatar} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl" alt="new" />
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">爱豆本名 / 艺名</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例如：田柾国 / Jungkook"
                    className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-pink-100 transition-all font-bold text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">你的入坑日期</label>
                  <input 
                    type="date" 
                    value={newEntryDate}
                    onChange={(e) => setNewEntryDate(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-pink-100 transition-all font-bold text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center block">生日</label>
                    <input 
                      type="date" 
                      value={newBirthday}
                      onChange={(e) => setNewBirthday(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-pink-100 transition-all font-bold text-[10px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center block">出道日</label>
                    <input 
                      type="date" 
                      value={newDebutDate}
                      onChange={(e) => setNewDebutDate(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-white border-none focus:ring-2 focus:ring-pink-100 transition-all font-bold text-[10px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold text-xs uppercase"
                >
                  取消
                </button>
                <button 
                  onClick={handleAdd}
                  className="flex-[1.5] py-4 rounded-2xl bg-pink-400 text-white font-bold text-xs shadow-lg shadow-pink-100"
                >
                  确认入坑
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
