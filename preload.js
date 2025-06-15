const { contextBridge, ipcRenderer } = require("electron");

// 暴露数据给渲染进程
contextBridge.exposeInMainWorld("myAPI", {
  n: 666,
  version: process.version,
});

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  },
});
