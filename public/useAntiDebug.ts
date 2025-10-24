import { onMounted } from "vue";

export const useAntiDebug = () => {
  let isDebugging = false;

  // 检测开发者工具是否打开
  const checkDevTools = () => {
    const devtoolsCheck = () => {};

    // 每隔 1 秒检测一次
    setInterval(devtoolsCheck, 1000);
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
  // 无限 debugger
  const antiDebug = () => {
    setInterval(() => {
      const startTime = performance.now();
      debugger;
      const endTime = performance.now();
      if (endTime - startTime > 100) {
        closeBrowser();
      }
    }, 1000);
  };

  // 检测断点是否被禁用
  const checkBreakpointDisabled = () => {
    let isDisabled = false;
    (function () {
      debugger;
      isDisabled = true;
    })();
    return isDisabled;
  };

  // 如果断点被禁用，触发额外反制措施
  const handleBreakpointDisabled = () => {
    setInterval(() => {
      if (isDebugging && checkBreakpointDisabled()) {
        window.location.href = "about:blank"; // 重定向到空白页面
      }
    }, 2000);
  };

  // 初始化反调试逻辑
  const initAntiDebug = () => {
    checkDevTools();
    antiDebug();
    handleBreakpointDisabled();
  };

  // 在组件挂载后执行
  onMounted(() => {
    initAntiDebug();
  });
};
