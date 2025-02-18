<script setup lang="ts">
import ProblemAlgorithmAllView from "@/view/problems/algorithm/ProblemAlgorithmAllView.vue";
import ProblemMathAllView from "@/view/problems/math/ProblemMathAllView.vue";
import Problem408AllView from "@/view/problems/408/Problem408AllView.vue";
import { Ref, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

// 0表示显示算法题库，1表示显示数学题库，2表示显示408题库
const route = useRoute();
const router = useRouter();
const activeCategory: Ref<string> = ref(route.query.category ?? "algorithm");
const status: Ref<string> = ref(route.query.status ?? null);

const changeShow = (key: string) => {
  if (key == "math408_1") {
    activeCategory.value = "math408";
    status.value = "0";
  } else if (key == "math408_2") {
    activeCategory.value = "math408";
    status.value = "1";
  } else {
    activeCategory.value = key;
    status.value = null;
  }
  router.push({
    query: {
      category: activeCategory.value,
      status: status.value??null
    }
  })
};
</script>

<template>
  <div
      role="tablist"
      class="tabs tabs-lifted tabs-lg mx-auto"
      style="max-width: 1150px"
  >
    <input
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="'tab w-64 font-bold' + (activeCategory === 'algorithm' ? ' text-black' : ' text-white')"
        aria-label="算法编程题库"
        style="font-size: 18px; white-space: nowrap"
        @click="changeShow('algorithm')"
        :checked="activeCategory === 'algorithm' ? 'checked' : ''"
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
        :class="'tab font-bold' + (activeCategory === 'math408' && status === '0' ? ' text-black' : ' text-white')"
        aria-label="数学考研试题"
        style="font-size: 18px; white-space: nowrap"
        @click="changeShow('math408_1')"
        :checked="activeCategory === 'math408' && status === '0'"
    />
    <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box"
        v-if="activeCategory === 'math408' && status === '0'"
    >
      <ProblemMathAllView />
    </div>

    <input
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="'tab font-bold' + (activeCategory === 'math408' && status === '1' ? ' text-black' : ' text-white')"
        aria-label="408考研试题"
        style="font-size: 18px; white-space: nowrap"
        @click="changeShow('math408_2')"
        :checked="activeCategory === 'math408' && status === '1'"
    />
    <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box"
        v-if="activeCategory === 'math408' && status === '1'"
    >
      <Problem408AllView />
    </div>
  </div>
</template>

<style scoped></style>