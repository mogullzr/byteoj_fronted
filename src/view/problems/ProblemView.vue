<script setup lang="ts">
import ProblemAlgorithmAllView from "@/view/problems/algorithm/ProblemAlgorithmAllView.vue";
import ProblemMathAllView from "@/view/problems/math/ProblemMathAllView.vue";
import Problem408AllView from "@/view/problems/408/Problem408AllView.vue";
import { onMounted, Ref, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ProblemAlgorithmControllerService,
  SearchRequest,
} from "../../../generated";
import Pagination from "@/view/components/Pagination.vue";

// 0表示显示算法题库，1表示显示数学题库，2表示显示408题库
const router = useRouter();
const route = useRoute();
const initKeyWordParam: SearchRequest = {
  category: "",
  difficulty: "",
  keyword: "",
  pageNum: 1,
  pageSize: 50,
  sourceList: [] as Array<string>,
  status: 0,
  tagsList: [] as Array<number>,
} as SearchRequest;

const keywordParam: Ref<SearchRequest> = ref(initKeyWordParam);
const category_relation = {
  algorithm: 0,
  math: 1,
  408: 2,
};
let category = route.path.split("/")[2];

const isShow: any = ref(category_relation[category] ?? 0);
const data_list: Ref<any[]> = ref([] as any);

onMounted(async () => {
  let checkBox: any = document.getElementById(category);
  checkBox.setAttribute("checked", "checked");
});
// 切换tab栏
const changeShow = (key: string) => {
  isShow.value = category_relation[key];
  keywordParam.value.category = key;
  router.push({
    path: `${keywordParam.value.category}`,
    query: keywordParam.value,
  });
};

watchEffect(() => {
  keywordParam.value = {
    category: route.query.category,
    difficulty: route.query.difficutly,
    keyword: route.query.keyword,
    pageNum: route.query.pageNum,
    pageSize: route.query.pageSize,
    sourceList: route.query.sourceList,
    status: route.query.status,
    tagsList: route.query.tagsList,
  } as any;
});
</script>

<template>
  <div
    role="tablist"
    class="tabs tabs-lifted tabs-lg mx-auto"
    style="max-width: 1150px"
  >
    <input
      id="algorithm"
      type="radio"
      name="my_tabs_2"
      role="tab"
      :class="'tab w-64 font-bold' + (isShow == 0 ? '' : ' text-white')"
      aria-label="算法编程题库"
      style="font-size: 18px; white-space: nowrap"
      checked="checked"
      @click="changeShow('algorithm')"
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-300 rounded-box"
      v-if="isShow === 0"
    >
      <ProblemAlgorithmAllView />
    </div>

    <input
      id="math"
      type="radio"
      name="my_tabs_2"
      role="tab"
      :class="'tab font-bold' + (isShow == 1 ? '' : ' text-white')"
      aria-label="数学考研试题"
      style="font-size: 18px; white-space: nowrap"
      @click="changeShow('math')"
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-300 rounded-box"
      v-if="isShow === 1"
    >
      <ProblemMathAllView />
    </div>

    <input
      id="408"
      type="radio"
      name="my_tabs_2"
      role="tab"
      :class="'tab font-bold' + (isShow == 2 ? '' : ' text-white')"
      aria-label="408考研试题"
      style="font-size: 18px; white-space: nowrap"
      @click="changeShow('408')"
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-300 rounded-box"
      v-if="isShow === 2"
    >
      <Problem408AllView />
    </div>
  </div>
</template>

<style scoped></style>
