<script setup lang="ts">
import ProblemAlgorithmAllView from "@/view/problems/algorithm/ProblemAlgorithmAllView.vue";
import ProblemMathAllView from "@/view/problems/math/ProblemMathAllView.vue";
import Problem408AllView from "@/view/problems/408/Problem408AllView.vue";
import DailyProblemView from "@/view/problems/DailyProblemView.vue";
import { Ref, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LocationQueryValue } from "vue-router";

// 0表示显示算法题库，1表示显示数学题库，2表示显示408题库
const route = useRoute();
const router = useRouter();
const activeCategory: Ref<string | LocationQueryValue[]> = ref(
  route.query.category ?? "algorithm"
);
const status: Ref<string | LocationQueryValue[] | null> = ref(
  route.query.status ?? null
);

const changeShow = (key: string) => {
  if (key == "math408_1") {
    activeCategory.value = "other";
    status.value = "0";
  } else if (key == "math408_2") {
    activeCategory.value = "other";
    status.value = "1";
  } else {
    activeCategory.value = key;
    status.value = null;
  }
  router.replace({
    query: {
      category: activeCategory.value,
      status: status.value ?? null,
    },
  });
};

// 直接触发每日一题抽卡效果
const goToDailyWithShuffle = () => {
  activeCategory.value = "daily";
  status.value = null;
  router.replace({
    query: {
      category: activeCategory.value,
      status: status.value ?? null,
    },
  });

  // 使用setTimeout确保组件已经加载，再触发洗牌
  setTimeout(() => {
    const dailyComponent = document.querySelector(".daily-problem-outer");
    if (dailyComponent) {
      const shuffleBtn = dailyComponent.querySelector(".shuffle-btn");
      if (shuffleBtn) {
        (shuffleBtn as HTMLButtonElement).click();
      }
    }
  }, 100);
};
</script>

<template>
  <div>
    <div class="flex justify-between mx-auto mb-4" style="max-width: 1150px">
      <div></div>
      <!-- 占位用，保持shuffle按钮在右侧 -->
      <!--      <button-->
      <!--        @click="goToDailyWithShuffle"-->
      <!--        class="shuffle-quick-btn px-4 py-2 rounded-lg flex items-center gap-2"-->
      <!--      >-->
      <!--        <svg-->
      <!--          xmlns="http://www.w3.org/2000/svg"-->
      <!--          width="20"-->
      <!--          height="20"-->
      <!--          viewBox="0 0 24 24"-->
      <!--          fill="none"-->
      <!--          stroke="currentColor"-->
      <!--          stroke-width="2"-->
      <!--          stroke-linecap="round"-->
      <!--          stroke-linejoin="round"-->
      <!--        >-->
      <!--          <polyline points="16 3 21 3 21 8"></polyline>-->
      <!--          <line x1="4" y1="20" x2="21" y2="3"></line>-->
      <!--          <polyline points="21 16 21 21 16 21"></polyline>-->
      <!--          <line x1="15" y1="15" x2="21" y2="21"></line>-->
      <!--          <line x1="4" y1="4" x2="9" y2="9"></line>-->
      <!--        </svg>-->
      <!--        随机抽题-->
      <!--      </button>-->
    </div>

    <div
      role="tablist"
      class="tabs tabs-lifted tabs-lg mx-auto"
      style="max-width: 1150px"
    >
      <input
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="
          'tab w-64 font-bold' +
          (activeCategory === 'algorithm' ? ' text-black' : ' text-white')
        "
        aria-label="算法编程题库"
        style="font-size: 18px; white-space: nowrap"
        @click="changeShow('algorithm')"
        :checked="activeCategory === 'algorithm'"
      />
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box"
        v-if="activeCategory === 'algorithm'"
      >
        <ProblemAlgorithmAllView />
      </div>

      <input
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="
          'tab font-bold' +
          (activeCategory === 'other' && status === '0'
            ? ' text-black'
            : ' text-white')
        "
        aria-label="数学考研试题"
        style="font-size: 18px; white-space: nowrap"
        @click="changeShow('math408_1')"
        :checked="activeCategory === 'other' && status === '0'"
      />
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box"
        v-if="activeCategory === 'other' && status === '0'"
      >
        <ProblemMathAllView />
      </div>

      <input
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="
          'tab font-bold' +
          (activeCategory === 'other' && status === '1'
            ? ' text-black'
            : ' text-white')
        "
        aria-label="408考研试题"
        style="font-size: 18px; white-space: nowrap"
        @click="changeShow('math408_2')"
        :checked="activeCategory === 'other' && status === '1'"
      />
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box"
        v-if="activeCategory === 'other' && status === '1'"
      >
        <Problem408AllView />
      </div>

      <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          :class="
          'tab font-bold' +
          (activeCategory === 'daily' ? ' text-black' : ' text-white')
        "
          aria-label="每日一题"
          style="font-size: 18px; white-space: nowrap"
          @click="changeShow('daily')"
          :checked="activeCategory === 'daily'"
      />
      <div
          role="tabpanel"
          class="tab-content bg-base-100 border-base-300 rounded-box"
          v-if="activeCategory === 'daily'"
      >
        <DailyProblemView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.shuffle-quick-btn {
  background-color: #5e5cfc;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(94, 92, 252, 0.3);
  font-family: "Poppins", sans-serif;
}

.shuffle-quick-btn:hover {
  background-color: #4a48e0;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(94, 92, 252, 0.4);
}

.shuffle-quick-btn:active {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(94, 92, 252, 0.4);
}
</style>
