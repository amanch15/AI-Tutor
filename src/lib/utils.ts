import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarColor(char?: string): string {
  if (!char) return 'bg-muted'; // Default color

  const colors = [
    'bg-red-400 text-red-900', 'bg-orange-400 text-orange-900', 'bg-amber-400 text-amber-900', 'bg-yellow-400 text-yellow-900', 'bg-lime-400 text-lime-900',
    'bg-green-400 text-green-900', 'bg-emerald-400 text-emerald-900', 'bg-teal-400 text-teal-900', 'bg-cyan-400 text-cyan-900', 'bg-sky-400 text-sky-900',
    'bg-blue-400 text-blue-900', 'bg-indigo-400 text-indigo-900', 'bg-violet-400 text-violet-900', 'bg-purple-400 text-purple-900', 'bg-fuchsia-400 text-fuchsia-900',
    'bg-pink-400 text-pink-900', 'bg-rose-400 text-rose-900', 'bg-red-500 text-red-100', 'bg-orange-500 text-orange-100', 'bg-amber-500 text-amber-100',
    'bg-yellow-500 text-yellow-100', 'bg-lime-500 text-lime-100', 'bg-green-500 text-green-100', 'bg-emerald-500 text-emerald-100', 'bg-teal-500 text-teal-100', 
    'bg-cyan-500 text-cyan-100'
  ];

  const charCode = char.toUpperCase().charCodeAt(0);
  // 'A' has char code 65.
  const index = (charCode - 65) % 26;

  return colors[index] || 'bg-muted';
}
