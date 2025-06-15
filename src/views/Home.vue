<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
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
} from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const activeStep = ref(0);
const libraryPath = ref("");
const previewImage = ref("");
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
const libraryStats = ref({
  totalImages: 0,
  totalSize: "0 MB",
  lastUpdate: "",
});

onMounted(() => {
  // 从路由参数获取图片库路径
  if (route.query.libraryPath) {
    libraryPath.value = route.query.libraryPath.toString();
    // TODO: 获取图片库统计信息
    libraryStats.value = {
      totalImages: 1234,
      totalSize: "2.5 GB",
      lastUpdate: "2024-01-20 15:30",
    };
  }
});

const handleFileChange = (file) => {
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

  previewImage.value = URL.createObjectURL(file.raw);
};

const reselectLibrary = () => {
  router.push("/main/select");
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
};

const nextStep = () => {
  activeStep.value++;
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
            <el-step title="确认图片库" description="确认或重新选择图片库" />
            <el-step title="上传图片" description="上传要搜索的目标图片" />
          </el-steps>

          <!-- 步骤1：确认图片库 -->
          <div v-if="activeStep === 0" class="step-content">
            <div class="library-select">
              <div class="library-path" v-if="libraryPath">
                <el-alert type="success" :closable="false" show-icon>
                  <template #title> 当前图片库路径： </template>
                  <template #default>
                    {{ libraryPath }}
                    <el-button
                      type="primary"
                      link
                      class="change-path"
                      @click="reselectLibrary"
                    >
                      重新选择
                    </el-button>
                  </template>
                </el-alert>
              </div>

              <div v-else class="select-library">
                <el-empty description="未选择图片库">
                  <el-button
                    type="primary"
                    size="large"
                    @click="reselectLibrary"
                  >
                    <el-icon class="button-icon"><FolderAdd /></el-icon>
                    选择图片库
                  </el-button>
                </el-empty>
              </div>

              <div class="library-info" v-if="libraryPath">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="图片总数">
                    {{ libraryStats.totalImages || 0 }} 张
                  </el-descriptions-item>
                  <el-descriptions-item label="支持格式">
                    JPG, PNG, GIF
                  </el-descriptions-item>
                  <el-descriptions-item label="库大小">
                    {{ libraryStats.totalSize }}
                  </el-descriptions-item>
                  <el-descriptions-item label="最后更新">
                    {{ libraryStats.lastUpdate }}
                  </el-descriptions-item>
                </el-descriptions>

                <div class="step-actions" v-if="libraryPath">
                  <el-button type="primary" @click="nextStep">
                    下一步
                    <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 步骤2：上传图片 -->
          <div v-if="activeStep === 1" class="step-content">
            <div class="upload-section">
              <el-upload
                class="image-uploader"
                :show-file-list="false"
                :on-change="handleFileChange"
                accept="image/*"
                :auto-upload="false"
              >
                <div v-if="!previewImage" class="upload-placeholder">
                  <el-icon class="upload-icon"><Upload /></el-icon>
                  <div class="upload-text">点击上传图片</div>
                </div>
                <img v-else :src="previewImage" class="preview-image" />
              </el-upload>

              <div class="preview-actions" v-if="previewImage">
                <el-button type="danger" @click="clearPreview">
                  <el-icon><Delete /></el-icon>
                  清除
                </el-button>
              </div>

              <div class="step-actions">
                <el-button @click="prevStep">
                  <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
                  上一步
                </el-button>
                <el-button
                  type="primary"
                  @click="startSearch"
                  :disabled="!previewImage"
                >
                  开始搜索
                  <el-icon class="el-icon--right"><Search /></el-icon>
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

.recent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.recent-time {
  color: #64748b;
  font-size: 14px;
}

.recent-path {
  color: #1e293b;
  font-size: 14px;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
}

.recent-footer {
  display: flex;
  justify-content: flex-end;
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
