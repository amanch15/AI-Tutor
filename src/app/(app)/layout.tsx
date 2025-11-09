'use client';
import { AppLayout } from '@/components/app/app-layout';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-3 w-3 bg-primary rounded-full animate-bounce"></span>
            </div>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
