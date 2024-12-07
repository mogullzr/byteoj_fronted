<script setup lang="ts">
import { onMounted, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import showdown from "showdown";
import "mathjax-full/es5/tex-svg-full";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import { ProblemAlgorithmControllerService } from "../../../../generated";
import UserStore from "@/store/user";
import MarkdownEditorView from "@/view/problems/algorithm/AceEditorView.vue";
import { Ref } from "vue/dist/vue";

let converter = new showdown.Converter();
const htmlText = ref("");
// 显示表格
const MathJax = ref({
  tex: {
    inlineMath: [
      ["$", "$"],
      ["\\(", "\\)"],
    ],
  },
});
const content = ref("12312123");
const router = useRouter();
const useStore = UserStore();
const path = router.currentRoute.value.fullPath;
const problem_id: Ref<any> = ref(path.toString().split("/")[3]);
const problem: any = ref({});
const difficulty_list = useStore.difficulty_list;
const color_list = useStore.color_list;
const flag = ref(0);
const isShow = ref(localStorage.getItem("EditorStatus"));
const isTransform: Ref<number> = ref(
  localStorage.getItem("ControlBlock") != null
);
const current_width: Ref<any> = ref(
  localStorage.getItem("ControlBlock") == null
    ? 670
    : parseInt(localStorage.getItem("ControlBlock"))
);

const problem_url: Ref<string> = ref("");
const problem_name: Ref<string> = ref("");

onMounted(async () => {
  if (!isShow.value) {
    isShow.value = "0";
    localStorage.setItem("EditorStatus", "0");
  }
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
      await router.push("/404");
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

  // 设置题目记录
  await ProblemAlgorithmControllerService.problemAlgorithmSetUserLastUsingGet(
    0,
    problem_name.value,
    problem_url.value
  );
});

//
onBeforeRouteLeave(() => {
  localStorage.removeItem("ControlBlock");
});

// 点击是否展开知识点
const click = () => {
  if (problem.value.algorithm_tags.length === 0) {
    return;
  }
  let buttonClick: any = document.getElementById("tags");

  if (!flag.value) {
    buttonClick.style.display = "block";
    flag.value = 1;
  } else {
    buttonClick.style.display = "none";
    flag.value = 0;
  }
};

// 在页面刷新的时候记录一下
</script>

<template>
  <div class="flex">
    <div :class="isShow === '1' ? 'column-left' : ''">
      <div
        v-if="isShow === '0' || (isShow === '1' && !isTransform)"
        :class="
          'rounded-box p-8 my-8 w-full ' + (isShow === '1' ? 'resize-save' : '')
        "
      >
        <div
          class=""
          :style="isShow === '1' ? 'overflow-y: auto; max-height: 80vh' : ''"
        >
          <!-- 添加滚动条 -->
          <h1>
            {{ problem.problem_id ?? problem.index }}.{{ problem.chinese_name }}
          </h1>
          <div class="flex">
            <div
              class="w-full"
              :style="isShow == '1' ? 'max-width: 670px' : 'width: 900px'"
            >
              <MarkdownView :generateData="problem.description" />
            </div>
            <div class="flex-1 float-right"></div>
            <div v-if="isShow === '0'" class="float-right">
              <table class="table w-72">
                <!-- head -->

                <tbody style="font-size: 16px">
                  <!-- row 1 -->
                  <tr>
                    <td>
                      <span style="float: left">难度:</span>
                      <span
                        :class="
                          'text-white ' +
                          color_list[difficulty_list[problem.difficulty_name]]
                        "
                        style="float: right"
                        >{{ problem.difficulty_name }}</span
                      >
                    </td>
                  </tr>
                  <!-- row 2 -->
                  <tr class="bg-gray-100">
                    <td>
                      <span style="float: left">时/空限制</span>
                      <span style="float: right"
                        >{{ problem.cpu_limit }}s/{{
                          problem.memory_limit
                        }}MB</span
                      >
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span style="float: left">总通过次数：</span>
                      <span style="float: right">{{ problem.ac_total }}</span>
                    </td>
                  </tr>
                  <tr class="bg-gray-100">
                    <td>
                      <span style="float: left">总尝试次数：</span>
                      <span style="float: right">{{ problem.test_total }}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style="float: left">来源：</div>
                      <div
                        class="badge"
                        style="float: right"
                        v-if="problem.source != null"
                      >
                        {{ problem.source }}
                      </div>
                      <div class="badge" style="float: right" v-else>无</div>
                    </td>
                  </tr>
                  <tr class="bg-gray-100">
                    <td>
                      <button class="badge" style="float: left" @click="click">
                        算法标签
                        <span>
                          <svg
                            v-if="problem.algorithm_tags != null && flag == 0"
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="#666666"
                              d="M8.12 9.29L12 13.17l3.88-3.88a.996.996 0 1 1 1.41 1.41l-4.59 4.59a.996.996 0 0 1-1.41 0L6.7 10.7a.996.996 0 0 1 0-1.41c.39-.38 1.03-.39 1.42 0"
                            />
                          </svg>
                          <svg
                            v-else-if="flag == 1"
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="#666666"
                              d="M8.12 14.71L12 10.83l3.88 3.88a.996.996 0 1 0 1.41-1.41L12.7 8.71a.996.996 0 0 0-1.41 0L6.7 13.3a.996.996 0 0 0 0 1.41c.39.38 1.03.39 1.42 0"
                            />
                          </svg>
                        </span>
                      </button>
                      <br />
                      <div id="tags" style="display: none">
                        <button
                          v-for="tag in problem.algorithm_tags"
                          :key="tag"
                          class="badge mt-3"
                        >
                          {{ tag }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-if="isShow === '0' || isShow == null">
            <MarkdownEditorView />
          </div>
        </div>
      </div>
      <div
        class="resize-bar"
        :style="'margin-left: ' + current_width + 'px'"
        v-if="isShow === '1' && !isTransform"
      ></div>
    </div>
    <div class="w-full rounded-box p-8 m-8 column-right" v-if="isShow === '1'">
      <MarkdownEditorView />
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: 32px;
  font-weight: bold;
}

.column-left {
  position: relative;
  float: left;
}
.column-right {
  box-sizing: border-box;
}

.overlay {
  position: fixed; /* 固定定位 */
  top: 0px;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999999999; /* 确保在最顶层 */
}
</style>
