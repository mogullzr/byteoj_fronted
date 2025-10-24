<template>
  <div class="tab-container">
    <div
      v-for="tab in tabs"
      :key="tab.name"
      class="tab-item"
      :class="{ active: activeTab === tab.name }"
      @click="handleTabClick(tab.name)"
    >
      {{ tab.label }}
    </div>
    <div class="tab-indicator" :style="indicatorStyle"></div>
  </div>
  <div class="flex w-full flex-col">
    <div class="divider" style="margin: 1px 0"></div>
  </div>
  <div>
    <div class="m-5">
      <div>
        <div v-if="activeTab === 'post'">
          <PostSearch :data-list="dataList" />
        </div>
        <div v-else-if="activeTab === 'course'">
          <!--          <CourseSearch />-->
          敬请期待！！！！！
        </div>
        <div v-else-if="activeTab === 'algorithm'">
          <AlgorithmSearchView :data-list="dataList" />
        </div>
        <div v-else-if="activeTab === 'user'">
          <UserSearchView :data-list="dataList" />
        </div>
        <div v-else-if="activeTab === 'solution'">敬请期待！！！！！</div>
        <div>
          <Pagination
            :current-page="searchRequest.pageNum"
            :total-pages="pageSum"
            @current-page="handleClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  nextTick,
  onMounted,
  watchEffect,
  Ref,
  onUnmounted,
} from "vue";
import { SearchControllerService, SearchRequest } from "../../../../generated";
import { useRoute, useRouter } from "vue-router";
import PostSearch from "@/view/components/search/PostSearchView.vue";
import UserSearchView from "@/view/components/search/UserSearchView.vue";
import AlgorithmSearchView from "@/view/components/search/AlgorithmSearchView.vue";
import Pagination from "@/view/components/Pagination.vue";

interface Tab {
  name: string;
  label: string;
}

const props = defineProps<{
  tabs: Tab[];
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const route = useRoute();
const router = useRouter();
const activeTab = ref(props.modelValue);
const indicatorWidth = ref(0);
const indicatorLeft = ref(0);
const searchRequest: Ref<SearchRequest> = ref({
  category: route.query.category ?? "post",
  difficulty: route.query.difficulty ?? "",
  keyword: route.query.keyword ?? "",
  pageNum: parseInt(<string>route.query.pageNum ?? "1") ?? 1,
  pageSize: parseInt(<string>route.query.pageSize ?? "10") ?? 10,
  sourceList: route.query.sourceList ?? "",
  tagsList: route.query.tagsList ?? "",
} as any);
const dataList = ref([]);
const pageSum: Ref<number> = ref(1);

const initData = async () => {
  const res = await SearchControllerService.searchAllUsingPost(
    searchRequest.value
  );
  if (res.code === 0) {
    dataList.value = res.data.dataList;
    pageSum.value = res.data.dataList[0].pages;
  }
};
watchEffect(async () => {
  let tagsList: any = [
    parseInt(route.query.tagsList ?? "0") == 0
      ? ""
      : parseInt(route.query.tagsList),
  ];
  let sourceList: any = route.query.sourceList?.toString() ?? "";
  if (sourceList == "") {
    sourceList = [];
  } else {
    sourceList = [sourceList];
  }
  searchRequest.value = {
    category: route.query.category ?? "algorithm",
    difficulty: route.query.difficulty ?? "",
    keyword: decodeURIComponent(<string>route.query.keyword || "") ?? "",
    pageNum: parseInt(<string>route.query.pageNum ?? "1") ?? 1,
    pageSize: parseInt(<string>route.query.pageSize ?? "10") ?? 10,
    sourceList: sourceList[0] == "" ? [] : sourceList,
    tagsList: !tagsList[0] || tagsList[0] == 0 ? [] : tagsList,
  } as any;
  await initData();
});

onMounted(async () => {
  await initData();
});

const updateIndicatorPosition = async () => {
  await nextTick();
  const activeElement = document.querySelector(
    ".tab-item.active"
  ) as HTMLElement;
  if (activeElement) {
    indicatorWidth.value = activeElement.offsetWidth;
    indicatorLeft.value = activeElement.offsetLeft;
  }
};

const indicatorStyle = computed(() => ({
  width: `${indicatorWidth.value}px`,
  left: `${indicatorLeft.value}px`,
}));

const handleTabClick = async (tabName: string) => {
  searchRequest.value.pageNum = 1;

  activeTab.value = tabName;
  searchRequest.value.category = tabName;
  emit("update:modelValue", tabName);
  await updateIndicatorPosition();
  router.replace({
    query: searchRequest.value,
  });
};

const handleClick = (page: number) => {
  searchRequest.value.pageNum = page;
  router.replace({
    query: searchRequest.value,
  });
};
onMounted(() => {
  updateIndicatorPosition();
  window.addEventListener("resize", updateIndicatorPosition);
});
</script>

<style scoped>
.tab-container {
  position: relative;
  display: inline-flex;
  background: white;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0);
}

.tab-item {
  position: relative;
  padding: 12px 24px;
  margin: 0 4px;
  cursor: pointer;
  color: #666;
  font-weight: 500;
  transition: all 0.3s ease;
  border-radius: 8px;
  z-index: 1;
}

.tab-item:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

.tab-item.active {
  color: #409eff;
}

.tab-indicator {
  position: absolute;
  bottom: 8px;
  height: 3px;
  background: #409eff;
  transition: all 0.3s ease;
  border-radius: 2px;
}
</style>
