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
  SidebarRail,
  SidebarFooter,
  useSidebar,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  BookOpen,
  FolderKanban,
  Gamepad2,
  History,
  LayoutDashboard,
  MessageCircle,
  Sparkles,
  Settings,
  BookImage,
  ChevronLeft,
  Briefcase,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserNav } from './user-nav';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/learning-path', label: 'Learning Path', icon: BookOpen },
  { href: '/tutor', label: 'AI Tutor', icon: MessageCircle },
  { href: '/quiz', label: 'AI Quiz Generator', icon: Sparkles },
  { href: '/storytime', label: 'AI Storyteller', icon: BookImage },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/resources', label: 'Resources', icon: FolderKanban },
];

const coachMenuItems = [
    { href: '/coach', label: 'Resume & Interview', icon: Briefcase },
]

const mainBottomMenuItems = [
    { href: '/history', label: 'History', icon: History },
]

const bottomMenuItems = [
    { href: '/settings', label: 'Settings', icon: Settings },
]

function SidebarToggleButton() {
    const { state, toggleSidebar } = useSidebar();
  
    return (
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={() => toggleSidebar()}
      >
        <ChevronLeft
          className={cn(
            'h-5 w-5 transition-transform duration-300',
            state === 'collapsed' && 'rotate-180'
          )}
        />
        <span className="sr-only">
          {state === 'expanded' ? 'Collapse sidebar' : 'Expand sidebar'}
        </span>
      </Button>
    );
  }

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="bg-card/70 backdrop-blur-sm">
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
            <SidebarGroup>
                <SidebarGroupLabel>Career Tools</SidebarGroupLabel>
                <SidebarMenu>
                    {coachMenuItems.map((item) => (
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
            </SidebarGroup>

          <SidebarMenu className="mt-auto">
             {mainBottomMenuItems.map((item) => (
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
             {bottomMenuItems.map((item) => (
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
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col h-screen">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background/50 backdrop-blur-sm px-6 sticky top-0 z-30">
            <SidebarTrigger className="md:hidden" />
            <div className="hidden md:flex">
              <SidebarToggleButton />
            </div>
            <div className="flex-1" />
            <UserNav />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
