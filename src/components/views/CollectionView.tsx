import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Heart,
  Image as ImageIcon,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CollectionItem } from '../../types';

interface CollectionViewProps {
  onAdd: () => void;
  items: CollectionItem[];
  onRemove?: (id: string) => void;
}

export const CollectionView = ({ onAdd, items, onRemove }: CollectionViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const categories = ["全部", "神图", "小卡", "物料", "语录"];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const filteredPhotos = selectedCategory === "全部" 
    ? items 
    : items.filter(p => p.category === selectedCategory);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-6 pb-24"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-slate-800">专属收藏夹</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Starlight collection</p>
        </div>
        <button 
          onClick={onAdd}
          className="w-10 h-10 rounded-full glass border-slate-200 text-slate-400 flex items-center justify-center hover:bg-white hover:text-pink-400 transition-all active:scale-90"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
        {categories.map((cat, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border",
              selectedCategory === cat 
                ? "bg-slate-800 text-white border-slate-800 shadow-lg scale-105" 
                : "bg-white text-slate-400 border-slate-100"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredPhotos.map((photo, i) => (
          <motion.div 
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="group relative aspect-square rounded-[2rem] overflow-hidden shadow-soft border border-white"
          >
            <img 
              src={photo.imageUrl} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              alt="collection" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <span className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em] mb-1">{photo.category}</span>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white font-mono">{photo.createdAt}</span>
                <div className="flex gap-2">
                  {photo.category === "语录" && photo.notes && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(photo.notes || '', photo.id);
                      }}
                      className={cn(
                        "p-1.5 rounded-full backdrop-blur-md transition-all",
                        copiedId === photo.id ? "bg-green-500 text-white" : "bg-white/20 text-white hover:bg-white/40"
                      )}
                    >
                      {copiedId === photo.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                  {onRemove && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(photo.id);
                      }}
                      className="p-1.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <button className="p-1.5 rounded-full bg-white text-pink-500 shadow-lg">
                    <Heart className="w-3 h-3 fill-pink-500" />
                  </button>
                </div>
              </div>
            </div>
            {photo.notes && (
              <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-pink-400 ring-4 ring-pink-500/20" />
            )}
          </motion.div>
        ))}
        {filteredPhotos.length === 0 && (
          <div className="col-span-2 py-20 flex flex-col items-center justify-center text-slate-300">
            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
            <span className="italic text-sm">该分类下还没有收藏哦 ✨</span>
          </div>
        )}
      </div>

      <div 
        onClick={onAdd}
        className="bg-brand-pink/20 p-6 rounded-[2.5rem] border-2 border-dashed border-pink-100 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:bg-brand-pink/30 transition-all"
      >
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-soft mb-2">
          <ImageIcon className="w-6 h-6 text-pink-400" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">开始建立你的物料库</h4>
        <p className="text-[10px] text-slate-400 max-w-[200px] leading-relaxed">
          点击右上角 + 号，将你珍藏的神图、小卡
          按照分类一一归档吧
        </p>
      </div>
    </motion.div>
  );
};
