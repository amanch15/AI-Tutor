import type { WeeklyProgress, Course, Achievement, HistoryItem, Game } from './definitions';
import { Award, Book, Zap } from 'lucide-react';
import { PlaceHolderImages } from './placeholder-images';

export const weeklyProgressData: WeeklyProgress[] = [
  { day: 'Mon', minutes: 45 },
  { day: 'Tue', minutes: 60 },
  { day: 'Wed', minutes: 30 },
  { day: 'Thu', minutes: 75 },
  { day: 'Fri', minutes: 50 },
  { day: 'Sat', minutes: 90 },
  { day: 'Sun', minutes: 20 },
];

export const coursesData: Course[] = [
  { title: 'Introduction to Algebra', category: 'Math', progress: 75 },
  { title: 'World War II History', category: 'History', progress: 50 },
  { title: 'Chemical Reactions', category: 'Science', progress: 90 },
];

export const achievementsData: Achievement[] = [
  { title: 'Learning Streak', description: '5 days in a row', icon: Zap },
  { title: 'Bookworm', description: 'Read 10 articles', icon: Book },
  { title: 'Master Quizzer', description: 'Scored 100% on a quiz', icon: Award },
];

export const historyData: HistoryItem[] = [
    { id: '1', activity: 'Algebra Basics', type: 'Quiz', date: '2024-07-20', score: 85, duration: '15 min' },
    { id: '2', activity: 'The Solar System', type: 'Lesson', date: '2024-07-19', duration: '25 min' },
    { id: '3', activity: 'Spelling Bee', type: 'Game', date: '2024-07-19', score: 92, duration: '10 min' },
    { id: '4', activity: 'Calculus Fundamentals', type: 'Lesson', date: '2024-07-18', duration: '45 min' },
    { id: '5', activity: 'History of Ancient Rome', type: 'Quiz', date: '2024-07-17', score: 78, duration: '20 min' },
];

const gameImages = PlaceHolderImages.filter(img => img.id.startsWith('game-'));

export const gamesData: Game[] = [
  { id: '1', title: 'Math Puzzles', description: 'Sharpen your mind with challenging math problems.', image: gameImages.find(i => i.id === 'game-math')?.imageUrl || '', imageHint: gameImages.find(i => i.id === 'game-math')?.imageHint || '' },
  { id: '2', title: 'Spelling Bee', description: 'Become a spelling champion with this fun game.', image: gameImages.find(i => i.id === 'game-spelling')?.imageUrl || '', imageHint: gameImages.find(i => i.id === 'game-spelling')?.imageHint || '' },
  { id: '3', title: 'History Trivia', description: 'Test your knowledge about the past.', image: gameImages.find(i => i.id === 'game-history')?.imageUrl || '', imageHint: gameImages.find(i => i.id === 'game-history')?.imageHint || '' },
  { id: '4', title: 'Science Lab', description: 'Explore the wonders of science through experiments.', image: gameImages.find(i => i.id === 'game-science')?.imageUrl || '', imageHint: gameImages.find(i => i.id === 'game-science')?.imageHint || '' },
];
