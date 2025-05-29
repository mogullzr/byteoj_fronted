<template>
  <div class="player-wrapper" v-if="videoLoaded">
    <div id="J_prismPlayer" class="prism-player"></div>
    <!-- 跳转时间提示框 -->
    <div id="seek-tooltip" class="seek-tooltip" v-show="showSeekTooltip">
      {{ seekTooltipText }}
    </div>
  </div>
  <div class="video-not-found" v-else>
    <div class="error-container">
      <div class="error-icon">
        <i class="icon-exclamation">!</i>
      </div>
      <h2>视频不存在</h2>
      <p>抱歉，您请求的视频资源无法加载</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, onUnmounted } from "vue";
import ProblemAlgorithmVideo from "@/view/problems/algorithm/ProblemAlgorithmVideo.vue";
import { ProblemAlgorithmControllerService } from "../../../../generated";
import { useRoute, useRouter } from "vue-router";
import { useMessageBox } from "@/view/components/alert/useMessageBox";
import aliplayerJS from "@/assets/aliplayer-min.js";
import aliplayerCSS from "@/assets/aliplayer-min.css";

const videoLoaded = ref(true);
let route = useRoute();
const router = useRouter();
const showSeekTooltip = ref(false);
const seekTooltipText = ref("");
let problem_id = Number(route.path.split("/")[3]);

// 动态加载资源
const loadResources = () => {
  return new Promise((resolve) => {
    if (!window.Aliplayer) {
      // 加载JS
      const script = document.createElement("script");
      script.src = "/assets/aliplayer-min.js"; // 使用项目中的路径
      script.onload = resolve;
      document.head.appendChild(script);
      loadedResource.value.push(script);

      // 加载CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/assets/aliplayer-min.css";
      document.head.appendChild(link);
      loadedResource.value.push(link);
    } else {
      resolve();
    }
  });
};

let player = null;
const loadedResource = ref([]); // 用于跟踪已加载的资源
const { success, error, warning } = useMessageBox();

// 带提示的跳转函数
// 在组件顶部添加一个定时器引用
const seekTimer = ref(null);

// 改进后的带提示跳转函数
const seekWithTooltip = (time) => {
  try {
    // 清除之前的定时器
    if (seekTimer.value) {
      clearTimeout(seekTimer.value);
      seekTimer.value = null;
    }

    // 检查播放器是否可用
    if (!player || typeof player.seek !== "function") {
      console.warn("播放器未准备好");
      return;
    }

    // 格式化时间
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    seekTooltipText.value = `跳转到 ${minutes}:${
      seconds < 10 ? "0" + seconds : seconds
    }`;

    // 显示提示
    showSeekTooltip.value = true;

    // 执行跳转（添加错误处理）
    try {
      player.seek(time);
    } catch (e) {
      console.error("跳转失败:", e);
      showSeekTooltip.value = false;
      return;
    }

    // 设置定时器隐藏提示
    seekTimer.value = setTimeout(() => {
      showSeekTooltip.value = false;
      seekTimer.value = null;
    }, 3000);
  } catch (e) {
    console.error("跳转过程中出错:", e);
    showSeekTooltip.value = false;
  }
};
const loadVideoResource = async () => {
  const response = await ProblemAlgorithmControllerService.aliyunVodGetUsingGet(
    problem_id
  );
  if (response.code === 0) {
    videoLoaded.value = true;
    return response.data;
  } else {
    videoLoaded.value = false;
    return null;
  }
};

// 清理资源的函数
const cleanupResources = () => {
  // 销毁播放器实例
  if (player) {
    player.dispose();
    player = null;
  }

  // 移除动态加载的资源
  loadedResource.value.forEach((resource) => {
    if (resource.parentNode) {
      resource.parentNode.removeChild(resource);
    }
  });
  loadedResource.value = [];

  // 清除全局变量
  if (window.Aliplayer) {
    delete window.Aliplayer;
  }
};

onMounted(async () => {
  await loadResources();
  let videoInfo = await loadVideoResource();

  if (videoInfo) {
    player = new Aliplayer(
      {
        id: "J_prismPlayer",
        vid: videoInfo.vid,
        playauth: videoInfo.playauth,
        cover: "",
        width: "100%",
        height: "100%",
        encryptType: 1,
      },
      () => {
        // 播放器创建完成后的回调
        console.log("播放器已创建");
      }
    );

    // 监听ready事件
    player.on("ready", () => {
      console.log("播放器已准备好");
      // 在这里执行跳转
      let seekTime = localStorage.getItem(`${problem_id}-video`);
      if (seekTime) {
        seekWithTooltip(parseInt(Number(seekTime)));
      }
    });

    window.addEventListener("resize", handleResize);
    handleResize();
  }
});

onBeforeUnmount(() => {
  if (player) {
    console.log(player);
    localStorage.setItem(`${problem_id}-video`, player._TimeUpdateStamp);
    player.dispose();
  }
  // cleanupResources();
  window.removeEventListener("resize", handleResize);
});

// 响应式调整
const handleResize = () => {
  const wrapper = document.querySelector(".player-wrapper");
  if (wrapper) {
    const width = wrapper.clientWidth;
    const height = width * (9 / 16);
    wrapper.style.height = `${height}px`;
  }
};
</script>

<style scoped>
.player-wrapper {
  width: 100%;
  position: relative;
  padding-top: 56.25%; /* 16:9 比例 */
}

.prism-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* 跳转提示框样式 */
.seek-tooltip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 16px;
  z-index: 100;
  pointer-events: none;
  animation: fadeInOut 3s ease-in-out forwards;
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.video-not-found {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.error-container {
  text-align: center;
  padding: 30px;
}

.error-icon {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background-color: #ff4d4f;
  border-radius: 50%;
}

.icon-exclamation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-style: normal;
  font-size: 40px;
  font-weight: bold;
  color: white;
}

.error-container h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.error-container p {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}
</style>
