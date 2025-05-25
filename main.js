const { app, BrowserWindow } = require("electron");
const path = require("node:path");
require('./electron/ipc'); // 新增：引入IPC

// ⽤于创建窗⼝
function createWindow() {
  const win = new BrowserWindow({
    width: 800, // 窗⼝宽度
    height: 600, // 窗⼝⾼度
    autoHideMenuBar: true, // ⾃动隐藏菜单栏

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 打开开发工具
  win.webContents.openDevTools();

  // 加载⼀个远程⻚⾯
  win.loadURL("http://localhost:5173/");
}
// 当app准备好后，执⾏createWindow创建窗⼝
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
