<script setup lang="ts">
import { onMounted, ref, Ref, watch } from "vue";
import dayjs, { Dayjs } from "dayjs";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import {useRoute, useRouter} from "vue-router";
import {PostsControllerService, SearchRequest} from "../../../../generated";

const props = defineProps<{
  dataList: any
}>();
const router = useRouter();
const route = useRoute();
const dataList: Ref<any[]> = ref(props.dataList);

const dataListDeal = () => {
  let TimeStamp = ref();
  let nowDate = ref();
  const years = ref();
  const months = ref();
  const days = ref();
  const hours = ref();
  const minutes = ref();
  const seconds = ref();

  for (let item = 0; item < dataList.value?.length; item++) {
    dataList.value[item].create_time = ref<Dayjs>(dataList.value[item].create_time);

    if (dataList.value[item].content?.length > 200) {
      dataList.value[item].is_hidden = 1;
      dataList.value[item].extra_content = dataList.value[item].content.substring(200);
      dataList.value[item].content = dataList.value[item].content.substring(0, 200);
    } else {
      dataList.value[item].is_hidden = 2;
    }

    TimeStamp.value = dayjs(nowDate.value).diff(dayjs(dataList.value[item].create_time)) / 1000;

    if (TimeStamp.value < 0) {
      dataList.value[item].create_time = ref("");
      continue;
    }

    years.value = Math.floor(TimeStamp.value / (365 * 24 * 60 * 60));
    if (years.value >= 1) {
      dataList.value[item].create_time = ref(years.value);
      dataList.value[item].pattern = ref("年前");
      continue;
    }

    months.value = Math.floor(TimeStamp.value / (30 * 24 * 60 * 60));
    if (months.value >= 1) {
      dataList.value[item].create_time = ref(months.value);
      dataList.value[item].pattern = ref("个月前");
      continue;
    }

    days.value = Math.floor(TimeStamp.value / (24 * 60 * 60));
    if (days.value >= 1) {
      dataList.value[item].create_time = ref(days.value);
      dataList.value[item].pattern = ref("天前");
      continue;
    }

    hours.value = Math.floor(TimeStamp.value / (60 * 60));
    if (hours.value >= 1) {
      dataList.value[item].create_time = ref(hours.value);
      dataList.value[item].pattern = ref("个小时前");
      continue;
    }

    minutes.value = Math.floor(TimeStamp.value / 60);
    if (minutes.value >= 1) {
      dataList.value[item].create_time = ref(minutes.value);
      dataList.value[item].pattern = ref("分钟前");
      continue;
    }

    seconds.value = Math.floor(TimeStamp.value);
    dataList.value[item].create_time = ref(seconds.value);
    dataList.value[item].pattern = ref("秒前");
  }
};

watch(() => props.dataList, (newVal) => {
  dataList.value = newVal;
  dataListDeal();
});

onMounted(() => {
  dataListDeal();
});

const num:Ref<number> = ref(0);
const searchRequest: Ref<SearchRequest> = ref({
  category: route.query.category ?? "algorithm",
  difficulty: route.query.difficulty ?? "",
  keyword:  route.query.keyword ?? "",
  pageNum: parseInt(<string>route.query.pageNum ?? "1") ?? 1,
  pageSize: parseInt(<string>route.query.pageSize ?? "10") ?? 10,
  sourceList: route.query.sourceList ?? [],
  tagsList: route.query.tagsList ?? []
} as any);
</script>

<template>
  <div class="mx-auto font-bold text-gray-400 text-center" v-if="dataList?.length === 0">
      <span class="my-4" style="font-size: 4em"> 没有搜索到任何信息┭┮﹏┭┮ </span>
  </div>
  <div v-for="data in dataList" class="post-item">
    <div class="font-bold">
      <span>日常</span>
    </div>
    <div class="flex mt-4">
      <router-link class="avatar" :to="'/user/space/' + data.uuid">
        <div class="rounded-full w-12 mx-3">
          <img
              @dragstart.prevent
              :src="data.avatar"
              alt="Mogullzr小刘的OJ项目"
          />
        </div>
      </router-link>
      <div class="flex-1">
        <div class="font-bold">{{ data.author }}</div>
        <div class="text-gray-500">
          {{ data.school }}
        </div>
      </div>
      <div class="text-gray-500">
        {{ data.create_time }}{{ data.pattern }}
      </div>
    </div>
    <div class="m-6 flex">
      <div class="mx-4">
        <span v-for="tag in data.tag_list" class="p-2">
          <span>#</span>
          <span class="text-red-400 font-bold">{{ tag }}</span>
        </span>
        <MarkdownView :generateData="data.content + '......'" />
      </div>
    </div>
    <!-- 悬浮选股按钮 -->
    <div class="hover-button">
      <button @click="router.push('/posts/' + data.post_id)" class="select-button font-bold">点击进入帖子</button>
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
  background-color: #4CAF50;
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