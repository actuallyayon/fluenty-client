'use client';

import React from 'react';
import { Mic, Volume2, Sparkles, Pause, Radio } from 'lucide-react';

export type VoiceCallStatus =
  | 'idle'
  | 'examiner_speaking'
  | 'listening'
  | 'candidate_speaking'
  | 'processing'
  | 'paused';

interface VoiceCallOrbProps {
  status: VoiceCallStatus;
  volume: number; // 0 to 100
  silenceCountdown: number | null; // e.g. 1.8s countdown
  lang: 'bn' | 'en';
  examinerName?: string;
  currentUtterance?: string;
  candidateLiveTranscript?: string;
}

export default function VoiceCallOrb({
  status,
  volume,
  silenceCountdown,
  lang,
  examinerName = 'Dr. Sarah Jenkins',
  currentUtterance = '',
  candidateLiveTranscript = '',
}: VoiceCallOrbProps) {
  // Smooth dynamic scale based on candidate voice volume
  const dynamicScale =
    status === 'candidate_speaking'
      ? Math.min(1 + (volume / 100) * 0.25, 1.3)
      : 1;

  const dynamicRingScale =
    status === 'candidate_speaking'
      ? Math.min(1 + (volume / 100) * 0.45, 1.5)
      : 1;

  const getStatusLabel = () => {
    switch (status) {
      case 'examiner_speaking':
        return lang === 'bn' ? `${examinerName} কথা বলছেন...` : `${examinerName} is speaking...`;
      case 'listening':
        return lang === 'bn' ? 'শুনছেন... ইংরেজিতে কথা বলুন' : 'Listening... speak in English';
      case 'candidate_speaking':
        if (silenceCountdown !== null && silenceCountdown > 0) {
          return lang === 'bn'
            ? `কথা শেষ হলে পাঠানো হবে (${silenceCountdown.toFixed(1)}s)...`
            : `Sending in ${silenceCountdown.toFixed(1)}s...`;
        }
        return lang === 'bn' ? 'আপনার কথা শোনা যাচ্ছে...' : 'Speech detected...';
      case 'processing':
        return lang === 'bn' ? `${examinerName} উত্তর তৈরি করছেন...` : `${examinerName} is thinking...`;
      case 'paused':
        return lang === 'bn' ? 'মাইক্রোফোন মিউট করা হয়েছে' : 'Microphone muted';
      default:
        return lang === 'bn' ? 'কল প্রস্তুত' : 'Ready';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-4 sm:py-6 px-4 select-none w-full">
      {/* Top Status Capsule */}
      <div className="mb-5 sm:mb-6 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl transition-all shadow-sm border border-[#EAE5DB] dark:border-[#23353B] bg-white/90 dark:bg-[#142024]/90 text-[#0F2E35] dark:text-[#EDE8DF]">
        {status === 'examiner_speaking' && (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0F4C5C] dark:bg-[#2DD4BF] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F4C5C] dark:bg-[#2DD4BF]" />
            </span>
            <Volume2 className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
          </>
        )}
        {status === 'listening' && (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </>
        )}
        {status === 'candidate_speaking' && (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D96B27] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D96B27]" />
            </span>
            <Radio className="w-3.5 h-3.5 text-[#D96B27]" />
          </>
        )}
        {status === 'processing' && (
          <>
            <div className="w-3 h-3 rounded-full border-2 border-[#0F4C5C] dark:border-[#2DD4BF] border-t-transparent animate-spin" />
            <Sparkles className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
          </>
        )}
        {status === 'paused' && <Pause className="w-3.5 h-3.5 text-amber-600" />}
        {status === 'idle' && <Volume2 className="w-3.5 h-3.5 text-[#59656D]" />}
        <span className="tracking-tight">{getStatusLabel()}</span>
      </div>

      {/* Central Voice Orb (Luxury Studio Aesthetic) */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center my-4">
        {/* Layer 1: Soft Ambient Radial Aura */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
            status === 'examiner_speaking'
              ? 'bg-[#0F4C5C]/20 dark:bg-[#2DD4BF]/25 blur-3xl scale-125'
              : status === 'candidate_speaking'
              ? 'bg-[#D96B27]/25 blur-3xl scale-125'
              : status === 'listening'
              ? 'bg-emerald-500/15 blur-2xl scale-110'
              : 'bg-transparent'
          }`}
          style={{
            transform: status === 'candidate_speaking' ? `scale(${dynamicRingScale})` : undefined,
          }}
        />

        {/* Layer 2: Subtle Concentric Halo Ring */}
        <div
          className={`absolute rounded-full border transition-all duration-500 pointer-events-none ${
            status === 'examiner_speaking'
              ? 'w-48 h-48 sm:w-60 sm:h-60 border-[#0F4C5C]/25 dark:border-[#2DD4BF]/35 animate-pulse'
              : status === 'candidate_speaking'
              ? 'w-48 h-48 sm:w-60 sm:h-60 border-[#D96B27]/30 shadow-[0_0_24px_rgba(217,107,39,0.25)]'
              : status === 'listening'
              ? 'w-44 h-44 sm:w-56 sm:h-56 border-emerald-500/20'
              : 'w-40 h-40 sm:w-52 sm:h-52 border-[#EAE5DB]/60 dark:border-[#23353B]/60'
          }`}
          style={{
            transform: status === 'candidate_speaking' ? `scale(${dynamicScale})` : undefined,
          }}
        />

        {/* Layer 3: Inner Core Sphere */}
        <div
          className={`relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 backdrop-blur-2xl border ${
            status === 'examiner_speaking'
              ? 'bg-gradient-to-b from-[#135A6D] via-[#0F4C5C] to-[#082B33] text-white border-[#2DD4BF]/40 shadow-[0_12px_36px_rgba(15,76,92,0.35)]'
              : status === 'candidate_speaking'
              ? 'bg-gradient-to-b from-[#E8742C] via-[#D96B27] to-[#A3430A] text-white border-amber-300/40 shadow-[0_12px_36px_rgba(217,107,39,0.35)]'
              : status === 'listening'
              ? 'bg-gradient-to-b from-emerald-700 via-emerald-800 to-teal-950 text-white border-emerald-400/40 shadow-[0_8px_28px_rgba(16,185,129,0.2)]'
              : status === 'processing'
              ? 'bg-gradient-to-b from-[#16363B] to-[#0E1619] text-[#2DD4BF] border-[#0F4C5C]/60 shadow-[0_8px_24px_rgba(15,76,92,0.2)]'
              : 'bg-white/95 dark:bg-[#142024]/95 text-[#59656D] border-[#EAE5DB] dark:border-[#23353B] shadow-lg'
          }`}
          style={{
            transform: status === 'candidate_speaking' ? `scale(${dynamicScale})` : undefined,
          }}
        >
          {status === 'examiner_speaking' && (
            <div className="flex items-center gap-1.5 h-10">
              <span className="w-1.5 h-4 rounded-full bg-white/90 animate-pulse" />
              <span className="w-1.5 h-8 rounded-full bg-white/90 animate-pulse delay-75" />
              <span className="w-1.5 h-10 rounded-full bg-white/90 animate-pulse delay-150" />
              <span className="w-1.5 h-7 rounded-full bg-white/90 animate-pulse delay-200" />
              <span className="w-1.5 h-4 rounded-full bg-white/90 animate-pulse delay-300" />
            </div>
          )}
          {status === 'candidate_speaking' && (
            <div className="flex items-center gap-1.5 h-10">
              <span
                className="w-1.5 rounded-full bg-white transition-all duration-75"
                style={{ height: `${Math.max(10, (volume / 100) * 32)}px` }}
              />
              <span
                className="w-1.5 rounded-full bg-white transition-all duration-75"
                style={{ height: `${Math.max(16, (volume / 100) * 44)}px` }}
              />
              <span
                className="w-1.5 rounded-full bg-white transition-all duration-75"
                style={{ height: `${Math.max(12, (volume / 100) * 36)}px` }}
              />
            </div>
          )}
          {status === 'listening' && (
            <Mic className="w-8 h-8 text-white/90 animate-pulse" />
          )}
          {status === 'processing' && (
            <Sparkles className="w-8 h-8 text-[#2DD4BF] animate-spin" />
          )}
          {status === 'paused' && (
            <Pause className="w-8 h-8 text-amber-500" />
          )}
          {status === 'idle' && (
            <Volume2 className="w-8 h-8 text-[#8E9FA5]" />
          )}

          <span className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-85">
            {status === 'examiner_speaking'
              ? 'Examiner'
              : status === 'candidate_speaking' || status === 'listening'
              ? 'Candidate'
              : 'Fluenty AI'}
          </span>
        </div>
      </div>

      {/* Subtitles / Closed Captions Card (Editorial Style) */}
      <div className="w-full max-w-xl min-h-[96px] mt-2 p-5 rounded-2xl bg-white/90 dark:bg-[#142024]/90 border border-[#EAE5DB] dark:border-[#23353B] border-l-4 border-l-[#0F4C5C] dark:border-l-[#2DD4BF] backdrop-blur-md shadow-sm transition-all text-left">
        {status === 'examiner_speaking' && currentUtterance && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#0F4C5C] dark:text-[#2DD4BF]">
                {examinerName} (Examiner):
              </span>
            </div>
            <p className="text-sm sm:text-base font-serif italic text-[#1A252C] dark:text-[#EDE8DF] leading-relaxed">
              &ldquo;{currentUtterance}&rdquo;
            </p>
          </div>
        )}

        {(status === 'candidate_speaking' || status === 'listening') && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#D96B27]">
                {lang === 'bn' ? 'আপনার বক্তব্য:' : 'Your Response:'}
              </span>
            </div>
            <p className="text-sm sm:text-base font-medium text-[#1A252C] dark:text-[#EDE8DF] leading-relaxed min-h-[26px]">
              {candidateLiveTranscript ? (
                <span>&ldquo;{candidateLiveTranscript}&rdquo;</span>
              ) : (
                <span className="text-xs text-[#8E9FA5] italic">
                  {lang === 'bn'
                    ? 'আপনার উত্তর ইংরেজিতে বলা শুরু করুন...'
                    : 'Start speaking your answer in English...'}
                </span>
              )}
            </p>
          </div>
        )}

        {status === 'processing' && (
          <div className="flex items-center justify-center gap-2.5 py-2 text-xs text-[#0F4C5C] dark:text-[#2DD4BF] font-semibold">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>
              {lang === 'bn'
                ? `${examinerName} উত্তর প্রস্তুত করছেন...`
                : `${examinerName} is formulating the follow-up question...`}
            </span>
          </div>
        )}

        {status === 'paused' && (
          <p className="text-xs text-[#8E9FA5] text-center py-1">
            {lang === 'bn'
              ? 'কথা বলা আবার শুরু করতে নিচের আনমিউট বাটনে চাপ দিন।'
              : 'Click Unmute below to resume the live interview.'}
          </p>
        )}

        {status === 'idle' && (
          <p className="text-xs text-[#8E9FA5] text-center py-1">
            {lang === 'bn'
              ? 'লাইভ কল শুরু করতে নিচের বাটনে চাপ দিন।'
              : 'Click Connect & Start Live Interview below to begin.'}
          </p>
        )}
      </div>
    </div>
  );
}
