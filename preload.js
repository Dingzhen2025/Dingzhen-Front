const { contextBridge } = require("electron");

// 暴露数据给渲染进程
contextBridge.exposeInMainWorld("myAPI", {
  n: 666,
  version: process.version,

  // 新增文件管理API
  file: {
    scan: (dirPath) => ipcRenderer.invoke('file:scan', dirPath),
    watch: (dirPath) => ipcRenderer.invoke('file:watch', dirPath),
    unwatch: (dirPath) => ipcRenderer.invoke('file:unwatch', dirPath),
    hash: (filePath) => ipcRenderer.invoke('file:hash', filePath),
    onFileChange: (callback) => {
      ipcRenderer.on('file:change', (event, data) => callback(data));
      return () => ipcRenderer.off('file:change', callback);
    }
  },
  // 新增接口相关API
  api: {
    auth: {
      login: (account, password) => ipcRenderer.invoke('api:auth:login', account, password),
      register: (user) => ipcRenderer.invoke('api:auth:register', user)
    },
    image: {
      upload: (image) => ipcRenderer.invoke('api:image:upload', image),
      remove: (imgName) => ipcRenderer.invoke('api:image:remove', imgName),
      search: (image, num) => ipcRenderer.invoke('api:image:search', image, num)
    }
  }
});
