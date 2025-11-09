import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl grid md:grid-cols-2 overflow-hidden border bg-card/50 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-500">
      <div className="hidden md:flex flex-col items-center justify-center bg-primary/10 p-12 text-center border-r animate-in fade-in slide-in-from-left-12 duration-700">
          <GraduationCap className="h-24 w-24 text-primary mb-4 animate-pulse delay-500" />
          <h2 className="text-3xl font-bold font-headline text-primary">Welcome to StudyAI</h2>
          <p className="text-muted-foreground mt-2">Your personal AI-powered learning companion. Let's get started!</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12 animate-in fade-in slide-in-from-right-12 duration-700">
        <div className="w-full max-w-md">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-3xl font-headline">Login</CardTitle>
                <CardDescription>
                Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="ml-auto inline-block text-sm underline">
                        Forgot your password?
                    </Link>
                    </div>
                    <Input id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" asChild>
                    <Link href="/dashboard">Login</Link>
                </Button>
                <Button variant="outline" className="w-full">
                    Login with Google
                </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="underline">
                    Sign up
                </Link>
                </div>
            </CardContent>
        </div>
      </div>
    </div>
  );
}
