<template>
  <div class="search-result-container">
    <!-- 搜索结果展示 -->
    <div
      v-loading="loading"
      class="result-content"
      text="正在努力搜索中，请稍候..."
    >
      <!-- 搜索统计信息 -->
      <div class="search-stats">
        <h2>搜索结果</h2>
        <p>共找到 {{ totalResults }} 张相似图片，用时 {{ searchTime }}ms</p>
      </div>

      <!-- 结果过滤和排序 -->
      <div class="filter-bar">
        <el-select v-model="sortBy" placeholder="排序方式" class="filter-item">
          <el-option label="相似度" value="similarity" />
          <el-option label="文件名" value="filename" />
          <el-option label="修改时间" value="modified" />
        </el-select>

        <el-select
          v-model="fileType"
          placeholder="文件类型"
          class="filter-item"
        >
          <el-option label="全部" value="all" />
          <el-option label="JPG" value="jpg" />
          <el-option label="PNG" value="png" />
          <el-option label="其他" value="other" />
        </el-select>

        <el-slider
          v-model="similarityThreshold"
          :min="0"
          :max="100"
          :step="1"
          show-input
          class="similarity-slider"
          label="相似度阈值"
        />
      </div>

      <!-- 搜索结果网格 -->
      <div class="result-grid">
        <el-card
          v-for="(result, index) in filteredResults"
          :key="index"
          class="result-card"
        >
          <!-- 图片预览 -->
          <div class="image-preview" @click="showPreview(result)">
            <el-image
              :src="BASE_URL+result.url"
              fit="cover"
              :preview-src-list="[BASE_URL+result.url]"
              loading="lazy"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><PictureFilled /></el-icon>
                  <span>加载失败</span>
                </div>
              </template>
            </el-image>
          </div>

          <!-- 图片信息 -->
          <div class="image-info">
            <p class="filename" :title="result.imgName">{{ result.imgName }}</p>
            <p class="path" :title="result.path">位置: {{ result.path }}</p>

            <!-- 操作按钮 -->
            <div class="actions">
              <el-button
                type="primary"
                size="small"
                icon="FolderOpened"
                @click="locateFile(result)"
              >
                定位文件
              </el-button>
              <el-button
                type="success"
                size="small"
                icon="Download"
                @click="downloadImage(result)"
              >
                下载
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 无结果提示 -->
      <el-empty
        v-if="filteredResults.length === 0"
        description="未找到相似图片"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Download, FolderOpened, PictureFilled } from "@element-plus/icons-vue";
import { imageApi } from "@/api/imageApi";

const BASE_URL = "http://47.107.172.202:8080"; // 后端服务器地址

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const totalResults = ref(0);
const searchTime = ref(0);

// 筛选和排序
const sortBy = ref("similarity");
const fileType = ref("all");
const similarityThreshold = ref(60);

// 搜索结果数据
const searchResults = ref([]);

// 过滤后的结果
const filteredResults = computed(() => {
  return searchResults.value
    .filter((result) => {
      // 文件类型过滤
      if (fileType.value !== "all") {
        const ext = result.imgName.split(".").pop().toLowerCase();
        if (fileType.value === "other") {
          return !["jpg", "jpeg", "png"].includes(ext);
        }
        return ext === fileType.value;
      }
      return true;
    })
    .sort((a, b) => {
      // 排序
      switch (sortBy.value) {
        case "filename":
          return a.imgName.localeCompare(b.imgName);
        case "modified":
          return new Date(b.lastModified) - new Date(a.lastModified);
        default:
          return 0;
      }
    });
});

// 执行搜索
const performSearch = async () => {
  // 从路由状态获取搜索图片文件和图片库路径
  const searchFile = history.state.searchFile;
  const libraryPath = route.query.library;

  if (!searchFile || !(searchFile instanceof File)) {
    ElMessage.error("未找到有效的搜索图片，请返回重试");
    console.error("无法从路由状态获取搜索文件:", history.state);
    loading.value = false;
    return;
  }

  if (!libraryPath) {
    ElMessage.error("未找到图片库路径，请返回重试");
    console.error("无法从路由查询获取图片库路径:", route.query);
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    const startTime = Date.now();
    console.log("开始使用以下文件进行搜索:", searchFile);

    // 调用搜索API，传递File对象和图片库路径
    const response = await imageApi.searchImage(searchFile, libraryPath, 10);

    console.log("图搜图接口返回:", response);

    // 严格按照接口文档处理返回结果 (data.results)
    if (response && response.code === 200 && response.data?.results) {
      searchResults.value = response.data.results;
      totalResults.value = response.data.results.length;
    } else {
      // 如果返回结果不符合预期，则清空结果并提示
      searchResults.value = [];
      totalResults.value = 0;
      ElMessage.warning(response.msg || "未找到任何相似图片");
    }

    searchTime.value = Date.now() - startTime;
    console.log("搜索完成，结果:", searchResults.value);
  } catch (error) {
    ElMessage.error(error.message || "搜索失败，请检查网络或联系管理员");
    console.error("搜索过程发生错误:", error);
    // 确保出错时清空结果
    searchResults.value = [];
    totalResults.value = 0;
  } finally {
    loading.value = false;
  }
};

// 定位文件
const locateFile = (result) => {
  console.log("定位文件:", result.path);
  window.electronAPI.showItemInFolder(result.path);
};

// 下载图片
const downloadImage = async (result) => {
  try {
    console.log("下载图片:", BASE_URL+result.url);
    const response = await fetch(BASE_URL+result.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = result.imgName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    ElMessage.success("下载成功");
  } catch (error) {
    ElMessage.error("下载失败");
    console.error("下载错误:", error);
  }
};

// 组件挂载时执行搜索
onMounted(() => {
  // 等待DOM挂载后执行搜索
  performSearch();
});
</script>

<style scoped>
.search-result-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-stats {
  margin-bottom: 20px;
}

.filter-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.filter-item {
  width: 150px;
}

.similarity-slider {
  width: 300px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.result-card {
  transition: transform 0.2s;
}

.result-card:hover {
  transform: translateY(-5px);
}

.image-preview {
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-error {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  color: #909399;
}

.image-info {
  padding: 10px;
}

.filename {
  font-weight: bold;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.path {
  font-size: 12px;
  color: #666;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
