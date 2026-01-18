// main.ts
import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router";
import 'element-plus/es/components/image-viewer/style/css'
import dayjs from "dayjs";

const app = createApp(App);
const pinia = createPinia();
dayjs().format();
app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(router);
app.use(pinia);
app.mount("#app");
