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
// 当前时间
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
// 时间戳转时分秒
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

// 初始化获取剩余时间
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
    console.log(hour.value);
    console.log(min.value);
    console.log(seconds.value);
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
  console.log(showDialog.value);
};
const closeDialog = () => {
  showDialog.value = false;
  console.log(showDialog.value);
};
// 报名
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

// 取消报名
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

// 展示密码框
const showModal = () => {
  let el: any = document.getElementById("my_modal");
  el?.showModal();
};

// 0表示比赛说明，1表示题目，2表示提交记录，3表示榜单，4表示赛后讨论
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
  <div role="alert" class="alert alert-success" v-if="status == 0">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      class="stroke-info h-6 w-6 shrink-0"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
    <span>{{ message }}</span>
  </div>

  <div role="alert" class="alert alert-error" v-else-if="status == 1">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 shrink-0 stroke-current"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span>{{ message }}</span>
  </div>
  <div class="mx-auto" style="max-width: 1250px">
    <div class="card-plus card shadow-xl bg-white rounded-2xl">
      <div id="header" class="rounded-2xl flex">
        <div id="header-content" class="mx-auto text-white w-7/12">
          <div class="px-12 py-12">
            <div class="font-bold" style="font-size: 36px">
              {{ competition_info.competition_name }}
            </div>
            <div class="my-5" style="font-size: 20px">
              <span class="font-bold">比赛时间：</span>
              <span
                >{{
                  dayjs(competition_info.start_time).format("YYYY-MM-DD HH:mm")
                }}
                至
                {{
                  dayjs(competition_info.end_time).format("YYYY-MM-DD HH:mm")
                }}</span
              >
            </div>
            <div class="my-5" style="font-size: 20px">
              <span class="font-bold">参加人数：</span>
              <span>{{ competition_info.joins }}</span>
            </div>
            <div class="my-5" style="font-size: 20px">
              <span class="font-bold">时长：</span>
              <span>{{
                parseInt(
                  String(
                    (dayjs(competition_info.end_time).valueOf() -
                      dayjs(competition_info.start_time).valueOf()) /
                      3600000
                  )
                )
              }}</span>
              <span class="font-bold">h</span>
            </div>
          </div>
        </div>
      </div>
      <div id="content"></div>
      <div
        v-if="dayjs(new Date()) < dayjs(competition_info.start_time)"
        class="m-auto font-bold"
        style="font-size: 24px"
      >
        距离比赛开始
      </div>
      <div
        v-else-if="dayjs(new Date()) > dayjs(competition_info.end_time)"
        class="m-auto font-bold"
        style="font-size: 100px"
      >
        比赛已结束
      </div>
      <div v-else class="m-auto font-bold text-warning" style="font-size: 24px">
        距离比赛结束还有
      </div>
      <div
        v-if="dayjs(new Date()) < dayjs(competition_info.end_time)"
        style="font-size: 24px"
        class="grid auto-cols-max grid-flow-col gap-5 text-center m-auto my-5"
      >
        <div
          class="bg-neutral rounded-box text-neutral-content flex flex-col p-2"
        >
          <span class="countdown font-mono text-7xl">
            <span :style="'--value:' + day"></span>
          </span>
          days
        </div>
        <div
          class="bg-neutral rounded-box text-neutral-content flex flex-col p-2"
        >
          <span class="countdown font-mono text-7xl">
            <span :style="'--value:' + hour"></span>
          </span>
          hours
        </div>
        <div
          class="bg-neutral rounded-box text-neutral-content flex flex-col p-2"
        >
          <span class="countdown font-mono text-7xl">
            <span :style="'--value:' + min"></span>
          </span>
          min
        </div>
        <div
          class="bg-neutral rounded-box text-neutral-content flex flex-col p-2"
        >
          <span class="countdown font-mono text-7xl">
            <span :style="'--value:' + seconds"></span>
          </span>
          sec
        </div>
      </div>
      <button
        v-if="
          (competition_info.user_status === 1 ||
            competition_info.user_status === 2 ||
            competition_info.user_status === 5) &&
          competition_info.status === 0
        "
        class="btn btn-success w-1/3 m-auto text-white"
        style="font-size: 20px"
        @click="Join"
      >
        报名
      </button>
      <button
        v-else-if="competition_info.user_status === 0"
        class="btn btn-error w-1/3 m-auto text-white"
        style="font-size: 20px"
        @click="cancelJoin"
      >
        取消报名
      </button>
      <!-- Open the modal using ID.showModal() method -->
      <button
        v-else-if="
          (competition_info.user_status === 1 ||
            competition_info.user_status === 2 ||
            competition_info.user_status === 5) &&
          competition_info.status === 1
        "
        class="btn btn-success w-1/3 m-auto text-white"
        @click="showModal"
        style="font-size: 20px"
      >
        报名
      </button>
      <dialog id="my_modal" class="modal">
        <div class="modal-box">
          <h3 class="text-lg font-bold">你好</h3>
          <p class="py-4">这场比赛并非一场公开比赛，请输入比赛邀请码：</p>
          <input
            type="password"
            placeholder="输入比赛邀请码"
            class="input input-bordered input-primary w-full"
            v-model="password"
          />
          <div class="modal-action">
            <form method="dialog">
              <button class="btn m-auto" @click="Join">确认</button>
            </form>
          </div>
        </div>
      </dialog>
      <div class="divider"></div>
      <div class="flex">
        <div role="tablist" class="tabs tabs-bordered tabs-lg mx-auto w-5/6">
          <input
            id="0"
            type="radio"
            name="my_tabs_1"
            role="tab"
            class="tab tab-border-3"
            aria-label="比赛说明"
            style="white-space: nowrap"
            @click="changeShow(0)"
          />
          <div
            v-show="isShow === 0"
            role="tabpanel"
            class="tab-content p-10 bg-gray-100 mt-10"
          >
            <MarkdownView
              class="bg-gray-100"
              :generateData="competition_info.description"
            />
          </div>

          <input
            id="1"
            type="radio"
            name="my_tabs_1"
            role="tab"
            class="tab tab-border-3"
            aria-label="题目"
            checked="checked"
            style="white-space: nowrap"
            @click="changeShow(1)"
          />
          <div v-if="isShow === 1" role="tabpanel" class="tab-content py-10">
            <CompetitionContentProblemShowView />
          </div>

          <input
            id="2"
            type="radio"
            name="my_tabs_1"
            role="tab"
            class="tab tab-border-3"
            aria-label="提交记录"
            style="white-space: nowrap"
            @click="changeShow(2)"
          />
          <div v-if="isShow === 2" role="tabpanel" class="tab-content py-10">
            <CompetitionContentRecordsView />
          </div>
          <input
            id="3"
            type="radio"
            name="my_tabs_1"
            role="tab"
            class="tab tab-border-3"
            aria-label="榜单"
            style="white-space: nowrap"
            @click="changeShow(3)"
          />
          <div v-if="isShow === 3" role="tabpanel" class="tab-content py-10">
            <CompetitionContentRankView />
          </div>
          <input
            id="4"
            type="radio"
            name="my_tabs_1"
            role="tab"
            class="tab tab-border-3"
            aria-label="赛后讨论"
            style="white-space: nowrap"
            @click="changeShow(4)"
          />
          <div v-if="isShow === 4" role="tabpanel" class="tab-content p-10">
            敬请期待......
          </div>
          <input
            v-if="competition_info.isCreated === 0"
            id="5"
            type="radio"
            name="my_tabs_1"
            role="tab"
            class="tab tab-border-3"
            aria-label="管理员管理"
            style="white-space: nowrap"
            @click="changeShow(5)"
          />
          <div v-if="isShow === 5" role="tabpanel" class="tab-content p-10">
            <CompetitionContentControlView />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#header {
  background: #232526; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #414345,
    #232526
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #414345,
    #232526
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

#header-content {
}

.alert-success {
  animation: alert-success 3s 1;
}

@keyframes alert-success {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.alert-error {
  animation: alert-error 3s 1;
}

@keyframes alert-error {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
