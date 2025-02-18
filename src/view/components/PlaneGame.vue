<template>
  <div class="planeOpt">
<!--    <button-->
<!--      ref="startButton"-->
<!--      @click="startGame"-->
<!--      :disabled="!isPlaneScriptLoaded"-->
<!--    >-->
<!--      <div class="svg-wrapper">-->
<!--        <svg-->
<!--          xmlns="http://www.w3.org/2000/svg"-->
<!--          viewBox="0 0 24 24"-->
<!--          width="24"-->
<!--          height="24"-->
<!--        >-->
<!--          <path fill="none" d="M0 0h24v24H0z"></path>-->
<!--          <path-->
<!--            fill="currentColor"-->
<!--            d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"-->
<!--          ></path>-->
<!--        </svg>-->
<!--    </button>-->

  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

// 定义一个标志，确保 plane.js 只加载一次
const isPlaneScriptLoaded = ref(false);

// 定义按钮的引用
const startButton = ref<HTMLButtonElement | null>(null);

const startGame = () => {
  // 初始化游戏对象并启动
  if (typeof window !== "undefined" && window.KICKASSGAME) {
    window.KICKASSGAME.begin();
  } else {
    console.warn("游戏脚本尚未加载完成，请稍后再试！");
  }
};

// 在组件挂载后动态加载 plane.js
onMounted(() => {
  if (typeof window !== "undefined" && !isPlaneScriptLoaded.value) {
    startGame();
    const script = document.createElement("script");
    script.src = "/plane.js"; // 使用 public 目录下的路径
    script.async = true;
    script.onload = () => {
      // 确保脚本加载完成后初始化游戏
      window.KICKASSGAME = new window.KickAss();
      isPlaneScriptLoaded.value = true; // 标记脚本加载完成

      // 启用按钮
      if (startButton.value) {
        startButton.value.disabled = false;
      }
    };
    document.head.appendChild(script);
  }
});

// 在组件卸载前清理游戏对象
onBeforeUnmount(() => {
  if (typeof window !== "undefined" && window.KICKASSGAME) {
    window.KICKASSGAME.destroy();
    window.KICKASSGAME = null;
  }
});
</script>

<style scoped>
.planeOpt kbd {
  margin: 0 3px;
  padding: 3px 5px;
  border: 1px solid #b4b4b4;
  border-radius: 3px;
  background-color: #f8f8f8;
  -webkit-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25),
    0 2px 1px 0 rgba(255, 255, 255, 0.6) inset;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25),
    0 2px 1px 0 rgba(255, 255, 255, 0.6) inset;
  color: #34495e;
  white-space: nowrap;
  font-weight: 600;
  font-size: 0.9em;
  font-family: Monaco, "Ubuntu Mono", monospace;
  line-height: 1em;
}

.planeOpt button {
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  background: #49b1f5;
  color: white;
  padding: 0.5em 1em;
  display: flex;
  align-items: center;
  border: none;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.planeOpt button span {
  display: block;
  margin-left: 0.3em;
  transition: all 0.3s ease-in-out;
}

.planeOpt button svg {
  display: block;
  transform-origin: center center;
  transition: transform 0.3s ease-in-out;
}

.planeOpt button:hover .svg-wrapper {
  animation: fly-1 0.6s ease-in-out infinite alternate;
}

.planeOpt button:hover svg {
  transform: translateX(1.2em) rotate(45deg) scale(1.1);
}

.planeOpt button:hover span {
  transform: translateX(5em);
}

.planeOpt button:active {
  transform: scale(0.95);
}
</style>
