<template>
  <div class="pagination-container">
    <!-- 上一页按钮 -->
    <button
      :disabled="currentPage === 1"
      @click="handlePageChange(currentPage - 1)"
      class="pagination-button prev-button"
    >
      &lt;
    </button>

    <!-- 页码按钮 -->
    <button
      v-for="page in displayedPages"
      :key="page"
      :class="['pagination-page', { active: page === currentPage }]"
      @click="handlePageChange(page)"
    >
      {{ page }}
    </button>

    <!-- 下一页按钮 -->
    <button
      :disabled="currentPage === totalPages"
      @click="handlePageChange(currentPage + 1)"
      class="pagination-button next-button"
    >
      &gt;
    </button>

    <!-- 显示总页数 -->
    <span class="total-pages">共 {{ totalPages }} 页</span>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineExpose } from "vue";

// 使用 defineProps 来声明 props
const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    required: true, // 传递总页数
  },
});

// 使用 defineEmits 来声明 emit 方法
const emit = defineEmits(["update:currentPage", "pageChanged"]);

const currentPage = ref(props.currentPage); // 当前页码

// 计算显示的页码范围
const displayedPages = computed(() => {
  const start = Math.max(currentPage.value - 2, 1); // 从当前页向前推2页
  const end = Math.min(start + 4, props.totalPages); // 只显示最多5个页码
  let pages = [];

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  // 如果总页数大于5，且当前页前后有省略页码，添加省略号
  if (props.totalPages > 5) {
    if (start > 1) pages.unshift("...");
    if (end < props.totalPages) pages.push("...");
  }

  return pages;
});

// 监听 currentPage 的变化，并通知父组件
watch(currentPage, (newPage) => {
  emit("update:currentPage", newPage); // 更新父组件中的 currentPage
});

// 页码跳转处理
const handlePageChange = (page) => {
  // 如果点击的是省略号，跳过
  if (page === "...") return;

  if (page < 1) page = 1;
  if (page > props.totalPages) page = props.totalPages;
  currentPage.value = page;

  // 触发自定义事件，传递当前页码
  emit("pageChanged", page);
};

// 提供一个方法给父组件调用
const jumpToPage = (page) => {
  handlePageChange(page);
};

// 使用 defineExpose 暴露 jumpToPage 方法给父组件
defineExpose({
  jumpToPage,
});
</script>

<style scoped>
/* 样式保持不变 */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: "Roboto", sans-serif;
  font-size: 16px;
  padding: 16px 0;
}

.pagination-button {
  padding: 12px 18px;
  border-radius: 25px;
  background-color: #f4f4f4;
  border: 1px solid #dcdfe6;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.pagination-button:disabled {
  cursor: not-allowed;
  background: #e0e0e0;
  color: #aaa;
  box-shadow: none;
}

.pagination-button:hover:not(:disabled) {
  background-color: #d1d1d1;
  transform: translateY(-2px);
}

.pagination-button:active:not(:disabled) {
  background-color: #c4c4c4;
  transform: translateY(2px);
}

.pagination-page {
  padding: 10px 16px;
  border-radius: 20px;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.pagination-page.active {
  background-color: #cccbcb;
  color: #fff;
  border: 1px solid;
}

.pagination-page:hover {
  background-color: #f0f0f0;
  transform: scale(1.05);
}

.pagination-page:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(102, 103, 106, 0.7);
}

.prev-button,
.next-button {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.total-pages {
  font-size: 14px;
  color: #333;
  margin-left: 20px;
}
</style>
