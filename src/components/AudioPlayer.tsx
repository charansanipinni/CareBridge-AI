import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Square, Sparkles, AlertCircle } from 'lucide-react';
import { PatientCarePlan } from '../types/careplan';

interface AudioPlayerProps {
  plan: PatientCarePlan;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ plan }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [rate, setRate] = useState<number>(1.0);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // When plan changes, stop any ongoing speech
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [plan]);

  const compileSpokenText = (): string => {
    const isTe = plan.language === 'te';
    const parts: string[] = [];

    parts.push(plan.careSummary);

    // Medications
    parts.push(isTe ? 'మీ మందుల వివరాలు:' : 'Your prescribed medications:');
    for (const m of plan.medications) {
      parts.push(`${m.medicineName}, ${m.howMuch}, ${m.whenToTake}, ${m.forHowLong}.`);
    }

    // Warning signs
    if (plan.warningSigns.urgentSigns.length > 0) {
      parts.push(isTe ? 'అత్యవసర హెచ్చరిక సంకేతాలు:' : 'Emergency warning signs:');
      for (const sign of plan.warningSigns.urgentSigns) {
        parts.push(sign);
      }
      parts.push(`${isTe ? 'చేయవలసిన చర్య' : 'Action to take'}: ${plan.warningSigns.actionToTake}`);
    }

    // Follow up
    parts.push(`${isTe ? 'తదుపరి అపాయింట్‌మెంట్' : 'Follow up appointment'}: ${plan.followUp.timingDisplay}, ${plan.followUp.departmentOrDoctor}.`);

    return parts.join('. ');
  };

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const fullText = compileSpokenText();
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = rate;
    utterance.lang = plan.language === 'te' ? 'te-IN' : 'en-US';

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 flex items-center space-x-2 no-print">
        <VolumeX className="w-4 h-4 text-slate-400" />
        <span>Text-to-speech is not supported in this browser environment.</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-teal-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 no-print">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shrink-0">
          <Volume2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-xs font-bold text-slate-900">
              {plan.language === 'te' ? 'ఆడియో రీడర్ (Listen to Care Plan)' : 'Audio Reader for Patient & Caregiver'}
            </h4>
            <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.2 rounded-md">
              Validated Speech
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {plan.language === 'te'
              ? 'ధృవీకరించబడిన సంరక్షణ ప్రణాళికను తెలుగులో వినండి.'
              : 'Reads validated patient instructions aloud in plain language.'}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 self-start sm:self-auto">
        {/* Speed Controls */}
        <select
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          className="text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-teal-500"
        >
          <option value={0.8}>0.8x (Slower)</option>
          <option value={1.0}>1.0x (Normal)</option>
          <option value={1.2}>1.2x (Faster)</option>
        </select>

        {/* Play/Pause/Stop Buttons */}
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPaused ? 'Resume' : 'Play Audio'}</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>Pause</span>
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            onClick={handleStop}
            className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center space-x-1 transition"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
        )}
      </div>
    </div>
  );
};
