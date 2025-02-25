<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps<{
  dataList: any;
}>();
const router = useRouter();
const route = useRoute();
const dataList: Ref<any[]> = ref(props.dataList);

watch(
  () => props.dataList,
  (newVal) => {
    dataList.value = newVal;
  }
);

const highlightKeyword = (text: string, keyword: string) => {
  if (!keyword) return text; // 如果没有关键字，则返回原始文本

  // 处理 keyword：去掉多余空格并转义特殊字符
  const escapedKeyword = keyword
    .trim()
    .replace(/\s+/g, "\\s+") // 把多个空格转换为 `\s+`
    .replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&"); // 转义正则特殊字符

  // 创建正则匹配关键字
  const regExp = new RegExp(`(${escapedKeyword})`, "gi");

  // 替换匹配部分并高亮显示
  return text?.replace(regExp, '<span style="color: red;">$1</span>');
};
</script>

<template>
  <div
    class="mx-auto font-bold text-gray-400 text-center"
    v-if="dataList.length === 0"
  >
    <span class="my-4" style="font-size: 4em"> 没有搜索到任何信息┭┮﹏┭┮ </span>
  </div>
  <div v-for="data in dataList" class="post-item">
    <div class="font-bold">
      <span>用户</span>
    </div>
    <div class="flex mt-4">
      <router-link class="avatar" :to="'/user/space/' + data.uuid">
        <div class="rounded-full w-12 mx-3">
          <img @dragstart.prevent :src="data.avatar" alt="ByteOJ出品" />
        </div>
      </router-link>
      <div class="flex-1">
        <div
          class="font-bold"
          v-html="highlightKeyword(data.username, <string>route.query.keyword ?? '')"
        ></div>
        <div class="text-gray-500">
          {{ data.school }}
        </div>
      </div>
    </div>
    <!-- 悬浮选股按钮 -->
    <div class="hover-button">
      <button
        @click="router.push('/user/space/' + data.uuid)"
        class="select-button font-bold"
      >
        点击进入用户中心
      </button>
    </div>
  </div>
</template>

<style scoped>
.post-item {
  position: relative;
  background-color: white;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.post-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.hover-button {
  position: absolute;
  top: 16px;
  right: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.post-item:hover .hover-button {
  opacity: 1;
}

.select-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.select-button:hover {
  background-color: #45a049;
}

.divider {
  border-bottom: 1px solid #e0e0e0;
}
</style>
