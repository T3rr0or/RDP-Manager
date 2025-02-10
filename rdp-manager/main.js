const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store();
const { spawn } = require('child_process');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Configure logging
log.transports.file.level = 'info';
autoUpdater.logger = log;
autoUpdater.autoDownload = true;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('src/index.html');
  
  // Check for updates
  autoUpdater.checkForUpdatesAndNotify();

  // Update events
  ['update-available', 'update-downloaded', 'error'].forEach(event => {
    autoUpdater.on(event, (info) => {
      mainWindow.webContents.send(event, info);
    });
  });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());

// IPC handlers
ipcMain.handle('save-connections', (_, connections) => {
  store.set('connections', connections);
  return true;
});

ipcMain.handle('load-connections', () => store.get('connections', []));

ipcMain.handle('connect-rdp', (_, connection) => {
  const tempPath = path.join(app.getPath('temp'), `rdp_${connection.id}.rdp`);
  const rdpContent = `screen mode id:i:2
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
kdcproxyname:s:`;

  require('fs').writeFileSync(tempPath, rdpContent);
  process.platform === 'win32' && spawn('mstsc.exe', [tempPath]);
});

ipcMain.handle('install-update', () => autoUpdater.quitAndInstall()); 