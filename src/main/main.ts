/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import axios from 'axios';
import { download } from 'electron-dl';
import { resolveHtmlPath } from './util';
const child = require('child_process').execFile;

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;

ipcMain.on('ipc-example', async (event, arg) => {
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('download', async (event, info) => {
  download(mainWindow, info.url, {
    ...info.properties,
    onTotalProgress: (status) => {
      console.log(`download-progress: `, Math.floor(status.percent * 100));
      if (Math.floor(status.percent * 100) % 2 === 0) {
        event.sender.send(`download-progress`, status);
      }
    },
  });
});

ipcMain.on('download-exe', async (event, info) => {
  download(mainWindow, info.url, {
    ...info.properties,
    onTotalProgress: (status) => {
      console.log(`download-exe: `, Math.floor(status.percent * 100));
      if (Math.floor(status.percent * 100) % 2 === 0) {
        event.sender.send(`download-exe`, status);
      }
    },
  });
});

ipcMain.on('checkForPatchUpdates', async (event, args) => {
  // API Call to check for updates
  // Check timestamps in args and determine if update is necessary
  console.log('Checking for patch updates...');
  console.log('args', args);
  if(args.currentPatchVersions === null) return;
  const currentPatchData = JSON.parse(args.currentPatchVersions);
  const patchData = await axios
    .get('https://wargodswow.com/api/patch')
    .then((o) => o.data);
  let patchRes = [];
  let patchVersions = {};

  patchData.map((patch, index) => {
    console.log(patch.patchVersion)
    console.log(currentPatchData[patch.fileName])
    if (patch.patchVersion > currentPatchData[patch.fileName]) {
      patchRes.push({
        name: patch.fileName,
        url: patch.url,
        version: patch.patchVersion,
      });
      patchVersions[patch.fileName] = patch.patchVersion;
    }
  });
  console.log(patchRes);
  if(patchRes.length) {
    event.reply('patchUpdateFound', {patchArr: patchRes, patchVersions: patchVersions});
  }
});

ipcMain.on('setGameAccountDetails', async (event, param) => {
  console.log(param.path);
  console.log(param.str);
  fs.readFile(`${param.path}/WTF/Config.wtf`, function (err, data) {
    if (err) throw err;
    if (data.indexOf('SET accountName ') >= 0) {
      console.log('found string, aborting'); //Do Things
    } else {
      fs.appendFile(`${param.path}/WTF/Config.wtf`, param.str, function (err) {
        if (err) throw err;
        console.log('saved!');
      });
    }
  });
  fs.readFile(`${param.path}/Data/enGB/realmlist.wtf`, function (err, data) {
    if (err) return;
    if (data.indexOf('set realmlist ') >= 0) {
      fs.writeFile(
        `${param.path}/Data/enGB/realmlist.wtf`,
        'set realmlist logon.wargodswow.com',
        function (err) {
          if (err) throw err;
          console.log('saved realmlist!');
        }
      );
    }
  });
  fs.readFile(`${param.path}/Data/enUS/realmlist.wtf`, function (err, data) {
    if (err) return;
    if (data.indexOf('set realmlist ') >= 0) {
      fs.writeFile(
        `${param.path}/Data/enUS/realmlist.wtf`,
        'set realmlist logon.wargodswow.com',
        function (err) {
          if (err) throw err;
          console.log('saved reallist!');
        }
      );
    }
  });
});

ipcMain.on('checkInstallationFolder', async (event, info) => {
  const hasPatchC = await fs.access(`${info}/Data/Patch-C.mpq`, (err) => {
    if (err) {
      console.log('patch missing');
      return false;
    } else {
      console.log('patch found');
      event.reply(`installationFolderFound`, true);
      return true;
    }
  });

  if (hasPatchC) {
    console.log('attemping emit');
  }
});

ipcMain.handle('launchwow', async (event, path) => {
  if (!mainWindow) {
    throw new Error('"mainWindow" is not defined');
  }

  const executablePath = path + '/wow.exe';

  child(executablePath, function (err, data) {
    if (err) {
      console.error(err);
      return;
    }

    console.log(data.toString());
  });
});

// Main process
ipcMain.handle('dialog', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'title',
    message: 'detail',
  });
  return !result.canceled ? result.filePaths[0] : '';
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: true,
    width: 1048,
    height: 844,
    resizable: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.setMenuBarVisibility(false);

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
