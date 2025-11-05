import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
        <GraduationCap className="h-6 w-6 text-primary-foreground" />
      </div>
      <h1 className="font-headline text-xl font-bold text-primary hidden md:block">StudyAI</h1>
    </div>
  );
}
