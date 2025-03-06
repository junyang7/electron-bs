const {app, BrowserWindow} = require('electron');
const log = require('electron-log');
const path = require('path');
const fe = require('./fe');
const be = require('./be');

const userData = app.getPath("userData");
const cookie = path.join(userData, "cookie");

function createMainWindow() {
    const window = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    window.loadURL(`http://127.0.0.1:${fe.getPort()}`);
}

app.whenReady().then(async () => {
    try {
        await fe.start();
        await be.start();
        fe.setBePort(be.getPort());
        createMainWindow();
    } catch (error) {
        log.error('应用启动失败:', error);
        app.quit();
    }
});

app.on("window-all-closed", async () => {
    await fe.close();
    await be.close();
    app.quit();
});
