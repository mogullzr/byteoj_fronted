import { createApp, ref } from "vue";
import App from "./App.vue";
import "./app.css";
import { createPinia } from "pinia";
import VueLazyload from "vue-lazyload";
// @ts-ignore
import Vcode from "vue-puzzle-vcode";
import router from "@/router";

const enableAntiDebug = () => {
  // 检测断点是否被禁用
  const checkDebuggerDisabled = () => {
    let isDebuggerDisabled = false;
    (function () {
      debugger;
      isDebuggerDisabled = true;
    })();
    return isDebuggerDisabled;
  };

  // 无限 debugger
  const antiDebug = () => {
    setInterval(() => {
      (function () {
        debugger;
      })();
    }, 100);
  };

  // 检测开发者工具是否打开
  const checkDevTools = () => {
    const devtools = /./;
    devtools.toString = () => {
      return "devtools";
    };
    console.log("%c", devtools);
  };

  // 修改页面内容
  const modifyPageContent = () => {
    document.body.innerHTML =
      '<h1 style="color: red;">请关闭开发者工具以继续访问本网站！</h1>';
  };

  // 重定向到其他页面
  const redirectToOtherPage = () => {
    window.location.href = "https://www.example.com/anti-debug";
  };

  // 初始化
  if (checkDebuggerDisabled()) {
    modifyPageContent();
    redirectToOtherPage();
  }
  antiDebug();
  setInterval(checkDevTools, 1000);
};

const app = createApp(App);
const pinia = createPinia();

const dayjs = require("dayjs");
// 3. 启用全局反调试
enableAntiDebug();

dayjs().format();
app.use(router);
app.use(pinia);
app.use(Vcode);
app.use(VueLazyload);

// app.use(showdown);

// app.directive("highlight", function (el) {
//   let blocks = el.querySelectorAll("pre code");
//   blocks.forEach((block) => {
//     hljs.highlightBlock(block);
//   });
// });

app.mount("#app");
