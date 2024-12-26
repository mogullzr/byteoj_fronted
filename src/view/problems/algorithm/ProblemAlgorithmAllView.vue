<script setup lang="ts">
import { onMounted, onUpdated, Ref, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ProblemAlgorithmControllerService,
  SearchControllerService,
  SearchRequest,
} from "../../../../generated";
import UserStore from "@/store/user";
import Dropdown from "@/view/components/Dropdown.vue";
import TagSelector from "@/view/components/TagSelector.vue";
import Pagination from "@/view/components/Pagination.vue";

const router = useRouter();
const route = useRoute();
const useStore = UserStore();
let category = route.path.split("/")[2];
const path = router.currentRoute.value.fullPath;
const currentPage = ref(1);
const tag_current_name = ref("");
const EasySum = ref();
const MediumSum = ref();
const HardSum = ref();
// 0表示默认请求状态，1最后点击为表示根据标签查询，2表示最后点击为根据难度查询
const flag = ref(0);

let problem_list: Ref<any> = ref([]);
const difficulty_list = useStore.difficulty_list;
const difficulties = useStore.difficulties;
// 获取分页组件的引用
const paginationRef: any = ref(null);

const color_list = useStore.color_list;

const initKeyWordParam: SearchRequest = {
  category: "",
  difficulty: "",
  keyword: "",
  pageNum: 1,
  pageSize: 50,
  pages: 1,
  sourceList: [] as Array<string>,
  status: 0,
  tagsList: [] as Array<number>,
} as SearchRequest;

const keywordParam: Ref<SearchRequest> = ref(initKeyWordParam);

const loadData = async () => {
  const res = await SearchControllerService.searchAllUsingPost(
    keywordParam.value
  );
  if (res.code === 0) {
    problem_list.value = res.data.dataList;
    keywordParam.value.pages = problem_list.value[0].pages;
    for (let item = 0; item < problem_list.value?.length; item++) {
      if (problem_list.value[item]?.difficulty == "困难") {
        problem_list.value[item].difficulty = "difficult";
      } else if (problem_list.value[item]?.difficulty == "中等") {
        problem_list.value[item].difficulty = "medium";
      } else {
        problem_list.value[item].difficulty = "easy";
      }
    }
  }
  let tags = route.query.tagsList?.split(",");
  keywordParam.value.tagsList = tags.slice(0, tags.length - 1);
};

watchEffect(() => {
  console.log(keywordParam.value);
  let sourceList: any = route.query.sourceList;
  let tagsList: any = route.query.tagsList;

  if (sourceList != undefined && sourceList != "") {
    sourceList = sourceList?.split(",");
    sourceList = sourceList?.splice(0, sourceList.length - 1);

    if (sourceList[0] == "") {
      sourceList = [];
    }
  } else {
    sourceList = [];
  }

  if (tagsList != undefined && tagsList != "") {
    tagsList = tagsList?.split(",");
    tagsList = tagsList?.splice(0, tagsList.length - 1);
    tagsList = tagsList?.map((tags: any) => {
      let tag_id;
      useStore.AlgorithmTagsRelation[0].map((algorithmTag: any) => {
        if (tags === algorithmTag.tag_name) tag_id = algorithmTag.tag_id;
      });
      return tag_id ?? "";
    });
    if (tagsList[0] == "") {
      tagsList = [];
    }
  } else {
    tagsList = [];
  }
  console.log(keywordParam.value);
  keywordParam.value = {
    category: route.query.category ?? "algorithm",
    difficulty: route.query.difficulty ?? "",
    keyword: route.query.keyword ?? "",
    pageNum: parseInt(route.query.pageNum ?? "1"),
    pageSize: parseInt(route.query.pageSize ?? "50"),
    pages: parseInt(route.query.pages ?? "1"),
    sourceList: sourceList ?? [],
    status: route.query.status,
    tagsList: tagsList ?? [],
  } as any;
  console.log(keywordParam.value);

  loadData();
});

onMounted(async () => {
  if (selectedTags0.value[0] === "") selectedTags0.value = [];
  if (selectedTags1.value[0] === "") selectedTags1.value = []; // 请求1
  // const res =
  //   await ProblemAlgorithmControllerService.problemAlgorithmSearchByPageUsingPost(
  //     1
  //   );
  // if (res.code === 0) {
  //   if (res.data != undefined) {
  //     for (let item = 0; item < res.data.len gth; item++) {
  //       problem_list.value.push(res.data[item]);
  //     }
  //   }
  // } else if (res.code === 40101) {
  //   router.push("/404");
  // }

  // 请求2
  // const response =
  //   await ProblemAlgorithmControllerService.problemAlgorithmSearchPagSumUsingPost();
  // if (response.code === 0) {
  //   PageSum.value = response.data;
  // } else if (res.code === 40101) {
  //   router.push("/404");
  // }

  // 请求3
  const resEasy =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchSumByDifficultyUsingPost(
      "简单"
    );

  if (resEasy.code === 0) {
    EasySum.value = resEasy.data;
  } else if (resEasy.code === 40101) {
    await router.push("/404");
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
const PageClick = (page: any) => {
  let key = keywordParam.value;
  key.pageNum = page;
  if (
    keywordParam.value.tagsList[keywordParam.value.tagsList.length - 1] != "" &&
    keywordParam.value.tagsList[keywordParam.value.tagsList.length - 1] != ","
  ) {
    key.tagsList += ",";
  }
  if (
    keywordParam.value.sourceList[keywordParam.value.sourceList.length - 1] !=
      "" &&
    keywordParam.value.sourceList[keywordParam.value.sourceList.length - 1] !=
      ","
  ) {
    key.sourceList += ",";
  }
  router.push({
    path: `${category}`,
    query: key,
  });
};

const searchByKeyword = () => {
  if (paginationRef.value) {
    paginationRef.value.jumpToPage(1);
  }
  keywordParam.value.pageNum = 1;
  let key = keywordParam.value;
  if (
    keywordParam.value.tagsList[keywordParam.value.tagsList.length - 1] != "" &&
    keywordParam.value.tagsList[keywordParam.value.tagsList.length - 1] != ","
  ) {
    key.tagsList += ",";
  }
  if (
    keywordParam.value.sourceList[keywordParam.value.sourceList.length - 1] !=
      "" &&
    keywordParam.value.sourceList[keywordParam.value.sourceList.length - 1] !=
      ","
  ) {
    key.sourceList += ",";
  }
  router.push({
    path: `${category}`,
    query: key,
  });
};

const checkDifficulty = () => {
  if (paginationRef.value) {
    paginationRef.value.jumpToPage(1);
  }
  keywordParam.value.pageNum = 1;
  let key = keywordParam.value;
  if (
    keywordParam.value.tagsList[keywordParam.value.tagsList.length - 1] != "" &&
    keywordParam.value.tagsList[keywordParam.value.tagsList.length - 1] != ","
  ) {
    key.tagsList += ",";
  }
  if (
    keywordParam.value.sourceList[keywordParam.value.sourceList.length - 1] !=
      "" &&
    keywordParam.value.sourceList[keywordParam.value.sourceList.length - 1] !=
      ","
  ) {
    key.sourceList += ",";
  }
  router.push({
    path: `${category}`,
    query: key,
  });
};
const tagSelector: any = ref(null);

const allTags0 = ref(
  useStore.AlgorithmTagsRelation[0].map((tag: any) => {
    return tag.tag_name;
  })
);

const allTags1 = ref(
  useStore.SourceList.map((source) => {
    return source.tag_name;
  })
);
let selectedTags00: any =
  (route.query.tagsList as any)?.split(",")[0] == ""
    ? []
    : (route.query.tagsList as any)?.split(",");
const selectedTags0: Ref<any> = ref(
  selectedTags00?.splice(0, selectedTags00?.length - 1)
);

let selectedTags11: any =
  (route.query.sourceList as any)?.split(",")[0] == ""
    ? []
    : (route.query.sourceList as any)?.split(",");
const selectedTags1: Ref<any> = ref(
  selectedTags11?.splice(0, selectedTags11?.length - 1)
);

// 1.来源标签：处理从子组件传回来的选中标签
const handleSelectedTagsUpdate1 = (newSelectedTags: any) => {
  if (paginationRef.value) {
    paginationRef.value.jumpToPage(1);
  }
  keywordParam.value.pageNum = 1;
  let sources: any = "";
  selectedTags1.value = newSelectedTags;
  newSelectedTags?.map((source: any) => {
    sources += source + ",";
  });
  let key = keywordParam.value;
  key.sourceList = sources;
  if (
    keywordParam.value.tagsList[keywordParam.value.tagsList.length - 1] != "" &&
    keywordParam.value.tagsList[keywordParam.value.tagsList.length - 1] != ","
  ) {
    key.tagsList += ",";
  }
  if (
    keywordParam.value.sourceList[keywordParam.value.sourceList.length - 1] !=
      "" &&
    keywordParam.value.sourceList[keywordParam.value.sourceList.length - 1] !=
      ","
  ) {
    key.sourceList += ",";
  }
  router.push({
    path: `${category}`,
    query: key,
  });
};

// 2.算法标签：处理从子组件传回来的选中标签
const handleSelectedTagsUpdate0 = (newSelectedTags: any) => {
  if (paginationRef.value) {
    paginationRef.value.jumpToPage(1);
  }
  keywordParam.value.pageNum = 1;
  let tags: any = "";
  selectedTags0.value = newSelectedTags;
  newSelectedTags?.map((tag: any) => {
    tags += tag + ",";
  });
  let key = keywordParam.value;
  key.tagsList = tags;
  if (
    keywordParam.value.tagsList[keywordParam.value.tagsList.length - 1] != "" &&
    keywordParam.value.tagsList[keywordParam.value.tagsList.length - 1] != ","
  ) {
    key.tagsList += ",";
  }
  if (
    keywordParam.value.sourceList[keywordParam.value.sourceList.length - 1] !=
      "" &&
    keywordParam.value.sourceList[keywordParam.value.sourceList.length - 1] !=
      ","
  ) {
    keywordParam.value.sourceList += ",";
  }
  router.push({
    path: `${category}`,
    query: key,
  });
};

// 添加算法标签
const addAlgorithmTag = (tag: any) => {
  console.log(keywordParam.value);
  if (paginationRef.value) {
    paginationRef.value.jumpToPage(1);
  }
  keywordParam.value.pageNum = 1;
  let tags: any = "";

  selectedTags0.value = keywordParam.value?.tagsList;
  if (tagSelector.value) {
    // 触发事件
    tagSelector.value.$emit("update:selectedTags", selectedTags0.value);
  }
  keywordParam.value?.tagsList?.map((tag: any) => {
    tags += tag + ",";
  });
  let key = keywordParam.value;
  key.tagsList = tags;
  router.push({
    path: `${category}`,
    query: key,
  });
  router.go(0);
};

// 添加来源标签
const addSourceTag = (tag: any) => {
  if (paginationRef.value) {
    paginationRef.value.jumpToPage(1);
  }
  keywordParam.value.pageNum = 1;
  let tags: any = "";
  keywordParam.value.sourceList?.push(tag);
  selectedTags0.value = keywordParam.value?.sourceList;
  if (tagSelector.value) {
    // 触发事件
    tagSelector.value.$emit("update:selectedTags", selectedTags0.value);
  }
  keywordParam.value?.sourceList?.map((tag: any) => {
    tags += tag + ",";
  });
  let key = keywordParam.value;
  key.sourceList = tags;
  router.push({
    path: `${category}`,
    query: key,
  });
};

const searchByDifficulty = (difficulty: string) => {
  keywordParam.value.difficulty = difficulty;
  let key = keywordParam.value;
  if (
    keywordParam.value.tagsList[keywordParam.value.tagsList.length - 1] != "" &&
    keywordParam.value.tagsList[keywordParam.value.tagsList.length - 1] != ","
  ) {
    key.tagsList += ",";
  }
  if (
    keywordParam.value.sourceList[keywordParam.value.sourceList.length - 1] !=
      "" &&
    keywordParam.value.sourceList[keywordParam.value.sourceList.length - 1] !=
      ","
  ) {
    keywordParam.value.sourceList += ",";
  }
  router.push({
    path: `${category}`,
    query: key,
  });
};
</script>
<template>
  <div class="card-body mt-4 h-30 bg-base-100 shadow-xl rounded-box">
    <div class="w-7/12 m-auto">
      <div class="font-bold text-center text-4xl">ByteOJ编程题库</div>
      <div class="w-full my-4 flex">
        <input
          v-model="keywordParam.keyword"
          type="text"
          placeholder="搜索题目"
          class="input input-bordered input-md input-s w-full m-auto"
          style="height: 40px"
          @keyup.enter="searchByKeyword"
        />
        <button class="svg-hover mx-2" @click="searchByKeyword">
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
    <div class="mx-12 flex">
      <div class="flex-1">
        <Dropdown
          class="mr-4"
          v-model="keywordParam.difficulty"
          :options="difficulties"
          placeholder="选择题目难度"
          @click="checkDifficulty"
        />
      </div>
      <div class="w-2/3 flex">
        <div
          class="flex-1 text-sm"
          style="padding: 24px 10px; font-weight: bold; white-space: nowrap"
        >
          算法
        </div>
        <TagSelector
          ref="tagSelector"
          :allTags="allTags0"
          :defaultSelectedTags="selectedTags0"
          tagType="algorithm"
          @update:selectedTags="handleSelectedTagsUpdate0"
        />
      </div>
      <div class="w-2/3 flex">
        <div
          class="flex-1 text-sm"
          style="padding: 24px 10px; font-weight: bold; white-space: nowrap"
        >
          来源
        </div>
        <TagSelector
          :allTags="allTags1"
          :defaultSelectedTags="selectedTags1"
          tagType="source"
          @update:selectedTags="handleSelectedTagsUpdate1"
        />
      </div>
    </div>
    <div class="overflow-x-auto">
      <div class="flex flex-row-reverse">
        <div>
          <button>
            <span class="text-error" @click="searchByDifficulty('difficult')"
              >困难题</span
            >
            <span class="font-bold">{{ HardSum }}</span>
            <span>道，</span>
          </button>
        </div>
        <div>
          <button>
            <span class="text-warning" @click="searchByDifficulty('medium')"
              >中等题</span
            >
            <span class="font-bold">{{ MediumSum }}</span>
            <span>道，</span>
          </button>
        </div>
        <div>
          其中
          <button>
            <span class="text-success" @click="searchByDifficulty('easy')"
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
                @click="addAlgorithmTag(tag)"
              >
                <span
                  v-if="
                    keywordParam.tagsList?.some((item:any) => item.includes(tag))
                  "
                  :class="'badge text-red-500 bg-gray-100 ' + tag"
                  >{{ tag }}</span
                >
                <span v-else :class="'badge bg-gray-100 ' + tag">{{
                  tag
                }}</span>
              </button>
            </td>
            <td>
              <button @click="addSourceTag(problem.source)">
                <span
                  v-if="
                    keywordParam.sourceList?.some((item:any) => item.includes(problem.source))
                  "
                  class="badge text-red-500 bg-gray-100"
                  >{{ problem.source }}</span
                >
                <span v-else class="badge bg-gray-100">{{
                  problem.source
                }}</span>
              </button>
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
    <Pagination
      ref="paginationRef"
      :currentPage="keywordParam.pageNum"
      :totalPages="keywordParam.pages"
      @update:currentPage="keywordParam.pageNum = $event"
      @pageChanged="PageClick"
    />
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
