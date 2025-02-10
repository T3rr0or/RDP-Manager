const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { spawn } = require('child_process');

const store = new Store();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('src/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('save-connections', async (event, connections) => {
  store.set('connections', connections);
  return true;
});

ipcMain.handle('load-connections', async () => {
  return store.get('connections', []);
});

ipcMain.handle('connect-rdp', async (event, connection) => {
  const tempPath = path.join(app.getPath('temp'), `rdp_${connection.id}.rdp`);
  const rdpContent = `
screen mode id:i:2
use multimon:i:0
desktopwidth:i:1920
desktopheight:i:1080
session bpp:i:32
compression:i:1
keyboardhook:i:2
displayconnectionbar:i:1
disable wallpaper:i:0
allow font smoothing:i:0
allow desktop composition:i:0
disable full window drag:i:1
disable menu anims:i:1
disable themes:i:0
disable cursor setting:i:0
bitmapcachepersistenable:i:1
full address:s:${connection.host}
audiomode:i:0
redirectprinters:i:1
redirectcomports:i:0
redirectsmartcards:i:1
redirectclipboard:i:1
redirectposdevices:i:0
autoreconnection enabled:i:1
authentication level:i:2
prompt for credentials:i:0
negotiate security layer:i:1
remoteapplicationmode:i:0
alternate shell:s:
shell working directory:s:
gatewayhostname:s:
gatewayusagemethod:i:4
gatewaycredentialssource:i:4
gatewayprofileusagemethod:i:0
promptcredentialonce:i:0
use redirection server name:i:0
rdgiskdcproxy:i:0
kdcproxyname:s:
  `.trim();

  require('fs').writeFileSync(tempPath, rdpContent);

  if (process.platform === 'win32') {
    spawn('mstsc.exe', [tempPath]);
  } else {
    // For Mac/Linux, you might want to use an alternative RDP client
    // like FreeRDP or Remmina
    console.log('RDP not supported on this platform yet');
  }
}); 