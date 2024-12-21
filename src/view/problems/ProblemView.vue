<script setup lang="ts">
import ProblemAlgorithmAllView from "@/view/problems/algorithm/ProblemAlgorithmAllView.vue";
import ProblemMathAllView from "@/view/problems/math/ProblemMathAllView.vue";
import Problem408AllView from "@/view/problems/408/Problem408AllView.vue";
import {onMounted, Ref, ref, watchEffect} from "vue";
import {useRoute, useRouter} from "vue-router"
import {ProblemAlgorithmControllerService} from "../../../generated";
// 0表示显示算法题库，1表示显示数学题库，2表示显示408题库

const router = useRouter();
const route = useRoute();
const initKeyWordParam:any = {
  keyword: "",
  pageNum: 1,
  pageSize: 1
};
const keywordParam:Ref<any> = ref(initKeyWordParam);
const category_relation = {
  "algorithm":0,
  "math":1,
  "408":2
};
let category = route.path.split('/')[2];
const isShow:any = ref(category_relation[category]);
const data_list:Ref<any[]> = ref([] as any);

onMounted(async ()=>{
  let checkBox:any = document.getElementById(category);
  checkBox.setAttribute("checked","checked")

  // 展示请求
  const res = await ProblemAlgorithmControllerService.problemAlgorithmSearchByKeywordUsingPost(keywordParam.value.keyword, keywordParam.value.pageNum);
  if (res.code === 0) {
    data_list.value = res.data;
  }
})
// 切换tab栏
const changeShow = (key: string) => {
  isShow.value = category_relation[key];
  category = key;
  console.log(keywordParam.value)
  router.push({
    path: `${category}`,
    query: keywordParam.value
  })
};

// 搜索框
const onSearch = async () => {
  router.push({
    query:keywordParam.value
  });
  const res = await ProblemAlgorithmControllerService.problemAlgorithmSearchByKeywordUsingPost(keywordParam.value.keyword, keywordParam.value.pageNum);
  if (res.code === 0) {
    data_list.value = res.data;
  }
}

watchEffect(()=>{
  keywordParam.value = {
    keyword: route.query.keyword,
    pageNum: route.query.pageNum,
    pageSize: route.query.pageSize
  }
})
</script>

<template>
  <div class="card bg-base-100 mx-auto">
    <div class="card-body bg-base-100 border-base-300 mx-auto shadow-xl p-0 rounded-box">
      <div class="my-6">
        <div class="font-bold text-center text-4xl">ByteOJ聚合搜索</div>
      </div>
      <div class="w-full my-4 flex px-36">
        <input
            v-model="keywordParam.keyword"
            type="text"
            placeholder="搜索题目"
            class="input input-bordered input-md input-s w-full m-auto h-10"
            @keyup.enter="onSearch"
        />
        <button class="svg-hover ml-2" @click="onSearch">
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
      <div
          role="tablist"
          class="tabs tabs-lifted tabs-lg "
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
            @click="changeShow('algorithm')"
        />
        <div
            role="tabpanel"
            class="tab-content bg-base-100 border-base-300 rounded-box"
            v-if="isShow === 0"
        >
          <ProblemAlgorithmAllView :problem-list="data_list"/>
        </div>

        <input
            id="math"
            type="radio"
            name="my_tabs_2"
            role="tab"
            :class="'tab w-64 font-bold' + (isShow == 1 ? '' : ' text-white')"
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
            :class="'tab w-64 font-bold' + (isShow == 2 ? '' : ' text-white')"
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
    </div>
  </div>

</template>

<style scoped></style>
