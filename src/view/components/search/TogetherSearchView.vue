<template>
  <div class="card bg-base-100 shadow-xl mx-auto" style="max-width: 1150px">
    <div>
      <TogetherComponent v-model="activeTab" :tabs="tabs" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TogetherComponent from "@/view/components/search/TogetherComponent.vue";
import {useRoute} from "vue-router";

const tabs = [
  { name: 'post', label: '日常' },
  // { name: 'course', label: '课程' },
  { name: 'algorithm', label: '算法题目' },
  { name: 'user', label: '用户' },
  // { name: 'solution', label: '题解'}
]

const route = useRoute();
const activeTab = ref(route.query.category);
</script>