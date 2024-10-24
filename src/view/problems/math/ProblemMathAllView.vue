<script setup lang="ts">
import { onMounted, onUpdated, Ref, ref } from "vue";
import { useRouter } from "vue-router";
import {
  ProblemAlgorithmControllerService,
  ProblemMath408ControllerService,
} from "../../../../generated";
import UserStore from "@/store/user";

const router = useRouter();
const useStore = UserStore();
const path = router.currentRoute.value.fullPath;
const currentPage = ref(1);
const PageSum = ref(1);

let problem_list: Ref<any> = ref([]);
const difficulty_list = useStore.difficulty_list;
const color_list = useStore.color_list;
const tag_current = ref("");

onMounted(async () => {
  const res =
    await ProblemMath408ControllerService.problemMath408SearchByPageUsingPost(
      1,
      0
    );
  if (res.code === 0) {
    for (let item = 0; item < res.data.length; item++) {
      problem_list.value.push(res.data[item]);
    }
    console.log(problem_list.value);
  } else if (res.code === 40101) {
    router.push("/404");
  }

  const response =
    await ProblemMath408ControllerService.problemMath408SearchPageSumUsingPost(
      0
    );
  if (response.code === 0) {
    PageSum.value = response.data;
    console.log(PageSum.value);
  } else {
    console.log(res.message);
  }
});

// 挂载完成之后执行
onUpdated(() => {
  if (tag_current.value == "") {
    return;
  }

  let tags: any = document.getElementsByClassName(tag_current.value);
  if (tags != null) {
    for (let tag of tags) {
      tag.classList.remove("badge-ghost");
      tag.classList.add("badge-error");
    }
  }
});
// 分页查找
const PageClick = async (Page: number) => {
  if (Page <= 0 || Page > PageSum.value) {
    return;
  }
  console.log(Page, currentPage.value);
  const res =
    await ProblemMath408ControllerService.problemMath408SearchByPageUsingPost(
      Page,
      0
    );

  if (res.code === 0) {
    problem_list.value = [];
    for (let item = 0; item < res.data.length; item++) {
      problem_list.value.push(res.data[item]);
    }
    console.log(problem_list.value);
    currentPage.value = Page;
  } else {
    console.log(res.message);
  }
};

// 根据知识点查找所有符合条件的题目
const searchByTag = async (tag_name: string) => {
  if (tag_current.value != "" || !tag_current.value) {
    let tags: any = document.getElementsByClassName(tag_current.value);
    if (tags != null) {
      for (let tag of tags) {
        tag.classList.remove("badge-error");
        tag.classList.add("badge-ghost");
      }
    }
  }

  tag_current.value = tag_name;
  let tag_id = ref(1);
  for (let item = 0; item < useStore.Math408TagsRelation[0].length; item++) {
    if (useStore.Math408TagsRelation[0][item].tag_name == tag_name) {
      tag_id.value = useStore.Math408TagsRelation[0][item].tag_id;
      break;
    }
  }

  const res1 =
    await ProblemMath408ControllerService.problemMath408SearchByTagIdUsingPost(
      tag_id.value
    );
  if (res1.code === 0) {
    problem_list.value = [];
    for (let item = 0; item < res1.data.length; item++) {
      problem_list.value.push(res1.data[item]);
    }
  } else {
    console.log(res1.message);
  }
  PageSum.value = 1;
};
</script>
<template>
  <div class="card-body mt-4 h-30 bg-base-100 shadow-xl rounded-box">
    <div class="overflow-x-auto">
      <table class="table">
        <!-- head -->
        <thead>
          <tr>
            <th></th>
            <th>题号</th>
            <th>题目</th>
            <th>知识点</th>
            <th>来源</th>
            <th>通过率</th>
            <th>题目类型</th>
            <th>难度</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="problem in problem_list"
            :key="problem.problem_id"
            class="hover"
          >
            <td v-if="problem.status == 1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#5FBA7D"
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"
                />
              </svg>
            </td>
            <td v-else-if="problem.status == 0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#dc2626"
                  d="M14 12h-4v-2h4m0 6h-4v-2h4m6-6h-2.81a6 6 0 0 0-1.82-1.96L17 4.41L15.59 3l-2.17 2.17a6 6 0 0 0-2.83 0L8.41 3L7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20z"
                />
              </svg>
            </td>
            <td v-else-if="problem.status == 2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#eab308"
                  d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2z"
                />
              </svg>
            </td>
            <td v-else></td>
            <td>{{ problem.problem_id }}</td>
            <router-link :to="'/problems/math408/' + problem.problem_id">
              <td>
                {{ problem.problem_name }}
              </td>
            </router-link>
            <td>
              <button
                v-for="tag in problem.tag_list"
                :key="tag"
                @click="searchByTag(tag)"
              >
                <span :class="'badge badge-ghost ' + tag">{{ tag }}</span>
              </button>
            </td>
            <td>
              <span class="badge badge-ghost">{{ problem.source }}</span>
            </td>
            <td
              v-if="
                problem.ac_total == null ||
                problem.test_total == null ||
                problem.test_total == 0
              "
            >
              100%
            </td>

            <td v-else>{{ (problem.ac_total * 100) / problem.test_total }}%</td>
            <td>{{ useStore.optionTypes[problem.option_type] }}</td>
            <td>
              <span
                :class="color_list[difficulty_list[problem.difficulty_name]]"
              >
                {{ problem.difficulty_name }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="join m-auto">
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
      <button class="join-item btn" @click="PageClick(PageSum)">
        {{ PageSum }}
      </button>
      <button class="join-item btn" @click="PageClick(currentPage + 1)">
        »
      </button>
    </div>
  </div>
</template>

<style scoped></style>
1
