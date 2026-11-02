const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  executePython: (code) => ipcRenderer.invoke('execute-python', { code }),
  getPythonEnv: () => ipcRenderer.invoke('get-python-env'),
  revealSourceFile: (relPath) => ipcRenderer.invoke('reveal-source-file', { relPath }),
  openSourceFile: (relPath) => ipcRenderer.invoke('open-source-file', { relPath }),
});
