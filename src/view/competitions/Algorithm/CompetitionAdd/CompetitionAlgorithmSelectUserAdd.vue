<script setup lang="ts">
import TimeLineView from "@/view/components/TimeLineView.vue";
import {
  nextTick,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
  Ref,
  watch,
} from "vue";
import {
  CompetitionAddRequest,
  ProblemAlgorithmBankVo,
  ProblemAlgorithmControllerService,
} from "../../../../../generated";
import UserStore from "@/store/user";
import router from "@/router";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import dayjs from "dayjs";

const useStore = UserStore();
const currentDate = dayjs(new Date());
const keyword: Ref<string> = ref("");
const problem_list: Ref<ProblemAlgorithmBankVo[]> = ref([]);
const tags_list: Ref<string[] | undefined> = ref([]);
const PageSum: Ref<number> = ref(1);
const checked_problem_list: Ref<any> = ref(
  localStorage.getItem("checked_problem_list") != null
    ? JSON.parse(localStorage.getItem("checked_problem_list") ?? "")
    : []
);

const competition_info: Ref<CompetitionAddRequest | undefined> = ref(
  localStorage.getItem("competition_info") != null
    ? JSON.parse(localStorage.getItem("competition_info") ?? "")
    : ({} as CompetitionAddRequest)
);

// 使用何种查找方式查询进行分页查询
const flag: Ref<number> = ref(0);
const currentPage: Ref<number> = ref(1);
const current_tag_id: Ref<number> = ref(0);
const difficulty_current: Ref<string> = ref("");

const initialTop = 200;
const panelHeight = 300; // 面板高度
const panelStyle = ref({
  position: "absolute",
  top: `${initialTop}px`,
  right: "-370px",
});

const searchByKeyword = async (keyword: string) => {
  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchByKeywordUsingPost(
      keyword,
      1
    );
  if (res.code === 0) {
    problem_list.value = [];
    for (let item = 0; item < res.data.length; item++) {
      problem_list.value.push(res.data[item]);
    }
    flag.value = 3;
    let element: any = document.getElementById("checkAll");
    if (element != null) {
      element.checked = false;
    }
  }
};

// 根据标签搜索题目
const searchByTag = async (event: any) => {
  let element: any = document.getElementById("checkAll");
  if (element != null) {
    element.checked = false;
  }

  const tag_name: Ref<string> = ref(event.target.value);
  console.log(tag_name);
  let tag_id: Ref<number> = ref(0);
  for (let item = 0; item < useStore.AlgorithmTagsRelation[0].length; item++) {
    if (useStore.AlgorithmTagsRelation[0][item].tag_name == tag_name.value) {
      tag_id.value = useStore.AlgorithmTagsRelation[0][item].tag_id;
      console.log(tag_id.value);
      break;
    }
  }

  const res1 =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchByTagIdUsingPost(
      1,
      tag_id.value
    );
  if (res1.code === 0) {
    problem_list.value = [];
    for (let item = 0; item < res1.data.length; item++) {
      problem_list.value.push(res1.data[item]);
    }
    console.log(problem_list.value);
    current_tag_id.value = tag_id.value;
    flag.value = 1;
  }

  const res2 =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchPagSumUsingPost(
      tag_id.value
    );

  if (res2.code === 0) {
    PageSum.value = res2.data;
  } else {
    console.log(res2.message);
  }
};

// 根据难度搜索题目
const searchByDifficulty = async (event: any) => {
  const res1 =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchByDifficultyUsingPost(
      event.target.value,
      1
    );

  if (res1.code === 0) {
    problem_list.value = [];
    for (let item = 0; item < res1.data.length; item++) {
      problem_list.value.push(res1.data[item]);
    }
    difficulty_current.value = event.target.value;
    flag.value = 2;

    let element: any = document.getElementById("checkAll");
    if (element != null) {
      element.checked = false;
    }
  }

  const res2 =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchSumByDifficultyUsingPost();
  if (res2.code === 0) {
    PageSum.value = res2.data;
  }
};

// 分页查找
const PageClick = async (Page: number) => {
  if (Page <= 0 || Page > PageSum.value) {
    return;
  }

  if (flag.value === 0) {
    const res =
      await ProblemAlgorithmControllerService.problemAlgorithmSearchByPageUsingPost(
        Page
      );

    if (res.code === 0) {
      problem_list.value = [];
      for (let item = 0; item < res.data.length; item++) {
        problem_list.value.push(res.data[item]);
      }
      currentPage.value = Page;
    } else {
      console.log(res.message);
    }
  } else if (flag.value === 1) {
    const res =
      await ProblemAlgorithmControllerService.problemAlgorithmSearchByTagIdUsingPost(
        Page,
        current_tag_id.value
      );
    if (res.code === 0) {
      problem_list.value = [];
      for (let item = 0; item < res.data.length; item++) {
        problem_list.value.push(res.data[item]);
      }
      currentPage.value = Page;
    } else {
      console.log(res.message);
    }
  } else if (flag.value === 2) {
    const res =
      await ProblemAlgorithmControllerService.problemAlgorithmSearchByDifficultyUsingPost(
        difficulty_current.value,
        Page
      );

    if (res.code === 0) {
      problem_list.value = [];
      for (let item = 0; item < res.data.length; item++) {
        problem_list.value.push(res.data[item]);
      }
      currentPage.value = Page;
    }
  } else if (flag.value === 3) {
    const res =
      await ProblemAlgorithmControllerService.problemAlgorithmSearchByKeywordUsingPost(
        keyword.value,
        Page
      );

    if (res.code === 0) {
      problem_list.value = [];
      for (let item = 0; item < res.data.length; item++) {
        problem_list.value.push(res.data[item]);
      }
      currentPage.value = Page;
    } else {
      console.log(res.message);
    }
  }
};

// 返回上一级
const reBack = () => {
  router.push("/competition/user/add/1/info");
};

// 选中 or 取消选中某个题目
const checkProblem = (
  problem_id: any,
  problem_name: string,
  description: string
) => {
  let element: any = document.getElementById(problem_id);
  if (
    problem_id != null &&
    element != null &&
    checked_problem_list.value?.length != null
  ) {
    if (element.checked == true) {
      checked_problem_list.value.push({
        problem_id: problem_id,
        problem_name: problem_name,
        description: description,
      });
    } else if (element.checked == false) {
      console.log(problem_id);
      checked_problem_list.value = checked_problem_list.value.filter(
        (item: any) => item.problem_id != problem_id
      );
    }
  }
};

// 选中已经选中的题目
const checkProblemList = () => {
  if (checked_problem_list.value != null) {
    for (let item = 0; item < checked_problem_list.value?.length; item++) {
      let element: any = document.getElementById(
        checked_problem_list.value[item].problem_id as any
      );

      console.log(element);
      if (element != null) {
        element.checked = true;
      }
    }
  }
};
// 选中 or 取消选中所有题目
const checkAllProblem = () => {
  let element: any = document.getElementById("checkAll");
  if (problem_list.value.length !== 0 && element != null) {
    if (element.checked == true) {
      if (checked_problem_list.value == undefined) {
        checked_problem_list.value = [];
      }
      for (let item = 0; item < problem_list.value.length; item++) {
        for (let j = 0; j < checked_problem_list.value.length; j++) {
          if (problem_list.value[item] == problem_list.value[j]) {
            break;
          }
        }
        checked_problem_list.value.push({
          problem_id: problem_list.value[item].problem_id,
          problem_name: problem_list.value[item].chinese_name,
          description: problem_list.value[item].description,
        });
        let element: any = document.getElementById(
          problem_list.value[item].problem_id as any
        );
        element.checked = true;
      }
    } else {
      for (let item = 0; item < problem_list.value.length; item++) {
        let element: any = document.getElementById(
          problem_list.value[item].problem_id as any
        );
        let problem_id: number | undefined =
          problem_list.value[item].problem_id;
        element.checked = false;
        checked_problem_list.value = checked_problem_list.value?.filter(
          (item: any) => item.problem_id != problem_id
        );
      }
    }
  }
};

// 固定预览框
const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight;

  // 判断面板是否到达顶部
  if (scrollTop > initialTop) {
    // 计算固定位置
    const top = Math.min(initialTop, viewportHeight - panelHeight - 30);
    panelStyle.value = {
      position: "fixed",
      top: "70px",
      right: "260px",
    };
  } else {
    // 恢复原始位置
    panelStyle.value = {
      position: "absolute",
      top: `${initialTop}px`,
      right: "-370px",
    };
  }
};

// 是否有空白信息
const isAnyEmpty = () => {
  if (
    competition_info.value != null &&
    checked_problem_list.value != null &&
    checked_problem_list.value.length != 0
  ) {
    router.push("/competition/user/add/1/show");
  } else {
    let el: any = document.getElementById("own_modal_warning");
    el.showModal();
  }
};

// 悬窗效果
const modalClick = (problem_id: number | undefined) => {
  const el: any = document.getElementById("own_modal_" + problem_id);
  if (el != null) {
    console.log(el);
    el.showModal();
  }
};

// 删除某个题目
const deleteProblem = (problem_id: number) => {
  checked_problem_list.value = checked_problem_list.value.filter(
    (problem: any) => problem.problem_id != problem_id
  );
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
    router.push("/competition/user/add/1/info");
  }
};
onMounted(async () => {
  checkReasonAbility();
  // 固定题目列表
  window.addEventListener("scroll", handleScroll);
  // 获取所有标签
  const res1 =
    await ProblemAlgorithmControllerService.problemAlgorithmGetTagsUsingGet();
  if (res1.code === 0) {
    tags_list.value = res1.data;
  }

  // 分页查找所有题目
  const res2 =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchByPageUsingPost(
      1
    );
  if (res2.code === 0) {
    problem_list.value = res2.data.splice(0, 20);
  }

  // 查找题目的页数
  const res3 =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchPagSumUsingPost();
  if (res3.code === 0) {
    PageSum.value = res3.data;
  }
  // 将当前页面选中标签进行记录
  checkProblemList();
});

onUpdated(() => {
  checkProblemList();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
// 实时监听选中题目列表
watch(
  checked_problem_list,
  (newValue, OldValue) => {
    nextTick(() => {
      localStorage.setItem("checked_problem_list", JSON.stringify(newValue));
      console.log(checked_problem_list.value);
      if (competition_info.value) {
        competition_info.value.algorithm_problem_list = [];
        for (let item = 0; item < newValue.length; item++) {
          competition_info.value?.algorithm_problem_list.push(
            newValue[item].problem_id
          );
        }
        console.log(competition_info.value);
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
  <div class="card mx-60 text-sm">
    <div class="card-body bg-white rounded-2xl">
      <TimeLineView />
      <div class="divider"></div>
      <div class="w-full my-4 flex">
        <div class="my-auto font-bold w-30">关键词搜索</div>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索题目"
          class="input input-bordered input-md input-s ml-6 w-10/12"
          @keyup.enter="searchByKeyword(keyword)"
        />
        <button class="svg-hover mx-2" @click="searchByKeyword(keyword)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
          >
            <path
              fill="#999999"
              d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"
            />
          </svg>
        </button>
      </div>
      <div class="flex">
        <div class="my-auto font-bold w-30 mr-10">标签搜索</div>
        <select
          class="select select-bordered select-md w-full max-w-xs"
          style="font-size: 16px"
          @change="searchByTag($event)"
        >
          <option v-for="tag in tags_list" :key="tag">
            {{ tag }}
          </option>
        </select>
      </div>
      <div class="flex">
        <div class="my-auto font-bold w-30 mr-10">难度搜索</div>
        <select
          class="select select-bordered select-md w-full max-w-xs"
          style="font-size: 16px"
          @change="searchByDifficulty($event)"
        >
          <option>简单</option>
          <option>中等</option>
          <option>困难</option>
        </select>
      </div>
      <div class="divider"></div>
      <div class="overflow-x-auto">
        <table class="table">
          <!-- head -->
          <thead>
            <tr>
              <th>
                <label>
                  <input
                    id="checkAll"
                    type="checkbox"
                    class="checkbox"
                    @click="checkAllProblem"
                  />
                </label>
              </th>
              <th>题号</th>
              <th>标题</th>
              <th>算法标签</th>
              <th>难度</th>
              <th>通过人数</th>
            </tr>
          </thead>
          <tbody>
            <!-- row 1 -->
            <tr v-for="problem in problem_list" :key="problem.problem_id">
              <th>
                <label>
                  <input
                    :id="problem.problem_id"
                    type="checkbox"
                    class="checkbox"
                    @click="
                      checkProblem(
                        problem.problem_id,
                        problem.chinese_name,
                        problem.description
                      )
                    "
                  />
                </label>
              </th>
              <td>{{ problem.problem_id }}</td>
              <td>
                <button @click="modalClick(problem.problem_id)">
                  {{ problem.chinese_name }}
                </button>
                <dialog :id="'own_modal_' + problem.problem_id" class="modal">
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
              </td>
              <td>
                <span
                  v-for="tag in problem.algorithm_tags"
                  :key="tag"
                  :class="'badge badge-ghost ' + tag"
                  >{{ tag }}</span
                >
              </td>
              <td>
                <span
                  :class="
                    useStore.color_list[
                      useStore.difficulty_list[problem.difficulty_name]
                    ] + ' text-white'
                  "
                  style="white-space: nowrap"
                >
                  {{ problem.difficulty_name }}
                </span>
              </td>
              <td>
                <span class="align-center">
                  {{ problem.ac_total }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="join m-auto" v-if="PageSum > 1 && problem_list.length > 0">
        <button class="join-item btn" @click="PageClick(1)">«</button>
        <button
          class="join-item btn"
          v-if="currentPage - 1 > 0"
          @click="PageClick(currentPage - 1)"
        >
          {{ currentPage - 1 }}
        </button>
        <button class="join-item btn">
          {{ currentPage }}
        </button>
        <button
          v-if="currentPage + 1 < PageSum"
          class="join-item btn"
          @click="PageClick(currentPage + 1)"
        >
          {{ currentPage + 1 }}
        </button>
        <button
          class="join-item btn btn-disabled"
          v-if="currentPage != PageSum"
        >
          ...
        </button>
        <button
          class="join-item btn"
          v-if="currentPage + 2 < PageSum"
          @click="PageClick(PageSum - 1)"
        >
          {{ PageSum - 1 }}
        </button>
        <button
          v-if="currentPage != PageSum"
          class="join-item btn"
          @click="PageClick(PageSum)"
        >
          {{ PageSum }}
        </button>
        <button class="join-item btn" @click="PageClick(PageSum)">»</button>
      </div>
      <div class="flex">
        <button class="btn bg-gray-500 text-white text-xl" @click="reBack">
          返回上一级
        </button>
        <div class="flex-1"></div>
        <button class="btn bg-blue-500 text-white text-xl" @click="isAnyEmpty">
          前往题目预览
        </button>
        <dialog id="own_modal_warning" class="modal">
          <div class="modal-box w-11/12 max-w-3xl">
            <form method="dialog">
              <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-lg bg-blue-500 text-white"
              >
                ✕
              </button>
            </form>
            <div class="flex my-20">
              <div class="mr-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="80"
                  height="80"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="#eab308"
                    d="M449.07 399.08L278.64 82.58c-12.08-22.44-44.26-22.44-56.35 0L51.87 399.08A32 32 0 0 0 80 446.25h340.89a32 32 0 0 0 28.18-47.17m-198.6-1.83a20 20 0 1 1 20-20a20 20 0 0 1-20 20m21.72-201.15l-5.74 122a16 16 0 0 1-32 0l-5.74-121.95a21.73 21.73 0 0 1 21.5-22.69h.21a21.74 21.74 0 0 1 21.73 22.7Z"
                  />
                </svg>
              </div>
              <div class="text-3xl font-bold my-auto">
                请选择合适的题目后再进行题目预览
              </div>
            </div>
            <form method="dialog" class="float-right">
              <button class="btn text-lg bg-blue-500 text-white">关闭</button>
            </form>
          </div>
        </dialog>
      </div>
    </div>
    <div
      :style="panelStyle"
      class="bg-white preview-panel card-body rounded-2xl"
    >
      <div class="mx-auto text-2xl font-bold text-blue-500">
        <span>已选择选择题目</span>
        <span v-if="checked_problem_list.length > 0"
          >({{ checked_problem_list.length }})</span
        >
      </div>
      <div class="text-gray-500 font-bold text-lg">题目顺序下一步设置</div>
      <div class="divider"></div>
      <div v-if="checked_problem_list.length > 0" class="overflow-y-auto">
        <div
          class="text-lg flex"
          v-for="(problem, index) in checked_problem_list"
          :key="index"
        >
          <div class="w-8">{{ index + 1 }}</div>
          <div class="w-52" v-if="problem.problem_name?.length <= 12">
            {{ problem.problem_name }}
          </div>
          <div class="w-52" v-else-if="problem.problem_name != undefined">
            {{ problem.problem_name.substring(0, 12) }}...
          </div>
          <div class="w-10">
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
            <dialog :id="'own_modal_' + problem.problem_id" class="modal">
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
          </div>
          <div class="w-10">
            <button @click="deleteProblem(problem.problem_id ?? 0)">
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
          </div>
        </div>
      </div>
      <div v-else class="overflow-y-auto text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
          viewBox="0 0 16 16"
        >
          <path
            fill="#999999"
            d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25c.09-.656.54-1.134 1.342-1.134c.686 0 1.314.343 1.314 1.168c0 .635-.374.927-.965 1.371c-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486c.609-.463 1.244-.977 1.244-2.056c0-1.511-1.276-2.241-2.673-2.241c-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927c0-.552-.42-.94-1.029-.94c-.584 0-1.009.388-1.009.94c0 .533.425.927 1.01.927z"
          />
        </svg>
        <div class="mx-auto text-2xl text-gray-400 font-bold mt-8">
          暂无选择题目
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-panel {
  width: 350px;
  max-height: 666px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: top 0.0001s; /* 平滑过渡效果 */
}

svg:hover path {
  fill: #3b82f6;
}
</style>
