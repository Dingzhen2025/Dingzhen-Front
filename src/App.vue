<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
// App level setup
</script>

<style>
/* 重置默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 确保html和body占满整个窗口 */
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  background-color: transparent;
}

/* 主容器样式 */
#app {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: transparent;
}

/* 全局过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 列表动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 弹出动画 */
.pop-enter-active,
.pop-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 滑动动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* 全局悬浮效果 */
.hover-float {
  transition: transform 0.3s ease;
}

.hover-float:hover {
  transform: translateY(-5px);
}

/* 全局点击波纹效果 */
.ripple {
  position: relative;
  overflow: hidden;
}

.ripple::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition: transform 0.5s, opacity 1s;
}

.ripple:active::after {
  transform: scale(0, 0);
  opacity: 0.3;
  transition: 0s;
}

/* 全局加载动画 */
.loading-spinner {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Element Plus 全局样式优化 */
:root {
  --el-transition-duration: 0.3s;
  --el-transition-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.el-button {
  transition: all 0.3s ease !important;
}

.el-button:not(.is-disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.el-input__wrapper,
.el-select__wrapper {
  transition: all 0.3s ease !important;
}

.el-input__wrapper:hover,
.el-select__wrapper:hover {
  transform: translateY(-1px);
}

.el-card {
  transition: all 0.3s ease !important;
}

.el-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.el-menu-item {
  transition: all 0.3s ease !important;
}

.el-menu-item:hover {
  transform: translateX(5px);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Element Plus 全局样式覆盖 */
:root {
  --el-color-primary: #409eff;
  --el-border-radius-base: 4px;
}

.el-card {
  --el-card-border-color: transparent;
  --el-card-border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.el-button {
  font-weight: 500;
}

.el-input__wrapper,
.el-select__wrapper {
  box-shadow: 0 0 0 1px #dcdfe6 !important;
}

.el-input__wrapper.is-focus,
.el-select__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--el-color-primary) !important;
}
</style>
