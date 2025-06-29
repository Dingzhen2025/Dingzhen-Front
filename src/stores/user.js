import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    userId: null,
    userName: "",
    email: "",
    createdAt: "",
    token: "",
    isLoggedIn: false,
  }),

  getters: {
    // 获取用户信息
    userInfo: (state) => ({
      userId: state.userId,
      userName: state.userName,
      email: state.email,
      createdAt: state.createdAt,
    }),

    // 获取登录状态
    loginStatus: (state) => state.isLoggedIn && state.userId !== null,

    // 获取token
    getToken: (state) => state.token,
  },

  actions: {
    // 验证用户信息完整性
    validateUserInfo(userInfo) {
      if (!userInfo) {
        throw new Error("用户信息不能为空");
      }

      // 只验证必要的字段
      if (!userInfo.userId) {
        throw new Error("用户信息不完整：缺少 userId");
      }

      // 验证userId类型
      if (typeof userInfo.userId !== "number") {
        // 尝试转换
        const userId = parseInt(userInfo.userId);
        if (isNaN(userId)) {
          throw new Error("userId必须是数字类型");
        }
        userInfo.userId = userId;
      }

      return true;
    },

    // 设置用户信息
    setUserInfo(userInfo) {
      try {
        // 验证用户信息
        this.validateUserInfo(userInfo);

        // 更新状态
        this.userId = userInfo.userId;
        this.userName = userInfo.userName || "";
        this.email = userInfo.email || "";
        this.createdAt = userInfo.createdAt || new Date().toISOString();
        this.token = userInfo.token || "";
        this.isLoggedIn = true;

        // 持久化存储用户信息
        const storageData = {
          userId: this.userId,
          userName: this.userName,
          email: this.email,
          createdAt: this.createdAt,
          token: this.token,
        };
        localStorage.setItem("userInfo", JSON.stringify(storageData));
      } catch (error) {
        console.error("设置用户信息失败:", error);
        this.clearUserInfo();
        throw error;
      }
    },

    // 清除用户信息（登出时使用）
    clearUserInfo() {
      this.userId = null;
      this.userName = "";
      this.email = "";
      this.createdAt = "";
      this.token = "";
      this.isLoggedIn = false;

      // 清除持久化的用户信息
      localStorage.removeItem("userInfo");
    },

    // 从localStorage恢复用户会话
    restoreSession() {
      try {
        const userInfoStr = localStorage.getItem("userInfo");
        if (!userInfoStr) {
          return false;
        }

        const userInfo = JSON.parse(userInfoStr);

        // 验证用户信息完整性
        this.validateUserInfo(userInfo);

        // 恢复状态
        this.userId = userInfo.userId;
        this.userName = userInfo.userName || "";
        this.email = userInfo.email || "";
        this.createdAt = userInfo.createdAt || "";
        this.token = userInfo.token || "";
        this.isLoggedIn = true;

        return true;
      } catch (error) {
        console.error("恢复用户会话失败:", error);
        this.clearUserInfo();
        return false;
      }
    },
  },
});
