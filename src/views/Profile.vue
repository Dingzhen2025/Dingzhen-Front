<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="profile-card">
          <div class="avatar-container">
            <el-avatar
              :size="120"
              :src="userInfo.avatar"
              @error="handleAvatarError"
            >
              <img
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
              />
            </el-avatar>
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleAvatarChange"
            >
              <el-button type="primary" size="small"> 更换头像 </el-button>
            </el-upload>
          </div>

          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-value">{{ userInfo.searchCount }}</div>
              <div class="stat-label">搜索次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userInfo.imageCount }}</div>
              <div class="stat-label">图片数量</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userInfo.folderCount }}</div>
              <div class="stat-label">文件夹数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <h3>个人信息</h3>
              <el-button
                type="primary"
                :icon="Edit"
                @click="startEdit"
                v-if="!isEditing"
              >
                编辑
              </el-button>
            </div>
          </template>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
            :disabled="!isEditing"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" />
            </el-form-item>

            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>

            <el-form-item label="默认路径" prop="defaultPath">
              <el-input v-model="form.defaultPath">
                <template #append>
                  <el-button @click="handleSelectPath"> 选择 </el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item v-if="isEditing">
              <el-button type="primary" @click="handleSave">保存</el-button>
              <el-button @click="cancelEdit">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-card class="security-card">
          <template #header>
            <div class="card-header">
              <h3>安全设置</h3>
            </div>
          </template>

          <el-form label-width="100px">
            <el-form-item label="修改密码">
              <el-button @click="showChangePassword"> 修改密码 </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="400px">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { Edit } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 用户信息（模拟数据）
const userInfo = reactive({
  avatar: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png",
  searchCount: 156,
  imageCount: 1024,
  folderCount: 8,
});

// 表单数据
const formRef = ref(null);
const isEditing = ref(false);
const form = reactive({
  username: "user123",
  nickname: "图搜达人",
  email: "user@example.com",
  phone: "13800138000",
  defaultPath: "C:\\Users\\Pictures",
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
};

// 修改密码相关
const passwordDialogVisible = ref(false);
const passwordFormRef = ref(null);
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordRules = {
  oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能小于6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 头像相关方法
const handleAvatarError = () => {
  userInfo.avatar =
    "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png";
};

const handleAvatarChange = (file) => {
  // 这里应该调用接口上传头像
  const reader = new FileReader();
  reader.onload = (e) => {
    userInfo.avatar = e.target.result;
  };
  reader.readAsDataURL(file.raw);
};

// 编辑相关方法
const startEdit = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  formRef.value?.resetFields();
};

const handleSave = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
      // 这里应该调用接口保存数据
      ElMessage.success("保存成功");
      isEditing.value = false;
    }
  });
};

// 选择路径
const handleSelectPath = () => {
  // 这里需要调用 Electron 的文件选择对话框
  // 暂时模拟选择文件夹
  form.defaultPath = "D:\\Pictures";
};

// 修改密码相关方法
const showChangePassword = () => {
  passwordDialogVisible.value = true;
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
};

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate((valid) => {
    if (valid) {
      // 这里应该调用接口修改密码
      ElMessage.success("密码修改成功");
      passwordDialogVisible.value = false;
    }
  });
};
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-card {
  text-align: center;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding: 20px 0;
  border-top: 1px solid #eee;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.security-card {
  margin-top: 20px;
}
</style>
