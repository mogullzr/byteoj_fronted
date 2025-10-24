<template>
  <div class="card bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
    <div class="card-body p-6 md:p-8">
      <h2 class="text-3xl font-extrabold text-center mb-8 text-gray-900 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">比赛记录</h2>

      <!-- 空状态提示 -->
      <div v-if="competitionData.length === 0" class="flex flex-col items-center justify-center py-16 px-4 text-center">
        <svg class="w-24 h-24 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="text-2xl font-bold text-gray-700 mb-2">暂无比赛记录</h3>
        <p class="text-gray-500 max-w-md mb-8">您还没有参加过任何比赛，快去参加一场比赛来展示您的实力吧！</p>
        <button
            @click="goToCompetitions"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
        >
          查看所有比赛
        </button>
      </div>

      <!-- 比赛列表 -->
      <div v-else class="space-y-6">
        <div
            v-for="(competition, index) in competitionData"
            :key="index"
            class="border border-gray-300 rounded-xl p-6 hover:bg-gray-50 hover:border-blue-200 transition-all duration-300 bg-white/90 backdrop-blur-sm"
        >
          <div class="flex justify-between items-center mb-6 cursor-pointer" @click="clickToCompetition(competition.competition_id)">
            <div class="flex items-center space-x-6">
              <span
                  class="text-3xl font-extrabold"
                  :class="{
                  'text-yellow-500': competition.rank === 1,
                  'text-gray-500': competition.rank === 2,
                  'text-amber-800': competition.rank === 3,
                  'text-blue-600': competition.rank > 3
                }"
              >
                #{{ competition.rank }}
              </span>
              <h3 class="text-2xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">{{ competition.competition_name }}</h3>
            </div>
            <span
                class="text-xl font-bold flex items-center"
                :class="{
                'text-green-600': competition.rating_change > 0,
                'text-red-600': competition.rating_change < 0,
                'text-gray-600': competition.rating_change === 0
              }"
            >
              {{ competition.rating_after }}
              <span
                  v-if="competition.rating_change !== 0"
                  class="ml-3 text-base font-medium"
                  :class="{
                  'text-green-400': competition.rating_change > 0,
                  'text-red-400': competition.rating_change < 0
                }"
              >
                ({{ competition.rating_change > 0 ? '+' : '' }}{{ competition.rating_change }})
              </span>
            </span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-base text-gray-700">
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="font-medium">{{ formatDate(competition.start_time) }}</span>
            </div>
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="font-medium">{{ competition.rating_after }} 积分</span>
            </div>
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span class="font-medium">题目: {{ competition.ac_num }}/{{ competition.total_num }}</span>
            </div>
            <div class="flex items-center space-x-3">
              <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span class="font-medium">参赛人数: {{ competition.joins }}</span>
            </div>
          </div>
        </div>
        <!-- Pagination Controls -->
        <div class="flex justify-between items-center mt-8">
          <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <span class="text-gray-700 font-medium">
            第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
          </span>
          <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import {CompetitionControllerService} from '../../../generated';
import { useRouter } from 'vue-router';

export default {
  name: 'CompetitionList',
  setup() {
    const competitionData = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(5);
    const totalPages = ref(1);
    const router = useRouter();

    const fetchCompetitions = async (page) => {
      try {
        const searchRequest = {
          pageNum: page
        }
        const res = await CompetitionControllerService.competitionUserJoinsInfoGetUsingPost(searchRequest);
        if (res.code === 0) {
          competitionData.value = res.data.map(item => ({
            ...item,
            start_time: new Date(item.start_time)
          }));
          competitionData.value.sort((a, b) => b.start_time - a.start_time);
          totalPages.value = Math.ceil(res.data[0].total / pageSize.value) || 1;
        }
      } catch (error) {
        console.error('Failed to fetch competition data:', error);
      }
    };

    onMounted(() => {
      fetchCompetitions(currentPage.value);
    });

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        fetchCompetitions(currentPage.value);
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        fetchCompetitions(currentPage.value);
      }
    };

    const formatDate = (date) => {
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    const clickToCompetition = (competition_id) => {
      router.push('/competition/' + competition_id);
    };

    const goToCompetitions = () => {
      router.push('/competition');
    };

    return {
      competitionData,
      currentPage,
      totalPages,
      prevPage,
      nextPage,
      formatDate,
      clickToCompetition,
      goToCompetitions
    };
  }
};
</script>

<style scoped>
.card {
  max-width: 900px;
  margin: 2.5rem auto;
  border-radius: 1.5rem;
  overflow: hidden;
}

.card-body {
  padding: 2rem;
}

@media (max-width: 640px) {
  .card {
    margin: 1.5rem;
    border-radius: 1rem;
  }

  .card-body {
    padding: 1.5rem;
  }
}
</style>