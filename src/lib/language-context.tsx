'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'bn' | 'en';

export interface Dictionary {
  [key: string]: {
    bn: string;
    en: string;
  };
}

export const translations: Dictionary = {
  // Brand
  brandName: { bn: 'ফ্লুয়েন্টি', en: 'Fluenty' },
  tagline: {
    bn: 'বাংলাভাষীদের জন্য নির্ভুল IELTS প্রস্তুতি',
    en: 'IELTS preparation designed for Bangla speakers',
  },

  // Navigation
  navHome: { bn: 'হোম', en: 'Home' },
  navPractice: { bn: 'অনুশীলন', en: 'Practice' },
  navVocab: { bn: 'শব্দভাণ্ডার', en: 'Vocabulary' },
  navGrammar: { bn: 'গ্রামার', en: 'Grammar' },
  navPricing: { bn: 'প্রাইসিং', en: 'Pricing' },
  navAbout: { bn: 'আমাদের সম্পর্কে', en: 'About' },
  navFAQ: { bn: 'প্রশ্নোত্তর', en: 'FAQ' },
  navContact: { bn: 'যোগাযোগ', en: 'Contact' },
  navLogin: { bn: 'লগইন', en: 'Log in' },
  navSignup: { bn: 'সাইন আপ', en: 'Sign up' },
  navDashboard: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  navAdmin: { bn: 'এডমিন প্যানেল', en: 'Admin panel' },
  navLogout: { bn: 'লগআউট', en: 'Log out' },

  // Auth
  loginTitle: { bn: 'আপনার অ্যাকাউন্টে লগইন করুন', en: 'Log in to your account' },
  loginSubtitle: { bn: 'আপনার তথ্য দিয়ে প্রস্তুতি এগিয়ে নিন', en: 'Enter your credentials to continue practice' },
  signupTitle: { bn: 'নতুন অ্যাকাউন্ট তৈরি করুন', en: 'Create your account' },
  signupSubtitle: { bn: 'বিনামূল্যে রিডিং, লিসেনিং ও গ্রামার অনুশীলন শুরু করুন', en: 'Start practicing reading, listening, and grammar for free' },
  fullName: { bn: 'পূর্ণ নাম', en: 'Full name' },
  emailAddress: { bn: 'ইমেইল ঠিকানা', en: 'Email address' },
  password: { bn: 'পাসওয়ার্ড', en: 'Password' },
  confirmPassword: { bn: 'পাসওয়ার্ড নিশ্চিত করুন', en: 'Confirm password' },
  orContinueWith: { bn: 'অথবা গুগল দিয়ে এগিয়ে যান', en: 'Or continue with Google' },
  loginWithGoogle: { bn: 'গুগল দিয়ে প্রবেশ করুন', en: 'Continue with Google' },
  noAccountPrompt: { bn: 'অ্যাকাউন্ট নেই?', en: "Don't have an account?" },
  hasAccountPrompt: { bn: 'ইতিমধ্যে অ্যাকাউন্ট আছে?', en: 'Already have an account?' },
  signingIn: { bn: 'যাচাই করা হচ্ছে...', en: 'Signing in...' },
  creatingAccount: { bn: 'অ্যাকাউন্ট তৈরি হচ্ছে...', en: 'Creating account...' },
  adminBadge: { bn: 'এডমিন', en: 'Admin' },
  userBadge: { bn: 'লার্নার', en: 'Learner' },

  // Hero Section
  heroTitle: {
    bn: 'আইইএলটিএস প্রস্তুতিতে প্রতিটি ভুলের কারণ জানুন নিজের ভাষায়',
    en: 'Understand the exact reason behind every incorrect answer, in Bangla',
  },
  heroDescription: {
    bn: 'বাংলাভাষীদের জন্য রিডিং, লিসেনিং, রাইটিং ও ব্যাকরণ অনুশীলনের প্ল্যাটফর্ম। কোনো উত্তর ভুল হলে মুখস্থ উত্তরের বদলে প্যাসেজের সরাসরি প্রমাণ ও বিস্তারিত বাংলা ব্যাখ্যা দেখে শিখুন।',
    en: 'Targeted IELTS reading, listening, writing, and grammar practice built for Bangla speakers. When an answer is wrong, see the exact evidence in the text alongside clear analysis in Bangla.',
  },
  heroPrimaryCta: { bn: 'একটি ফ্রি লেসন শুরু করুন', en: 'Try a free lesson' },
  heroSecondaryCta: { bn: 'কীভাবে কাজ করে দেখুন', en: 'See how it works' },

  // Feature Section Headings
  featuresSectionTag: { bn: 'প্রধান সুবিধাসমূহ', en: 'Core platform components' },
  featuresSectionHeading: {
    bn: 'ভুল উত্তর মুখস্থ নয়, কার্যকারণ বুঝে শেখা',
    en: 'Clear evidence over rote memorization',
  },
  featuresSectionSubhead: {
    bn: 'বাঙালি শিক্ষার্থীদের যেসব ব্যাকরণ ও রিডিং জায়গায় বেশি ভুল হয়, সেগুলোকে সরাসরি চিহ্নিত করার জন্য ডিজাইন করা তিনটি ইন্টারঅ্যাক্টিভ মডিউল।',
    en: 'Three core workflows designed to diagnose and correct specific error patterns common to Bangla speakers.',
  },

  // Feature 1: AI Explanations
  feature1Badge: { bn: 'মডিউল ০১', en: 'Module 01' },
  feature1Title: { bn: 'প্যাসেজের প্রমাণসহ বাংলায় AI ব্যাখ্যা', en: 'Bangla AI explanations with text evidence' },
  feature1Desc: {
    bn: 'রিডিং বা লিসেনিংয়ে কোনো উত্তর ভুল হলে কেবল সঠিক উত্তরটি বলে দেওয়া হয় না। ভুলটি কেন ভুল এবং প্যাসেজের ঠিক কোন বাক্যের কারণে সঠিক উত্তরটি সঠিক, তা বাংলায় ব্যাখ্যা করা হয়।',
    en: 'When an answer is incorrect, you do not just get the answer key. Gemini identifies why your chosen option was flawed and cites the exact sentence in the source text.',
  },

  // Feature 2: Writing Feedback
  feature2Badge: { bn: 'মডিউল ০২', en: 'Module 02' },
  feature2Title: { bn: 'আইইএলটিএস মানদণ্ড অনুযায়ী রাইটিং মূল্যায়ন', en: 'Four-criteria IELTS writing feedback' },
  feature2Desc: {
    bn: 'টাস্ক রেসপন্স, কোহেরেন্স, লেক্সিক্যাল রিসোর্স ও গ্রামার—চারটি অফিসিয়াল মানদণ্ডে বাক্যভিত্তিক ভুল সংশোধন ও এস্টিমেটেড স্কোর প্রদান করা হয়।',
    en: 'Essays are evaluated across Task Response, Coherence, Lexical Resource, and Grammatical Accuracy, complete with sentence-level edits and estimated band indicators.',
  },

  // Feature 3: Mistake Notebook
  feature3Badge: { bn: 'মডিউল ০৩', en: 'Module 03' },
  feature3Title: { bn: 'স্বয়ংক্রিয় মিস্টেক নোটবুক', en: 'Automated mistake notebook' },
  feature3Desc: {
    bn: 'আপনার করা প্রতিটি ভুল উত্তর আলাদা নোটবুকে ক্যাটাগরি অনুযায়ী জমা থাকে (যেমন: Prepositions, Headings, Tenses), যাতে পরীক্ষার আগে দুর্বল জায়গাগুলো পুনরায় রিভিশন দেওয়া যায়।',
    en: 'Incorrect answers are automatically cataloged by question type and grammatical pattern, letting you revisit weaknesses without redoing entire tests.',
  },

  // Dashboard Shell
  dashboardWelcome: { bn: 'স্বাগতম,', en: 'Welcome back,' },
  dashboardGoal: { bn: 'আপনার লক্ষ্য ব্যান্ড:', en: 'Target band:' },
  dashboardStreak: { bn: 'স্ট্রিক:', en: 'Daily streak:' },
  dashboardXp: { bn: 'মোট XP:', en: 'Total XP:' },
  dashboardPlan: { bn: 'প্ল্যান:', en: 'Current plan:' },
  dashboardFree: { bn: 'ফ্রি প্ল্যান', en: 'Free tier' },
  dashboardPremium: { bn: 'প্রিমিয়াম', en: 'Premium' },
  quickActions: { bn: 'আজকের অনুশীলন', en: "Today's practice" },
  startVocab: { bn: 'ভোকাবুলারি ফ্ল্যাশকার্ড', en: 'Vocabulary flashcards' },
  startGrammar: { bn: 'গ্রামার লেসন', en: 'Grammar lessons' },
  startReading: { bn: 'রিডিং টেস্ট', en: 'Reading test' },
  startListening: { bn: 'লিসেনিং টেস্ট', en: 'Listening test' },

  // Admin Shell
  adminWelcome: { bn: 'ফ্লুয়েন্টি এডমিন ড্যাশবোর্ড', en: 'Fluenty admin dashboard' },
  adminSubtitle: { bn: 'কন্টেন্ট ম্যানেজমেন্ট ও ইউজার পর্যবেক্ষণ সিস্টেম', en: 'Content management & user administration' },
  adminRoleGuardNotice: {
    bn: 'এই ড্যাশবোর্ডটি শুধুমাত্র অ্যাডমিনিস্ট্রেটরদের জন্য সুরক্ষিত।',
    en: 'This dashboard is strictly protected for administrators only.',
  },
  adminContentManagement: { bn: 'কন্টেন্ট ম্যানেজমেন্ট', en: 'Content management' },
  adminUserManagement: { bn: 'ইউজার ম্যানেজমেন্ট', en: 'User management' },
  adminAiGeneration: { bn: 'AI কনটেন্ট জেনারেটর', en: 'AI content generator' },
  adminStats: { bn: 'সিস্টেম স্ট্যাটিস্টিকস', en: 'System statistics' },

  // Common UI
  loading: { bn: 'লোড হচ্ছে...', en: 'Loading...' },
  errorOccurred: { bn: 'একটি সমস্যা হয়েছে', en: 'An error occurred' },
  tryAgain: { bn: 'আবার চেষ্টা করুন', en: 'Try again' },

  // Phase 4 - Practice & Mistakes
  navReading: { bn: 'রিডিং', en: 'Reading' },
  navListening: { bn: 'লিসেনিং', en: 'Listening' },
  navMistakes: { bn: 'মিস্টেক নোটবুক', en: 'Mistake Notebook' },
  readingTitle: { bn: 'আইইএলটিএস রিডিং প্র্যাকটিস', en: 'IELTS Reading Practice' },
  readingSubtitle: {
    bn: 'টাইমড প্যাসেজ ও ইনস্ট্যান্ট স্কোরিং সহ বাস্তবসম্মত আইইএলটিএস রিডিং অনুশীলন',
    en: 'Real IELTS reading passages with timed sessions and instant scoring',
  },
  listeningTitle: { bn: 'আইইএলটিএস লিসেনিং প্র্যাকটিস', en: 'IELTS Listening Practice' },
  listeningSubtitle: {
    bn: 'সেকশন ভিত্তিক অডিও টেস্ট ও সাবমিটের পর ট্রান্সক্রিপ্ট সহ লিসেনিং প্রস্তুতি',
    en: 'Section-based audio practice with full transcript revealed upon submission',
  },
  mistakesTitle: { bn: 'আপনার মিস্টেক নোটবুক', en: 'Your Mistake Notebook' },
  mistakesSubtitle: {
    bn: 'রিডিং ও লিসেনিংয়ে আপনার করা ভুলগুলোর বিস্তারিত বাংলা ব্যাখ্যা ও প্রমাণ',
    en: 'All incorrect answers organized with Bangla analysis and evidence citations',
  },
  startPractice: { bn: 'অনুশীলন শুরু করুন', en: 'Start Practice' },
  submitAnswers: { bn: 'টেস্ট সাবমিট করুন', en: 'Submit Test' },
  submittingTest: { bn: 'ফলাফল যাচাই হচ্ছে...', en: 'Evaluating answers...' },
  timeRemaining: { bn: 'বাকি সময়', en: 'Time Remaining' },
  explanationLabel: { bn: 'ব্যাখ্যা ও কারণ', en: 'Explanation & Analysis' },
  evidenceLabel: { bn: 'প্যাসেজ/অডিও প্রমাণ', en: 'Evidence from Source' },
  transcriptLabel: { bn: 'অডিও ট্রান্সক্রিপ্ট', en: 'Audio Transcript' },
  yourAnswer: { bn: 'আপনার উত্তর', en: 'Your Answer' },
  correctAnswer: { bn: 'সঠিক উত্তর', en: 'Correct Answer' },
  retryPractice: { bn: 'পুনরায় অনুশীলন', en: 'Retry Practice' },
  resolvedLabel: { bn: 'সমাধান হয়েছে', en: 'Resolved' },
  markResolved: { bn: 'সমাধান হিসেবে চিহ্নিত করুন', en: 'Mark as Resolved' },
  markUnresolved: { bn: 'পুনরায় খুলুন', en: 'Reopen Mistake' },

  // Phase 5 - Writing & Speaking AI Modules
  navWriting: { bn: 'রাইটিং', en: 'Writing' },
  navSpeaking: { bn: 'স্পিকিং', en: 'Speaking' },
  writingTitle: { bn: 'আইইএলটিএস রাইটিং ওয়ার্কবেঞ্চ', en: 'IELTS Writing Workbench' },
  writingSubtitle: {
    bn: 'টাস্ক ১ ও ২ রচনা লিখুন এবং জেমিনাই AI-এর ৪-মানদণ্ড ভিত্তিক গভীর মূল্যায়ন ও বাংলা ব্যাখ্যা পান',
    en: 'Write Task 1 & 2 essays and receive in-depth 4-criteria Gemini AI evaluation with Bangla guidance',
  },
  speakingTitle: { bn: 'আইইএলটিএস স্পিকিং সিমুলেশন', en: 'IELTS Speaking Simulation' },
  speakingSubtitle: {
    bn: 'AI পরীক্ষক ড. সারা জেনকিন্সের সাথে বাস্তবসম্মত ৩-পার্ট ইন্টারভিউ অনুশীলন করুন',
    en: 'Practice realistic 3-part mock interviews with Dr. Sarah Jenkins, your AI examiner',
  },
  estimatedBand: { bn: 'আনুমানিক ব্যান্ড (অফিসিয়াল নয়)', en: 'Estimated Band (Unofficial)' },
  taskResponse: { bn: 'টাস্ক রেসপন্স / অর্জন', en: 'Task Achievement / Response' },
  coherenceCohesion: { bn: 'কোহেরেন্স ও কোহিশন', en: 'Coherence & Cohesion' },
  lexicalResource: { bn: 'লেক্সিক্যাল রিসোর্স (শব্দচয়ন)', en: 'Lexical Resource' },
  grammaticalAccuracy: { bn: 'ব্যাকরণগত নির্ভুলতা ও বৈচিত্র্য', en: 'Grammatical Range & Accuracy' },
  fluencyCoherence: { bn: 'সাবলীলতা ও সংহতি', en: 'Fluency & Coherence' },
  pronunciationGuidance: { bn: 'উচ্চারণ ও ইন্টোনেশন পরামর্শ', en: 'Pronunciation & Intonation Guidance' },
  sentenceCorrections: { bn: 'বাক্যভিত্তিক ভুল ও শুদ্ধ রূপ', en: 'Sentence-by-Sentence Corrections' },
  band8Model: { bn: 'ব্যান্ড ৮.০+ মডেল রচনা', en: 'Band 8.0+ Model Essay' },
  submitForEvaluation: { bn: 'AI মূল্যায়নের জন্য জমা দিন', en: 'Submit for AI Evaluation' },
  evaluatingEssay: { bn: 'AI দিয়ে গভীর মূল্যায়ন করা হচ্ছে...', en: 'Evaluating essay with Gemini AI...' },
  askAiExplain: { bn: 'AI দিয়ে বিস্তারিত বুঝুন', en: 'Deep AI Breakdown' },
  wordCount: { bn: 'শব্দ সংখ্যা', en: 'Word count' },
  minWordsTask1: { bn: 'কমপক্ষে ১৫০ শব্দ', en: 'Min 150 words' },
  minWordsTask2: { bn: 'কমপক্ষে ২৫০ শব্দ', en: 'Min 250 words' },

  // Phase 6 - Mock Exams & Admin AI Generator
  navMockExams: { bn: 'মক টেস্ট', en: 'Mock Exams' },
  mockExamsTitle: { bn: 'অফিসিয়াল আইইএলটিএস ফুল মক টেস্ট', en: 'Official IELTS Full Mock Exam' },
  mockExamsSubtitle: {
    bn: '৪টি দক্ষতার পূর্ণাঙ্গ সিমুলেশন, অফিসিয়াল টাইমিং ও কম্পোজিট ব্যান্ড স্কোরকার্ড',
    en: 'Complete 4-skill simulation with timed sections and composite band scorecards',
  },
  compositeBand: { bn: 'সর্বমোট কম্পোজিট ব্যান্ড', en: 'Overall Composite Band' },
  startMockExam: { bn: 'সম্পূর্ণ মক টেস্ট শুরু করুন', en: 'Start Full Mock Exam' },
  proceedToNextSection: { bn: 'পরবর্তী সেকশনে যান', en: 'Proceed to Next Section' },
  adminAiGenTitle: { bn: 'জেমিনাই AI কন্টেন্ট জেনারেটর', en: 'Gemini AI Content Generator' },
  adminAiGenDesc: {
    bn: '১-ক্লিকে রিডিং প্যাসেজ, লিসেনিং স্ক্রিপ্ট, রাইটিং প্রম্পট ও স্পিকিং কিউ কার্ড তৈরি করুন',
    en: 'Generate IELTS reading passages, listening scripts, writing prompts, and speaking cues in 1 click',
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default language is Bangla as required by specification
  const [lang, setLangState] = useState<Language>('bn');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fluenty_lang') as Language;
      if (saved === 'bn' || saved === 'en') {
        setLangState(saved);
      }
    } catch {
      // Ignore localStorage availability issues in SSR
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('fluenty_lang', newLang);
    } catch {
      // Ignore
    }
  };

  const toggleLang = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  const t = (key: string): string => {
    const item = translations[key];
    if (!item) {
      return key;
    }
    return item[lang] || item.en || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
