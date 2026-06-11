import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Camera, 
  Tag, 
  FileText,
  Sparkles,
  Link as LinkIcon,
  Plus
} from 'lucide-react';
import type { CollectionItem, Idol } from '../../types';
import { cn } from '../../lib/utils';

interface AddCollectionViewProps {
  idol: Idol;
  categories: string[];
  onCreateCategory: (name: string) => Promise<string[]>;
  onClose: () => void;
  onSave: (item: CollectionItem) => void;
}

export const AddCollectionView = ({ idol, categories, onCreateCategory, onClose, onSave }: AddCollectionViewProps) => {
  const [category, setCategory] = useState(categories[0] || '神图');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!categories.includes(category)) {
      setCategory(categories[0] || '神图');
    }
  }, [categories, category]);

  const handleCreateCategory = async () => {
    const nextName = window.prompt('请输入新的收藏分类名称', '');
    if (!nextName) {
      return;
    }

    const trimmedName = nextName.trim();
    if (!trimmedName) {
      window.alert('分类名称不能为空');
      return;
    }

    try {
      await onCreateCategory(trimmedName);
      setCategory(trimmedName);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '新增分类失败');
    }
  };

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    // Simulate picking an image
    setTimeout(() => {
      const randomImages = [
        'https://picsum.photos/400/400?random=8',
        'https://picsum.photos/400/400?random=9',
        'https://picsum.photos/400/400?random=10',
        'https://picsum.photos/400/400?random=11',
        'https://picsum.photos/400/400?random=12'
      ];
      setImageUrl(randomImages[Math.floor(Math.random() * randomImages.length)]);
      setIsUploading(false);
    }, 800);
  };

  const handleSave = () => {
    if (!imageUrl) {
      alert('请先上传或粘贴图片链接哦');
      return;
    }
    
    const newItem: CollectionItem = {
      id: Math.random().toString(36).substr(2, 9),
      idolId: idol.id,
      imageUrl,
      category,
      notes,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    onSave(newItem);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[400] bg-brand-cream flex flex-col"
    >
      <header className="p-4 flex items-center justify-between border-b border-pink-100/50 bg-white/80 backdrop-blur-md">
        <button onClick={onClose} className="p-2 text-slate-400">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="font-serif text-lg font-bold text-slate-800">新增收藏</h2>
        <button 
          onClick={handleSave}
          className="px-4 py-1.5 rounded-full bg-slate-800 text-white text-xs font-bold shadow-soft active:scale-95 transition-transform"
        >
          保存
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        {/* Category Selection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400 capitalize">
            <Tag className="w-3 h-3" />
            <span className="text-[10px] font-bold tracking-widest uppercase">选择分类</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-2xl text-xs font-bold transition-all border",
                  category === cat 
                    ? "bg-pink-400 text-white border-pink-400 shadow-md scale-105" 
                    : "bg-white text-slate-400 border-slate-100"
                )}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={handleCreateCategory}
              className="px-4 py-2 rounded-2xl text-xs font-bold transition-all border border-dashed border-pink-200 bg-pink-50/70 text-pink-500 inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              自定义
            </button>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Camera className="w-3 h-3" />
            <span className="text-[10px] font-bold tracking-widest uppercase">添加物料</span>
          </div>
          
          {imageUrl ? (
            <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl group">
              <img src={imageUrl} className="w-full h-full object-cover" alt="preview" />
              <div 
                className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => setImageUrl('')}
              >
                <div className="bg-white/90 px-4 py-2 rounded-full text-xs font-bold text-slate-800">点击更换</div>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleSimulatedUpload}
              disabled={isUploading}
              className="w-full aspect-square rounded-[2.5rem] border-2 border-dashed border-pink-100 bg-pink-50/30 flex flex-col items-center justify-center text-pink-200 hover:bg-pink-50 transition-all group"
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Sparkles className="w-10 h-10 animate-spin mb-4" />
                  <span className="text-xs font-bold">正在冲印中...</span>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-soft mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-pink-300" />
                  </div>
                  <span className="text-sm font-bold text-pink-300">点击上传神图/小卡</span>
                  <span className="text-[10px] text-pink-200 mt-1 uppercase tracking-widest">Supports JPG, PNG</span>
                </>
              )}
            </button>
          )}

          <div className="pt-2">
            <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <LinkIcon className="w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="或者在此粘贴图片 URL..." 
                className="flex-1 bg-transparent border-none text-xs focus:ring-0 text-slate-600 font-medium"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3 pb-10">
          <div className="flex items-center gap-2 text-slate-400">
            <FileText className="w-3 h-3" />
            <span className="text-[10px] font-bold tracking-widest uppercase">心动笔记</span>
          </div>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="记录下收到这张卡时的心情吧..."
            className="w-full h-32 p-5 rounded-[2rem] bg-white border-slate-50 shadow-soft focus:ring-2 focus:ring-pink-100 transition-all text-sm font-medium resize-none placeholder:text-slate-200"
          />
        </div>
      </main>
    </motion.div>
  );
};
