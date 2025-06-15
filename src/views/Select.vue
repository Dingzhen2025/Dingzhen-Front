<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  FolderOpened,
  FolderAdd,
  RefreshRight,
  ArrowRight,
} from "@element-plus/icons-vue";

const router = useRouter();
const lastLibraryPath = ref("");
const selectedPath = ref("");
const showConfirm = ref(false);
const libraryStats = ref({
  totalImages: 0,
  totalSize: "0 MB",
  lastUpdate: "",
});

onMounted(() => {
  // 从本地存储获取上次使用的图片库路径
  lastLibraryPath.value = localStorage.getItem("lastLibraryPath") || "";
});

const useLastLibrary = async () => {
  if (!lastLibraryPath.value) {
    ElMessage.warning("没有找到上次使用的图片库记录");
    return;
  }

  // TODO: 调用后端接口，同步本地和云端图片库
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 成功后跳转到主页
    router.push({
      path: "/main/home",
      query: { libraryPath: lastLibraryPath.value },
    });
  } catch (error) {
    ElMessage.error("同步图片库失败，请重试");
  }
};

const selectNewLibrary = async () => {
  try {
    // 调用Electron的dialog模块选择文件夹
    const result = await window.electron.ipcRenderer.invoke("select-directory");
    if (result.canceled) {
      return;
    }

    selectedPath.value = result.filePaths[0];
    showConfirm.value = true;

    // 模拟获取图片库信息
    libraryStats.value = {
      totalImages: 0,
      totalSize: "计算中...",
      lastUpdate: new Date().toLocaleString(),
    };

    // TODO: 调用后端接口获取实际的图片库信息
    setTimeout(() => {
      libraryStats.value = {
        totalImages: 1234,
        totalSize: "2.5 GB",
        lastUpdate: new Date().toLocaleString(),
      };
    }, 1000);
  } catch (error) {
    ElMessage.error("选择图片库失败，请重试");
    console.error(error);
  }
};

const confirmAndEnter = () => {
  if (!selectedPath.value) {
    ElMessage.warning("请先选择图片库");
    return;
  }

  // 保存新路径到本地存储
  localStorage.setItem("lastLibraryPath", selectedPath.value);

  // 跳转到主页
  router.push({
    path: "/main/home",
    query: { libraryPath: selectedPath.value },
  });
};
</script>

<template>
  <div class="select-container">
    <div class="select-content">
      <h1 class="title">选择图片库</h1>
      <p class="subtitle">请选择要使用的图片库</p>

      <div class="options-container">
        <el-card class="option-card" v-if="lastLibraryPath">
          <div class="option-header">
            <el-icon><FolderOpened /></el-icon>
            <h2>使用上次的图片库</h2>
          </div>
          <div class="option-content">
            <p class="path-display">{{ lastLibraryPath }}</p>
            <el-button type="primary" @click="useLastLibrary">
              继续使用
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>

        <el-card class="option-card">
          <div class="option-header">
            <el-icon><FolderAdd /></el-icon>
            <h2>选择新的图片库</h2>
          </div>
          <div class="option-content">
            <template v-if="!selectedPath">
              <p>重新选择并初始化图片库</p>
              <el-button type="primary" @click="selectNewLibrary">
                选择新图片库
                <el-icon class="el-icon--right"><FolderAdd /></el-icon>
              </el-button>
            </template>

            <template v-else>
              <div class="selected-path-info">
                <h3>已选择图片库：</h3>
                <p class="path-display">{{ selectedPath }}</p>

                <el-descriptions :column="1" border class="library-stats">
                  <el-descriptions-item label="图片总数">
                    {{ libraryStats.totalImages }} 张
                  </el-descriptions-item>
                  <el-descriptions-item label="库大小">
                    {{ libraryStats.totalSize }}
                  </el-descriptions-item>
                  <el-descriptions-item label="选择时间">
                    {{ libraryStats.lastUpdate }}
                  </el-descriptions-item>
                </el-descriptions>

                <div class="action-buttons">
                  <el-button @click="selectNewLibrary">重新选择</el-button>
                  <el-button type="primary" @click="confirmAndEnter">
                    进入主页
                    <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                  </el-button>
                </div>
              </div>
            </template>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.select-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--el-bg-color);
  padding: 20px;
}

.select-content {
  max-width: 1000px;
  width: 100%;
  text-align: center;
}

.title {
  font-size: 2.5em;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2em;
  color: var(--el-text-color-secondary);
  margin-bottom: 40px;
}

.options-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.option-card {
  width: 400px;
  transition: transform 0.3s;
}

.option-card:hover {
  transform: translateY(-5px);
}

.option-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.option-header .el-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.option-header h2 {
  margin: 0;
  font-size: 1.5em;
  color: var(--el-text-color-primary);
}

.option-content {
  text-align: center;
}

.path-display {
  background: var(--el-fill-color-lighter);
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  word-break: break-all;
  font-family: monospace;
}

.selected-path-info {
  margin-top: 20px;
}

.selected-path-info h3 {
  margin: 0 0 10px;
  color: var(--el-text-color-primary);
}

.library-stats {
  margin: 20px 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.el-button {
  margin-top: 20px;
}
</style>
