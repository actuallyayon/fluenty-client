'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/language-context';
import { authClient } from '@/lib/auth-client';
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Check,
  Copy,
} from 'lucide-react';

export default function PricingPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const { data: session } = authClient.useSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'stripe'>('bkash');
  const [accountNumber, setAccountNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [userProfile, setUserProfile] = useState<{ plan?: string } | null>(null);

  // Fetch current user profile to see if already premium
  useEffect(() => {
    if (session?.user) {
      fetch('/api/me', {
        credentials: 'include',
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.profile) {
            setUserProfile(d.profile);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  const handleOpenCheckout = () => {
    if (!session?.user) {
      router.push('/login?redirect=/pricing');
      return;
    }
    setIsModalOpen(true);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStripeCheckout = async () => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        '/api/payments/checkout/stripe',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      const data = await res.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage(data.error || 'Failed to initialize card checkout');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocalCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !trxId.trim() || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        '/api/payments/checkout/local',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            method: paymentMethod,
            accountNumber: accountNumber.trim(),
            trxId: trxId.trim(),
            amount: 999,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setSuccessMessage(
          lang === 'bn'
            ? 'অভিনন্দন! আপনার পেমেন্ট ভেরিফাই হয়েছে এবং অ্যাকাউন্ট প্রো-তে আপগ্রেড করা হয়েছে।'
            : 'Congratulations! Your payment has been verified and your account upgraded to Pro.'
        );
        setUserProfile((prev) => ({ ...prev, plan: 'premium' }));
        setTimeout(() => {
          setIsModalOpen(false);
          router.push('/dashboard');
        }, 2000);
      } else {
        setErrorMessage(data.error || 'Payment verification failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during verification');
    } finally {
      setSubmitting(false);
    }
  };

  const isAlreadyPremium = userProfile?.plan === 'premium';

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      <main className="relative flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 overflow-hidden">
        {/* Subtle ambient radial background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(15,76,92,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(45,212,191,0.08),transparent_70%)] pointer-events-none" />

        <div className="relative text-center space-y-3">
          <span className="text-xs font-bold text-[#D96B27] dark:text-[#FB923C] uppercase tracking-wider">
            {t('navPricing')}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
            {lang === 'bn' ? 'স্বচ্ছ ও সহজ সাবস্ক্রিপশন প্ল্যান' : 'Simple & Transparent Pricing'}
          </h1>
          <p className="text-sm sm:text-base text-[#59656D] dark:text-[#8E9FA5] max-w-xl mx-auto leading-relaxed">
            {lang === 'bn'
              ? 'বিনা খরচে শুরু করুন, আর দ্রুত প্রস্তুতির জন্য যেকোনো সময় প্রিমিয়ামে আপগ্রেড করতে পারবেন।'
              : 'Start learning for free today, or unlock unlimited AI feedback with Premium.'}
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Tier */}
          <div className="luxury-card bg-white dark:bg-[#142024] rounded-3xl p-8 border border-[#D4CDBC] dark:border-[#2F454C] shadow-sm flex flex-col justify-between space-y-6 transition-all">
            <div className="space-y-4">
              <span className="px-3 py-1 bg-[#F4EFE6] dark:bg-[#1C2D33] text-[#59656D] dark:text-[#8E9FA5] rounded-lg text-xs font-bold border border-[#E2DBD0] dark:border-[#2A3E45]">
                {lang === 'bn' ? 'ফ্রি প্ল্যান' : 'Free Tier'}
              </span>
              <h3 className="font-heading text-3xl sm:text-4xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? '৳০' : '৳0'}{' '}
                <span className="text-sm font-sans font-normal text-[#59656D] dark:text-[#8E9FA5]">
                  / {lang === 'bn' ? 'চিরদিনের জন্য' : 'forever'}
                </span>
              </h3>
              <p className="text-[#59656D] dark:text-[#8E9FA5] text-xs leading-relaxed">
                {lang === 'bn'
                  ? 'যেকোনো সময় বিনামূল্যে মূল বিষয়গুলো প্র্যাকটিস'
                  : 'Free forever with essential practice modules'}
              </p>

              <ul className="space-y-3.5 text-xs sm:text-sm text-[#59656D] dark:text-[#8E9FA5] pt-2">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF] shrink-0" />
                  <span>{lang === 'bn' ? 'সকল ভোকাবুলারি ও ফ্ল্যাশকার্ড' : 'All vocabulary & flashcards'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF] shrink-0" />
                  <span>{lang === 'bn' ? 'বাঙালিদের সাধারণ ব্যাকরণ ভুল লেসন' : 'Common grammar mistakes lessons'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF] shrink-0" />
                  <span>{lang === 'bn' ? 'দৈনিক ৫টি বাংলা AI ব্যাখ্যা' : '5 daily AI answer explanations'}</span>
                </li>
                <li className="flex items-center gap-2.5 text-[#8C979E] dark:text-[#64748B]">
                  <XCircle className="w-4 h-4 text-[#C0392B] dark:text-[#EF4444] shrink-0" />
                  <span>{lang === 'bn' ? 'সাপ্তাহিক ১টি AI রাইটিং মূল্যায়ন' : 'Limited to 1 weekly AI writing review'}</span>
                </li>
              </ul>
            </div>

            <Link href="/signup" className="w-full btn-secondary text-center text-sm py-3 font-semibold">
              {lang === 'bn' ? 'ফ্রি অ্যাকাউন্ট খুলুন' : 'Get Started Free'}
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="luxury-card bg-gradient-to-br from-[#0F4C5C] to-[#0A3642] dark:from-[#134341] dark:to-[#0D2423] text-white rounded-3xl p-8 border border-white/15 shadow-xl flex flex-col justify-between space-y-6 relative transition-all ring-1 ring-[#0F4C5C]/30 dark:ring-[#2DD4BF]/30">
            {/* Subtle inner decorative glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-white/15 backdrop-blur-md border border-white/20 text-white rounded-lg text-xs font-bold">
                  {lang === 'bn' ? 'প্রো আনলিমিটেড' : 'Pro Unlimited'}
                </span>
                <span className="text-xs uppercase font-extrabold text-[#FDE68A] tracking-wider px-2 py-0.5 rounded bg-black/20 backdrop-blur-xs">
                  {lang === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                </span>
              </div>

              <h3 className="font-heading text-3xl sm:text-4xl font-bold text-white">
                {lang === 'bn' ? '৳৯৯৯' : '৳999'}{' '}
                <span className="text-sm font-sans font-normal text-white/70">
                  / {lang === 'bn' ? 'মাস' : 'month'}
                </span>
              </h3>
              <p className="text-white/80 text-xs leading-relaxed">
                {lang === 'bn'
                  ? 'উচ্চতর AI লিমিট ও পারসোনালাইজড স্টাডি প্ল্যান'
                  : 'High limits & customized weekly study plan'}
              </p>

              <ul className="space-y-3.5 text-xs sm:text-sm text-white/90 pt-2">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FDE68A] shrink-0" />
                  <span>{lang === 'bn' ? 'আনলিমিটেড বাংলা AI ভুল ব্যাখ্যা' : 'Unlimited Bangla AI explanations'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FDE68A] shrink-0" />
                  <span>{lang === 'bn' ? 'দৈনিক আনলিমিটেড রাইটিং এসেসমেন্ট' : 'Unlimited writing assessments'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FDE68A] shrink-0" />
                  <span>{lang === 'bn' ? 'লাইভ স্পিকিং এক্সামিনার কল (Dr. Sarah Jenkins)' : 'Live speaking call with Dr. Sarah Jenkins'}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FDE68A] shrink-0" />
                  <span>{lang === 'bn' ? 'ফুল কেমব্রিজ ৪-স্কিল মক টেস্ট সিমুলেশন' : 'Full 4-skill IELTS Mock Exam simulations'}</span>
                </li>
              </ul>
            </div>

            <div className="relative z-10">
              {isAlreadyPremium ? (
                <div className="w-full text-center py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-sm font-bold flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'আপনি বর্তমানে প্রো সাবস্ক্রাইবার' : 'Active Pro Subscription'}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenCheckout}
                  className="w-full text-center text-sm font-bold rounded-xl py-3.5 px-4 bg-white text-[#0F4C5C] hover:bg-[#FAF7F2] dark:bg-[#2DD4BF] dark:text-[#0C2429] dark:hover:bg-[#5EEAD4] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'প্রিমিয়ামে আপগ্রেড করুন' : 'Upgrade to Premium'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Payment Assurance */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] flex flex-wrap items-center justify-around gap-6 text-xs text-[#59656D] dark:text-[#8E9FA5] shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
            <span>{lang === 'bn' ? '১০০% নিরাপদ বিকাশ, নগদ ও কার্ড পেমেন্ট' : '100% Secure Local & Card Payments'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D96B27]" />
            <span>{lang === 'bn' ? 'তাত্ক্ষণিক অ্যাক্টিভেশন' : 'Instant Account Activation'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{lang === 'bn' ? 'যেকোনো সময় বাতিলযোগ্য' : 'Cancel anytime with 1 click'}</span>
          </div>
        </div>

        {/* ============================================================
            CHECKOUT MODAL (bKash, Nagad, Stripe)
            ============================================================ */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-up">
              <div className="flex items-center justify-between border-b border-[#EAE5DB] dark:border-[#23353B] pb-4">
                <div className="space-y-0.5">
                  <h3 className="font-heading font-bold text-xl text-[#0F2E35] dark:text-[#F3EFE6]">
                    {lang === 'bn' ? 'ফ্লুয়েন্টি প্রিমিয়াম চেকআউট' : 'Fluenty Premium Checkout'}
                  </h3>
                  <span className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                    {lang === 'bn' ? '৳৯৯৯ / মাস &bull; আনলিমিটেড AI ও মক টেস্ট' : '৳999/mo &bull; Unlimited AI & Mock Exams'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-[#8E9FA5] hover:text-[#1A252C] dark:hover:text-[#EDE8DF]"
                >
                  &times;
                </button>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'bkash'
                      ? 'border-[#E2136E] bg-[#E2136E]/10 text-[#E2136E] font-bold shadow-xs'
                      : 'border-[#EAE5DB] dark:border-[#23353B] text-[#59656D] dark:text-[#8E9FA5]'
                  }`}
                >
                  <span className="block text-sm font-bold">bKash</span>
                  <span className="text-[10px] opacity-75">{lang === 'bn' ? 'বিকাশ' : 'Instant'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'nagad'
                      ? 'border-[#F7941D] bg-[#F7941D]/10 text-[#F7941D] font-bold shadow-xs'
                      : 'border-[#EAE5DB] dark:border-[#23353B] text-[#59656D] dark:text-[#8E9FA5]'
                  }`}
                >
                  <span className="block text-sm font-bold">Nagad</span>
                  <span className="text-[10px] opacity-75">{lang === 'bn' ? 'নগদ' : 'Instant'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === 'stripe'
                      ? 'border-[#0F4C5C] bg-[#0F4C5C]/10 text-[#0F4C5C] dark:text-[#2DD4BF] font-bold shadow-xs'
                      : 'border-[#EAE5DB] dark:border-[#23353B] text-[#59656D] dark:text-[#8E9FA5]'
                  }`}
                >
                  <span className="block text-sm font-bold">Card</span>
                  <span className="text-[10px] opacity-75">Stripe USD</span>
                </button>
              </div>

              {/* Notification Banners */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* bKash & Nagad Form */}
              {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
                <form onSubmit={handleLocalCheckout} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                        {paymentMethod === 'bkash' ? 'bKash Merchant/Send Money' : 'Nagad Send Money'} Number:
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('01712345678')}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#0F4C5C] dark:text-[#2DD4BF] hover:underline"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy Number'}</span>
                      </button>
                    </div>

                    <div className="text-base font-mono font-bold text-[#D96B27]">
                      01712-345678
                    </div>

                    <p className="text-[11px] text-[#59656D] dark:text-[#8E9FA5] leading-relaxed">
                      {lang === 'bn'
                        ? 'আপনার বিকাশ বা নগদ অ্যাপ থেকে ৳৯৯৯ সেন্ড মানি করুন। এরপর নিচের ফর্মে আপনার মোবাইল নম্বর এবং ট্রানজেকশন আইডি (TrxID) দিন।'
                        : 'Send ৳999 to the number above via bKash/Nagad app, then enter your mobile number and TrxID below.'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#0F2E35] dark:text-[#EDE8DF]">
                        {lang === 'bn' ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন' : 'Your Sender Mobile Number'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="01XXXXXXXXX"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#142024] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#0F2E35] dark:text-[#EDE8DF]">
                        {lang === 'bn' ? 'ট্রানজেকশন আইডি (TrxID)' : 'Transaction ID (TrxID)'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BL9A4K89"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#142024] text-xs sm:text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !accountNumber.trim() || !trxId.trim()}
                    className="w-full btn-primary-teal py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>{lang === 'bn' ? 'ভেরিফাই হচ্ছে...' : 'Verifying TrxID...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{lang === 'bn' ? 'ভেরিফাই ও প্রিমিয়াম আপগ্রেড' : 'Verify & Upgrade Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Stripe Card Checkout */}
              {paymentMethod === 'stripe' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] space-y-2 text-xs">
                    <span className="font-bold text-[#0F2E35] dark:text-[#F3EFE6] block">
                      International Card Checkout (Visa / Mastercard / Amex)
                    </span>
                    <p className="text-[11px] text-[#59656D] dark:text-[#8E9FA5] leading-relaxed">
                      {lang === 'bn'
                        ? 'স্ট্রাইপ সিকিউর পেমেন্ট গেটওয়ের মাধ্যমে আপনার ক্রেডিট বা ডেবিট কার্ড দিয়ে পেমেন্ট করুন ($9.99 USD)।'
                        : 'Pay $9.99 USD securely via Stripe using any international Credit or Debit card.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleStripeCheckout}
                    disabled={submitting}
                    className="w-full btn-primary-teal py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>{lang === 'bn' ? 'স্ট্রাইপে রিডাইরেক্ট হচ্ছে...' : 'Redirecting to Stripe...'}</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'কার্ড দিয়ে পেমেন্ট করুন ($9.99)' : 'Pay with Card ($9.99)'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
