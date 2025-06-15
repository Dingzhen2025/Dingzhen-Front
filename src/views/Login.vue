<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-header">
        <img src="../assets/logo.png" alt="Logo" class="logo" />
        <h1>图搜图系统</h1>
        <p>智能图像检索·高效管理</p>
      </div>

      <div class="login-form">
        <el-form
          ref="loginForm"
          :model="loginData"
          :rules="loginRules"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginData.username"
              placeholder="用户名"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginData.password"
              type="password"
              placeholder="密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="loginData.remember">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              class="login-button"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="register-link">
          还没有账号？
          <el-link type="primary" :underline="false" @click="handleRegister">
            立即注册
          </el-link>
        </div>
      </div>
    </div>

    <footer class="login-footer">
      <p>© 2025 图搜图系统 版权所有</p>
      <div class="footer-links">
        <el-link type="info" :underline="false">隐私政策</el-link>
        <el-divider direction="vertical" />
        <el-link type="info" :underline="false">用户协议</el-link>
        <el-divider direction="vertical" />
        <el-link type="info" :underline="false">帮助中心</el-link>
      </div>
    </footer>

    <!-- 背景动画 -->
    <div class="background-animation">
      <div class="gradient-bg"></div>
      <div class="particles"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { User, Lock } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

const router = useRouter();
const loading = ref(false);
const loginForm = ref(null);

const loginData = reactive({
  username: "",
  password: "",
  remember: false,
});

const loginRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" },
  ],
};

const handleLogin = async () => {
  if (!loginForm.value) return;

  try {
    await loginForm.value.validate();
    loading.value = true;

    // 模拟登录请求
    setTimeout(() => {
      loading.value = false;
      router.push("/main/select");
      ElMessage.success("登录成功");
    }, 1500);
  } catch (error) {
    console.log("表单验证失败", error);
  }
};

const handleRegister = () => {
  router.push("/register");
};
</script>

<style scoped>
.login-container {
  min-width: 100vw;
  min-height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%);
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.login-content {
  width: 100%;
  max-width: 440px;
  margin: 0 20px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1;
  animation: fadeIn 0.5s ease;
  position: relative;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 28px;
  color: #1e293b;
  margin: 0 0 8px;
  background: linear-gradient(120deg, #1e293b 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-header p {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-input__wrapper) {
  padding: 8px 16px;
  height: 48px;
  background: rgba(255, 255, 255, 0.8);
}

.login-form :deep(.el-input__inner) {
  font-size: 16px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  background: linear-gradient(to right, #2563eb, #3b82f6);
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.login-button:active {
  transform: translateY(0);
}

.register-link {
  text-align: center;
  margin-top: 24px;
  color: #64748b;
}

.login-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  z-index: 1;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent);
}

.footer-links {
  margin-top: 8px;
}

.footer-links :deep(.el-link) {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 14px;
}

.footer-links :deep(.el-divider) {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 背景动画 */
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

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .login-content {
    width: calc(100% - 40px);
    max-width: 440px;
    padding: 30px 20px;
    margin: 20px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .login-header p {
    font-size: 14px;
  }

  .login-footer {
    padding: 16px;
  }
}

/* 确保在不同分辨率下保持居中和美观 */
@media screen and (min-height: 800px) {
  .login-container {
    padding: 0;
  }

  .login-content {
    margin: 0 20px;
  }
}

@media screen and (max-height: 600px) {
  .login-container {
    justify-content: flex-start;
    padding-top: 40px;
  }

  .login-footer {
    position: relative;
    margin-top: 40px;
    background: none;
  }
}
</style>
