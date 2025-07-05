'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  Home,
  Lightbulb,
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Logo } from '@/components/logo';
import { useSecurity } from '@/hooks/use-security';

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
  const router = useRouter();
  
  const { isLoaded, isSecurityEnabled, isAuthenticated } = useSecurity();
  
  const activeItem = navItems.find(item => pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard'));
  const activePath = activeItem ? activeItem.href : pathname;
  
  const [hoveredPath, setHoveredPath] = useState(activePath);

  useEffect(() => {
    if (isLoaded && isSecurityEnabled && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoaded, isSecurityEnabled, isAuthenticated, router]);

  useEffect(() => {
    setHoveredPath(activePath);
  }, [activePath]);

  // Render a loading state while checking auth to prevent flicker
  if (!isLoaded || (isSecurityEnabled && !isAuthenticated)) {
      return (
          <div className="flex flex-col gap-4 items-center justify-center min-h-screen bg-background">
              <Logo />
              <p className="text-muted-foreground">Securing your session...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen w-full">
      <header className="flex h-20 items-center justify-between px-6">
        <Logo />
         <div className="hidden md:block">
           <ThemeToggle />
         </div>
      </header>

      <main className="p-4 md:p-8 pb-28">
        {children}
      </main>
      
      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-4 inset-x-0 z-20 flex justify-center">
         <div 
          className="flex items-center gap-1 rounded-full border border-black/10 bg-white/70 dark:bg-black/50 p-2 shadow-lg backdrop-blur-lg dark:border-white/10"
          onMouseLeave={() => setHoveredPath(activePath)}
          >
            {navItems.map((item) => {
              const isHovered = item.href === hoveredPath;

              return (
              <Link 
                href={item.href} 
                key={item.href}
                className={cn(
                  'relative rounded-full px-3 py-2 text-sm font-medium transition-colors',
                  isHovered ? 'text-primary-foreground' : 'text-foreground/70 hover:text-foreground/90'
                )}
                onMouseEnter={() => setHoveredPath(item.href)}
              >
                <span className="relative z-10 flex items-center">
                    <item.icon className="h-5 w-5" />
                    {isHovered && <motion.span layoutId="nav-label" className="ml-2 whitespace-nowrap">{item.label}</motion.span>}
                </span>

                {isHovered && (
                    <motion.div
                        className="absolute inset-0 bg-primary rounded-full shadow-md"
                        layoutId="nav-pill"
                        transition={{type: 'spring', stiffness: 350, damping: 30}}
                    />
                )}
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
