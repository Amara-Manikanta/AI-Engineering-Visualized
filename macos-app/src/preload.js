const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  executePython: (code) => ipcRenderer.invoke('execute-python', { code }),
  getPythonEnv: () => ipcRenderer.invoke('get-python-env'),
});
