<script setup lang="ts">
import { ref, onMounted, Ref } from "vue";
import MarkdownEditorView from "@/view/problems/algorithm/AceEditorView.vue";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import router from "@/router";
import {
  ProblemAlgorithmControllerService,
  UserLastEnter,
} from "../../../../generated";

const path = router.currentRoute.value.fullPath;
const problem_id: Ref<any> = ref(path.toString().split("/")[3]);
const problem: any = ref({});
// 是否显示AI问答页面
const isBot: Ref<boolean> = ref(localStorage.getItem("isBot") == "true");

// 定义左右两个侧边栏的宽度
const leftWidth = ref("33%");
const rightWidth = ref("33%");
const flag = ref(0);
const problem_url: Ref<string> = ref("");
const problem_name: Ref<string> = ref("");

// 从 localStorage 中读取保存的宽度
onMounted(async () => {
  const savedLeftWidth = localStorage.getItem("leftWidth");
  const savedRightWidth = localStorage.getItem("rightWidth");
  if (savedLeftWidth) leftWidth.value = savedLeftWidth;
  else leftWidth.value = String(window.innerWidth * 0.33);
  if (savedRightWidth) rightWidth.value = savedRightWidth;
  else rightWidth.value = String(window.innerWidth * 0.33);
  if (problem_id?.value != "problem") {
    problem_id.value = parseInt(problem_id?.value);
    const res =
      await ProblemAlgorithmControllerService.problemAlgorithmSearchByProblemIdUsingPost(
        problem_id.value
      );

    if (res.code === 0) {
      problem.value = res.data;
      window.document.title =
        problem_id.value + "." + problem.value.chinese_name + " - ByteOJ题库";
      problem_url.value = "/problems/algorithm/" + problem_id.value;
    } else if (res.code === 40101) {
      router.replace("/404");
    }
    problem_name.value = problem_id.value + "." + problem.value.chinese_name;
  } else {
    let competition_id = parseInt(path.toString().split("/")[2]);
    let index = path.toString().split("/")[4];
    const res =
      await ProblemAlgorithmControllerService.competitionSearchProblemUsingPost(
        competition_id,
        index
      );
    if (res.code === 0) {
      problem.value = res.data;
      window.document.title =
        problem_id.value + "." + problem.value.chinese_name + " - ByteOJ题库";
      problem_url.value =
        "/competition/" + competition_id + "/problem/" + index;
      problem_name.value = index + "." + problem.value.chinese_name;
    }
  }

  const userLastEnter: Ref<UserLastEnter> = ref({
    problem_name: problem_name.value,
    url: problem_url.value,
  } as UserLastEnter);
  // 设置题目记录
  await ProblemAlgorithmControllerService.problemAlgorithmSetUserLastUsingPost(
    userLastEnter.value
  );
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
  let newWidth = Math.max(50, startLeftWidth + dx);
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
  let newWidth = Math.max(50, startRightWidth + dx);
  rightWidth.value = `${newWidth}px`;
  localStorage.setItem("rightWidth", rightWidth.value);
};

// 结束拖拽，移除事件监听器
const handleResizeEnd = () => {
  document.removeEventListener("mousemove", handleLeftResize);
  document.removeEventListener("mousemove", handleRightResize);
  document.removeEventListener("mouseup", handleResizeEnd);
};

//
const showBot = () => {
  isBot.value = !isBot.value;
  localStorage.setItem("isBot", String(isBot.value));
};
</script>

<template>
  <div>
    <div class="con rounded-box w-full bg-white p-6">
      <div class="top">
        <aside :style="{ width: leftWidth }">
          <div class="resize" @mousedown="handleLeftResizeStart"></div>
          <div class="line"></div>
          <div>
            <div>
              <section>
                <h1>
                  {{ problem.problem_id ?? problem.index }}.{{
                    problem.chinese_name
                  }}
                </h1>
                <div>
                  <MarkdownView :generateData="problem.description" />
                </div>
              </section>
            </div>
          </div>
        </aside>
        <main>
          <MarkdownEditorView @toggle-bot="showBot" :status="1" />
        </main>
        <!--        <aside v-if="isBot" class="right" :style="{ width: rightWidth }">-->
        <!--          <div class="resize resize-left" @mousedown="handleRightResizeStart"></div>-->
        <!--          <div class="line"></div>-->
        <!--          <section>-->
        <!--            <ChatBoxView :description="problem.description"/>-->
        <!--          </section>-->
        <!--        </aside>-->
      </div>
    </div>
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
  min-height: 800px;
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
  margin: 20px 20px 0;
}
</style>
