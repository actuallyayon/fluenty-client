'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VoiceCallOrb, { VoiceCallStatus } from '@/components/VoiceCallOrb';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Volume2,
  VolumeX,
  Info,
  User,
  Bot,
  Award,
  PhoneCall,
  PhoneOff,
  MessageSquare,
  FileText,
  Play,
  Radio,
} from 'lucide-react';

interface SpeakingFeedback {
  estimatedBand: number;
  fluencyCoherence: { band: number; commentsBn: string; commentsEn: string };
  lexicalResource: { band: number; commentsBn: string; commentsEn: string };
  grammaticalAccuracy: { band: number; commentsBn: string; commentsEn: string };
  pronunciationGuidance: { commentsBn: string; commentsEn: string };
  actionableBanglaTips: string[];
}

interface MessageItem {
  role: 'examiner' | 'user';
  part: 1 | 2 | 3;
  content: string;
}

function SpeakingSimulationContent() {
  const params = useParams();
  const cueCardId = params?.id as string;

  const router = useRouter();
  const { t, lang } = useLanguage();
  const { data: session, isPending } = authClient.useSession();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>('');
  const [cueCard, setCueCard] = useState<string>('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [currentPart, setCurrentPart] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Call Room vs Chat Mode
  const [viewMode, setViewMode] = useState<'call' | 'chat'>('call');
  const [showCueCardModal, setShowCueCardModal] = useState(false);
  const [showTranscriptDrawer, setShowTranscriptDrawer] = useState(false);
  const [hasStartedCall, setHasStartedCall] = useState(false);

  // Voice Call State
  const [callStatus, setCallStatus] = useState<VoiceCallStatus>('idle');
  const [micVolume, setMicVolume] = useState<number>(0);
  const [candidateLiveTranscript, setCandidateLiveTranscript] = useState<string>('');
  const [currentExaminerUtterance, setCurrentExaminerUtterance] = useState<string>('');
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [chatTextInput, setChatTextInput] = useState('');

  // Part 2 Cue card prep timer
  const [prepTimeRemaining, setPrepTimeRemaining] = useState<number | null>(null);
  const [prepTimerActive, setPrepTimerActive] = useState(false);

  // Refs to guarantee stable state across async callbacks (prevents infinite re-renders)
  const initializedRef = useRef(false);
  const isExaminerSpeakingRef = useRef(false);
  const currentExaminerUtteranceRef = useRef<string>('');
  const callStatusRef = useRef<VoiceCallStatus>('idle');
  const isMicMutedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const isRecognitionActiveRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const latestTranscriptRef = useRef<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const currentPartRef = useRef<1 | 2 | 3>(1);

  // Sync refs with state
  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    currentPartRef.current = currentPart;
  }, [currentPart]);

  // Part 2 prep timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (prepTimerActive && prepTimeRemaining !== null && prepTimeRemaining > 0) {
      interval = setInterval(() => {
        setPrepTimeRemaining((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 1000);
    } else if (prepTimeRemaining === 0) {
      setPrepTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [prepTimerActive, prepTimeRemaining]);

  // Scroll chat bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, callStatus]);

  // Clear silence detection timers
  const clearSilenceTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setSilenceCountdown(null);
  }, []);

  // Stop mic volume analyzer
  const stopAudioAnalyzer = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicVolume(0);
  }, []);

  // Stop STT recognition safely
  const stopRecognition = useCallback(() => {
    clearSilenceTimers();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onspeechend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    isRecognitionActiveRef.current = false;
  }, [clearSilenceTimers]);

  // Clean unmount
  useEffect(() => {
    return () => {
      stopAudioAnalyzer();
      stopRecognition();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopAudioAnalyzer, stopRecognition]);

  // Submit candidate speech to server
  const submitCandidateSpeech = useCallback(
    async (speechText: string) => {
      const trimmed = speechText.trim();
      const currentSId = sessionIdRef.current;
      if (!currentSId || !trimmed || isProcessingRef.current) return;

      isProcessingRef.current = true;
      clearSilenceTimers();
      stopRecognition();
      stopAudioAnalyzer();

      setCallStatus('processing');
      setCandidateLiveTranscript(trimmed);

      // Record candidate message
      setMessages((prev) => [
        ...prev,
        { role: 'user', part: currentPartRef.current, content: trimmed },
      ]);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/speaking/sessions/${currentSId}/message`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              candidateAnswer: trimmed,
              part: currentPartRef.current,
            }),
          }
        );

        const data = await res.json();
        if (data.success && data.examinerReply) {
          let examinerText = (data.examinerReply as string).trim();
          // Client-side guard: strip any markdown code fences, JSON keys, or prefixes
          examinerText = examinerText
            .replace(/```(?:json)?/gi, '')
            .replace(/```/g, '')
            .replace(/^(?:Dr\.?\s+[A-Za-z]+(?:\s*\([^)]*\))?|Examiner|AI|Candidate|examinerQuestion)\s*[:：\-]\s*/i, '')
            .replace(/^[{}"'`\s]+|[{}"'`\s]+$/g, '')
            .trim();

          setMessages((prev) => [
            ...prev,
            { role: 'examiner', part: currentPartRef.current, content: examinerText },
          ]);

          // Part progression check
          setMessages((currentMsgs) => {
            const userTurnsCount = currentMsgs.filter((m) => m.role === 'user').length;
            if (currentPartRef.current === 1 && userTurnsCount >= 3) {
              setCurrentPart(2);
              setShowCueCardModal(true);
              setPrepTimeRemaining(60);
              setPrepTimerActive(true);
            } else if (currentPartRef.current === 2 && userTurnsCount >= 5) {
              setCurrentPart(3);
            }
            return currentMsgs;
          });

          // Speak examiner reply
          speakExaminer(examinerText);
        } else {
          setErrorMessage(data.message || 'Failed to receive examiner reply');
          setCallStatus('listening');
          startRecognition();
        }
      } catch (err: any) {
        console.error('Error submitting speech:', err);
        setErrorMessage(err.message || 'Connection error to speaking server');
        setCallStatus('listening');
        startRecognition();
      } finally {
        isProcessingRef.current = false;
        latestTranscriptRef.current = '';
        setCandidateLiveTranscript('');
        setChatTextInput('');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearSilenceTimers, stopAudioAnalyzer, stopRecognition]
  );

  // Start Mic & AudioContext Volume Analyzer
  const startAudioAnalyzer = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        return;
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalizedVol = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolume(normalizedVol);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('AudioContext / mic stream error:', e);
    }
  }, []);

  // Continuous speech recognition
  const startRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (isRecognitionActiveRef.current || isProcessingRef.current || isMicMutedRef.current) {
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        lang === 'bn'
          ? 'লাইভ ভয়েস রিকগনিশনের জন্য অনুগ্রহ করে গুগল ক্রোম বা মাইক্রোসফট এজ ব্যবহার করুন।'
          : 'Live voice requires Google Chrome or Microsoft Edge.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true;

      recognition.onstart = () => {
        isRecognitionActiveRef.current = true;
        setCallStatus('listening');
        startAudioAnalyzer();
      };

      recognition.onresult = (event: any) => {
        // Discard any audio picked up while examiner is speaking
        if (isExaminerSpeakingRef.current) {
          return;
        }

        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }

        const cleaned = fullTranscript.trim();
        // Prevent acoustic echo from self-feeding examiner's questions
        if (
          currentExaminerUtteranceRef.current &&
          cleaned.toLowerCase().includes(currentExaminerUtteranceRef.current.slice(0, 15).toLowerCase())
        ) {
          return;
        }

        latestTranscriptRef.current = cleaned;
        setCandidateLiveTranscript(cleaned);
        setChatTextInput(cleaned);

        if (cleaned.length > 0) {
          setCallStatus('candidate_speaking');
          clearSilenceTimers();

          // Instant turn-taking: 800ms pause triggers instant response
          const words = cleaned.split(/\s+/).filter(Boolean);
          if (words.length >= 1) {
            let timeLeft = 0.8;
            setSilenceCountdown(timeLeft);

            countdownIntervalRef.current = setInterval(() => {
              timeLeft -= 0.1;
              if (timeLeft <= 0) {
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                setSilenceCountdown(null);
              } else {
                setSilenceCountdown(parseFloat(timeLeft.toFixed(1)));
              }
            }, 100);

            silenceTimerRef.current = setTimeout(() => {
              if (
                !isExaminerSpeakingRef.current &&
                latestTranscriptRef.current.trim().length > 0 &&
                !isProcessingRef.current
              ) {
                submitCandidateSpeech(latestTranscriptRef.current);
              }
            }, 800);
          }
        }
      };

      // Native Voice Activity Detection: user finished speaking
      recognition.onspeechend = () => {
        if (
          !isExaminerSpeakingRef.current &&
          latestTranscriptRef.current.trim().length > 0 &&
          !isProcessingRef.current
        ) {
          clearSilenceTimers();
          setSilenceCountdown(null);
          setTimeout(() => {
            if (
              !isExaminerSpeakingRef.current &&
              latestTranscriptRef.current.trim().length > 0 &&
              !isProcessingRef.current
            ) {
              submitCandidateSpeech(latestTranscriptRef.current);
            }
          }, 250);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech recognition notice:', e.error);
        }
      };

      recognition.onend = () => {
        isRecognitionActiveRef.current = false;
        // Only restart if still in listening state and examiner is not speaking
        if (
          !isExaminerSpeakingRef.current &&
          !isProcessingRef.current &&
          callStatusRef.current === 'listening' &&
          !isMicMutedRef.current
        ) {
          setTimeout(() => {
            if (
              !isExaminerSpeakingRef.current &&
              callStatusRef.current === 'listening' &&
              !isRecognitionActiveRef.current
            ) {
              try {
                recognition.start();
              } catch {}
            }
          }, 300);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
      isRecognitionActiveRef.current = false;
    }
  }, [lang, clearSilenceTimers, startAudioAnalyzer, submitCandidateSpeech]);

  // Examiner Voice Synthesis
  const speakExaminer = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setTimeout(() => startRecognition(), 600);
        return;
      }

      try {
        isExaminerSpeakingRef.current = true;
        currentExaminerUtteranceRef.current = text;
        window.speechSynthesis.cancel();
        stopRecognition();
        stopAudioAnalyzer();

        setCallStatus('examiner_speaking');
        setCurrentExaminerUtterance(text);
        setCandidateLiveTranscript('');

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-GB';
        utterance.rate = 0.98;
        utterance.pitch = 1.05; // Slightly elevated pitch for natural, warm female articulation

        const voices = window.speechSynthesis.getVoices();
        // Priority: British female voices (Google UK English Female, Microsoft Hazel, Susan, Libby, Fiona, Sonia, Victoria, etc.)
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
          setTimeout(() => {
            isExaminerSpeakingRef.current = false;
            if (!isMicMutedRef.current) {
              setCallStatus('listening');
              startRecognition();
            } else {
              setCallStatus('paused');
            }
          }, 400); // 400ms echo guard
        };

        utterance.onerror = () => {
          isExaminerSpeakingRef.current = false;
          if (!isMicMutedRef.current) {
            setCallStatus('listening');
            startRecognition();
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
        isExaminerSpeakingRef.current = false;
        setCallStatus('listening');
        startRecognition();
      }
    },
    [startRecognition, stopAudioAnalyzer, stopRecognition]
  );

  // Initialize Speaking Session ONCE
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (session?.user && cueCardId && !initializedRef.current) {
      initializedRef.current = true;

      const initSession = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/speaking/sessions/start`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ cueCardId }),
            }
          );
          const data = await res.json();
          if (data.success) {
            setSessionId(data.sessionId);
            setTopic(data.topic);
            setCueCard(data.cueCard);
            setCurrentExaminerUtterance(data.initialQuestion);
            setMessages([
              {
                role: 'examiner',
                part: 1,
                content: data.initialQuestion,
              },
            ]);
          } else {
            setErrorMessage(data.message || 'Failed to start speaking session');
          }
        } catch (err) {
          console.error('Failed to init speaking session:', err);
          setErrorMessage('Connection error while contacting speaking service');
        } finally {
          setLoading(false);
        }
      };

      initSession();
    }
  }, [cueCardId, session, isPending, router]);

  // Connect & Start Speaking (User Gesture unlocks audio cleanly)
  const handleStartCall = () => {
    setHasStartedCall(true);
    const initialQuestion = messages[0]?.content || currentExaminerUtterance;
    if (initialQuestion) {
      speakExaminer(initialQuestion);
    } else {
      setCallStatus('listening');
      startRecognition();
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (isMicMuted) {
      setIsMicMuted(false);
      isMicMutedRef.current = false;
      setCallStatus('listening');
      startRecognition();
    } else {
      setIsMicMuted(true);
      isMicMutedRef.current = true;
      setCallStatus('paused');
      stopRecognition();
      stopAudioAnalyzer();
    }
  };

  // Repeat Examiner Question
  const handleRepeatQuestion = () => {
    const lastExaminerMsg = [...messages].reverse().find((m) => m.role === 'examiner');
    if (lastExaminerMsg) {
      speakExaminer(lastExaminerMsg.content);
    }
  };

  // Finish & Evaluate Session
  const handleFinishTest = async () => {
    if (!sessionId || evaluating) return;
    const userTurns = messages.filter((m) => m.role === 'user').length;
    if (userTurns < 1) {
      alert(
        lang === 'bn'
          ? 'পরীক্ষা মূল্যায়নের জন্য অনুগ্রহ করে অন্তত ১টি প্রশ্নের উত্তর দিন।'
          : 'Please answer at least 1 question before requesting an evaluation.'
      );
      return;
    }

    stopRecognition();
    stopAudioAnalyzer();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setEvaluating(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/speaking/sessions/${sessionId}/finish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      const data = await res.json();
      if (data.success && data.feedback) {
        const rawFb = data.feedback;
        const normalizedFeedback: SpeakingFeedback = {
          estimatedBand: rawFb.estimatedBand || 6.5,
          fluencyCoherence: {
            band: rawFb.fluencyCoherence?.band ?? rawFb.estimatedBand ?? 6.5,
            commentsBn:
              rawFb.fluencyCoherence?.commentsBn ||
              rawFb.fluencyCommentsBn ||
              'সাবলীলতা ও বক্তব্যের গতি প্রশংসনীয়।',
            commentsEn: rawFb.fluencyCoherence?.commentsEn || '',
          },
          lexicalResource: {
            band: rawFb.lexicalResource?.band ?? rawFb.estimatedBand ?? 6.5,
            commentsBn:
              rawFb.lexicalResource?.commentsBn ||
              rawFb.vocabCommentsBn ||
              'প্রাসঙ্গিক শব্দচয়ন ভালো হয়েছে। আরও উন্নত বিকল্প ব্যবহারের চেষ্টা করুন।',
            commentsEn: rawFb.lexicalResource?.commentsEn || '',
          },
          grammaticalAccuracy: {
            band: rawFb.grammaticalAccuracy?.band ?? rawFb.estimatedBand ?? 6.5,
            commentsBn:
              rawFb.grammaticalAccuracy?.commentsBn ||
              rawFb.grammarCommentsBn ||
              'মৌলিক বাক্যগঠন সঠিক হয়েছে। জটিল বাক্যে টেন্সের দিকে নজর দিন।',
            commentsEn: rawFb.grammaticalAccuracy?.commentsEn || '',
          },
          pronunciationGuidance: {
            commentsBn:
              rawFb.pronunciationGuidance?.commentsBn ||
              'উচ্চারণ ও ইন্টোনেশন স্বাভাবিক বজায় রাখার পরামর্শ দেওয়া হচ্ছে।',
            commentsEn: rawFb.pronunciationGuidance?.commentsEn || '',
          },
          actionableBanglaTips:
            Array.isArray(rawFb.actionableBanglaTips) && rawFb.actionableBanglaTips.length > 0
              ? rawFb.actionableBanglaTips
              : typeof rawFb.improvementTipsBn === 'string'
              ? rawFb.improvementTipsBn
                  .split(/\n+/)
                  .map((s: string) => s.replace(/^[-*•\d.]+\s*/, '').trim())
                  .filter(Boolean)
              : Array.isArray(rawFb.improvementTipsBn)
              ? rawFb.improvementTipsBn
              : rawFb.areasForImprovement || [],
        };
        setFeedback(normalizedFeedback);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(data.message || 'Failed to evaluate speaking test');
      }
    } catch (err: any) {
      console.error('Failed to evaluate speaking test:', err);
      setErrorMessage(err.message || 'Connection error during evaluation');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin border-4 border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20 border-t-transparent" />
            <p className="text-[#59656D] dark:text-[#8E9FA5] font-semibold text-sm">
              {lang === 'bn' ? 'লাইভ ইন্টারভিউ রুম লোড হচ্ছে...' : 'Preparing Virtual Interview Suite...'}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE5DB] dark:border-[#23353B] pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/speaking"
              className="p-2.5 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] hover:bg-[#FAF8F5] dark:hover:bg-[#1B292E] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#59656D] dark:text-[#8E9FA5]" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F4C5C] dark:text-[#2DD4BF]">
                  Live Voice Call &bull; Cambridge Examiner: Dr. Sarah Jenkins
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold font-heading text-[#0F2E35] dark:text-[#F3EFE6] line-clamp-1">
                {topic}
              </h1>
            </div>
          </div>

          {/* Top Mode Toggles & Stepper */}
          {!feedback && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center p-1 rounded-xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewMode('call')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'call'
                      ? 'bg-[#0F4C5C] text-white shadow-sm'
                      : 'text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F2E35]'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'লাইভ কল রুম' : 'Live Call'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('chat')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'chat'
                      ? 'bg-[#0F4C5C] text-white shadow-sm'
                      : 'text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F2E35]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'টেক্সট মোড' : 'Text View'}</span>
                </button>
              </div>

              <div className="flex items-center text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] text-[#0F4C5C] dark:text-[#2DD4BF]">
                <span>IELTS Part {currentPart}</span>
              </div>

              <button
                type="button"
                onClick={handleFinishTest}
                disabled={evaluating}
                className="btn-primary-teal text-xs py-2 px-4 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {evaluating ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>{lang === 'bn' ? 'মূল্যায়ন হচ্ছে...' : 'Evaluating...'}</span>
                  </>
                ) : (
                  <>
                    <span>{lang === 'bn' ? 'ইন্টারভিউ শেষ ও মূল্যায়ন' : 'Finish & Evaluate'}</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* ============================================================
            FEEDBACK REPORT VIEW (If Test Finished)
            ============================================================ */}
        {feedback ? (
          <div className="space-y-8 animate-fade-in">
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0F4C5C]/10 via-[#FAF8F5] dark:via-[#142024] to-[#D96B27]/10 border border-[#0F4C5C]/30 dark:border-[#2DD4BF]/30 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0F4C5C] text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini AI Speaking Assessment</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0F2E35] dark:text-[#F3EFE6]">
                    {lang === 'bn' ? 'আপনার স্পিকিং মূল্যায়ন রিপোর্ট' : 'Your Speaking Evaluation Report'}
                  </h2>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-[#101A1E] px-6 py-4 rounded-2xl border border-[#EAE5DB] dark:border-[#23353B] shadow-sm">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E9FA5] block">
                      Estimated Speaking Band
                    </span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#0F4C5C] dark:text-[#2DD4BF]">
                      {feedback.estimatedBand.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>
                  {lang === 'bn'
                    ? 'ঘোষণা: এটি একটি AI-ভিত্তিক আনুমানিক ব্যান্ড স্কোর (Estimated Band)। এটি কোনো অফিসিয়াল IELTS ব্যান্ড স্কোর নয়।'
                    : 'Disclaimer: This score is an AI-generated estimate based on IELTS criteria and is not an official IELTS result.'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                    {t('fluencyCoherence')}
                  </span>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                    Band {(feedback.fluencyCoherence?.band ?? feedback.estimatedBand ?? 6.5).toFixed(1)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#EDE8DF] leading-relaxed">
                  {feedback.fluencyCoherence?.commentsBn || (feedback as any).fluencyCommentsBn || 'সাবলীলতা প্রশংসনীয়।'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                    {t('lexicalResource')}
                  </span>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                    Band {(feedback.lexicalResource?.band ?? feedback.estimatedBand ?? 6.5).toFixed(1)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#EDE8DF] leading-relaxed">
                  {feedback.lexicalResource?.commentsBn || (feedback as any).vocabCommentsBn || 'প্রাসঙ্গিক শব্দচয়ন ভালো হয়েছে।'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                    {t('grammaticalAccuracy')}
                  </span>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                    Band {(feedback.grammaticalAccuracy?.band ?? feedback.estimatedBand ?? 6.5).toFixed(1)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#EDE8DF] leading-relaxed">
                  {feedback.grammaticalAccuracy?.commentsBn || (feedback as any).grammarCommentsBn || 'মৌলিক বাক্যগঠন সঠিক ছিল।'}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                    {t('pronunciationGuidance')}
                  </span>
                  <span className="text-xs font-bold text-[#D96B27]">Pacing & Stress</span>
                </div>
                <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#EDE8DF] leading-relaxed">
                  {feedback.pronunciationGuidance?.commentsBn || 'উচ্চারণ ও বক্তব্যের গতি স্বাভাবিক বজায় রাখুন।'}
                </p>
              </div>
            </div>

            {feedback.actionableBanglaTips?.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] space-y-4 shadow-sm">
                <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                  <span>
                    {lang === 'bn' ? 'ব্যান্ড ৭+ অর্জনের জন্য ৩টি সুনির্দিষ্ট পরামর্শ' : '3 Key Actionable Tips for Band 7+'}
                  </span>
                </h3>

                <ul className="space-y-3">
                  {feedback.actionableBanglaTips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] text-xs sm:text-sm text-[#1A252C] dark:text-[#EDE8DF]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#EAE5DB] dark:border-[#23353B]">
              <button
                type="button"
                onClick={() => {
                  setFeedback(null);
                  setCurrentPart(1);
                  setMessages([]);
                  setHasStartedCall(false);
                }}
                className="btn-secondary text-xs sm:text-sm py-2.5 px-5 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{lang === 'bn' ? 'পুনরায় ইন্টারভিউ দিন' : 'Restart Interview'}</span>
              </button>

              <Link
                href="/speaking"
                className="btn-primary-teal text-xs sm:text-sm py-2.5 px-6 flex items-center gap-2"
              >
                <span>{lang === 'bn' ? 'অন্যান্য কিউ কার্ড দেখুন' : 'Explore Other Topics'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ============================================================
             ACTIVE INTERVIEW EXPERIENCE
             ============================================================ */
          <div className="space-y-6">
            {/* Part 2 Cue Card Banner */}
            {currentPart === 2 && cueCard && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <FileText className="w-4 h-4" />
                    <span>Part 2 Cue Card Topic</span>
                    {prepTimeRemaining !== null && (
                      <span className="font-mono bg-amber-500/20 px-2 py-0.5 rounded-md">
                        {prepTimeRemaining > 0
                          ? `Prep: 00:${prepTimeRemaining.toString().padStart(2, '0')}`
                          : 'Prep time ended &bull; Speak for 1-2 minutes'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#1A252C] dark:text-[#EDE8DF] line-clamp-2">
                    {cueCard}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCueCardModal(true)}
                  className="shrink-0 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-white dark:bg-[#142024] text-xs font-bold text-amber-900 dark:text-amber-300 hover:bg-white transition-all cursor-pointer"
                >
                  {lang === 'bn' ? 'সম্পূর্ণ কার্ড দেখুন' : 'View Full Card'}
                </button>
              </div>
            )}

            {/* ============================================================
                VIEW MODE 1: HANDS-FREE VOICE CALL ROOM
                ============================================================ */}
            {viewMode === 'call' && (
              <div className="relative rounded-3xl bg-gradient-to-b from-white via-[#FAF8F5]/90 to-[#F6F2EA]/70 dark:from-[#142024] dark:via-[#101A1E]/90 dark:to-[#0B1215] border border-[#EAE5DB] dark:border-[#23353B] shadow-[0_16px_48px_-12px_rgba(15,76,92,0.12)] p-6 sm:p-10 flex flex-col items-center justify-between min-h-[540px] overflow-hidden">
                {/* Ambient Radial Mesh Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#0F4C5C]/5 via-[#2DD4BF]/5 to-[#D96B27]/5 rounded-full blur-3xl pointer-events-none" />

                {/* Top Info Header */}
                <div className="w-full flex items-center justify-between text-xs text-[#59656D] dark:text-[#8E9FA5] z-10">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 dark:bg-[#142024]/80 border border-[#EAE5DB] dark:border-[#23353B] backdrop-blur-sm shadow-xs">
                    <Radio className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#2DD4BF] animate-pulse" />
                    <span className="font-semibold text-[#0F2E35] dark:text-[#EDE8DF]">
                      {lang === 'bn'
                        ? 'হ্যান্ডস-ফ্রি লাইভ ভয়েস (কথা থামলে স্বয়ংক্রিয়ভাবে পাঠানো হবে)'
                        : 'Hands-Free Live Voice (Auto-sends when you pause)'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTranscriptDrawer(!showTranscriptDrawer)}
                    className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                    <span>{messages.length} {lang === 'bn' ? 'বার্তা' : 'turns'}</span>
                  </button>
                </div>

                {/* Central Living Voice Orb Component */}
                <VoiceCallOrb
                  status={callStatus}
                  volume={micVolume}
                  silenceCountdown={silenceCountdown}
                  lang={lang}
                  examinerName="Dr. Sarah Jenkins"
                  currentUtterance={currentExaminerUtterance}
                  candidateLiveTranscript={candidateLiveTranscript}
                />

                {/* Bottom Call Controls Suite */}
                <div className="w-full max-w-lg flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-5 border-t border-[#EAE5DB] dark:border-[#23353B] z-10">
                  {!hasStartedCall ? (
                    /* Initial Connect Button to unlock browser audio policy cleanly */
                    <button
                      type="button"
                      onClick={handleStartCall}
                      className="btn-primary-teal text-sm py-3 px-8 font-bold flex items-center gap-2.5 shadow-lg cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>{lang === 'bn' ? 'কথা বলা শুরু করুন (Start Live Call)' : 'Connect & Start Live Interview'}</span>
                    </button>
                  ) : (
                    <>
                      {/* Mute / Unmute Button */}
                      <button
                        type="button"
                        onClick={toggleMute}
                        className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer font-semibold text-xs sm:text-sm ${
                          isMicMuted
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20 shadow-xs'
                            : 'btn-secondary shadow-xs'
                        }`}
                        title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                      >
                        {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        <span>{isMicMuted ? (lang === 'bn' ? 'আনমিউট' : 'Unmute') : (lang === 'bn' ? 'মিউট' : 'Mute')}</span>
                      </button>

                      {/* Repeat Question Button */}
                      <button
                        type="button"
                        onClick={handleRepeatQuestion}
                        className="btn-secondary p-3 sm:p-3.5 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
                        title="Ask Dr. Sarah Jenkins to repeat the question"
                      >
                        <RotateCcw className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                        <span>{lang === 'bn' ? 'পুনরায় শুনুন' : 'Repeat Question'}</span>
                      </button>

                      {/* Immediate Send Button */}
                      {candidateLiveTranscript.trim().length > 0 && (
                        <button
                          type="button"
                          onClick={() => submitCandidateSpeech(candidateLiveTranscript)}
                          className="btn-primary-teal p-3 sm:p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>{lang === 'bn' ? 'এখনই পাঠান' : 'Send Now'}</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================
                VIEW MODE 2: TEXT TRANSCRIPT & CHAT
                ============================================================ */}
            {viewMode === 'chat' && (
              <div className="space-y-4">
                <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm min-h-[460px] max-h-[580px] overflow-y-auto space-y-4">
                  {messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 max-w-[85%] ${
                        m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          m.role === 'user'
                            ? 'bg-[#0F4C5C] text-white'
                            : 'bg-[#D96B27] text-white shadow-sm'
                        }`}
                      >
                        {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-[#0F4C5C] text-white rounded-tr-none'
                            : 'bg-[#FAF8F5] dark:bg-[#1B292E] border border-[#EAE5DB] dark:border-[#23353B] text-[#1A252C] dark:text-[#EDE8DF] rounded-tl-none shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1 text-[10px] opacity-75">
                          <span className="font-bold">
                            {m.role === 'user' ? 'Candidate (You)' : 'Dr. Sarah Jenkins (Examiner)'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span>Part {m.part}</span>
                            {m.role === 'examiner' && (
                              <button
                                type="button"
                                onClick={() => speakExaminer(m.content)}
                                className="p-1 hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors"
                                title="Listen to question"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="whitespace-pre-line">{m.content}</p>
                      </div>
                    </div>
                  ))}

                  {callStatus === 'processing' && (
                    <div className="flex items-center gap-3 mr-auto max-w-[80%]">
                      <div className="w-8 h-8 rounded-full bg-[#D96B27] text-white flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-tl-none bg-[#FAF8F5] dark:bg-[#1B292E] border border-[#EAE5DB] dark:border-[#23353B] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#D96B27] animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-[#D96B27] animate-pulse delay-100" />
                        <span className="w-2 h-2 rounded-full bg-[#D96B27] animate-pulse delay-200" />
                      </div>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (chatTextInput.trim()) {
                      submitCandidateSpeech(chatTextInput);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={startRecognition}
                    className="p-3.5 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#142024] text-[#0F4C5C] dark:text-[#2DD4BF] cursor-pointer"
                    title="Speak"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={chatTextInput}
                    onChange={(e) => setChatTextInput(e.target.value)}
                    placeholder={
                      lang === 'bn'
                        ? 'আপনার উত্তর টাইপ করুন অথবা মাইক্রোফোনে কথা বলুন...'
                        : 'Type your response or use microphone...'
                    }
                    className="flex-1 p-3.5 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#142024] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] text-[#1A252C] dark:text-[#EDE8DF]"
                  />

                  <button
                    type="submit"
                    disabled={!chatTextInput.trim() || callStatus === 'processing'}
                    className="btn-primary-teal py-3.5 px-5 rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Sliding Transcript Drawer */}
            {viewMode === 'call' && showTranscriptDrawer && (
              <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-md space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#EAE5DB] dark:border-[#23353B] pb-2">
                  <h4 className="font-heading font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                    <span>{lang === 'bn' ? 'সরাসরি ট্রান্সক্রিপ্ট হিস্ট্রি' : 'Live Interview Transcript'}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowTranscriptDrawer(false)}
                    className="text-xs text-[#8E9FA5] hover:text-[#1A252C] cursor-pointer"
                  >
                    {lang === 'bn' ? 'লুকান' : 'Close'}
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
                  {messages.map((m, idx) => (
                    <div key={idx} className="flex gap-2 leading-relaxed">
                      <span className="font-bold shrink-0 text-[#0F4C5C] dark:text-[#2DD4BF]">
                        {m.role === 'user' ? 'You:' : 'Dr. Sarah Jenkins:'}
                      </span>
                      <span className="text-[#59656D] dark:text-[#EDE8DF]">{m.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Part 2 Full Cue Card Modal */}
        {showCueCardModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-2xl p-6 sm:p-8 space-y-5 animate-scale-up">
              <div className="flex items-center justify-between border-b border-[#EAE5DB] dark:border-[#23353B] pb-3">
                <div className="flex items-center gap-2 text-[#0F4C5C] dark:text-[#2DD4BF]">
                  <FileText className="w-5 h-5" />
                  <h3 className="font-heading font-bold text-base sm:text-lg">
                    IELTS Part 2 Cue Card
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCueCardModal(false)}
                  className="p-1 rounded-lg text-[#8E9FA5] hover:text-[#1A252C] dark:hover:text-[#EDE8DF] cursor-pointer"
                >
                  &times;
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] font-serif text-sm leading-relaxed whitespace-pre-line text-[#1A252C] dark:text-[#EDE8DF]">
                {cueCard}
              </div>

              <div className="flex items-center justify-between text-xs text-[#59656D] dark:text-[#8E9FA5]">
                <span>{lang === 'bn' ? '১ মিনিট চিন্তা করুন ও নোট নিন' : '1 minute to prepare notes'}</span>
                <button
                  type="button"
                  onClick={() => setShowCueCardModal(false)}
                  className="btn-primary-teal py-2 px-5 text-xs font-bold cursor-pointer"
                >
                  {lang === 'bn' ? 'বুঝতে পেরেছি' : 'Got it'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SpeakingPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] dark:bg-[#0E1619]">
          <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] animate-spin border-4 border-[#0F4C5C]/20 border-t-transparent" />
        </div>
      }
    >
      <SpeakingSimulationContent />
    </Suspense>
  );
}
