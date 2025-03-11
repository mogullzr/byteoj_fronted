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

// 全局反调试逻辑
const enableAntiDebug = () => {
  let isDebugging = false;

  // 检测开发者工具是否打开
  const checkDevTools = () => {
    const devtools = /./;
    devtools.toString = () => {
      isDebugging = true;
      return "devtools";
    };
    console.log("%c", devtools);
  };

  // 无限 debugger
  const antiDebug = () => {
    setInterval(() => {
      if (isDebugging) {
        (function () {
          debugger;
        })();
      }
    }, 100);
  };

  // 关闭浏览器
  const closeBrowser = () => {
    try {
      window.location.href = "about:blank";
      window.close(); // 尝试关闭浏览器
    } catch (e) {
      // 如果关闭失败，重定向到空白页面或提示页面
      window.location.href = "about:blank";
    }
  };

  // 检测断点是否被取消
  const checkDebuggerDisabled = () => {
    let isDebuggerDisabled = false;
    (function () {
      debugger;
      isDebuggerDisabled = true;
    })();
    return isDebuggerDisabled;
  };

  // 初始化
  checkDevTools();
  antiDebug();

  // 检测断点是否被取消
  setInterval(() => {
    if (isDebugging && checkDebuggerDisabled()) {
      closeBrowser();
    }
  }, 1000);
};

// 在 Vue 应用挂载后启用反调试
app.use(router);
app.use(pinia);
app.use(Vcode);
app.use(VueLazyload);
app.mount("#app");

// 启用反调试
enableAntiDebug();
