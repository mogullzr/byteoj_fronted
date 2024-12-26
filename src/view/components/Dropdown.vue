<template>
  <div class="dropdown" :class="{ open: isOpen }">
    <div class="dropdown-trigger" @click="toggleDropdown">
      <span>{{ selectedLabel || placeholder }}</span>
      <span class="arrow" :class="{ open: isOpen }"></span>
    </div>
    <ul class="dropdown-menu" v-show="isOpen">
      <li
        v-for="option in options"
        :key="option.value"
        @click="selectOption(option)"
        :class="{ selected: option.value === modelValue }"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

// 定义 props
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: "请选择",
  },
});

// 定义 emit
const emit = defineEmits(["update:modelValue"]);

// 控制下拉框的展开和收起
const isOpen = ref(false);

// 切换下拉框状态
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// 计算当前选中的选项的 label
const selectedLabel = computed(() => {
  const selectedOption = props.options.find(
    (option) => option.value === props.modelValue
  );
  return selectedOption ? selectedOption.label : "";
});

// 选择选项
const selectOption = (option) => {
  emit("update:modelValue", option.value);
  isOpen.value = false; // 关闭下拉框
};

// 监听外部传入的 modelValue，确保选中状态同步
watch(
  () => props.modelValue,
  () => {
    // 如果外部传入的值发生变化，更新 selectedLabel
  }
);
</script>

<style scoped>
/* 设置下拉框的基本样式 */
.dropdown {
  padding: 16px;

  position: relative;
  width: 180px; /* 缩小宽度 */
  font-family: "Arial", sans-serif;
  user-select: none;
  box-sizing: border-box;
}

/* 下拉框触发器的样式 */
.dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px; /* 缩小内边距 */
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  background-color: #fff;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  font-size: 12px; /* 缩小字体 */
}

/* 下拉框触发器悬停效果 */
.dropdown-trigger:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 箭头图标样式 */
.dropdown-trigger .arrow {
  width: 0;
  height: 0;
  border-left: 4px solid transparent; /* 缩小箭头 */
  border-right: 4px solid transparent;
  border-top: 4px solid #606266;
  transition: transform 0.3s ease;
}

/* 下拉框打开时箭头旋转 */
.dropdown-trigger .arrow.open {
  transform: rotate(180deg);
}

/* 下拉框菜单的样式 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px); /* 确保下拉框在触发器的正下方 */
  left: 0;
  width: 100%;
  padding: 6px 0; /* 缩小内边距 */
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  list-style: none;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

/* 下拉框打开时的显示效果 */
.dropdown.open .dropdown-menu {
  opacity: 1;
  visibility: visible;
}

/* 下拉框项的样式 */
.dropdown-menu li {
  padding: 8px 12px; /* 缩小内边距 */
  cursor: pointer;
  font-size: 12px; /* 缩小字体 */
  transition: background-color 0.3s ease, padding-left 0.3s ease;
}

/* 鼠标悬停下拉框项的样式 */
.dropdown-menu li:hover {
  background-color: #f5f7fa;
  padding-left: 16px; /* 缩小间距 */
}

/* 选中项的样式 */
.dropdown-menu li.selected {
  background-color: #e6f7ff;
  font-weight: bold;
  color: #1890ff;
}
</style>
