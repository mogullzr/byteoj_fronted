<template>
  <div class="tag-selector" ref="tagSelector">
    <!-- 标签输入框 -->
    <div class="input-wrapper">
      <input
          type="text"
          placeholder="选择来源标签..."
          v-model="searchQuery"
          @input="handleInput"
          @click="showDropdown = true"
      >
      <!-- 下拉标签列表 -->
      <Transition name="fade">
        <div v-if="showDropdown" class="dropdown">
          <div
              v-for="tag in filteredTags"
              :key="tag"
              class="dropdown-item"
              @click="selectTag(tag)"
          >
            {{ tag }}
          </div>
          <div v-if="filteredTags.length === 0" class="dropdown-item no-results">
            无匹配结果
          </div>
        </div>
      </Transition>
    </div>
    <!-- 已选标签展示区 -->
    <div class="selected-tags">
      <span
          v-for="tag in selectedTags"
          :key="tag"
          class="tag"
          @click="removeTag(tag)"
      >
        {{ tag }}
        <span class="remove-icon">×</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, Ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  allTags: string[],
  selectedTags: string[]
}>()
const emit = defineEmits(['update:selectedTags'])

const showDropdown = ref(false)
const searchQuery = ref('')
const selectedTags: Ref<string[]> = ref(props.selectedTags)
const tagSelector = ref<HTMLElement | null>(null)

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 处理点击外部区域
const handleClickOutside = (event: MouseEvent) => {
  if (tagSelector.value && !tagSelector.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

// 计算可用的标签列表
const availableTags = computed(() => {
  return props.allTags
})

// 根据搜索关键字过滤标签
const filteredTags = computed(() => {
  return availableTags.value.filter(tag =>
      tag.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// 处理输入事件
const handleInput = () => {
  showDropdown.value = true
}

// 选择标签
const selectTag = (tag: string) => {
  selectedTags.value.push(tag)
  showDropdown.value = false
  searchQuery.value = ''
  emit('update:selectedTags', selectedTags.value)
}

// 移除标签
const removeTag = (tag: string) => {
  selectedTags.value = selectedTags.value.filter(t => t !== tag)
  emit('update:selectedTags', selectedTags.value)
}
</script>

<style scoped>
.tag-selector {
  max-width: 300px;
  margin: 20px auto;
  font-family: 'Segoe UI', sans-serif;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0px;
}

.tag {
  background: #f0f4ff;
  color: #4a6cd4;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
}

.tag:hover {
  background: #e1e8ff;
}

.remove-icon {
  margin-left: 6px;
  font-weight: 600;
  font-size: 16px;
}

.input-wrapper {
  position: relative;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e3eb;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  transition: 0.2s;
  background: white;
}

input:focus {
  outline: none;
  border-color: #a6b3ff;
}

.dropdown {
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e0e3eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  max-height: 240px;
  overflow-y: auto;
  z-index: 10;
}

.dropdown-item {
  padding: 12px 16px;
  color: #555;
  cursor: pointer;
  transition: 0.2s;
}

.dropdown-item:hover {
  background: #f5f6fa;
  color: #4a6cd4;
}

.no-results {
  color: #999;
  cursor: default;
}

.no-results:hover {
  background: white;
  color: #999;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>