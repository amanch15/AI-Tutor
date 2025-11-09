'use client';

import { useState, useEffect } from 'react';
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
import { useAuth, useUser, setDocumentNonBlocking, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firstName || !lastName || !email || !password) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      
      await updateProfile(newUser, {
        displayName: `${firstName} ${lastName}`
      });

      const userDocRef = doc(firestore, 'users', newUser.uid);
      const userData = {
        id: newUser.uid,
        username: email.split('@')[0],
        email: newUser.email,
        name: `${firstName} ${lastName}`,
        dateJoined: new Date().toISOString(),
      };
      setDocumentNonBlocking(userDocRef, userData, { merge: true });

      // Don't set loading to false, let the useEffect handle redirect
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: error.message || "An unknown error occurred.",
      });
      setIsLoading(false);
    }
  };

  if (isUserLoading || user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl grid md:grid-cols-2 overflow-hidden border bg-card/50 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-500">
       <div className="hidden md:flex flex-col items-center justify-center bg-sky-100 dark:bg-accent/10 p-12 text-center border-r">
          <div className='p-4 bg-gradient-to-br from-primary to-orange-400 rounded-full shadow-lg mb-6'>
            <GraduationCap className="h-20 w-20 text-white transform -rotate-12" />
          </div>
          <h2 className="text-3xl font-bold font-headline text-primary">Create Your Account</h2>
          <p className="text-muted-foreground mt-2">Join our learning community and start your personalized journey.</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12 animate-in fade-in slide-in-from-right-12 duration-700">
        <div className="w-full max-w-md">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-3xl font-headline text-primary">Sign Up</CardTitle>
                <CardDescription>
                Enter your information to create an account
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
                <form onSubmit={handleSignup}>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                            <Label htmlFor="first-name">First name</Label>
                            <Input id="first-name" placeholder="Max" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                            <Label htmlFor="last-name">Last name</Label>
                            <Input id="last-name" placeholder="Robinson" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                        </div>
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
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create an account
                        </Button>
                    </div>
                </form>
                <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline text-accent hover:text-primary">
                    Login
                </Link>
                </div>
            </CardContent>
        </div>
      </div>
    </div>
  );
}
