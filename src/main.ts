import { createApp } from "vue";
import App from "./App.vue";
import "./app.css";
import { createPinia } from "pinia";
import VueLazyload from "vue-lazyload";
// @ts-ignore
import Vcode from "vue-puzzle-vcode";
import router from "@/router";

const app = createApp(App);
const pinia = createPinia();

const dayjs = require("dayjs");
dayjs().format();

// 在 Vue 应用挂载后启用反调试
app.use(router);
app.use(pinia);
app.use(Vcode);
app.use(VueLazyload);
// 添加全局图片错误处理指令
app.directive("img-fallback", {
  mounted(el, binding) {
    el.addEventListener("error", () => {
      // 替换为默认图片
      el.src =
        binding.value ||
        "http://mogullzr001.oss-cn-beijing.aliyuncs.com/2025/03/6a60b254c55c4ebca74e5423e205c4c0.jpg";
      // 防止默认图片也加载失败时无限循环
      el.onerror = null;
    });
  },
});
app.mount("#app");
