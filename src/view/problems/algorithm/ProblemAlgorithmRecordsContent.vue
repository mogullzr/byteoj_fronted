<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";
import UserStore from "@/store/user";
import { ProblemAlgorithmControllerService } from "../../../../generated";
import router from "@/router";
import dayjs from "dayjs";
import { VAceEditor } from "vue3-ace-editor";

const path = router.currentRoute.value.fullPath;
const submission_id = ref(parseInt(path.toString().split("/")[4]));
const competition_id = ref(parseInt(path.toString().split("/")[2]));
const useStore = UserStore();
const status_color_list = useStore.status_color_list;
const status_list = useStore.status_list;
const isLoading = ref(true);
// 如果发出警告则直接展示说明你没有权限访问当前页面
const auth_status = ref(0);

const record: Ref<any> = ref({} as any);
const tests_list: Ref<any> = ref([]);

const options = ref({
  useWorker: false, // 启用语法检查,必须为true
  enableSnippets: true, // 启用代码段
  showPrintMargin: false, // 去掉灰色的线，printMarginColumn
  highlightActiveLine: true, // 高亮行
  highlightSelectedWord: true, // 高亮选中的字符
  tabSize: 4, // tab锁进字符
  wrap: false, // 是否换行
  minLines: 20, // 最小行数，minLines和maxLines同时设置之后，可以不用给editor再设置高度
  maxLines: 1000, // 最大行数
  readOnly: true,
});

const font_size: Ref<any> = ref(
  localStorage.getItem("fontSize") == null
    ? 18
    : localStorage.getItem("fontSize")
);

const isShow: Ref<boolean> = ref(false);

const editorInit = () => {
  require("ace-builds/src-noconflict/ext-language_tools");
  require("ace-builds/src-noconflict/snippets/sql");
  require("ace-builds/src-noconflict/snippets/c_cpp");
  require("ace-builds/src-noconflict/snippets/java");
  require("ace-builds/src-noconflict/mode-c_cpp");
  require("ace-builds/src-noconflict/mode-java");
  require("ace-builds/src-noconflict/theme-monokai"); //
  require("ace-builds/src-noconflict/theme-eclipse");
  require("ace-builds/src-noconflict/theme-chrome"); //
  require("ace-builds/src-noconflict/theme-textmate");
  require("ace-builds/src-noconflict/mode-html");
  require("ace-builds/src-noconflict/mode-html_elixir");
  require("ace-builds/src-noconflict/mode-html_ruby");
  require("ace-builds/src-noconflict/mode-javascript");
  require("ace-builds/src-noconflict/mode-python");
  require("ace-builds/src-noconflict/snippets/less");
  require("ace-builds/src-noconflict/ext-static_highlight");
  require("ace-builds/src-noconflict/ext-beautify");
};
onMounted(async () => {
  isLoading.value = true;
  if (path.toString().split("/")[1] == "problems") {
    competition_id.value = -1;
  }
  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmRecordByRecordIdUsingPost(
      competition_id.value,
      submission_id.value
    );
  if (res.code === 0) {
    record.value = res.data;
    record.value.score = 0;
    record.value.ac_num = 0;
    tests_list.value = record.value.submission_list;
    record.value.all_num = tests_list.value.length;

    let single_score = Math.ceil(100 / record.value.all_num);

    for (let item = 0; item < tests_list.value.length; item++) {
      let result = tests_list.value[item].result;
      if (null != status_list[result]) {
        tests_list.value[item].short_status = status_list[result];
      } else {
        tests_list.value[item].short_status = "CE";
      }

      if (tests_list.value[item].time_used == 0) {
        tests_list.value[item].time_used = 1;
      }

      if (tests_list.value[item].memory_used == 0) {
        tests_list.value[item].memory_used = 1;
      }
      if (result == "Accepted") {
        record.value.ac_num++;
        record.value.score += single_score;
        tests_list.value[item].score = single_score;
      } else {
        tests_list.value[item].score = 0;
      }
    }
    record.value.score = Math.min(100, record.value.score);
    window.document.title = record.value.chinese_name + " - ByteOJ提交记录";
  } else if (res.code === 40101) {
    auth_status.value = 1;
  }
  isLoading.value = false;
});

// 滑轮实现字体大小缩放效果;
const handleWheel = (event: any) => {
  if (font_size.value == null) return;
  if (event.ctrlKey) {
    if (event.deltaY > 0 && font_size.value > 7) {
      font_size.value -= 1;
    } else if (font_size.value < 63) {
      font_size.value += 1;
    }
  } else {
    console.log(document.documentElement.scrollLeft);
    window.scrollTo(
      document.documentElement.scrollLeft + event.deltaX,
      document.documentElement.scrollTop + event.deltaY
    );
  }
};

// 实现全屏效果和退出全屏效果
const EditorSizeControl = () => {
  let element: any = document.getElementById("editor");
  if (isShow.value) {
    document.exitFullscreen();
    isShow.value = false;
  } else {
    element.requestFullscreen();
    isShow.value = true;
  }
};

const goBack = () => {
  if (competition_id.value != -1) {
    router.push("/competition/" + competition_id.value);
  } else {
    router.push("/home");
  }
};
</script>

<template>
  <div v-if="!auth_status" class="flex mx-40">
    <div class="card-side rounded-xl bg-base-100 shadow-xl mx-5 w-2/3">
      <div class="m-6" v-if="!isLoading">
        <div class="my-2">
          <div class="font-bold text-xl">测试样例#{{ tests_list.length }}</div>
          <!-- You can open the modal using ID.showModal() method -->
          <button
            class="btn text-white bg-blue-500 float-right"
            onclick="my_modal_3.showModal()"
          >
            显示代码
          </button>
          <dialog id="my_modal_3" class="modal">
            <div class="modal-box w-11/12 max-w-6xl max-h-screen" id="editor">
              <form method="dialog" v-if="!isShow">
                <button
                  class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                >
                  ✕
                </button>
              </form>
              <h3 class="text-lg font-bold">代码</h3>
              <p class="py-4">
                <span class="font-bold text-xxl">作者:</span>
                <router-link
                  class="link link-hover text-primary font-bold"
                  to="'/user/userspace/' + record.uuid"
                >
                  <div class="avatar">
                    <div class="w-12 rounded-full">
                      <img @dragstart.prevent :src="record.avatar" />
                    </div>
                  </div>
                  {{ record.user_name }}
                </router-link>
              </p>
              <div class="font-bold text-xxl">
                <span class="mr-16">
                  <span>使用语言：</span>
                  <span class="text-primary">{{ record.language }}</span>
                </span>
                <span class="mx-16">
                  <span>代码长度: </span>
                  <span class="text-primary">{{ record.code_length }}</span>
                </span>
                <span class="mx-16">
                  <span>运行时间: </span>
                  <span class="text-primary"
                    >{{
                      record.time_used == 0 ? "N/A" : record.time_used
                    }}ms</span
                  >
                </span>
              </div>
              <div class="font-bold text-xxl my-2">
                <span class="mr-16">
                  <span>运行内存: </span>
                  <span class="text-primary"
                    >{{
                      record.memory_used == 0 ? "N/A" : record.memory_used
                    }}MB</span
                  >
                </span>
                <span class="mx-16">
                  <span>通过率: </span>
                  <span class="text-primary"
                    >{{ record.ac_num }} / {{ record.all_num }}</span
                  >
                </span>
              </div>
              <div class="font-bold text-xxl my-2">
                <span>
                  <span>提交时间：</span>
                  <span class="text-primary">{{
                    dayjs(record.submit_time).format("YYYY-MM-DD HH:mm:ss")
                  }}</span>
                </span>
              </div>
              <div class="divider"></div>
              <div>
                <div
                  class="bg-neutral-100 w-full h-16"
                  style="border: lightgray 1px solid"
                >
                  <div class="flex">
                    <div class="flex-1"></div>
                    <button
                      class="EditorSizeControl ml-5"
                      @click="EditorSizeControl"
                    >
                      <svg
                        v-if="!isShow"
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill="#999999"
                          d="M16 0H9.5L12 2.5l-3 3L10.5 7l3-3L16 6.5zm0 16V9.5L13.5 12l-3-3L9 10.5l3 3L9.5 16zM0 16h6.5L4 13.5l3-3L5.5 9l-3 3L0 9.5zM0 0v6.5L2.5 4l3 3L7 5.5l-3-3L6.5 0z"
                        />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill="#2aabd2"
                          d="M16 0H9.5L12 2.5l-3 3L10.5 7l3-3L16 6.5zm0 16V9.5L13.5 12l-3-3L9 10.5l3 3L9.5 16zM0 16h6.5L4 13.5l3-3L5.5 9l-3 3L0 9.5zM0 0v6.5L2.5 4l3 3L7 5.5l-3-3L6.5 0z"
                        />
                      </svg>
                    </button>
                    <div class="m-4 font-bold text-2xl">
                      {{ record.language }}
                    </div>
                  </div>
                </div>
                <v-ace-editor
                  @init="editorInit"
                  :value="record.source_code ?? ''"
                  theme="textmate"
                  lang="c_cpp"
                  :options="options"
                  class="vue-ace-editor"
                  :style="'font-size: ' + font_size + 'px'"
                />
              </div>
              <form method="dialog" v-if="!isShow">
                <button
                  class="btn btn-lg btn-primary text-white my-8 float-right"
                >
                  关闭
                </button>
              </form>
            </div>
          </dialog>
        </div>

        <div class="flex flex-wrap">
          <div v-for="(test, index) in tests_list" :key="test">
            <div
              class="tooltip"
              :data-tip="test.result + ', 得分' + test.score + ', 1'"
            >
              <button
                class="card card-side shadow-xl text-white w-32 h-32 mx-2 my-2 stack"
                :style="
                  'flex-grow: 0; background-color:' +
                  status_color_list[test.short_status]
                "
              >
                <div class="m-2">
                  <div>#{{ index + 1 }}</div>
                  <div class="text-3xl mx-8">
                    <span>{{ test.short_status }}</span>
                    <span
                      v-if="test.short_status === 'PD'"
                      class="loading loading-spinner loading-sm"
                    ></span>
                  </div>
                  <div class="mx-4">
                    {{ test.time_used }}ms/{{ test.memory_used }}MB
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-xl bg-base-100 shadow-xl w-5/12 h-96">
      <div v-if="!isLoading" class="flex-none m-10">
        <button class="avatar">
          <div class="rounded-full w-24 align-center">
            <img @dragstart.prevent :src="record.avatar" />
          </div>
          <router-link
            class="link link-hover link-primary font-bold text-blue-500 mx-4 py-8 text-2xl"
            :to="'/user/userspace/' + record.uuid"
          >
            {{ record.user_name }}
          </router-link>
        </button>
        <div class="flex my-6 font-bold text-lg">
          <div class="flex-1">所属题目</div>
          <router-link
            class="link link-hover link-primary"
            to="/problems/algorithm/1300"
          >
            {{ record.chinese_name }}
          </router-link>
        </div>
        <div class="flex my-6 font-bold text-lg">
          <div class="flex-1">评测状态</div>
          <div
            :class="
              record.result === 'Accepted' ? 'text-lime-500' : 'text-error'
            "
          >
            {{ record.result }}
          </div>
        </div>
        <div class="flex my-6 font-bold text-lg">
          <div class="flex-1">评测分数</div>
          <div
            :class="
              record.result === 'Accepted' ? 'text-lime-500' : 'text-error'
            "
          >
            {{ record == null ? "未知？？" : record.score }}
          </div>
        </div>
        <div class="flex my-6 font-bold text-lg">
          <div class="flex-1">提交时间</div>
          <div>
            {{ dayjs(record.submit_time).format("YYYY-MM-DD HH:mm:ss") }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="card card-side bg-base-100 shadow-xl">
    <figure style="width: 400px">
      <img
        src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/2024/08/879a61e96ab7414f909ff14f1f6bf93a.jpeg"
        alt="img"
      />
    </figure>
    <div class="card-body">
      <h2 class="card-title">对不起，你没有权限访问这条记录</h2>
      <p>请点击返回{{ competition_id == -1 ? "主页面" : "竞赛主页面" }}吧</p>
      <div class="card-actions justify-end">
        <button class="btn btn-primary text-white" @click="goBack">
          返回{{ competition_id == -1 ? "主页面" : "竞赛主页面" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vue-ace-editor {
  /* ace-editor默认没有高度，所以必须设置高度，或者同时设置最小行和最大行使编辑器的高度自动增高 */
  overflow: auto;
  height: 2150px;
  width: 100%;
  font-size: 40px;
  border: lightgray 1px solid;
  white-space: pre;
  transition: height 0.3s ease;
}
</style>
