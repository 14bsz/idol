export interface Idol {
  id: string;
  name: string;
  nickname?: string;
  avatar?: string;
  supportColor: string;
  debutDate: string;
  birthday: string;
  entryDate: string; // In-hole date
  bannerImage?: string;
}

export interface DiaryEntry {
  id: string;
  idolId: string;
  title?: string;
  content: string;
  images: string[];
  videos?: string[]; 
  mood: 'heart' | 'crying' | 'healing' | 'excited' | 'missing';
  tags?: string[]; // 新增预制标签
  createdAt: string;
  template?: string;
}

export const DIARY_TAGS = ['演唱会', '拆专', '直拍', '线下偶遇', '新歌发布', '舞台瞬间', '日常心动'];

export const DAILY_QUOTES = [
  "因为有你，所有的日子都闪闪发亮。",
  "不仅是你的偶像，更是我平淡生活里的英雄。",
  "山河远阔，人间星河，无一不是你。",
  "喜欢你这件事，本身就是一种超能力。",
  "在最美的时刻遇见你，是这辈子最幸运的事。",
  "你是我的满目星河，也是我的万物复苏。",
  "追星不仅仅是在追那个人，也是在追逐那个更好的自己。"
];

export interface Anniversary {
  id: string;
  idolId: string;
  title: string;
  date: string;
  type: 'birthday' | 'debut' | 'comeback' | 'concert' | 'other';
  isCustom?: boolean;
}

export interface CollectionItem {
  id: string;
  idolId: string;
  imageUrl: string;
  notes?: string;
  category: string;
  createdAt: string;
}
