'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { useTheme } from '@/lib/theme-context';
import { authClient } from '@/lib/auth-client';
import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  LayoutDashboard,
  Award,
  AlertCircle,
  Bookmark,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login');
          router.refresh();
        },
      },
    });
  };

  const user = session?.user as
    | ({ role?: string; name?: string; email?: string; plan?: string })
    | undefined;
  const isAdmin = user?.role === 'admin';

  // Streamlined nav links
  const navLinks = session?.user
    ? [
        { href: '/dashboard', label: t('navDashboard') },
        { href: '/mock-exams', label: t('navMockExams') },
        { href: '/pricing', label: t('navPricing') },
        { href: '/about', label: t('navAbout') },
      ]
    : [
        { href: '/', label: t('navHome') },
        { href: '/pricing', label: t('navPricing') },
        { href: '/about', label: t('navAbout') },
      ];

  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-[#FBF9F5]/95 dark:bg-[#0E1619]/95 backdrop-blur-md border-b border-[#EAE5DB] dark:border-[#23353B] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-baseline gap-1.5 group shrink-0">
              <span className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#0F4C5C] dark:text-[#2DD4BF] transition-colors">
                Fluenty
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D96B27]" />
              <span className="hidden lg:inline-block ml-2 text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5] border-l border-[#D4CDBC] dark:border-[#2F454C] pl-2.5">
                IELTS for Bangla Speakers
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-[#0F4C5C] dark:text-[#2DD4BF] bg-[#EAE5DB]/70 dark:bg-[#1C2D33]'
                        : 'text-[#1A252C] dark:text-[#EDE8DF] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] hover:bg-[#EAE5DB]/40 dark:hover:bg-[#1C2D33]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: Theme + Lang + User / Auth */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle (Uniform h-8 w-8) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg border border-[#D4CDBC] dark:border-[#2F454C] bg-[#F4EFE6] dark:bg-[#142024] text-[#59656D] dark:text-[#EDE8DF] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] flex items-center justify-center transition-colors cursor-pointer"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-[#FDE68A]" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Language Toggle (Uniform h-8) */}
            <div
              className="h-8 inline-flex items-center text-xs font-semibold border border-[#D4CDBC] dark:border-[#2F454C] bg-[#F4EFE6] dark:bg-[#142024] rounded-lg px-1.5 select-none"
              role="group"
              aria-label="Language selector"
            >
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-1.5 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                  lang === 'en'
                    ? 'font-bold text-[#0F4C5C] dark:text-[#2DD4BF] bg-white dark:bg-[#1C2D33] shadow-2xs'
                    : 'text-[#59656D] dark:text-[#8E9FA5] hover:text-[#1A252C] dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <span className="text-[#A39B8B] dark:text-[#52666E] px-0.5 text-[10px]">|</span>
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-1.5 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                  lang === 'bn'
                    ? 'font-bold text-[#0F4C5C] dark:text-[#2DD4BF] bg-white dark:bg-[#1C2D33] shadow-2xs'
                    : 'text-[#59656D] dark:text-[#8E9FA5] hover:text-[#1A252C] dark:hover:text-white'
                }`}
              >
                বাং
              </button>
            </div>

            {/* Auth Controls */}
            {isPending ? (
              <div className="w-24 h-8 bg-[#EAE5DB] dark:bg-[#23353B] rounded-lg animate-pulse" />
            ) : session?.user ? (
              /* User Profile Dropdown Menu */
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="h-8 px-2.5 rounded-lg border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#142024] hover:bg-[#F4EFE6] dark:hover:bg-[#1C2D33] flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
                  aria-expanded={userMenuOpen}
                >
                  <span className="w-5 h-5 rounded-full bg-[#0F4C5C] text-white dark:bg-[#2DD4BF] dark:text-[#0C2429] flex items-center justify-center text-[10px] font-bold shrink-0">
                    {userInitial}
                  </span>
                  <span className="text-xs font-semibold text-[#0F2E35] dark:text-[#F3EFE6] max-w-[90px] truncate">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#59656D] dark:text-[#8E9FA5] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Card */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] shadow-xl py-2 z-50 divide-y divide-[#EAE5DB] dark:divide-[#23353B] animate-in fade-in zoom-in-95 duration-100">
                    {/* User Info Header */}
                    <div className="px-3.5 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#0F2E35] dark:text-[#F3EFE6] truncate block">
                          {user?.name || 'Aspirant'}
                        </span>
                        {isAdmin ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0F4C5C]/10 text-[#0F4C5C] dark:bg-[#2DD4BF]/15 dark:text-[#2DD4BF] uppercase">
                            Admin
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 uppercase">
                            Pro
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#59656D] dark:text-[#8E9FA5] truncate block mt-0.5">
                        {user?.email}
                      </span>
                    </div>

                    {/* Navigation Items */}
                    <div className="py-1.5 text-xs">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-[#1A252C] dark:text-[#EDE8DF] hover:bg-[#F4EFE6] dark:hover:bg-[#1C2D33] font-medium transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                        <span>{t('navDashboard')}</span>
                      </Link>

                      <Link
                        href="/mock-exams"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-[#1A252C] dark:text-[#EDE8DF] hover:bg-[#F4EFE6] dark:hover:bg-[#1C2D33] font-medium transition-colors"
                      >
                        <Award className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                        <span>{t('navMockExams')}</span>
                      </Link>

                      <Link
                        href="/mistakes"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-[#1A252C] dark:text-[#EDE8DF] hover:bg-[#F4EFE6] dark:hover:bg-[#1C2D33] font-medium transition-colors"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>{lang === 'bn' ? 'মিস্টেক নোটবুক' : 'Mistakes Notebook'}</span>
                      </Link>

                      <Link
                        href="/bookmarks"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-[#1A252C] dark:text-[#EDE8DF] hover:bg-[#F4EFE6] dark:hover:bg-[#1C2D33] font-medium transition-colors"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-[#D96B27]" />
                        <span>{lang === 'bn' ? 'বুকমার্কস' : 'Bookmarks'}</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-3.5 py-2 text-[#0F4C5C] dark:text-[#2DD4BF] hover:bg-[#0F4C5C]/10 dark:hover:bg-[#2DD4BF]/10 font-semibold transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{t('adminBadge')}</span>
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('navLogout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged Out Buttons (Uniform h-8) */
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="h-8 px-3 rounded-lg text-xs font-semibold text-[#1A252C] dark:text-[#EDE8DF] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] flex items-center transition-colors"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  href="/signup"
                  className="h-8 px-3.5 rounded-lg text-xs font-bold text-white bg-[#0F4C5C] dark:bg-[#248277] hover:bg-[#0A3642] dark:hover:bg-[#1E6E64] flex items-center justify-center transition-colors shadow-2xs"
                >
                  {t('navSignup')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button & Compact Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg border border-[#D4CDBC] dark:border-[#2F454C] bg-[#F4EFE6] dark:bg-[#142024] text-[#59656D] dark:text-[#EDE8DF] flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-[#FDE68A]" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>

            <div className="h-8 inline-flex items-center text-xs font-semibold border border-[#D4CDBC] dark:border-[#2F454C] bg-[#F4EFE6] dark:bg-[#142024] rounded-lg px-1.5">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-1 py-0.5 rounded text-[11px] ${
                  lang === 'en'
                    ? 'font-bold text-[#0F4C5C] dark:text-[#2DD4BF] bg-white dark:bg-[#1C2D33]'
                    : 'text-[#59656D] dark:text-[#8E9FA5]'
                }`}
              >
                EN
              </button>
              <span className="text-[#A39B8B] dark:text-[#52666E] px-0.5 text-[10px]">|</span>
              <button
                type="button"
                onClick={() => setLang('bn')}
                className={`px-1 py-0.5 rounded text-[11px] ${
                  lang === 'bn'
                    ? 'font-bold text-[#0F4C5C] dark:text-[#2DD4BF] bg-white dark:bg-[#1C2D33]'
                    : 'text-[#59656D] dark:text-[#8E9FA5]'
                }`}
              >
                বাং
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-8 h-8 rounded-lg text-[#1A252C] dark:text-[#EDE8DF] hover:bg-[#EAE5DB] dark:hover:bg-[#1C2D33] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EAE5DB] dark:border-[#23353B] bg-[#FBF9F5] dark:bg-[#0E1619] px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'text-[#0F4C5C] dark:text-[#2DD4BF] bg-[#EAE5DB]/70 dark:bg-[#1C2D33]'
                    : 'text-[#1A252C] dark:text-[#EDE8DF] hover:bg-[#EAE5DB]/40 dark:hover:bg-[#1C2D33]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-[#EAE5DB] dark:border-[#23353B] space-y-2">
            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2 text-center text-xs font-bold text-white bg-[#0F4C5C] dark:bg-[#248277] rounded-lg"
                >
                  {t('navDashboard')}
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-2 text-center text-xs font-semibold text-[#0F4C5C] dark:text-[#2DD4BF] bg-[#0F4C5C]/10 dark:bg-[#248277]/20 border border-[#0F4C5C]/20 dark:border-[#248277]/30 rounded-lg"
                  >
                    {t('adminBadge')}
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="block w-full py-2 text-center text-xs font-semibold text-rose-600 dark:text-rose-400 border border-[#EAE5DB] dark:border-[#23353B] rounded-lg cursor-pointer"
                >
                  {t('navLogout')}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2 text-center text-xs font-semibold text-[#1A252C] dark:text-[#EDE8DF] border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#142024] rounded-lg"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2 text-center text-xs font-bold text-white bg-[#0F4C5C] dark:bg-[#248277] rounded-lg"
                >
                  {t('navSignup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
