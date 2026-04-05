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
  ><div id="turnstile-widget"></div>
    <basic-layout class="font-lazy" />
    <div id="global-alert-container"></div>
  </div>
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
}
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

// 新增：WebSocket 告警监听相关
let ws = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5; // 最大重连次数
const RECONNECT_DELAY_BASE = 3000; // 基础延迟 3 秒
let reconnectTimer = null;
let isManualClose = false; // 标记是否手动关闭

const showSimpleAlert = (msg) => {
  const container = document.getElementById('global-alert-container');
  if (!container) return;

  const alertDiv = document.createElement('div');
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fff3f3;
    color: #c62828;
    border-left: 4px solid #d32828;
    padding: 12px 16px;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    max-width: 400px;
    white-space: pre-wrap;
    animation: slideIn 0.3s ease;
  `;
  alertDiv.textContent = msg;
  container.appendChild(alertDiv);

  // 5秒后自动消失
  setTimeout(() => {
    alertDiv.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      if (alertDiv.parentNode) alertDiv.parentNode.removeChild(alertDiv);
    }, 300);
  }, 5000);
};

const connectWebSocket = () => {
  const userUuid = useStore.loginUser.uuid; // ←← 获取登录用户的 UUID
  if (!userUuid) {
    console.warn('未登录，不建立告警连接');
    return;
  }

  // 如果已经手动关闭，不再重连
  if (isManualClose) {
    console.log('已手动关闭连接，不再重连');
    return;
  }

  // 限制重连次数
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('⚠️ 达到最大重连次数，停止重连');
    showSimpleAlert('⚠️ 告警服务连接失败，请刷新页面重试');
    return;
  }

  // 通过 URL 参数传递 uuid（也可用 header，但 WebSocket 不支持自定义 header）
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/alerts`;
  
  console.log(`🔌 正在连接 WebSocket (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
  
  try {
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ 已连接监考告警服务');
      reconnectAttempts = 0; // 重置重连计数
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ALERT') {
          showSimpleAlert(`🚨 ${data.message}`);
        }
      } catch (e) {
        console.error('WebSocket 消息解析失败:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('⚠️ WebSocket 连接错误:', error);
      // 错误时主动关闭，触发 onclose 进行重连
      if (ws) {
        ws.close();
      }
    };

    ws.onclose = (event) => {
      console.log(`🔌 告警连接已断开 (code: ${event.code}, reason: ${event.reason})`);
      
      // 如果不是手动关闭，则尝试重连
      if (!isManualClose) {
        reconnectAttempts++;
        // 指数退避策略：每次延迟时间递增
        const delay = RECONNECT_DELAY_BASE * Math.pow(2, reconnectAttempts - 1);
        console.log(`⏳ ${delay/1000}秒后第${reconnectAttempts}次重连...`);
        
        reconnectTimer = setTimeout(() => {
          connectWebSocket();
        }, delay);
      }
    };
  } catch (error) {
    console.error('❌ 创建 WebSocket 失败:', error);
    reconnectAttempts++;
    reconnectTimer = setTimeout(() => {
      connectWebSocket();
    }, RECONNECT_DELAY_BASE);
  }
};

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
  // 确保 window.turnstile 已加载
  if (window.turnstile) {
    window.turnstile.render('#turnstile-widget', {
      sitekey: "0x4AAAAAACzOvrGS3pashnof",
      theme: "auto",
      size: "normal",
      callback: (token) => {
        console.log("验证成功，Token:", token);
        // 处理验证成功的逻辑
      },
      'error-callback': (err) => {
        console.error("验证出错:", err);
      }
    });
  }
  // 生成一个 0 或 1 的随机数
  const ra = r(3); // 生成 1 或 2 或 3
  // 根据随机数设置 isIframeEnabled 的值
  isIframeEnabled.value = ra === 1;
  
  // 添加消息监听器
  window.addEventListener('message', handleIframeMessage);

  // 启动 WebSocket 告警监听（仅管理员需要？可加判断）
  connectWebSocket();

});

onUnmounted(() => {
  // 标记为手动关闭，阻止重连
  isManualClose = true;
  
  // 清除重连定时器
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  // 关闭 WebSocket 连接
  if (ws) {
    ws.close();
    ws = null;
  }
  
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
