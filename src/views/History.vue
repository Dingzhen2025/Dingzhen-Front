<template>
  <div class="history-container">
    <div class="history-header">
      <div class="header-title">
        <h2>搜索历史</h2>
        <p class="subtitle">共 {{ totalRecords }} 条记录</p>
      </div>

      <div class="header-actions">
        <el-space wrap>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索历史记录"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="timeRange"
            placeholder="时间范围"
            @change="handleFilter"
          >
            <el-option label="全部" value="all" />
            <el-option label="今天" value="today" />
            <el-option label="最近7天" value="week" />
            <el-option label="最近30天" value="month" />
            <el-option label="自定义" value="custom" />
          </el-select>

          <el-date-picker
            v-if="timeRange === 'custom'"
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleFilter"
          />

          <el-button type="danger" @click="handleClearHistory">
            <el-icon><Delete /></el-icon>
            清空历史
          </el-button>
        </el-space>
      </div>
    </div>

    <div class="history-content">
      <el-scrollbar height="calc(100vh - 200px)">
        <el-timeline>
          <el-timeline-item
            v-for="group in groupedHistory"
            :key="group.date"
            :timestamp="group.date"
            placement="top"
            :type="group.type"
          >
            <el-card class="history-group">
              <div class="group-header">
                <span class="group-title">{{ group.title }}</span>
                <span class="group-count">{{ group.items.length }} 条记录</span>
              </div>

              <div class="history-items">
                <div
                  v-for="item in group.items"
                  :key="item.id"
                  class="history-item"
                >
                  <div class="item-image">
                    <img :src="item.imageUrl" :alt="item.name" />
                  </div>

                  <div class="item-info">
                    <div class="item-main">
                      <h4>{{ item.name }}</h4>
                      <p class="item-path">{{ item.path }}</p>
                      <p class="item-stats">
                        找到 {{ item.resultsCount }} 个相似图片 · 相似度
                        {{ item.similarity }}% 以上
                      </p>
                    </div>

                    <div class="item-time">
                      {{ item.time }}
                    </div>
                  </div>

                  <div class="item-actions">
                    <el-button-group>
                      <el-tooltip content="重新搜索" placement="top">
                        <el-button
                          type="primary"
                          :icon="Search"
                          @click="handleReSearch(item)"
                        />
                      </el-tooltip>

                      <el-tooltip content="查看结果" placement="top">
                        <el-button
                          type="primary"
                          :icon="View"
                          @click="handleViewResults(item)"
                        />
                      </el-tooltip>

                      <el-tooltip content="删除记录" placement="top">
                        <el-button
                          type="danger"
                          :icon="Delete"
                          @click="handleDeleteRecord(item)"
                        />
                      </el-tooltip>
                    </el-button-group>
                  </div>
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>

        <el-empty v-if="groupedHistory.length === 0" description="暂无搜索历史">
          <el-button type="primary" @click="$router.push('/main/home')">
            开始搜索
          </el-button>
        </el-empty>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";
import { Search, Delete, View } from "@element-plus/icons-vue";
import dayjs from "dayjs";

const router = useRouter();
const searchKeyword = ref("");
const timeRange = ref("all");
const dateRange = ref(null);
const totalRecords = ref(156);

// 模拟历史数据
const historyData = ref(
  Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    imageUrl: `https://picsum.photos/${300 + i}/${200 + (i % 2) * 100}`,
    name: `搜索_${i + 1}.jpg`,
    path: "C:\\Users\\Pictures\\image.jpg",
    resultsCount: Math.floor(Math.random() * 100) + 20,
    similarity: Math.round(80 + Math.random() * 15),
    time: dayjs()
      .subtract(i * 2, "hour")
      .format("YYYY-MM-DD HH:mm:ss"),
    date: dayjs()
      .subtract(i * 2, "hour")
      .format("YYYY-MM-DD"),
  }))
);

// 分组后的历史记录
const groupedHistory = computed(() => {
  const filtered = historyData.value.filter((item) => {
    if (
      searchKeyword.value &&
      !item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    ) {
      return false;
    }

    if (timeRange.value !== "all") {
      const itemDate = dayjs(item.date);
      const today = dayjs().startOf("day");

      switch (timeRange.value) {
        case "today":
          return itemDate.isSame(today, "day");
        case "week":
          return itemDate.isAfter(today.subtract(7, "day"));
        case "month":
          return itemDate.isAfter(today.subtract(30, "day"));
        case "custom":
          if (!dateRange.value) return true;
          return (
            itemDate.isAfter(dateRange.value[0]) &&
            itemDate.isBefore(dateRange.value[1])
          );
      }
    }

    return true;
  });

  const groups = {};
  filtered.forEach((item) => {
    if (!groups[item.date]) {
      groups[item.date] = {
        date: item.date,
        title: formatGroupTitle(item.date),
        type: getGroupType(item.date),
        items: [],
      };
    }
    groups[item.date].items.push(item);
  });

  return Object.values(groups).sort(
    (a, b) => dayjs(b.date).unix() - dayjs(a.date).unix()
  );
});

// 格式化分组标题
const formatGroupTitle = (date) => {
  const today = dayjs().startOf("day");
  const itemDate = dayjs(date);

  if (itemDate.isSame(today, "day")) {
    return "今天";
  } else if (itemDate.isSame(today.subtract(1, "day"), "day")) {
    return "昨天";
  } else if (itemDate.isAfter(today.subtract(7, "day"))) {
    return itemDate.format("dddd");
  } else {
    return itemDate.format("YYYY年M月D日");
  }
};

// 获取分组类型
const getGroupType = (date) => {
  const today = dayjs().startOf("day");
  const itemDate = dayjs(date);

  if (itemDate.isSame(today, "day")) {
    return "primary";
  } else if (itemDate.isAfter(today.subtract(7, "day"))) {
    return "success";
  } else {
    return "info";
  }
};

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
};

// 处理筛选
const handleFilter = () => {
  // 筛选逻辑已通过计算属性实现
};

// 重新搜索
const handleReSearch = (item) => {
  router.push({
    path: "/main/search",
    query: { image: item.imageUrl },
  });
};

// 查看结果
const handleViewResults = (item) => {
  router.push({
    path: "/main/search",
    query: { id: item.id },
  });
};

// 删除记录
const handleDeleteRecord = async (item) => {
  try {
    await ElMessageBox.confirm("确定要删除这条搜索记录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });

    historyData.value = historyData.value.filter(
      (record) => record.id !== item.id
    );
    ElMessage.success("记录已删除");
  } catch {
    // 用户取消操作
  }
};

// 清空历史
const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      "确定要清空所有搜索历史吗？此操作不可恢复！",
      "警告",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    historyData.value = [];
    ElMessage.success("历史记录已清空");
  } catch {
    // 用户取消操作
  }
};
</script>

<style scoped>
.history-container {
  padding: 24px;
  min-height: 100%;
  background: #f8fafc;
}

.history-header {
  margin-bottom: 32px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.history-title {
  font-size: 32px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  background: linear-gradient(120deg, #1e293b 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.history-description {
  font-size: 16px;
  color: #64748b;
  max-width: 600px;
}

.history-filters {
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease 0.2s forwards;
}

.filter-input {
  flex: 1;
  min-width: 200px;
}

.filter-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.filter-input :deep(.el-input__wrapper:hover) {
  transform: translateY(-2px);
}

.history-list {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease 0.4s forwards;
}

.history-item {
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  transform: translateX(0);
  opacity: 0;
  animation: slideIn 0.6s ease forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.history-item:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.history-item-header {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.history-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  transition: all 0.3s ease;
}

.history-item:hover .history-image {
  transform: scale(1.05);
}

.history-info {
  flex: 1;
}

.history-date {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
}

.history-path {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #64748b;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.history-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 8px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  transition: all 0.3s ease;
  cursor: pointer;
}

.action-button:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  transform: translateY(-2px);
}

.history-item-content {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.result-thumbnail {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.result-thumbnail:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.thumbnail-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.similarity-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  backdrop-filter: blur(4px);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 0;
  color: #64748b;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease 0.4s forwards;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #94a3b8;
}

.empty-text {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #94a3b8;
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(var(--el-color-primary-rgb), 0.1);
  border-radius: 50%;
  border-top-color: var(--el-color-primary);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .history-container {
    padding: 16px;
  }

  .history-header {
    margin-bottom: 24px;
  }

  .history-title {
    font-size: 24px;
  }

  .history-description {
    font-size: 14px;
  }

  .history-item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .history-image {
    width: 100%;
    height: 160px;
  }

  .history-stats {
    flex-wrap: wrap;
  }

  .history-item-content {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }

  .thumbnail-image {
    height: 80px;
  }
}
</style>
