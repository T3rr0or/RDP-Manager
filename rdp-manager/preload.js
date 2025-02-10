const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('rdpApi', {
  saveConnections: (connections) => ipcRenderer.invoke('save-connections', connections),
  loadConnections: () => ipcRenderer.invoke('load-connections'),
  connect: (connection) => ipcRenderer.invoke('connect-rdp', connection)
}); 