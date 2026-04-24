'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from './NotificationBell';
import { Menu, X, BarChart2, MessageCircle, LogOut, User, ChevronDown, LifeBuoy } from 'lucide-react';
import { UserAvatar } from './TagBadge';
import ThemeToggle from './ThemeToggle';

// Komponen terpisah yang membaca searchParams, dibungkus Suspense
function NavbarReturnTo({ onReady }: { onReady: (returnTo: string) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams?.toString();
  const returnTo = `${pathname}${qs ? `?${qs}` : ''}`;
  // pass via callback pada render pertama
  onReady(returnTo);
  return null;
}

function NavbarInner() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [returnTo, setReturnTo] = useState('/');

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  return (
    <>
      {/* Baca searchParams di sini — sudah aman karena dibungkus Suspense di Navbar() */}
      <Suspense fallback={null}>
        <NavbarReturnTo onReady={setReturnTo} />
      </Suspense>

      <nav className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-bps-blue via-blue-900 to-slate-900/95 shadow-xl border border-white/10 rounded-2xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link prefetch href="/" className="flex items-center gap-2.5">
            <div className="bg-white/90 rounded-xl p-1.5 shadow-sm">
              <BarChart2 className="w-6 h-6 text-bps-blue" />
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-lg leading-none">StatistiKita</span>
              <p className="text-blue-200 text-xs leading-none">BPS Provinsi Lampung</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={pathname === '/'}>Beranda</NavLink>
            <NavLink href="/forum" active={isActive('/forum')}>Forum</NavLink>
            {isAuthenticated && (
              <NavLink href="/chat" active={isActive('/chat')}>
                <MessageCircle className="w-4 h-4 mr-1 inline" />Chatbot
              </NavLink>
            )}
            {isAuthenticated && (
              <NavLink href="/support" active={isActive('/support')}>
                <LifeBuoy className="w-4 h-4 mr-1 inline" />Chat Admin
              </NavLink>
            )}
            {isAdmin && (
              <NavLink href="/admin" active={isActive('/admin')}>Admin</NavLink>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <ThemeToggle />
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <UserAvatar name={user?.nama_lengkap || '?'} src={user?.avatar_url} role={user?.role} size="sm" />
                    <span className="text-sm font-medium max-w-[120px] truncate">{user?.nama_lengkap}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/60 py-1 z-50 dark:bg-slate-900/90 dark:border-slate-700">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{user?.nama_lengkap}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">@{user?.username}</p>
                      </div>
                      <Link prefetch href={`/profile?from=${encodeURIComponent(returnTo)}`} onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800/60">
                        <User className="w-4 h-4" /> Profil Saya
                      </Link>
                      <Link prefetch href="/forum/my-questions" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800/60">
                        <User className="w-4 h-4" /> Pertanyaan Saya
                      </Link>
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <LogOut className="w-4 h-4" /> Keluar
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link prefetch href="/login" className="text-white hover:bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors">
                  Masuk
                </Link>
                <Link prefetch href="/register" className="bg-white text-bps-blue hover:bg-blue-50 px-4 py-1.5 rounded-full text-sm font-medium transition-colors shadow-sm">
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white p-2">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
            </div>
          </div>
        </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 bg-slate-900/95 border border-white/10 rounded-2xl px-4 py-3 space-y-1 shadow-xl">
          <MobileLink href="/" onClick={() => setMenuOpen(false)}>Beranda</MobileLink>
          <MobileLink href="/forum" onClick={() => setMenuOpen(false)}>Forum</MobileLink>
          {isAuthenticated && (
            <MobileLink href="/chat" onClick={() => setMenuOpen(false)}>Chatbot</MobileLink>
          )}
          {isAuthenticated && (
            <MobileLink href="/support" onClick={() => setMenuOpen(false)}>Chat Admin</MobileLink>
          )}
          {isAdmin && (
            <MobileLink href="/admin" onClick={() => setMenuOpen(false)}>Admin</MobileLink>
          )}
          <div className="pt-2 border-t border-white/10 mt-2">
            {isAuthenticated ? (
              <>
                <MobileLink href={`/profile?from=${encodeURIComponent(returnTo)}`} onClick={() => setMenuOpen(false)}>Profil Saya</MobileLink>
                <MobileLink href="/forum/my-questions" onClick={() => setMenuOpen(false)}>Pertanyaan Saya</MobileLink>
                <div className="px-3 py-2">
                  <ThemeToggle showLabel className="w-full justify-center" />
                </div>
                <button onClick={handleLogout} className="w-full text-left text-red-300 px-3 py-2 text-sm">Keluar</button>
              </>
            ) : (
              <>
                <MobileLink href="/login" onClick={() => setMenuOpen(false)}>Masuk</MobileLink>
                <MobileLink href="/register" onClick={() => setMenuOpen(false)}>Daftar</MobileLink>
                <div className="px-3 py-2">
                  <ThemeToggle showLabel className="w-full justify-center" />
                </div>
              </>
            )}
          </div>
        </div>
      )}
      </nav>
      <div className="nav-spacer" aria-hidden="true" />
    </>
  );
}

export default function Navbar() {
  return <NavbarInner />;
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link prefetch href={href}
      className={`px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
        active ? 'bg-white/15 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
      }`}>
      {children}
    </Link>
  );
}

function MobileLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link prefetch href={href} onClick={onClick}
      className="block text-blue-100 hover:text-white px-3 py-2 text-sm">
      {children}
    </Link>
  );
}
