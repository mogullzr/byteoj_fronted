<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
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
    1,
    0
  );

  if (res.code === 0) {
    rank_user_list.value = res.data.rank_user_list;
    problem_list.value = res.data.problem_list;
    pageSum.value = rank_user_list.value[0].page_num;
  }
});

const timeStrToMinutes = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number); // 拆分并转为数字
  return hours * 60 + minutes; // 计算总分钟数（忽略秒）
}

// 分页查找
const PageClick = async (Page: number | any) => {
  if (Page <= 0 || Page > pageSum.value) {
    return;
  }

  const res = await CompetitionControllerService.competitionSearchRankUsingPost(
    competition_id.value,
    Page,
    0
  );
  if (res.code === 0) {
    rank_user_list.value = res.data.rank_user_list;
    problem_list.value = res.data.problem_list;
    pageSum.value = rank_user_list.value[0].page_num;
    currentPage.value = Page;
  }
};

// 判断是否为第一页前三名
const isTopThree = (index: number) => {
  return currentPage.value === 1 && index <= 3;
};

// 秒转时分秒
const secondsToHMS = (seconds:number) => {
  // 计算小时、分钟、剩余秒数
  const hours = Math.floor(seconds / 3600);    // 1小时 = 3600秒
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  // 补零操作（确保两位数显示）
  const pad = (num:number) => num.toString().padStart(2, '0');

  // 组合成 HH:MM:SS 格式
  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
}
</script>

<template>
  <div class="ranking-container">
    <div class="table-wrapper">
      <table class="ranking-table">
        <!-- 表头 -->
        <thead>
          <tr>
            <th class="rank-col sticky-col sticky-rank">排名</th>
            <th class="user-col sticky-col sticky-user">参赛用户</th>
            <th class="school-col sticky-col sticky-school">学校</th>
            <th class="ac-col">通过数</th>
            <th class="penalty-col">
              <div v-if="status == 0">总分</div>
              <div v-else>罚时</div>
            </th>
            <th
              class="problem-col"
              v-for="problem in problem_list"
              :key="problem.problem_id"
            >
              <router-link
                :to="
                  '/competition/' + competition_id + '/problem/' + problem.index
                "
              >
                <div class="problem-title">{{ problem.index }}</div>
                <div class="problem-stats">
                  ({{ problem.ac_num }}/{{ problem.test_num }})
                </div>
                <div v-if="status == 1 || status == 2" class="problem-score">
                  满分: 100
                </div>
              </router-link>
            </th>
          </tr>
        </thead>

        <!-- 表格内容 -->
        <tbody v-if="status == 0">
          <tr
            v-for="(user, index) in rank_user_list"
            :key="user.uuid"
            :class="[
              index % 2 === 0 ? 'even-row' : 'odd-row',
              isTopThree(index) ? 'top-three-row' : '',
              isTopThree(index) ? `top-${index + 1}` : '',
            ]"
          >
            <td class="rank sticky-col sticky-rank">
              <span v-if="isTopThree(index)" class="medal">
                {{ (currentPage - 1) * 15 + index + 1 }}
              </span>
              <span v-else>
                {{ (currentPage - 1) * 15 + index + 1 }}
              </span>
            </td>
            <td class="user sticky-col sticky-user">
              <router-link
                :to="'/user/space/' + user.uuid"
                :style="'color:' + rated_color_list[user.rated]"
              >
                {{ user.username }}
              </router-link>
            </td>
            <td class="school sticky-col sticky-school">
              <div class="tooltip" :data-tip="user.school">
                <button>
                  {{
                    user.school != null ? user.school.substring(0, 10) : "未知"
                  }}
                </button>
              </div>
            </td>
            <td class="ac">
              {{ user.ac_num }}
            </td>
            <td class="penalty">
              <span>{{ user.time_penalty }}</span>
            </td>

            <td
              :class="record.status == 0 ? 'first-ac' : ''"
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
            v-for="(user, index) in rank_user_list"
            :key="user.uuid"
            :class="[
              index % 2 === 0 ? 'even-row' : 'odd-row',
              isTopThree(index) ? 'top-three-row' : '',
              isTopThree(index) ? `top-${index + 1}` : '',
            ]"
          >
            <td class="rank sticky-col sticky-rank">
              <span v-if="isTopThree(index)" class="medal">
                {{ (currentPage - 1) * 15 + index + 1 }}
              </span>
              <span v-else>
                {{ (currentPage - 1) * 15 + index + 1 }}
              </span>
            </td>
            <td class="user sticky-col sticky-user">
              <router-link
                :to="'/user/space/' + user.uuid"
                :style="'color:' + rated_color_list[user.rated]"
              >
                {{ user.username }}
              </router-link>
            </td>
            <td class="school sticky-col sticky-school">
              <div class="tooltip" :data-tip="user.school">
                <button>
                  {{
                    user.school != null ? user.school.substring(0, 10) : "未知"
                  }}
                </button>
              </div>
            </td>
            <td class="ac">
              <div>{{ user.ac_num }}</div>
              <div class="ak-badge" v-if="user.is_ak == 0">AK</div>
            </td>
            <td class="penalty">
              <span class="time">
                {{ user.time_penalty }}
              </span>
            </td>
            <td
              :class="record.status == 0 ? 'first-ac' : ''"
              v-for="record in user.problem_record_list"
              :key="record.submission_id"
            >
              <div
                class="tooltip"
                :data-tip="
                secondsToHMS(record.time_used) + '\n(' +
                  dayjs(record.submit_time).format('YYYY-MM-DD HH:mm:ss') + ')'
                "
              >
                <router-link
                  class="submission-link"
                  :to="
                    '/competition/' +
                    competition_id +
                    '/records/' +
                    record.submission_id
                  "
                >
                  <div v-if="record.submission_id != null">
                    <div class="lang-icon font-attempts">
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
                          d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.320v56.013s-5.235 33.897 62.518 33.897m34.114-19.586a11.12 11.12 0 0 1-11.13-11.13a11.12 11.12 0 0 1 11.13-11.131a11.12 11.12 0 0 1 11.13 11.13a11.12 11.12 0 0 1-11.13 11.13"
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
                          d="M82.554 267.473s-13.198 7.675 9.393 10.272c27.369 3.122 41.356 2.675 71.517-3.034c0 0 7.93 4.972 19.003 9.279c-67.611 28.977-153.019-1.679-99.913-16.517m-8.262-37.814s-14.803 10.958 7.805 13.296c29.236 3.016 52.324 3.263 92.276-4.430c0 0 5.526 5.602 14.215 8.666c-81.747 23.904-172.798 1.885-114.296-17.532"
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
                    </div>
                    <div
                      v-if="record.test_num != null && record.test_num != 0"
                      class="attempts"
                    >
                      (-{{ record.test_num }})
                    </div>
                  </div>
                  <div
                    v-else-if="record.test_num != null && record.test_num != 0"
                    class="failed-attempts"
                  >
                    (-{{ record.test_num }})
                  </div>
                </router-link>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="pagination" v-if="pageSum > 1 && rank_user_list.length > 0">
      <button class="pagination-btn first" @click="PageClick(1)">«</button>
      <button
        class="pagination-btn"
        v-if="currentPage - 1 > 0"
        @click="PageClick(currentPage - 1)"
      >
        {{ currentPage - 1 }}
      </button>
      <button class="pagination-btn active">
        {{ currentPage }}
      </button>
      <button
        v-if="currentPage + 1 < pageSum"
        class="pagination-btn"
        @click="PageClick(currentPage + 1)"
      >
        {{ currentPage + 1 }}
      </button>
      <button class="pagination-btn disabled" v-if="currentPage != pageSum">
        ...
      </button>
      <button
        class="pagination-btn"
        v-if="currentPage + 2 < pageSum"
        @click="PageClick(pageSum - 1)"
      >
        {{ pageSum - 1 }}
      </button>
      <button
        v-if="currentPage != pageSum"
        class="pagination-btn"
        @click="PageClick(pageSum)"
      >
        {{ pageSum }}
      </button>
      <button class="pagination-btn last" @click="PageClick(pageSum)">»</button>
    </div>
  </div>
</template>

<style scoped>
.ranking-container {
  max-width: 1050px;
  margin: 0 auto;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
}

.ranking-table {
  width: fit-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.ranking-table thead {
  background-color: #2c3e50;
  color: white;
  font-size: 15px;
}

.ranking-table th {
  padding: 6px 4px;
  text-align: center;
  font-weight: 500;
  position: relative;
}

.ranking-table td {
  padding: 6px 4px;
  text-align: center;
  font-size: 14px;
}

/* 最后一列去除右侧padding */
.ranking-table td:last-child,
.ranking-table th:last-child {
  padding-right: 4px;
}

.ranking-table a {
  text-decoration: none;
  transition: color 0.2s;
}

.ranking-table a:hover {
  color: #3498db;
}

/* 列宽设置 */
.rank-col {
  width: 80px;
  min-width: 80px;
}
.user-col {
  width: 130px;
  min-width: 130px;
}
.school-col {
  width: 130px;
  min-width: 130px;
}
.ac-col {
  width: 80px;
  min-width: 80px;
}
.penalty-col {
  width: 100px;
  min-width: 100px;
}
.problem-col {
  width: 90px;
  min-width: 90px;
  max-width: 90px;
}

/* 固定列样式 */
.sticky-col {
  position: sticky !important;
  z-index: 10;
  background-color: #ffffff;
}

/* 表头固定列需要更高的z-index */
thead .sticky-col {
  z-index: 20;
  background-color: #2c3e50 !important;
}

/* 每一列的固定位置 */
.sticky-rank {
  left: 0;
}

.sticky-user {
  left: 80px;
}

.sticky-school {
  left: 210px;
  box-shadow: 3px 0 8px rgba(0, 0, 0, 0.15);
  border-right: 1px solid #cbd5e0;
}

/* 偶数行固定列背景 */
.even-row .sticky-col {
  background-color: #f8f9fa !important;
}

/* 奇数行固定列背景 */
.odd-row .sticky-col {
  background-color: #ffffff !important;
}

/* 前三名行固定列背景 */
.top-1 .sticky-col {
  background-color: #fff3e0 !important;
}

.top-2 .sticky-col {
  background-color: #f5f5f5 !important;
}

.top-3 .sticky-col {
  background-color: #f3e5ab !important;
}

/* hover状态固定列背景 */
.even-row:hover .sticky-col,
.odd-row:hover .sticky-col {
  background-color: #e9f5ff !important;
}

.top-three-row:hover .sticky-col {
  background-color: #fff8e1 !important;
}

/* 行样式 */
.even-row {
  font-weight: bold;
  background-color: #f8f9fa;
}

.odd-row {
  font-weight: bold;
  background-color: #ffffff;
}

.even-row:hover,
.odd-row:hover {
  background-color: #e9f5ff;
}

/* 前三名特殊样式 */
.top-three-row {
  font-weight: bold;
}

.top-three-row:hover {
  background-color: #fff8e1 !important;
}

.top-1 {
  background-color: #fff3e0 !important;
}

.top-1 .rank .medal {
  display: inline-block;
  background-color: #ffd700;
  color: #8c6d1f;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  font-weight: bold;
}

.top-2 {
  background-color: #f5f5f5 !important;
}

.top-2 .rank .medal {
  display: inline-block;
  background-color: #c0c0c0;
  color: #6d6d6d;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  font-weight: bold;
}

.top-3 {
  background-color: #f3e5ab !important;
}

.top-3 .rank .medal {
  display: inline-block;
  background-color: #cd7f32;
  color: #8c531b;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  font-weight: bold;
}

/* 特殊单元格样式 */
.first-ac {
  background-color: #e1f5fe;
}

.ak-badge {
  display: inline-block;
  background-color: #e67e22;
  color: white;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  margin-top: 4px;
}

.time {
  color: #e74c3c;
  font-size: 13px;
}

/* 问题链接样式 */
.problem-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.problem-stats {
  font-size: 12px;
  opacity: 0.8;
}

.problem-score {
  font-size: 11px;
  margin-top: 2px;
  color: #7f8c8d;
}

/* 提交记录链接 */
.submission-link {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lang-icon {
  margin-bottom: 4px;
}

.attempts {
  font-size: 12px;
  color: #7f8c8d;
}
.font-attempts {
  font-size: 14px;
  font-weight: bold;
  color: #636a6c;
}
.failed-attempts {
  color: #e74c3c;
  font-weight: bold;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 5px;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background-color: white;
  color: #2c3e50;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
}

.pagination-btn:hover:not(.active):not(.disabled) {
  background-color: #f1f1f1;
}

.pagination-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.pagination-btn.disabled {
  cursor: default;
  opacity: 0.7;
}

.pagination-btn.first,
.pagination-btn.last {
  font-weight: bold;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .ranking-container {
    overflow-x: auto;
  }

  .school-col,
  .penalty-col {
    display: none;
  }

  .problem-col {
    min-width: 60px;
  }

  /* 移动端调整固定列位置（隐藏学校列后，参赛用户列成为最后一个固定列） */
  .sticky-user {
    box-shadow: 3px 0 8px rgba(0, 0, 0, 0.15);
    border-right: 1px solid #cbd5e0;
  }
  
  .sticky-school {
    box-shadow: none;
    border-right: none;
  }
}
.table-wrapper {
  overflow-x: auto;
  width: 100%;
  -webkit-overflow-scrolling: touch; /* 平滑滚动 */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #cbd5e0 #f7fafc; /* Firefox */
}

/* 确保表格内容紧密贴合 */
.table-wrapper table {
  display: table;
  table-layout: auto;
}

/* Webkit浏览器滚动条样式 */
.table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>
