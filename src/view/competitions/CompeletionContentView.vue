<script setup lang="ts">
import {nextTick, onMounted, onUnmounted, ref, Ref, UnwrapRef} from "vue";
import {
  CompetitionControllerService,
  CompetitionInfoVo,
} from "../../../generated";
import { useRouter } from "vue-router";
import UserStore from "@/store/user";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import CompetitionContentProblemShowView from "@/view/competitions/CompetitionContentComponent/CompetitionContentProblemShowView.vue";
import CompetitionContentRecordsView from "@/view/competitions/CompetitionContentComponent/CompetitionContentRecordsView.vue";
import CompetitionContentRankView from "@/view/competitions/CompetitionContentComponent/CompetitionContentRankView.vue";
import { Startup } from "mathjax-full/js/components/startup";
import elements = Startup.elements;
import CompetitionContentControlView from "@/view/competitions/CompetitionContentComponent/CompetitionContentControlView.vue";
import {useMessageBox} from "@/view/components/alert/useMessageBox";
import {userMessage} from "@/view/components/alert/userMessage.js";
import ProcterOnlineView from "@/view/competitions/Procter/ProcterOnlineView.vue";
const { success, error, warning } = useMessageBox();

const dayjs = require("dayjs");
const useStore = UserStore();
const router = useRouter();
const path = router.currentRoute.value.fullPath;

const competition_id = ref(parseInt(path.toString().split("/")[2]));
//
const password = ref();
const message = ref("");
const status = ref();
const showDialog = ref(true);
const competition_info: Ref<CompetitionInfoVo> = ref({} as CompetitionInfoVo);
let timer: any = ref(null);
let remainingTime = ref("");
let day: Ref<any> = ref(0);
let hour: Ref<any> = ref(0);
let min: Ref<any> = ref(0);
let seconds: Ref<any> = ref(0);
// 临时决策
// const submitted : Ref<boolean> = ref(false);
const local: any =
  localStorage.getItem("competition-" + competition_id.value + "-status") !=
  undefined
    ? localStorage.getItem("competition-" + competition_id.value + "-status")
    : "1";
const isShow = ref(
  localStorage.getItem("competition-" + competition_id.value + "-status") == ""
    ? 0
    : parseInt(local)
);

// 全屏模式状态
const isRankFullscreen = ref(false);

// 切换榜单全屏模式
const toggleRankFullscreen = () => {
  isRankFullscreen.value = !isRankFullscreen.value;
  if (isRankFullscreen.value) {
    // 进入全屏时自动切换到榜单页
    changeShow(3);
  }
};

// ESC键退出全屏
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isRankFullscreen.value) {
    isRankFullscreen.value = false;
  }
};

const toHHmmss = (data: number) => {
  let s;
  let days = Math.floor(
    (data % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24)
  );
  let hours = Math.floor((data % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((data % (1000 * 60 * 60)) / (1000 * 60));
  let secondss = Math.floor((data % (1000 * 60)) / 1000);
  s = `${days < 10 ? "0" + days : days}:${hours < 10 ? "0" + hours : hours}:${
    minutes < 10 ? "0" + minutes : minutes
  }:${secondss < 10 ? "0" + secondss : secondss}`;
  if (s.length > 11) {
    s = s.slice(0, 11);
  }
  return s;
};

const initRemainingTime = (value: UnwrapRef<null>, flag: any) => {
  const currentTime = new Date().getTime();
  let endTime: any = "";
  if (competition_info.value != undefined) {
    if (!flag) endTime = dayjs(competition_info.value.start_time).valueOf();
    else endTime = dayjs(competition_info.value.end_time).valueOf();
    let timeStamp = endTime - currentTime - 2000;
    remainingTime.value = toHHmmss(timeStamp);
    day.value = parseInt(
      remainingTime.value[0] == "0"
        ? remainingTime.value[1]
        : remainingTime.value.substring(0, 2)
    );
    hour.value = parseInt(
      remainingTime.value[3] == "0"
        ? remainingTime.value[4]
        : remainingTime.value.substring(3, 5)
    );
    min.value = parseInt(
      remainingTime.value[6] == "0"
        ? remainingTime.value[7]
        : remainingTime.value.substring(6, 8)
    );
    seconds.value = parseInt(
      remainingTime.value[9] == "0"
        ? remainingTime.value[10]
        : remainingTime.value.substring(9, 11)
    );
    if (timeStamp >= 1000) {
      timer = setInterval(() => {
        day.value = parseInt(
          remainingTime.value[0] == "0"
            ? remainingTime.value[1]
            : remainingTime.value.substring(0, 2)
        );
        hour.value = parseInt(
          remainingTime.value[3] == "0"
            ? remainingTime.value[4]
            : remainingTime.value.substring(3, 5)
        );
        min.value = parseInt(
          remainingTime.value[6] == "0"
            ? remainingTime.value[7]
            : remainingTime.value.substring(6, 8)
        );
        seconds.value = parseInt(
          remainingTime.value[9] == "0"
            ? remainingTime.value[10]
            : remainingTime.value.substring(9, 11)
        );
        timeStamp -= 1000;
        remainingTime.value = toHHmmss(timeStamp);
        if (timeStamp <= 0) {
          remainingTime.value = "00:00:00";
          initRemainingTime(timer.value, 1);
        }
      }, 1000);
    }
  }
};

onMounted(async () => {
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeydown);
  
  let el: any = document.getElementById(isShow.value.toString());
  if (el !== null) {
    el.checked = true;
  }
  const res =
    await CompetitionControllerService.competitionSearchByCompetitionIdUsingPost(
      competition_id.value
    );

  if (res.code === 0) {
    competition_info.value = res.data;
    if (
      competition_info.value?.start_time != undefined &&
      competition_info.value?.end_time != undefined
    ) {
      competition_info.value.start_time = new Date(
        competition_info.value.start_time
      ).toString();
      competition_info.value.end_time = new Date(
        competition_info.value.end_time
      ).toString();
      if (
        new Date().getTime() <=
        dayjs(competition_info.value.start_time).valueOf()
      ) {
        initRemainingTime(timer.value, 0);
      } else {
        initRemainingTime(timer.value, 1);
      }
    }
    // submitted.value = new Date(competition_info.value.start_time) <= new Date();
  }
});

// 临时决策
// const handleSubmit = () => {
//   userMessage({
//     title: '提交离开比赛',
//     content: '确认之后你将无法再进入该页面，你确定？',
//     confirmText: '确认',
//     onConfirm: () => {
//       localStorage.setItem(`system-setting-${competition_id.value}`, '1');
//       router.push('/competition');
//     },
//     onCancel: () => {
//       console.log('取消删除');
//     }
//   });
//
// };

const onShowDialog = () => {
  showDialog.value = true;
};
const closeDialog = () => {
  showDialog.value = false;
};

const Join = async () => {
  const res = await CompetitionControllerService.competitionUserJoinUsingPost(
    competition_id.value,
    password.value
  );

  if (res.code === 0) {
    // 关闭模态框
    // let el: any = document.getElementById("my_modal");
    // el?.close();
    // 清理输入状态
    password.value = "";
    message.value = "";
    // 延迟刷新页面，让用户看到成功提示
    window.location.reload();
  } else {
    message.value = res.message;
    return;
  }
};

const cancelJoin = async () => {
  const res =
    await CompetitionControllerService.competitionUserJoinCancelUsingPost(
      competition_id.value
    );

  if (res.code === 0) {
    success("已经成功取消报名");
  } else {
    error(res.message);
  }
  setTimeout(() => {
    window.location.reload();
  }, 3000);
};

const showModal = () => {
  let el: any = document.getElementById("my_modal");
  el?.showModal();
};

const changeShow = (key: number) => {
  isShow.value = key;
  localStorage.setItem(
    "competition-" + competition_id.value + "-status",
    key.toString()
  );
  let element: any = document.getElementById(isShow.value.toString());
  if (element) {
    element.checked = true;
  }
};

const shareCompetition = () => {
  // 创建一个临时的文本区域来执行复制操作
  const textArea = document.createElement("textarea");

  // 构建要复制的文本内容
  const customText =
    "🎉【编程竞赛】《" + competition_info.value.competition_name + "》火热报名中！\n\n" +
    "📅 比赛时间：" + dayjs(competition_info.value.start_time).format("YYYY-MM-DD HH:mm") + " - " + dayjs(competition_info.value.end_time).format("YYYY-MM-DD HH:mm") + "\n" +
    "💻 参赛方式：ByteOJ校内编程平台\n" +
    "🔗 报名链接：" + "https://www.byteoj.com/competition/" + competition_id.value + "\n\n" +
    "🚀 快来挑战，锻炼编程能力，认识更多编程高手！";

  // 将文本内容设置到文本区域
  textArea.value = customText;

  // 将文本区域添加到文档中
  document.body.appendChild(textArea);

  // 选择文本区域中的内容
  textArea.select();

  // 执行复制命令
  try {
    document.execCommand("copy");
    success("分享内容已复制到剪贴板！");
  } catch (err) {
    console.error("复制失败:", err);
    error("复制失败，请手动复制分享内容");
  }

  // 移除文本区域
  document.body.removeChild(textArea);
};

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

</script>

<template>
  <!-- 通知提示 -->
  <div
    v-if="status == 0"
    class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
  >
    <div
      class="bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-lg shadow-lg flex items-center"
    >
      <svg
        class="w-5 h-5 mr-2 text-emerald-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span class="font-medium">{{ message }}</span>
    </div>
  </div>

  <div
    v-else-if="status == 1"
    class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
  >
    <div
      class="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg shadow-lg flex items-center"
    >
      <svg
        class="w-5 h-5 mr-2 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span class="font-medium">{{ message }}</span>
    </div>
  </div>

  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- 主标题 -->
    <div class="mb-8 relative">
      <!-- 分享按钮 - 右上角 -->
      <button
        @click="shareCompetition"
        class="absolute -top-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition duration-300 flex items-center space-x-2 z-10"
        title="分享竞赛"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
          />
        </svg>
        <span class="text-sm font-medium">分享</span>
      </button>

      <h1 class="text-3xl md:text-4xl font-bold text-gray-900">
        {{ competition_info.competition_name }}
      </h1>
      <div class="mt-2 flex items-center text-gray-500">
        <svg
          class="w-5 h-5 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          {{ dayjs(competition_info.start_time).format("YYYY-MM-DD HH:mm") }} 至
          {{ dayjs(competition_info.end_time).format("YYYY-MM-DD HH:mm") }}
        </span>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- 左侧信息栏 -->
      <div class="w-full lg:w-1/3 space-y-6">
        <!-- 比赛状态卡片 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">比赛状态</h3>
            <span
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="{
                'bg-yellow-100 text-yellow-800':
                  dayjs(new Date()) < dayjs(competition_info.start_time),
                'bg-green-100 text-green-800':
                  dayjs(new Date()) >= dayjs(competition_info.start_time) &&
                  dayjs(new Date()) <= dayjs(competition_info.end_time),
                'bg-gray-100 text-gray-800':
                  dayjs(new Date()) > dayjs(competition_info.end_time),
              }"
            >
              {{
                dayjs(new Date()) < dayjs(competition_info.start_time)
                  ? "未开始"
                  : dayjs(new Date()) > dayjs(competition_info.end_time)
                  ? "已结束"
                  : "进行中"
              }}
            </span>
          </div>

          <!-- 倒计时 -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium text-gray-500">
              {{
                dayjs(new Date()) < dayjs(competition_info.start_time)
                  ? "距离比赛开始"
                  : dayjs(new Date()) > dayjs(competition_info.end_time)
                  ? "比赛已结束"
                  : "距离比赛结束"
              }}
            </h4>

            <div
              v-if="dayjs(new Date()) < dayjs(competition_info.end_time)"
              class="grid grid-cols-4 gap-2 text-center"
            >
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-2xl font-bold text-gray-900">
                  {{ day.toString().padStart(2, "0") }}
                </div>
                <div class="text-xs text-gray-500 mt-1">天</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-2xl font-bold text-gray-900">
                  {{ hour.toString().padStart(2, "0") }}
                </div>
                <div class="text-xs text-gray-500 mt-1">时</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-2xl font-bold text-gray-900">
                  {{ min.toString().padStart(2, "0") }}
                </div>
                <div class="text-xs text-gray-500 mt-1">分</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-2xl font-bold text-gray-900">
                  {{ seconds.toString().padStart(2, "0") }}
                </div>
                <div class="text-xs text-gray-500 mt-1">秒</div>
              </div>
            </div>
          </div>

          <!-- 报名按钮 -->
          <div class="mt-6">
            <button
              v-if="
                (competition_info.user_status === 1 ||
                  competition_info.user_status === 2 ||
                  competition_info.user_status === 5) &&
                competition_info.status === 0
              "
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow transition duration-300 flex items-center justify-center text-lg min-h-[56px]"
              @click="Join"
            >
              <svg
                class="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              立即报名
            </button>
            <button
              v-else-if="competition_info.user_status === 0"
              class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-lg shadow transition duration-300 flex items-center justify-center text-lg min-h-[56px]"
              @click="cancelJoin"
            >
              <svg
                class="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 12H4"
                />
              </svg>
              取消报名
            </button>
            <button
              v-else-if="
                (competition_info.user_status === 1 ||
                  competition_info.user_status === 2 ||
                  competition_info.user_status === 5) &&
                competition_info.status === 1
              "
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow transition duration-300 flex items-center justify-center text-lg min-h-[56px]"
              @click="showModal"
            >
              <svg
                class="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              报名参赛
            </button>
<!--            <button v-if="submitted && !((competition_info.user_status === 1 ||-->
<!--                  competition_info.user_status === 2 ||-->
<!--                  competition_info.user_status === 5) &&-->
<!--                competition_info.status === 1)"-->
<!--                    @click="handleSubmit"-->
<!--                    class="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow transition duration-300 flex items-center justify-center text-lg min-h-[56px]">-->
<!--              <svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">-->
<!--                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />-->
<!--              </svg>-->
<!--              提交离开比赛-->
<!--            </button>-->
          </div>
        </div>

        <!-- 比赛信息卡片 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">比赛信息</h3>

          <div class="space-y-4">
            <div class="flex items-start">
              <div class="bg-blue-50 p-2 rounded-lg mr-3">
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <div class="text-sm text-gray-500">参加人数</div>
                <div class="font-medium text-gray-900">
                  {{ competition_info.joins || 0 }}
                </div>
              </div>
            </div>

            <div class="flex items-start">
              <div class="bg-purple-50 p-2 rounded-lg mr-3">
                <svg
                  class="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <div class="text-sm text-gray-500">比赛时长</div>
                <div class="font-medium text-gray-900">
                  {{
                    parseInt(
                      String(
                        (dayjs(competition_info.end_time).valueOf() -
                          dayjs(competition_info.start_time).valueOf()) /
                          3600000
                      )
                    )
                  }}
                  小时
                </div>
              </div>
            </div>

            <div class="flex items-start">
              <div class="bg-green-50 p-2 rounded-lg mr-3">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <div class="text-sm text-gray-500">比赛类型</div>
                <div class="font-medium text-gray-900">
                  {{ competition_info.status === 0 ? "公开赛" : "邀请赛" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 比赛规则卡片 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800 flex items-center">
              <svg
                class="w-5 h-5 mr-2 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              比赛规则
            </h3>
            <span class="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
              ACM赛制
            </span>
          </div>

          <div class="space-y-3">
            <div class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span class="text-orange-700 font-bold text-sm">1</span>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-700 leading-relaxed">
                  按<span class="font-semibold text-gray-900">通过题目数量</span>排名
                </p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span class="text-orange-700 font-bold text-sm">2</span>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-700 leading-relaxed">
                  题目数相同时，<span class="font-semibold text-gray-900">罚时少</span>者排名靠前
                </p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span class="text-orange-700 font-bold text-sm">!</span>
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-700 leading-relaxed">
                  每次<span class="font-semibold text-red-600">错误提交</span>将增加 <span class="font-semibold text-red-600">5分钟</span>罚时
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div class="flex items-start">
              <svg
                class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p class="text-xs text-blue-700 leading-relaxed">
                罚时 = 通过时间 + 错误提交次数 × 5分钟
              </p>
            </div>
          </div>
        </div>

        <!-- 比赛说明摘要 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">比赛说明</h3>
          <div class="prose prose-sm max-w-none text-gray-600">
            <MarkdownView
              :generateData="
                competition_info.description?.substring(0, 200) +
                (competition_info.description?.length > 200 ? '...' : '')
              "
            />
          </div>
          <button
            @click="changeShow(0)"
            class="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            查看完整说明
            <svg
              class="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="w-full lg:w-2/3" :class="{ 'fullscreen-rank-wrapper': isRankFullscreen }">
        <!-- 标签页导航 -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div class="flex overflow-x-auto items-center justify-between">
            <div class="flex overflow-x-auto flex-1">
            <button
              id="0"
              class="px-5 py-3 text-sm font-medium border-b-2 transition duration-300 whitespace-nowrap"
              :class="
                isShow === 0
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              "
              @click="changeShow(0)"
            >
              <span class="flex items-center">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                比赛说明
              </span>
            </button>
            <button
              id="1"
              class="px-5 py-3 text-sm font-medium border-b-2 transition duration-300 whitespace-nowrap"
              :class="
                isShow === 1
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              "
              @click="changeShow(1)"
            >
              <span class="flex items-center">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                题目
              </span>
            </button>
            <button
              id="2"
              class="px-5 py-3 text-sm font-medium border-b-2 transition duration-300 whitespace-nowrap"
              :class="
                isShow === 2
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              "
              @click="changeShow(2)"
            >
              <span class="flex items-center">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                提交记录
              </span>
            </button>
            <button
              id="3"
              class="px-5 py-3 text-sm font-medium border-b-2 transition duration-300 whitespace-nowrap"
              :class="
                isShow === 3
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              "
              @click="changeShow(3)"
            >
              <span class="flex items-center">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                榜单
              </span>
            </button>
            <button
              id="4"
              class="px-5 py-3 text-sm font-medium border-b-2 transition duration-300 whitespace-nowrap"
              :class="
                isShow === 4
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              "
              @click="changeShow(4)"
            >
              <span class="flex items-center">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                赛后讨论
              </span>
            </button>
            <button
              v-if="competition_info.isCreated === 0"
              id="5"
              class="px-5 py-3 text-sm font-medium border-b-2 transition duration-300 whitespace-nowrap"
              :class="
                isShow === 5
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              "
              @click="changeShow(5)"
            >
              <span class="flex items-center">
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                管理员管理
              </span>
            </button>
            </div>
            
            <!-- 全屏按钮 -->
            <button
              v-if="isShow === 3"
              class="fullscreen-toggle-btn-nav"
              @click="toggleRankFullscreen"
              :title="isRankFullscreen ? '退出全屏 (ESC)' : '全屏查看榜单'"
            >
              <svg v-if="!isRankFullscreen" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
              </svg>
            </button>
          </div>

          <!-- 标签页内容 -->
          <div class="p-6">
            <div v-show="isShow === 0">
              <MarkdownView :generateData="competition_info.description" />
            </div>

            <div v-if="isShow === 1">
              <CompetitionContentProblemShowView />
            </div>

            <div v-if="isShow === 2">
              <CompetitionContentRecordsView />
            </div>

            <div v-if="isShow === 3">
              <CompetitionContentRankView />
            </div>

            <div v-if="isShow === 4" class="text-center py-12">
              <div class="inline-block p-8 bg-gray-50 rounded-xl">
                <svg
                  class="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 class="text-xl font-bold text-gray-600 mt-4">
                  赛后讨论功能即将上线
                </h3>
                <p class="text-gray-500 mt-2">
                  我们正在努力开发这个功能，敬请期待
                </p>
              </div>
            </div>

            <div v-if="isShow === 5">
              <CompetitionContentControlView />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 密码输入模态框 -->
  <dialog id="my_modal" class="modal backdrop-blur-sm">
    <div class="modal-box bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl max-w-md p-8 border border-gray-100 z-[101]">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold text-gray-800">
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
          比赛邀请码
        </span>
        </h3>
        <button class="hover:bg-gray-100 transition" onclick="my_modal.close()">
          <svg t="1752501270969" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4601" width="48" height="48"><path d="M512 127.99c-212.2 0-384.22 172.02-384.22 384.22S299.8 896.42 512 896.42 896.22 724.4 896.22 512.21 724.2 127.99 512 127.99z m177.7 518.24c11.72 11.72 11.72 30.71 0 42.43s-30.71 11.72-42.43 0L512.93 554.3 378.58 688.65c-11.72 11.72-30.71 11.72-42.43 0-11.72-11.72-11.72-30.71 0-42.43L470.5 511.88 336.15 377.53c-11.72-11.72-11.72-30.71 0-42.43 11.72-11.72 30.71-11.72 42.43 0l134.35 134.35L647.28 335.1c11.72-11.72 30.71-11.72 42.43 0 11.72 11.72 11.72 30.71 0 42.43L555.35 511.88 689.7 646.23z" fill="#1296db" p-id="4602"></path></svg>
        </button>
      </div>
      <p class="text-gray-600 mb-6 text-sm leading-relaxed">
        这场比赛需要邀请码才能参加，请输入比赛邀请码：
      </p>
      <input
          type="password"
          placeholder="请输入比赛邀请码"
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all duration-200 placeholder-gray-400"
          v-model="password"
      />
      <div style="color: red; font-weight: bold">{{message}}</div>
      <div class="modal-action mt-8 flex justify-end space-x-3">
        <button
            class="bg-white hover:bg-gray-50 text-gray-600 font-medium py-2.5 px-5 rounded-xl shadow-sm hover:shadow transition-all duration-200 border border-gray-200"
            onclick="my_modal.close()"
        >
          取消
        </button>
        <button
            class="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            @click="Join"
        >
          确认
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
/* ===== 强制不透明背景系统 ===== */
/* 基础容器 */
.container {
  background-color: #ffffff !important; /* 纯白背景 */
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 卡片组件 */
.card {
  background-color: #ffffff !important; /* 纯白背景 */
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

/* 标签页容器 */
.tab-container {
  background-color: #ffffff !important; /* 纯白背景 */
  border-radius: 0.75rem;
  overflow: hidden;
}

/* 标签页头部 */
.tab-header {
  background-color: #f9fafb !important; /* 浅灰背景 */
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

/* 标签内容区 */
.tab-content {
  background-color: #ffffff !important; /* 纯白背景 */
  padding: 1.5rem;
}

/* 按钮 */
.btn {
  background-color: #3b82f6 !important; /* 蓝色背景 */
  color: white !important;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: none;
}

/* 模态框 */
.modal {
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid #e5e7eb;
}

/* 表格 */
.table {
  background-color: #ffffff !important; /* 纯白背景 */
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.table-cell {
  background-color: #ffffff !important; /* 纯白背景 */
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

/* 状态标签 */
.status-badge {
  background-color: #f3f4f6 !important; /* 浅灰背景 */
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  display: inline-block;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .container {
    padding: 1.5rem !important;
  }
  .card,
  .tab-content {
    padding: 1.25rem !important;
  }
}

/* ===== 防透明保障措施 ===== */
/* 1. 强制覆盖所有可能继承的透明属性 */
div,
section,
article,
aside,
header,
footer,
li,
ul,
ol {
  background-color: inherit !important;
  opacity: 1 !important;
}

/* 2. 为可能被覆盖的元素添加保护层 */
.protective-layer {
  position: relative;
}

.protective-layer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff !important;
  border-radius: inherit;
  z-index: -1;
}

/* 3. 文本内容防透明 */
.text-content {
  color: inherit !important;
  mix-blend-mode: normal !important;
}

/* 全屏榜单样式 */
.fullscreen-rank-wrapper {
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100vh;
  margin: 0 !important;
  background-color: #ffffff;
  z-index: 9999;
  padding: 20px;
  overflow: auto;
}

/* 全屏模式下的内容容器 */
.fullscreen-rank-wrapper .bg-white {
  max-width: 100% !important;
}

/* 全屏模式下的榜单容器 */
.fullscreen-rank-wrapper :deep(.ranking-container) {
  max-width: 100% !important;
  width: 100% !important;
}

/* 全屏模式下的表格包装器 */
.fullscreen-rank-wrapper :deep(.table-wrapper) {
  max-height: calc(100vh - 200px) !important;
  overflow: auto !important;
}

/* 全屏模式下的分页 */
.fullscreen-rank-wrapper :deep(.pagination) {
  position: sticky;
  bottom: 0;
  background-color: #ffffff;
  padding: 15px 0;
  border-top: 1px solid #e0e0e0;
  margin-top: 0;
}

/* 全屏按钮样式 */
.fullscreen-toggle-btn-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  margin-right: 8px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.fullscreen-toggle-btn-nav:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

.fullscreen-toggle-btn-nav:active {
  transform: translateY(0);
}

.fullscreen-toggle-btn-nav svg {
  flex-shrink: 0;
}
</style>