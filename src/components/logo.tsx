import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="bg-primary rounded-lg p-2.5 flex items-center justify-center animate-pulse-slow shadow-lg">
        <GraduationCap className="h-6 w-6 text-primary-foreground" />
      </div>
      <h1 className="font-headline text-2xl font-bold text-foreground hidden md:block">StudyAI</h1>
    </div>
  );
}
