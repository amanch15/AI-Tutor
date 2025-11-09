'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  coursesData,
  achievementsData,
} from '@/lib/data';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { WeeklyProgress } from '@/lib/definitions';
import { useMemo } from 'react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const progressQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'users', user.uid, 'progress')) : null
  , [firestore, user]);

  const { data: weeklyProgressData, isLoading } = useCollection<WeeklyProgress>(progressQuery);

  const chartData = useMemo(() => {
    if (!weeklyProgressData) {
      return Array(7).fill({ day: '', minutes: 0 });
    }
    const week = Array(7).fill(0).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return format(d, 'yyyy-MM-dd');
    }).reverse();

    const progressByDay = weeklyProgressData.reduce((acc, progress) => {
        const day = progress.date.split('T')[0];
        if (!acc[day]) {
            acc[day] = 0;
        }
        acc[day] += (progress as any).percentageComplete; // Using percentageComplete as minutes for now
        return acc;
    }, {} as Record<string, number>);

    return week.map(dateStr => {
        const dayOfWeek = format(new Date(dateStr), 'E');
        return {
            day: dayOfWeek,
            minutes: progressByDay[dateStr] || 0,
        }
    });

  }, [weeklyProgressData]);


  return (
    <div className="flex flex-col gap-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold font-headline">Welcome back, {user?.displayName || 'Alex'}!</h1>
        <p className="text-muted-foreground">
          Here&apos;s a snapshot of your learning journey today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:bg-card/70">
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>
              Your learning activity over the last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
             {isLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Loading chart...
                </div>
              ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} unit="m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
                <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:bg-card/70">
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Milestones you&apos;ve reached.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {achievementsData.map((achievement) => (
              <div key={achievement.title} className="flex items-center gap-4 p-2 rounded-md transition-colors hover:bg-secondary">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                  <achievement.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">{achievement.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:bg-card/70">
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Your courses in progress.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {coursesData.map((course) => (
              <div key={course.title}>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-muted-foreground">{course.progress}%</p>
                </div>
                <Progress value={course.progress} aria-label={`${course.title} progress`} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="flex flex-col bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:bg-card/70">
          <CardHeader>
            <CardTitle>AI Content Tools</CardTitle>
            <CardDescription>
              Generate study materials or get help from your AI tutor.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 grid grid-cols-2 gap-4">
            <Link href="/learning-path" className="block">
              <div className="border p-4 rounded-lg hover:bg-secondary transition-colors h-full flex flex-col items-center justify-center text-center">
                <h3 className="font-semibold font-headline">New Learning Path</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Generate a personalized plan.
                </p>
              </div>
            </Link>
             <Link href="/tutor" className="block">
              <div className="border p-4 rounded-lg hover:bg-secondary transition-colors h-full flex flex-col items-center justify-center text-center">
                <h3 className="font-semibold font-headline">AI Tutor</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ask questions and get help.
                </p>
              </div>
            </Link>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/quiz">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate a Quiz
                </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
