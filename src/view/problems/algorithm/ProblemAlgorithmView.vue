<script setup lang="ts">
import ProblemAlgorithmContentView from "@/view/problems/algorithm/ProblemAlgorithmContentView.vue";
import ProblemAlgorithmRecords from "@/view/problems/algorithm/ProblemAlgorithmRecords.vue";
import { onMounted, ref } from "vue";
import ProblemAlgorithmAnswers from "@/view/problems/algorithm/ProblemAlgorithmAnswers.vue";
import ProblemAlgorithmSolutions from "@/view/problems/algorithm/ProblemAlgorithmSolutions.vue";
import ProblemAlgorithmTransformContentView from "@/view/problems/algorithm/ProblemAlgorithmTransformContentView.vue";

// 0表示題目内容界面，1表示提交记录，2表示答疑，3表示题解，4表示视频讲解
const isShow = ref(0);

// 表示编辑器此时的状态
const issShow = ref(localStorage.getItem("EditorStatus"));

const changeShow = (key: number) => {
  isShow.value = key;
};
</script>

<template>
  <div
    role="tablist"
    class="tabs tabs-lifted tabs-lg mx-auto"
    style="width: 1300px"
  >
    <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      :class="'tab font-bold ' + (isShow == 0 ? '' : 'text-white')"
      aria-label="题目"
      style="white-space: nowrap; font-size: 18px"
      checked="checked"
      @click="changeShow(0)"
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-200 rounded-box tabs-lg"
      style="width: 100%; height: 100%"
      v-if="isShow === 0"
    >
      <ProblemAlgorithmContentView v-if="issShow == '0'"/>
      <ProblemAlgorithmTransformContentView v-else/>
    </div>
    <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      :class="'tab font-bold ' + (isShow == 1 ? '' : 'text-white')"
      aria-label="提交记录"
      style="white-space: nowrap; font-size: 18px"
      @click="changeShow(1)"
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-200 rounded-box p-6 tabs-lg"
      v-if="isShow === 1"
    >
      <ProblemAlgorithmRecords />
    </div>

    <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      :class="'tab font-bold ' + (isShow == 2 ? '' : 'text-white')"
      aria-label="答疑"
      style="white-space: nowrap; font-size: 18px"
      @click="changeShow(2)"
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-200 rounded-box p-6 tabs-lg"
      v-if="isShow === 2"
    >
      <ProblemAlgorithmAnswers />
    </div>
    <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      :class="'tab font-bold ' + (isShow == 3 ? '' : 'text-white')"
      aria-label="题解"
      style="white-space: nowrap; font-size: 18px"
      @click="changeShow(3)"
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-200 rounded-box p-6 tabs-lg"
      v-if="isShow === 3"
    >
      <ProblemAlgorithmSolutions />
    </div>
    <input
      type="radio"
      name="my_tabs_2"
      role="tab"
      :class="'tab font-bold ' + (isShow == 4 ? '' : 'text-white')"
      aria-label="视频讲解"
      style="white-space: nowrap; font-size: 18px"
      @click="changeShow(4)"
    />
    <div
      role="tabpanel"
      class="tab-content bg-base-100 border-base-200 rounded-box p-6 tabs-lg"
      v-if="isShow === 4"
    >
      Tab content 3
    </div>
  </div>
</template>

<style scoped>
#resizableDiv {
  width: 200px;
  height: 100px;
  background-color: #f0f0f0;
  border: 1px solid #000;
  position: relative;
}

#resizeHandle {
  width: 10px;
  height: 100%;
  background-color: #ddd;
  position: absolute;
  right: 0;
  top: 0;
  cursor: ew-resize;
}
</style>
