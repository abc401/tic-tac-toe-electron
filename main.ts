import {app, BrowserWindow, Menu} from 'electron'
import path from 'path'

const isMac = process.platform === 'darwin';

function makeWindow() {
    let win = new BrowserWindow({
    });
    Menu.setApplicationMenu(null);
    win.loadFile(path.join(__dirname, 'renderer/index.html'));
    win.webContents.openDevTools()
}

app.whenReady().then(() => {
    makeWindow();

    if (isMac) {
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                makeWindow();
            }
        });
    }

})

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
})