<template>
  <audio ref="audioClick" v-show="false">
    <source src="../../../../public/vector.mp3" type="audio/mpeg" />
  </audio>
  <div class="bg-neutral-100 w-full h-16" style="border: lightgray 1px solid">
    <div class="flex">
      <div class="flex-1"></div>
      <select
        id="language"
        class="select select-bordered max-w-xs w-1/6 mb-2 my-1"
        v-model="current_language"
        @change="getCurrentSelected('language')"
      >
        <option v-for="language in languages_options" :key="language">
          {{ language }}
        </option>
      </select>
      <button
        class="EditorSizeControl ml-5"
        @click="EditorSizeControl"
        v-if="isShow === '1'"
      >
        <svg
          v-if="!flag"
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
      <button class="reverseEditorHover ml-4" @click="transformEditor">
        <svg
          v-if="isShow === '0' || isShow == null"
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
        >
          <path fill="#999999" d="M1 20V4h6v16zm8 0V4h14v16z" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
        >
          <path fill="#2aabd2" d="M1 20V4h6v16zm8 0V4h14v16z" />
        </svg>
      </button>
      <button class="rebootHover mx-6" @click="clearContent">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="#999999"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 20v-5h-5M4 4v5h5m10.938 2A8.001 8.001 0 0 0 5.07 8m-1.008 5a8.001 8.001 0 0 0 14.868 3"
          />
        </svg>
      </button>
      <button class="bothover mr-6" @click="showBot('ByteOJ AI 问答')">
        <div v-if="!isBot">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><g fill="none" stroke="#666666" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2m16 0h2m-7-1v2m-6-2v2"/></g></svg>
        </div>
        <div v-else>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><g fill="none" stroke="#2AABD2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2m16 0h2m-7-1v2m-6-2v2"/></g></svg>
        </div>
      </button>
      <DraggableWindowView
          :title="windoww.title ?? 'ByteOJ AI 问答'"
          :position="windoww.position"
          :size="windoww.size"
          @close="removeWindow"
          @minimize="toggleMinimizeWindow"
          v-show="isBot"
          v-model:fixed="isFixed"
      >
        <ChatBoxView :status="props.status"/>
      </DraggableWindowView>
      <button class="settingHover mr-6" @click="showModal">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
        >
          <path
            fill="#999999"
            d="m9.25 22l-.4-3.2q-.325-.125-.612-.3t-.563-.375L4.7 19.375l-2.75-4.75l2.575-1.95Q4.5 12.5 4.5 12.338v-.675q0-.163.025-.338L1.95 9.375l2.75-4.75l2.975 1.25q.275-.2.575-.375t.6-.3l.4-3.2h5.5l.4 3.2q.325.125.613.3t.562.375l2.975-1.25l2.75 4.75l-2.575 1.95q.025.175.025.338v.674q0 .163-.05.338l2.575 1.95l-2.75 4.75l-2.95-1.25q-.275.2-.575.375t-.6.3l-.4 3.2zm2.8-6.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.488 1.025T8.55 12t1.013 2.475T12.05 15.5"
          />
        </svg>
      </button>
      <dialog id="my_modal" class="modal">
        <div class="modal-box max-w-3xl">
          <div class="text-lg font-bold" style="font-size: 30px">
            代码编辑器设置
          </div>
          <div class="divider"></div>
          <div class="flex">
            <div>
              <div class="font-bold">界面风格</div>
              <div class="text-gray-400">
                对于这种白色页面疲劳了？你可以选择另外几种不同颜色风格的高亮特效感受感受o(*￣︶￣*)o
              </div>
            </div>
            <div class="mx-6 my-2">
              <select
                id="theme"
                class="select select-bordered max-w-xs w-48"
                v-model="current_theme"
                @click="getCurrentSelected('theme')"
              >
                <option v-for="theme in themes_options" :key="theme">
                  {{ theme }}
                </option>
              </select>
            </div>
          </div>
          <div class="divider"></div>
          <div class="modal-action">
            <form method="dialog">
              <button class="btn bg-blue-400 text-white">确定</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  </div>
  <v-ace-editor
    id="editor"
    dragEnabled="true"
    @init="editorInit"
    v-model:value="content"
    :lang="
      current_language == 'C' || current_language == 'C++'
        ? 'c_cpp'
        : current_language == 'Python3'
        ? 'python'
        : 'c_cpp'
    "
    :theme="current_theme"
    :options="options"
    class="vue-ace-editor"
    :style="{
      fontSize: font_size + 'px',
      lineHeight: lineHeight + 'px',
      transition: 'all 0.2s ease',
    }"
    @wheel.prevent="handleWheel"
  />
  <button
    @click="submitJudge"
    class="text-lg btn float-right text-white m-4 w-28 bg-green-400 hover:bg-green-500 active:bg-emerald-500 g-border-b-gray-400"
    :disabled="isShow_2"
  >
    提交代码
  </button>
  <button
    class="text-lg btn bg-white float-right m-4 w-28 hover:bg-gray-100 active:bg-gray-300 border-b-gray-400"
    @click="judgeTest"
    :disabled="isShow_1"
  >
    调试代码
  </button>
  <div
    v-show="isLoading !== undefined"
    tabindex="0"
    class="collapse collapse-open border-base-300 border"
    style=""
  >
    <div
      class="collapse-title text-xl font-medium flex"
      style="background-color: #f5f5f5"
    >
      <div>代码运行状态：</div>
      <div class="text-2xl text-sky-600" v-if="isLoading">
        <span class="">Running</span>
        <span class="loading loading-spinner ml-3"></span>
      </div>
      <span
        class="text-2xl ml-2"
        v-else-if="code_status == 'Accepted' || code_status == 'Finished'"
        style="color: #449d44"
        >{{ code_status }}</span
      >
      <span
        class="text-2xl text-red-500"
        v-else-if="code_status != 'Nonzero Exit Status'"
        >{{ code_status }}</span
      >
      <span class="text-2xl text-red-500" v-else>Compile Error</span>
    </div>
    <div class="collapse-content">
      <div class="m-5" v-show="!isLoading">
        <span class="text-gray-700">输入</span>
        <textarea
          id="auto-expand-textarea_1"
          class="auto-expand-textarea my-2"
          v-model="input"
          style="font-size: 16px; letter-spacing: 2px"
        ></textarea>
        <span class="text-gray-700">输出</span>
        <textarea
          id="auto-expand-textarea_2"
          class="auto-expand-textarea my-2"
          :style="code_status == 'Nonzero Exit Status' ? 'color: #d05451' : ''"
          v-model="code_message"
          style="font-size: 16px; letter-spacing: 2px"
        ></textarea>
        <span
          class="text-gray-700"
          v-show="correctOutput && correctOutput != ''"
          >标准答案</span
        >
        <textarea
          v-if="correctOutput && correctOutput != ''"
          id="auto-expand-textarea_3"
          class="auto-expand-textarea my-2"
          v-model="correctOutput"
          style="font-size: 16px; letter-spacing: 2px"
        ></textarea>
        <div v-if="code_time != 0" style="font-size: 18px">
          时间：{{ code_time }} ms
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUpdate, onMounted, ref, Ref, watch } from "vue";

import { VAceEditor } from "vue3-ace-editor";
import "@/plugins/aceConfig.js";
import UserStore from "@/store/user";
import router from "@/router";
import { ProblemAlgorithmControllerService } from "../../../../generated";
import ace from "ace-builds";
import ChatBoxView from "@/view/AI/ChatBoxView.vue";
import DraggableWindowView from "@/components/Card/DraggableWindowView.vue";

const props = defineProps<{
  status: number
}>();
const audioClick: Ref<any> = ref(null);
const useStore = UserStore();
const isShow: Ref<string | null> = ref(localStorage.getItem("EditorStatus"));
const flag: Ref<boolean> = ref(localStorage.getItem("ControlBlock") != null);
// 是否展示 AI 问答页面
const isBot: Ref<boolean> = ref(localStorage.getItem("isBot") == 'true');

const font_size: Ref<any> = ref(
  localStorage.getItem("fontSize") == null
    ? 18
    : parseInt(localStorage.getItem("fontSize") ?? "22")
);
const line_height: Ref<any> = ref(24);

const correctOutput: Ref<string | undefined> = ref(undefined);
const options: any = ref({
  useWorker: true, // 启用语法检查,必须为true
  enableBasicAutocompletion: true, // 自动补全
  enableLiveAutocompletion: true, // 智能补全
  enableSnippets: true, // 启用代码段
  showPrintMargin: false, // 去掉灰色的线，printMarginColumn
  highlightActiveLine: true, // 高亮行
  highlightSelectedWord: true, // 高亮选中的字符
  tabSize: 4, // tab锁进字符
  wrap: false, // 是否换行
  readonly: false, // 是否可编辑
  minLines: 15, // 最小行数，minLines和maxLines同时设置之后，可以不用给editor再设置高度
  maxLines: 1000, // 最大行数
  fontSize: font_size.value,
});
const path = router.currentRoute.value.fullPath;
const problem_id = ref(
  path.toString().split("/")[1] == "competition"
    ? parseInt(path.toString().split("/")[2]) +
        "-" +
        path.toString().split("/")[4]
    : parseInt(path.toString().split("/")[3])
);

const languages_options = useStore.languages_options;
const themes_options = useStore.themes_options;
const languages_content = useStore.languages_content;
const current_language = ref(localStorage.getItem("current_language") == null ? languages_options[1] : localStorage.getItem("current_language"));

const current_theme: Ref<any> = ref(
  localStorage.getItem("theme-" + useStore.loginUser.uuid) == null
    ? themes_options[0] ?? "github"
    : localStorage.getItem("theme-" + useStore.loginUser.uuid) != undefined
    ? localStorage.getItem("theme-" + useStore.loginUser.uuid)
    : "github"
);

const content: Ref<any> = ref(
  localStorage.getItem(
    problem_id.value +
      "-" +
      useStore.loginUser.uuid +
      "-" +
      current_language.value
  ) == null
    ? languages_content[1]
    : localStorage.getItem(
        problem_id.value +
          "-" +
          useStore.loginUser.uuid +
          "-" +
          current_language.value
      )
); // 显示的内容

const input = ref("");
const code_status = ref("");
const code_message = ref("");
const code_time = ref(0);
const isLoading: Ref<boolean | undefined> = ref(undefined);

const isShow_1: Ref<Boolean> = ref(false);
const isShow_2: Ref<Boolean> = ref(false);

const editorInit = () => {
  require("ace-builds/src-noconflict/ext-language_tools");
  require("ace-builds/src-noconflict/snippets/sql");
  require("ace-builds/src-noconflict/snippets/c_cpp");
  require("ace-builds/src-noconflict/snippets/java");
  require("ace-builds/src-noconflict/mode-c_cpp");
  require("ace-builds/src-noconflict/mode-java");
  require("ace-builds/src-noconflict/theme-monokai");
  require("ace-builds/src-noconflict/theme-eclipse");
  require("ace-builds/src-noconflict/theme-chrome");
  require("ace-builds/src-noconflict/theme-textmate");
  require("ace-builds/src-noconflict/mode-html");
  require("ace-builds/src-noconflict/mode-html_elixir");
  require("ace-builds/src-noconflict/mode-html_ruby");
  require("ace-builds/src-noconflict/mode-javascript");
  require("ace-builds/src-noconflict/mode-python");
  require("ace-builds/src-noconflict/snippets/less");
  require("ace-builds/src-noconflict/ext-static_highlight");
  require("ace-builds/src-noconflict/ext-beautify");
  let langTools = ace.require("ace/ext/language_tools");
  // Custom code completion
  const customCompleter = {
    getCompletions: function (
      editor: any,
      session: any,
      pos: any,
      prefix: any,
      callback: any
    ) {
      const completions = useStore.auto_code;
      callback(null, completions);
    },
  };

  langTools.addCompleter(customCompleter);
};

const modify = async () => {
  const textarea1 = document.getElementById(
    "auto-expand-textarea_1"
  ) as HTMLTextAreaElement;
  if (textarea1) {
    await adjustHeight(textarea1);
  }
  const textarea2 = document.getElementById(
    "auto-expand-textarea_2"
  ) as HTMLTextAreaElement;
  if (textarea2) {
    await adjustHeight(textarea2);
  }
  const textarea3 = document.getElementById(
    "auto-expand-textarea_3"
  ) as HTMLTextAreaElement;
  if (textarea3) {
    await adjustHeight(textarea3);
  }
};
const judgeTest = async () => {
  let competition_id = ref(parseInt(path.toString().split("/")[2]));
  let problem_index = path.toString().split("/")[4] ?? "";

  isShow_1.value = true;
  isShow_2.value = true;

  code_message.value = "";
  code_time.value = 0;

  let temp_language = "";
  if (current_language.value == "C++") {
    temp_language = "cpp";
  } else if (current_language.value == "C") {
    temp_language = "c";
  } else if (current_language.value == "Python3") {
    temp_language = "python";
  } else if (current_language.value == "Java") {
    temp_language = "java";
  }
  isLoading.value = true;
  if (problem_index == "") {
    const res =
      await ProblemAlgorithmControllerService.problemAlgorithmJudgeUsingPost({
        problem_id: problem_id.value,
        language: temp_language,
        source_code: content.value,
        input_list: [input.value],
      });

    if (res.code === 0) {
      code_status.value = res.data[0].status;
      code_time.value = res.data[0].time;
      if (code_status.value == "Nonzero Exit Status") {
        code_message.value = res.data[0].fileId;
      } else {
        code_message.value = res.data[0].output;
      }
      isLoading.value = false;

      isShow_1.value = false;
      isShow_2.value = false;
    }
  } else {
    const res =
      await ProblemAlgorithmControllerService.problemAlgorithmJudgeUsingPost({
        index: problem_index,
        competition_id: competition_id.value,
        language: temp_language,
        source_code: content.value,
        input_list: [input.value],
      });

    if (res.code === 0) {
      code_status.value = res.data[0].status;
      code_time.value = res.data[0].time;
      if (code_status.value == "Nonzero Exit Status") {
        code_message.value = res.data[0].fileId;
      } else {
        code_message.value = res.data[0].output;
      }
      isLoading.value = false;

      isShow_1.value = false;
      isShow_2.value = false;
    }
  }
};

onBeforeUpdate(async () => {
  await modify();
});
const submitJudge = async () => {
  let competition_id = ref(parseInt(path.toString().split("/")[2]));
  let problem_index = path.toString().split("/")[4] ?? "";

  isShow_1.value = true;
  isShow_2.value = true;

  input.value = "";
  code_message.value = "";
  code_time.value = 0;

  let temp_language = "";
  if (current_language.value == "C++") {
    temp_language = "cpp";
  } else if (current_language.value == "C") {
    temp_language = "c";
  } else if (current_language.value == "Python3") {
    temp_language = "python";
  } else if (current_language.value == "Java") {
    temp_language = "java";
  }
  isLoading.value = true;
  if (problem_index == "") {
    const res =
      await ProblemAlgorithmControllerService.problemAlgorithmJudgeSubmitUsingPost(
        {
          problem_id: problem_id.value,
          language: temp_language,
          source_code: content.value,
        }
      );
    if (res.code === 0) {
      code_status.value = res.data.status;
      if (code_status.value == "Wrong Answer") {
        input.value = res.data.input;
        code_message.value = res.data.output;
        correctOutput.value = res.data.correctOutput;
      } else if (code_status.value == "Nonzero Exit Status") {
        code_message.value = res.data.fileId;
      } else if (code_status.value == "Accepted") {
        audioClick.value.volume = 1;
        audioClick.value?.play();
      }
      isLoading.value = false;
      await modify();

      isShow_1.value = false;
      isShow_2.value = false;
    }
  } else {
    const res =
      await ProblemAlgorithmControllerService.problemAlgorithmJudgeSubmitUsingPost(
        {
          competition_id: competition_id.value,
          index: problem_index,
          language: temp_language,
          source_code: content.value,
        }
      );
    if (res.code === 0) {
      code_status.value = res.data.status;
      if (code_status.value == "Wrong Answer") {
        input.value = res.data.input;
        code_message.value = res.data.output;
        correctOutput.value = res.data.correctOutput;
      } else if (code_status.value == "Nonzero Exit Status") {
        code_message.value = res.data.fileId;
      } else if (code_status.value == "Accepted") {
        audioClick.value.volume = 1;
        audioClick.value?.play();
      }
      isLoading.value = false;
      await modify();

      isShow_1.value = false;
      isShow_2.value = false;
    }
  }
};
const getCurrentSelected = (keyId: string) => {
  let selectDiv: any = document.getElementById(keyId);
  if (keyId === "language") {
    current_language.value = languages_options[selectDiv.selectedIndex];
    localStorage.setItem("current_language", current_language.value)
    content.value =
      localStorage.getItem(
        problem_id.value +
          "-" +
          useStore.loginUser.uuid +
          "-" +
          current_language.value
      ) == null
        ? languages_content[selectDiv.selectedIndex]
        : localStorage.getItem(
            problem_id.value +
              "-" +
              useStore.loginUser.uuid +
              "-" +
              current_language.value
          );
  } else {
    current_theme.value = themes_options[selectDiv.selectedIndex];
    localStorage.setItem(
      "theme-" + useStore.loginUser.uuid,
      current_theme.value
    );
  }
};

// 将当前语言对应的内容删除的同时还需要将本地缓存给删除
const clearContent = () => {
  let selectDiv: any = document.getElementById("language");
  content.value = languages_content[selectDiv.selectedIndex];
  localStorage.removeItem(
    problem_id.value +
      "-" +
      useStore.loginUser.uuid +
      "-" +
      current_language.value
  );
  localStorage.removeItem("fontSize");
  font_size.value = 22;
};

// 转换编辑器的位置
const transformEditor = () => {
  if (isShow.value == null || isShow.value == "0") {
    localStorage.setItem("EditorStatus", "1");
    isShow.value = "1";
    window.location.reload();
  } else {
    localStorage.setItem("EditorStatus", "0");
    localStorage.removeItem("ControlBlock");
    isShow.value = "0";
    window.location.reload();
  }
};

watch(content, (NewValue, OldValue) => {
  localStorage.setItem(
    problem_id.value +
      "-" +
      useStore.loginUser.uuid +
      "-" +
      current_language.value,
    content.value
  );
});

// 滑轮实现字体大小缩放效果
// const handleWheel = (event: any) => {
//   if (event.ctrlKey) {
//     if (event.deltaY > 0 && font_size.value > 7) {
//       font_size.value -= 1;
//     } else if (font_size.value < 33) {
//       console.log(font_size.value);
//       font_size.value += 1;
//       console.log(font_size.value);
//     }
//   } else {
//     window.scrollTo(
//       document.documentElement.scrollLeft + event.deltaX,
//       document.documentElement.scrollTop + event.deltaY
//     );
//   }
// };
const handleWheel = (event: WheelEvent) => {
  event.preventDefault();

  if (event.ctrlKey) {
    const increment = event.deltaY > 0 ? -1 : 1;
    const newFontSize = font_size.value + increment;

    if (newFontSize >= 7 && newFontSize <= 33) {
      requestAnimationFrame(() => {
        font_size.value = newFontSize;
        document.documentElement.style.setProperty(
          "--font-size",
          `${newFontSize}px`
        );
      });
    }
  } else {
    window.scrollTo(
      document.documentElement.scrollLeft + event.deltaX,
      document.documentElement.scrollTop + event.deltaY
    );
  }
};

// 控制编辑器的大小
const EditorSizeControl = () => {
  if (!flag.value) {
    flag.value = true;
    localStorage.setItem("ControlBlock", "0");
  } else {
    localStorage.removeItem("ControlBlock");
    flag.value = false;
  }
  window.location.reload();
};

// 展示指定窗口
const showModal = () => {
  let el: any = document.getElementById("my_modal");
  el?.showModal();
};

const adjustHeight = async (element: HTMLTextAreaElement) => {
  await nextTick();
  setTimeout(() => {
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 2000)}px`;
  }, 0);
};
//
// watch(
//   [code_status],
//   (newValue) => {
//     const textarea = document.getElementById(
//       "auto-expand-textarea_2"
//     ) as HTMLTextAreaElement;
//     if (textarea) {
//       adjustHeight(textarea);
//     }
//     const textarea0 = document.getElementById(
//       "auto-expand-textarea_3"
//     ) as HTMLTextAreaElement;
//     if (textarea0) {
//       adjustHeight(textarea0);
//     }
//   },
//   { immediate: true }
// ); // immediate: true 确保初始渲染时也会调整
const preventInput = (event: KeyboardEvent) => {
  // 禁用大键盘输入
  if (event.key.length === 1) {
    event.preventDefault();
  }
};

const triggerEnterEvent = (element: HTMLTextAreaElement) => {
  const event = new KeyboardEvent("keydown", {
    key: "Enter",
    code: "Enter",
    bubbles: true,
  });
  element.dispatchEvent(event);
};
onMounted(() => {
  const textarea1 = document.getElementById(
    "auto-expand-textarea_1"
  ) as HTMLTextAreaElement;
  const textarea2 = document.getElementById(
    "auto-expand-textarea_2"
  ) as HTMLTextAreaElement;
  const textarea3 = document.getElementById(
    "auto-expand-textarea_3"
  ) as HTMLTextAreaElement;
  if (textarea1) {
    adjustHeight(textarea1); // 初始调整
    // textarea1.addEventListener("input", () => adjustHeight(textarea1)); // 监听输入事件
  }

  if (textarea2) {
    adjustHeight(textarea2); // 初始调整
    textarea2.addEventListener("keydown", preventInput);
    // textarea2.addEventListener("input", () => adjustHeight(textarea2)); // 监听输入事件
  }

  if (textarea3) {
    adjustHeight(textarea3); // 初始调整
    textarea3.addEventListener("keydown", preventInput);
    // textarea3.addEventListener("input", () => adjustHeight(textarea3)); // 监听输入事件
  }
});
// watch监视当前字体大小
watch(font_size, (NewValue, OldValue) => {
  localStorage.setItem("fontSize", font_size.value.toString());
});

onBeforeUpdate(async () => {
  const textarea2 = document.getElementById(
    "auto-expand-textarea_2"
  ) as HTMLTextAreaElement;
  await adjustHeight(textarea2);
  const textarea3 = document.getElementById(
    "auto-expand-textarea_3"
  ) as HTMLTextAreaElement;
  await adjustHeight(textarea3);
});

// 展开/关闭bot
const emit = defineEmits(['toggle-bot'])
const showBot = (type: string) =>{
  isBot.value = !isBot.value;
  windoww.value = {
    id: 1,
    title: type,
    content: `这是 ${type} 的内容。`,
    position: { x: 100, y: 100 },
    size: { width: 500, height: 200 },
    minimized: true,
  };

  emit('toggle-bot'); // 向父组件发送事件
}

const isFixed = ref(false);
const windoww = ref<{ id: number; title: string; content: string; position: { x: number; y: number }; size: { width: number; height: number }; minimized: boolean }>({} as any);
const toggleMinimizeWindow = () => {
  windoww.value.minimized = !windoww.value.minimized;
};
const removeWindow = () => {
  isBot.value = !isBot.value;
  emit("toggle-bot");
};
</script>

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

.rebootHover:hover {
  path {
    stroke: #2aabd2;
  }
}

.settingHover:hover {
  path {
    fill: #2aabd2;
  }
}
.bothover:hover{
  path {
    fill: #2aabd2;
  }
}
.reverseEditorHover:hover {
  path {
    fill: #2aabd2;
  }
}

.EditorSizeControl:hover {
  path {
    fill: #2aabd2;
  }
}

.auto-expand-textarea {
  height: auto;
  width: 100%;
  box-sizing: border-box; /* 包括内边距和边框 */
  overflow: hidden; /* 隐藏滚动条 */
  resize: none; /* 禁用用户调整大小 */
  border: 1px solid #ddd; /* 边框颜色 */
  border-radius: 4px; /* 圆角边框 */
  padding: 10px; /* 内边距 */
  font-size: 16px; /* 字体大小 */
  line-height: 1.5; /* 行高 */
  color: #333; /* 文字颜色 */
  background-color: #fafafa; /* 背景颜色 */
  transition: border-color 0.2s, box-shadow 0.2s; /* 动画效果 */
}
.auto-expand-textarea:focus {
  border-color: #2aabd2; /* 聚焦时边框颜色 */
  box-shadow: 0 0 0 3px rgba(38, 143, 255, 0.25); /* 聚焦时阴影效果 */
  outline: none; /* 移除默认的焦点轮廓 */
}
</style>
