export type WeeklyProgress = {
  day: string;
  minutes: number;
};

export type Course = {
  title: string;
  category: string;
  progress: number;
};

export type Achievement = {
  title: string;
  description: string;
  icon: React.ElementType;
};

export type HistoryItem = {
  id: string;
  activity: string;
  type: 'Quiz' | 'Lesson' | 'Game' | 'AI Quiz';
  date: string;
  score?: number;
  duration: string;
};

export type Game = {
  id: string;
  title: string;
  description: string;
  image: string;
  imageHint: string;
};
