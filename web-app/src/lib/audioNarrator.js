/* ---------------------------------------------------------------------------
   Audio Narrator Service
   Primary: macOS native Siri voice ('Samantha' via 'say' command through Electron bridge)
   Fallback: Web Speech API (window.speechSynthesis)
--------------------------------------------------------------------------- */

let isCurrentlySpeaking = false;
let _activeUtterance = null;

export const audioNarrator = {
  isMacApp() {
    return typeof window !== 'undefined' && Boolean(window.electronAPI?.ttsSpeak);
  },

  async getVoices() {
    if (this.isMacApp()) {
      try {
        const res = await window.electronAPI.ttsVoices();
        if (res.ok && res.voices?.length) {
          return res.voices;
        }
      } catch (err) {
        console.warn('Failed to get Electron TTS voices:', err);
      }
    }

    // Web Speech API fallback
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          resolve(
            voices
              .filter((v) => v.lang.startsWith('en'))
              .map((v) => ({ name: v.name, lang: v.lang }))
          );
          return;
        }
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          resolve(
            voices
              .filter((v) => v.lang.startsWith('en'))
              .map((v) => ({ name: v.name, lang: v.lang }))
          );
        };
        setTimeout(() => resolve([]), 500);
      });
    }

    return [{ name: 'Samantha', lang: 'en_US' }];
  },

  async speak({ text, voice = 'Samantha', speed = 1.0, onStart, onEnd, onError }) {
    this.stop();
    isCurrentlySpeaking = true;
    onStart?.();

    if (this.isMacApp()) {
      try {
        // macOS 'say' command rate is words per minute (~180 normal)
        const rate = Math.round(180 * speed);
        const res = await window.electronAPI.ttsSpeak({ text, voice, rate });
        isCurrentlySpeaking = false;
        if (res.ok) {
          onEnd?.();
        } else if (res.cancelled) {
          // aborted deliberately
        } else {
          onError?.(res.error || 'TTS playback failed');
        }
        return res;
      } catch (err) {
        isCurrentlySpeaking = false;
        onError?.(err.message);
        return { ok: false, error: err.message };
      }
    }

    // Web Speech API fallback
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      _activeUtterance = utterance;
      utterance.rate = speed;

      const voices = window.speechSynthesis.getVoices();
      const matched =
        voices.find((v) => v.name.toLowerCase().includes(voice.toLowerCase())) ||
        voices.find((v) => /siri/i.test(v.name)) ||
        voices.find((v) => /samantha/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (matched) utterance.voice = matched;

      utterance.onend = () => {
        isCurrentlySpeaking = false;
        _activeUtterance = null;
        onEnd?.();
      };

      utterance.onerror = (e) => {
        isCurrentlySpeaking = false;
        _activeUtterance = null;
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          onError?.(e.error);
        }
      };

      window.speechSynthesis.speak(utterance);
      return { ok: true };
    }

    isCurrentlySpeaking = false;
    onError?.('Speech synthesis not supported in this environment.');
    return { ok: false };
  },

  stop() {
    isCurrentlySpeaking = false;
    if (this.isMacApp()) {
      window.electronAPI?.ttsStop?.();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      _activeUtterance = null;
    }
  },

  isPlaying() {
    return isCurrentlySpeaking;
  },
};
