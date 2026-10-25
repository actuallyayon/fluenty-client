'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setErrorMessage(
          result.error.message ||
            (lang === 'bn'
              ? 'ভুল ইমেইল বা পাসওয়ার্ড দিয়েছেন। অনুগ্রহ করে আবার চেষ্টা করুন।'
              : 'Invalid email or password. Please try again.')
        );
        setIsLoading(false);
        return;
      }

      // Check session user role for role-based redirect
      const user = (result.data as any)?.user;
      const targetUrl = user?.role === 'admin' ? '/admin' : '/dashboard';
      window.location.href = targetUrl;
    } catch (err: unknown) {
      console.error('Login error:', err);
      setErrorMessage(
        lang === 'bn'
          ? 'লগইন করতে সমস্যা হচ্ছে। সার্ভার সংযোগ পরীক্ষা করুন।'
          : 'Failed to log in. Please check server connection.'
      );
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (err) {
      console.error('Google login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-white dark:bg-[#142024] rounded-2xl p-8 border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
              {t('loginTitle')}
            </h1>
            <p className="text-sm text-[#59656D] dark:text-[#8E9FA5] mt-1.5">
              {t('loginSubtitle')}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-[#FDEDEC] dark:bg-[#451210]/60 border border-[#F5C6CB] dark:border-[#791A1E] flex items-start gap-3 text-[#922B21] dark:text-[#FCA5A5] text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#59656D] dark:text-[#8E9FA5] uppercase tracking-wider mb-1.5">
                {t('emailAddress')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C979E] dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#18272C] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#1A252C] dark:text-[#EDE8DF] font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 focus:border-[#0F4C5C] dark:focus:border-[#2DD4BF] transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#59656D] dark:text-[#8E9FA5] uppercase tracking-wider mb-1.5">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C979E] dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] dark:bg-[#18272C] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#1A252C] dark:text-[#EDE8DF] font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 focus:border-[#0F4C5C] dark:focus:border-[#2DD4BF] transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary-teal flex items-center justify-center gap-2 mt-2"
            >
              <span>{isLoading ? t('signingIn') : t('navLogin')}</span>
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EAE5DB] dark:border-[#23353B]" />
            </div>
            <span className="relative bg-white dark:bg-[#142024] px-3 text-xs text-[#8C979E] font-semibold uppercase">
              {lang === 'bn' ? 'অথবা' : 'or'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full btn-secondary flex items-center justify-center gap-3 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t('loginWithGoogle')}</span>
          </button>

          <p className="mt-8 text-center text-sm text-[#59656D] dark:text-[#8E9FA5]">
            {t('noAccountPrompt')}{' '}
            <Link
              href="/signup"
              className="font-semibold text-[#0F4C5C] dark:text-[#2DD4BF] hover:underline"
            >
              {t('navSignup')}
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
