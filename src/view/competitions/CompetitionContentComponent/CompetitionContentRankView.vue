<script setup lang="ts">
import { computed, onMounted, ref, Ref } from "vue";
import dayjs from "dayjs";
import router from "@/router";
import UserStore from "@/store/user";
import { CompetitionControllerService } from "../../../../generated";

const path = router.currentRoute.value.fullPath;
const useStore = UserStore();
const competition_id: Ref<number> = ref(parseInt(path.split("/")[2]));
const rated_color_list: Ref<string[]> = ref(useStore.rated_color_list);
const rank_user_list: Ref<any> = ref([]);
const status: Ref<number> = ref(0);
status.value = 1;
const problem_list: Ref<any> = ref([]);

const pageSum = ref(1);
const currentPage = ref(1);

onMounted(async () => {
  const res = await CompetitionControllerService.competitionSearchRankUsingPost(
    competition_id.value,
    1
  );

  if (res.code === 0) {
    rank_user_list.value = res.data.rank_user_list;
    problem_list.value = res.data.problem_list;
    pageSum.value = rank_user_list.value[0].page_num;
  }
});

// 分页查找
const PageClick = async (Page: number | any) => {
  if (Page <= 0 || Page > pageSum.value) {
    return;
  }

  const res = await CompetitionControllerService.competitionSearchRankUsingPost(
    competition_id.value,
    Page
  );
  if (res.code === 0) {
    rank_user_list.value = res.data.rank_user_list;
    problem_list.value = res.data.problem_list;
    pageSum.value = rank_user_list.value[0].page_num;
    currentPage.value = Page;
    console.log(currentPage.value);
    console.log(currentPage.value);
  } else {
    console.log(res.message);
  }
};
</script>

<template>
  <div class="overflow-x-auto" style="max-width: 1050px">
    <table class="table text-center border-2">
      <!-- head -->
      <thead
        class="bg-gray-500 text-white text-center"
        :style="panelStyle + ';font-size:17px'"
      >
        <tr>
          <th class="w-1/12">排名</th>
          <th class="w-1/12">参赛用户</th>
          <th class="w-2/12">学校</th>
          <th class="w-1/12">通过数</th>
          <th class="w-1/12" v-if="status == 1 || status == 2">
            <div v-if="status == 0">总分</div>
            <div v-else>罚时</div>
          </th>
          <th
            class="w-1/12"
            v-for="problem in problem_list"
            :key="problem.problem_id"
          >
            <router-link
              class="hover:text-red-500"
              :to="
                '/competition/' + competition_id + '/problem/' + problem.index
              "
            >
              {{ problem.index }}({{ problem.ac_num }} / {{ problem.test_num }})
              <div v-if="status == 1 || status == 2" class="pt-2">
                <!--                {{ problem.score }}-->
                满分: 100
              </div>
            </router-link>
          </th>
        </tr>
      </thead>
      <tbody v-if="status == 0">
        <tr
          class="bg-gray-50"
          v-for="(user, index) in rank_user_list"
          :key="user.uuid"
        >
          <th>{{ (currentPage - 1) * 20 + index + 1 }}</th>
          <td>
            <router-link
              class="font-bold"
              :to="'/user/space/' + user.uuid"
              :style="'color:' + rated_color_list[user.rated]"
            >
              {{ user.username }}
            </router-link>
          </td>
          <td>
            <div
              class="tooltip font-bold text-red-500"
              style="font-size: 17px"
              :data-tip="user.school"
            >
              <button>
                {{ user.school != null ? user.school.substring(0, 2) : "未知" }}
              </button>
            </div>
          </td>
          <td class="font-bold">{{ user.ac_num }}</td>
          <td class="font-bold">
            <span class="text-red-600">{{ user.time_penalty }}</span>
          </td>

          <td
            :class="
              'text-gray-600 font-bold ' +
              (record.status == 0 ? 'bg-sky-100' : '')
            "
            v-for="record in user.problem_record_list"
            :key="record.submission_id"
          >
            <router-link
              :to="
                '/competition/' +
                competition_id +
                '/records/' +
                record.submission_id
              "
            >
              {{ record.score }}
            </router-link>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr
          class="bg-gray-50"
          v-for="(user, index) in rank_user_list"
          :key="user.uuid"
        >
          <th>{{ (currentPage - 1) * 20 + index + 1 }}</th>

          <td>
            <router-link
              class="font-bold"
              :to="'/user/space/' + user.uuid"
              :style="'color:' + rated_color_list[user.rated]"
            >
              {{ user.username }}
            </router-link>
          </td>
          <td>
            <div
              class="tooltip font-bold text-red-500"
              style="font-size: 17px"
              :data-tip="user.school"
            >
              <button>
                {{ user.school != null ? user.school.substring(0, 2) : "未知" }}
              </button>
            </div>
          </td>
          <td>
            <div class="font-bold">{{ user.ac_num }}</div>
            <div
              class="badge bg-orange-400 text-white w-7 h-7 border-2"
              v-if="user.is_ak == 0"
            >
              AK
            </div>
          </td>
          <!--          <td>{{ user.total_score ?? 0 }}</td>-->
          <td class="font-bold">
            {{ user.ac_num * 100 }}
            <br />
            <span class="text-red-600">
              {{ user.time_penalty }}
            </span>
          </td>
          <td
            :class="
              'text-gray-600 font-bold ' +
              (record.status == 0 ? 'bg-sky-100' : '')
            "
            v-for="record in user.problem_record_list"
            :key="record.submission_id"
          >
            <div
              class="tooltip w-full"
              :data-tip="
                record.language +
                dayjs(record.submit_time).format('YYYY-MM-DD HH:mm:ss')
              "
            >
              <router-link
                class="flex ml-8"
                :to="
                  '/competition/' +
                  competition_id +
                  '/records/' +
                  record.submission_id
                "
              >
                <div v-if="record.submission_id != null">
                  <svg
                    v-if="record.language == 'C++'"
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="18.5"
                    viewBox="0 0 256 288"
                  >
                    <path
                      fill="#649AD2"
                      d="M255.987 84.59c-.002-4.837-1.037-9.112-3.13-12.781c-2.054-3.608-5.133-6.632-9.261-9.023c-34.08-19.651-68.195-39.242-102.264-58.913c-9.185-5.303-18.09-5.11-27.208.27c-13.565 8-81.48 46.91-101.719 58.632C4.071 67.6.015 74.984.013 84.58C0 124.101.013 163.62 0 203.141c0 4.73.993 8.923 2.993 12.537c2.056 3.717 5.177 6.824 9.401 9.269c20.24 11.722 88.164 50.63 101.726 58.631c9.121 5.382 18.027 5.575 27.215.27c34.07-19.672 68.186-39.262 102.272-58.913c4.224-2.444 7.345-5.553 9.401-9.267c1.997-3.614 2.992-7.806 2.992-12.539c0 0 0-79.018-.013-118.539"
                    />
                    <path
                      fill="#004482"
                      d="m128.392 143.476l-125.4 72.202c2.057 3.717 5.178 6.824 9.402 9.269c20.24 11.722 88.164 50.63 101.726 58.631c9.121 5.382 18.027 5.575 27.215.27c34.07-19.672 68.186-39.262 102.272-58.913c4.224-2.444 7.345-5.553 9.401-9.267z"
                    />
                    <path
                      fill="#1A4674"
                      d="M91.25 164.863c7.297 12.738 21.014 21.33 36.75 21.33c15.833 0 29.628-8.7 36.888-21.576l-36.496-21.141z"
                    />
                    <path
                      fill="#01589C"
                      d="M255.987 84.59c-.002-4.837-1.037-9.112-3.13-12.781l-124.465 71.667l124.616 72.192c1.997-3.614 2.99-7.806 2.992-12.539c0 0 0-79.018-.013-118.539"
                    />
                    <path
                      fill="#FFF"
                      d="M249.135 148.636h-9.738v9.74h-9.74v-9.74h-9.737V138.9h9.737v-9.738h9.74v9.738h9.738zM128 58.847c31.135 0 58.358 16.74 73.17 41.709l.444.759l-37.001 21.307c-7.333-12.609-20.978-21.094-36.613-21.094c-23.38 0-42.333 18.953-42.333 42.332a42.13 42.13 0 0 0 5.583 21.003c7.297 12.738 21.014 21.33 36.75 21.33c15.659 0 29.325-8.51 36.647-21.153l.241-.423l36.947 21.406c-14.65 25.597-42.228 42.851-73.835 42.851c-31.549 0-59.084-17.185-73.754-42.707c-7.162-12.459-11.26-26.904-11.26-42.307c0-46.95 38.061-85.013 85.014-85.013m75.865 70.314v9.738h9.737v9.737h-9.737v9.74h-9.738v-9.74h-9.738V138.9h9.738v-9.738z"
                    />
                  </svg>
                  <svg
                    v-else-if="record.language == 'C'"
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="18.5"
                    viewBox="0 0 128 128"
                  >
                    <path
                      fill="#659AD3"
                      d="M115.4 30.7L67.1 2.9c-.8-.5-1.9-.7-3.1-.7s-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.4 1 3.5l106.8-62c-.6-1.2-1.5-2.1-2.4-2.7"
                    />
                    <path
                      fill="#03599C"
                      d="M10.7 95.3c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7s2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c0-.9-.1-1.9-.6-2.8z"
                    />
                    <path
                      fill="#fff"
                      d="M85.3 76.1C81.1 83.5 73.1 88.5 64 88.5c-13.5 0-24.5-11-24.5-24.5s11-24.5 24.5-24.5c9.1 0 17.1 5 21.3 12.5l13-7.5c-6.8-11.9-19.6-20-34.3-20c-21.8 0-39.5 17.7-39.5 39.5s17.7 39.5 39.5 39.5c14.6 0 27.4-8 34.2-19.8z"
                    />
                  </svg>
                  <svg
                    v-else-if="record.language == 'Python'"
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="19.921875"
                    viewBox="0 0 256 255"
                  >
                    <defs>
                      <linearGradient
                        id="IconifyId19145be84f8d6b0b00"
                        x1="12.959%"
                        x2="79.639%"
                        y1="12.039%"
                        y2="78.201%"
                      >
                        <stop offset="0%" stop-color="#387EB8" />
                        <stop offset="100%" stop-color="#366994" />
                      </linearGradient>
                      <linearGradient
                        id="IconifyId19145be84f8d6b0b01"
                        x1="19.128%"
                        x2="90.742%"
                        y1="20.579%"
                        y2="88.429%"
                      >
                        <stop offset="0%" stop-color="#FFE052" />
                        <stop offset="100%" stop-color="#FFC331" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#IconifyId19145be84f8d6b0b00)"
                      d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072M92.802 19.66a11.12 11.12 0 0 1 11.13 11.13a11.12 11.12 0 0 1-11.13 11.13a11.12 11.12 0 0 1-11.13-11.13a11.12 11.12 0 0 1 11.13-11.13"
                    />
                    <path
                      fill="url(#IconifyId19145be84f8d6b0b01)"
                      d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897m34.114-19.586a11.12 11.12 0 0 1-11.13-11.13a11.12 11.12 0 0 1 11.13-11.131a11.12 11.12 0 0 1 11.13 11.13a11.12 11.12 0 0 1-11.13 11.13"
                    />
                  </svg>
                  <svg
                    v-else-if="record.language == 'Java'"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="27.03125"
                    viewBox="0 0 256 346"
                  >
                    <path
                      fill="#5382A1"
                      d="M82.554 267.473s-13.198 7.675 9.393 10.272c27.369 3.122 41.356 2.675 71.517-3.034c0 0 7.93 4.972 19.003 9.279c-67.611 28.977-153.019-1.679-99.913-16.517m-8.262-37.814s-14.803 10.958 7.805 13.296c29.236 3.016 52.324 3.263 92.276-4.43c0 0 5.526 5.602 14.215 8.666c-81.747 23.904-172.798 1.885-114.296-17.532"
                    />
                    <path
                      fill="#E76F00"
                      d="M143.942 165.515c16.66 19.18-4.377 36.44-4.377 36.44s42.301-21.837 22.874-49.183c-18.144-25.5-32.059-38.172 43.268-81.858c0 0-118.238 29.53-61.765 94.6"
                    />
                    <path
                      fill="#5382A1"
                      d="M233.364 295.442s9.767 8.047-10.757 14.273c-39.026 11.823-162.432 15.393-196.714.471c-12.323-5.36 10.787-12.8 18.056-14.362c7.581-1.644 11.914-1.337 11.914-1.337c-13.705-9.655-88.583 18.957-38.034 27.15c137.853 22.356 251.292-10.066 215.535-26.195M88.9 190.48s-62.771 14.91-22.228 20.323c17.118 2.292 51.243 1.774 83.03-.89c25.978-2.19 52.063-6.85 52.063-6.85s-9.16 3.923-15.787 8.448c-63.744 16.765-186.886 8.966-151.435-8.183c29.981-14.492 54.358-12.848 54.358-12.848m112.605 62.942c64.8-33.672 34.839-66.03 13.927-61.67c-5.126 1.066-7.411 1.99-7.411 1.99s1.903-2.98 5.537-4.27c41.37-14.545 73.187 42.897-13.355 65.647c0 .001 1.003-.895 1.302-1.697"
                    />
                    <path
                      fill="#E76F00"
                      d="M162.439.371s35.887 35.9-34.037 91.101c-56.071 44.282-12.786 69.53-.023 98.377c-32.73-29.53-56.75-55.526-40.635-79.72C111.395 74.612 176.918 57.393 162.439.37"
                    />
                    <path
                      fill="#5382A1"
                      d="M95.268 344.665c62.199 3.982 157.712-2.209 159.974-31.64c0 0-4.348 11.158-51.404 20.018c-53.088 9.99-118.564 8.824-157.399 2.421c.001 0 7.95 6.58 48.83 9.201"
                    />
                  </svg>
                  <div v-if="record.test_num != null && record.test_num != 0">
                    (-{{ record.test_num }})
                  </div>
                </div>
                <div
                  class="bg-red-500"
                  v-else-if="record.test_num != null && record.test_num != 0"
                >
                  <div>(-{{ record.test_num }})</div>
                </div>
                <div class="mt-1" v-else></div>
              </router-link>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="join m-auto" v-if="pageSum > 1 && rank_user_list.length > 0">
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
</template>

<style scoped></style>
