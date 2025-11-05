'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, School, BookOpen, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type AcademicLevel = 'k12' | 'college' | 'phd';

const levels = [
  {
    id: 'k12' as AcademicLevel,
    title: 'Class 1 to K-12',
    icon: School,
    description: 'Focus on foundational skills, gamified lessons, and curriculum alignment for core subject mastery.',
    features: ['Basic Concept Clarification', 'Gamified Lessons', 'Visual & Audio Aids', 'Strong Study Habits'],
  },
  {
    id: 'college' as AcademicLevel,
    title: 'College/University',
    icon: BookOpen,
    description: 'Deeper understanding of complex subjects, assignment support, and academic writing assistance for STEM and other fields.',
    features: ['Assignment & Project Help', 'Advanced Learning Materials', 'Academic Writing Aid', 'Test Preparation'],
  },
  {
    id: 'phd' as AcademicLevel,
    title: 'PhD/Professional',
    icon: Rocket,
    description: 'Research assistance, critical analysis, and specialized skill enhancement for deep learning and career readiness.',
    features: ['Research Data Analysis', 'Advanced Writing Support', 'Specialized Simulations', 'Critical Thinking'],
  },
];

export default function ProfilePage() {
  const [selectedLevel, setSelectedLevel] = useState<AcademicLevel>('college');

  return (
    <div className="max-w-5xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold font-headline">Personalize Your Experience</h1>
        <p className="text-muted-foreground mt-2">
          Select your academic level to tailor the AI&apos;s support to your specific needs.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        {levels.map((level) => (
          <Card
            key={level.id}
            onClick={() => setSelectedLevel(level.id)}
            className={cn(
              'cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col',
              selectedLevel === level.id ? 'ring-2 ring-primary shadow-xl' : 'shadow-lg bg-card/60'
            )}
          >
            <CardHeader className="text-center items-center">
                <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
                    <level.icon className="h-8 w-8" />
                </div>
              <CardTitle className="font-headline text-2xl">{level.title}</CardTitle>
              <CardDescription>{level.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <div className="border-t pt-4 mt-auto">
                    <h4 className="font-semibold mb-3 text-center text-sm uppercase text-muted-foreground">Key Features</h4>
                    <ul className="space-y-2">
                        {level.features.map(feature => (
                            <li key={feature} className="flex items-center gap-3 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-muted-foreground">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Button size="lg">
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
