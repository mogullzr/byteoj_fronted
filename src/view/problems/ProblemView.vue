<script setup lang="ts">
import ProblemAlgorithmAllView from "@/view/problems/algorithm/ProblemAlgorithmAllView.vue";
import ProblemMathAllView from "@/view/problems/math/ProblemMathAllView.vue";
import Problem408AllView from "@/view/problems/408/Problem408AllView.vue";
import { ref } from "vue";

// 0表示显示算法题库，1表示显示数学题库，2表示显示408题库
const isShow = ref(0);

const changeShow = (key: number) => {
  isShow.value = key;
};
</script>

<template>
  <div role="tablist" class="tabs tabs-lifted tabs-lg mx-72 mr-64">
    <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      :class="'tab w-64 font-bold' + (isShow == 0 ? '' : ' text-white')"
      aria-label="算法编程题库"
      style="font-size: 18px; white-space: nowrap"
      checked="checked"
      @click="changeShow(0)"
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-300 rounded-box"
      v-if="isShow === 0"
    >
      <ProblemAlgorithmAllView />
    </div>

    <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      :class="'tab font-bold' + (isShow == 1 ? '' : ' text-white')"
      aria-label="数学考研试题"
      style="font-size: 18px; white-space: nowrap"
      @click="changeShow(1)"
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-300 rounded-box"
      v-if="isShow === 1"
    >
      <ProblemMathAllView />
    </div>

    <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      :class="'tab font-bold' + (isShow == 2 ? '' : ' text-white')"
      aria-label="408考研试题"
      style="font-size: 18px; white-space: nowrap"
      @click="changeShow(2)"
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-300 rounded-box"
      v-if="isShow === 2"
    >
      <Problem408AllView />
    </div>
  </div>
</template>

<style scoped></style>
