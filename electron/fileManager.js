const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const watch = promisify(require('chokidar').watch);

// 计算文件哈希
const calculateHash = async (filePath) => {
    const data = await fs.readFile(filePath);
    return crypto.createHash('md5').update(data).digest('hex');
};

// 扫描目录获取图片
const scanDirectory = async (dirPath) => {
    try {
        const files = await fs.readdir(dirPath);
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
        });

        const imageData = [];
        for (const file of imageFiles) {
            const filePath = path.join(dirPath, file);
            const hash = await calculateHash(filePath);
            const stats = await fs.stat(filePath);
            imageData.push({
                name: file,
                hash,
                path: filePath,
                size: stats.size,
                mtime: stats.mtime.toISOString()
            });
        }
        return imageData;
    } catch (error) {
        throw new Error(`扫描目录失败: ${error.message}`);
    }
};

// 监听目录变化
const watchDirectory = async (dirPath, onChange) => {
    try {
        const watcher = watch(dirPath, {
            persistent: true,
            ignoreInitial: true
        });

        watcher.on('add', async (path) => {
            const fileName = path.split(path.sep).pop();
            onChange({ type: 'add', file: { name: fileName, path } });
        });

        watcher.on('unlink', (path) => {
            const fileName = path.split(path.sep).pop();
            onChange({ type: 'delete', file: { name: fileName, path } });
        });

        watcher.on('change', async (path) => {
            const fileName = path.split(path.sep).pop();
            onChange({ type: 'change', file: { name: fileName, path } });
        });

        return watcher;
    } catch (error) {
        throw new Error(`监听目录失败: ${error.message}`);
    }
};

module.exports = {
    scanDirectory,
    watchDirectory,
    calculateHash
};