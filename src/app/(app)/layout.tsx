'use client';
import { AppLayout } from '@/components/app/app-layout';
import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

function LoadingScreen() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="flex items-center gap-2">
                <span className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-3 w-3 bg-primary rounded-full animate-bounce"></span>
            </div>
      </div>
    );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login.
    // Pass the current path as a 'from' query parameter.
    if (!isUserLoading && !user) {
      router.push(`/login?from=${pathname}`);
    }
  }, [user, isUserLoading, router, pathname]);

  // While the user state is loading, show a loading screen.
  if (isUserLoading) {
    return <LoadingScreen />;
  }

  // If there's a user, render the main app layout.
  if (user) {
    return <AppLayout>{children}</AppLayout>;
  }

  // If not loading and no user, return null (or a loading screen)
  // as the redirect is happening.
  return <LoadingScreen />;
}
