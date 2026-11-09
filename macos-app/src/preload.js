const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  executePython: (code) => ipcRenderer.invoke('execute-python', { code }),
  getPythonEnv: () => ipcRenderer.invoke('get-python-env'),
  revealSourceFile: (relPath) => ipcRenderer.invoke('reveal-source-file', { relPath }),
  openSourceFile: (relPath) => ipcRenderer.invoke('open-source-file', { relPath }),

  // AI assistant (Gemini). The API key never reaches the page; it stays in the main process.
  aiStatus: () => ipcRenderer.invoke('ai:status'),
  aiSetKey: (key) => ipcRenderer.invoke('ai:set-key', { key }),
  aiClearKey: () => ipcRenderer.invoke('ai:clear-key'),
  aiListModels: () => ipcRenderer.invoke('ai:list-models'),
  aiSetModel: (model) => ipcRenderer.invoke('ai:set-model', { model }),
  aiAbort: (id) => ipcRenderer.send('ai:abort', { id }),
  aiGenerate: async (params, onProgress) => {
    const channel = `ai:progress:${params.id}`;
    const listener = (_event, chars) => onProgress?.(chars);
    ipcRenderer.on(channel, listener);
    try {
      return await ipcRenderer.invoke('ai:generate', params);
    } finally {
      ipcRenderer.removeListener(channel, listener);
    }
  },
});
