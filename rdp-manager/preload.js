const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('rdpApi', {
  saveConnections: (connections) => ipcRenderer.invoke('save-connections', connections),
  loadConnections: () => ipcRenderer.invoke('load-connections'),
  connect: (connection) => ipcRenderer.invoke('connect-rdp', connection),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  onUpdateError: (callback) => ipcRenderer.on('update-error', callback)
}); 