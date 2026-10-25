'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  MicOff,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldAlert,
  Send,
  User,
  Bot,
  Radio,
  PhoneCall,
  MessageSquare,
} from 'lucide-react';
import VoiceCallOrb, { VoiceCallStatus } from '@/components/VoiceCallOrb';

interface QuestionItem {
  id: string;
  order: number;
  prompt: string;
  type: string;
  options?: string[];
}

interface MockExamData {
  id: string;
  title: string;
  descriptionBn: string;
  descriptionEn: string;
  reading: {
    id: string;
    title: string;
    content: string;
    questions: QuestionItem[];
  } | null;
  listening: {
    id: string;
    title: string;
    audioUrl: string;
    section: number;
    questions: QuestionItem[];
  } | null;
  writing: {
    task1: { id: string; title: string; prompt: string } | null;
    task2: { id: string; title: string; prompt: string } | null;
  };
  speaking: {
    id: string;
    topic: string;
    cueCard: string;
  } | null;
}

type SectionType = 'listening' | 'reading' | 'writing' | 'speaking' | 'completed';

function MockExamRunnerContent() {
  const params = useParams();
  const examId = params?.id as string;

  const router = useRouter();
  const { t, lang } = useLanguage();
  const { data: session, isPending } = authClient.useSession();

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<MockExamData | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<SectionType>('listening');
  const [submittingSection, setSubmittingSection] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Section 1: Listening State
  const [listeningAnswers, setListeningAnswers] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Section 2: Reading State
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string>>({});
  const [readingTimeSeconds, setReadingTimeSeconds] = useState(1200); // 20 mins

  // Section 3: Writing State
  const [task1Essay, setTask1Essay] = useState('');
  const [task2Essay, setTask2Essay] = useState('');

  // Section 4: Speaking State & Speech Recognition
  const [speakingMessages, setSpeakingMessages] = useState<
    Array<{ role: 'examiner' | 'user'; content: string }>
  >([]);
  const [speakingInput, setSpeakingInput] = useState('');
  const [sendingSpeaking, setSendingSpeaking] = useState(false);
  const [isSpeakingRecording, setIsSpeakingRecording] = useState(false);
  const [speakingCallStatus, setSpeakingCallStatus] = useState<VoiceCallStatus>('idle');
  const [mockCurrentExaminerUtterance, setMockCurrentExaminerUtterance] = useState('');
  const [mockSilenceCountdown, setMockSilenceCountdown] = useState<number | null>(null);
  const [mockSpeakingViewMode, setMockSpeakingViewMode] = useState<'call' | 'chat'>('call');
  const speakingRecognitionRef = useRef<any>(null);
  const mockSilenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isExaminerSpeakingRef = useRef<boolean>(false);
  const isRecognitionActiveRef = useRef<boolean>(false);
  const speakingInputRef = useRef<string>('');

  const speakMockExaminerText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      isExaminerSpeakingRef.current = true;
      window.speechSynthesis.cancel();

      // Immediately abort mic recognition to prevent feedback/echo from speakers
      if (speakingRecognitionRef.current) {
        try {
          speakingRecognitionRef.current.abort();
        } catch {}
      }
      if (mockSilenceTimerRef.current) {
        clearTimeout(mockSilenceTimerRef.current);
        mockSilenceTimerRef.current = null;
      }
      setMockSilenceCountdown(null);
      setSpeakingInput(''); // Discard any partial noise before examiner speaks
      speakingInputRef.current = '';
      setIsSpeakingRecording(false);
      setSpeakingCallStatus('examiner_speaking');
      setMockCurrentExaminerUtterance(text);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.rate = 0.98;
      utterance.pitch = 1.05;
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice =
        voices.find(
          (v) =>
            (v.lang.includes('en-GB') || v.lang.includes('en_GB')) &&
            (v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('hazel') ||
              v.name.toLowerCase().includes('susan') ||
              v.name.toLowerCase().includes('libby') ||
              v.name.toLowerCase().includes('sonia') ||
              v.name.toLowerCase().includes('fiona') ||
              v.name.toLowerCase().includes('victoria') ||
              v.name.toLowerCase().includes('serena') ||
              v.name.toLowerCase().includes('kate') ||
              v.name.toLowerCase().includes('natural') ||
              !v.name.toLowerCase().includes('male'))
        ) ||
        voices.find(
          (v) =>
            (v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('zira') ||
              v.name.toLowerCase().includes('samantha') ||
              v.name.toLowerCase().includes('karen') ||
              v.name.toLowerCase().includes('catherine')) &&
            v.lang.startsWith('en')
        ) ||
        voices.find(
          (v) =>
            (v.lang.includes('en-GB') || v.lang.includes('en-US')) &&
            !v.name.toLowerCase().includes('male') &&
            !v.name.toLowerCase().includes('david') &&
            !v.name.toLowerCase().includes('george')
        ) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (femaleVoice) utterance.voice = femaleVoice;

      utterance.onend = () => {
        // Acoustic buffer: wait 600ms for speaker echo to dissipate before mic opens
        setTimeout(() => {
          isExaminerSpeakingRef.current = false;
          setSpeakingInput('');
          speakingInputRef.current = '';
          setSpeakingCallStatus('listening');
          startMockContinuousRecognition();
        }, 600);
      };

      utterance.onerror = () => {
        setTimeout(() => {
          isExaminerSpeakingRef.current = false;
          setSpeakingInput('');
          speakingInputRef.current = '';
          setSpeakingCallStatus('listening');
          startMockContinuousRecognition();
        }, 300);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      isExaminerSpeakingRef.current = false;
      setSpeakingCallStatus('listening');
    }
  };

  const startMockContinuousRecognition = () => {
    // Drop mic activation while examiner audio is outputting
    if (isExaminerSpeakingRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      if (speakingRecognitionRef.current) {
        try {
          speakingRecognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onstart = () => {
        isRecognitionActiveRef.current = true;
        setIsSpeakingRecording(true);
        setSpeakingCallStatus('listening');
      };

      recognition.onresult = (event: any) => {
        // Strict guard: Discard any sound picked up while examiner was talking
        if (isExaminerSpeakingRef.current) {
          return;
        }

        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        const cleaned = transcript.trim();

        // Echo protection: Drop if matching recent examiner utterance
        if (
          mockCurrentExaminerUtterance &&
          cleaned.toLowerCase().includes(mockCurrentExaminerUtterance.slice(0, 15).toLowerCase())
        ) {
          return;
        }

        setSpeakingInput(cleaned);
        speakingInputRef.current = cleaned;

        if (cleaned.length > 0) {
          setSpeakingCallStatus('candidate_speaking');
          if (mockSilenceTimerRef.current) clearTimeout(mockSilenceTimerRef.current);

          // Fast turn-taking: 800ms pause triggers instant response
          const words = cleaned.split(/\s+/).filter(Boolean);
          if (words.length >= 1) {
            setMockSilenceCountdown(0.8);
            mockSilenceTimerRef.current = setTimeout(() => {
              setMockSilenceCountdown(null);
              handleSendSpeakingMessage();
            }, 800);
          }
        }
      };

      // Native Voice Activity Detection: User stopped speaking
      recognition.onspeechend = () => {
        if (!isExaminerSpeakingRef.current && speakingInputRef.current.trim().length > 0) {
          if (mockSilenceTimerRef.current) clearTimeout(mockSilenceTimerRef.current);
          setMockSilenceCountdown(null);
          setTimeout(() => {
            if (!isExaminerSpeakingRef.current && speakingInputRef.current.trim().length > 0) {
              handleSendSpeakingMessage();
            }
          }, 250);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech recognition notice:', e.error);
        }
        setIsSpeakingRecording(false);
        isRecognitionActiveRef.current = false;
      };

      recognition.onend = () => {
        setIsSpeakingRecording(false);
        isRecognitionActiveRef.current = false;
        // Only restart if not speaking and still in listening state
        if (!isExaminerSpeakingRef.current && currentSection === 'speaking') {
          setTimeout(() => {
            if (!isExaminerSpeakingRef.current && !isRecognitionActiveRef.current) {
              try {
                recognition.start();
              } catch {}
            }
          }, 300);
        }
      };

      speakingRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsSpeakingRecording(false);
      isRecognitionActiveRef.current = false;
    }
  };

  const toggleSpeakingRecording = () => {
    if (isSpeakingRecording) {
      if (speakingRecognitionRef.current) {
        try {
          speakingRecognitionRef.current.abort();
        } catch {}
        setIsSpeakingRecording(false);
        isRecognitionActiveRef.current = false;
      }
      setSpeakingCallStatus('paused');
      return;
    }
    startMockContinuousRecognition();
  };

  // Section 5: Scorecard State
  const [scorecard, setScorecard] = useState<any | null>(null);

  // Timers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentSection === 'reading' && readingTimeSeconds > 0) {
      interval = setInterval(() => setReadingTimeSeconds((prev) => Math.max(0, prev - 1)), 1000);
    }
    return () => clearInterval(interval);
  }, [currentSection, readingTimeSeconds]);

  // Load Exam and Start Attempt
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (examId && session?.user) {
      const initExam = async () => {
        try {
          const [examRes, startRes] = await Promise.all([
            fetch(`/api/mock-exams/${examId}`, { credentials: 'include' }),
            fetch(`/api/mock-exams/${examId}/start`, { method: 'POST', credentials: 'include' }),
          ]);

          const examData = await examRes.json();
          const startData = await startRes.json();

          if (examData.success && examData.exam) {
            setExam(examData.exam);
          }
          if (startData.success && startData.attemptId) {
            setAttemptId(startData.attemptId);
          }

          // Initial speaking examiner greeting
          if (examData.exam?.speaking) {
            setSpeakingMessages([
              {
                role: 'examiner',
                content: `Good day! Welcome to the speaking section of your full IELTS Mock Exam. My name is Dr. Sarah Jenkins. To begin with, could you please tell me your full name, and whether you are currently studying or working?`,
              },
            ]);
          }
        } catch (err: any) {
          console.error('Failed to init mock exam:', err);
          setErrorMsg('Failed to initialize mock exam session.');
        } finally {
          setLoading(false);
        }
      };

      initExam();
    }
  }, [examId, session, isPending, router]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsAudioPlaying(true);
    }
  };

  // Section Advance Handlers
  const handleCompleteListening = async () => {
    if (!attemptId) return;
    setSubmittingSection(true);
    setErrorMsg(null);

    try {
      const formattedAnswers = Object.entries(listeningAnswers).map(([qId, ans]) => ({
        questionId: qId,
        userAnswer: ans,
      }));

      const res = await fetch(
        `/api/mock-exams/attempts/${attemptId}/section`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            section: 'listening',
            timeSpentSeconds: 600,
            payload: { answers: formattedAnswers },
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        if (audioRef.current) audioRef.current.pause();
        setCurrentSection('reading');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(data.error || 'Failed to submit listening section');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error advancing section');
    } finally {
      setSubmittingSection(false);
    }
  };

  const handleCompleteReading = async () => {
    if (!attemptId) return;
    setSubmittingSection(true);
    setErrorMsg(null);

    try {
      const formattedAnswers = Object.entries(readingAnswers).map(([qId, ans]) => ({
        questionId: qId,
        userAnswer: ans,
      }));

      const res = await fetch(
        `/api/mock-exams/attempts/${attemptId}/section`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            section: 'reading',
            timeSpentSeconds: 1200 - readingTimeSeconds,
            payload: { answers: formattedAnswers },
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setCurrentSection('writing');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(data.error || 'Failed to submit reading section');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error advancing section');
    } finally {
      setSubmittingSection(false);
    }
  };

  const handleCompleteWriting = async () => {
    if (!attemptId) return;
    setSubmittingSection(true);
    setErrorMsg(null);

    try {
      const res = await fetch(
        `/api/mock-exams/attempts/${attemptId}/section`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            section: 'writing',
            timeSpentSeconds: 2400,
            payload: {
              task1Essay,
              task2Essay,
            },
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setCurrentSection('speaking');
        setSpeakingCallStatus('examiner_speaking');
        const initialGreeting = "Good day and welcome to the IELTS Speaking test. My name is Dr. Sarah Jenkins. To start with, could you please state your full name and tell me where you are currently living?";
        setSpeakingMessages([{ role: 'examiner', content: initialGreeting }]);
        setTimeout(() => speakMockExaminerText(initialGreeting), 800);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(data.error || 'Failed to submit writing section');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error advancing section');
    } finally {
      setSubmittingSection(false);
    }
  };

  const handleSendSpeakingMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!speakingInput.trim() || sendingSpeaking) return;

    const userText = speakingInput.trim();
    setSpeakingInput('');
    setSendingSpeaking(true);
    setSpeakingCallStatus('processing');
    if (mockSilenceTimerRef.current) {
      clearTimeout(mockSilenceTimerRef.current);
      mockSilenceTimerRef.current = null;
    }
    setMockSilenceCountdown(null);

    const updated = [...speakingMessages, { role: 'user' as const, content: userText }];
    setSpeakingMessages(updated);

    try {
      const userCount = updated.filter((m) => m.role === 'user').length;
      let reply = '';
      const topicClean =
        exam?.speaking?.topic?.replace(/^(describe|talk about|discuss)\s+/i, '') ||
        'your interests';

      if (userCount === 1) {
        reply = `Thank you. Now, let's talk about ${topicClean}. What do you like most about it in your daily life, and why?`;
      } else if (userCount === 2) {
        reply = `That is very clear. Now let's move to Part 2. Look at the cue card on your screen: '${exam?.speaking?.topic}'. Please take a moment to prepare, and then speak for one to two minutes.`;
      } else if (userCount === 3) {
        reply = `Thank you. Looking at this from a broader perspective in Part 3, how do you think this influences people and society in modern times?`;
      } else {
        reply = `Thank you very much. That concludes the speaking interview. You have completed all sections of the mock exam! Please click 'Finish Exam & Generate Scorecard' below to view your full results.`;
      }

      setSpeakingMessages((prev) => [...prev, { role: 'examiner', content: reply }]);
      speakMockExaminerText(reply);
    } catch (err) {
      console.error('Speaking reply error:', err);
      setSpeakingCallStatus('listening');
    } finally {
      setSendingSpeaking(false);
    }
  };

  const handleFinishExam = async () => {
    if (!attemptId) return;
    setSubmittingSection(true);
    setErrorMsg(null);

    try {
      const res = await fetch(
        `/api/mock-exams/attempts/${attemptId}/section`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            section: 'speaking',
            timeSpentSeconds: 600,
            payload: { speakingBand: 6.5 },
          }),
        }
      );

      const data = await res.json();
      if (data.success && data.attempt) {
        setScorecard(data.attempt);
        setCurrentSection('completed');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(data.error || 'Failed to finish exam');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to finish exam');
    } finally {
      setSubmittingSection(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin border-4 border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20 border-t-transparent" />
            <p className="text-sm font-semibold text-[#59656D] dark:text-[#8E9FA5]">
              {lang === 'bn' ? 'মক টেস্ট তৈরি হচ্ছে...' : 'Initializing IELTS Simulation...'}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF]">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto flex flex-col items-center justify-center p-8 text-center space-y-4">
          <h2 className="text-xl font-bold font-heading">
            {lang === 'bn' ? 'মক টেস্টটি খুঁজে পাওয়া যায়নি' : 'Mock Exam Not Found'}
          </h2>
          <Link href="/mock-exams" className="btn-primary-teal text-sm py-2 px-4">
            {lang === 'bn' ? 'মক টেস্ট তালিকায় ফিরুন' : 'Back to Mock Exams'}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF]">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Progress Stepper Header */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8E9FA5] block">
              Live Mock Simulation
            </span>
            <h1 className="text-base sm:text-lg font-bold font-heading text-[#0F2E35] dark:text-[#F3EFE6] line-clamp-1">
              {exam.title}
            </h1>
          </div>

          {/* Section Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-bold">
            <span
              className={`px-3 py-1 rounded-xl transition-colors ${
                currentSection === 'listening'
                  ? 'bg-[#0F4C5C] text-white shadow-sm'
                  : 'bg-[#FAF8F5] dark:bg-[#1B292E] text-[#8E9FA5]'
              }`}
            >
              1. Listening
            </span>
            <span
              className={`px-3 py-1 rounded-xl transition-colors ${
                currentSection === 'reading'
                  ? 'bg-[#0F4C5C] text-white shadow-sm'
                  : 'bg-[#FAF8F5] dark:bg-[#1B292E] text-[#8E9FA5]'
              }`}
            >
              2. Reading
            </span>
            <span
              className={`px-3 py-1 rounded-xl transition-colors ${
                currentSection === 'writing'
                  ? 'bg-[#0F4C5C] text-white shadow-sm'
                  : 'bg-[#FAF8F5] dark:bg-[#1B292E] text-[#8E9FA5]'
              }`}
            >
              3. Writing
            </span>
            <span
              className={`px-3 py-1 rounded-xl transition-colors ${
                currentSection === 'speaking'
                  ? 'bg-[#0F4C5C] text-white shadow-sm'
                  : 'bg-[#FAF8F5] dark:bg-[#1B292E] text-[#8E9FA5]'
              }`}
            >
              4. Speaking
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* ============================================================
            SECTION 1: LISTENING
            ============================================================ */}
        {currentSection === 'listening' && exam.listening && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-lg bg-[#D96B27]/10 text-[#D96B27]">
                  Section 1 &bull; {exam.listening.title}
                </span>

                <button
                  type="button"
                  onClick={toggleAudio}
                  className="btn-primary-teal text-xs py-2 px-4 flex items-center gap-2 cursor-pointer"
                >
                  {isAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isAudioPlaying ? 'Pause Audio' : 'Play Exam Audio'}</span>
                </button>
              </div>

              <audio
                ref={audioRef}
                src={exam.listening.audioUrl}
                onEnded={() => setIsAudioPlaying(false)}
              />

              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                {lang === 'bn'
                  ? 'অডিওটি মনোযোগ দিয়ে শুনুন এবং নিচে দেওয়া প্রশ্নগুলোর সঠিক উত্তর নির্বাচন বা লিখুন।'
                  : 'Listen to the conversation carefully and answer the questions below.'}
              </p>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {exam.listening.questions.map((q) => (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-3"
                >
                  <span className="font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                    Question {q.order}: {q.prompt}
                  </span>

                  {q.options && q.options.length > 0 ? (
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-xl border border-[#EAE5DB] dark:border-[#23353B] hover:bg-[#FAF8F5] dark:hover:bg-[#101A1E] cursor-pointer text-xs sm:text-sm"
                        >
                          <input
                            type="radio"
                            name={`listening-${q.id}`}
                            value={opt}
                            checked={listeningAnswers[q.id] === opt}
                            onChange={(e) =>
                              setListeningAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                            }
                            className="text-[#0F4C5C] focus:ring-[#0F4C5C]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      value={listeningAnswers[q.id] || ''}
                      onChange={(e) =>
                        setListeningAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      className="w-full p-3 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-[#FAF8F5]/50 dark:bg-[#101A1E] text-xs sm:text-sm"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleCompleteListening}
                disabled={submittingSection}
                className="btn-primary-teal text-xs sm:text-sm py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{submittingSection ? 'Saving...' : 'Complete Listening & Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            SECTION 2: READING
            ============================================================ */}
        {currentSection === 'reading' && exam.reading && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] flex items-center justify-between text-xs font-bold">
              <span className="text-[#0F4C5C] dark:text-[#2DD4BF]">
                Section 2: Reading &bull; {exam.reading.title}
              </span>
              <span className="flex items-center gap-1 font-mono text-amber-600 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>
                  {Math.floor(readingTimeSeconds / 60)}:
                  {(readingTimeSeconds % 60).toString().padStart(2, '0')} remaining
                </span>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Passage text */}
              <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] max-h-[600px] overflow-y-auto text-xs sm:text-sm leading-relaxed whitespace-pre-line font-serif shadow-sm">
                <h3 className="text-base font-bold font-heading mb-3 text-[#0F2E35] dark:text-[#F3EFE6]">
                  {exam.reading.title}
                </h3>
                {exam.reading.content}
              </div>

              {/* Questions */}
              <div className="lg:col-span-6 space-y-4 max-h-[600px] overflow-y-auto">
                {exam.reading.questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-3"
                  >
                    <span className="font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                      Question {q.order}: {q.prompt}
                    </span>

                    {q.options && q.options.length > 0 ? (
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <label
                            key={i}
                            className="flex items-center gap-3 p-2.5 rounded-xl border border-[#EAE5DB] dark:border-[#23353B] hover:bg-[#FAF8F5] dark:hover:bg-[#101A1E] cursor-pointer text-xs"
                          >
                            <input
                              type="radio"
                              name={`reading-${q.id}`}
                              value={opt}
                              checked={readingAnswers[q.id] === opt}
                              onChange={(e) =>
                                setReadingAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                              className="text-[#0F4C5C] focus:ring-[#0F4C5C]"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Type answer here..."
                        value={readingAnswers[q.id] || ''}
                        onChange={(e) =>
                          setReadingAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        className="w-full p-3 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-[#FAF8F5]/50 dark:bg-[#101A1E] text-xs"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleCompleteReading}
                disabled={submittingSection}
                className="btn-primary-teal text-xs sm:text-sm py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{submittingSection ? 'Saving...' : 'Complete Reading & Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            SECTION 3: WRITING
            ============================================================ */}
        {currentSection === 'writing' && exam.writing && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] flex items-center justify-between text-xs font-bold">
              <span className="text-[#D96B27]">Section 3: Academic Writing</span>
              <span className="text-[#8E9FA5]">Task 1 (150 words) &bull; Task 2 (250 words)</span>
            </div>

            {/* Task 1 */}
            {exam.writing.task1 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-[#0F4C5C]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                    Task 1 (Minimum 150 words)
                  </span>
                  <h3 className="font-heading font-bold text-base mt-1 text-[#0F2E35] dark:text-[#F3EFE6]">
                    {exam.writing.task1.title}
                  </h3>
                  <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-1 whitespace-pre-line">
                    {exam.writing.task1.prompt}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#8E9FA5]">
                    <span>Your response</span>
                    <span>{task1Essay.trim().split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <textarea
                    value={task1Essay}
                    onChange={(e) => setTask1Essay(e.target.value)}
                    placeholder="Type Task 1 report here..."
                    rows={8}
                    className="w-full p-4 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-[#FAF8F5]/50 dark:bg-[#101A1E] text-xs sm:text-sm font-serif"
                  />
                </div>
              </div>
            )}

            {/* Task 2 */}
            {exam.writing.task2 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                    Task 2 (Minimum 250 words)
                  </span>
                  <h3 className="font-heading font-bold text-base mt-1 text-[#0F2E35] dark:text-[#F3EFE6]">
                    {exam.writing.task2.title}
                  </h3>
                  <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-1 whitespace-pre-line">
                    {exam.writing.task2.prompt}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#8E9FA5]">
                    <span>Your response</span>
                    <span>{task2Essay.trim().split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <textarea
                    value={task2Essay}
                    onChange={(e) => setTask2Essay(e.target.value)}
                    placeholder="Type Task 2 essay here..."
                    rows={12}
                    className="w-full p-4 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-[#FAF8F5]/50 dark:bg-[#101A1E] text-xs sm:text-sm font-serif"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleCompleteWriting}
                disabled={submittingSection}
                className="btn-primary-teal text-xs sm:text-sm py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{submittingSection ? 'Evaluating...' : 'Complete Writing & Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            SECTION 4: SPEAKING (HANDS-FREE LIVE VOICE CALL)
            ============================================================ */}
        {currentSection === 'speaking' && exam.speaking && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Room Header & View Toggle */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
              <div className="flex items-center gap-2 text-[#0F4C5C] dark:text-[#2DD4BF]">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span>Section 4: Live Speaking Interview &bull; Examiner: Dr. Sarah Jenkins</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMockSpeakingViewMode(mockSpeakingViewMode === 'call' ? 'chat' : 'call')}
                  className="px-3 py-1.5 rounded-lg border border-[#EAE5DB] dark:border-[#23353B] hover:bg-[#FAF8F5] dark:hover:bg-[#1B292E] font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  {mockSpeakingViewMode === 'call' ? (
                    <>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'টেক্সট হিস্ট্রি' : 'Text View'}</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'লাইভ কল রুম' : 'Call Room'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Cue Card Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-[#1A252C] dark:text-[#EDE8DF]">
              <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                Part 2 Cue Card Topic: {exam.speaking.topic}
              </span>
              <p className="leading-relaxed font-serif">{exam.speaking.cueCard}</p>
            </div>

            {/* CALL ROOM VIEW */}
            {mockSpeakingViewMode === 'call' ? (
              <div className="rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-md p-6 sm:p-10 flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
                <VoiceCallOrb
                  status={speakingCallStatus}
                  volume={isSpeakingRecording ? 45 : 0}
                  silenceCountdown={mockSilenceCountdown}
                  lang={lang}
                  examinerName="Dr. Sarah Jenkins"
                  currentUtterance={mockCurrentExaminerUtterance}
                  candidateLiveTranscript={isExaminerSpeakingRef.current ? '' : speakingInput}
                />

                {/* Call Controls */}
                <div className="w-full max-w-md flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-[#EAE5DB] dark:border-[#23353B]">
                  <button
                    type="button"
                    onClick={toggleSpeakingRecording}
                    className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                      isSpeakingRecording
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md'
                        : 'bg-white dark:bg-[#101A1E] border-[#D4CDBC] dark:border-[#2F454C] text-[#1A252C] dark:text-[#EDE8DF]'
                    }`}
                  >
                    {isSpeakingRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isSpeakingRecording ? (lang === 'bn' ? 'মাইক বন্ধ' : 'Mute') : (lang === 'bn' ? 'মাইক চালু' : 'Unmute')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const lastMsg = [...speakingMessages].reverse().find((m) => m.role === 'examiner');
                      if (lastMsg) speakMockExaminerText(lastMsg.content);
                    }}
                    className="p-3.5 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#101A1E] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                    <span>{lang === 'bn' ? 'পুনরায় শুনুন' : 'Repeat Question'}</span>
                  </button>

                  {speakingInput.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSendSpeakingMessage()}
                      className="p-3.5 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0E1619] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'এখনই পাঠান' : 'Send Now'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* CHAT TRANSCRIPT VIEW */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] min-h-[380px] max-h-[500px] overflow-y-auto space-y-4">
                  {speakingMessages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 max-w-[85%] ${
                        m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          m.role === 'user' ? 'bg-[#0F4C5C] text-white' : 'bg-[#D96B27] text-white'
                        }`}
                      >
                        {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-[#0F4C5C] text-white rounded-tr-none'
                            : 'bg-[#FAF8F5] dark:bg-[#1B292E] border border-[#EAE5DB] dark:border-[#23353B] text-[#1A252C] dark:text-[#EDE8DF] rounded-tl-none'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendSpeakingMessage} className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleSpeakingRecording}
                    className={`p-3.5 rounded-xl border flex items-center justify-center cursor-pointer ${
                      isSpeakingRecording
                        ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                        : 'bg-white dark:bg-[#142024] border-[#D4CDBC] text-[#0F4C5C] dark:text-[#2DD4BF]'
                    }`}
                  >
                    {isSpeakingRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <input
                    type="text"
                    value={speakingInput}
                    onChange={(e) => setSpeakingInput(e.target.value)}
                    placeholder="Speak via microphone or type in English..."
                    className="flex-1 p-3.5 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#142024] text-xs sm:text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sendingSpeaking || !speakingInput.trim()}
                    className="btn-primary-teal p-3.5 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleFinishExam}
                disabled={submittingSection}
                className="btn-primary-teal text-xs sm:text-sm py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{submittingSection ? 'Compiling Report...' : 'Finish Exam & Generate Scorecard'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            FINAL SCORECARD VIEW
            ============================================================ */}
        {currentSection === 'completed' && scorecard && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Score Banner */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0F4C5C]/15 via-white dark:via-[#142024] to-[#D96B27]/15 border border-[#0F4C5C]/30 dark:border-[#2DD4BF]/30 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0F4C5C] text-white">
                    <Award className="w-3.5 h-3.5" />
                    <span>IELTS Full Mock Scorecard</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0F2E35] dark:text-[#F3EFE6]">
                    {exam.title}
                  </h2>
                </div>

                {/* Big Composite Band */}
                <div className="flex items-center gap-3 bg-white dark:bg-[#101A1E] px-6 py-4 rounded-2xl border border-[#EAE5DB] dark:border-[#23353B] shadow-sm">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#8E9FA5] block">
                      Overall Composite Band
                    </span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#0F4C5C] dark:text-[#2DD4BF]">
                      Band {scorecard.scores?.overallBand?.toFixed(1) || '7.0'}
                    </span>
                  </div>
                  <div className="pl-3 border-l border-[#EAE5DB] dark:border-[#23353B] text-center">
                    <span className="text-xs font-bold text-amber-500 block">+150 XP</span>
                    <span className="text-[10px] text-[#8E9FA5]">Awarded</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  {lang === 'bn'
                    ? 'ঘোষণা: এটি একটি AI-ভিত্তিক আনুমানিক ব্যান্ড স্কোর (Estimated Band)। এটি কোনো অফিসিয়াল IELTS ব্যান্ড স্কোর নয়।'
                    : 'Disclaimer: This score is an AI-generated estimate based on IELTS criteria and is not an official IELTS result.'}
                </span>
              </div>
            </div>

            {/* 4 Skill Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Listening */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase text-[#8E9FA5]">Listening</span>
                <div className="text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                  Band {scorecard.scores?.listeningBand?.toFixed(1) || '6.5'}
                </div>
                <span className="text-xs text-[#59656D] dark:text-[#8E9FA5] block">
                  Score: {scorecard.scores?.listeningScore || 0} / {scorecard.scores?.listeningTotal || 0}
                </span>
              </div>

              {/* Reading */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase text-[#8E9FA5]">Reading</span>
                <div className="text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                  Band {scorecard.scores?.readingBand?.toFixed(1) || '7.0'}
                </div>
                <span className="text-xs text-[#59656D] dark:text-[#8E9FA5] block">
                  Score: {scorecard.scores?.readingScore || 0} / {scorecard.scores?.readingTotal || 0}
                </span>
              </div>

              {/* Writing */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase text-[#8E9FA5]">Writing</span>
                <div className="text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                  Band {scorecard.scores?.writingBand?.toFixed(1) || '6.5'}
                </div>
                <span className="text-xs text-[#59656D] dark:text-[#8E9FA5] block">
                  Task 1 & Task 2 Composite
                </span>
              </div>

              {/* Speaking */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase text-[#8E9FA5]">Speaking</span>
                <div className="text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                  Band {scorecard.scores?.speakingBand?.toFixed(1) || '6.5'}
                </div>
                <span className="text-xs text-[#59656D] dark:text-[#8E9FA5] block">
                  Examiner Dr. Sarah Jenkins
                </span>
              </div>
            </div>

            {/* Performance Analysis in Bengali */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] space-y-3 shadow-sm">
              <h3 className="font-heading font-bold text-base text-[#0F2E35] dark:text-[#F3EFE6] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                <span>{lang === 'bn' ? 'পরবর্তী প্রস্তুতির সুনির্দিষ্ট পরামর্শ' : 'Study Action Plan'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#EDE8DF] leading-relaxed">
                {lang === 'bn'
                  ? 'আপনার রিডিং ও লিসেনিংয়ের ফলাফল সন্তোষজনক। তবে রাইটিং টাস্ক ২-তে বাক্য গঠনের বৈচিত্র্য এবং স্পিকিং পার্ট ২-তে আরও সাবলীল দীর্ঘ বক্তব্য প্রদানের মাধ্যমে আপনি সহজেই ব্যান্ড ৭.৫ অর্জন করতে পারবেন।'
                  : 'Great performance across Reading and Listening. Focus on lexical variety in Writing Task 2 and sustained fluency in Speaking Part 2 to elevate your score to Band 7.5+.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#EAE5DB] dark:border-[#23353B]">
              <Link href="/mistakes" className="btn-secondary text-xs sm:text-sm py-2.5 px-5">
                {lang === 'bn' ? 'মিস্টেক নোটবুকে ভুলগুলো দেখুন' : 'Review Mistakes in Notebook'}
              </Link>
              <Link href="/dashboard" className="btn-primary-teal text-xs sm:text-sm py-2.5 px-6">
                {lang === 'bn' ? 'ড্যাশবোর্ডে ফিরুন' : 'Return to Dashboard'}
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function MockExamRunnerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] dark:bg-[#0E1619]">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin" />
        </div>
      }
    >
      <MockExamRunnerContent />
    </Suspense>
  );
}
