const { app, BrowserWindow } = require("electron");
const path = require("path");
const { registerIpcHandlers } = require("./electron/fileSystem");

// 保存主窗口的引用
let mainWindow = null;

const isDev = process.env.NODE_ENV !== "production";

// ⽤于创建窗⼝
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.resolve(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: false,
    },
  });

  // 打开开发工具
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // 根据环境加载不同的URL
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    mainWindow.loadFile(path.resolve(__dirname, "dist/index.html"));
  }

  // 注册IPC处理程序
  registerIpcHandlers(mainWindow);

  // 处理导航错误
  mainWindow.webContents.on("did-fail-load", () => {
    console.log("页面加载失败，尝试重新加载...");
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.loadURL("http://localhost:3000");
      }
    }, 1000);
  });

  // 添加页面加载完成的处理
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("页面加载完成");
  });
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
