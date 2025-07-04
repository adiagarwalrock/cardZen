'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  Home,
  Lightbulb,
  Settings,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';

const navItems = [
  { href: '/dashboard', label: 'My Cards', icon: Home },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart },
  { href: '/dashboard/recommend', label: 'Smart Recommend', icon: Lightbulb },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full">
      <header className="fixed top-0 left-0 right-0 z-20 flex h-20 items-center justify-between px-6">
        <Logo />
         <div className="hidden md:block">
           <ThemeToggle />
         </div>
      </header>

      <main className="flex-1 p-4 md:p-8 pt-24 pb-28">
        {children}
      </main>
      
      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-4 inset-x-0 z-20 flex justify-center">
         <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 dark:bg-black/50 p-2 shadow-lg backdrop-blur-lg dark:border-white/10">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')
              return (
              <Link href={item.href} key={item.href}>
                <div 
                    className={cn(
                      'flex items-center justify-center p-3 rounded-full text-foreground/70 transition-all duration-300 ease-in-out',
                      isActive && 'bg-primary text-primary-foreground shadow-md',
                      !isActive && 'hover:bg-black/5'
                    )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </div>
              </Link>
            )})}
            <div className="md:hidden">
              <ThemeToggle />
            </div>
         </div>
      </nav>
    </div>
  );
}
