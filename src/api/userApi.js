import axios from "axios";

const BASE_URL = "http://47.107.172.202:8080";

export const userApi = {
  // 用户注册
  async register(registerData) {
    try {
      // 验证必要参数
      if (
        !registerData.username ||
        !registerData.email ||
        !registerData.account ||
        !registerData.password
      ) {
        throw new Error("注册信息不完整");
      }

      console.log("开始调用注册接口，参数：", {
        username: registerData.username,
        email: registerData.email,
        account: registerData.account,
      });

      // 构造请求数据
      const formData = new URLSearchParams();
      formData.append("username", registerData.username.trim());
      formData.append("email", registerData.email.trim());
      formData.append("account", registerData.account.trim());
      formData.append("password", registerData.password);

      // 发送注册请求
      const response = await axios({
        method: "post",
        url: `${BASE_URL}/users/register`,
        data: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("注册接口响应：", response.data);

      // 验证响应数据
      if (!response.data) {
        throw new Error("注册失败：响应数据为空");
      }

      // 根据响应状态处理
      if (response.data.code === 200) {
        return {
          success: true,
          message: "注册成功",
        };
      } else {
        throw new Error(response.data.msg || "注册失败");
      }
    } catch (error) {
      console.error("注册失败:", error.response?.data || error);
      throw new Error(error.response?.data?.msg || error.message || "注册失败");
    }
  },

  // 用户登录
  async login(loginData) {
    try {
      // 验证必要参数
      if (!loginData.account || !loginData.password) {
        throw new Error("账号和密码不能为空");
      }

      console.log("开始调用登录接口，参数：", {
        account: loginData.account,
      });

      // 构造请求数据
      const formData = new URLSearchParams();
      formData.append("account", loginData.account.trim());
      formData.append("password", loginData.password);

      // 发送登录请求
      const response = await axios({
        method: "post",
        url: `${BASE_URL}/users/login`,
        data: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("登录接口响应：", response.data);

      // 验证响应数据
      if (!response.data) {
        throw new Error("登录失败：响应数据为空");
      }

      // 根据响应状态处理
      if (response.data.code === 200 && response.data.data) {
        const userData = response.data.data;
        // 确保返回正确的字段名称
        return {
          userId: userData.userId || userData.id, // 后端返回的可能是 userId 或 id
          userName: userData.userName || userData.username || userData.name, // 后端返回的可能是 userName、username 或 name
          email: userData.email,
          token: userData.token || userData.userAccount, // 暂时使用 userAccount 作为 token
          createdAt: userData.createdAt || new Date().toISOString(),
        };
      } else if (response.data.code === 400) {
        throw new Error("账号或密码错误");
      } else {
        throw new Error(response.data.msg || "登录失败");
      }
    } catch (error) {
      console.error("登录失败:", error.response?.data || error);
      if (error.response?.data) {
        throw new Error(error.response.data.msg || "登录失败");
      }
      throw new Error(error.message || "网络错误，请稍后重试");
    }
  },
};
