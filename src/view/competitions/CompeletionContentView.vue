<script setup lang="ts">
import { onMounted, ref, Ref, UnwrapRef } from "vue";
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

const dayjs = require("dayjs");
const useStore = UserStore();
const router = useRouter();
const path = router.currentRoute.value.fullPath;

const competition_id = ref(parseInt(path.toString().split("/")[2]));
const current_time = new Date();
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
  }
});

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
    message.value = "恭喜，报名成功！！！";
    status.value = 0;
  } else {
    message.value = res.message;
    status.value = 1;
  }
  setTimeout(() => {
    status.value = null;
    window.location.reload();
  }, 3000);
};

const cancelJoin = async () => {
  const res =
    await CompetitionControllerService.competitionUserJoinCancelUsingPost(
      competition_id.value
    );

  if (res.code === 0) {
    message.value = "已经成功取消报名";
    status.value = 0;
  } else {
    message.value = res.message;
    status.value = 1;
  }
  setTimeout(() => {
    status.value = null;
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
    <div class="mb-8">
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
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow transition duration-300 flex items-center justify-center"
              @click="Join"
            >
              <svg
                class="w-5 h-5 mr-2"
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
              class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg shadow transition duration-300 flex items-center justify-center"
              @click="cancelJoin"
            >
              <svg
                class="w-5 h-5 mr-2"
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
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg shadow transition duration-300 flex items-center justify-center"
              @click="showModal"
            >
              <svg
                class="w-5 h-5 mr-2"
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
      <div class="w-full lg:w-2/3">
        <!-- 标签页导航 -->
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div class="flex overflow-x-auto">
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
  <dialog id="my_modal" class="modal">
    <div class="modal-box bg-white rounded-lg shadow-xl max-w-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold text-gray-800">比赛邀请码</h3>
        <button class="btn btn-sm btn-ghost" onclick="my_modal.close()">
          <svg
            class="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <p class="text-gray-600 mb-4">
        这场比赛需要邀请码才能参加，请输入比赛邀请码：
      </p>
      <input
        type="password"
        placeholder="请输入比赛邀请码"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        v-model="password"
      />
      <div class="modal-action mt-6">
        <button
          class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg shadow transition duration-300 mr-2"
          onclick="my_modal.close()"
        >
          取消
        </button>
        <button
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-300"
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
  background-color: #ffffff !important; /* 纯白背景 */
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
</style>
