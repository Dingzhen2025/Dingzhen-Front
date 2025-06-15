<template>
  <div class="search-result-container">
    <div class="search-header">
      <div class="query-info">
        <div class="query-image">
          <img :src="queryImage" alt="搜索图片" />
        </div>
        <div class="query-stats">
          <h2>搜索结果</h2>
          <p>找到 {{ totalResults }} 个相似图片</p>
          <div class="search-time">用时：{{ searchTime }}秒</div>
        </div>
      </div>

      <div class="filter-actions">
        <el-space wrap>
          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            @change="handleSort"
          >
            <el-option label="相似度" value="similarity" />
            <el-option label="时间" value="time" />
            <el-option label="文件大小" value="size" />
          </el-select>

          <el-select
            v-model="fileType"
            placeholder="文件类型"
            @change="handleFilter"
          >
            <el-option label="全部" value="all" />
            <el-option label="JPG" value="jpg" />
            <el-option label="PNG" value="png" />
            <el-option label="GIF" value="gif" />
          </el-select>

          <div class="similarity-filter">
            <span>相似度：</span>
            <el-slider
              v-model="similarityThreshold"
              :min="0"
              :max="100"
              :step="1"
              :show-tooltip="true"
              :format-tooltip="(val) => `${val}%`"
              @change="handleSimilarityChange"
            />
          </div>
        </el-space>
      </div>
    </div>

    <div class="result-content" v-loading="loading">
      <el-scrollbar height="calc(100vh - 280px)">
        <div class="masonry-grid">
          <div
            v-for="item in filteredResults"
            :key="item.id"
            class="result-item"
            :style="{ '--aspect-ratio': item.aspectRatio }"
          >
            <el-card
              shadow="hover"
              :body-style="{ padding: '0px' }"
              @click="handlePreview(item)"
            >
              <div class="item-image">
                <img :src="item.url" :alt="item.name" />
                <div class="item-overlay">
                  <div class="item-info">
                    <div class="similarity">相似度：{{ item.similarity }}%</div>
                    <div class="file-info">
                      <span>{{ item.name }}</span>
                      <span>{{ item.size }}</span>
                    </div>
                  </div>
                  <div class="item-actions">
                    <el-button-group>
                      <el-button
                        type="primary"
                        :icon="Download"
                        @click.stop="handleDownload(item)"
                      >
                        下载
                      </el-button>
                      <el-button
                        type="primary"
                        :icon="FolderOpened"
                        @click.stop="handleLocate(item)"
                      >
                        定位
                      </el-button>
                    </el-button-group>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-scrollbar>

      <el-empty
        v-if="filteredResults.length === 0 && !loading"
        description="未找到相似图片"
      >
        <template #image>
          <el-icon :size="60"><PictureFilled /></el-icon>
        </template>
        <el-button type="primary" @click="handleRetry">重新搜索</el-button>
      </el-empty>
    </div>

    <el-dialog
      v-model="previewVisible"
      width="80%"
      class="preview-dialog"
      :destroy-on-close="true"
    >
      <div class="preview-container">
        <div class="preview-main">
          <img :src="currentPreview?.url" alt="预览图" />
        </div>
        <div class="preview-info">
          <h3>图片信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="文件名">
              {{ currentPreview?.name }}
            </el-descriptions-item>
            <el-descriptions-item label="相似度">
              {{ currentPreview?.similarity }}%
            </el-descriptions-item>
            <el-descriptions-item label="文件大小">
              {{ currentPreview?.size }}
            </el-descriptions-item>
            <el-descriptions-item label="文件路径">
              {{ currentPreview?.path }}
            </el-descriptions-item>
            <el-descriptions-item label="修改时间">
              {{ currentPreview?.modifiedTime }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="preview-actions">
            <el-button-group>
              <el-button
                type="primary"
                :icon="Download"
                @click="handleDownload(currentPreview)"
              >
                下载
              </el-button>
              <el-button
                type="primary"
                :icon="FolderOpened"
                @click="handleLocate(currentPreview)"
              >
                在文件夹中显示
              </el-button>
            </el-button-group>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Download, FolderOpened, PictureFilled } from "@element-plus/icons-vue";

const router = useRouter();
const loading = ref(false);
const queryImage = ref("https://picsum.photos/300/200");
const totalResults = ref(156);
const searchTime = ref(0.82);

// 筛选和排序
const sortBy = ref("similarity");
const fileType = ref("all");
const similarityThreshold = ref(60);

// 预览相关
const previewVisible = ref(false);
const currentPreview = ref(null);

// 模拟搜索结果数据
const searchResults = ref(
  Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    url: `https://picsum.photos/${300 + i}/${200 + (i % 2) * 100}`,
    name: `image_${i + 1}.jpg`,
    similarity: Math.round(95 - Math.random() * 30),
    size: "2.5MB",
    path: "C:\\Users\\Pictures\\image.jpg",
    modifiedTime: "2024-03-20 15:30:45",
    aspectRatio: "4/3",
  }))
);

// 过滤后的结果
const filteredResults = computed(() => {
  return searchResults.value
    .filter((item) => {
      if (
        fileType.value !== "all" &&
        !item.name.toLowerCase().endsWith(fileType.value)
      ) {
        return false;
      }
      return item.similarity >= similarityThreshold.value;
    })
    .sort((a, b) => {
      switch (sortBy.value) {
        case "similarity":
          return b.similarity - a.similarity;
        case "time":
          return new Date(b.modifiedTime) - new Date(a.modifiedTime);
        case "size":
          return parseFloat(b.size) - parseFloat(a.size);
        default:
          return 0;
      }
    });
});

// 处理排序
const handleSort = () => {
  // 排序逻辑已通过计算属性实现
};

// 处理筛选
const handleFilter = () => {
  // 筛选逻辑已通过计算属性实现
};

// 处理相似度阈值变化
const handleSimilarityChange = () => {
  // 相似度筛选逻辑已通过计算属性实现
};

// 处理图片预览
const handlePreview = (item) => {
  currentPreview.value = item;
  previewVisible.value = true;
};

// 处理下载
const handleDownload = (item) => {
  ElMessage.success(`开始下载：${item.name}`);
  // TODO: 实现下载逻辑
};

// 处理定位
const handleLocate = (item) => {
  ElMessage.success(`正在打开文件夹：${item.path}`);
  // TODO: 实现文件定位逻辑
};

// 重新搜索
const handleRetry = () => {
  router.push("/main/home");
};
</script>

<style scoped>
.search-result-container {
  height: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.search-header {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 24px;
  margin: 0;
}

.query-info {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.query-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.query-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.query-stats h2 {
  margin: 0 0 8px;
  color: #1e293b;
}

.query-stats p {
  margin: 0 0 4px;
  color: #64748b;
}

.search-time {
  color: #94a3b8;
  font-size: 14px;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-actions :deep(.el-select) {
  width: 120px;
}

.filter-actions :deep(.el-slider) {
  width: 200px;
  margin-left: 16px;
}

.result-content {
  flex: 1;
  padding: 24px;
  overflow: hidden;
  position: relative;
  margin: 0;
}

.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  padding: 4px;
  margin: 0;
}

.result-item {
  break-inside: avoid;
  margin-bottom: 24px;
}

.item-image {
  position: relative;
  padding-top: calc(100% / var(--aspect-ratio, 1));
  overflow: hidden;
}

.item-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  color: #fff;
}

.result-item:hover .item-image img {
  transform: scale(1.05);
}

.result-item:hover .item-overlay {
  opacity: 1;
}

.item-info {
  margin-bottom: 16px;
}

.similarity {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.file-info {
  font-size: 14px;
  opacity: 0.8;
}

.file-info span {
  display: block;
}

.item-actions {
  display: flex;
  justify-content: center;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.preview-container {
  display: flex;
  gap: 24px;
  padding: 24px;
}

.preview-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
}

.preview-main img {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.preview-info {
  width: 300px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
}

.preview-info h3 {
  margin: 0 0 16px;
  color: #1e293b;
}

.preview-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .result-header {
    padding: 16px;
    margin: 0;
  }

  .result-content {
    padding: 16px;
    margin: 0;
  }

  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    padding: 2px;
    margin: 0;
  }
}
</style>
