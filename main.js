const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");

// ⽤于创建窗⼝
function createWindow() {
  const win = new BrowserWindow({
    width: 1200, // 增加窗口宽度
    height: 800, // 增加窗口高度
    autoHideMenuBar: true, // ⾃动隐藏菜单栏

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  // 打开开发工具
  win.webContents.openDevTools();

  // 加载⼀个远程⻚⾯
  win.loadURL("http://localhost:3000/");

  return win;
}

// 当app准备好后，执⾏createWindow创建窗⼝
app.whenReady().then(() => {
  const mainWindow = createWindow();

  // 处理选择目录的IPC消息
  ipcMain.handle("select-directory", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      title: "选择图片库文件夹",
      buttonLabel: "选择此文件夹",
    });
    return result;
  });

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
