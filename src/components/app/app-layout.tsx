'use client';

import { Logo } from '@/components/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail
} from '@/components/ui/sidebar';
import {
  BookOpen,
  FolderKanban,
  Gamepad2,
  GraduationCap,
  History,
  LayoutDashboard,
  MessageCircle,
  Sparkles,
  LifeBuoy,
  Settings,
  Users,
  BookImage,
  User,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserNav } from './user-nav';
import { Button } from '../ui/button';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learning-path', label: 'Learning Path', icon: BookOpen },
  { href: '/tutor', label: 'AI Tutor', icon: MessageCircle },
  { href: '/quiz', label: 'AI Quiz Generator', icon: Sparkles },
  { href: '/storytime', label: 'AI Storyteller', icon: BookImage },
  { href: '/history', label: 'History', icon: History },
];

const bottomMenuItems = [
    { href: '/support', label: 'Support', icon: LifeBuoy },
    { href: '/settings', label: 'Settings', icon: Settings },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="bg-card">
        <SidebarRail />
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  variant="ghost"
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <SidebarMenu className="mt-auto">
             {bottomMenuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  variant="ghost"
                >
                  <Link href="#">
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/50 backdrop-blur-sm px-6 sticky top-0 z-30">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
                {/* Optional Header Title */}
            </div>
            <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
