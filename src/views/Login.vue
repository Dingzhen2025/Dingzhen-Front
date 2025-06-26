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
          :rules="rules"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="account">
            <el-input
              v-model="loginData.account"
              placeholder="请输入账号"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginData.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="loginData.remember">记住我</el-checkbox>
            <el-link type="primary" underline="never">忘记密码？</el-link>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              class="login-button"
              @click="handleLogin"
            >
              {{ loading ? "登录中..." : "登录" }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="register-link">
          还没有账号？
          <el-link type="primary" underline="never" @click="handleRegister">
            立即注册
          </el-link>
        </div>
      </div>
    </div>

    <footer class="login-footer">
      <p>© 2024 图搜图系统 版权所有</p>
    </footer>

    <!-- 背景动画 -->
    <div class="background-animation">
      <div class="gradient-bg"></div>
      <div class="particles"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { User, Lock } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { userApi } from "../api/userApi";
import { useUserStore } from "../stores/user";

// 获取路由实例
const router = useRouter();
const route = useRoute();

// 获取用户store
const userStore = useUserStore();

// 表单ref
const loginForm = ref(null);

// 登录数据
const loginData = ref({
  account: "",
  password: "",
  remember: false,
});

// 加载状态
const loading = ref(false);

// 处理登录
const handleLogin = async () => {
  if (!loginForm.value) return;

  try {
    // 表单验证
    await loginForm.value.validate();
    loading.value = true;

    // 调用登录接口
    const userData = await userApi.login({
      account: loginData.value.account.trim(),
      password: loginData.value.password,
    });

    // 验证返回的用户数据
    if (!userData || !userData.userId) {
      throw new Error("登录失败：用户数据无效");
    }

    // 如果选择记住我，保存账号信息
    if (loginData.value.remember) {
      localStorage.setItem("rememberedAccount", loginData.value.account);
    } else {
      localStorage.removeItem("rememberedAccount");
    }

    // 保存用户信息到store
    userStore.setUserInfo(userData);

    // 登录成功提示
    ElMessage.success("登录成功");

    // 获取重定向地址，默认跳转到主页
    const redirect = route.query.redirect || "/main/home";
    // 跳转到目标页面
    router.push(redirect);
  } catch (error) {
    console.error("登录失败:", error);
    ElMessage.error(error.message || "登录失败，请检查账号密码");
  } finally {
    loading.value = false;
  }
};

// 处理注册跳转
const handleRegister = () => {
  router.push("/register");
};

// 在组件挂载时检查是否有记住的账号
onMounted(() => {
  const rememberedAccount = localStorage.getItem("rememberedAccount");
  if (rememberedAccount) {
    loginData.value.account = rememberedAccount;
    loginData.value.remember = true;
  }
});

// 表单验证规则
const rules = {
  account: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 3, max: 20, message: "账号长度应在3-20个字符之间", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度应在6-20个字符之间", trigger: "blur" },
  ],
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
  margin-top: 40px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
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
}

@media screen and (max-width: 480px) {
  .login-container {
    padding: 0;
  }

  .login-content {
    margin: 0 20px;
  }
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
</style>
