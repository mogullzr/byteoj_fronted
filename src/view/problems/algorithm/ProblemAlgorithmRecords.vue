<script setup lang="ts">
import { onMounted, Ref, ref } from "vue";
import { ProblemAlgorithmControllerService } from "../../../../generated";
import UserStore from "@/store/user";
import router from "@/router";
import dayjs, { Dayjs } from "dayjs";

const useStore = UserStore();

const problem_records: Ref<any[]> = ref([]);
const path = router.currentRoute.value.fullPath;
const problem_id = ref(
  path.toString().split("/")[3] == "problem"
    ? path.toString().split("/")[4]
    : parseInt(path.toString().split("/")[3])
);
const nowDate = ref<Dayjs>();
const years = ref();
const months = ref();
const days = ref();
const hours = ref();
const minutes = ref();
const seconds = ref();

const PageSum = ref(1);
const currentPage = ref(1);
let TimeStamp = ref();

onMounted(async () => {
  if (problem_id.value === "problem") {
  }
  const res1 =
    await ProblemAlgorithmControllerService.problemAlgorithmRecordsByUUidByPageUsingPost(
      1,
      problem_id.value
    );

  if (res1.code === 0) {
    problem_records.value = res1.data;
    for (let item = 0; item < problem_records.value.length; item++) {
      problem_records.value[item].submit_time = ref<Dayjs>(
        problem_records.value[item].submit_time
      );

      TimeStamp.value =
        dayjs(nowDate.value).diff(
          dayjs(problem_records.value[item].submit_time)
        ) / 1000;

      years.value = Math.floor(TimeStamp.value / (365 * 24 * 60 * 60));
      if (years.value >= 1) {
        problem_records.value[item].submit_time = ref(years.value);
        problem_records.value[item].pattern = ref("年前");
        continue;
      }

      months.value = Math.floor(TimeStamp.value / (30 * 24 * 60 * 60));
      if (months.value >= 1) {
        problem_records.value[item].submit_time = ref(months.value);
        problem_records.value[item].pattern = ref("个月前");
        continue;
      }

      days.value = Math.floor(TimeStamp.value / (24 * 60 * 60));
      if (days.value >= 1) {
        problem_records.value[item].submit_time = ref(days.value);
        problem_records.value[item].pattern = ref("天前");
        continue;
      }

      hours.value = Math.floor(TimeStamp.value / (60 * 60));
      if (hours.value >= 1) {
        problem_records.value[item].submit_time = ref(hours.value);
        problem_records.value[item].pattern = ref("个小时前");
        continue;
      }

      minutes.value = Math.floor(TimeStamp.value / 60);
      if (minutes.value >= 1) {
        problem_records.value[item].submit_time = ref(minutes);
        problem_records.value[item].pattern = ref("分钟前");
        continue;
      }
      seconds.value = Math.floor(TimeStamp.value);
      problem_records.value[item].submit_time = ref(seconds.value);
      problem_records.value[item].pattern = ref("秒前");
    }

    currentPage.value = 1;
  } else if (res1.code === 40101) {
    router.replace("/404");
  }

  const res2 =
    await ProblemAlgorithmControllerService.problemAlgorithmRecordsSumByUuidByPageUsingPost(
      problem_id.value
    );

  if (res2.code === 0) {
    PageSum.value = res2.data;
  } else if (res2.code === 40101) {
    router.replace("/404");
  }
});

// 挂载完成之后执行
const PageClick = async (Page: number) => {
  if (Page <= 0 || Page > PageSum.value) {
    return;
  }
  const res =
    await ProblemAlgorithmControllerService.problemAlgorithmRecordsByUUidByPageUsingPost(
      Page,
      problem_id.value
    );

  if (res.code === 0) {
    problem_records.value = [];
    problem_records.value = res.data;
    for (let item = 0; item < problem_records.value.length; item++) {
      problem_records.value[item].submit_time = ref<Dayjs>(
        problem_records.value[item].submit_time
      );

      TimeStamp.value =
        dayjs(nowDate.value).diff(
          dayjs(problem_records.value[item].submit_time)
        ) / 1000;

      years.value = Math.floor(TimeStamp.value / (365 * 24 * 60 * 60));
      if (years.value >= 1) {
        problem_records.value[item].submit_time = ref(years.value);
        problem_records.value[item].pattern = ref("年前");
        continue;
      }

      months.value = Math.floor(TimeStamp.value / (30 * 24 * 60 * 60));
      if (months.value >= 1) {
        problem_records.value[item].submit_time = ref(months.value);
        problem_records.value[item].pattern = ref("个月前");
        continue;
      }

      days.value = Math.floor(TimeStamp.value / (24 * 60 * 60));
      if (days.value >= 1) {
        problem_records.value[item].submit_time = ref(days.value);
        problem_records.value[item].pattern = ref("天前");
        continue;
      }

      hours.value = Math.floor(TimeStamp.value / (60 * 60));
      if (hours.value >= 1) {
        problem_records.value[item].submit_time = ref(hours.value);
        problem_records.value[item].pattern = ref("个小时前");
        continue;
      }

      minutes.value = Math.floor(TimeStamp.value / 60);
      if (minutes.value >= 1) {
        problem_records.value[item].submit_time = ref(minutes);
        problem_records.value[item].pattern = ref("分钟前");
        continue;
      }
      seconds.value = Math.floor(TimeStamp.value);
      problem_records.value[item].submit_time = ref(seconds.value);
      problem_records.value[item].pattern = ref("秒前");
    }
    currentPage.value = Page;
  } else {
    console.log(res.message);
  }
};
</script>

<template>
  <div class="overflow-x-auto">
    <table class="table" v-if="problem_records.length >= 1">
      <!-- head -->
      <thead>
        <tr>
          <th>提交时间</th>
          <th>状态</th>
          <th>运行时间</th>
          <th>内存使用</th>
          <th>代码长度</th>
          <th>得分</th>
          <th>语言</th>
        </tr>
      </thead>
      <tbody class="problemBody">
        <!-- row 1 -->
        <tr v-for="record in problem_records" :key="record">
          <th>{{ record.submit_time }}{{ record.pattern }}</th>

          <th class="text-green-500" v-if="record.result === 'Accepted'">
            <a
              class="link link-hover"
              :href="
                '/problems/' + problem_id + '/records/' + record.submission_id
              "
            >
              {{ record.result }}
            </a>
          </th>
          <th class="text-red-500" v-else>
            <a
              class="link link-hover"
              :href="
                '/problems/' + problem_id + '/records/' + record.submission_id
              "
            >
              {{ record.result }}
            </a>
          </th>
          <td>{{ record.time_used }}ms</td>
          <td>{{ record.memory_used }}MB</td>
          <td>{{ record.code_length }}</td>
          <td>??</td>
          <td>{{ record.language }}</td>
        </tr>
      </tbody>
    </table>

    <div
      class="text-5xl mx-auto font-bold text-gray-400 text-center h-32 mt-12"
      v-else
    >
      {{
        useStore.loginUser.uuid === -1
          ? "你还没有登录(⊙_⊙)?唉"
          : "看啥看，快去写题呀[○･｀Д´･ ○]"
      }}
    </div>
    <div class="flex" v-if="PageSum > 1">
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
  </div>
</template>

<style scoped>
.problemBody tr:nth-child(odd) {
  background-color: #f9f9f9;
}
</style>
