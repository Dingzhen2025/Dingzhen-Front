<template>
  <div class="settings-container">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <h3>基本设置</h3>
        </div>
      </template>

      <el-form ref="formRef" :model="settings" label-width="180px">
        <el-form-item label="当前图片库路径">
          <div class="library-path-container">
            <el-input
              v-model="settings.defaultSearchPath"
              readonly
              placeholder="未选择图片库"
            >
              <template #append>
                <el-button @click="handleSelectPath">
                  <el-icon>
                    <FolderAdd />
                  </el-icon>
                  重新选择
                </el-button>
              </template>
            </el-input>
            <div class="path-tip" v-if="settings.defaultSearchPath">
              此路径下的图片将被用于图像搜索
            </div>
          </div>
        </el-form-item>

        <el-form-item label="搜索结果数量">
          <el-input-number
            v-model="settings.resultCount"
            :min="5"
            :max="50"
            :step="5"
          />
        </el-form-item>

        <el-form-item label="相似度阈值">
          <el-slider
            v-model="settings.similarityThreshold"
            :min="0"
            :max="100"
            :step="1"
            :format-tooltip="(value) => `${value}%`"
          />
        </el-form-item>

        <el-form-item label="自动同步间隔">
          <el-select v-model="settings.syncInterval">
            <el-option label="5分钟" value="5" />
            <el-option label="10分钟" value="10" />
            <el-option label="30分钟" value="30" />
            <el-option label="1小时" value="60" />
            <el-option label="手动同步" value="0" />
          </el-select>
        </el-form-item>

        <el-form-item label="启动时自动同步">
          <el-switch v-model="settings.autoSync" />
        </el-form-item>

        <el-form-item label="显示文件路径">
          <el-switch v-model="settings.showFilePath" />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <h3>图片设置</h3>
        </div>
      </template>

      <el-form ref="imageFormRef" :model="imageSettings" label-width="180px">
        <el-form-item label="支持的图片格式">
          <el-select
            v-model="imageSettings.supportedFormats"
            multiple
            collapse-tags
            collapse-tags-tooltip
          >
            <el-option label="JPG" value="jpg" />
            <el-option label="PNG" value="png" />
            <el-option label="GIF" value="gif" />
            <el-option label="BMP" value="bmp" />
            <el-option label="WEBP" value="webp" />
          </el-select>
        </el-form-item>

        <el-form-item label="缩略图质量">
          <el-select v-model="imageSettings.thumbnailQuality">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
          </el-select>
        </el-form-item>

        <el-form-item label="最大图片大小">
          <el-input-number
            v-model="imageSettings.maxSize"
            :min="1"
            :max="50"
            :step="1"
          >
            <template #append>MB</template>
          </el-input-number>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <h3>存储设置</h3>
        </div>
      </template>

      <el-form
        ref="storageFormRef"
        :model="storageSettings"
        label-width="180px"
      >
        <el-form-item label="本地存储路径">
          <el-input
            v-model="storageSettings.localPath"
            placeholder="请选择本地存储路径"
          >
            <template #append>
              <el-button @click="handleSelectStoragePath"> 选择 </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="清理缓存">
          <el-button type="warning" @click="handleClearCache">
            清理缓存
          </el-button>
          <div class="tip-text">
            当前缓存大小：{{ storageSettings.cacheSize }}
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="action-buttons">
      <el-button type="primary" @click="handleSave">保存设置</el-button>
      <el-button @click="handleReset">恢复默认</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { FolderAdd } from "@element-plus/icons-vue";

const router = useRouter();

// 基本设置
const settings = reactive({
  defaultSearchPath: "",
  resultCount: 10,
  similarityThreshold: 80,
  syncInterval: "10",
  autoSync: true,
  showFilePath: true,
});

// 图片设置
const imageSettings = reactive({
  supportedFormats: ["jpg", "png", "gif"],
  thumbnailQuality: "medium",
  maxSize: 10,
});

// 存储设置
const storageSettings = reactive({
  localPath: "C:\\Users\\AppData\\Local\\ImageSearch",
  cacheSize: "156MB",
});

onMounted(() => {
  // 从本地存储获取当前选择的图片库路径
  const lastLibraryPath = localStorage.getItem("lastLibraryPath");
  if (lastLibraryPath) {
    settings.defaultSearchPath = lastLibraryPath;
  }
});

// 重新选择图片库
const handleSelectPath = () => {
  router.push("/main/select");
};

const handleSelectStoragePath = () => {
  // 这里需要调用 Electron 的文件选择对话框
  // 暂时模拟选择文件夹
  storageSettings.localPath = "D:\\AppData\\Local\\ImageSearch";
};

// 清理缓存
const handleClearCache = async () => {
  try {
    await ElMessageBox.confirm(
      "确定要清理缓存吗？这可能会影响搜索性能。",
      "警告",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    // 这里应该调用接口清理缓存
    ElMessage.success("缓存清理成功");
    storageSettings.cacheSize = "0MB";
  } catch {
    // 用户取消操作
  }
};

// 保存设置
const handleSave = () => {
  // 这里应该调用接口保存设置
  ElMessage.success("设置保存成功");
};

// 重置设置
const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      "确定要恢复默认设置吗？当前设置将会丢失。",
      "警告",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );
    // 重置所有设置为默认值
    Object.assign(settings, {
      defaultSearchPath: "",
      resultCount: 10,
      similarityThreshold: 80,
      syncInterval: "10",
      autoSync: true,
      showFilePath: true,
    });

    Object.assign(imageSettings, {
      supportedFormats: ["jpg", "png", "gif"],
      thumbnailQuality: "medium",
      maxSize: 10,
    });

    Object.assign(storageSettings, {
      localPath: "C:\\Users\\AppData\\Local\\ImageSearch",
      cacheSize: "0MB",
    });

    ElMessage.success("已恢复默认设置");
  } catch {
    // 用户取消操作
  }
};
</script>

<style scoped>
.settings-container {
  padding: 24px;
  min-height: 100%;
  background: #f8fafc;
}

.settings-header {
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

.settings-title {
  font-size: 32px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
  background: linear-gradient(120deg, #1e293b 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.settings-description {
  font-size: 16px;
  color: #64748b;
  max-width: 600px;
}

.settings-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease 0.2s forwards;
}

.settings-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.settings-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--el-color-primary-light-9);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.settings-card:hover .card-icon {
  transform: scale(1.1);
  background: var(--el-color-primary);
  color: white;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 8px;
}

.form-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.form-input :deep(.el-input__wrapper:hover) {
  transform: translateY(-2px);
}

.form-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(var(--el-color-primary-rgb), 0.2) !important;
}

.form-select :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.form-select :deep(.el-select__wrapper:hover) {
  transform: translateY(-2px);
}

.form-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch-label {
  font-size: 14px;
  color: #1e293b;
}

.form-hint {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.save-button {
  width: 100%;
  height: 40px;
  margin-top: 32px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  background: linear-gradient(
    90deg,
    var(--el-color-primary),
    var(--el-color-primary-light-3)
  );
  border: none;
  position: relative;
  overflow: hidden;
}

.save-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    120deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: all 0.6s;
}

.save-button:hover::before {
  left: 100%;
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
}

.save-button:active {
  transform: translateY(1px);
}

/* Success Animation */
@keyframes checkmark {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.save-success {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #10b981;
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  animation: slideIn 0.3s ease;
}

.success-icon {
  font-size: 24px;
  animation: checkmark 0.5s ease;
}

.success-message {
  font-size: 14px;
  font-weight: 500;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }

  .settings-header {
    margin-bottom: 24px;
  }

  .settings-title {
    font-size: 24px;
  }

  .settings-description {
    font-size: 14px;
  }

  .settings-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .settings-card {
    padding: 20px;
  }

  .card-icon {
    width: 32px;
    height: 32px;
  }

  .card-title {
    font-size: 16px;
  }

  .save-success {
    bottom: 16px;
    right: 16px;
    padding: 12px 20px;
  }
}

.library-path-container {
  .path-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
    padding-left: 4px;
  }
}

.el-input {
  :deep(.el-input-group__append) {
    .el-button {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}
</style>
