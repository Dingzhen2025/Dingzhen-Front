import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";

const routes = [
  {
    path: "/",
    redirect: "/welcome",
  },
  {
    path: "/welcome",
    name: "Welcome",
    component: () => import("@/views/Welcome.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/Register.vue"),
  },
  {
    path: "/main",
    name: "Layout",
    component: () => import("@/views/Layout.vue"),
    redirect: "/main/home",
    children: [
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/Home.vue"),
        meta: { title: "主页", requiresAuth: true },
      },
      {
        path: "search",
        name: "Search",
        component: () => import("@/views/Search.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "search-result",
        name: "SearchResult",
        component: () => import("@/views/SearchResult.vue"),
        meta: { requiresAuth: true, title: "搜索结果" },
      },
      {
        path: "history",
        name: "History",
        component: () => import("@/views/History.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/Profile.vue"),
        meta: { title: "个人信息" },
      },
      {
        path: "settings",
        name: "Settings",
        component: () => import("@/views/Settings.vue"),
        meta: { title: "设置" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// 添加全局路由错误处理
router.onError((error) => {
  console.error("路由错误:", error);
});

// 添加导航守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  // 如果需要登录认证
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // 检查用户是否已登录
    if (!userStore.loginStatus) {
      // 未登录则跳转到登录页
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else {
      next();
    }
  } else {
    // 不需要登录认证的页面直接放行
    next();
  }
});

export default router;
