'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ShieldCheck,
  Users,
  BookOpen,
  FileText,
  Volume2,
  PenTool,
  Mic,
  BarChart3,
  Plus,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Crown,
  Lock,
  Unlock,
  Check,
  RefreshCw,
  Sparkles,
  TrendingUp,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import AdminAiGenerator from '@/components/AdminAiGenerator';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  image?: string | null;
}

type AdminTab =
  | 'overview'
  | 'analytics'
  | 'ai_generator'
  | 'vocab'
  | 'lessons'
  | 'passages'
  | 'listening'
  | 'writing_speaking'
  | 'users';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as AuthUser | undefined;

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Data lists
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [passagesList, setPassagesList] = useState<any[]>([]);
  const [listeningList, setListeningList] = useState<any[]>([]);
  const [writingList, setWritingList] = useState<any[]>([]);
  const [speakingList, setSpeakingList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [modalType, setModalType] = useState<
    'vocab' | 'lesson' | 'passage' | 'listening' | 'writing' | 'speaking' | null
  >(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form State
  const [vocabForm, setVocabForm] = useState({
    word: '',
    partOfSpeech: 'noun',
    pronunciation: '',
    meaningEn: '',
    meaningBn: '',
    exampleEn: '',
    exampleBn: '',
    topic: 'General',
    difficulty: 'medium',
    status: 'published',
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    titleBn: '',
    category: 'grammar',
    subCategory: 'articles',
    contentEn: '',
    contentBn: '',
    order: 1,
    status: 'published',
    commonMistakesBn: [
      {
        incorrect: '',
        correct: '',
        explanationBn: '',
      },
    ],
  });

  const [passageForm, setPassageForm] = useState({
    title: '',
    content: '',
    difficulty: 'academic',
    timeLimitMinutes: 20,
    status: 'published',
  });

  const [listeningForm, setListeningForm] = useState({
    title: '',
    audioUrl: '',
    transcript: '',
    section: 1,
    status: 'published',
  });

  const [writingForm, setWritingForm] = useState({
    taskType: 'task2',
    title: '',
    prompt: '',
    imageUrl: '',
    status: 'published',
  });

  const [speakingForm, setSpeakingForm] = useState({
    topic: '',
    topicBn: '',
    cueCard: '',
    cueCardBn: '',
    bulletPoints: ['', '', '', ''],
    bulletPointsBn: ['', '', '', ''],
    part: 2,
    status: 'published',
  });

  // Role Guard
  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push('/login');
      } else if (user?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [session, isPending, user, router]);

  // Fetch data on tab change or search
  useEffect(() => {
    if (session?.user && user?.role === 'admin') {
      loadTabData();
    }
  }, [activeTab, searchQuery, statusFilter, session]);

  const loadTabData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'overview') {
        const res = await fetch(`${API_BASE}/api/admin/overview`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) setStats(data.stats);
      } else if (activeTab === 'analytics') {
        const res = await fetch(`${API_BASE}/api/admin/analytics`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) setAnalyticsData(data.analytics);
      } else if (activeTab === 'vocab') {
        const res = await fetch(
          `${API_BASE}/api/admin/vocab?search=${encodeURIComponent(searchQuery)}&status=${statusFilter}`,
          { credentials: 'include' }
        );
        const data = await res.json();
        if (data.success) setVocabList(data.items);
      } else if (activeTab === 'lessons') {
        const res = await fetch(
          `${API_BASE}/api/admin/lessons?search=${encodeURIComponent(searchQuery)}&status=${statusFilter}`,
          { credentials: 'include' }
        );
        const data = await res.json();
        if (data.success) setLessonsList(data.items);
      } else if (activeTab === 'passages') {
        const res = await fetch(
          `${API_BASE}/api/admin/passages?search=${encodeURIComponent(searchQuery)}&status=${statusFilter}`,
          { credentials: 'include' }
        );
        const data = await res.json();
        if (data.success) setPassagesList(data.items);
      } else if (activeTab === 'listening') {
        const res = await fetch(
          `${API_BASE}/api/admin/listening?search=${encodeURIComponent(searchQuery)}&status=${statusFilter}`,
          { credentials: 'include' }
        );
        const data = await res.json();
        if (data.success) setListeningList(data.items);
      } else if (activeTab === 'writing_speaking') {
        const [wRes, sRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/writing-prompts`, { credentials: 'include' }),
          fetch(`${API_BASE}/api/admin/speaking-cues`, { credentials: 'include' }),
        ]);
        const wData = await wRes.json();
        const sData = await sRes.json();
        if (wData.success) setWritingList(wData.items);
        if (sData.success) setSpeakingList(sData.items);
      } else if (activeTab === 'users') {
        const res = await fetch(
          `${API_BASE}/api/admin/users?search=${encodeURIComponent(searchQuery)}`,
          { credentials: 'include' }
        );
        const data = await res.json();
        if (data.success) setUsersList(data.users);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setErrorMsg('Failed to fetch data from API');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // ==========================================
  // Vocab CRUD Handlers
  // ==========================================
  const handleSaveVocab = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `${API_BASE}/api/admin/vocab/${editingItem.id}`
        : `${API_BASE}/api/admin/vocab`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(vocabForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save vocab');

      showToast(editingItem ? 'Vocabulary updated successfully' : 'Vocabulary created successfully');
      setModalType(null);
      setEditingItem(null);
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteVocab = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vocabulary item?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/vocab/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        showToast('Vocabulary deleted');
        loadTabData();
      }
    } catch (err) {
      setErrorMsg('Failed to delete item');
    }
  };

  // ==========================================
  // Lesson CRUD Handlers
  // ==========================================
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `${API_BASE}/api/admin/lessons/${editingItem.id}`
        : `${API_BASE}/api/admin/lessons`;
      const method = editingItem ? 'PUT' : 'POST';

      const filteredMistakes = lessonForm.commonMistakesBn.filter(
        (m) => m.incorrect.trim() && m.correct.trim()
      );

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...lessonForm,
          commonMistakesBn: filteredMistakes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save lesson');

      showToast(editingItem ? 'Lesson updated' : 'Lesson created');
      setModalType(null);
      setEditingItem(null);
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/lessons/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        showToast('Lesson deleted');
        loadTabData();
      }
    } catch (err) {
      setErrorMsg('Failed to delete lesson');
    }
  };

  // ==========================================
  // Passage CRUD Handlers
  // ==========================================
  const handleSavePassage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `${API_BASE}/api/admin/passages/${editingItem.id}`
        : `${API_BASE}/api/admin/passages`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(passageForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save passage');

      showToast(editingItem ? 'Passage updated' : 'Passage created');
      setModalType(null);
      setEditingItem(null);
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDeletePassage = async (id: string) => {
    if (!confirm('Are you sure? This will delete the passage and all attached questions.')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/passages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        showToast('Passage deleted');
        loadTabData();
      }
    } catch (err) {
      setErrorMsg('Failed to delete passage');
    }
  };

  // ==========================================
  // User Management Handlers
  // ==========================================
  const handleToggleBan = async (userItem: any) => {
    const action = userItem.banned ? 'unban' : 'ban';
    if (!confirm(`Are you sure you want to ${action} ${userItem.email}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userItem.id}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          banned: !userItem.banned,
          banReason: userItem.banned ? '' : 'Violated terms of service',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update ban status');
      showToast(userItem.banned ? 'User unbanned' : 'User banned');
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleRole = async (userItem: any) => {
    const nextRole = userItem.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role for ${userItem.email} to ${nextRole}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userItem.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update role');
      showToast(`User role updated to ${nextRole}`);
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleTogglePlan = async (userItem: any) => {
    const nextPlan = userItem.plan === 'premium' ? 'free' : 'premium';
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userItem.id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: nextPlan }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update plan');
      showToast(`User plan updated to ${nextPlan}`);
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  if (isPending || !session?.user || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin border-4 border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20 border-t-transparent" />
            <p className="text-[#59656D] dark:text-[#8E9FA5] font-semibold text-sm">
              {lang === 'bn' ? 'এডমিন পারমিশন যাচাই করা হচ্ছে...' : 'Verifying Admin Permissions...'}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Toast notifications */}
        {successMsg && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0F4C5C] text-white text-sm font-semibold shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-[#2DD4BF]" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-xs hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Admin Header Banner */}
        <div className="bg-[#0F4C5C] dark:bg-[#123837] rounded-3xl p-6 sm:p-8 text-white shadow-md border border-[#0A3642] dark:border-[#1E6E64] transition-colors">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-lg text-xs font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-[#FDE68A]" />
                <span>Phase 2: Content & User Management</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {t('adminWelcome')}
              </h1>
              <p className="text-white/80 text-sm max-w-xl leading-relaxed">
                {lang === 'bn'
                  ? 'লেসন, শব্দভাণ্ডার, প্যাসেজ, রাইটিং ও ইউজার প্রগ্রেস নিয়ন্ত্রণ প্যানেল।'
                  : 'Manage IELTS preparation materials, grammar lessons, and student accounts.'}
              </p>
            </div>

            <div className="text-left md:text-right">
              <div className="text-xs text-white/70">{lang === 'bn' ? 'লগইন আছেন' : 'Logged in as'}</div>
              <div className="font-bold text-[#FDE68A] text-sm">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EAE5DB] dark:border-[#23353B]">
          <button
            onClick={() => {
              setActiveTab('overview');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0C2429]'
                : 'text-[#59656D] dark:text-[#8E9FA5] hover:bg-[#F4EFE6] dark:hover:bg-[#142024]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ওভারভিউ' : 'Overview'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('analytics');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0C2429]'
                : 'text-[#59656D] dark:text-[#8E9FA5] hover:bg-[#F4EFE6] dark:hover:bg-[#142024]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{lang === 'bn' ? 'অ্যানালিটিক্স ও রেভিনিউ' : 'Analytics & Revenue'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('vocab');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'vocab'
                ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0C2429]'
                : 'text-[#59656D] dark:text-[#8E9FA5] hover:bg-[#F4EFE6] dark:hover:bg-[#142024]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ভোকাবুলারি' : 'Vocabulary'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('lessons');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'lessons'
                ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0C2429]'
                : 'text-[#59656D] dark:text-[#8E9FA5] hover:bg-[#F4EFE6] dark:hover:bg-[#142024]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{lang === 'bn' ? 'গ্রামার লেসন' : 'Grammar Lessons'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('passages');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'passages'
                ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0C2429]'
                : 'text-[#59656D] dark:text-[#8E9FA5] hover:bg-[#F4EFE6] dark:hover:bg-[#142024]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{lang === 'bn' ? 'রিডিং প্যাসেজ' : 'Reading Passages'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('listening');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'listening'
                ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0C2429]'
                : 'text-[#59656D] dark:text-[#8E9FA5] hover:bg-[#F4EFE6] dark:hover:bg-[#142024]'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{lang === 'bn' ? 'লিসেনিং মডিউল' : 'Listening'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('writing_speaking');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'writing_speaking'
                ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0C2429]'
                : 'text-[#59656D] dark:text-[#8E9FA5] hover:bg-[#F4EFE6] dark:hover:bg-[#142024]'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>{lang === 'bn' ? 'রাইটিং ও স্পিকিং' : 'Writing & Speaking'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ai_generator');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'ai_generator'
                ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0C2429] shadow-sm'
                : 'text-[#D96B27] dark:text-[#FB923C] bg-[#D96B27]/10 hover:bg-[#D96B27]/15'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('adminAiGeneration')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('users');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'users'
                ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0C2429]'
                : 'text-[#59656D] dark:text-[#8E9FA5] hover:bg-[#F4EFE6] dark:hover:bg-[#142024]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ইউজার ম্যানেজমেন্ট' : 'User Management'}</span>
          </button>
        </div>

        {/* TAB: AI GENERATOR */}
        {activeTab === 'ai_generator' && (
          <AdminAiGenerator onContentPublished={loadTabData} />
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
                <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                  Total Vocabulary
                </span>
                <div className="font-heading text-3xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] mt-2">
                  {stats?.vocab || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
                <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                  Grammar Lessons
                </span>
                <div className="font-heading text-3xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] mt-2">
                  {stats?.lessons || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
                <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                  Reading Passages
                </span>
                <div className="font-heading text-3xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] mt-2">
                  {stats?.passages || 0}
                </div>
              </div>

              <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
                <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                  Total Learners
                </span>
                <div className="font-heading text-3xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] mt-2">
                  {stats?.totalUsers || 0}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#F4EFE6] dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6]">
                  Phase 2 Content Operational
                </h3>
                <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#8E9FA5] mt-1">
                  You can now create, inspect, edit, and delete vocabulary items, grammar explanations,
                  IELTS passages, writing prompts, and administer learner accounts.
                </p>
              </div>
              <button
                onClick={loadTabData}
                className="btn-secondary text-xs flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: ANALYTICS & REVENUE */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Top KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                    {lang === 'bn' ? 'মোট রেভিনিউ (BDT)' : 'Total Revenue (BDT)'}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#0F4C5C]/10 text-[#0F4C5C] dark:bg-[#2DD4BF]/15 dark:text-[#2DD4BF] flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-heading text-3xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] mt-2">
                  ৳{(analyticsData?.revenue?.totalBdt || 0).toLocaleString()}
                </div>
                <div className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-1">
                  +{analyticsData?.revenue?.transactionsCount || 0} {lang === 'bn' ? 'সফল লেনদেন' : 'successful payments'}
                </div>
              </div>

              <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                    {lang === 'bn' ? 'কনভার্সন রেট' : 'Conversion Rate'}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#D96B27]/10 text-[#D96B27] dark:bg-[#FB923C]/15 dark:text-[#FB923C] flex items-center justify-center">
                    <Crown className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-heading text-3xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] mt-2">
                  {analyticsData?.users?.conversionRate || '0.0'}%
                </div>
                <div className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-1">
                  {analyticsData?.users?.premium || 0} / {analyticsData?.users?.total || 0} {lang === 'bn' ? 'প্রো শিক্ষার্থী' : 'Pro learners'}
                </div>
              </div>

              <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                    {lang === 'bn' ? 'মোট অনুশীলন ইভেন্ট' : 'Total Practice Events'}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#0F4C5C]/10 text-[#0F4C5C] dark:bg-[#2DD4BF]/15 dark:text-[#2DD4BF] flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-heading text-3xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] mt-2">
                  {analyticsData?.activity?.totalPracticeEvents || 0}
                </div>
                <div className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-1">
                  {lang === 'bn' ? 'রিডিং, লিসেনিং, রাইটিং, স্পিকিং' : 'Across all 4 modules'}
                </div>
              </div>

              <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                    {lang === 'bn' ? 'AI ক্যাশ সাশ্রয়' : 'AI Cost Saved'}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-heading text-3xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] mt-2">
                  ৳{analyticsData?.aiUsage?.estimatedAiCostSavedBdt || 0}
                </div>
                <div className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-1">
                  {analyticsData?.aiUsage?.cachedExplanations || 0} {lang === 'bn' ? 'ক্যাশড ব্যাখ্যা ব্যবহার' : 'cached explanations'}
                </div>
              </div>
            </div>

            {/* Middle row: Payment Breakdown & Practice Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
                <h3 className="font-heading font-bold text-base text-[#0F2E35] dark:text-[#F3EFE6] flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                  <span>{lang === 'bn' ? 'পেমেন্ট গেটওয়ে ব্রেকডাউন' : 'Payment Methods Breakdown'}</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1619] border border-[#D4CDBC] dark:border-[#2F454C] text-center">
                    <span className="text-xs font-bold text-[#E2136E] block mb-1">bKash</span>
                    <span className="font-heading text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                      {analyticsData?.revenue?.paymentMethods?.bkash || 0}
                    </span>
                    <span className="text-[10px] text-[#59656D] dark:text-[#8E9FA5] block mt-0.5">{lang === 'bn' ? 'পেমেন্ট' : 'txns'}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1619] border border-[#D4CDBC] dark:border-[#2F454C] text-center">
                    <span className="text-xs font-bold text-[#F7941D] block mb-1">Nagad</span>
                    <span className="font-heading text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                      {analyticsData?.revenue?.paymentMethods?.nagad || 0}
                    </span>
                    <span className="text-[10px] text-[#59656D] dark:text-[#8E9FA5] block mt-0.5">{lang === 'bn' ? 'পেমেন্ট' : 'txns'}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1619] border border-[#D4CDBC] dark:border-[#2F454C] text-center">
                    <span className="text-xs font-bold text-[#8C3494] block mb-1">Rocket</span>
                    <span className="font-heading text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                      {analyticsData?.revenue?.paymentMethods?.rocket || 0}
                    </span>
                    <span className="text-[10px] text-[#59656D] dark:text-[#8E9FA5] block mt-0.5">{lang === 'bn' ? 'পেমেন্ট' : 'txns'}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FBF9F5] dark:bg-[#0E1619] border border-[#D4CDBC] dark:border-[#2F454C] text-center">
                    <span className="text-xs font-bold text-[#635BFF] block mb-1">Stripe</span>
                    <span className="font-heading text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                      {analyticsData?.revenue?.paymentMethods?.stripe || 0}
                    </span>
                    <span className="text-[10px] text-[#59656D] dark:text-[#8E9FA5] block mt-0.5">{lang === 'bn' ? 'পেমেন্ট' : 'txns'}</span>
                  </div>
                </div>
              </div>

              {/* Practice Modules Activity */}
              <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
                <h3 className="font-heading font-bold text-base text-[#0F2E35] dark:text-[#F3EFE6] flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                  <span>{lang === 'bn' ? 'লার্নিং মডিউল এনগেজমেন্ট' : 'Module Engagement Activity'}</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-[#59656D] dark:text-[#8E9FA5]">{lang === 'bn' ? 'রিডিং ও লিসেনিং কুইজ টেস্ট' : 'Reading & Listening Attempts'}</span>
                    <span className="font-bold text-[#0F2E35] dark:text-[#F3EFE6]">{analyticsData?.activity?.readingListeningAttempts || 0}</span>
                  </div>
                  <div className="w-full bg-[#E8E1D5] dark:bg-[#1D2B30] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0F4C5C] dark:bg-[#2DD4BF] h-full rounded-full" style={{ width: `${Math.min(100, ((analyticsData?.activity?.readingListeningAttempts || 0) / Math.max(1, analyticsData?.activity?.totalPracticeEvents || 1)) * 100)}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                    <span className="text-[#59656D] dark:text-[#8E9FA5]">{lang === 'bn' ? 'রাইটিং টাস্ক ১ ও ২ এসে' : 'Writing Essays Evaluated'}</span>
                    <span className="font-bold text-[#0F2E35] dark:text-[#F3EFE6]">{analyticsData?.activity?.writingEssays || 0}</span>
                  </div>
                  <div className="w-full bg-[#E8E1D5] dark:bg-[#1D2B30] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#D96B27] dark:bg-[#FB923C] h-full rounded-full" style={{ width: `${Math.min(100, ((analyticsData?.activity?.writingEssays || 0) / Math.max(1, analyticsData?.activity?.totalPracticeEvents || 1)) * 100)}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                    <span className="text-[#59656D] dark:text-[#8E9FA5]">{lang === 'bn' ? 'লাইভ স্পিকিং ইন্টারভিউ' : 'Live Speaking Sessions'}</span>
                    <span className="font-bold text-[#0F2E35] dark:text-[#F3EFE6]">{analyticsData?.activity?.speakingSessions || 0}</span>
                  </div>
                  <div className="w-full bg-[#E8E1D5] dark:bg-[#1D2B30] h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(100, ((analyticsData?.activity?.speakingSessions || 0) / Math.max(1, analyticsData?.activity?.totalPracticeEvents || 1)) * 100)}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                    <span className="text-[#59656D] dark:text-[#8E9FA5]">{lang === 'bn' ? 'সম্পূর্ণ মক টেস্ট' : 'Full Mock Exams'}</span>
                    <span className="font-bold text-[#0F2E35] dark:text-[#F3EFE6]">{analyticsData?.activity?.mockExamsCompleted || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Payments Table */}
            <div className="bg-white dark:bg-[#142024] rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#D4CDBC] dark:border-[#2F454C] flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#0F2E35] dark:text-[#F3EFE6]">
                    {lang === 'bn' ? 'সাম্প্রতিক সাবস্ক্রিপশন লেনদেন' : 'Recent Subscription Transactions'}
                  </h3>
                  <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-0.5">
                    {lang === 'bn' ? 'bKash, Nagad এবং Stripe মাধ্যমে প্রো আপগ্রেড হিস্ট্রি' : 'Live log of Pro upgrades and verification status'}
                  </p>
                </div>
                <button
                  onClick={loadTabData}
                  className="btn-secondary text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#FBF9F5] dark:bg-[#0E1619] border-b border-[#D4CDBC] dark:border-[#2F454C] text-[#59656D] dark:text-[#8E9FA5]">
                    <tr>
                      <th className="py-3 px-4 font-semibold">{lang === 'bn' ? 'তারিখ' : 'Date'}</th>
                      <th className="py-3 px-4 font-semibold">{lang === 'bn' ? 'মাধ্যম' : 'Method'}</th>
                      <th className="py-3 px-4 font-semibold">{lang === 'bn' ? 'পরিমাণ' : 'Amount'}</th>
                      <th className="py-3 px-4 font-semibold">{lang === 'bn' ? 'ট্রানজ্যাকশন আইডি' : 'TrxID / Session'}</th>
                      <th className="py-3 px-4 font-semibold">{lang === 'bn' ? 'স্ট্যাটাস' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4CDBC]/60 dark:divide-[#2F454C]/60">
                    {analyticsData?.revenue?.recentPayments && analyticsData.revenue.recentPayments.length > 0 ? (
                      analyticsData.revenue.recentPayments.map((p: any) => (
                        <tr key={p.id} className="hover:bg-[#F4EFE6]/50 dark:hover:bg-[#1A2A2F]/50 transition-colors">
                          <td className="py-3 px-4 text-[#59656D] dark:text-[#8E9FA5]">
                            {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                              p.method === 'bkash'
                                ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                                : p.method === 'nagad'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                            }`}>
                              {p.method}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#0F2E35] dark:text-[#F3EFE6]">
                            {p.currency === 'BDT' ? `৳${p.amount}` : `$${p.amount}`}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-[#59656D] dark:text-[#8E9FA5]">
                            {p.trxId}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="capitalize">{p.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-[#59656D] dark:text-[#8E9FA5]">
                          {lang === 'bn' ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No transactions recorded yet.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VOCABULARY */}
        {activeTab === 'vocab' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#59656D] dark:text-[#8E9FA5]" />
                <input
                  type="text"
                  placeholder="Search word, meaning, topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] rounded-xl text-xs sm:text-sm text-[#1A252C] dark:text-[#EDE8DF] focus:outline-none focus:ring-1 focus:ring-[#0F4C5C] dark:focus:ring-[#2DD4BF]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] rounded-xl text-xs text-[#1A252C] dark:text-[#EDE8DF]"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>

                <button
                  onClick={() => {
                    setEditingItem(null);
                    setVocabForm({
                      word: '',
                      partOfSpeech: 'noun',
                      pronunciation: '',
                      meaningEn: '',
                      meaningBn: '',
                      exampleEn: '',
                      exampleBn: '',
                      topic: 'General',
                      difficulty: 'medium',
                      status: 'published',
                    });
                    setModalType('vocab');
                  }}
                  className="btn-primary-teal text-xs py-2 px-3.5 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Word</span>
                </button>
              </div>
            </div>

            {/* Vocab Table */}
            <div className="bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F4EFE6] dark:bg-[#1C2D33] text-[#59656D] dark:text-[#8E9FA5] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-3.5">Word & POS</th>
                      <th className="p-3.5">Bangla Meaning</th>
                      <th className="p-3.5">English Example</th>
                      <th className="p-3.5">Difficulty</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE5DB] dark:divide-[#23353B]">
                    {vocabList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-[#59656D] dark:text-[#8E9FA5]">
                          {loading ? 'Loading vocabulary...' : 'No vocabulary items found.'}
                        </td>
                      </tr>
                    ) : (
                      vocabList.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FBF9F5] dark:hover:bg-[#18272C] transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-[#0F2E35] dark:text-[#F3EFE6] text-sm">
                              {item.word}
                            </div>
                            <div className="text-[11px] text-[#59656D] dark:text-[#8E9FA5]">
                              {item.partOfSpeech} {item.pronunciation && `· ${item.pronunciation}`}
                            </div>
                          </td>
                          <td className="p-3.5 font-medium text-[#0F4C5C] dark:text-[#2DD4BF] max-w-[200px] truncate">
                            {item.meaningBn}
                          </td>
                          <td className="p-3.5 text-[#59656D] dark:text-[#8E9FA5] max-w-[260px] truncate">
                            {item.exampleEn}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                item.difficulty === 'hard'
                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                  : item.difficulty === 'medium'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {item.difficulty}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.status === 'published'
                                  ? 'bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF]'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setVocabForm({
                                  word: item.word,
                                  partOfSpeech: item.partOfSpeech,
                                  pronunciation: item.pronunciation || '',
                                  meaningEn: item.meaningEn,
                                  meaningBn: item.meaningBn,
                                  exampleEn: item.exampleEn,
                                  exampleBn: item.exampleBn,
                                  topic: item.topic,
                                  difficulty: item.difficulty,
                                  status: item.status,
                                });
                                setModalType('vocab');
                              }}
                              className="p-1 rounded text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF]"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVocab(item.id)}
                              className="p-1 rounded text-[#59656D] dark:text-[#8E9FA5] hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GRAMMAR LESSONS */}
        {activeTab === 'lessons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6]">
                Grammar & Common Mistakes
              </h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setLessonForm({
                    title: '',
                    titleBn: '',
                    category: 'grammar',
                    subCategory: 'articles',
                    contentEn: '',
                    contentBn: '',
                    order: lessonsList.length + 1,
                    status: 'published',
                    commonMistakesBn: [{ incorrect: '', correct: '', explanationBn: '' }],
                  });
                  setModalType('lesson');
                }}
                className="btn-primary-teal text-xs py-2 px-3.5 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Lesson</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessonsList.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#D96B27] dark:text-[#FB923C] uppercase tracking-wider">
                        {lesson.subCategory || lesson.category}
                      </span>
                      <h3 className="font-heading font-bold text-base text-[#0F2E35] dark:text-[#F3EFE6] mt-0.5">
                        {lesson.title}
                      </h3>
                      <h4 className="text-xs font-medium text-[#0F4C5C] dark:text-[#2DD4BF]">
                        {lesson.titleBn}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingItem(lesson);
                          setLessonForm({
                            title: lesson.title,
                            titleBn: lesson.titleBn,
                            category: lesson.category,
                            subCategory: lesson.subCategory || 'general',
                            contentEn: lesson.contentEn,
                            contentBn: lesson.contentBn,
                            order: lesson.order || 1,
                            status: lesson.status,
                            commonMistakesBn: lesson.commonMistakesBn?.length
                              ? lesson.commonMistakesBn
                              : [{ incorrect: '', correct: '', explanationBn: '' }],
                          });
                          setModalType('lesson');
                        }}
                        className="p-1 text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-1 text-[#59656D] dark:text-[#8E9FA5] hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] line-clamp-2">
                    {lesson.contentBn}
                  </p>

                  {lesson.commonMistakesBn && lesson.commonMistakesBn.length > 0 && (
                    <div className="pt-2 border-t border-[#EAE5DB] dark:border-[#23353B] space-y-1.5">
                      <div className="text-[11px] font-bold text-[#59656D] dark:text-[#8E9FA5]">
                        Common Mistake Highlight:
                      </div>
                      <div className="p-2 rounded-lg bg-[#FAF2EB] dark:bg-[#2A1D13] text-xs">
                        <span className="line-through text-red-500 mr-2">
                          {lesson.commonMistakesBn[0].incorrect}
                        </span>
                        <span className="text-[#0F4C5C] dark:text-[#2DD4BF] font-semibold">
                          {lesson.commonMistakesBn[0].correct}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: READING PASSAGES */}
        {activeTab === 'passages' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6]">
                IELTS Reading Passages & Question Sets
              </h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setPassageForm({
                    title: '',
                    content: '',
                    difficulty: 'academic',
                    timeLimitMinutes: 20,
                    status: 'published',
                  });
                  setModalType('passage');
                }}
                className="btn-primary-teal text-xs py-2 px-3.5 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Passage</span>
              </button>
            </div>

            <div className="space-y-4">
              {passagesList.map((passage) => (
                <div
                  key={passage.id}
                  className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#E7EFF1] dark:bg-[#16363B] text-[10px] font-bold uppercase text-[#0F4C5C] dark:text-[#2DD4BF]">
                          {passage.difficulty}
                        </span>
                        <span className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                          {passage.timeLimitMinutes} minutes
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6] mt-1">
                        {passage.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingItem(passage);
                          setPassageForm({
                            title: passage.title,
                            content: passage.content,
                            difficulty: passage.difficulty,
                            timeLimitMinutes: passage.timeLimitMinutes,
                            status: passage.status,
                          });
                          setModalType('passage');
                        }}
                        className="p-1 text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePassage(passage.id)}
                        className="p-1 text-[#59656D] dark:text-[#8E9FA5] hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] line-clamp-3 leading-relaxed">
                    {passage.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: LISTENING */}
        {activeTab === 'listening' && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6]">
              IELTS Listening Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listeningList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs space-y-2"
                >
                  <span className="text-[10px] font-bold text-[#D96B27] dark:text-[#FB923C] uppercase">
                    Section {item.section}
                  </span>
                  <h3 className="font-heading font-bold text-base text-[#0F2E35] dark:text-[#F3EFE6]">
                    {item.title}
                  </h3>
                  <div className="text-xs font-mono text-[#0F4C5C] dark:text-[#2DD4BF] truncate">
                    {item.audioUrl}
                  </div>
                  <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] line-clamp-2">
                    {item.transcript}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: WRITING & SPEAKING */}
        {activeTab === 'writing_speaking' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6] mb-3">
                Writing Prompts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {writingList.map((wp) => (
                  <div
                    key={wp.id}
                    className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs space-y-2"
                  >
                    <span className="px-2 py-0.5 rounded bg-[#E7EFF1] dark:bg-[#16363B] text-[10px] font-bold uppercase text-[#0F4C5C] dark:text-[#2DD4BF]">
                      {wp.taskType}
                    </span>
                    <h3 className="font-heading font-bold text-base text-[#0F2E35] dark:text-[#F3EFE6]">
                      {wp.title}
                    </h3>
                    <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] line-clamp-3">
                      {wp.prompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6] mb-3">
                Speaking Cue Cards
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {speakingList.map((sc) => (
                  <div
                    key={sc.id}
                    className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs space-y-2"
                  >
                    <span className="px-2 py-0.5 rounded bg-[#FAF2EB] dark:bg-[#351B0F] text-[10px] font-bold uppercase text-[#D96B27] dark:text-[#FB923C]">
                      Part {sc.part} Cue Card
                    </span>
                    <h3 className="font-heading font-bold text-base text-[#0F2E35] dark:text-[#F3EFE6]">
                      {sc.topic}
                    </h3>
                    <div className="text-xs text-[#0F4C5C] dark:text-[#2DD4BF]">{sc.topicBn}</div>
                    <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] whitespace-pre-line line-clamp-3">
                      {sc.cueCard}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#59656D] dark:text-[#8E9FA5]" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] rounded-xl text-xs sm:text-sm text-[#1A252C] dark:text-[#EDE8DF] focus:outline-none focus:ring-1 focus:ring-[#0F4C5C] dark:focus:ring-[#2DD4BF]"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F4EFE6] dark:bg-[#1C2D33] text-[#59656D] dark:text-[#8E9FA5] uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Plan</th>
                      <th className="p-3.5">Streak & XP</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE5DB] dark:divide-[#23353B]">
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-[#59656D] dark:text-[#8E9FA5]">
                          {loading ? 'Loading users...' : 'No users found.'}
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-[#FBF9F5] dark:hover:bg-[#18272C] transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-[#0F2E35] dark:text-[#F3EFE6] text-sm">
                              {u.name || 'Unnamed User'}
                            </div>
                            <div className="text-[11px] text-[#59656D] dark:text-[#8E9FA5]">
                              {u.email}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <button
                              onClick={() => handleToggleRole(u)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                                u.role === 'admin'
                                  ? 'bg-[#0F4C5C]/15 text-[#0F4C5C] dark:bg-[#2DD4BF]/20 dark:text-[#2DD4BF]'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                              title="Click to toggle role"
                            >
                              {u.role}
                            </button>
                          </td>

                          <td className="p-3.5">
                            <button
                              onClick={() => handleTogglePlan(u)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                                u.plan === 'premium'
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                              title="Click to toggle plan"
                            >
                              {u.plan === 'premium' && <Crown className="w-3 h-3" />}
                              <span>{u.plan}</span>
                            </button>
                          </td>

                          <td className="p-3.5 text-[#59656D] dark:text-[#8E9FA5]">
                            <div>Streak: {u.dailyStreak} days</div>
                            <div>XP: {u.xp}</div>
                          </td>

                          <td className="p-3.5">
                            {u.banned ? (
                              <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold">
                                Banned
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                                Active
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleToggleBan(u)}
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                u.banned
                                  ? 'text-emerald-600 hover:underline'
                                  : 'text-red-500 hover:underline'
                              }`}
                            >
                              {u.banned ? 'Unban' : 'Ban'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================== */}
      {/* VOCAB MODAL */}
      {/* ========================================== */}
      {modalType === 'vocab' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#142024] rounded-2xl max-w-lg w-full p-6 border border-[#D4CDBC] dark:border-[#2F454C] shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE5DB] dark:border-[#23353B] pb-3">
              <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6]">
                {editingItem ? 'Edit Vocabulary Word' : 'Add Vocabulary Word'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-[#59656D] dark:text-[#8E9FA5] hover:text-[#1A252C] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVocab} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                    Word
                  </label>
                  <input
                    type="text"
                    required
                    value={vocabForm.word}
                    onChange={(e) => setVocabForm({ ...vocabForm, word: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                    Part of Speech
                  </label>
                  <input
                    type="text"
                    required
                    value={vocabForm.partOfSpeech}
                    onChange={(e) => setVocabForm({ ...vocabForm, partOfSpeech: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                  Bangla Meaning
                </label>
                <input
                  type="text"
                  required
                  value={vocabForm.meaningBn}
                  onChange={(e) => setVocabForm({ ...vocabForm, meaningBn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                  English Meaning
                </label>
                <input
                  type="text"
                  required
                  value={vocabForm.meaningEn}
                  onChange={(e) => setVocabForm({ ...vocabForm, meaningEn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                  English Example Sentence
                </label>
                <textarea
                  required
                  rows={2}
                  value={vocabForm.exampleEn}
                  onChange={(e) => setVocabForm({ ...vocabForm, exampleEn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                  Bangla Example Translation
                </label>
                <textarea
                  required
                  rows={2}
                  value={vocabForm.exampleBn}
                  onChange={(e) => setVocabForm({ ...vocabForm, exampleBn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                    Difficulty
                  </label>
                  <select
                    value={vocabForm.difficulty}
                    onChange={(e) => setVocabForm({ ...vocabForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                    Status
                  </label>
                  <select
                    value={vocabForm.status}
                    onChange={(e) => setVocabForm({ ...vocabForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-teal text-xs px-4 py-2">
                  Save Word
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* LESSON MODAL */}
      {/* ========================================== */}
      {modalType === 'lesson' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#142024] rounded-2xl max-w-xl w-full p-6 border border-[#D4CDBC] dark:border-[#2F454C] shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE5DB] dark:border-[#23353B] pb-3">
              <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6]">
                {editingItem ? 'Edit Grammar Lesson' : 'Add Grammar Lesson'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-[#59656D] dark:text-[#8E9FA5] hover:text-[#1A252C] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                    Lesson Title (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                    Lesson Title (Bangla)
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonForm.titleBn}
                    onChange={(e) => setLessonForm({ ...lessonForm, titleBn: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={lessonForm.subCategory}
                    onChange={(e) => setLessonForm({ ...lessonForm, subCategory: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                    Status
                  </label>
                  <select
                    value={lessonForm.status}
                    onChange={(e) => setLessonForm({ ...lessonForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                  Bangla Explanation Content
                </label>
                <textarea
                  required
                  rows={3}
                  value={lessonForm.contentBn}
                  onChange={(e) => setLessonForm({ ...lessonForm, contentBn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                  English Content
                </label>
                <textarea
                  required
                  rows={2}
                  value={lessonForm.contentEn}
                  onChange={(e) => setLessonForm({ ...lessonForm, contentEn: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                />
              </div>

              {/* Common Mistakes Editor */}
              <div className="pt-2 border-t border-[#EAE5DB] dark:border-[#23353B] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#59656D] dark:text-[#8E9FA5]">
                    Common Bangla Speaker Mistakes
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setLessonForm({
                        ...lessonForm,
                        commonMistakesBn: [
                          ...lessonForm.commonMistakesBn,
                          { incorrect: '', correct: '', explanationBn: '' },
                        ],
                      })
                    }
                    className="text-xs text-[#0F4C5C] dark:text-[#2DD4BF] font-semibold"
                  >
                    + Add Mistake Item
                  </button>
                </div>

                {lessonForm.commonMistakesBn.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#F4EFE6] dark:bg-[#1C2D33] space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Incorrect (e.g. married with)"
                        value={m.incorrect}
                        onChange={(e) => {
                          const updated = [...lessonForm.commonMistakesBn];
                          updated[idx].incorrect = e.target.value;
                          setLessonForm({ ...lessonForm, commonMistakesBn: updated });
                        }}
                        className="px-2.5 py-1.5 bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] rounded"
                      />
                      <input
                        type="text"
                        placeholder="Correct (e.g. married to)"
                        value={m.correct}
                        onChange={(e) => {
                          const updated = [...lessonForm.commonMistakesBn];
                          updated[idx].correct = e.target.value;
                          setLessonForm({ ...lessonForm, commonMistakesBn: updated });
                        }}
                        className="px-2.5 py-1.5 bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] rounded"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Bangla explanation why it is wrong"
                      value={m.explanationBn}
                      onChange={(e) => {
                        const updated = [...lessonForm.commonMistakesBn];
                        updated[idx].explanationBn = e.target.value;
                        setLessonForm({ ...lessonForm, commonMistakesBn: updated });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] rounded"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-teal text-xs px-4 py-2">
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* PASSAGE MODAL */}
      {/* ========================================== */}
      {modalType === 'passage' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#142024] rounded-2xl max-w-xl w-full p-6 border border-[#D4CDBC] dark:border-[#2F454C] shadow-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE5DB] dark:border-[#23353B] pb-3">
              <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6]">
                {editingItem ? 'Edit Reading Passage' : 'Add Reading Passage'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-[#59656D] dark:text-[#8E9FA5] hover:text-[#1A252C] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassage} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                  Passage Title
                </label>
                <input
                  type="text"
                  required
                  value={passageForm.title}
                  onChange={(e) => setPassageForm({ ...passageForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                    Difficulty
                  </label>
                  <select
                    value={passageForm.difficulty}
                    onChange={(e) => setPassageForm({ ...passageForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                  >
                    <option value="academic">Academic</option>
                    <option value="general">General Training</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                    Time Limit (Minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={passageForm.timeLimitMinutes}
                    onChange={(e) =>
                      setPassageForm({ ...passageForm, timeLimitMinutes: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#59656D] dark:text-[#8E9FA5] mb-1">
                  Passage Text (Academic Article)
                </label>
                <textarea
                  required
                  rows={8}
                  value={passageForm.content}
                  onChange={(e) => setPassageForm({ ...passageForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg text-[#0F2E35] dark:text-[#F3EFE6]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-teal text-xs px-4 py-2">
                  Save Passage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
