<script setup lang="ts">
import { nextTick, onMounted, ref, Ref, watch } from "vue";
import {
  CompetitionAddRequest,
  CompetitionControllerService,
} from "../../../../../generated";
import TimeLineView from "@/view/components/TimeLineView.vue";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import router from "@/router";
import UserStore from "@/store/user";
import dayjs from "dayjs";

const useStore = UserStore();
const currentDate = dayjs(new Date());
const problem_list: Ref<any> = ref(
  localStorage.getItem("checked_problem_list") != null
    ? JSON.parse(localStorage.getItem("checked_problem_list") ?? "")
    : []
);

const competition_info: Ref<CompetitionAddRequest | undefined> = ref(
  localStorage.getItem("competition_info") != null
    ? JSON.parse(localStorage.getItem("competition_info") ?? "")
    : ({} as CompetitionAddRequest)
);

const problem_num = ref(1300);
const word_list: Ref<string[]> = ref([
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
]);

// 删除某个题目
const deleteProblem = (problem_id: number) => {
  problem_list.value = problem_list.value.filter(
    (problem: any) => problem.problem_id != problem_id
  );
  console.log(problem_list.value.length);
};

// 向上交换
const upSwap = (index: any) => {
  if (index > 0 && index < problem_list.value.length) {
    [problem_list.value[index], problem_list.value[index - 1]] = [
      problem_list.value[index - 1],
      problem_list.value[index],
    ];
  }
};

// 向下交换
const downSwap = (index: any) => {
  if (index >= 0 && index < problem_list.value.length - 1) {
    [problem_list.value[index], problem_list.value[index + 1]] = [
      problem_list.value[index + 1],
      problem_list.value[index],
    ];
  }
};

// 悬窗效果
const modalClick = (problem_id: number | undefined) => {
  const el: any = document.getElementById("my_modal_" + problem_id);
  if (el != null) {
    el.showModal();
  }
};
const reBack = () => {
  router.replace("/competition/user/add/1/select");
};

const isAnyEmpty = async () => {
  let el: any = document.getElementById("Loading");
  if (el != null) {
    el.showModal();
  }
  if (competition_info.value == undefined) {
    return;
  }
  competition_info.value.algorithm_problem_list = [];
  competition_info.value.created_by = useStore.loginUser.uuid;
  if (problem_list.value.length <= 26) {
    for (let item = 0; item < problem_list.value.length; item++) {
      competition_info.value?.algorithm_problem_list.push({
        index: word_list.value[item],
        problem_id: problem_list.value[item].problem_id,
        problem_name: problem_list.value[item].problem_name,
      });
    }
  } else {
    for (let item = 0; item < problem_list.value.length; item++) {
      competition_info.value?.algorithm_problem_list.push({
        index: (item + 1).toString(),
        problem_id: problem_list.value.problem_id,
        problem_name: problem_list.value.problem_id,
      });
    }
  }

  const res = await CompetitionControllerService.competitionAddByUserUsingPost(
    competition_info.value
  );
  if (res.code === 0) {
    competition_info.value.competition_id = res.data;
    problem_list.value.index_list = [];
    if (problem_list.value.length <= 26) {
      for (let item = 0; item < problem_list.value.length; item++) {
        problem_list.value.index_list.push(word_list.value[item]);
      }
    } else {
      for (let item = 0; item < problem_list.value.length; item++) {
        problem_list.value.index_list.push(problem_list.value[item].problem_id);
      }
    }

    competition_info.value.algorithm_problem_list = problem_list.value;
    localStorage.setItem(
      "competition_info",
      JSON.stringify(competition_info.value)
    );
    setTimeout(() => {
      el.close();
      router.replace("/competition/user/add/1/success");
    }, 2000);
  }
};

// 检查数据合理性
const checkReasonAbility = () => {
  let flag = 0;
  if (
    competition_info.value?.competition_name == null ||
    competition_info.value?.competition_name == ""
  ) {
    flag = 1;
  }

  if (
    competition_info.value?.start_time == null ||
    competition_info.value?.start_time == ""
  ) {
    flag = 1;
  } else if (
    competition_info.value?.start_time < currentDate.format("YYYY-MM-DD")
  ) {
    flag = 1;
  }

  if (
    competition_info.value?.end_time == null ||
    competition_info.value?.end_time == ""
  ) {
    flag = 1;
  } else if (
    (competition_info.value?.start_time != null ||
      competition_info.value?.start_time != "") &&
    competition_info.value?.start_time != undefined &&
    competition_info.value?.end_time < competition_info.value?.start_time
  ) {
    flag = 1;
  }

  if (competition_info.value?.pattern == null) {
    flag = 1;
  }

  if (
    competition_info.value?.description == null ||
    competition_info.value?.description == ""
  ) {
    flag = 1;
  }

  if (
    competition_info.value?.status == 1 &&
    competition_info.value?.password == ""
  ) {
    flag = 1;
  } else if (
    competition_info.value?.status == 0 &&
    competition_info.value?.password != ""
  ) {
    competition_info.value.password = "";
  }

  if (competition_info.value?.avatar == null) {
    if (competition_info.value == undefined) {
      competition_info.value = {} as CompetitionAddRequest;
    }
    competition_info.value.avatar = useStore.loginUser.avatar;
  }
  if (flag) {
    router.replace("/competition/user/add/1/info");
  }
};
onMounted(() => {
  checkReasonAbility();
});
// 实时监听选中题目列表
watch(
  problem_list,
  (newValue, OldValue) => {
    nextTick(() => {
      localStorage.setItem("checked_problem_list", JSON.stringify(newValue));

      if (competition_info.value != null) {
        competition_info.value.algorithm_problem_list = [];
        for (let item = 0; item < newValue.length; item++) {
          competition_info.value.algorithm_problem_list.push(
            newValue[item].problem_id
          );
        }
        localStorage.setItem(
          "competition_info",
          JSON.stringify(competition_info.value)
        );
      }
    });
  },
  { deep: true }
);
</script>

<template>
  <div class="card mx-40 text-sm">
    <div class="card-body bg-white rounded-2xl">
      <TimeLineView />

      <div class="divider"></div>
      <div
        class="mt-4 flex"
        v-for="(problem, index) in problem_list"
        :key="problem.problem_id"
      >
        <span class="text-lg font-bold mr-4" v-if="problem_list.length <= 26">{{
          word_list[index]
        }}</span>
        <span class="text-lg font-bold mr-4" v-else>{{
          problem_num + index
        }}</span>
        <input
          type="text"
          :placeholder="problem.problem_id + '-' + problem.problem_name"
          class="input input-bordered mr-4 w-5/12"
          disabled
        />
        <input
          type="text"
          placeholder="请输入修改后的标题名称"
          v-model="problem.problem_name"
          class="input input-bordered mr-4 w-5/12"
        />

        <button @click="modalClick(problem.problem_id)">
          <svg
            id="show"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
          >
            <path
              fill="#999999"
              d="M21.773 14.768c-.029.414-.186.81-.45 1.13a1.892 1.892 0 0 1-.998.63l-3.157.521l-.09.09a.381.381 0 0 0-.09.15l-.5 2.902a1.922 1.922 0 0 1-1.778 1.471h-.09c-.374 0-.74-.111-1.05-.32a1.911 1.911 0 0 1-.739-.92l-2.787-7.906a1.904 1.904 0 0 1 .45-2.001c.253-.263.58-.44.939-.51a1.866 1.866 0 0 1 1.069.07l7.992 2.781c.404.135.754.394 1 .74c.215.351.313.761.28 1.172"
            />
            <path
              fill="#999999"
              d="M9.305 22.243a.834.834 0 0 1-.22 0a10.469 10.469 0 0 1-4.5-2.83a10.491 10.491 0 0 1-2.448-10A10.49 10.49 0 0 1 4.82 4.819a10.467 10.467 0 0 1 9.902-2.765a10.466 10.466 0 0 1 4.669 2.54a10.49 10.49 0 0 1 2.822 4.51a.743.743 0 0 1-1.059.886a.76.76 0 0 1-.37-.436a9.008 9.008 0 0 0-2.41-3.894a8.988 8.988 0 0 0-8.585-2.143a8.989 8.989 0 0 0-3.953 2.306a9.01 9.01 0 0 0-2.377 8.536a8.99 8.99 0 0 0 6.075 6.443a.77.77 0 0 1 .49 1a.75.75 0 0 1-.72.44"
            />
          </svg>
        </button>
        <dialog :id="'my_modal_' + problem.problem_id" class="modal">
          <div class="modal-box w-11/12 max-w-5xl">
            <div class="text-2xl font-bold">编程题预览</div>
            <form method="dialog">
              <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-lg bg-blue-500 text-white"
              >
                ✕
              </button>
            </form>
            <MarkdownView :generateData="problem.description" />
            <form method="dialog">
              <button
                class="btn btn-lg btn-primary text-white my-8 float-right text-xl"
              >
                关闭
              </button>
            </form>
          </div>
        </dialog>
        <button
          @click="deleteProblem(problem.problem_id ?? 0)"
          v-if="problem_list.length != 1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
          >
            <path
              fill="#999999"
              d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"
            />
          </svg>
        </button>
        <button @click="upSwap(index)" v-if="problem_list.length != 1">
          <svg
            id="up"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 48 48"
          >
            <path
              fill="#666666"
              stroke="#666666"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 24L24 6l19 18H31v18H17V24z"
            />
          </svg>
        </button>
        <button @click="downSwap(index)" v-if="problem_list.length != 1">
          <svg
            id="down"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 48 48"
          >
            <path
              fill="#a8a8a8"
              stroke="#a8a8a8"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m5 24l19 18l19-18H31V6H17v18z"
            />
          </svg>
        </button>
      </div>
      <div class="flex mt-4">
        <button class="btn bg-gray-500 text-white text-xl" @click="reBack">
          返回上一级
        </button>
        <div class="flex-1"></div>
        <button class="btn bg-blue-500 text-white text-xl" @click="isAnyEmpty">
          创建比赛
        </button>
      </div>
    </div>
  </div>
  <dialog id="Loading" class="modal">
    <div class="modal-box w-11/12 max-w-3xl">
      <form method="dialog">
        <button
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-lg bg-blue-500 text-white"
        >
          ✕
        </button>
      </form>
      <div class="flex my-16 mx-48">
        <div class="text-center mx-auto">
          <span class="loading loading-dots loading-lg"></span>
        </div>
        <div class="text-3xl font-bold m-auto">请稍等，创建中</div>
      </div>
      <form method="dialog" class="float-right">
        <button class="btn text-lg bg-blue-500 text-white">关闭</button>
      </form>
    </div>
  </dialog>
</template>

<style scoped>
svg:hover path {
  fill: #3b82f6;
}
</style>
