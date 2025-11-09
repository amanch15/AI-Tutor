import type { Course, Achievement, Game } from './definitions';
import { Award, Book, Zap } from 'lucide-react';
import { PlaceHolderImages } from './placeholder-images';

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

const gameImages = PlaceHolderImages.filter(img => img.id.startsWith('game-'));

export const gamesData: Game[] = [
  { id: '1', title: 'Math Puzzles', description: 'Sharpen your mind with challenging math problems.', image: gameImages.find(i => i.id === 'game-math')?.imageUrl || '', imageHint: gameImages.find(i => i.id === 'game-math')?.imageHint || '' },
  { id: '2', title: 'Spelling Bee', description: 'Become a spelling champion with this fun game.', image: gameImages.find(i => i.id === 'game-spelling')?.imageUrl || '', imageHint: gameImages.find(i => i.id === 'game-spelling')?.imageHint || '' },
  { id: '3', title: 'History Trivia', description: 'Test your knowledge about the past.', image: gameImages.find(i => i.id === 'game-history')?.imageUrl || '', imageHint: gameImages.find(i => i.id === 'game-history')?.imageHint || '' },
  { id: '4', title: 'Science Lab', description: 'Explore the wonders of science through experiments.', image: gameImages.find(i => i.id === 'game-science')?.imageUrl || '', imageHint: gameImages.find(i => i.id === 'game-science')?.imageHint || '' },
];
