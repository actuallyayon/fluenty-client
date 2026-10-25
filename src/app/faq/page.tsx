'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/language-context';
import { ChevronDown, HelpCircle, BookOpen, Brain, Sparkles, ShieldCheck } from 'lucide-react';

interface FAQItem {
  category: 'general' | 'ai' | 'pricing' | 'study';
  qBn: string;
  qEn: string;
  aBn: string;
  aEn: string;
}

const faqs: FAQItem[] = [
  {
    category: 'general',
    qBn: 'ফ্লুয়েন্টি কীভাবে অন্যান্য IELTS অ্যাপ থেকে আলাদা?',
    qEn: 'How is Fluenty different from other IELTS apps?',
    aBn: 'আমরা বিশেষভাবে বাংলাভাষীদের সাধারণ ভুলগুলোর (যেমন Articles, Prepositions, Tense, Subject-Verb Agreement) ওপর জোর দিই এবং ভুল উত্তরের কারণ ইংরেজিতে জটিল ব্যাখ্যা না দিয়ে সহজ ও স্বাভাবিক বাংলায় বুঝিয়ে দিই।',
    aEn: 'We specifically target typical errors made by native Bangla speakers and provide concise, natural Bangla explanations with pinpointed passage evidence.',
  },
  {
    category: 'ai',
    qBn: 'AI-এর দেওয়া ব্যান্ড স্কোর কি অফিসিয়াল?',
    qEn: 'Is the AI estimated band score official?',
    aBn: 'না, এটি শুধুমাত্র একটি আনুমানিক (Estimated) স্কোর যা আপনার প্রস্তুতির অগ্রগতি বোঝার জন্য সহায়তা করে। এটি কোনো অফিসিয়াল IELTS স্কোর নয়। তবে এটি অফিসিয়াল IELTS ব্যান্ড ডেসক্রিপ্টরের মানদণ্ডে মূল্যায়ন করা হয়।',
    aEn: 'No, all AI scores are estimates designed to help you gauge progress. They are calibrated to official IELTS band descriptors, but never replace official exam results.',
  },
  {
    category: 'pricing',
    qBn: 'ফ্রি প্ল্যানে কী কী সুবিধা রয়েছে?',
    qEn: 'What is included in the Free tier?',
    aBn: 'ফ্রি প্ল্যানে আপনি সব মৌলিক ভোকাবুলারি, সাধারণ ব্যাকরণ ভুল লেসন এবং প্রতিদিন সীমিত সংখ্যক বাংলা AI ভুল ব্যাখ্যা ও সাপ্তাহিক রাইটিং এসেসমেন্ট পাবেন। কোনো ক্রেডিট কার্ডের প্রয়োজন নেই।',
    aEn: 'The Free tier gives lifetime access to core vocabulary flashcards, typical Bangla speaker grammar lessons, daily AI explanations, and weekly writing review. No credit card required.',
  },
  {
    category: 'study',
    qBn: 'আমি কীভাবে প্র্যাকটিসে বাড়তি সাহায্য পেতে পারি?',
    qEn: 'How can I get extra help during practice?',
    aBn: 'আমাদের "Ask a Tutor" ফিচার দিয়ে আপনি যেকোনো সময় আপনার ব্যাকরণ বা প্যাসেজের সন্দেহ বাংলায় প্রশ্ন করে দূর করতে পারেন। AI আপনার প্রশ্ন বিশ্লেষণ করে বাংলায় উত্তর প্রদান করবে।',
    aEn: 'Our "Ask a Tutor" assistant allows you to ask reading passage or grammar questions directly in Bangla, receiving contextual guidance tailored to your query.',
  },
  {
    category: 'general',
    qBn: 'আমি কি মোবাইল এবং কম্পিউটার উভয় থেকেই পড়তে পারব?',
    qEn: 'Can I study on both desktop and mobile devices?',
    aBn: 'হ্যাঁ, ফ্লুয়েন্টি পুরোপুরি রেসপনসিভ ওয়েব অ্যাপ। আপনি ফোন, ট্যাবলেট কিংবা কম্পিউটার যেকোনো ব্রাউজার থেকেই নির্বিঘ্নে পড়তে পারবেন।',
    aEn: 'Yes, Fluenty is fully responsive and optimized for phones, tablets, and desktop computers alike.',
  },
  {
    category: 'ai',
    qBn: 'রাইটিং টাস্ক ২ মূল্যায়নে কীভাবে ফিডব্যাক দেওয়া হয়?',
    qEn: 'How is Task 2 Writing assessed by the AI?',
    aBn: 'আপনার প্রবন্ধের Task Achievement, Coherence & Cohesion, Lexical Resource এবং Grammatical Range & Accuracy—এই ৪টি আন্তর্জাতিক মানদণ্ডে পুঙ্খানুপুঙ্খ বিশ্লেষণ ও উন্নতির পরামর্শ দেওয়া হয়।',
    aEn: 'Your essay is analyzed across all four official IELTS criteria: Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.',
  },
];

export default function FAQPage() {
  const { lang, t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[#D96B27] dark:text-[#FB923C] uppercase tracking-wider">
            {t('navFAQ')}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
            {lang === 'bn' ? 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-sm sm:text-base text-[#59656D] dark:text-[#8E9FA5] max-w-xl mx-auto leading-relaxed">
            {lang === 'bn'
              ? 'ফ্লুয়েন্টি প্ল্যাটফর্ম ও বাংলাভাষীদের IELTS প্রস্তুতি সম্পর্কে সাধারণ প্রশ্নের স্পষ্ট উত্তর।'
              : 'Clear, transparent answers about Fluenty, our localized AI methodology, and study plans.'}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'বাংলায় AI বিশ্লেষণ' : 'Bangla AI Analysis'}
              </h3>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-0.5">
                {lang === 'bn' ? 'ভুলের কারণ মাতৃভাষায় স্পষ্ট' : 'Root causes explained clearly'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C] shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'প্রমাণসহ প্যাসেজ রেফারেন্স' : 'Passage Evidence'}
              </h3>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-0.5">
                {lang === 'bn' ? 'সরাসরি লাইন হাইলাইট' : 'Direct line-by-line proof'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'স্বচ্ছ মূল্যায়ন নীতি' : 'Honest Standards'}
              </h3>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-0.5">
                {lang === 'bn' ? 'অবাস্তব ব্যান্ড গ্যারান্টি ছাড়া' : 'Realistic, grounded feedback'}
              </p>
            </div>
          </div>
        </div>

        {/* Accordion Questions */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-[#142024] rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-[#0F2E35] dark:text-[#F3EFE6] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C5C] dark:focus-visible:ring-[#2DD4BF]"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base leading-snug">
                    {lang === 'bn' ? faq.qBn : faq.qEn}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen
                        ? 'bg-[#E7EFF1] dark:bg-[#1C2D33] text-[#0F4C5C] dark:text-[#2DD4BF]'
                        : 'bg-[#F4EFE6] dark:bg-[#1A282D] text-[#59656D] dark:text-[#8E9FA5]'
                    }`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-[#59656D] dark:text-[#8E9FA5] leading-relaxed border-t border-[#EAE5DB] dark:border-[#23353B] pt-4">
                    {lang === 'bn' ? faq.aBn : faq.aEn}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#F4EFE6] dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] text-center space-y-3">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
            {lang === 'bn' ? 'আরও কোনো প্রশ্ন আছে?' : 'Still have questions?'}
          </h3>
          <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#8E9FA5] max-w-md mx-auto">
            {lang === 'bn'
              ? 'আমাদের সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ করুন, আমরা সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর দিয়ে থাকি।'
              : 'Our team is here to assist you with any questions about learning or your account.'}
          </p>
          <div className="pt-2">
            <a
              href="/contact"
              className="inline-flex items-center justify-center font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg bg-[#0F4C5C] hover:bg-[#0A3642] dark:bg-[#2DD4BF] dark:hover:bg-[#5EEAD4] text-white dark:text-[#0C2429] transition-colors"
            >
              {lang === 'bn' ? 'যোগাযোগ করুন' : 'Contact Support'}
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
