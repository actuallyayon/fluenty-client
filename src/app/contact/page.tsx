'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/language-context';
import { Send, CheckCircle2, Mail, MessageSquare, Clock } from 'lucide-react';

export default function ContactPage() {
  const { lang, t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[#D96B27] dark:text-[#FB923C] uppercase tracking-wider">
            {t('navContact')}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
            {lang === 'bn' ? 'আমাদের সাথে যোগাযোগ করুন' : 'Get in Touch with Fluenty'}
          </h1>
          <p className="text-sm sm:text-base text-[#59656D] dark:text-[#8E9FA5] max-w-xl mx-auto leading-relaxed">
            {lang === 'bn'
              ? 'আপনার কোনো পরামর্শ, প্রশ্ন বা অ্যাকাউন্টের সমস্যা থাকলে সরাসরি আমাদের টিমকে লিখুন।'
              : 'Have questions, feedback, or need technical assistance? Send our team a message.'}
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'ইমেইল সাপোর্ট' : 'Email Support'}
              </h3>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-0.5">
                support@fluenty.app
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C] shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'কমিউনিটি ডিসকর্ড' : 'Community Forum'}
              </h3>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-0.5">
                {lang === 'bn' ? 'সাপ্তাহিক স্টাডি গ্রুপ' : 'Weekly Study Circle'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'রেসপন্স টাইম' : 'Response Time'}
              </h3>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-0.5">
                {lang === 'bn' ? '২৪ ঘণ্টার মধ্যে' : 'Within 24 hours'}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="max-w-xl mx-auto w-full bg-white dark:bg-[#142024] rounded-2xl p-6 sm:p-8 border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs transition-colors">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'বার্তাটি সফলভাবে পাঠানো হয়েছে' : 'Message Sent Successfully'}
              </h3>
              <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#8E9FA5] max-w-sm mx-auto">
                {lang === 'bn'
                  ? 'আপনার বার্তার জন্য ধন্যবাদ। আমাদের টিম পর্যালোচনা করে আপনার দেওয়া ইমেইলে দ্রুত উত্তর দেবে।'
                  : 'Thank you for reaching out. A team member will review your inquiry and reply via email shortly.'}
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn-secondary text-xs sm:text-sm px-4 py-2"
                >
                  {lang === 'bn' ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#59656D] dark:text-[#8E9FA5] uppercase tracking-wider mb-2">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-xl text-[#0F2E35] dark:text-[#F3EFE6] placeholder-[#8C979E] dark:placeholder-[#5E727A] font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 dark:focus:ring-[#2DD4BF]/20 focus:border-[#0F4C5C] dark:focus:border-[#2DD4BF] transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#59656D] dark:text-[#8E9FA5] uppercase tracking-wider mb-2">
                  {t('emailAddress')}
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-xl text-[#0F2E35] dark:text-[#F3EFE6] placeholder-[#8C979E] dark:placeholder-[#5E727A] font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 dark:focus:ring-[#2DD4BF]/20 focus:border-[#0F4C5C] dark:focus:border-[#2DD4BF] transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#59656D] dark:text-[#8E9FA5] uppercase tracking-wider mb-2">
                  {lang === 'bn' ? 'আপনার বার্তা' : 'Message'}
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder={
                    lang === 'bn'
                      ? 'আপনার মতামত, প্রশ্ন বা বিস্তারিত সমস্যা লিখুন...'
                      : 'Write your questions, feedback, or issue details here...'
                  }
                  className="w-full px-4 py-3 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-xl text-[#0F2E35] dark:text-[#F3EFE6] placeholder-[#8C979E] dark:placeholder-[#5E727A] font-medium focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]/20 dark:focus:ring-[#2DD4BF]/20 focus:border-[#0F4C5C] dark:focus:border-[#2DD4BF] transition-all text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary-teal flex items-center justify-center gap-2 mt-2 py-3 text-sm font-semibold"
              >
                <span>{lang === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
