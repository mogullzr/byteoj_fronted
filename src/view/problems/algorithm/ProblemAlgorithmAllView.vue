<script setup lang="ts">
import { onMounted, onUpdated, Ref, ref } from "vue";
import { useRouter } from "vue-router";
import { ProblemAlgorithmControllerService } from "../../../../generated";
import UserStore from "@/store/user";

const router = useRouter();
const useStore = UserStore();
let currentRequest: number = useStore.currentRequest;
let maxRequestCount: number = useStore.maxRequestCount;
const path = router.currentRoute.value.fullPath;
const currentPage = ref(1);
const PageSum = ref(1);
const tag_current_name = ref("");
const tag_current_id = ref(0);
const difficulty_current = ref("");
const EasySum = ref();
const MediumSum = ref();
const HardSum = ref();
// 0表示默认请求状态，1最后点击为表示根据标签查询，2表示最后点击为根据难度查询
const flag = ref(0);
const keyword = ref("");

let problem_list: Ref<any> = ref([]);
const difficulty_list = useStore.difficulty_list;
const color_list = useStore.color_list;

onMounted(async () => {
  if (currentRequest > maxRequestCount) {
    setTimeout(() => {
      currentRequest = 0;
    }, 120000);
  }
  // 全局限流配置
  currentRequest += 1;

  // 请求1
  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchByPageUsingPost(
      1
    );
  if (res.code === 0) {
    if (res.data != undefined) {
      for (let item = 0; item < res.data.length; item++) {
        problem_list.value.push(res.data[item]);
      }
    }
  } else if (res.code === 40101) {
    router.push("/404");
  }

  // 请求2
  const response =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchPagSumUsingPost();
  if (response.code === 0) {
    PageSum.value = response.data;
  } else if (res.code === 40101) {
    router.push("/404");
  }

  // 请求3
  const resEasy =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchSumByDifficultyUsingPost(
      "简单"
    );

  if (resEasy.code === 0) {
    EasySum.value = resEasy.data;
  } else if (res.code === 40101) {
    router.push("/404");
  }

  // 请求4
  const resMedium =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchSumByDifficultyUsingPost(
      "中等"
    );

  if (resMedium.code === 0) {
    MediumSum.value = resMedium.data;
  } else {
    console.log(resMedium.message);
  }

  // 请求5
  const resHard =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchSumByDifficultyUsingPost(
      "困难"
    );

  if (resHard.code === 0) {
    HardSum.value = resHard.data;
  } else {
    console.log(resHard.message);
  }

  // 全局限流配置
  currentRequest -= 1;
});

// 挂载完成之后执行
onUpdated(() => {
  if (tag_current_name.value == "") {
    return;
  }

  let tags_list_1 = Array.from(document.getElementsByTagName("td")).filter(
    (element) => {
      const classNames: any = element.className.toString();
      if (
        classNames.toLowerCase().includes(tag_current_name.value.toLowerCase())
      )
        return true;
      // if (classNames[2].includes(tag_current_name.value)) return true;
      return false;
    }
  );

  let tags_list_2 = Array.from(document.getElementsByTagName("span")).filter(
    (element) => {
      const classNames: any = element.className.toString().split(/\s+/);
      if (classNames.length != 3) return false;
      else if (
        (classNames[1] == "badge-ghost" &&
          classNames[2]
            .toLowerCase()
            .includes(tag_current_name.value.toLowerCase())) ||
        (classNames[2] == "badge-ghost" &&
          classNames[1]
            .toLowerCase()
            .includes(tag_current_name.value.toLowerCase()))
      ) {
        return true;
      } else return false;
    }
  );

  if (tags_list_1 != null) {
    for (let tag of tags_list_1) {
      tag.classList.remove("badge-ghost");
      tag.classList.add("badge-error");
      tag.classList.add("text-white");
    }
  }

  if (tags_list_2 != null) {
    for (let tag of tags_list_2) {
      tag.classList.remove("badge-ghost");
      tag.classList.add("badge-error");
      tag.classList.add("text-white");
    }
  }
});

// 分页查找
const PageClick = async (Page: number) => {
  // 全局限流配置
  currentRequest += 1;
  if (currentRequest > maxRequestCount) {
    setTimeout(() => {
      currentRequest = 0;
    }, 120000);
  }

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
        tag_current_id.value
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
      tag_current_name.value = keyword.value;
    } else {
      console.log(res.message);
    }
  }
  // 全局限流配置
  currentRequest -= 1;
};

// 根据算法算法标签查找所有符合条件的题目
const searchByTag = async (tag_name: string) => {
  if (tag_current_name.value != "" || !tag_current_name.value) {
    let tags: any = document.getElementsByClassName(tag_current_name.value);
    if (tags != null) {
      for (let tag of tags) {
        tag.classList.remove("badge-error");
        tag.classList.remove("text-white");
        tag.classList.add("badge-ghost");
      }
    }
  }

  tag_current_name.value = tag_name;
  let tag_id = ref(0);
  for (let item = 0; item < useStore.AlgorithmTagsRelation[0].length; item++) {
    if (useStore.AlgorithmTagsRelation[0][item].tag_name == tag_name) {
      tag_id.value = useStore.AlgorithmTagsRelation[0][item].tag_id;
      break;
    }
  }

  // 全局限流配置
  currentRequest += 1;
  if (currentRequest > maxRequestCount) {
    setTimeout(() => {
      currentRequest = 0;
    }, 120000);
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
    tag_current_id.value = tag_id.value;
    flag.value = 1;
    console.log(currentPage);
  } else {
    console.log(res1.message);
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
  // 全局限流配置
  currentRequest -= 1;
};

const searchByKeyword = async (keyword: string) => {
  // 全局限流配置
  currentRequest += 1;
  console.log(currentRequest);
  if (currentRequest > maxRequestCount) {
    return;
    // console.log(12312312123);
    // setTimeout(() => {
    //   currentRequest = 0;
    // }, 120000);
  }
  const res1 =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchByKeywordUsingPost(
      keyword,
      1
    );

  if (res1.code === 0) {
    problem_list.value = [];
    for (let item = 0; item < res1.data.length; item++) {
      problem_list.value.push(res1.data[item]);
    }
    flag.value = 3;
    let tags: any = document.getElementsByClassName(tag_current_name.value);
    if (tags != null) {
      for (let tag of tags) {
        tag.classList.remove("badge-error");
        tag.classList.remove("text-white");
        tag.classList.add("badge-ghost");
      }
    }
    tag_current_name.value = keyword;
  } else {
    console.log(res1.message);
  }
  // 全局限流配置
  currentRequest -= 1;
};

const searchByDifficulty = async (difficulty_name: any) => {
  // 全局限流配置
  currentRequest += 1;
  if (currentRequest > maxRequestCount) {
    setTimeout(() => {
      currentRequest = 0;
    }, 120000);
  }

  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchByDifficultyUsingPost(
      difficulty_name,
      1
    );

  if (res.code === 0) {
    problem_list.value = [];
    for (let item = 0; item < res.data.length; item++) {
      problem_list.value.push(res.data[item]);
    }
    currentPage.value = 1;
    difficulty_current.value = difficulty_name;
    flag.value = 2;
  }
  // 全局限流配置
  currentRequest -= 1;
};
</script>
<template>
  <div class="card-body mt-4 h-30 bg-base-100 shadow-xl rounded-box">
    <div class="w-7/12 m-auto">
      <div class="font-bold text-center text-4xl">ByteOJ编程题库</div>
      <div class="w-full my-4 flex">
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索题目"
          class="input input-bordered input-md input-s w-full m-auto"
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
    </div>
    <div class="overflow-x-auto">
      <div class="flex flex-row-reverse">
        <div>
          <button>
            <span class="text-error" @click="searchByDifficulty('困难')"
              >困难题</span
            >
            <span class="font-bold">{{ HardSum }}</span>
            <span>道，</span>
          </button>
        </div>
        <div>
          <button>
            <span class="text-warning" @click="searchByDifficulty('中等')"
              >中等题</span
            >
            <span class="font-bold">{{ MediumSum }}</span>
            <span>道，</span>
          </button>
        </div>
        <div>
          其中
          <button>
            <span class="text-success" @click="searchByDifficulty('简单')"
              >简单题</span
            >
          </button>
          <span class="font-bold">{{ EasySum }}</span>
          <span>道，</span>
        </div>
        <div>
          总共通过了
          <span class="font-bold">{{ EasySum + MediumSum + HardSum }}</span>
          <span>道题目</span>
        </div>
      </div>
      <table class="table" v-if="problem_list.length !== 0">
        <!-- head -->
        <thead>
          <tr>
            <th></th>
            <th>题号</th>
            <th>题目</th>
            <th>算法标签</th>
            <th>来源</th>
            <th>通过率</th>
            <th>难度</th>
          </tr>
        </thead>
        <tbody class="problemBody">
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
            <router-link
              class="link link-hover text-sky-600"
              :to="'/problems/algorithm/' + problem.problem_id"
            >
              <td :class="problem.chinese_name">
                {{ problem.chinese_name }}
              </td>
            </router-link>
            <td class="w-64">
              <button
                v-for="tag in problem.algorithm_tags"
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

            <td v-else>
              {{ ((problem.ac_total * 100) / problem.test_total).toFixed(1) }}%
            </td>
            <td>
              <button @click="searchByDifficulty(problem.difficulty_name)">
                <span
                  :class="
                    color_list[difficulty_list[problem.difficulty_name]] +
                    ' text-white'
                  "
                  style="white-space: nowrap"
                >
                  {{ problem.difficulty_name }}
                </span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="problem_list.length === 0"
      class="mx-auto font-bold text-gray-400"
    >
      <span class="my-4" style="font-size: 48px"> 暂无任何匹配记录┭┮﹏┭┮ </span>
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
      <button class="join-item btn btn-disabled" v-if="currentPage != PageSum">
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
  </div>
</template>

<style scoped>
.svg-hover:hover {
  path {
    fill: rgba(2, 132, 199, 0.99);
  }
}

.problemBody tr:nth-child(odd) {
  background-color: #f9f9f9;
}
</style>
