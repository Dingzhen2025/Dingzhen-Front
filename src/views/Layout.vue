<template>
  <div class="layout-container">
    <div class="layout-sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div class="sidebar-header">
        <el-icon class="logo-icon"><Picture /></el-icon>
        <span class="logo-text" v-show="!isCollapsed">一眼盯珍</span>
      </div>

      <el-scrollbar>
        <el-menu
          :default-active="route.path"
          class="el-menu-vertical"
          :collapse="isCollapsed"
          :router="true"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#409eff"
        >
          <el-menu-item index="/main/home">
            <el-icon><House /></el-icon>
            <template #title>主页</template>
          </el-menu-item>

          <el-menu-item index="/main/history">
            <el-icon><Clock /></el-icon>
            <template #title>搜索历史</template>
          </el-menu-item>

          <el-menu-item index="/main/profile">
            <el-icon><User /></el-icon>
            <template #title>个人信息</template>
          </el-menu-item>

          <el-menu-item index="/main/settings">
            <el-icon><Setting /></el-icon>
            <template #title>设置</template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>

      <div class="sidebar-footer" @click="toggleCollapse">
        <el-icon>
          <component :is="isCollapsed ? 'Expand' : 'Fold'" />
        </el-icon>
        <span v-show="!isCollapsed">收起菜单</span>
      </div>
    </div>

    <div class="layout-main">
      <div class="main-header">
        <div class="header-left">
          <el-breadcrumb>
            <el-breadcrumb-item :to="{ path: '/main/home' }"
              >首页</el-breadcrumb-item
            >
            <el-breadcrumb-item>{{
              currentRoute.meta.title
            }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-space>
            <el-tooltip content="全屏" placement="bottom">
              <div class="header-icon-wrapper" @click="toggleFullscreen">
                <el-icon class="header-icon">
                  <FullScreen v-if="!isFullscreen" />
                  <Aim v-else />
                </el-icon>
              </div>
            </el-tooltip>

            <el-tooltip content="消息" placement="bottom">
              <el-badge :value="3" class="header-badge">
                <div class="header-icon-wrapper">
                  <el-icon class="header-icon"><Bell /></el-icon>
                </div>
              </el-badge>
            </el-tooltip>

            <el-dropdown trigger="click" @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="userAvatar" />
                <span class="username">{{ username }}</span>
                <el-icon><CaretBottom /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>系统设置
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </div>
      </div>

      <div class="main-content">
        <el-scrollbar>
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  House,
  Clock,
  User,
  Setting,
  Picture,
  Bell,
  FullScreen,
  Aim,
  CaretBottom,
  Expand,
  Fold,
  SwitchButton,
} from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
const isCollapsed = ref(false);
const isFullscreen = ref(false);

// 模拟用户数据
const username = ref("图搜达人");
const userAvatar = ref(
  "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
);

const currentRoute = computed(() => route);

// 切换侧边栏
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    isFullscreen.value = true;
  } else {
    document.exitFullscreen();
    isFullscreen.value = false;
  }
};

// 处理下拉菜单命令
const handleCommand = async (command) => {
  switch (command) {
    case "profile":
      router.push("/main/profile");
      break;
    case "settings":
      router.push("/main/settings");
      break;
    case "logout":
      try {
        await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        router.push("/login");
        ElMessage.success("已安全退出");
      } catch {
        // 用户取消操作
      }
      break;
  }
};
</script>

<style scoped>
.layout-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.layout-sidebar {
  width: 240px;
  height: 100%;
  background-color: #001529;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.layout-sidebar.is-collapsed {
  width: 64px;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.logo-icon {
  font-size: 24px;
  margin-right: 12px;
  transition: all 0.3s ease;
}

.is-collapsed .logo-icon {
  margin-right: 0;
  transform: scale(1.2);
}

.logo-text {
  opacity: 1;
  transition: all 0.3s ease;
  transform: translateX(0);
}

.is-collapsed .logo-text {
  opacity: 0;
  transform: translateX(20px);
}

.el-menu-vertical {
  border-right: none;
  flex: 1;
  transition: width 0.3s ease;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 240px;
}

.sidebar-footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-footer:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.sidebar-footer .el-icon {
  margin-right: 8px;
  transition: all 0.3s ease;
}

.is-collapsed .sidebar-footer .el-icon {
  margin-right: 0;
  transform: scale(1.2);
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.main-header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.3s ease;
}

.breadcrumb-enter-from,
.breadcrumb-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5f7fa;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.header-icon-wrapper::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.1) 0%, transparent 60%);
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.5s ease;
  pointer-events: none;
}

.header-icon-wrapper:hover::after {
  transform: translate(-50%, -50%) scale(2);
}

.header-icon-wrapper:hover {
  background-color: var(--el-color-primary-light-9);
  transform: translateY(-2px);
}

.header-icon {
  font-size: 24px;
  color: #1e293b;
  transition: all 0.3s ease;
}

.header-icon-wrapper:hover .header-icon {
  color: var(--el-color-primary);
  transform: scale(1.1);
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 24px;
  transition: all 0.3s ease;
  background-color: transparent;
}

.user-info:hover {
  background-color: #f5f7fa;
  transform: translateY(-1px);
}

.username {
  margin: 0 8px;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
}

.user-info:hover .username {
  color: var(--el-color-primary);
}

.main-content {
  flex: 1;
  padding: 0;
  overflow: hidden;
  background-color: #f5f7fa;
  position: relative;
}

.main-content :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

.main-content :deep(.el-scrollbar__view) {
  padding: 24px;
}

/* 路由过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.5s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .layout-sidebar {
    position: fixed;
    z-index: 1000;
    transform: translateX(0);
    transition: transform 0.3s ease;
  }

  .layout-sidebar.is-collapsed {
    transform: translateX(-100%);
  }

  .main-header {
    padding: 0 16px;
  }

  .username {
    display: none;
  }

  .header-icon-wrapper {
    width: 36px;
    height: 36px;
  }

  .header-icon {
    font-size: 20px;
  }
}
</style>
