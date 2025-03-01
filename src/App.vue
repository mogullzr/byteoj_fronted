<template>
  <iframe
    v-if="isIframeEnabled"
    :src="iframeSrc"
    class="iframe-container"
  ></iframe>
  <div
    v-else
    class="background-container"
    :style="
      'background-image: url(' + useStore.loginUser.background_picture + ')'
    "
  >
    <basic-layout class="font-lazy" />
  </div>
</template>

<style scoped>
.background-container {
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont;
  /* 背景图片固定 */
  background-attachment: fixed;
  /* 背景图片覆盖整个容器 */
  background-size: cover;
  /* 背景图片居中 */
  background-position: center;
  /* 背景图片不重复 */
  background-repeat: no-repeat;
  /* 容器高度设置为100vh，确保背景图片覆盖整个视口 */
  min-height: 100vh;
  /* 容器宽度设置为100% */
  width: 100%;
  /* 其他样式 */
  justify-content: center;
  align-items: center;
  /* 确保背景容器覆盖整个视口 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 确保背景容器在其他内容之下 */
  z-index: -1;
}
.iframe-container {
  width: 100%;
  height: calc(100vh); /* 根据你的布局调整高度 */
  border: none;
}
</style>
<script setup>
import BasicLayout from "@/layout/BasicLayout.vue";
import UserStore from "@/store/user";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
// 随机数生成方法
const r = (function () {
  const today = new Date();
  let seed = today.getTime();
  function rnd() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280.0;
  }
  return function rand(number) {
    return Math.ceil(rnd() * number);
  };
})();

// 控制是否启用 iframe
const isIframeEnabled = ref(false);

onMounted(() => {
  // 生成一个 0 或 1 的随机数
  const ra = r(3); // 生成 1 或 2 或 3
  // 根据随机数设置 isIframeEnabled 的值
  isIframeEnabled.value = ra === 1;
});
// 找路由
const route = useRoute();
const useStore = UserStore();

// 动态计算 iframe 的 src
const iframeSrc = computed(() => {
  return `${window.location.origin}${route.fullPath}`;
});

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 200);
    super(callback);
  }
};

// 1. 禁止 F12 按键
const disableF12 = (event) => {
  if (
    event.key === "F12" || // F12
    (event.ctrlKey &&
      event.shiftKey &&
      (event.key === "I" || event.key === "i")) || // Ctrl + Shift + I
    (event.ctrlKey &&
      event.shiftKey &&
      (event.key === "J" || event.key === "j")) || // Ctrl + Shift + J
    (event.ctrlKey && (event.key === "U" || event.key === "u")) // Ctrl + U
  ) {
    event.preventDefault();
  }
};

// 2. 检测开发者工具是否打开
const detectDevTools = () => {
  const devToolsOpened = () => {
    const widthThreshold = window.outerWidth - window.innerWidth >= 500;
    const heightThreshold = window.outerHeight - window.innerHeight >= 300;
    return widthThreshold || heightThreshold;
  };

  console.log(devToolsOpened());
  if (devToolsOpened()) {
    // 3. 强制关闭页面
    window.location.href =
      "https://www.rzcode.top/2024/05/29/%E7%88%AC%E8%99%AB%E5%AD%A6%E4%B9%A0%E2%80%94%E2%80%94%E7%88%AC%E8%99%AB%E5%AD%A6%E4%B9%A0%E5%9F%BA%E7%A1%80%E7%AF%87/";
  }
};

// 监听键盘事件
onMounted(() => {
  document.addEventListener("keydown", disableF12);
  // 定期检测开发者工具
  const interval = setInterval(detectDevTools, 1000);
  // 组件卸载时清除定时器和事件监听
  onUnmounted(() => {
    document.removeEventListener("keydown", disableF12);
    clearInterval(interval);
  });
});
</script>
