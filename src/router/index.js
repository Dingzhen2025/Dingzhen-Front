import { createRouter, createWebHashHistory } from "vue-router";

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
    path: "/main",
    name: "Layout",
    component: () => import("@/views/Layout.vue"),
    redirect: "/main/select",
    children: [
      {
        path: "select",
        name: "Select",
        component: () => import("@/views/Select.vue"),
        meta: { title: "选择图片库" },
      },
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/Home.vue"),
        meta: { title: "主页" },
      },
      {
        path: "search-result",
        name: "SearchResult",
        component: () => import("@/views/SearchResult.vue"),
        meta: { title: "搜索结果" },
      },
      {
        path: "history",
        name: "History",
        component: () => import("@/views/History.vue"),
        meta: { title: "搜索历史" },
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
  history: createWebHashHistory(),
  routes,
});

export default router;
