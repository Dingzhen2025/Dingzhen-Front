import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router"; // 导入创建的 router

createApp(App).use(router).mount("#app");
