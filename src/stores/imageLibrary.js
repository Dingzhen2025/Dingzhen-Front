import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { imageApi } from "../api/imageApi";
import { useUserStore } from "../stores/user";
import { generateUniqueKey, normalizeFilePath } from "../api/imageApi";

export const useImageLibraryStore = defineStore("imageLibrary", {
  state: () => ({
    currentLibraryPath: "",
    libraryStats: {
      totalImages: 0,
      lastUpdate: null,
      status: "未初始化", // 状态：未初始化、处理中、等待确认、监控中、错误
    },
    isWatching: false,
    tempHashTable: {}, // 临时哈希表，使用普通对象
    persistentHashTable: {}, // 本地持久化哈希表，使用普通对象
    isProcessing: false,
    isComparing: false,
    isSyncing: false, // 是否正在同步到后端
    error: null,
  }),

  getters: {
    formattedStats: (state) => ({
      totalImages: state.libraryStats.totalImages,
      lastUpdate: state.libraryStats.lastUpdate
        ? new Date(state.libraryStats.lastUpdate).toLocaleString()
        : "未同步",
      status: state.libraryStats.status,
    }),
  },

  actions: {
    // 设置图片库路径
    setLibraryPath(path) {
      this.currentLibraryPath = path;
      this.libraryStats.status = "未初始化";
    },

    // 更新监控状态
    setWatchingStatus(status) {
      this.isWatching = status;
      if (status) {
        this.libraryStats.status = "等待确认";
      } else {
        this.libraryStats.status = "未初始化";
      }
    },

    // 初始化文件监控
    initializeFileWatcher() {
      if (!window.electronAPI) return;

      // 启动文件监控
      window.electronAPI.startWatching(this.currentLibraryPath);
      this.setWatchingStatus(true);

      // 监听文件添加
      window.electronAPI.onFileAdded((data) => {
        const { filePath, imageInfo } = data;
        this.tempHashTable[filePath] = {
          fileName: imageInfo.fileName,
          size: imageInfo.size,
          modifiedTime: imageInfo.modifiedTime,
          createdTime: imageInfo.createdTime,
        };
        this.compareAndUpdateHashTables();
      });

      // 监听文件修改
      window.electronAPI.onFileModified((data) => {
        const { filePath, imageInfo } = data;
        this.tempHashTable[filePath] = {
          fileName: imageInfo.fileName,
          size: imageInfo.size,
          modifiedTime: imageInfo.modifiedTime,
          createdTime: imageInfo.createdTime,
        };
        this.compareAndUpdateHashTables();
      });

      // 监听文件删除
      window.electronAPI.onFileDeleted((filePath) => {
        delete this.tempHashTable[filePath];
        this.compareAndUpdateHashTables();
      });

      // 监听目录删除
      window.electronAPI.onDirectoryDeleted((dirPath) => {
        Object.keys(this.tempHashTable).forEach((filePath) => {
          if (filePath.startsWith(dirPath)) {
            delete this.tempHashTable[filePath];
          }
        });
        this.compareAndUpdateHashTables();
      });
    },

    // 清理文件监控
    cleanupFileWatcher() {
      if (!window.electronAPI) return;

      window.electronAPI.stopWatching();
      window.electronAPI.removeListener("file-added");
      window.electronAPI.removeListener("file-modified");
      window.electronAPI.removeListener("file-deleted");
      window.electronAPI.removeListener("directory-deleted");
      this.setWatchingStatus(false);
    },

    // 初始化持久化哈希表
    async initializePersistentHashTable() {
      try {
        this.libraryStats.status = "处理中";
        if (window.electronAPI) {
          const storedData = await window.electronAPI.getStoredImages();
          this.persistentHashTable = storedData || {};
        }
      } catch (error) {
        console.error("初始化持久化哈希表失败:", error);
        this.error = error.message;
        this.libraryStats.status = "错误";
      }
    },

    // 处理图片库（选择文件夹时调用）
    async processImageLibrary(folderPath) {
      if (this.isProcessing) {
        console.log("已有处理任务在进行中，请等待...");
        return false;
      }

      this.isProcessing = true;
      this.error = null;

      // 只清空临时状态
      console.log("清空临时状态...");
      this.tempHashTable = {}; // 清空临时哈希表
      this.libraryStats.status = "处理中";

      try {
        if (window.electronAPI) {
          console.log("开始处理新的图片库:", folderPath);

          // 获取文件夹中所有图片的信息
          const imageInfoMap = await window.electronAPI.processImageFolder(
            folderPath
          );
          console.log("获取到的图片总数:", Object.keys(imageInfoMap).length);

          if (!imageInfoMap || typeof imageInfoMap !== "object") {
            throw new Error("获取图片信息失败");
          }

          // 将结果存入临时哈希表
          Object.entries(imageInfoMap).forEach(([filePath, imageInfo]) => {
            this.tempHashTable[filePath] = {
              fileName: imageInfo.fileName,
              size: imageInfo.size,
              modifiedTime: imageInfo.modifiedTime,
              createdTime: imageInfo.createdTime,
            };
          });
          console.log(
            "临时哈希表更新完成，图片数量:",
            Object.keys(this.tempHashTable).length
          );

          // 更新统计信息
          this.libraryStats.totalImages = Object.keys(
            this.tempHashTable
          ).length;
          this.libraryStats.lastUpdate = Date.now();
          this.libraryStats.status = "等待确认";

          // 启动文件监控
          await this.initializeFileWatcher();

          return true;
        }
        return false;
      } catch (error) {
        console.error("处理图片库失败:", error);
        this.error = error.message;
        this.libraryStats.status = "错误";
        return false;
      } finally {
        this.isProcessing = false;
      }
    },

    // 确认并继续（用户点击确认按钮时调用）
    async confirmAndContinue() {
      if (this.isComparing || this.isSyncing) {
        console.log("已有比对或同步任务在进行中，请等待...");
        return false;
      }

      try {
        // 在后台进行比对和同步
        this.libraryStats.status = "监控中";

        // 不等待比对和同步完成，让用户可以继续操作
        this.compareAndUpdateHashTables().catch((error) => {
          console.error("后台比对和同步失败:", error);
          // 不影响用户继续操作，只记录错误
          this.error = error.message;
        });

        return true;
      } catch (error) {
        console.error("确认过程失败:", error);
        this.error = error.message;
        return false;
      }
    },

    // 比对并更新哈希表
    async compareAndUpdateHashTables() {
      if (this.isComparing) {
        console.log("已有比对任务在进行中，跳过本次比对");
        return true;
      }

      this.isComparing = true;
      const changes = {
        added: [],
        removed: [],
      };

      try {
        console.log("开始比对哈希表...");
        console.log(
          "临时哈希表中的图片数量:",
          Object.keys(this.tempHashTable).length
        );
        console.log(
          "持久化哈希表中的图片数量:",
          Object.keys(this.persistentHashTable).length
        );

        // 检查新增和需要更新的图片
        Object.entries(this.tempHashTable).forEach(([filePath, imageInfo]) => {
          const existingInfo = this.persistentHashTable[filePath];
          const newImageInfo = {
            filePath,
            fileName: imageInfo.fileName,
            size: imageInfo.size,
            modifiedTime: imageInfo.modifiedTime,
            createdTime: imageInfo.createdTime,
          };

          if (!existingInfo) {
            console.log("发现新增图片:", filePath);
            changes.added.push(newImageInfo);
          } else if (
            existingInfo.modifiedTime !== imageInfo.modifiedTime ||
            existingInfo.size !== imageInfo.size
          ) {
            // 将更新操作转换为删除+新增
            console.log("发现图片信息不同，需要更新:", filePath);
            console.log("- 旧信息:", JSON.stringify(existingInfo));
            console.log("- 新信息:", JSON.stringify(newImageInfo));
            changes.removed.push({ filePath }); // 先删除旧图片
            changes.added.push(newImageInfo); // 再添加新图片
          }
        });

        // 检查删除的图片
        Object.keys(this.persistentHashTable).forEach((filePath) => {
          if (!this.tempHashTable[filePath]) {
            console.log("发现删除图片:", filePath);
            changes.removed.push({ filePath });
          }
        });

        if (changes.added.length || changes.removed.length) {
          console.log("检测到变更，详细信息：");
          console.log("- 新增/更新图片数量:", changes.added.length);
          console.log("- 删除图片数量:", changes.removed.length);

          // 更新本地存储
          await this.updateLocalStorage(changes);

          // 同步到后端
          this.isSyncing = true;
          try {
            await this.syncToBackend(changes);
          } finally {
            this.isSyncing = false;
          }

          console.log("同步完成");
        } else {
          console.log("未检测到变更");
        }

        return true;
      } catch (error) {
        console.error("比对哈希表失败:", error);
        this.error = error.message;
        return false;
      } finally {
        this.isComparing = false;
      }
    },

    // 更新本地存储
    async updateLocalStorage(changes) {
      try {
        console.log("开始更新本地存储...");

        // 先处理删除的图片
        changes.removed.forEach((image) => {
          console.log("从本地存储中删除图片:", image.filePath);
          delete this.persistentHashTable[image.filePath];
        });

        // 再处理新增的图片
        changes.added.forEach((image) => {
          console.log("向本地存储添加图片:", image.filePath);
          const imageInfo = {
            fileName: image.fileName,
            size: image.size,
            modifiedTime: image.modifiedTime,
            createdTime: image.createdTime,
          };
          this.persistentHashTable[image.filePath] = imageInfo;
        });

        // 保存到 electron-store
        if (window.electronAPI) {
          const persistentData = JSON.parse(
            JSON.stringify(this.persistentHashTable)
          );
          await window.electronAPI.saveImages(persistentData);
        }

        // 更新统计信息
        this.libraryStats.totalImages = Object.keys(
          this.persistentHashTable
        ).length;
        this.libraryStats.lastUpdate = Date.now();

        console.log(
          "本地存储更新完成，当前图片总数:",
          this.libraryStats.totalImages
        );
      } catch (error) {
        console.error("更新本地存储失败:", error);
        throw error;
      }
    },

    // 同步到后端
    async syncToBackend(changes) {
      if (!changes.added.length && !changes.removed.length) {
        console.log("没有变更需要同步到后端");
        return;
      }

      this.isSyncing = true;
      console.log("开始同步到后端...");

      const userStore = useUserStore();
      const { added, removed } = changes;

      try {
        // 处理删除的图片
        if (removed.length > 0) {
          console.log("开始同步删除操作到后端...");

          // 准备批量删除的数据
          const imagesToRemove = await Promise.all(
            removed.map(async (imageInfo) => {
              // 确保fileName存在，并提供后备方案
              const fileName =
                imageInfo.fileName || imageInfo.filePath.split(/[\\/]/).pop();
              // 删除操作需要 uniqueKey，从已有信息重新生成
              const uniqueKey = await generateUniqueKey(
                fileName,
                imageInfo.size,
                imageInfo.modifiedTime
              );

              return {
                uniqueKey,
                imgName: fileName,
                dir: imageInfo.filePath.substring(
                  0,
                  Math.max(
                    imageInfo.filePath.lastIndexOf("/"),
                    imageInfo.filePath.lastIndexOf("\\")
                  )
                ),
                userId: userStore.userId,
              };
            })
          );

          console.log("准备删除的图片数据:", imagesToRemove);
          // 调用批量删除接口
          await imageApi.deleteImages(imagesToRemove);
          console.log("删除操作同步完成");
        }

        // 处理新增和更新的图片
        if (added.length > 0) {
          console.log("开始同步新增操作到后端...");

          // 准备批量添加的数据
          const imagesToAdd = await Promise.all(
            added.map(async (imageInfo) => {
              try {
                // 读取文件内容
                const fileData = await window.electronAPI.readImageFile(
                  imageInfo.filePath
                );

                // 创建File对象
                const file = new File([fileData.buffer], fileData.fileName, {
                  type: fileData.metadata.type,
                  lastModified: fileData.metadata.lastModified,
                });

                // 构造addImage所需的数据
                const imageData = {
                  ...imageInfo,
                  file,
                  dir: imageInfo.filePath.substring(
                    0,
                    Math.max(
                      imageInfo.filePath.lastIndexOf("/"),
                      imageInfo.filePath.lastIndexOf("\\")
                    )
                  ), // 修正dir的值
                  userId: userStore.userId,
                };
                return imageData;
              } catch (error) {
                console.error(
                  `读取文件失败，跳过同步: ${imageInfo.filePath}`,
                  error
                );
                return null;
              }
            })
          );

          // 过滤掉读取失败的项目
          const validImagesToAdd = imagesToAdd.filter(Boolean);

          if (validImagesToAdd.length > 0) {
            console.log("准备上传的图片数据:", validImagesToAdd);
            // 调用批量添加接口
            await imageApi.addImages(validImagesToAdd);
            console.log("新增操作同步完成");
          }
        }

        this.libraryStats.lastUpdate = Date.now();
        console.log("后端同步成功");
      } catch (error) {
        console.error("同步到后端失败:", error);
        this.error = error.message;
      } finally {
        this.isSyncing = false;
      }
    },

    // 辅助函数：根据文件路径获取文件名
    getFileName(filePath) {
      return filePath.split(/[\\/]/).pop();
    },
  },
});
