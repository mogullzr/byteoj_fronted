import { createApp } from "vue";
import App from "./App.vue";
import "./app.css";
import { createPinia } from "pinia";
import VueLazyload from "vue-lazyload";
// @ts-ignore
import Vcode from "vue-puzzle-vcode";
import router from "@/router";,

const app = createApp(App);
const pinia = createPinia();

const dayjs = require("dayjs");
dayjs().format();

const antiDebugPlugin = {
  install() {
    // 动态生成多条件 debugger 模式
    const generateDebugMode = () => {
      const conditions = [
        () => Math.random() > 0.5,
        () => new Date().getSeconds() % 2 === 0,
        () => navigator.userAgent.includes("Chrome"),
        () => window.innerWidth > 1024,
        () => localStorage.getItem("debug") === "true",
        () => performance.now() > 1000,
        () => document.querySelector("body") !== null,
        () => typeof window.console !== "undefined",
        () => window.location.href.includes("example.com"),
        () => Math.floor(Math.random() * 10) > 5,
      ];

      // 随机选择 3 到 5 个条件
      const selectedConditions = conditions
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 3);

      // 随机插入 debugger 的位置
      const debuggerPositions = [
        "console.log('Debugger condition 1');",
        "console.log('Debugger condition 2');",
        "console.log('Debugger condition 3');",
        "console.log('Debugger condition 4');",
        "console.log('Debugger condition 5');",
      ];

      // 随机选择 1 到 3 个位置
      const selectedPositions = debuggerPositions
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 1);

      // 构建代码
      let code = "";
      selectedConditions.forEach((condition, index) => {
        code += `if (${condition.toString()}) { ${
          selectedPositions[index % selectedPositions.length]
        } debugger; }\n`;
      });

      return code;
    };

    // 动态插入 debugger
    const dynamicDebugger = () => {
      const randomTime = Math.floor(Math.random() * 1000) + 500; // 随机时间间隔
      setInterval(() => {
        try {
          const debugMode = generateDebugMode();
          new Function(debugMode)(); // 使用 new Function 代替 eval
        } catch (e) {
          console.error("Anti-debug error:", e);
        }
      }, randomTime);
    };

    // 初始化
    dynamicDebugger();
  },
};

// 在 Vue 应用挂载后启用反调试
app.use(router);
app.use(pinia);
app.use(Vcode);
app.use(VueLazyload);
app.use(antiDebugPlugin); // 使用反调试插件
app.mount("#app");
