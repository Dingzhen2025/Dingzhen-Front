const { ipcMain } = require('electron');
const fileManager = require('./fileManager');

// 存储监听者
const watchers = new Map();

// 处理扫描目录请求
ipcMain.handle('file:scan', async (event, dirPath) => {
    try {
        return await fileManager.scanDirectory(dirPath);
    } catch (error) {
        throw error;
    }
});

// 处理监听目录请求
ipcMain.handle('file:watch', async (event, dirPath) => {
    try {
        if (watchers.has(dirPath)) {
            watchers.get(dirPath).close();
        }

        const onChange = (eventData) => {
            event.sender.send('file:change', eventData);
        };

        const watcher = await fileManager.watchDirectory(dirPath, onChange);
        watchers.set(dirPath, watcher);
        return true;
    } catch (error) {
        throw error;
    }
});

// 处理停止监听请求
ipcMain.handle('file:unwatch', (event, dirPath) => {
    if (watchers.has(dirPath)) {
        watchers.get(dirPath).close();
        watchers.delete(dirPath);
        return true;
    }
    return false;
});

// 处理计算哈希请求
ipcMain.handle('file:hash', async (event, filePath) => {
    try {
        return await fileManager.calculateHash(filePath);
    } catch (error) {
        throw error;
    }
});