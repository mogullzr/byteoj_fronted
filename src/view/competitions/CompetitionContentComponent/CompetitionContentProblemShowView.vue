<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import router from "@/router";
import { ProblemAlgorithmControllerService } from "../../../../generated";

const path = router.currentRoute.value.fullPath;
const competition_id: Ref<number> = ref(parseInt(path.split("/")[2]));
const problem_list: Ref<any> = ref([]);

onMounted(async () => {
  const res =
    await ProblemAlgorithmControllerService.competitionSearchProblemsUsingPost(
      competition_id.value
    );
  if (res.code === 0) {
    problem_list.value = res.data;
  } else {
    problem_list.value = undefined;
  }
});
</script>

<template>
  <div class="overflow-x-auto border-4 border-gray-200">
    <table
      v-if="problem_list != undefined"
      class="table"
      style="font-size: 17px"
    >
      <!-- head -->
      <thead>
        <tr class="text-lg bg-gray-500 text-white">
          <th class="w-1/12">题号</th>
          <th class="w-2/3">题目名称</th>
          <th class="w-2/12">通过情况</th>
          <th class="w-1/12">提交状态</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr
          class="hover:bg-gray-100"
          v-for="problem in problem_list"
          :key="problem.problem_order"
        >
          <th>{{ problem.index }}</th>
          <td>
            <router-link
              class="text-sky-500 font-bold max-w-full"
              :to="
                '/competition/' + competition_id + '/problem/' + problem.index
              "
              >{{ problem.problem_name }}</router-link
            >
          </td>
          <td class="text-gray-500 font-bold">
            <span>{{ problem.ac_total }}</span>
            <span> / </span>
            <span>{{ problem.test_total }}</span>
          </td>
          <td class="text-lg">
            <div class="flex" v-if="problem.status == 0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#0EA5E9"
                  fill-rule="evenodd"
                  stroke="#0EA5E9"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="4"
                  d="m4 24l5-5l10 10L39 9l5 5l-25 25z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="pl-2 text-sky-500 font-bold">通过</div>
            </div>
            <div v-else class="pl-2 text-gray-400 font-bold">未通过</div>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="mx-auto font-bold text-gray-400">
      <span class="my-4" style="font-size: 48px">
        比赛开始的时候题目会显示在这里(〃'▽'〃)
      </span>
    </div>
  </div>
</template>

<style scoped></style>
