<script setup lang="ts">
import { onMounted, Ref, ref, UnwrapRef } from "vue";
import { useRouter } from "vue-router";
import {
  CompetitionControllerService,
  CompetitionInfoVo,
  ProblemAlgorithmControllerService,
  UserVo,
} from "../../../generated";
import UserStore from "@/store/user";

const dayjs = require("dayjs");

const router = useRouter();
const useStore = UserStore();
const path = router.currentRoute.value.fullPath + "/";
const currentPage = ref(1);
const PageSum: Ref<number | undefined> = ref(1);
const competition_list: Ref<CompetitionInfoVo[]> = ref([]);
const checked: Ref<number> = ref(0);
// 排行榜前十名用户
const user_top: Ref<UserVo[]> = ref([]);
// 各个分数对应颜色
const rated_color_list: UnwrapRef<string[]> = useStore.rated_color_list;
// 最后一次题目
const last_problem: Ref<any> = ref({});
onMounted(async () => {
  const res1 =
    await CompetitionControllerService.competitionSearchByPageUsingPost(
      currentPage.value
    );

  if (res1.code === 0) {
    competition_list.value = res1.data;
    PageSum.value = competition_list.value[0].page_Sum;
  } else if (res1.code === 40101) {
    await router.push("/404");
  }

  const res2 =
    await CompetitionControllerService.competitionSearchRankTop10UsingPost();
  if (res2.code === 0) {
    user_top.value = res2.data;
    console.log(user_top.value);
  }

  const res3 =
    await ProblemAlgorithmControllerService.problemAlgorithmUserLastUsingGet();
  if (res3.code === 0) {
    last_problem.value = res3.data;
  }
});

const PageClick = async (Page: number) => {
  if (Page <= 0 || Page > PageSum.value) {
    return;
  }

  const res =
    await CompetitionControllerService.competitionSearchByPageUsingPost(Page);

  if (res.code === 0) {
    competition_list.value = res.data;
    currentPage.value = Page;
  } else {
    console.log(res.message);
  }
};

// 确定当前选中的比赛创建类型
const checkCompetition = (num: number) => {
  checked.value = num;
};
</script>

<template>
  <div class="flex mx-auto" style="max-width: 1550px">
    <div class="flex-1 ml-28 mr-12 w-2/3">
      <div class="card align-center bg-white w-full my-4 p-4">
        <div class="flex">
          <div class="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 512 512"
            >
              <path
                fill="#3B82F6"
                d="M18.506 19.895v37.56L135.11 174.06l33.755-33.757L48.97 19.895H18.507zm296.924 81.607c-8.398 17.695-17.58 34.514-27.555 50.48c53.052 55.6 109.094 165.155 145.602 270.827l6.332 18.327l-18.28-6.467c-104.687-37.034-220.62-91.264-274.374-141.967c-15.972 9.98-32.793 19.165-50.49 27.563c53.693 35.685 121.57 69.222 189.496 95.166c-14.437 7.188-29.938 13.59-46.58 19.27l.002.003c68.264 38.63 175.57 65.47 254.412 64.127c1.33-78.052-27.08-188.95-64.127-254.416c-5.76 16.87-12.257 32.57-19.56 47.166c-26.458-69.205-60.387-138.182-94.88-190.08zm-117.858 36.523L135.79 199.81c34.207 31.62 67.775 56.763 94.798 71.598c14.454 7.935 27.094 12.95 36.334 14.762s13.778.34 15.564-1.445s3.26-6.326 1.448-15.565s-6.83-21.88-14.764-36.334c-14.835-27.023-39.976-60.59-71.598-94.8zm79.762 30.08q-6.99 10.214-14.457 19.926c8.892 12.557 16.52 24.587 22.676 35.802c8.515 15.51 14.306 29.43 16.718 41.73c2.414 12.3 1.528 24.28-6.57 32.377c-8.096 8.096-20.076 8.982-32.376 6.57c-12.3-2.413-26.22-8.206-41.73-16.72c-11.1-6.094-23-13.632-35.414-22.405a448 448 0 0 1-22.877 16.76c47.263 42.21 149.664 92.317 245.545 127.873c-35.19-95.766-86.347-192.602-131.514-241.913z"
              />
            </svg>
            <span class="text-red-400 font-bold text-2xl my-auto"
              >等你来战</span
            >
          </div>
          <div class="flex-1"></div>
          <button
            class="btn text-white bg-blue-300 hover:bg-blue-500 active:bg-blue-600 text-2xl font-bold"
            onclick="my_modal_3.showModal()"
          >
            创建比赛
          </button>
          <!-- You can open the modal using ID.showModal() method -->
          <dialog id="my_modal_3" class="modal">
            <div class="modal-box w-11/12 max-w-2xl">
              <form method="dialog">
                <button
                  class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                >
                  ✕
                </button>
              </form>
              <h3 class="font-bold text-xl">请选择创建比赛种类</h3>
              <div class="divider"></div>
              <button
                :class="
                  'flex flex-row shadow-gray-200 shadow-2xl py-4 my-4 border-2 border-gray-200 w-full ' +
                  (checked == 1 ? 'border-sky-500' : '')
                "
                @click="checkCompetition(1)"
              >
                <div class="basis-7/12">
                  <div class="flex pl-16">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#3B82F6"
                        d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm10.15-2h2.125L19 17.275V16h-.85zm-7.5-5l3.025-3l2 2l5.075-5.1l-1.4-1.4l-3.675 3.675l-2-2L6.25 12.6zM5 19h.85l3-3H6.725L5 17.725zm8.525 0l3-3H14.4l-3 3zM9.8 19l3-3h-2.125l-3 3z"
                      />
                    </svg>
                    <div class="text-2xl py-6 font-bold">个人编程创建赛</div>
                  </div>
                  <div class="text-gray-400 font-bold text-sm">
                    *仅仅运行选择题库题目，自行创建比赛
                  </div>
                </div>
                <div class="basis-5/12 text-gray-400">
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#3B82F6"
                        fill-rule="evenodd"
                        stroke="#3B82F6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="4"
                        d="m4 24l5-5l10 10L39 9l5 5l-25 25z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="pl-1 text-sm">支持设置比赛密码</span>
                  </div>
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#3B82F6"
                        fill-rule="evenodd"
                        stroke="#3B82F6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="4"
                        d="m4 24l5-5l10 10L39 9l5 5l-25 25z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="pl-1 text-sm">支持是使用公共题库</span>
                  </div>
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#3B82F6"
                        fill-rule="evenodd"
                        stroke="#3B82F6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="4"
                        d="m4 24l5-5l10 10L39 9l5 5l-25 25z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="pl-1 text-sm"
                      >仅支持OI赛制(OI，后续将继续扩展)</span
                    >
                  </div>
                </div>
              </button>
              <button
                :class="
                  'flex flex-row shadow-gray-200 shadow-2xl py-4  my-4 border-2 border-gray-200 w-full ' +
                  (checked == 2 ? 'border-sky-500' : '')
                "
                @click="checkCompetition(2)"
              >
                <div class="basis-7/12 pl-16">
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#3B82F6"
                        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m-3.1 3.9s-.7-.3-1-.3c-.6-.1-1 .1-1.2 1.1L12 16.8c-.2.8-.5 1.4-1 1.8c-.4.3-.8.4-1.3.4c-.8 0-2-.5-2-.5l.5-1.4s.8.3 1 .3c.3.1.5 0 .7-.1s.3-.4.4-.7l1.6-9.2c.1-.8.5-1.4 1-1.9c.6-.4 1.3-.5 2.1-.4c.7.1 1.5.5 1.5.5z"
                      />
                    </svg>
                    <div class="text-2xl py-6 font-bold">个人数学创建赛</div>
                  </div>
                  <div class="text-gray-400 font-bold text-sm">
                    *仅仅运行选择题库题目，自行创建比赛
                  </div>
                </div>
                <div class="basis-5/12 text-gray-400">
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#3B82F6"
                        fill-rule="evenodd"
                        stroke="#3B82F6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="4"
                        d="m4 24l5-5l10 10L39 9l5 5l-25 25z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="pl-1 text-sm">支持设置比赛密码</span>
                  </div>
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#3B82F6"
                        fill-rule="evenodd"
                        stroke="#3B82F6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="4"
                        d="m4 24l5-5l10 10L39 9l5 5l-25 25z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="pl-1 text-sm">支持是使用公共题库</span>
                  </div>
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#3B82F6"
                        fill-rule="evenodd"
                        stroke="#3B82F6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="4"
                        d="m4 24l5-5l10 10L39 9l5 5l-25 25z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="pl-1 text-sm"
                      >仅支持OI赛制(OI，后续将继续扩展)</span
                    >
                  </div>
                </div>
              </button>
              <button
                :class="
                  'flex flex-row shadow-gray-200 shadow-2xl py-4 my-4 border-2 border-gray-200 w-full ' +
                  (checked == 3 ? 'border-sky-500' : '')
                "
                @click="checkCompetition(3)"
              >
                <div class="basis-7/12 pl-16">
                  <div class="flex align-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="80"
                      height="80"
                      viewBox="0 0 48 48"
                    >
                      <defs>
                        <mask id="IconifyId1913a427b121fac716">
                          <g fill="none" stroke="#fff" stroke-width="4">
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M19 32h10v9H19z"
                            />
                            <rect
                              width="38"
                              height="24"
                              x="5"
                              y="8"
                              fill="#555"
                              rx="2"
                            />
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M22 27h4M14 41h20"
                            />
                          </g>
                        </mask>
                      </defs>
                      <path
                        fill="#3B82F6"
                        d="M0 0h48v48H0z"
                        mask="url(#IconifyId1913a427b121fac716)"
                      />
                    </svg>
                    <div class="text-2xl py-6 font-bold">个人408创建赛</div>
                  </div>
                  <div class="text-gray-400 font-bold text-sm">
                    *仅仅运行选择题库题目，自行创建比赛
                  </div>
                </div>
                <div class="basis-5/12 text-gray-400">
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#3B82F6"
                        fill-rule="evenodd"
                        stroke="#3B82F6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="4"
                        d="m4 24l5-5l10 10L39 9l5 5l-25 25z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="pl-1 text-sm">支持设置比赛密码</span>
                  </div>
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#3B82F6"
                        fill-rule="evenodd"
                        stroke="#3B82F6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="4"
                        d="m4 24l5-5l10 10L39 9l5 5l-25 25z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="pl-1 text-sm">支持是使用公共题库</span>
                  </div>
                  <div class="flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#3B82F6"
                        fill-rule="evenodd"
                        stroke="#3B82F6"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="4"
                        d="m4 24l5-5l10 10L39 9l5 5l-25 25z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="pl-1 text-sm"
                      >仅支持OI赛制(OI，后续将继续扩展)</span
                    >
                  </div>
                </div>
              </button>
              <div class="flex">
                <div class="flex-1"></div>
                <form method="dialog">
                  <button class="btn bg-white text-lg">取消</button>
                </form>
                <router-link
                  class="btn bg-sky-500 text-white text-lg ml-4"
                  :to="'/competition/user/add/' + checked + '/info'"
                >
                  确定
                </router-link>
              </div>
            </div>
          </dialog>
        </div>
      </div>

      <div class="container">
        <router-link
          class="card lg:card-side shadow-xl border-radius bg-white"
          v-for="competition in competition_list"
          :key="competition.competition_id"
          :to="path + competition.competition_id"
          style="margin-left: 0; margin-right: 0"
        >
          <div class="card-body avatar" style="float: left; width: 20%">
            <div class="rounded-full w-24">
              <img
                @dragstart.prevent
                :src="competition.avatar"
                alt="Mogullzr小刘的OJ项目"
              />
            </div>
          </div>
          <div class="card-body font-bold" style="width: 45%">
            <div class="my-auto">
              <div>{{ competition.competition_name }}</div>
              <div>
                <div>
                  <span>比赛创建者：</span>
                  <span class="text-red-600">{{ competition.username }}</span>
                </div>
                <div>
                  <span>比赛参与人数：</span>
                  <span class="text-blue-400">{{ competition.joins }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-body font-bold" style="width: 35%">
            <div>
              <div style="font-size: 20px">比赛时间:</div>
              <div class="text-blue-700" style="font-size: 14px">
                {{ dayjs(competition.start_time).format("YYYY-MM-DD HH:mm") }}

                {{ dayjs(competition.end_time).format("YYYY-MM-DD HH:mm") }}
              </div>
            </div>
          </div>
          <button class="btn btn-success" v-if="competition.user_status === 1">
            报名
          </button>
          <button
            class="btn btn-error"
            v-else-if="competition.user_status === 0"
          >
            已报名
          </button>
          <button
            class="btn btn-warning"
            v-else-if="
              competition.user_status === 2 || competition.user_status === 3
            "
          >
            进行中
          </button>
          <button class="btn" v-else-if="competition.user_status === 4">
            已结束
          </button>
        </router-link>
      </div>
      <div class="join flex pl-96 bg-white" v-if="PageSum > 1">
        <button class="join-item btn" @click="PageClick(currentPage - 1)">
          «
        </button>
        <button
          class="join-item btn"
          v-if="currentPage - 1 > 0 && currentPage < PageSum"
          @click="PageClick(currentPage - 1)"
        >
          {{ currentPage - 1 }}
        </button>
        <button class="join-item btn" v-if="currentPage < PageSum">
          {{ currentPage }}
        </button>
        <button
          class="join-item btn"
          v-if="currentPage + 1 < PageSum"
          @click="PageClick(currentPage + 1)"
        >
          {{ currentPage + 1 }}
        </button>
        <button class="join-item btn btn-disabled">...</button>
        <button
          class="join-item btn"
          v-if="currentPage + 2 < PageSum - 1"
          @click="PageClick(PageSum - 1)"
        >
          {{ PageSum - 1 }}
        </button>
        <button class="join-item btn" @click="PageClick(<number>PageSum)">
          {{ PageSum }}
        </button>
        <button class="join-item btn" @click="PageClick(currentPage + 1)">
          »
        </button>
      </div>
    </div>
    <div class="w-1/4">
      <div class="card card-compact bg-base-100 w-96 shadow-2xl pt-4 my-4">
        <div class="card-body">
          <div class="card-title align-center text-blue-600 text-3xl">
            <div>
              <div class="m-2">你写的上一道题目：</div>
              <div class="m-2">{{ last_problem.problem_name }}</div>
            </div>
          </div>
          <div>
            <router-link
              class="w-full btn btn-primary text-white text-2xl"
              :to="last_problem.problem_url"
            >
              继续刷题
            </router-link>
          </div>
        </div>
      </div>
      <div class="card card-compact bg-base-100 w-96 shadow-2xl pt-4">
        <div class="card-body">
          <div class="card-title align-center text-red-600 text-3xl">
            巅峰Rating排行榜
          </div>
          <div class="">
            <ul>
              <li class="m-2 text-lg" v-for="(user, index) in user_top">
                <span class="font-black mr-4 w-4 bg-gray-100">{{
                  index + 1
                }}</span>
                <span
                  class="font-black"
                  :style="'color:' + rated_color_list[user.rated]"
                  >{{ user.username }}</span
                >
                <span
                  class="font-black float-right"
                  :style="'color:' + rated_color_list[user.rated]"
                  >{{ user.rating }}</span
                >
              </li>
            </ul>
          </div>

          <div>
            <button class="w-full btn btn-primary text-white text-2xl">
              查看
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card:hover {
  box-shadow: 0px 1rem 2rem 0px rgba(48, 55, 66, 0.15);
  transform: translate(0, -2px);
  transition-delay: 0s !important;
}

html,
body {
  width: 100%;
  height: 100%;
  display: flex;
}

:root {
  --borderColor: #0357f3;
}

.border-radius {
  position: relative;
  margin: 0 20px 20px;
  border: 0 solid #036bf3;
  cursor: pointer;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 20px;
    height: 20px;
    transition: 0.3s ease-in-out;
  }

  &::before {
    top: -5px;
    left: -5px;
    border-top: 1px solid var(--borderColor);
    border-left: 1px solid var(--borderColor);
  }

  &::after {
    right: -5px;
    bottom: -5px;
    border-bottom: 1px solid var(--borderColor);
    border-right: 1px solid var(--borderColor);
  }

  &:hover::before,
  &:hover::after {
    width: calc(100% + 9px);
    height: calc(100% + 9px);
  }
}
</style>
