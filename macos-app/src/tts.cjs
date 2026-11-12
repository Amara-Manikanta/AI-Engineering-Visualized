/* ---------------------------------------------------------------------------
   macOS Native TTS (Text-to-Speech) bridge using Apple's 'say' command.
   Supports Siri voice (Samantha / Daniel / Rishi / etc.), rate adjustments,
   and instant stopping.
--------------------------------------------------------------------------- */

const { spawn } = require('child_process');

let currentSpeechProc = null;

function setupTts(ipcMain) {
  ipcMain.handle('tts:speak', async (_event, { text, voice = 'Samantha', rate = 180 }) => {
    // If a speech is already ongoing, cancel it first
    if (currentSpeechProc) {
      try {
        currentSpeechProc.kill('SIGTERM');
      } catch (_) {}
      currentSpeechProc = null;
    }

    if (!text || typeof text !== 'string') return { ok: false };

    return new Promise((resolve) => {
      const args = ['-v', voice, '-r', String(rate), text];
      const proc = spawn('say', args);
      currentSpeechProc = proc;

      proc.on('close', (code) => {
        if (currentSpeechProc === proc) {
          currentSpeechProc = null;
        }
        // code 0: finished successfully; code 143 / null: killed by SIGTERM (user clicked pause/stop)
        resolve({ ok: code === 0, cancelled: code === 143 || code === 15 });
      });

      proc.on('error', (err) => {
        if (currentSpeechProc === proc) {
          currentSpeechProc = null;
        }
        resolve({ ok: false, error: err.message });
      });
    });
  });

  ipcMain.handle('tts:stop', async () => {
    if (currentSpeechProc) {
      try {
        currentSpeechProc.kill('SIGTERM');
      } catch (_) {}
      currentSpeechProc = null;
    }
    return { ok: true };
  });

  ipcMain.handle('tts:voices', async () => {
    return new Promise((resolve) => {
      const proc = spawn('say', ['-v', '?']);
      let out = '';
      proc.stdout.on('data', (d) => { out += d.toString(); });
      proc.on('close', () => {
        const lines = out.split('\n');
        const voices = [];
        for (const line of lines) {
          const match = line.match(/^([^\s]+(?:\s+[^\s]+)*?)\s+([a-z]{2}_[A-Z]{2})\s+#\s*(.*)$/);
          if (match) {
            const [, name, lang, sample] = match;
            if (lang.startsWith('en_')) {
              voices.push({ name: name.trim(), lang, sample: sample.trim() });
            }
          }
        }
        // Place Siri/Samantha first
        voices.sort((a, b) => {
          if (a.name.toLowerCase().includes('samantha')) return -1;
          if (b.name.toLowerCase().includes('samantha')) return 1;
          return a.name.localeCompare(b.name);
        });
        resolve({ ok: true, voices });
      });
      proc.on('error', () => {
        resolve({ ok: true, voices: [{ name: 'Samantha', lang: 'en_US' }] });
      });
    });
  });
}

module.exports = { setupTts };
