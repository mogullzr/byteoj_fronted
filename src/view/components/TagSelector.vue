<template>
  <div class="container">
    <!-- 点击按钮打开标签选择框 -->
    <button @click="toggleTagSelector" class="select-btn">选择标签</button>

    <!-- 标签选择框 -->
    <div :class="['tag-selector', { open: isTagSelectorVisible }]">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索标签..."
          class="search-input"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
          ×
        </button>
      </div>

      <div class="tag-list">
        <span
          v-for="(tag, index) in filteredTags"
          :key="index"
          class="tag-item"
          :class="{ selected: tempSelectedTags.includes(tag) }"
          @click="toggleTempTag(tag)"
        >
          {{ tag }}
        </span>
      </div>

      <div class="actions">
        <button @click="confirmSelection" class="confirm-btn">确认选择</button>
        <button @click="cancelSelection" class="cancel-btn">取消</button>
      </div>
    </div>

    <div class="selected-tags">
      <span v-for="(tag, index) in selectedTags" :key="index" class="tag">
        {{ tag }} <span class="remove-btn" @click="removeTag(tag)">×</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  allTags: {
    type: Array,
    required: true,
  },
  defaultSelectedTags: {
    type: Array,
    default: () => [],
  },
  tagType: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:selectedTags"]);

const selectedTags = ref([...props.defaultSelectedTags]);
const tempSelectedTags = ref([]);
const searchQuery = ref("");
const isTagSelectorVisible = ref(false);

const toggleTagSelector = () => {
  tempSelectedTags.value = [...selectedTags.value];
  isTagSelectorVisible.value = !isTagSelectorVisible.value;
};

const toggleTempTag = (tag) => {
  if (tempSelectedTags.value.includes(tag)) {
    tempSelectedTags.value = tempSelectedTags.value.filter((t) => t !== tag);
  } else {
    tempSelectedTags.value.push(tag);
  }
};

const confirmSelection = () => {
  selectedTags.value = [
    ...new Set([...selectedTags.value, ...tempSelectedTags.value]),
  ];
  isTagSelectorVisible.value = false;
  emit("update:selectedTags", selectedTags.value);
};

const cancelSelection = () => {
  isTagSelectorVisible.value = false;
  tempSelectedTags.value = [];
};

const removeTag = (tag: any) => {
  selectedTags.value = selectedTags.value.filter((t) => t !== tag);
  emit("update:selectedTags", selectedTags.value);
};

const filteredTags = computed(() => {
  if (searchQuery.value.trim() === "") {
    return props.allTags;
  }
  return props.allTags.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>

<style scoped>
/* 容器样式 */
.container {
  z-index: 99999;
  font-family: "Arial", sans-serif;
  position: relative;
  padding: 16px;
  box-sizing: border-box;
}

/* 选择按钮样式 */
.select-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  background-color: #fff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  font-size: 12px;
  width: 300px;
}

/* 选择按钮悬停效果 */
.select-btn:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 标签选择框样式 */
.tag-selector {
  position: absolute;
  bottom: calc(100% + 10px); /* 调整位置，避免遮挡 */
  left: 0;
  width: 320px; /* 增加宽度 */
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
  z-index: 1000;
}

/* 标签选择框打开时的显示效果 */
.tag-selector.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* 搜索框样式 */
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.search-input {
  flex: 1;
  padding: 8px;
  font-size: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #c0c4cc;
}

.clear-btn {
  margin-left: 8px;
  padding: 4px 8px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 16px;
  color: #999;
  text-shadow: 0 2px 4px rgba(153, 153, 153, 0.3);
  transition: color 0.3s ease, transform 0.2s ease, text-shadow 0.3s ease;
}

.clear-btn:hover {
  color: #666;
  text-shadow: 0 2px 6px rgba(102, 102, 102, 0.5);
  transform: scale(1.2);
}

/* 标签列表样式 */
.tag-list {
  max-height: 160px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 标签项样式 */
.tag-item {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
}

/* 鼠标悬停标签项样式 */
.tag-item:hover {
  background-color: #e0e0e0;
}

/* 选中标签项样式 */
.tag-item.selected {
  background-color: #e6f7ff;
  font-weight: bold;
  color: #1890ff;
}

/* 底部操作按钮容器样式 */
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

/* 确认和取消按钮样式 */
.confirm-btn,
.cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
}

.confirm-btn {
  background-color: #27ae60;
  color: white;
}

.confirm-btn:hover {
  background-color: #2ecc71;
}

.cancel-btn {
  background-color: #e74c3c;
  color: white;
}

.cancel-btn:hover {
  background-color: #c0392b;
}

/* 已选标签容器样式 */
.selected-tags {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 已选标签样式 */
.tag {
  background-color: #e6f7ff;
  font-weight: bold;
  color: #1890ff;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.tag:hover {
  background-color: #e1f0fc;
}

/* 移除按钮样式 */
.remove-btn {
  color: #ff4d4f;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  margin-left: 4px;
  text-shadow: 0 2px 4px rgba(255, 77, 79, 0.3);
  transition: color 0.3s ease, transform 0.2s ease, text-shadow 0.3s ease;
}

.remove-btn:hover {
  color: #ff7875;
  text-shadow: 0 2px 6px rgba(255, 77, 79, 0.5);
  transform: scale(1.2);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .tag-selector {
    width: 100%;
    left: 0;
    right: 0;
  }
}
</style>
