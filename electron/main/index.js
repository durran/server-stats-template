const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const watch = require('watch');
const exec = require('child_process').exec;
const path = require('path');

const ROOT_DIR = path.resolve(`${__dirname}/../..`);
const SRC_DIR = path.join(ROOT_DIR, 'src');

const runner = require('mongodb-runner');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({ width: 1200, height: 800 });
  mainWindow.loadURL(`file://${__dirname}/../renderer/index.html`);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  runner.start({ port: 27025 }, () => {
    createWindow();
  });
  watch.watchTree(SRC_DIR, (f, curr, prev) => {
    if (typeof f === 'object' && prev === null && curr === null) {
      // don't reload on initial load
      return;
    }
    exec('npm run compile', {cwd: ROOT_DIR}, (err) => {
      if (err) {
        /* eslint no-console: 0 */
        console.error(err);
      }
      mainWindow.reload();
    });
  });
});

app.on('window-all-closed', () => {
  watch.unwatchTree(SRC_DIR);
  runner.stop({ port: 27025 }, () => {
    app.quit();
  });
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
