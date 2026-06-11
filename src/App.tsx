import { type ReactNode, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Sparkles,
  BarChart3,
  CalendarDays,
  History,
  X
} from 'lucide-react';
import { cn } from './lib/utils';
import type { Idol, DiaryEntry, Anniversary, CollectionItem } from './types';
import { HomeIcon, DiaryIcon, CollectionIcon, ProfileIcon } from './components/CustomIcons';

import { HomeView } from './components/views/HomeView';
import { DiaryListView } from './components/views/DiaryListView';
import { DiaryEditor } from './components/views/DiaryEditor';
import { CardGenerator } from './components/views/CardGenerator';
import { CollectionView } from './components/views/CollectionView';
import { ReportView } from './components/views/ReportView';
import { TimelineView } from './components/views/TimelineView';
import { AnniversaryView } from './components/views/AnniversaryView';
import { AddCollectionView } from './components/views/AddCollectionView';
import { SwitchIdolView } from './components/views/SwitchIdolView';

const API_BASE_URL = 'http://localhost:8080/api';
const DEFAULT_COLLECTION_CATEGORIES = ['神图', '小卡', '物料', '语录', '线下'];

interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

const request = async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
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

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login';
    throw new Error('登录已过期，请重新登录');
  }

  const result = await response.json() as ApiResponse<T>;
  if (result.code !== 200) {
    throw new Error(result.message || '请求失败');
  }
  return result.data;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'diary' | 'collection' | 'profile'>('home');
  const [isLoading, setIsLoading] = useState(true);
  
  const [idols, setIdols] = useState<Idol[]>([]);
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [collectionCategoriesByIdol, setCollectionCategoriesByIdol] = useState<Record<string, string[]>>({});
  
  const [currentIdolId, setCurrentIdolId] = useState<string | null>(null);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [sharingEntry, setSharingEntry] = useState<DiaryEntry | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [idolsData, diariesData, collectionsData, anniversariesData] = await Promise.all([
        request<Idol[]>('/idols'),
        request<DiaryEntry[]>('/diaries'),
        request<CollectionItem[]>('/collections'),
        request<Anniversary[]>('/anniversaries')
      ]);
      
      setIdols(idolsData);
      setDiaries(diariesData);
      setCollections(collectionsData);
      setAnniversaries(anniversariesData);
      
      if (idolsData.length > 0) {
        setCurrentIdolId(idolsData[0].id);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const currentIdol = useMemo(() => 
    idols.find(id => id.id === currentIdolId) || idols[0] || null, 
  [idols, currentIdolId]);

  const filteredDiaries = useMemo(() => 
    diaries.filter(d => d.idolId === currentIdolId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  [diaries, currentIdolId]);

  const filteredCollections = useMemo(() => 
    collections.filter(c => c.idolId === currentIdolId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  [collections, currentIdolId]);

  const currentCollectionCategories = useMemo(() => {
    const merged = new Set(DEFAULT_COLLECTION_CATEGORIES);
    const idolId = currentIdolId ? String(currentIdolId) : '';
    const remoteCategories = idolId ? (collectionCategoriesByIdol[idolId] || []) : [];

    remoteCategories.forEach(item => merged.add(item));
    filteredCollections
      .map(item => item.category)
      .filter(Boolean)
      .forEach(item => merged.add(item));

    return Array.from(merged);
  }, [collectionCategoriesByIdol, currentIdolId, filteredCollections]);

  useEffect(() => {
    if (!currentIdolId) {
      return;
    }

    request<string[]>(`/collection-categories?idolId=${currentIdolId}`)
      .then((categories) => {
        setCollectionCategoriesByIdol(prev => ({
          ...prev,
          [String(currentIdolId)]: categories
        }));
      })
      .catch((error) => {
        console.error('加载收藏分类失败:', error);
      });
  }, [currentIdolId]);

  const handleSaveDiary = async (partialEntry: Partial<DiaryEntry>) => {
    try {
      const data = {
        idolId: currentIdolId,
        content: partialEntry.content || '',
        mood: partialEntry.mood || 'heart',
        images: partialEntry.images || [],
        template: partialEntry.template,
        tags: partialEntry.tags || []
      };
      
      const savedDiary = await request<DiaryEntry>('/diaries', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      setDiaries([savedDiary, ...diaries]);
      setIsEditorOpen(false);
    } catch (error) {
      console.error('保存日记失败:', error);
    }
  };

  const handleSaveCollection = async (item: any) => {
    try {
      const savedItem = await request<CollectionItem>('/collections', {
        method: 'POST',
        body: JSON.stringify(item)
      });
      
      setCollections([savedItem, ...collections]);
    } catch (error) {
      console.error('保存收藏失败:', error);
    }
  };

  const handleCreateCollectionCategory = async (name: string) => {
    if (!currentIdolId) {
      throw new Error('请先选择爱豆');
    }

    const categories = await request<string[]>('/collection-categories', {
      method: 'POST',
      body: JSON.stringify({
        idolId: currentIdolId,
        name
      })
    });

    setCollectionCategoriesByIdol(prev => ({
      ...prev,
      [String(currentIdolId)]: categories
    }));

    return categories;
  };

  const handleRemoveCollection = async (id: string) => {
    try {
      await request(`/collections/${id}`, { method: 'DELETE' });
      setCollections(collections.filter(c => c.id !== id));
    } catch (error) {
      console.error('删除收藏失败:', error);
    }
  };

  const handleAddIdol = async (newIdol: Idol) => {
    try {
      const savedIdol = await request<Idol>('/idols', {
        method: 'POST',
        body: JSON.stringify(newIdol)
      });
      
      setIdols([...idols, savedIdol]);
      setCurrentIdolId(savedIdol.id);
      setActiveOverlay(null);
    } catch (error) {
      console.error('添加爱豆失败:', error);
    }
  };

  const handleSwitchIdol = (id: string) => {
    setCurrentIdolId(id);
    setActiveOverlay(null);
  };

  const handleUpdateIdolBanner = async (bannerImage: string) => {
    if (!currentIdolId) return;
    
    try {
      const idolToUpdate = idols.find(i => i.id === currentIdolId);
      if (idolToUpdate) {
        await request(`/idols/${currentIdolId}`, {
          method: 'PUT',
          body: JSON.stringify({ ...idolToUpdate, bannerImage })
        });
        
        setIdols(idols.map(idol => 
          idol.id === currentIdolId 
            ? { ...idol, bannerImage }
            : idol
        ));
      }
    } catch (error) {
      console.error('更新横幅失败:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-pink-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!currentIdol) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 space-y-8 pb-24 min-h-[600px] flex flex-col items-center justify-center"
        >
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center mx-auto">
              <Sparkles className="w-12 h-12 text-pink-400" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-800">欢迎来到爱豆时光日记</h2>
              <p className="text-sm text-slate-500 mt-2">添加你的第一位爱豆，开始记录心动时光</p>
            </div>
            <button 
              onClick={() => setActiveOverlay('switch_idol')}
              className="px-8 py-4 bg-pink-400 text-white font-bold rounded-3xl shadow-lg hover:bg-pink-500 transition-colors active:scale-95"
            >
              添加爱豆
            </button>
          </div>
        </motion.div>
      );
    }

    switch (activeTab) {
      case 'home': 
        return (
          <HomeView 
            currentIdol={currentIdol} 
            onAddIdol={() => setActiveOverlay('switch_idol')}
            onAnniversaryClick={() => setActiveOverlay('anniversary')}
            onUpdateBanner={handleUpdateIdolBanner}
            diaryCount={diaries.filter(d => d.idolId === currentIdolId).length}
          />
        );
      case 'diary': 
        return (
          <DiaryListView 
            entries={filteredDiaries}
            onAddEntry={() => setIsEditorOpen(true)}
            onEntryClick={(entry) => setSharingEntry(entry)}
            onShare={(entry) => setSharingEntry(entry)}
          />
        );
      case 'collection': 
        return (
          <CollectionView 
            items={filteredCollections} 
            categories={currentCollectionCategories}
            onAdd={() => setActiveOverlay('add_collection')} 
            onRemove={handleRemoveCollection}
          />
        );
      case 'profile': 
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 space-y-8 pb-24"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center border-4 border-white shadow-soft">
                 <ProfileIcon className="w-10 h-10 text-pink-400" active={true} />
              </div>
              <div>
                 <h2 className="font-serif text-2xl font-bold">追星女孩</h2>
                 <p className="text-xs text-slate-400 mt-1">✨ 正在记录心动时光</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {[
                 { 
                   icon: <BarChart3 className="w-5 h-5" />, 
                   title: "追星月报", 
                   desc: "本月的心动指数分析", 
                   color: "bg-blue-50 text-blue-500",
                   onClick: () => setActiveOverlay('report')
                 },
                 { 
                   icon: <History className="w-5 h-5" />, 
                   title: "时光轴", 
                   desc: "回看一路走来的心路历程", 
                   color: "bg-lavender-50 text-lavender-500",
                   onClick: () => setActiveOverlay('timeline')
                 },
                 { 
                   icon: <CalendarDays className="w-5 h-5" />, 
                   title: "日程提醒", 
                   desc: "不再错过任何重要的日子", 
                   color: "bg-pink-50 text-pink-500",
                   onClick: () => setActiveOverlay('anniversary')
                 }
               ].map((item, i) => (
                 <div 
                   key={i} 
                   onClick={item.onClick}
                   className="glass p-5 rounded-3xl flex items-center gap-4 hover:bg-white transition-colors cursor-pointer border-t border-white/40 group active:scale-[0.98]"
                 >
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                       {item.icon}
                    </div>
                    <div className="flex-1">
                       <h4 className="text-sm font-bold text-slate-700">{item.title}</h4>
                       <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                    <Plus className="w-4 h-4 text-slate-300" />
                 </div>
               ))}
            </div>

            <div className="flex flex-col items-center gap-4 pt-10">
               <p className="text-[10px] text-slate-300">爱豆时光日记 v1.0.0 • 记录纯粹的爱</p>
            </div>
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen relative flex flex-col font-sans overflow-x-hidden">
      <main className="flex-1 overflow-y-auto no-scrollbar pt-4">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto glass border-t border-white/20 h-20 px-8 flex items-center justify-between z-50">
        <NavButton 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
          icon={<HomeIcon active={activeTab === 'home'} />}
          label="主页"
        />
        <NavButton 
          active={activeTab === 'diary'} 
          onClick={() => setActiveTab('diary')} 
          icon={<DiaryIcon active={activeTab === 'diary'} />}
          label="日记"
        />
        <NavButton 
          active={activeTab === 'collection'} 
          onClick={() => setActiveTab('collection')} 
          icon={<CollectionIcon active={activeTab === 'collection'} />}
          label="收藏"
        />
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
          icon={<ProfileIcon active={activeTab === 'profile'} />}
          label="回顾"
        />
      </nav>

      <AnimatePresence>
        {isEditorOpen && (
          <DiaryEditor 
            onClose={() => setIsEditorOpen(false)} 
            onSave={handleSaveDiary}
          />
        )}
        {sharingEntry && (
          <CardGenerator 
            entry={sharingEntry}
            idol={currentIdol}
            onClose={() => setSharingEntry(null)}
          />
        )}
        {activeOverlay === 'report' && (
          <ReportView 
            entries={filteredDiaries}
            collections={filteredCollections}
            currentIdol={currentIdol}
            onClose={() => setActiveOverlay(null)}
          />
        )}
        {activeOverlay === 'timeline' && (
          <TimelineView 
            entries={filteredDiaries}
            idol={currentIdol}
            onClose={() => setActiveOverlay(null)}
          />
        )}
        {activeOverlay === 'anniversary' && (
          <AnniversaryView 
            idol={currentIdol}
            anniversaries={anniversaries.filter(a => a.idolId === currentIdolId)}
            onAnniversariesChange={setAnniversaries}
            onClose={() => setActiveOverlay(null)}
          />
        )}
        {activeOverlay === 'add_collection' && (
          <AddCollectionView 
            idol={currentIdol}
            categories={currentCollectionCategories}
            onCreateCategory={handleCreateCollectionCategory}
            onClose={() => setActiveOverlay(null)}
            onSave={handleSaveCollection}
          />
        )}
        {activeOverlay === 'switch_idol' && (
           <SwitchIdolView 
              idols={idols}
              currentIdolId={currentIdolId}
              onSwitch={handleSwitchIdol}
              onAdd={handleAddIdol}
              onClose={() => setActiveOverlay(null)}
           />
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 focus:outline-none group">
      <motion.div
        animate={active ? { scale: 1.2, y: -4 } : { scale: 1, y: 0 }}
        className="transition-all"
      >
        {icon}
      </motion.div>
      <span className={cn(
        "text-[9px] font-bold tracking-widest transition-colors uppercase", 
        active ? "text-pink-500" : "text-slate-400 group-hover:text-slate-500"
      )}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="w-1 h-1 rounded-full bg-pink-400 absolute -bottom-1"
        />
      )}
    </button>
  );
}
