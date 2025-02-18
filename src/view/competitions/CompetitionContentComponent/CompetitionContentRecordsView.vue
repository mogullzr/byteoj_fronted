<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import dayjs from "dayjs";
import router from "@/router";
import UserStore from "@/store/user";
import {
  CompetitionControllerService,
  ProblemAlgorithmControllerService,
} from "../../../../generated";

const path = router.currentRoute.value.fullPath;
const useStore = UserStore();
const competition_id: Ref<number> = ref(parseInt(path.split("/")[2]));
const rated_color_list: Ref<string[]> = ref(useStore.rated_color_list);

const records: Ref<any> = ref([]);
const pageSum = ref([]);
const currentPage = ref(1);

onMounted(async () => {
  const res =
    await CompetitionControllerService.competitionSearchRecordUsingPost(
      competition_id.value,
      1
    );

  if (res.code === 0) {
    records.value = res.data;
    pageSum.value = records.value[0].page_num;
  }
});

// 分页查找
const PageClick = async (Page: number | any) => {
  if (Page <= 0 || Page > pageSum.value) {
    return;
  }

  const res =
    await CompetitionControllerService.competitionSearchRecordUsingPost(
      competition_id.value,
      Page
    );
  if (res.code === 0) {
    records.value = [];
    for (let item = 0; item < res.data.length; item++) {
      records.value.push(res.data[item]);
    }
    currentPage.value = Page;
  } else {
    console.log(res.message);
  }
};
</script>

<template>
  <div class="overflow-x-auto">
    <table class="table border-2">
      <!-- head -->
      <thead>
        <tr class="text-lg bg-gray-500 text-white text-center">
          <th class="w-1/12">运行ID号</th>
          <th class="w-1/12">用户名</th>
          <th class="w-1/12">题号</th>
          <th class="w-1/12">运行结果</th>
          <th class="w-1/12">得分</th>
          <th class="w-1/12">运行实现(ms)</th>
          <th class="w-1/12">内存大小(MB)</th>
          <th class="w-1/12">代码长度</th>
          <th class="w-1/12">使用语言</th>
          <th class="w-11/12">提交时间</th>
        </tr>
      </thead>
      <tbody>
        <!-- row 1 -->
        <tr
          class="hover:bg-gray-100 text-center"
          v-for="record in records"
          :key="record.record_id"
          style="font-size: 16px"
        >
          <th>
            <router-link
              class="hover:text-gray-600"
              :to="
                '/competition/' +
                competition_id +
                '/records/' +
                record.submission_id
              "
            >
              {{ record.submission_id }}
            </router-link>
          </th>
          <td>
            <router-link
              :to="'/user/space/' + record.uuid"
              class="text-gray-500"
              :style="'color:' + rated_color_list[record.rated]"
            >
              {{ record.user_name }}
            </router-link>
          </td>
          <td>
            <router-link
              class="hover:text-gray-600"
              :to="competition_id + '/problem/' + record.chinese_name"
            >
              {{ record.chinese_name }}
            </router-link>
          </td>
          <td>
            <router-link
              v-if="record.result == 'Accepted'"
              :to="
                '/competition/' +
                competition_id +
                '/records/' +
                record.submission_id
              "
              class=""
              style="color: #25bb9b"
            >
              答案正确
            </router-link>
            <router-link
              v-else
              :to="
                '/competition/' +
                competition_id +
                '/records/' +
                record.submission_id
              "
              class="text-red-500"
            >
              答案错误
            </router-link>
          </td>
          <td>
            <router-link
              v-if="record.record_score / record.score >= 0.9"
              class=""
              :to="
                '/competition/' +
                competition_id +
                '/records/' +
                record.record_id
              "
              style="color: #25bb9b"
            >
              {{ record.score }}
            </router-link>
            <router-link
              v-else-if="record.record_score / record.score >= 0.2"
              class="text-amber-500"
              :to="
                '/competition/' +
                competition_id +
                '/records/' +
                record.record_id
              "
            >
              {{ record.record_score }}
            </router-link>
            <router-link
              v-else
              class="text-red-500"
              :to="
                '/competition/' +
                competition_id +
                '/records/' +
                record.record_id
              "
            >
              {{ record.record_score }}
            </router-link>
          </td>
          <td class="text-gray-700">{{ record.time_used }}</td>
          <td class="text-gray-700">{{ record.memory_used }}</td>
          <td class="text-gray-700">{{ record.code_length }}</td>
          <td class="text-gray-700">{{ record.language }}</td>
          <td class="text-gray-700">
            {{ dayjs(record.submit_time).format("YYYY-MM-DD HH:mm:ss") }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="join m-auto" v-if="pageSum > 1 && records.length > 0">
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
        v-if="currentPage + 1 < pageSum"
        class="join-item btn"
        @click="PageClick(currentPage + 1)"
      >
        {{ currentPage + 1 }}
      </button>
      <button class="join-item btn btn-disabled" v-if="currentPage != pageSum">
        ...
      </button>
      <button
        class="join-item btn"
        v-if="currentPage + 2 < pageSum"
        @click="PageClick(pageSum - 1)"
      >
        {{ pageSum - 1 }}
      </button>
      <button
        v-if="currentPage != pageSum"
        class="join-item btn"
        @click="PageClick(pageSum)"
      >
        {{ pageSum }}
      </button>
      <button class="join-item btn" @click="PageClick(pageSum)">»</button>
    </div>
  </div>
</template>

<style scoped></style>
