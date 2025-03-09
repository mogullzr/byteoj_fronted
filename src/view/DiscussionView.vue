<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import CardDiscussView from "@/components/Card/CardDiscussView.vue";
import MarkdownEditorView from "@/view/problems/algorithm/AceEditorView.vue";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import ChatBoxView from "@/view/AI/ChatBoxView.vue";

const problem = {
  description: "",
  problem_id: 1,
  chinese_name: "",
};

// 定义左右两个侧边栏的宽度
const leftWidth = ref("33%");
const rightWidth = ref("33%");

// 从 localStorage 中读取保存的宽度
onMounted(() => {
  const savedLeftWidth = localStorage.getItem("leftWidth");
  const savedRightWidth = localStorage.getItem("rightWidth");
  if (savedLeftWidth) leftWidth.value = savedLeftWidth;
  if (savedRightWidth) rightWidth.value = savedRightWidth;
});

let startX: number;
let startLeftWidth: number;
let startRightWidth: number;

// 处理左侧调整大小开始
const handleLeftResizeStart = (event: MouseEvent) => {
  startX = event.clientX;
  startLeftWidth = parseInt(leftWidth.value);
  document.addEventListener("mousemove", handleLeftResize);
  document.addEventListener("mouseup", handleResizeEnd);
};

// 处理左侧鼠标移动时调整大小
const handleLeftResize = (event: MouseEvent) => {
  const dx = event.clientX - startX;
  const newWidth = Math.max(100, startLeftWidth + dx);
  leftWidth.value = `${newWidth}px`;
  localStorage.setItem("leftWidth", leftWidth.value);
};

// 处理右侧调整大小开始
const handleRightResizeStart = (event: MouseEvent) => {
  startX = event.clientX;
  startRightWidth = parseInt(rightWidth.value);
  document.addEventListener("mousemove", handleRightResize);
  document.addEventListener("mouseup", handleResizeEnd);
};

// 处理右侧鼠标移动时调整大小
const handleRightResize = (event: MouseEvent) => {
  const dx = startX - event.clientX;
  const newWidth = Math.max(100, startRightWidth + dx);
  rightWidth.value = `${newWidth}px`;
  localStorage.setItem("rightWidth", rightWidth.value);
};

// 结束拖拽，移除事件监听器
const handleResizeEnd = () => {
  document.removeEventListener("mousemove", handleLeftResize);
  document.removeEventListener("mousemove", handleRightResize);
  document.removeEventListener("mouseup", handleResizeEnd);
};
</script>

<template>
  <div class="mx-20">
    <div>123</div>
  </div>
</template>

<style scoped>
body {
  margin: 20px;
  font-size: 24px;
  text-align: center;
}

.con {
  display: flex;
  height: 800px;
  flex-direction: column;
}

.top {
  display: flex;
  flex: 1;
  height: 0;
}

aside {
  position: relative;
  align-self: stretch;
  overflow: hidden;
}

main {
  flex: 1;
  align-self: stretch;
  padding: 8px;
  background-color: white;
}

section {
  position: absolute;
  inset: 0 5px 0 0;
  padding: 8px;
  overflow: auto;
  background-color: white;
}

/* 美化伸缩条 */
.resize {
  width: 12px; /* 增加宽度 */
  height: 100%;
  cursor: ew-resize;
  background-color: rgba(0, 0, 0, 0.1); /* 背景色 */
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
  border-radius: 3px; /* 圆角 */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2); /* 阴影效果 */
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

/* 添加图案 */
.resize::before {
  content: "⋮"; /* 使用 Unicode 来表示图案，类似三点菜单 */
  font-size: 18px;
  color: #1890ff;
  display: block;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

/* 当鼠标悬停时 */
.resize:hover {
  background-color: rgba(24, 144, 255, 0.5);
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.3); /* 增强阴影效果 */
}

.resize:hover::before {
  opacity: 1; /* 悬停时图标的透明度增加 */
}

/* 按下时的效果 */
.resize:active {
  background-color: rgba(24, 144, 255, 0.7);
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.4); /* 强烈的阴影 */
}

.resize:active::before {
  opacity: 0.8; /* 按下时图标的透明度稍微减弱 */
}

/* 左侧伸缩条的样式 */
.resize-left {
  left: 0;
  right: auto;
}

.line {
  position: absolute;
  top: 0;
  right: 0;
  width: 2px;
  bottom: 0;
  background-color: grey;
  opacity: 0;
  transition: 0.3s;
  pointer-events: none;
}

.resize:hover + .line,
.resize:active + .line {
  opacity: 1;
}

.resize-left + .line {
  left: 0;
  right: auto;
}

.resize-left ~ section {
  inset: 0 0 0 4px;
}

h1 {
  font-size: 32px;
  font-weight: bold;
}
</style>
