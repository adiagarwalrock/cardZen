'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Wallet,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

const navItems = [
  { href: '/dashboard', label: 'My Cards', icon: LayoutDashboard },
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
    <div className="min-h-screen w-full flex">
      <aside className="hidden md:flex flex-col w-64 border-r bg-card">
        <div className="h-16 flex items-center px-6 border-b">
          <Logo />
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Button
                  asChild
                  variant={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard') ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-6 md:justify-end">
          <div className="md:hidden">
            <Logo />
          </div>
          {/* Add user menu or other header items here */}
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
