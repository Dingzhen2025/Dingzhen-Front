const { dialog, ipcMain } = require("electron");
const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");
const sharp = require("sharp");
const Store = require("electron-store");

// 创建本地存储实例
const store = new Store({
  name: "image-library",
  defaults: {
    images: {},
  },
});

// 文件监视器实例
let watcher = null;

// 图片文件扩展名
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];

// 注册IPC处理程序
function registerIpcHandlers(mainWindow) {
  // 选择目录
  ipcMain.handle("select-directory", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });

    if (!result.canceled) {
      const directoryPath = result.filePaths[0];
      // 清空旧的图片库数据
      if (store) {
        store.set("images", {});
      }
      await setupWatcher(directoryPath, mainWindow);
      return directoryPath;
    }
    return null;
  });

  // 获取图片库统计信息
  ipcMain.handle("get-library-stats", () => {
    if (!store) return { totalImages: 0, lastUpdate: null };
    const imageLibrary = store.get("images", {});
    return {
      totalImages: Object.keys(imageLibrary).length,
      lastUpdate: store.get("lastUpdate"),
    };
  });

  // 清理缓存
  ipcMain.handle("clear-cache", () => {
    if (store) store.clear();
    if (watcher) {
      watcher.close();
      watcher = null;
    }
    return true;
  });

  // 处理图片文件夹
  ipcMain.handle("process-image-folder", async (event, folderPath) => {
    return await processImageFolder(folderPath);
  });

  // 获取存储的图片信息
  ipcMain.handle("get-stored-images", () => {
    return store.get("images");
  });

  // 保存图片信息
  ipcMain.handle("save-images", (event, images) => {
    store.set("images", images);
    return true;
  });

  // 开始监控文件夹
  ipcMain.handle("start-watching", async (event, directoryPath) => {
    return await setupWatcher(directoryPath, mainWindow);
  });

  // 停止监控
  ipcMain.handle("stop-watching", async () => {
    if (watcher) {
      await watcher.close();
      watcher = null;
      return true;
    }
    return false;
  });

  // 添加文件读取处理
  ipcMain.handle("read-image-file", async (event, filePath) => {
    try {
      // 验证文件是否存在
      await fs.access(filePath);

      // 验证是否为图片文件
      if (!IMAGE_EXTENSIONS.includes(path.extname(filePath).toLowerCase())) {
        throw new Error("不是有效的图片文件");
      }

      // 读取文件
      const buffer = await fs.readFile(filePath);

      // 获取文件信息
      const stats = await fs.stat(filePath);

      // 创建File对象所需的元数据
      const metadata = {
        lastModified: stats.mtimeMs,
        size: stats.size,
        type: getMimeType(filePath),
      };

      return {
        buffer: buffer,
        metadata: metadata,
        fileName: path.basename(filePath),
      };
    } catch (error) {
      console.error("读取图片文件失败:", error);
      throw error;
    }
  });
}

// 根据文件扩展名获取标准MIME类型
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
    ".webp": "image/webp",
  };
  return mimeTypes[ext] || "application/octet-stream"; // 提供一个通用后备
}

// 递归处理目录
async function processDirectory(directoryPath, imageInfoMap = {}) {
  try {
    // 检查目录是否存在
    await fs.access(directoryPath);

    const entries = await fs.readdir(directoryPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry.name);

      try {
        if (entry.isDirectory()) {
          // 递归处理子目录
          await processDirectory(fullPath, imageInfoMap);
        } else if (
          entry.isFile() &&
          IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())
        ) {
          // 处理图片文件
          const imageInfo = await getImageInfo(fullPath);
          imageInfoMap[fullPath] = imageInfo;
        }
      } catch (itemError) {
        console.warn(`处理路径 ${fullPath} 时出错:`, itemError);
        continue; // 跳过出错的项目，继续处理其他项目
      }
    }

    return imageInfoMap;
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`目录 ${directoryPath} 不存在`);
    } else if (error.code === "EACCES") {
      throw new Error(`无权限访问目录 ${directoryPath}`);
    } else {
      console.error("处理目录失败:", error);
      throw new Error(`处理目录失败: ${error.message || "未知错误"}`);
    }
  }
}

// 处理图片文件夹（入口函数）
async function processImageFolder(folderPath) {
  try {
    // 使用递归函数处理整个目录树
    const imageInfoMap = await processDirectory(folderPath);

    // 返回处理结果
    return imageInfoMap;
  } catch (error) {
    console.error("处理图片文件夹失败:", error);
    throw error;
  }
}

// 设置文件监视器
async function setupWatcher(directoryPath, mainWindow) {
  try {
    // 如果已存在监视器，先清理
    if (watcher) {
      await watcher.close();
    }

    // 初始化监视器，设置为递归监视
    watcher = chokidar.watch(directoryPath, {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: true,
      recursive: true, // 启用递归监视
      depth: undefined, // 不限制递归深度
    });

    // 文件添加事件
    watcher.on("add", async (filePath) => {
      if (IMAGE_EXTENSIONS.includes(path.extname(filePath).toLowerCase())) {
        try {
          const imageInfo = await getImageInfo(filePath);
          mainWindow.webContents.send("file-added", { filePath, imageInfo });
        } catch (error) {
          console.error("文件添加处理失败:", error);
        }
      }
    });

    // 文件修改事件
    watcher.on("change", async (filePath) => {
      if (IMAGE_EXTENSIONS.includes(path.extname(filePath).toLowerCase())) {
        try {
          const imageInfo = await getImageInfo(filePath);
          mainWindow.webContents.send("file-modified", { filePath, imageInfo });
        } catch (error) {
          console.error("文件修改处理失败:", error);
        }
      }
    });

    // 文件删除事件
    watcher.on("unlink", (filePath) => {
      if (IMAGE_EXTENSIONS.includes(path.extname(filePath).toLowerCase())) {
        mainWindow.webContents.send("file-deleted", filePath);
      }
    });

    // 目录删除事件
    watcher.on("unlinkDir", (dirPath) => {
      mainWindow.webContents.send("directory-deleted", dirPath);
    });

    return true;
  } catch (error) {
    console.error("设置文件监视器失败:", error);
    throw error;
  }
}

// 扫描目录
async function scanDirectory(directoryPath, imageLibrary) {
  if (!store) return;

  try {
    const files = await fs.readdir(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        await scanDirectory(filePath, imageLibrary);
      } else if (isImageFile(filePath)) {
        // 使用规范化的路径作为键
        const normalizedPath = path.normalize(filePath);
        imageLibrary[normalizedPath] = {
          size: stats.size,
          mtime: stats.mtime.getTime(),
        };
      }
    }
  } catch (error) {
    console.error(`扫描目录失败: ${directoryPath}`, error);
  }
}

// 判断是否为图片文件
function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

// 计算图片哈希值
async function calculateImageHash(filePath) {
  try {
    const imageBuffer = await fs.readFile(filePath);
    const hash = crypto.createHash("sha256");
    hash.update(imageBuffer);
    return hash.digest("hex");
  } catch (error) {
    console.error("计算图片哈希值失败:", error);
    throw error;
  }
}

// 获取图片基本信息
async function getImageInfo(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return {
      fileName: path.basename(filePath),
      filePath: filePath,
      size: stats.size,
      modifiedTime: stats.mtime.getTime(),
      createdTime: stats.birthtime.getTime(),
    };
  } catch (error) {
    console.error(`获取图片信息失败 ${filePath}:`, error);
    throw error;
  }
}

module.exports = {
  registerIpcHandlers,
};
