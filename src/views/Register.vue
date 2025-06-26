<template>
  <div class="register-container">
    <div class="register-content">
      <div class="register-header">
        <img src="../assets/logo.png" alt="Logo" class="logo" />
        <h1>用户注册</h1>
        <p>欢迎加入图搜图系统</p>
      </div>

      <div class="register-form">
        <el-form
          ref="registerForm"
          :model="registerData"
          :rules="registerRules"
          label-position="top"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="registerData.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="registerData.email"
              placeholder="请输入邮箱"
              :prefix-icon="Message"
            />
          </el-form-item>

          <el-form-item label="账号" prop="account">
            <el-input
              v-model="registerData.account"
              placeholder="请输入账号"
              :prefix-icon="UserFilled"
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerData.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="registerData.confirmPassword"
              type="password"
              placeholder="请确认密码"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              class="register-button"
              @click="handleRegister"
            >
              {{ loading ? "注册中..." : "注册" }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-link">
          已有账号？
          <el-link type="primary" underline="never" @click="handleLogin">
            立即登录
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { User, Lock, Message, UserFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { userApi } from "@/api/userApi";

const router = useRouter();
const registerForm = ref(null);
const loading = ref(false);

// 注册表单数据
const registerData = reactive({
  username: "",
  email: "",
  account: "",
  password: "",
  confirmPassword: "",
});

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "用户名长度在2-20个字符之间", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" },
  ],
  account: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 3, max: 20, message: "账号长度在3-20个字符之间", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度在6-20个字符之间", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== registerData.password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 处理注册
const handleRegister = async () => {
  if (!registerForm.value) return;

  try {
    // 表单验证
    await registerForm.value.validate();
    loading.value = true;

    console.log("开始注册，表单数据：", {
      username: registerData.username,
      email: registerData.email,
      account: registerData.account,
    });

    // 调用注册接口
    const result = await userApi.register({
      username: registerData.username.trim(),
      email: registerData.email.trim(),
      account: registerData.account.trim(),
      password: registerData.password,
    });

    console.log("注册结果：", result);

    // 注册成功
    if (result.success) {
      ElMessage.success("注册成功，请登录");
      // 清空表单
      registerForm.value.resetFields();
      // 跳转到登录页
      router.push("/login");
    } else {
      ElMessage.error(result.message || "注册失败，请重试");
    }
  } catch (error) {
    console.error("注册失败:", error);
    ElMessage.error(error.message || "注册失败，请重试");
  } finally {
    loading.value = false;
  }
};

// 跳转到登录页
const handleLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
.register-container {
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
  margin: 0;
  padding: 0;
}

.register-content {
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
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.register-header h1 {
  font-size: 28px;
  color: #1e293b;
  margin: 0 0 8px;
  background: linear-gradient(120deg, #1e293b 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.register-header p {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

.register-form {
  width: 100%;
}

.register-form :deep(.el-input__wrapper) {
  padding: 8px 16px;
  height: 48px;
  background: rgba(255, 255, 255, 0.8);
}

.register-form :deep(.el-input__inner) {
  font-size: 16px;
}

.register-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
  background: linear-gradient(to right, #2563eb, #3b82f6);
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.register-button:active {
  transform: translateY(0);
}

.login-link {
  text-align: center;
  margin-top: 24px;
  color: #64748b;
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
  .register-content {
    width: calc(100% - 40px);
    padding: 30px 20px;
  }

  .register-header h1 {
    font-size: 24px;
  }

  .register-header p {
    font-size: 14px;
  }
}

@media screen and (max-width: 480px) {
  .register-container {
    padding: 0;
  }

  .register-content {
    margin: 0 20px;
  }
}
</style>
