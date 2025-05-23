const { contextBridge } = require("electron");

// 暴露数据给渲染进程
contextBridge.exposeInMainWorld("myAPI", {
  n: 666,
  version: process.version,
});
