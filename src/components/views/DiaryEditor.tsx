import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Image as ImageIcon, 
  Smile, 
  Sparkles, 
  ChevronLeft,
  Camera,
  Heart,
  Music,
  Star,
  Coffee,
  Tag
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { DiaryEntry } from '../../types';
import { DIARY_TAGS } from '../../types';

interface DiaryEditorProps {
  onClose: () => void;
  onSave: (entry: Partial<DiaryEntry>) => void;
}

const moods = [
  { id: 'heart', label: '心动', icon: <Heart className="w-5 h-5" />, color: 'bg-pink-100 text-pink-500' },
  { id: 'excited', label: '狂喜', icon: <Sparkles className="w-5 h-5" />, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'healing', label: '治愈', icon: <Coffee className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },
  { id: 'missing', label: '想念', icon: <Music className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
  { id: 'crying', label: '破防', icon: <Star className="w-5 h-5" />, color: 'bg-lavender-100 text-lavender-600' },
];

const templates = [
  { id: 'default', name: '温柔', style: 'font-sans' },
  { id: 'serif', name: '文艺', style: 'font-serif italic' },
  { id: 'bold', name: '热烈', style: 'font-bold' },
];

export const DiaryEditor = ({ onClose, onSave }: DiaryEditorProps) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [mood, setMood] = useState<DiaryEntry['mood']>('heart');
  const [template, setTemplate] = useState('default');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleImageUpload = () => {
    // Mock image upload
    const mockImages = [
      'https://picsum.photos/400/400?random=13',
      'https://picsum.photos/400/400?random=14'
    ];
    setImages([...images, mockImages[Math.floor(Math.random() * mockImages.length)]]);
  };

  const currentTemplate = templates.find(t => t.id === template);

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-brand-cream z-[100] flex flex-col"
    >
      <header className="p-4 flex items-center justify-between border-b border-pink-100/50">
        <button onClick={onClose} className="p-2 text-slate-400">
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-serif text-lg font-bold">新随笔</h2>
        <button 
          disabled={!content.trim()}
          onClick={() => onSave({ content, images, mood, template, tags: selectedTags })}
          className={cn(
            "px-6 py-2 rounded-full font-bold text-sm transition-all",
            content.trim() ? "bg-pink-400 text-white shadow-lg" : "bg-slate-100 text-slate-300"
          )}
        >
          保存
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
        {/* Mood Selection */}
        <div className="space-y-3">
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">这一刻的情绪</label>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() => setMood(m.id as any)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all min-w-[70px]",
                  mood === m.id ? cn(m.color, "ring-2 ring-white shadow-md scale-105") : "bg-white/50 text-slate-400 grayscale opacity-60"
                )}
              >
                {m.icon}
                <span className="text-[10px] whitespace-nowrap font-bold">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="记下这一刻的心动..."
            className={cn(
              "w-full h-48 bg-transparent border-none focus:ring-0 text-lg placeholder:text-slate-300 leading-relaxed resize-none",
              currentTemplate?.style
            )}
          />
        </div>

        {/* Tag Selection */}
        <div className="space-y-3">
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
            <Tag className="w-3 h-3" /> 追星标签
          </label>
          <div className="flex flex-wrap gap-2">
            {DIARY_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border",
                  selectedTags.includes(tag)
                    ? "bg-lavender-100 border-lavender-200 text-lavender-600 shadow-sm"
                    : "bg-white border-slate-100 text-slate-400"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">精选物料 ({images.length}/9)</label>
            <span className="text-[10px] text-pink-300">支持照片与视频</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative shadow-soft">
                <img src={img} className="w-full h-full object-cover" alt="upload" />
                <button 
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-black/40 text-white rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {images.length < 9 && (
              <>
                <button 
                  onClick={handleImageUpload}
                  className="aspect-square rounded-2xl border-2 border-dashed border-pink-100 flex flex-col items-center justify-center text-pink-200 hover:bg-pink-50 transition-colors"
                >
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">传照片</span>
                </button>
                <button 
                   onClick={() => alert('支持上传爱豆直拍、演唱会现场视频！个人版目前建议上传15s以内的短视频。')}
                   className="aspect-square rounded-2xl border-2 border-dashed border-lavender-200 flex flex-col items-center justify-center text-lavender-300 hover:bg-lavender-50 transition-colors"
                >
                  <div className="relative">
                    <ImageIcon className="w-6 h-6 mb-1" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                  </div>
                  <span className="text-[10px] font-bold">传视频</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Template Quick Select */}
        <div className="space-y-3 pb-10">
          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">排版风格</label>
          <div className="flex gap-4">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-medium border transition-all",
                  template === t.id ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-100 text-slate-400"
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Suggestion Bar */}
      <div className="p-4 glass border-t border-white/20 flex gap-4 overflow-x-auto no-scrollbar">
        {["温柔碎碎念", "发疯追星码住", "心动破防现场"].map((tag, i) => (
          <button key={i} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/60 text-[10px] text-slate-500 font-bold hover:bg-white shadow-sm transition-colors">
            {tag}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
