<script setup>
import { ref, computed, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Upload,
  Delete,
  Search,
  Lightning,
  PictureFilled,
  DataLine,
  Lock,
  Link,
  FolderOpened,
  FolderAdd,
  RefreshRight,
  ArrowRight,
  ArrowLeft,
  View,
} from "@element-plus/icons-vue";
import { useImageLibraryStore } from "@/stores/imageLibrary";

const router = useRouter();
const imageLibraryStore = useImageLibraryStore();
const activeStep = ref(0);
const libraryPath = ref("");
const previewImage = ref("");
const uploadedFileName = ref("");
const showPreview = ref(false);
const recentSearches = ref([
  {
    id: 1,
    imageUrl: "https://picsum.photos/300/200",
    time: "2024-03-20 14:30",
  },
  {
    id: 2,
    imageUrl: "https://picsum.photos/300/201",
    time: "2024-03-20 13:15",
  },
  {
    id: 3,
    imageUrl: "https://picsum.photos/300/202",
    time: "2024-03-20 11:45",
  },
]);

// 图片库统计信息
const libraryStats = computed(() => imageLibraryStore.formattedStats);

const handleFileChange = async (file) => {
  const isImage = file.raw.type.startsWith("image/");
  const isLt5M = file.raw.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error("只能上传图片文件！");
    return;
  }
  if (!isLt5M) {
    ElMessage.error("图片大小不能超过 5MB！");
    return;
  }

  try {
    // 使用 FileReader 读取文件
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target.result;
      uploadedFileName.value = file.name;
      showPreview.value = false;
    };
    reader.readAsDataURL(file.raw);
  } catch (error) {
    console.error("图片预览失败:", error);
    ElMessage.error("图片预览失败，请重试");
  }
};

const selectLibraryPath = async () => {
  try {
    const directoryPath = await window.electronAPI.selectDirectory();
    if (!directoryPath) {
      ElMessage.warning("未选择任何目录");
      return;
    }

    libraryPath.value = directoryPath;
    imageLibraryStore.setLibraryPath(directoryPath);

    // 处理图片库，计算临时哈希表
    const success = await imageLibraryStore.processImageLibrary(directoryPath);

    if (success) {
      // 初始化文件监听
      imageLibraryStore.initializeFileWatcher();
      ElMessage.success(
        `图片库选择成功，已找到 ${libraryStats.value.totalImages} 张图片`
      );
    } else {
      ElMessage.error("处理图片库失败，请重试");
    }
  } catch (error) {
    console.error("选择目录时发生错误:", error);
    ElMessage.error("选择目录失败：" + (error.message || "未知错误"));
  }
};

const startSearch = () => {
  if (!libraryPath.value) {
    ElMessage.warning("请先选择图片库路径");
    return;
  }

  if (!previewImage.value) {
    ElMessage.warning("请先上传要搜索的图片");
    return;
  }

  // 添加到搜索历史
  addToRecentSearches({
    id: Date.now(),
    imageUrl: previewImage.value,
    libraryPath: libraryPath.value,
    time: new Date().toLocaleString(),
  });

  // 跳转到搜索结果页面
  router.push({
    path: "/main/search-result",
    query: {
      image: previewImage.value,
      library: libraryPath.value,
    },
  });
};

const clearPreview = () => {
  previewImage.value = "";
  uploadedFileName.value = "";
  showPreview.value = false;
};

const togglePreview = () => {
  showPreview.value = !showPreview.value;
};

const nextStep = () => {
  if (activeStep.value === 0) {
    if (!libraryPath.value) {
      ElMessage.warning("请先选择图片库路径");
      return;
    }

    // 显示确认对话框
    ElMessageBox.confirm(
      `确认使用该图片库？
图片库路径：${libraryPath.value}
图片总数：${libraryStats.value.totalImages || 0} 张
最后更新：${libraryStats.value.lastUpdate}
当前状态：${libraryStats.value.status}
支持格式：JPG、PNG、GIF、WEBP`,
      "确认图片库信息",
      {
        confirmButtonText: "确认并继续",
        cancelButtonText: "取消",
        type: "info",
        dangerouslyUseHTMLString: false,
        customClass: "custom-message-box",
      }
    )
      .then(async () => {
        try {
          // 在后台进行哈希表比对，不等待完成
          imageLibraryStore.compareAndUpdateHashTables().catch((error) => {
            console.error("后台同步失败:", error);
            // 不阻止用户操作，只显示提示
            ElMessage.warning("图片库同步可能不完整，但您可以继续操作");
          });

          // 直接进入下一步
          activeStep.value++;
          ElMessage.success("正在后台同步图片库，您可以继续操作");
        } catch (error) {
          console.error("进入下一步失败:", error);
          ElMessage.error("操作失败，请重试");
        }
      })
      .catch(() => {
        // 用户取消，不做任何操作
      });
  } else if (activeStep.value === 1 && !previewImage.value) {
    ElMessage.warning("请先上传要搜索的图片");
    return;
  } else {
    activeStep.value++;
  }
};

const prevStep = () => {
  activeStep.value--;
};

const shortenPath = (path) => {
  if (!path) return "";
  const parts = path.split("/");
  if (parts.length <= 2) return path;
  return `.../${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
};

const addToRecentSearches = (search) => {
  recentSearches.value.unshift(search);
  if (recentSearches.value.length > 8) {
    recentSearches.value.pop();
  }
};

const reSearch = (item) => {
  libraryPath.value = item.libraryPath;
  previewImage.value = item.imageUrl;
  startSearch();
};

// 组件卸载时清理监听器
onUnmounted(() => {
  imageLibraryStore.cleanupFileWatcher();
  if (previewImage.value) {
    URL.revokeObjectURL(previewImage.value);
  }
});

// 添加样式
const style = document.createElement("style");
style.textContent = `
.custom-message-box .el-message-box__message {
  white-space: pre-line;
  font-family: monospace;
  line-height: 1.5;
}
`;
document.head.appendChild(style);

// 添加图片加载错误处理
const handleImageError = () => {
  ElMessage.error("图片加载失败，请重新选择");
  clearPreview();
};
</script>

<template>
  <div class="home-container">
    <div class="search-section">
      <div class="search-content">
        <h1 class="title">智能图像搜索</h1>
        <p class="subtitle">在本地图片库中找到最相似的图片</p>

        <div class="search-box">
          <el-steps
            :active="activeStep"
            finish-status="success"
            class="search-steps"
          >
            <el-step title="选择图片库" description="选择要搜索的图片文件夹" />
            <el-step title="上传图片" description="上传要搜索的目标图片" />
          </el-steps>

          <!-- 步骤1：选择图片库 -->
          <div v-if="activeStep === 0" class="step-content">
            <div class="library-select">
              <div class="library-path" v-if="libraryPath">
                <el-alert type="success" :closable="false" show-icon>
                  <template #title>已选择图片库路径：</template>
                  <template #default>
                    {{ libraryPath }}
                    <el-button
                      type="primary"
                      link
                      class="change-path"
                      @click="selectLibraryPath"
                    >
                      更改路径
                    </el-button>
                  </template>
                </el-alert>
              </div>

              <div v-else class="select-library">
                <el-empty description="未选择图片库">
                  <el-button
                    type="primary"
                    size="large"
                    @click="selectLibraryPath"
                  >
                    <el-icon class="button-icon"><FolderAdd /></el-icon>
                    选择图片库文件夹
                  </el-button>
                </el-empty>
              </div>

              <div class="library-info" v-if="libraryPath">
                <el-descriptions title="图片库信息" :column="2" border>
                  <el-descriptions-item label="图片总数">
                    {{ libraryStats.totalImages || 0 }} 张
                  </el-descriptions-item>
                  <el-descriptions-item label="支持格式">
                    JPG, PNG, GIF
                  </el-descriptions-item>
                  <el-descriptions-item label="最后更新">
                    {{ libraryStats.lastUpdate || "未知" }}
                  </el-descriptions-item>
                  <el-descriptions-item label="状态">
                    <el-tag type="success" v-if="imageLibraryStore.isWatching"
                      >监控中</el-tag
                    >
                    <el-tag type="warning" v-else>未监控</el-tag>
                  </el-descriptions-item>
                </el-descriptions>

                <div class="confirm-section">
                  <el-alert
                    type="info"
                    :closable="false"
                    show-icon
                    title="请确认图片库信息"
                    description="确认无误后点击下一步继续"
                  />
                  <div class="step-actions">
                    <el-button type="primary" size="large" @click="nextStep">
                      确认并继续
                      <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤2：上传搜索图片 -->
          <div v-else class="step-content">
            <div class="upload-section">
              <div class="upload-area" v-if="!previewImage">
                <el-upload
                  class="upload-dragger"
                  drag
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleFileChange"
                  accept="image/*"
                >
                  <div class="upload-content">
                    <el-icon class="upload-icon"><Upload /></el-icon>
                    <div class="upload-text">
                      将要搜索的图片拖到此处或<em>点击上传</em>
                    </div>
                    <div class="upload-tip">
                      支持 jpg、png、gif 格式，单个文件不超过 5MB
                    </div>
                  </div>
                </el-upload>
              </div>

              <div v-else class="preview-section">
                <div class="preview-container">
                  <div class="preview-header">
                    <span class="preview-title">已选择图片</span>
                    <div class="preview-info">
                      <span v-if="uploadedFileName"
                        >文件名：{{ uploadedFileName }}</span
                      >
                    </div>
                  </div>
                  <div v-if="showPreview" class="preview-image-container">
                    <img
                      :src="previewImage"
                      alt="预览图"
                      class="preview-image"
                      @error="handleImageError"
                    />
                  </div>
                  <div class="preview-actions">
                    <el-button type="primary" @click="togglePreview">
                      <el-icon class="action-icon"><View /></el-icon>
                      {{ showPreview ? "隐藏预览" : "查看预览" }}
                    </el-button>
                    <el-button type="primary" @click="startSearch">
                      <el-icon class="action-icon"><Search /></el-icon>
                      开始搜索
                    </el-button>
                    <el-button @click="clearPreview">
                      <el-icon class="action-icon"><RefreshRight /></el-icon>
                      重新选择
                    </el-button>
                  </div>
                </div>
              </div>

              <div class="step-actions">
                <el-button @click="prevStep">
                  <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
                  返回上一步
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="features-section">
      <h2 class="section-title">搜索说明</h2>
      <div class="features-grid">
        <div class="feature-card">
          <el-icon class="feature-icon"><FolderOpened /></el-icon>
          <h3>选择图片库</h3>
          <p>选择包含待搜索图片的本地文件夹</p>
        </div>

        <div class="feature-card">
          <el-icon class="feature-icon"><Upload /></el-icon>
          <h3>上传目标图片</h3>
          <p>上传一张图片作为搜索目标</p>
        </div>

        <div class="feature-card">
          <el-icon class="feature-icon"><Search /></el-icon>
          <h3>智能匹配</h3>
          <p>系统自动查找最相似的10张图片</p>
        </div>

        <div class="feature-card">
          <el-icon class="feature-icon"><DataLine /></el-icon>
          <h3>结果展示</h3>
          <p>按相似度排序展示搜索结果</p>
        </div>
      </div>
    </div>

    <div class="recent-section" v-if="recentSearches.length">
      <h2 class="section-title">最近搜索</h2>
      <el-row :gutter="20">
        <el-col
          v-for="item in recentSearches"
          :key="item.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card class="recent-card" shadow="hover">
            <div class="recent-header">
              <span class="recent-time">{{ item.time }}</span>
              <span class="recent-path" :title="item.libraryPath">
                图片库：{{ shortenPath(item.libraryPath) }}
              </span>
            </div>
            <img :src="item.imageUrl" class="recent-image" />
            <div class="recent-footer">
              <el-button type="primary" link @click="reSearch(item)">
                重新搜索
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100%;
  background-color: #fff;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.search-section {
  background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%);
  padding: 60px 20px;
  text-align: center;
  color: #fff;
  margin: 0;
  position: relative;
}

.search-content {
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 16px;
  background: linear-gradient(120deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.2em;
  margin-bottom: 40px;
  opacity: 0.9;
}

.search-box {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.search-steps {
  margin-bottom: 40px;
}

.step-content {
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.library-select {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.library-path {
  margin-bottom: 20px;
}

.change-path {
  margin-left: 12px;
}

.select-library {
  padding: 40px;
  text-align: center;
}

.button-icon {
  margin-right: 8px;
  font-size: 20px;
}

.library-info {
  margin-top: 20px;
}

.confirm-section {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-area {
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.8);
}

.upload-text {
  font-size: 16px;
  color: #fff;
}

.upload-text em {
  color: #60a5fa;
  font-style: normal;
  text-decoration: underline;
  cursor: pointer;
}

.upload-tip {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.preview-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.preview-container {
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
}

.preview-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.preview-title {
  font-size: 18px;
  color: #fff;
  font-weight: 500;
}

.preview-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.preview-image-container {
  width: 100%;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 4px;
  display: block;
}

.preview-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}

.action-icon {
  margin-right: 4px;
}

:deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(255, 255, 255, 0.1);
  --el-descriptions-item-label-text-color: rgba(255, 255, 255, 0.9);
  --el-descriptions-item-text-color: #fff;
  margin-bottom: 20px;
}

:deep(.el-descriptions__title) {
  color: #fff;
  margin-bottom: 16px;
}

:deep(.el-descriptions__cell) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

:deep(.el-upload-dragger) {
  background-color: transparent;
  border: 2px dashed rgba(255, 255, 255, 0.2);
}

:deep(.el-upload-dragger:hover) {
  border-color: #60a5fa;
  background-color: rgba(255, 255, 255, 0.05);
}

:deep(.el-alert--success) {
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

:deep(.el-alert--info) {
  background-color: rgba(96, 165, 250, 0.1);
  border: 1px solid rgba(96, 165, 250, 0.2);
}

:deep(.el-tag) {
  background-color: transparent;
}

:deep(.el-tag--success) {
  border-color: #10b981;
  color: #10b981;
}

:deep(.el-tag--warning) {
  border-color: #f59e0b;
  color: #f59e0b;
}

.features-section {
  padding: 60px 20px;
  background-color: #f8fafc;
}

.section-title {
  text-align: center;
  font-size: 2em;
  color: #1e293b;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 48px;
  color: #2563eb;
  margin-bottom: 24px;
}

.feature-card h3 {
  font-size: 1.5em;
  color: #1e293b;
  margin-bottom: 16px;
}

.feature-card p {
  color: #64748b;
  line-height: 1.6;
}

.recent-section {
  padding: 60px 20px;
}

.recent-card {
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.recent-card:hover {
  transform: translateY(-5px);
}

.search-icon {
  margin-right: 4px;
  font-size: 16px;
}

.action-icon {
  margin-right: 4px;
  font-size: 16px;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .home-container {
    overflow-x: hidden;
  }

  .search-section {
    padding: 40px 16px;
    margin: 0;
  }

  .title {
    font-size: 2em;
  }

  .subtitle {
    font-size: 1em;
  }

  .search-box {
    padding: 16px;
  }

  .features-section,
  .recent-section {
    padding: 40px 16px;
    margin: 0;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .search-steps {
    margin-bottom: 24px;
  }

  .step-content {
    padding: 16px;
  }

  .library-select {
    gap: 16px;
  }

  .select-library {
    padding: 20px;
  }

  .step-actions {
    margin-top: 16px;
  }

  .recent-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .recent-path {
    max-width: 100%;
  }
}
</style>
