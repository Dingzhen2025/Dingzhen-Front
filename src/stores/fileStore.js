// 文件管理状态
import { defineStore } from 'pinia';
import { uploadImage, removeImage, searchImage } from '../api/image';

export const useFileStore = defineStore('file', {
    state: () => ({
        watchedDir: '',              // 监听的目录
        localImages: new Map(),      // 本地图片哈希表
        syncLog: new Map(),          // 同步日志
        isWatching: false,           // 监听状态
        scanError: null              // 扫描错误
    }),
    actions: {
        // 扫描目录
        async scanDirectory(dirPath) {
            try {
                this.scanError = null;
                const images = await window.myAPI.file.scan(dirPath);
                this.localImages = new Map(images.map(img => [img.name, img]));
                return images;
            } catch (error) {
                this.scanError = error.message;
                throw error;
            }
        },
        // 开始监听目录
        async watchDirectory(dirPath) {
            if (this.isWatching && this.watchedDir === dirPath) return;

            try {
                await window.myAPI.file.watch(dirPath);
                this.watchedDir = dirPath;
                this.isWatching = true;
                // 首次扫描
                await this.scanDirectory(dirPath);
                return true;
            } catch (error) {
                this.scanError = error.message;
                throw error;
            }
        },
        // 停止监听
        stopWatching() {
            if (this.watchedDir) {
                window.myAPI.file.unwatch(this.watchedDir);
                this.watchedDir = '';
                this.isWatching = false;
            }
        },
        // 处理文件变化
        handleFileChange(eventData) {
            switch (eventData.type) {
                case 'add':
                case 'change':
                    this.handleFileAddOrChange(eventData.file);
                    break;
                case 'delete':
                    this.handleFileDelete(eventData.file);
                    break;
            }
        },
        // 处理新增或修改的文件
        async handleFileAddOrChange(file) {
            try {
                const hash = await window.myAPI.file.hash(file.path);
                const localImage = {
                    name: file.name,
                    hash,
                    path: file.path,
                    mtime: new Date().toISOString()
                };

                this.localImages.set(file.name, localImage);

                // 检查是否需要上传（本地日志中不存在或哈希不同）
                const logHash = this.syncLog.get(file.name);
                if (!logHash || logHash !== hash) {
                    await this.uploadImage(localImage);
                    this.syncLog.set(file.name, hash);
                }
            } catch (error) {
                console.error('处理文件变化失败:', error);
            }
        },
        // 处理删除的文件
        handleFileDelete(file) {
            this.localImages.delete(file.name);
            if (this.syncLog.has(file.name)) {
                this.removeImage(file.name);
                this.syncLog.delete(file.name);
            }
        },
        // 上传图片
        async uploadImage(image) {
            try {
                const file = await fetch(image.path).then(res => res.blob());
                return await uploadImage({
                    name: image.name,
                    file,
                    dev: 'electron',
                    dir: path.dirname(image.path)
                });
            } catch (error) {
                console.error('上传图片失败:', error);
                throw error;
            }
        },
        // 删除图片
        async removeImage(imgName) {
            try {
                await removeImage(imgName);
                this.syncLog.delete(imgName);
            } catch (error) {
                console.error('删除图片失败:', error);
                throw error;
            }
        },
        // 图搜图
        async searchByImage(filePath, num = 5) {
            try {
                const file = await fetch(filePath).then(res => res.blob());
                return await searchImage(file, num);
            } catch (error) {
                console.error('图片搜索失败:', error);
                throw error;
            }
        }
    }
});