const { contextBridge, ipcRenderer } = require("electron");

// 暴露数据给渲染进程
contextBridge.exposeInMainWorld("electronAPI", {
  // 选择目录
  selectDirectory: () => ipcRenderer.invoke("select-directory"),

  // 获取图片库统计信息
  getLibraryStats: () => ipcRenderer.invoke("get-library-stats"),

  // 清理缓存
  clearCache: () => ipcRenderer.invoke("clear-cache"),

  // 文件监视相关
  startWatching: (directoryPath) =>
    ipcRenderer.invoke("start-watching", directoryPath),
  stopWatching: () => ipcRenderer.invoke("stop-watching"),

  // 文件变化监听
  onFileAdded: (callback) => ipcRenderer.on("file-added", callback),
  onFileModified: (callback) => ipcRenderer.on("file-modified", callback),
  onFileDeleted: (callback) => ipcRenderer.on("file-deleted", callback),
  onDirectoryDeleted: (callback) =>
    ipcRenderer.on("directory-deleted", callback),

  // 移除监听器
  removeListener: (channel) => ipcRenderer.removeAllListeners(channel),

  // 图片处理相关
  processImageFolder: (folderPath) =>
    ipcRenderer.invoke("process-image-folder", folderPath),
  getStoredImages: () => ipcRenderer.invoke("get-stored-images"),
  saveImages: (images) => ipcRenderer.invoke("save-images", images),

  // 添加文件读取功能
  readImageFile: (filePath) => ipcRenderer.invoke("read-image-file", filePath),
});

// 设置渲染进程的安全策略
process.once("loaded", () => {
  global.ipcRenderer = ipcRenderer;
});
