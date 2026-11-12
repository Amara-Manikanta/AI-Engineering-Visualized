import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Headphones,
} from 'lucide-react';
import { audioNarrator } from '../lib/audioNarrator';

export default function AudioTourPlayer({
  title = 'Interactive Audio Tour',
  steps = [],
  onStepChange,
  className = '',
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState('Samantha');
  const [availableVoices, setAvailableVoices] = useState([]);
  const [showVoiceSelect, setShowVoiceSelect] = useState(false);
  const isMounted = useRef(true);

  // Load voices on mount
  useEffect(() => {
    isMounted.current = true;
    audioNarrator.getVoices().then((voices) => {
      if (isMounted.current && voices.length > 0) {
        setAvailableVoices(voices);
        const hasSamantha = voices.some((v) => v.name.toLowerCase().includes('samantha'));
        if (hasSamantha) setSelectedVoice('Samantha');
        else setSelectedVoice(voices[0].name);
      }
    });

    return () => {
      isMounted.current = false;
      audioNarrator.stop();
    };
  }, []);

  const playStep = useCallback(
    (stepIndex, voice = selectedVoice, spd = speed) => {
      if (!steps || stepIndex < 0 || stepIndex >= steps.length) {
        setIsPlaying(false);
        return;
      }

      setCurrentStep(stepIndex);
      const step = steps[stepIndex];

      // Execute visual simulation action
      step.action?.();
      onStepChange?.(stepIndex, step);

      setIsPlaying(true);
      audioNarrator.speak({
        text: step.narration,
        voice,
        speed: spd,
        onEnd: () => {
          if (!isMounted.current) return;
          // Auto advance to next step if playing continuously
          if (stepIndex + 1 < steps.length) {
            // Short 600ms breath between steps
            setTimeout(() => {
              if (isMounted.current && audioNarrator.isPlaying()) {
                playStep(stepIndex + 1, voice, spd);
              }
            }, 600);
          } else {
            setIsPlaying(false);
          }
        },
        onError: (err) => {
          console.warn('Audio narration error:', err);
          if (isMounted.current) setIsPlaying(false);
        },
      });
    },
    [steps, selectedVoice, speed, onStepChange]
  );

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioNarrator.stop();
      setIsPlaying(false);
    } else {
      playStep(currentStep);
    }
  };

  const handleRestart = () => {
    audioNarrator.stop();
    playStep(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      playStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      playStep(currentStep - 1);
    }
  };

  const handleSelectStep = (idx) => {
    playStep(idx);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    if (isPlaying) {
      audioNarrator.stop();
      playStep(currentStep, selectedVoice, newSpeed);
    }
  };

  const handleVoiceChange = (voiceName) => {
    setSelectedVoice(voiceName);
    setShowVoiceSelect(false);
    if (isPlaying) {
      audioNarrator.stop();
      playStep(currentStep, voiceName, speed);
    }
  };

  const activeStep = steps[currentStep] || steps[0];

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-[#12141f] to-[#0c0d14] border border-indigo-500/30 p-4 sm:p-5 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Background glow when active */}
      {isPlaying && (
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 animate-pulse" />
      )}

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">{title}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                Siri Voice
              </span>
            </div>
            <div className="text-xs text-gray-400">
              Step {currentStep + 1} of {steps.length}:{' '}
              <span className="text-indigo-300 font-medium">{activeStep?.title}</span>
            </div>
          </div>
        </div>

        {/* Right controls: Speed & Voice dropdown */}
        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <div className="inline-flex rounded-lg bg-black/50 p-0.5 border border-white/10 text-xs">
            {[0.85, 1.0, 1.25].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  speed === s ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Voice selector pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVoiceSelect(!showVoiceSelect)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 hover:bg-black/70 border border-white/10 text-[11px] text-gray-300 hover:text-white cursor-pointer transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{selectedVoice.replace(/\s*\(.*\)/, '')}</span>
            </button>

            {showVoiceSelect && availableVoices.length > 0 && (
              <div className="absolute right-0 top-full mt-1.5 w-48 max-h-56 overflow-y-auto bg-[#181926] border border-white/15 rounded-xl shadow-2xl p-1 z-30 custom-scrollbar">
                <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Select macOS Voice
                </div>
                {availableVoices.map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => handleVoiceChange(v.name)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                      selectedVoice === v.name
                        ? 'bg-indigo-600/40 text-indigo-200 font-semibold'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{v.name}</span>
                    <span className="text-[10px] text-gray-500">{v.lang}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Audio Subtitle / Caption Card */}
      <div className="relative bg-black/60 border border-white/10 rounded-xl p-3.5 mb-3 min-h-[64px] flex items-center">
        {isPlaying ? (
          <div className="flex items-start gap-3 w-full">
            <div className="flex items-center gap-1 pt-1 shrink-0">
              <span className="w-1 h-3.5 bg-indigo-400 rounded-full animate-pulse" />
              <span
                className="w-1 h-5 bg-indigo-400 rounded-full animate-pulse"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse"
                style={{ animationDelay: '300ms' }}
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-200 font-serif leading-relaxed italic m-0">
              "{activeStep?.narration}"
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full text-xs text-gray-400">
            <span className="italic">
              Press Play to have Siri explain this visualization and guide the sliders automatically.
            </span>
            <span className="text-[11px] text-indigo-400 font-mono">
              ~{Math.round(steps.length * 12)}s tour
            </span>
          </div>
        )}
      </div>

      {/* Main Playback Bar & Step Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Play/Pause & navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{currentStep === 0 ? 'Start Audio Tour' : 'Resume Tour'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            title="Restart from Step 1"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            title="Previous Step"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 disabled:opacity-30 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            title="Next Step"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 disabled:opacity-30 cursor-pointer transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step dots / interactive selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectStep(idx)}
                className={`group flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/50 text-indigo-200 border border-indigo-400/50 font-bold'
                    : 'bg-black/40 text-gray-400 hover:text-gray-200 border border-white/5 hover:border-white/20'
                }`}
              >
                <span>{idx + 1}</span>
                <span className="hidden sm:inline text-[10px] text-gray-400 group-hover:text-gray-300">
                  {step.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
