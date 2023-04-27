import { app, BrowserWindow, ipcMain, session } from 'electron';
import { join } from 'path';
import routes from './routes';
const { save, load } = require('./store/store-operations.js');
function createWindow() {

    
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 860,
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });
    
    
    ipcMain.handle('post', handleRequest);
    ipcMain.handle('get', handleRequest);

    if (process.env.NODE_ENV === 'development') {
        const rendererPort = process.argv[2];
        mainWindow.loadURL(`http://localhost:${rendererPort}`);
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
    }
}

const handleRequest = async (ev, path, data) => {
    
    for (const route of routes) {
        if (path === route.name) {
            return await route.action(data);
        }
    }
    
    return '404 | Not Found';
}

app.whenReady().then(() => {
    createWindow();

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': ['script-src \'self\'']
            }
        })
    })

    app.on('activate', function() {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
    
});

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('message', (event, message) => {
    console.log(message);
})