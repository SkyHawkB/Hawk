const electron = require('electron');
const {
  app, dialog, ipcMain, BrowserWindow,
  Menu, globalShortcut
} = electron;
const fs = require('fs');
const _path = require('path');
const os = require('os');
const cson = require('cson');
const SETTINGS_FILE_PATH = _path.join(os.homedir(), '/.hawk/settings.cson');
let settings;
let mainWindow;
let currentWorkingDirectory = null;
let tvFocused = false;
const open = (__path) => {
  if(!__path) return;
  const path = __path[0];

  if(fs.lstatSync(path).isDirectory()) {
    currentWorkingDirectory = path;
  } else {
    currentWorkingDirectory = _path.dirname(path);

    mainWindow.webContents.send('openFileEditor', {path: path});
  }

  mainWindow.webContents.send('cwdUpdate', {cwd: currentWorkingDirectory});
};
const options = {
  minWidth: 600,
  minHeight: 450,
  width: 800,
  height: 600,
  backgroundColor: '#303040'
};
const menu = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open File',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          open(dialog.showOpenDialog({properties: ['openFile']}));
        }
      },
      {
        label: 'Open Folder',
        accelerator: 'CmdOrCtrl+Shift+O',
        click: () => {
          open(dialog.showOpenDialog({properties: ['openDirectory']}));
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          mainWindow.webContents.send('saveFile', {});
        }
      },
      {
        label: 'Save As',
        accelerator: 'CmdOrCtrl+Shift+S'
      },
      {
        type: 'separator'
      },
      {
        label: 'Settings',
        click: () => {
          mainWindow.webContents.send('openFileEditor', {path: SETTINGS_FILE_PATH});
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z'
      },
      {
        label: 'Redo',
        accelerator: 'CmdOrCtrl+Y'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Full Screen',
        accelerator: 'F11'
      },
      {
        label: 'Toggle Tree View',
        accelerator: 'Alt+1',
        click: () => {
          mainWindow.webContents.send('tvToggle', {});
        }
      },
      {
        label: 'Toggle Terminal',
        accelerator: 'Alt+2'
      }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Documentation'
      },
      {
        label: 'Frequently Asked Questions'
      },
      {
        type: 'separator'
      },
      {
        label: 'Welcome Guide'
      }
    ]
  }
];

const tvContextMenu = Menu.buildFromTemplate([
  {
    label: 'New File',
    click: () => {
      mainWindow.webContents.send('showCreateDialog', {type: 'file'});
    }
  },
  {
    label: 'New Folder',
    click: () => {
      mainWindow.webContents.send('showCreateDialog', {type: 'folder'});
    }
  }
]);

function createWindow() {
  mainWindow = new BrowserWindow(options);

  mainWindow.loadURL('file://' + __dirname + '/index.html');

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  //mainWindow.toggleDevTools();
}
function registerAccelerators() {
  globalShortcut.register('CmdOrCtrl+O', () => {
    open(dialog.showOpenDialog({properties: ['openFile']}));
  });
  globalShortcut.register('CmdOrCtrl+Shift+O', () => {
    open(dialog.showOpenDialog({properties: ['openDirectory']}));
  });
  globalShortcut.register('CmdOrCtrl+S', () => {
    mainWindow.webContents.send('saveFile', {});
  });
  globalShortcut.register('Alt+1', () => {
    mainWindow.webContents.send('tvToggle', {});
  });
  globalShortcut.register('A', () => {
    if(tvFocused) mainWindow.webContents.send('new', {type: 'file'});
  });
  globalShortcut.register('Shift+A', () => {
    if(tvFocused) mainWindow.webContents.send('new', {type: 'folder'});
  });
}
function generateAndReadSettingsFile() {
  if(!fs.existsSync(SETTINGS_FILE_PATH)) {
    require('mkpath').sync(_path.dirname(SETTINGS_FILE_PATH));
    fs.writeFileSync(SETTINGS_FILE_PATH, require('./default-settings.js').DEFAULT_SETTINGS);
  }

  settings = cson.load(SETTINGS_FILE_PATH);
}

app.on('ready', () => {
  createWindow();
  registerAccelerators();
  generateAndReadSettingsFile();
});
app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if(mainWindow === null) createWindow();
});

/* eslint-disable no-unused-vars */
ipcMain.on('settingsRequest', (event, data) => {
  mainWindow.webContents.send('settingsUpdate', {settings: settings});
});
ipcMain.on('showTvContextMenu', (event, data) => {
  if(currentWorkingDirectory !== null) {
    tvContextMenu.popup(mainWindow, data.x, data.y);
  }
});
/* eslint-enable no-unused-vars */
