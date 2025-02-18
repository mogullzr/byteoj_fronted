<script setup lang="ts">
import {ref, Ref, watch, watchEffect} from "vue";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import FontLittleComponent from "@/view/components/font/FontLittleComponent.vue";
import user from "@/store/user";
import {SearchControllerService, SearchRequest} from "../../../../generated";
import {useRoute, useRouter} from "vue-router";

const props = defineProps<{
  dataList: any
}>();

const useStore = user();
const route = useRoute();
const router = useRouter();
const tags_name_list:Ref<string[]> = ref([]);
const dataList: Ref<any[]> = ref(props.dataList);
const difficulty_list = useStore.difficulty_list;
const color_list = useStore.color_list;
const searchRequest: Ref<SearchRequest> = ref({
  category: route.query.category ?? "algorithm",
  difficulty: route.query.difficulty ?? "",
  keyword:  route.query.keyword ?? "",
  pageNum: parseInt(<string>route.query.pageNum ?? "1") ?? 1,
  pageSize: parseInt(<string>route.query.pageSize ?? "10") ?? 10,
  sourceList: route.query.sourceList ?? [],
  tagsList: route.query.tagsList ?? []
} as any);
const tagsRelation = useStore.AlgorithmTagsRelation[0];

watch(() => props.dataList, (newVal) => {
  dataList.value = newVal;
});
const initData = async () => {
  const res = await SearchControllerService.searchAllUsingPost(searchRequest.value);
  if (res.code === 0) {
    dataList.value = res.data.dataList;
  } else{
    await router.push("/404")
  }
}

watchEffect(async ()=>{
  let tagsList:any= [parseInt(route.query.tagsList ?? "0") == 0  ? "" :   parseInt(route.query.tagsList)];
  let sourceList: any = route.query.sourceList?.toString() ?? "";
  if (sourceList == "") {
    sourceList = [];
  } else {
    sourceList = [sourceList];
  }
  searchRequest.value = {
    category: route.query.category ?? "algorithm",
    difficulty: route.query.difficulty ?? "",
    keyword: decodeURIComponent(<string>route.query.keyword || '') ?? "",
    pageNum: parseInt(<string>route.query.pageNum ?? "1") ?? 1,
    pageSize: parseInt(<string>route.query.pageSize ?? "10") ?? 10,
    sourceList: sourceList[0] == '' ? [] : sourceList,
    tagsList: (!tagsList[0] || tagsList[0] == 0) ? [] : tagsList
  } as any;
  await initData();
})
const searchBySource = (source: string) => {
  searchRequest.value.sourceList = [source];
  router.push({
    query: searchRequest.value
  });
}

const findTagIds = (tagNames: string, data: any): (number | null)[] => {
  let tagNameList:any = [];
  if (tagNames.includes(",")) {
    tagNameList = tagNames.split(',');
  } else {
    tagNameList.push(tagNames);
  }
  tags_name_list.value = tagNameList;
  return tagNameList.map(name =>
      data.flat().find(tag => tag.tag_name.split(',').includes(name))?.tag_id ?? null
  );
};
const searchByTag = (tag:string) => {
  searchRequest.value.tagsList = findTagIds(tag, tagsRelation);
  searchRequest.value.tagsList = searchRequest.value.tagsList?.toString();
  router.push({
    query: searchRequest.value
  })
}

const highlightKeyword = (text:string, keyword:string) => {
  if (!keyword) return text; // 如果没有关键字，则返回原始文本

  // 处理 keyword：去掉多余空格并转义特殊字符
  const escapedKeyword = keyword
      .trim()
      .replace(/\s+/g, '\\s+') // 把多个空格转换为 `\s+`
      .replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&'); // 转义正则特殊字符

  // 创建正则匹配关键字
  const regExp = new RegExp(`(${escapedKeyword})`, 'gi');

  // 替换匹配部分并高亮显示
  return text?.replace(regExp, '<span style="color: red;">$1</span>');
}
</script>

<template>
  <div class="mx-auto font-bold text-gray-400 text-center" v-if="dataList?.length === 0">
    <span class="my-4" style="font-size: 4em"> 没有搜索到任何信息┭┮﹏┭┮ </span>
  </div>
  <div v-for="data in dataList" class="post-item">
    <div class="font-bold">
      <span>算法题目</span>
    </div>
    <div class="flex mt-4">
      <router-link class="avatar" :to="'/user/space/' + data.uuid">
        <div class="rounded-full w-12 mx-3">
          <img
              @dragstart.prevent
              src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502091611291.png"
              alt="Mogullzr小刘的OJ项目"
          />
        </div>
      </router-link>
      <div class="flex-1">
        <div class="font-bold">
          <span>{{ data.problem_id }}.</span>
          <span v-html="highlightKeyword(data.chinese_name, <string>searchRequest.keyword)"></span>
        </div>
        <div class="text-gray-500">
<!--          searchByDifficulty(data.difficulty_name == '简单' ? 'easy' : (problem.difficulty_name == '中等' ? 'medium' : 'difficult'))-->
          <button @click="">
            <span class="font-bold mr-2">难度:</span>
              <span
                  :class="
                  color_list[difficulty_list[data.difficulty_name]] +
                  ' text-white font-bold'
                "
                  style="white-space: nowrap"
              >
                {{ data.difficulty_name }}
              </span>
          </button>
        </div>
      </div>
    </div>
    <div class="mx-6 my-2 flex">
      <div class="mx-4">
        <div class="mx-8 text-lg" v-if="data.algorithm_tags?.length !== 0">
          <span class="font-bold">标签：</span>
          <button
              class="mx-1"
              v-for="tag in data.algorithm_tags"
              :key="tag"
              @click="searchByTag(tag)"
          >
            <span v-if="tags_name_list.includes(tag)" class="badge badge-lg border-2 font-bold text-red-500" style="background-color: #F4F4F4">{{ tag }}</span>
            <span v-else class="badge badge-lg border-2 font-bold text-gray-500" style="background-color: #F4F4F4">{{ tag }}</span>
          </button>
        </div>
        <div class="mx-8 my-2 text-lg" v-if="data.source && data.source !== ''">
          <span class="font-bold">来源：</span>
          <button
              class="mx-1"
              @click="searchBySource(data.source)"
          >
            <span v-if="searchRequest.sourceList?.includes(data.source)" class="badge badge-lg border-2 font-bold text-red-500" style="background-color: #F4F4F4">{{ data.source }}</span>
            <span v-else class="badge badge-lg border-2 font-bold text-gray-500" style="background-color: #F4F4F4">{{ data.source }}</span>
          </button>
        </div>
        <MarkdownView :generateData="data.description + '......'" />
      </div>
    </div>

      <!-- 悬浮选股按钮 -->
    <div class="hover-button">
      <router-link :to="'/problems/algorithm/' + data.problem_id" class="select-button font-bold">点击进入题目</router-link>
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