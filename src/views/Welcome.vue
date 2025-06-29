<template>
  <div class="welcome-container">
    <div class="welcome-content">
      <div class="logo-container">
        <div class="logo-animation">
          <el-icon class="logo-icon"><Picture /></el-icon>
        </div>
        <h1 class="app-name">一眼盯珍</h1>
        <div class="app-subtitle">桌面搜图系统</div>
      </div>

      <div class="welcome-text">
        <h2>欢迎使用</h2>
        <p>基于深度学习的智能图像搜索系统</p>
        <p class="feature-text">在本地图库中快速找到相似图片</p>
      </div>

      <div class="feature-grid">
        <div class="feature-item">
          <el-icon class="feature-icon"><Lightning /></el-icon>
          <span>快速搜索</span>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><Share /></el-icon>
          <span>精准匹配</span>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><DataLine /></el-icon>
          <span>智能分析</span>
        </div>
        <div class="feature-item">
          <el-icon class="feature-icon"><Monitor /></el-icon>
          <span>本地运行</span>
        </div>
      </div>

      <div class="action-container">
        <el-button
          type="primary"
          size="large"
          class="start-button"
          @click="handleStart"
        >
          开始使用
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div class="version-info">
        <span>Version 1.0.0</span>
        <el-divider direction="vertical" />
        <span>Made with ❤️ by DingZhen Team</span>
      </div>
    </div>

    <!-- 背景动画 -->
    <div class="background-animation">
      <div class="gradient-bg"></div>
      <div class="particles"></div>
    </div>
  </div>
</template>

<script setup>
import {
  Picture,
  Lightning,
  Share,
  DataLine,
  Monitor,
  ArrowRight,
} from "@element-plus/icons-vue";
import { useRouter } from "vue-router";

const router = useRouter();

const handleStart = () => {
  router.push("/login");
};
</script>

<style scoped>
.welcome-container {
  min-width: 100vw;
  min-height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%);
  overflow: hidden;
  color: #fff;
}

.welcome-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px;
  max-width: 800px;
  width: 100%;
}

.logo-container {
  margin-bottom: 40px;
}

.logo-animation {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

.logo-icon {
  font-size: 60px;
  color: #fff;
  animation: pulse 2s ease-in-out infinite;
}

.app-name {
  font-size: 48px;
  font-weight: bold;
  margin: 0;
  background: linear-gradient(120deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeIn 1s ease-out;
}

.app-subtitle {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 8px;
  animation: fadeIn 1s ease-out 0.3s backwards;
}

.welcome-text {
  margin-bottom: 48px;
  animation: fadeIn 1s ease-out 0.6s backwards;
}

.welcome-text h2 {
  font-size: 36px;
  margin: 0 0 16px;
}

.welcome-text p {
  font-size: 18px;
  margin: 8px 0;
  color: rgba(255, 255, 255, 0.9);
}

.feature-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 48px;
  animation: fadeIn 1s ease-out 0.9s backwards;
}

.feature-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
}

.feature-icon {
  font-size: 32px;
}

.feature-item span {
  font-size: 16px;
}

.action-container {
  margin-bottom: 40px;
  animation: fadeIn 1s ease-out 1.2s backwards;
}

.start-button {
  padding: 16px 40px;
  font-size: 18px;
  border-radius: 12px;
  background: linear-gradient(to right, #3b82f6, #2563eb);
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.start-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
}

.version-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  animation: fadeIn 1s ease-out 1.5s backwards;
}

.background-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.gradient-bg {
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background: linear-gradient(
    45deg,
    rgba(37, 99, 235, 0.3) 0%,
    rgba(37, 99, 235, 0) 70%
  );
  animation: rotate 20s linear infinite;
  z-index: 0;
}

.particles {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle, #ffffff 1px, transparent 1px);
  background-size: 50px 50px;
  animation: fadeInOut 3s ease-in-out infinite;
  opacity: 0.3;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeInOut {
  0%,
  100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.3;
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .welcome-content {
    padding: 20px;
  }

  .logo-animation {
    width: 100px;
    height: 100px;
  }

  .logo-icon {
    font-size: 50px;
  }

  .app-name {
    font-size: 36px;
  }

  .app-subtitle {
    font-size: 20px;
  }

  .welcome-text h2 {
    font-size: 28px;
  }

  .welcome-text p {
    font-size: 16px;
  }

  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .feature-item {
    padding: 16px;
  }

  .feature-icon {
    font-size: 28px;
  }

  .start-button {
    padding: 14px 32px;
    font-size: 16px;
  }
}
</style>
