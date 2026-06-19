<script setup lang="ts">
import axios from "axios";
import { onMounted, ref } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import showdown from "showdown";
import "mathjax-full/es5/tex-svg-full";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import {
  ProblemAlgorithmControllerService,
  UserLastEnter,
} from "../../../../generated";
import UserStore from "@/store/user";
import MarkdownEditorView from "@/view/problems/algorithm/AceEditorView.vue";
import { Ref } from "vue/dist/vue";
import { useMessageBox } from "@/view/components/alert/useMessageBox";

let converter = new showdown.Converter();
// 是否显示AI问答页面
const isBot: Ref<boolean> = ref(localStorage.getItem("isBot") == "true");

const content = ref("");
const router = useRouter();
const useStore = UserStore();
const path = router.currentRoute.value.fullPath;
const problem_id: Ref<any> = ref(path.toString().split("/")[3]);
const problem: any = ref({});
const difficulty_list = useStore.difficulty_list;
const color_list = useStore.color_list;
const flag = ref(0);
const problem_url: Ref<string> = ref("");
const problem_name: Ref<string> = ref("");
const isAddingWrongBook = ref(false);
const { success, error } = useMessageBox();

const wrongBookHttp = axios.create({
  baseURL: "https://www.byteoj.com",
  withCredentials: true,
});

wrongBookHttp.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem("sessionId");
  if (sessionId) {
    config.headers["X-Session-Id"] = sessionId;
  }
  return config;
});

onMounted(async () => {
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

const showBot = () => {
  isBot.value = !isBot.value;
  localStorage.setItem("isBot", String(isBot.value));
};

const addToWrongBook = async () => {
  if (!problem.value?.problem_id || isAddingWrongBook.value) return;
  isAddingWrongBook.value = true;
  try {
    const res = await wrongBookHttp.post("/api/problem/wrong-book/add", {
      problem_id: problem.value.problem_id,
      problem_status: 3,
      option_type: 4,
      answer: "",
      score: 100,
      total_score: 100,
      ai_advise: "手动收藏到错题本。",
    });
    if (res?.data?.code !== 0) {
      throw new Error(res?.data?.message || "加入错题本失败");
    }
    success("已加入错题本");
  } catch (err: any) {
    console.error(err);
    error(err?.message || "加入错题本失败");
  } finally {
    isAddingWrongBook.value = false;
  }
};
</script>

<template>
  <div class="flex">
    <div>
      <div class="rounded-box p-8 my-8 w-full">
        <div>
          <div class="problem-title-row">
            <h1>
              {{ problem.problem_id ?? problem.index }}.{{ problem.chinese_name }}
            </h1>
            <button class="wrong-book-btn" :disabled="isAddingWrongBook" @click="addToWrongBook">
              <i class="fas fa-bookmark"></i>
              {{ isAddingWrongBook ? "加入中..." : "加入错题本" }}
            </button>
          </div>
          <div class="flex">
            <div class="w-full" style="width: 800px">
              <MarkdownView :generateData="problem.description" />
            </div>
            <div class="flex-1 float-right"></div>
            <div class="float-right">
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
                  <tr class="bg-gray-50">
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
                  <tr class="bg-gray-50">
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
                  <tr class="bg-gray-50">
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
          <div>
            <MarkdownEditorView @toggle-bot="showBot" :status="1" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: 32px;
  font-weight: bold;
}

.problem-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.wrong-book-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #fde68a;
  background: #f59e0b;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(245, 158, 11, 0.2);
  transition: all 0.2s;
}

.wrong-book-btn:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-1px);
}

.wrong-book-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
