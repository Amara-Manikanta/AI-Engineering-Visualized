/* ---------------------------------------------------------------------------
   Gemini bridge for the AI assistant (macOS app only).

   The API key lives only in this process: it is encrypted with the macOS
   Keychain (Electron safeStorage) on disk and is never sent to the page. The
   page can ask "is a key saved?", save a new one, list the models that key can
   use, and run a generation. Requests go to one fixed Google host.
--------------------------------------------------------------------------- */

const { app, safeStorage } = require('electron');
const fs = require('fs');
const path = require('path');

const API = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_ID = /^[A-Za-z0-9._-]{1,80}$/;
const KEY_SHAPE = /^[A-Za-z0-9_-]{20,80}$/;
const GENERATE_TIMEOUT_MS = 240000;

// Models that can't write page code. Anything else that supports generateContent is offered.
const NOT_TEXT_MODELS = /(embedding|tts|image|live|audio|native-audio|robotics|computer-use|veo|imagen|aqa|learnlm)/i;

function setupGemini(ipcMain, getWindow) {
  const configPath = () => path.join(app.getPath('userData'), 'gemini-config.json');
  let sessionKey = null; // used when the Keychain is unavailable: lives until the app quits

  const readConfig = () => {
    try {
      return JSON.parse(fs.readFileSync(configPath(), 'utf8'));
    } catch {
      return {};
    }
  };
  const writeConfig = (cfg) => fs.writeFileSync(configPath(), JSON.stringify(cfg), { mode: 0o600 });

  const getKey = () => {
    if (sessionKey) return sessionKey;
    const { keyEnc } = readConfig();
    if (!keyEnc || !safeStorage.isEncryptionAvailable()) return null;
    try {
      return safeStorage.decryptString(Buffer.from(keyEnc, 'base64'));
    } catch {
      return null;
    }
  };

  // Only the app's own window may use the bridge.
  const trusted = (event) => {
    const win = getWindow();
    return Boolean(win) && event.sender === win.webContents;
  };

  const explain = (status, body) => {
    let detail = '';
    try {
      detail = JSON.parse(body)?.error?.message || '';
    } catch {
      /* not JSON */
    }
    if (status === 400 && /api key/i.test(detail)) return 'Google rejected the API key. Check that you pasted the whole key.';
    if (status === 401 || status === 403) return `Google refused the request (${status}). ${detail || 'Check the key and that the Gemini API is enabled for it.'}`;
    if (status === 404) return `That model is not available for this key. Pick another one in settings. ${detail}`.trim();
    if (status === 429) return 'Free-tier rate limit or daily quota reached. Wait a minute and try again, or pick a lighter model in settings.';
    if (status >= 500) return `Google's service had a problem (${status}). Try again shortly.`;
    return `Request failed (${status}). ${detail}`.trim();
  };

  const listModels = async (key) => {
    const res = await fetch(`${API}/models?pageSize=200`, { headers: { 'x-goog-api-key': key }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(explain(res.status, await res.text()));
    const data = await res.json();
    return (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => String(m.name || '').replace(/^models\//, ''))
      .filter((id) => /^gemini/i.test(id) && !NOT_TEXT_MODELS.test(id) && MODEL_ID.test(id))
      .sort();
  };

  // Default pick: the newest stable full "flash" model (precise enough for code edits),
  // then a flash-lite, then whatever is last. The user can change it in settings.
  const stable = (id) => !/preview|exp/.test(id);
  const newest = (list) => [...list].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).pop();
  const suggest = (ids) =>
    newest(ids.filter((id) => /flash/.test(id) && !/lite/.test(id) && stable(id))) ||
    newest(ids.filter((id) => /flash-lite/.test(id) && stable(id))) ||
    newest(ids) ||
    null;

  ipcMain.handle('ai:status', (event) => {
    if (!trusted(event)) return { ok: false };
    const cfg = readConfig();
    return { ok: true, hasKey: Boolean(getKey()), model: cfg.model || null, secure: safeStorage.isEncryptionAvailable() };
  });

  ipcMain.handle('ai:set-key', async (event, { key }) => {
    if (!trusted(event)) return { ok: false, error: 'Not allowed.' };
    const clean = String(key || '').trim();
    if (!KEY_SHAPE.test(clean)) return { ok: false, error: 'That does not look like a Gemini API key.' };
    try {
      const models = await listModels(clean); // doubles as validation
      if (!models.length) return { ok: false, error: 'The key works, but no Gemini text models are available to it.' };
      const cfg = readConfig();
      if (safeStorage.isEncryptionAvailable()) {
        cfg.keyEnc = safeStorage.encryptString(clean).toString('base64');
        sessionKey = null;
      } else {
        sessionKey = clean;
        delete cfg.keyEnc;
      }
      if (!cfg.model || !models.includes(cfg.model)) cfg.model = suggest(models);
      writeConfig(cfg);
      return { ok: true, models, model: cfg.model, secure: safeStorage.isEncryptionAvailable() };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  });

  ipcMain.handle('ai:clear-key', (event) => {
    if (!trusted(event)) return { ok: false };
    sessionKey = null;
    const cfg = readConfig();
    delete cfg.keyEnc;
    writeConfig(cfg);
    return { ok: true };
  });

  ipcMain.handle('ai:list-models', async (event) => {
    if (!trusted(event)) return { ok: false, error: 'Not allowed.' };
    const key = getKey();
    if (!key) return { ok: false, error: 'No API key saved.' };
    try {
      const models = await listModels(key);
      const cfg = readConfig();
      return { ok: true, models, model: cfg.model && models.includes(cfg.model) ? cfg.model : suggest(models) };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  });

  ipcMain.handle('ai:set-model', (event, { model }) => {
    if (!trusted(event)) return { ok: false };
    if (!MODEL_ID.test(String(model || ''))) return { ok: false, error: 'Invalid model name.' };
    const cfg = readConfig();
    cfg.model = model;
    writeConfig(cfg);
    return { ok: true };
  });

  // --- Generation -----------------------------------------------------------
  const running = new Map();

  ipcMain.on('ai:abort', (event, { id }) => {
    if (!trusted(event)) return;
    running.get(id)?.abort();
  });

  ipcMain.handle('ai:generate', async (event, { id, system, messages, temperature }) => {
    if (!trusted(event)) return { ok: false, error: 'Not allowed.' };
    const key = getKey();
    if (!key) return { ok: false, error: 'No API key saved.' };
    const model = readConfig().model;
    if (!model || !MODEL_ID.test(model)) return { ok: false, error: 'No model selected. Open settings and pick one.' };
    if (!Array.isArray(messages) || !messages.length) return { ok: false, error: 'Nothing to send.' };

    const controller = new AbortController();
    running.set(id, controller);
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(GENERATE_TIMEOUT_MS)]);
    const sender = event.sender;
    const progress = (chars) => {
      if (!sender.isDestroyed()) sender.send(`ai:progress:${id}`, chars);
    };

    try {
      const res = await fetch(`${API}/models/${model}:streamGenerateContent?alt=sse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: String(system || '') }] },
          contents: messages.map((m) => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: String(m.text) }] })),
          generationConfig: { temperature: typeof temperature === 'number' ? temperature : 0.4, maxOutputTokens: 16384 },
        }),
        signal,
      });
      if (!res.ok) return { ok: false, status: res.status, error: explain(res.status, await res.text()) };

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let text = '';
      let finish = null;
      let blocked = null;

      const take = (line) => {
        if (!line.startsWith('data:')) return;
        const raw = line.slice(5).trim();
        if (!raw) return;
        let data;
        try {
          data = JSON.parse(raw);
        } catch {
          return;
        }
        if (data.promptFeedback?.blockReason) blocked = data.promptFeedback.blockReason;
        const cand = data.candidates?.[0];
        if (cand?.finishReason) finish = cand.finishReason;
        for (const part of cand?.content?.parts || []) {
          if (typeof part.text === 'string' && !part.thought) text += part.text;
        }
        progress(text.length);
      };

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        lines.forEach((l) => take(l.trim()));
      }
      take(buffer.trim());

      if (blocked) return { ok: false, error: `Gemini declined this request (${blocked}).` };
      if (!text) return { ok: false, error: 'Gemini returned an empty reply. Try rephrasing, or pick another model.' };
      return { ok: true, text, truncated: finish === 'MAX_TOKENS', model };
    } catch (err) {
      if (controller.signal.aborted) return { ok: false, aborted: true, error: 'Stopped.' };
      if (err?.name === 'TimeoutError') return { ok: false, error: 'Gemini took too long to answer. Try a smaller request or a faster model.' };
      return { ok: false, error: `Could not reach Gemini: ${err.message || err}` };
    } finally {
      running.delete(id);
    }
  });
}

module.exports = { setupGemini };
