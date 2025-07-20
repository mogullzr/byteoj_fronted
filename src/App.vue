<!--  <iframe-->
<!--    v-if="isIframeEnabled"-->
<!--    :src="iframeSrc"-->
<!--    class="iframe-container"-->
<!--    @load="setupIframeListener"-->
<!--    ref="iframeRef"-->
<!--  ></iframe>-->
<!--v-else-->
<template>
  <div
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
import { computed, onBeforeMount, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
const router = useRouter();

// iframe引用
const iframeRef = ref(null);

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

// 直接注入到iframe中的脚本，监听导航事件并通知父窗口
const iframeScript = `
  // 监听路由变化
  (function() {
    let lastPath = window.location.pathname + window.location.search;
    
    // 创建一个轮询，检测URL变化
    setInterval(() => {
      const currentPath = window.location.pathname + window.location.search;
      if (currentPath !== lastPath) {
        lastPath = currentPath;
        // 通知父窗口URL已更改
        window.parent.postMessage({
          type: 'routeChange',
          path: currentPath
        }, '*');
      }
    }, 300);
    
    // 监听所有点击事件
    document.addEventListener('click', (e) => {
      // 延迟一点，等路由变化
      setTimeout(() => {
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath !== lastPath) {
          lastPath = currentPath;
          // 通知父窗口URL已更改
          window.parent.postMessage({
            type: 'routeChange',
            path: currentPath
          }, '*');
        }
      }, 100);
    });
  })();
`;

// 设置iframe监听
const setupIframeListener = () => {
  if (!iframeRef.value) return;
  
  try {
    // 注入脚本到iframe中
    const iframeDocument = iframeRef.value.contentDocument || iframeRef.value.contentWindow.document;
    const scriptElement = iframeDocument.createElement('script');
    scriptElement.textContent = iframeScript;
    iframeDocument.body.appendChild(scriptElement);
    
    console.log("已注入iframe监听脚本");
  } catch (e) {
    console.error("无法注入iframe脚本:", e);
  }
};

// 处理iframe消息
const handleIframeMessage = (event) => {
  // 接收iframe中的路由变化消息
  if (event.data && event.data.type === 'routeChange') {
    // 更新父窗口URL，但不刷新页面
    window.history.replaceState({}, '', event.data.path);
  }
};

onMounted(() => {
  // 生成一个 0 或 1 的随机数
  const ra = r(3); // 生成 1 或 2 或 3
  // 根据随机数设置 isIframeEnabled 的值
  isIframeEnabled.value = ra === 1;
  
  // 添加消息监听器
  window.addEventListener('message', handleIframeMessage);
});

onUnmounted(() => {
  // 移除消息监听器
  window.removeEventListener('message', handleIframeMessage);
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
</script>
