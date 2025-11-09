'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  if (user && !isUserLoading) {
    router.push('/dashboard');
    return null;
  }

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Google Login Failed",
        description: error.message,
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="ml-auto inline-block text-sm underline">
                        Forgot your password?
                    </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <Button onClick={handleLogin} disabled={isLoading || isGoogleLoading} className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Login
                </Button>
                <Button variant="outline" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading} className="w-full">
                    {isGoogleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
