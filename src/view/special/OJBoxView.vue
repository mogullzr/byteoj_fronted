<template>
  <div class="search-container">
    <!-- 输入框 -->
    <input
      type="text"
      class="search-input"
      placeholder="请输入竞赛关键词..."
      @keyup.enter="searchByKeyword"
      v-model="searchRequest.keyword"
    />

    <!-- 选择来源的下拉菜单 -->
    <div class="platform-select-container">
      <select
        class="platform-select"
        v-model="platorm"
        @click="searchByKeyword"
      >
        <option value="">选择平台</option>
        <option value="CodeForces">CodeForces</option>
        <option value="LeetCode">LeetCode</option>
        <option value="牛客">牛客</option>
        <option value="蓝桥杯">蓝桥杯</option>
        <option value="CodeChef">CodeChef</option>
        <option value="jisuanke">jisuanke</option>
        <option value="Acwing">Acwing</option>
      </select>
    </div>
  </div>
  <div class="oj-card-list">
    <OJCard
      v-for="ojCompetition in dataList"
      :platform="ojCompetition.platform ?? 'ByteOJ'"
      :format="
        ojCompetition.pattern == '0'
          ? 'ACM'
          : ojCompetition.pattern == '1'
          ? 'OI'
          : 'IOI'
      "
      :title="ojCompetition.title ?? ''"
      :startTime="
        dayjs(ojCompetition.start_time).format('YYYY-MM-DD HH:mm:ss') ?? ''
      "
      :endTime="
        dayjs(ojCompetition.end_time).format('YYYY-MM-DD HH:mm:ss') ?? ''
      "
      :link="ojCompetition.url ?? ''"
      :image="
        ojCompetition.picture ??
        'http://mogullzr001.oss-cn-beijing.aliyuncs.com/2025/02/da840d2e60c8412487e7a5b1a8ef9f85.jpeg'
      "
    />
  </div>
</template>

<script lang="ts" setup>
import OJCard from "@/view/special/OJCard.vue";
import { SearchControllerService, SearchRequest } from "../../../generated";
import { useRoute, useRouter } from "vue-router";
import { ref, Ref, watchEffect } from "vue";
import { OJCompetitionVo } from "../../../generated/models/OJCompetitionVo";
import dayjs from "dayjs";

const route = useRoute();
const router = useRouter();
const searchRequest: Ref<SearchRequest> = ref({
  category: route.query.category ?? "oj",
  keyword: route.query.keyword ?? "",
  pageNum: parseInt(<string>route.query.pageNum ?? "1") ?? 1,
  pageSize: parseInt(<string>route.query.pageSize ?? "9") ?? 9,
  sourceList: route.query.sourceList ?? [],
} as any);
const platorm: Ref<any> = ref(route.query.sourceList ?? "选择平台");

const dataList: Ref<OJCompetitionVo[]> = ref([]);
const initData = async () => {
  const res = await SearchControllerService.searchAllUsingPost(
    searchRequest.value
  );
  if (res.code === 0) {
    dataList.value = res.data.dataList;
  }
};
watchEffect(async () => {
  let sourceList: any = route.query.sourceList?.toString() ?? "";
  if (sourceList.includes(",")) {
    sourceList = sourceList.split(",");
  } else {
    sourceList = [sourceList];
  }
  searchRequest.value = {
    category: route.query.category ?? "oj",
    keyword: route.query.keyword ?? "",
    pageNum: parseInt(<string>route.query.pageNum ?? "1") ?? 1,
    pageSize: parseInt(<string>route.query.pageSize ?? "9") ?? 9,
    sourceList: sourceList[0] == "" ? [] : sourceList,
  } as any;
  await initData();
});

// 通过关键词搜索
const searchByKeyword = () => {
  if (platorm.value !== "选择平台")
    searchRequest.value.sourceList = platorm.value;
  router.replace({
    query: searchRequest.value,
  });
};
</script>

<style>
.oj-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px;
}
/* 容器样式 */
.search-container {
  display: flex;
  align-items: center;
  max-width: 600px;
  margin: 20px auto;
  padding: 10px;
}

/* 输入框样式 */
.search-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  background-color: #ffffff;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: #007bff;
}

.search-input::placeholder {
  color: #999;
}

/* 选择框容器 */
.platform-select-container {
  position: relative;
  margin-left: 10px;
}

/* 选择框样式 */
.platform-select {
  font-weight: bold;
  padding: 12px 36px 12px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  color: #333;
  background-color: #ffffff;
  cursor: pointer;
  outline: none;
  appearance: none; /* 隐藏默认箭头 */
  transition: border-color 0.3s ease;
}

.platform-select:hover {
  border-color: #007bff;
}

.platform-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

/* 自定义下拉箭头 */
.platform-select-container::after {
  content: "▼";
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  pointer-events: none;
  color: #666;
  font-size: 12px;
}

/* 下拉框选项样式 */
.platform-select option {
  padding: 8px 12px;
  background-color: #ffffff;
  color: #333;
}

.platform-select option:hover {
  background-color: #f1f1f1;
}
</style>
