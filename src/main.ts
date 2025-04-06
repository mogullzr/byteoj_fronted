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
app.mount("#app");
