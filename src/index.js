const {app, BrowserWindow, Menu} = require('electron');
let mainWindow;
const menu = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open File',
        accelerator: 'CmdOrCtrl+O'
      },
      {
        label: 'Open Folder',
        accelerator: 'CmdOrCtrl+Shift+O'
      },
      {
        type: 'separator'
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S'
      },
      {
        label: 'Save As',
        accelerator: 'CmdOrCtrl+Shift+S'
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
        accelerator: 'Alt+1'
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

function createWindow() {
  mainWindow = new BrowserWindow({width: 800, height: 600});

  mainWindow.loadURL('file://' + __dirname + '/index.html');

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if(mainWindow === null) createWindow();
});
