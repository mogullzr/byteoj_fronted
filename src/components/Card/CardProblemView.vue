<script setup>
import { onMounted, ref } from "vue";
import myAxios from "@/plugins/myAxios";
import { useRouter } from "vue-router";

const difficulty_list = {
  暂无评定: 0,
  入门: 1,
  "普及-": 2,
  "普及/提高−": 3,
  "普及+/提高": 4,
  "提高+/省选−": 5,
  "省选/NOI−": 6,
  "NOI/NOI+/CTSC": 7,
};
const color_list = [
  "badge-lg badge badge-ghost",
  "badge-lg badge badge-error",
  "badge-lg badge badge-warning",
  "badge-lg badge badge-warning",
  "badge-lg badge badge-success",
  "badge-lg badge badge-info",
  "badge-lg badge badge-primary",
  "badge-lg badge badge-neutral",
];
// const items = ref([
//   {
//     problem_id: "1",
//     problem: "A + B",
//     tags: ["思维", "贪心"].join(),
//     ok: 30,
//     all: 100,
//     source: "NOIP提高+",
//     difficulty: "简单",
//   },
// ]);

const router = useRouter();
const path = router.currentRoute.value.fullPath;
let difficulty = ref(path.toString().split("/")[2]);
const currentPage = ref(1);
let tag = ref(path.toString().split("/")[3]);
console.log(path);
const problem_list = ref([]);

onMounted(async () => {
  console.log(currentPage.value);
  currentPage.value = parseInt(localStorage.getItem("currentPage"));
  const res = await myAxios.post("/luogu/difficulty/search/", {
    params: {
      difficulty: difficulty.value,
      tag: tag.value,
      currentPage: currentPage.value,
    },
  });
  if (res.status === 200 && res.data) {
    console.log("请求成功");
    // for (var i = 0; i < res.data.length; i++) {
    //   res.data[i].algorithm_tags = res.data[i].algorithm_tags.join(" ");
    //   res.data[i].source_tags = res.data[i].source_tags.join(" ");
    // }
    problem_list.value = JSON.parse(res.data.replace(/'/g, '"'));
    // console.log(problem_list.value);
  } else {
    console.log("请求失败");
  }
});

const preLoad = async () => {
  if (currentPage.value <= 0) currentPage.value = 1;
  if (currentPage.value === 1) {
    return;
  }
  const res = await myAxios.post("/luogu/difficulty/search/", {
    params: {
      difficulty: difficulty.value,
      tag: tag.value,
      currentPage: currentPage.value - 1,
    },
  });

  if (res.status === 200 && res.data) {
    console.log("请求成功");
    // for (var i = 0; i < res.data.length; i++) {
    //   res.data[i].algorithm_tags = res.data[i].algorithm_tags.join(" ");
    //   res.data[i].source_tags = res.data[i].source_tags.join(" ");
    // }

    problem_list.value = JSON.parse(res.data.replace(/'/g, '"'));
    currentPage.value = parseInt(currentPage.value - 1);
    localStorage.setItem("currentPage", currentPage.value);
  } else {
    console.log("请求失败");
  }
};

const nextLoad = async () => {
  if (currentPage.value <= 0) currentPage.value = 1;
  console.log(currentPage.value);
  const res = await myAxios.post("/luogu/difficulty/search/", {
    params: {
      difficulty: difficulty.value,
      tag: tag.value,
      currentPage: currentPage.value + 1,
    },
  });

  if (res.status === 200 && res.data) {
    console.log("请求成功");
    // for (var i = 0; i < res.data.length; i++) {
    //   res.data[i].algorithm_tags = res.data[i].algorithm_tags.join(" ");
    //   res.data[i].source_tags = res.data[i].source_tags.join(" ");
    // }
    problem_list.value = JSON.parse(res.data.replace(/'/g, '"'));
    currentPage.value = parseInt(currentPage.value + 1);
    localStorage.setItem("currentPage", currentPage.value);
  } else {
    console.log("请求失败");
  }
};
</script>
<template>
  <div class="card-body mt-4 mx-40 h-30 bg-base-100 shadow-xl rounded-box">
    <div class="overflow-x-auto">
      <table class="table">
        <!-- head -->
        <thead>
          <tr>
            <th>题号</th>
            <th>题目</th>
            <th>算法标签</th>
            <th>来源</th>
            <th>通过率</th>
            <th>难度</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="problem in problem_list"
            :key="problem.problem_id"
            class="hover"
          >
            <td>{{ problem.problem_id }}</td>
            <router-link :to="'/problem/' + problem.problem_id">
              <td>
                {{ problem.problem_title }}
              </td>
            </router-link>
            <td>
              <span
                v-for="tag in problem.algorithm_tags"
                :key="tag"
                class="badge badge-ghost"
                >{{ tag }}</span
              >
            </td>
            <td>
              <span
                v-for="tag in JSON.parse(problem.problem_get_region)"
                :key="tag"
                class="badge badge-ghost"
                >{{ tag }}</span
              >
            </td>
            <td>{{ problem.problem_accepted_rate }}</td>
            <td>
              <span
                :class="color_list[difficulty_list[problem.problem_difficulty]]"
              >
                {{ problem.problem_difficulty }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="join">
      <button class="join-item btn" @click="preLoad">«</button>
      <button class="join-item btn">Page {{ currentPage }}</button>
      <button class="join-item btn" @click="nextLoad">»</button>
    </div>
    <!--    <div v-for="item in items" :key="item">-->
    <!--      {{ item.message }}-->
    <!--    </div>-->
  </div>
</template>

<style scoped></style>
