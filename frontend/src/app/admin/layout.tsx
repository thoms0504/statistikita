'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import ThemeToggle from '@/components/ThemeToggle';
import {
  BarChart2, MessageSquare, Users, FileText, List,
  LayoutDashboard, ChevronRight, LogOut, Menu, X
} from 'lucide-react';

const navItems = [
  {
    group: 'Chatbot',
    icon: MessageSquare,
    items: [
      { label: 'Dashboard', href: '/admin/chat' },
      { label: 'Manajemen PDF', href: '/admin/chat/pdf' },
      { label: 'Daftar Pertanyaan', href: '/admin/chat/questions' },
    ],
  },
  {
    group: 'Forum',
    icon: Users,
    items: [
      { label: 'Dashboard', href: '/admin/forum' },
      { label: 'Daftar Pertanyaan', href: '/admin/forum/questions' },
    ],
  },
  {
    group: 'Pengguna',
    icon: Users,
    items: [
      { label: 'Monitoring', href: '/admin/users' },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login');
  }, [isAuthenticated, isAdmin, isLoading]);

  const handleLogout = async () => { await logout(); router.push('/'); };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!isAdmin) return null;

  return (
    <div className="h-screen overflow-hidden flex bg-slate-100/80">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-bps-blue flex flex-col overflow-hidden transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10">
          <div className="bg-white/90 rounded-xl p-1.5 shadow-sm"><BarChart2 className="w-5 h-5 text-bps-blue" /></div>
          <div>
            <p className="text-white font-bold text-sm leading-none">StatistiKita</p>
            <p className="text-blue-200 text-xs">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-hidden">
          <div>
            <Link prefetch href="/admin" className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${pathname === '/admin' ? 'bg-white/15 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}>
              <LayoutDashboard className="w-4 h-4" /> Overview
            </Link>
          </div>
          {navItems.map(group => (
            <div key={group.group}>
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide px-3 mb-1.5">{group.group}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <Link key={item.href} prefetch href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${pathname === item.href ? 'bg-white/15 text-white' : 'text-blue-200 hover:bg-white/10 hover:text-white'}`}>
                    <ChevronRight className="w-3.5 h-3.5" /> {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-white/10 space-y-2">
          <ThemeToggle showLabel className="w-full justify-center" />
          <Link prefetch href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-colors">
            <Users className="w-4 h-4" /> Lihat Situs
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-blue-200 hover:bg-red-600 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur border-b border-white/60 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-semibold text-gray-800">Admin Panel</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
