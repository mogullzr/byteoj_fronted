<script setup lang="ts">
import { onMounted, reactive, Ref, ref } from "vue";
import { useRouter } from "vue-router";
import showdown from "showdown";
import "mathjax-full/es5/tex-svg-full";
import MarkdownEditorView from "@/view/Markdown/MarkdownView.vue";
import {
  ProblemAlgorithmBankVo,
  ProblemAlgorithmControllerService,
  ProblemMath408BankVo,
  ProblemMath408ControllerService,
} from "../../../../generated";
import UserStore from "@/store/user";
import type { Ace } from "ace-builds";

import { VAceEditor } from "vue3-ace-editor";
import "ace-builds";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-chrome";
import "ace-builds/src-noconflict/snippets/json";
import "ace-builds/src-noconflict/ext-language_tools";

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
const router = useRouter();
const useStore = UserStore();
// 编辑器配置项
const options: Partial<Ace.EditorOptions> = reactive({
  useWorker: true, // 启用语法检查,必须为true
  enableBasicAutocompletion: true, // 自动补全
  enableLiveAutocompletion: true, // 智能补全
  enableSnippets: true, // 启用代码段
  showPrintMargin: false, // 去掉灰色的线，printMarginColumn
  highlightActiveLine: true, // 高亮行
  highlightSelectedWord: true, // 高亮选中的字符
  tabSize: 4, // tab锁进字符
  fontSize: 14, // 设置字号
  wrap: false, // 是否换行
  readonly: false, // 是否可编辑
  // minLines: 10, // 最小行数，minLines和maxLines同时设置之后，可以不用给editor再设置高度
  // maxLines: 50, // 最大行数
});

const path = router.currentRoute.value.fullPath;
const problem_id = ref(parseInt(path.toString().split("/")[3]));
const problem: Ref<ProblemMath408BankVo> = ref({} as ProblemAlgorithmBankVo);
const difficulty_list = useStore.difficulty_list;
const color_list = useStore.color_list;
const flag = ref(0);

onMounted(async () => {
  console.log(problem_id.value);

  const res =
    await ProblemMath408ControllerService.problemMath408SearchByProblemIdUsingPost(
      problem_id.value
    );

  if (res.code === 0) {
    problem.value = res.data;
    console.log(problem.value);
  } else if (res.code === 40101) {
    router.push("/404");
  }
});

// 点击是否展开知识点
const click = () => {
  if (problem.value.tag_list?.length === 0) {
    return;
  }
  console.log(problem.value);
  let buttonClick: any = document.getElementById("tags");
  if (!flag.value) {
    buttonClick.style.display = "block";
    flag.value = 1;
  } else {
    buttonClick.style.display = "none";
    flag.value = 0;
  }
};
</script>
<template>
  <div class="card-body mt-4 mx-40 h-30 bg-base-100 shadow-xl rounded-box">
    <div class="overflow-x-auto">
      <h1>{{ problem.problem_id }}.{{ problem.problem_name }}</h1>
      <div class="flex">
        <MarkdownEditorView :generateData="problem.description" />
        <div>
          <table class="table table-zebra w-72">
            <!-- head -->

            <tbody style="font-size: 16px" class="border-2">
              <!-- row 1 -->
              <tr>
                <td>
                  <span style="float: left">难度:</span>
                  <span
                    :class="
                      color_list[difficulty_list[problem.difficulty_name]]
                    "
                    style="float: right"
                    >{{ problem.difficulty_name }}</span
                  >
                </td>
              </tr>
              <!-- row 2 -->
              <tr>
                <td>
                  <span style="float: left">总通过次数：</span>
                  <span style="float: right">{{ problem.ac_total }}</span>
                </td>
              </tr>
              <tr>
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
              <tr>
                <td>
                  <button class="badge" style="float: left" @click="click">
                    知识点
                    <span>
                      <svg
                        v-if="problem.tag_list != '' && flag == 0"
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
                      v-for="tag in problem.tag_list"
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
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: 32px;
  font-weight: bold;
}

.vue-ace-editor {
  /* ace-editor默认没有高度，所以必须设置高度，或者同时设置最小行和最大行使编辑器的高度自动增高 */
  height: 300px;
  font-size: 16px;
}

header {
  display: flex;
}
select {
  margin-right: 15px;
}
main {
  flex: 1;
  margin-top: 15px;
  display: flex;
}
.vue-ace-editor {
  font-size: 16px;
  border: 1px solid;
  flex: 1;
}
.outline-tree {
  width: 500px;
  margin-left: 15px;
  border: 1px solid;
  font-size: 16px;
}
</style>
