<script setup lang="ts">
import {onBeforeUpdate, onMounted, onUpdated, Ref, ref, watchEffect} from "vue";
import {useRoute, useRouter} from "vue-router";
import {ProblemAlgorithmControllerService, SearchControllerService, SearchRequest} from "../../../../generated";
import UserStore from "@/store/user";
import Pagination from "@/view/components/Pagination.vue";
import TagSelector from "@/view/components/TagSelector.vue";
import OtherTagSelector from "@/view/components/OtherTagSelector.vue";

const route = useRoute();
const router = useRouter();
const useStore = UserStore();
const path = router.currentRoute.value.fullPath;
const currentPage = ref(1);
// 总面数
const PageSum = ref(1);
const tag_current_name = ref("");
const EasySum = ref();
const MediumSum = ref();
const HardSum = ref();
// 0表示默认请求状态，1最后点击为表示根据标签查询，2表示最后点击为根据难度查询
const flag = ref(0);
// 用于存储当前选中标签
const tags_name_list:Ref<string[]> = ref([]);
// 问题列表
let problem_list: Ref<any> = ref([]);
const difficulty_list = useStore.difficulty_list;
const color_list = useStore.color_list;
const tagsRelation = useStore.AlgorithmTagsRelation[0];
const searchRequest: Ref<SearchRequest> = ref({
  category: route.query.category ?? "algorithm",
  difficulty: route.query.difficulty ?? "",
  keyword:  route.query.keyword ?? "",
  pageNum: parseInt(<string>route.query.pageNum ?? "1") ?? 1,
  pageSize: parseInt(<string>route.query.pageSize ?? "50") ?? 50,
  sourceList: route.query.sourceList ?? [],
  tagsList: route.query.tagsList ?? []
} as any);
// 初始选中的标签
const initSelected:Ref<any[]> = ref([]);
const initSource:Ref<any[]> = ref([]);

// 来源所有标签
const sourceList:Ref<string[]> = ref(useStore.source_List);
const getTagNameById = (id: number, tags: any): string | undefined => {
  const tag = tags.find(tag => tag.tag_id === id);

  return tag?.tag_name; // 如果找到，返回 tag_name；否则返回 undefined
};
const getTagNamesByIds = (ids: Array<number> | undefined, tags: any): (string | undefined)[] => {
  return ids.map(id => getTagNameById(id, tags));
};
onMounted(async () => {
  searchRequest.value.keyword = searchRequest.value.keyword?.repl

  await initData();
  tags_name_list.value = getTagNamesByIds(searchRequest.value.tagsList, tagsRelation);

  for (let item = 0; item < tags_name_list.value.length; item ++) {
    initSelected.value.push({
      tag_id: searchRequest.value.tagsList[item],
      tag_name: tags_name_list.value[item]
    })
  }
  initSelected.value = initSelected.value.map(item => ({
    tag_id: item.id,
    tag_name: item.name
  }));
  initSource.value = searchRequest.value.sourceList;
  // 请求1
  const resEasy =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchSumByDifficultyUsingPost(
      "简单"
    );

  if (resEasy.code === 0) {
    EasySum.value = resEasy.data;
  } else if (resEasy.code === 40101) {
    await router.push("/404");
  }
  // 请求2
  const resMedium =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchSumByDifficultyUsingPost(
      "中等"
    );

  if (resMedium.code === 0) {
    MediumSum.value = resMedium.data;
  } else if (resMedium.code === 40101) {
    await router.push("/404");
  }

  // 请求3
  const resHard =
    await ProblemAlgorithmControllerService.problemAlgorithmSearchSumByDifficultyUsingPost(
      "困难"
    );

  if (resHard.code === 0) {
    HardSum.value = resHard.data;
  } else if (resHard.code === 40101){
    await router.push("/404");
  }
});

// 挂载完成之后执行
onBeforeUpdate(() => {
  initSource.value = searchRequest.value.sourceList
});

const convertToFrameNumbers = (str: any): number[] => {
  if (str.includes(',')) {
    return str.split(',')
        .map(item => Number(item))
        .filter(item => !isNaN(item)); // 过滤无效的数字
  } else {
    return [Number(str)]; // 如果没有逗号，直接将单个数字转为数组
  }
};

watchEffect(async ()=>{
  let tagsList:any= convertToFrameNumbers(route.query.tagsList ?? "");
  let sourceList: any = route.query.sourceList?.toString() ?? "";
  if (sourceList.includes(",")) {
    sourceList = sourceList.split(",");
  } else {
    sourceList = [sourceList];
  }
  searchRequest.value = {
    category: route.query.category ?? "algorithm",
    difficulty: route.query.difficulty ?? "",
    keyword: decodeURIComponent(<string>route.query.keyword || '') ?? "",
    pageNum: parseInt(<string>route.query.pageNum ?? "1") ?? 1,
    pageSize: parseInt(<string>route.query.pageSize ?? "50") ?? 50,
    sourceList: sourceList[0] == '' ? [] : sourceList,
    tagsList: tagsList[0] == 0 ? [] : tagsList
  } as any;
  console.log(searchRequest.value)
  await initData();
})
const initData = async () => {
  const res = await SearchControllerService.searchAllUsingPost(searchRequest.value);
  if (res.code === 0) {
    problem_list.value = res.data.dataList;
    if (problem_list.value.length !== 0) {
      PageSum.value = res.data.dataList[0].pages;
    } else{
      PageSum.value = 1;
    }
  }
}

const searchByDifficulty = async (difficulty_name: string) => {
  searchRequest.value.difficulty = difficulty_name;
  searchRequest.value.pageNum = 1;

  searchRequest.value.sourceList = searchRequest.value.sourceList?.toString();
  searchRequest.value.tagsList = searchRequest.value.tagsList?.toString();
  await router.push({
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
// 根据算法算法标签查找所有符合条件的题目
const searchByTag = async (tag_name_list: string) => {
  searchRequest.value.tagsList = findTagIds(tag_name_list,tagsRelation);
  searchRequest.value.pageNum = 1;

  searchRequest.value.sourceList = searchRequest.value.sourceList?.toString();
  searchRequest.value.tagsList = searchRequest.value.tagsList?.toString();
  await router.push({
    query: searchRequest.value
  });
};

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
  return text.replace(regExp, '<span style="color: red;">$1</span>');
}
const searchByKeyword = async () => {
  searchRequest.value.keyword = searchRequest.value.keyword?.replace("   ", " + ").replace(" ", "")
  searchRequest.value.pageNum = 1;

  searchRequest.value.sourceList = searchRequest.value.sourceList?.toString();
  searchRequest.value.tagsList = searchRequest.value.tagsList?.toString();
  await router.push({
    query: searchRequest.value
  });
};

const handlePageChange = (page:number) => {
  // 修改当前指向的页数
  searchRequest.value.pageNum = page;

  searchRequest.value.sourceList = searchRequest.value.sourceList?.toString();
  searchRequest.value.tagsList = searchRequest.value.tagsList?.toString();
  router.push({
    query: searchRequest.value
  });
}

// 提取其中的tag_id和tag_name
const handleSelectedTags = (tags:any) => {
  let tags_id_list = "";
  tags_name_list.value = [];
  for (let item = 0; item < tags.length; item++) {
    if (item !== 0) {
      tags_id_list += ","
    }
    tags_id_list += tags[item].tag_id;
    tags_name_list.value.push(tags[item].tag_name)
  }
  searchRequest.value.tagsList = tags_id_list
  searchRequest.value.sourceList = searchRequest.value.sourceList?.toString();
  router.push({
    query: searchRequest.value
  });
}

// 点击来源进行搜索
const handleSourceSelectedTags = (sourceList:string[]) => {
  searchRequest.value.sourceList = sourceList.toString();
  searchRequest.value.tagsList = searchRequest.value.tagsList?.toString() ?? "";
  router.push({
    query:searchRequest.value
  })
}
</script>
<template>
  <div class="card-body mt-4 h-30 bg-base-100 shadow-xl rounded-box">
    <div class="w-7/12 m-auto">
      <div class="font-bold text-center text-4xl">ByteOJ编程题库</div>
      <div class="w-full my-4 flex">
        <input
          v-model="searchRequest.keyword"
          type="text"
          placeholder="搜索题目"
          class="input input-bordered input-md input-s w-full m-auto"
          @keyup.enter="searchByKeyword"
        />
        <button class="svg-hover mx-2" @click="searchByKeyword">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
          >
            <path
              fill="#999999"
              d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="overflow-x-auto">
      <div class="flex">
        <div class="flex-1">
          <TagSelector
              :all-tags="tagsRelation"
              :selected-tags="initSelected"
              @update:selectedTags="handleSelectedTags"
          />
        </div>
        <div class="hidden">{{initSource = searchRequest.sourceList}}</div>
        <div class="flex-1">
          <OtherTagSelector
              :all-tags="sourceList"
              :selected-tags="initSource"
              @update:selectedTags="handleSourceSelectedTags"
          />
        </div>
      </div>
      <div class="flex flex-row-reverse">
        <div>
          <button>
            <span class="text-error" @click="searchByDifficulty('difficult')"
              >困难题</span
            >
            <span class="font-bold">{{ HardSum }}</span>
            <span>道，</span>
          </button>
        </div>
        <div>
          <button>
            <span class="text-warning" @click="searchByDifficulty('medium')"
              >中等题</span
            >
            <span class="font-bold">{{ MediumSum }}</span>
            <span>道，</span>
          </button>
        </div>
        <div>
          其中
          <button>
            <span class="text-success" @click="searchByDifficulty('easy')"
              >简单题</span
            >
          </button>
          <span class="font-bold">{{ EasySum }}</span>
          <span>道，</span>
        </div>
        <div>
          总共通过了
          <span class="font-bold">{{ EasySum + MediumSum + HardSum }}</span>
          <span>道题目</span>
        </div>
      </div>
      <table class="table" v-if="problem_list.length !== 0">
        <!-- head -->
        <thead>
          <tr>
            <th></th>
            <th>题号</th>
            <th>题目</th>
            <th>算法标签</th>
            <th>来源</th>
            <th>通过率</th>
            <th>难度</th>
          </tr>
        </thead>
        <tbody class="problemBody">
          <tr
            v-for="problem in problem_list"
            :key="problem.problem_id"
            class="hover"
          >
            <td v-if="problem.status == 1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#5FBA7D"
                  d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z"
                />
              </svg>
            </td>
            <td v-else-if="problem.status == 0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#dc2626"
                  d="M14 12h-4v-2h4m0 6h-4v-2h4m6-6h-2.81a6 6 0 0 0-1.82-1.96L17 4.41L15.59 3l-2.17 2.17a6 6 0 0 0-2.83 0L8.41 3L7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20z"
                />
              </svg>
            </td>
            <td v-else-if="problem.status == 2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#eab308"
                  d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2z"
                />
              </svg>
            </td>
            <td v-else></td>
            <td>{{ problem.problem_id }}</td>
            <router-link
              class="link link-hover text-sky-600"
              :to="'/problems/algorithm/' + problem.problem_id"
            >
              <td v-html="highlightKeyword(problem.chinese_name, <string>searchRequest.keyword)"></td>
            </router-link>
            <td class="w-64">
              <button
                v-for="tag in problem.algorithm_tags"
                :key="tag"
                @click="searchByTag(tag)"
              >
                <span v-if="tags_name_list.includes(tag)" class="badge text-red-500" style="background-color: #F4F4F4">{{ tag }}</span>
                <span v-else class="badge" style="background-color: #F4F4F4">{{ tag }}</span>
              </button>
            </td>
            <td>
              <span class="badge badge-ghost">{{ problem.source }}</span>
            </td>
            <td
              v-if="
                problem.ac_total == null ||
                problem.test_total == null ||
                problem.test_total == 0
              "
            >
              100.0%
            </td>

            <td v-else>
              {{ ((problem.ac_total * 100) / problem.test_total).toFixed(1) }}%
            </td>
            <td>
              <button @click="searchByDifficulty(problem.difficulty_name == '简单' ? 'easy' : (problem.difficulty_name == '中等' ? 'medium' : 'difficult'))">
                <span
                  :class="
                    color_list[difficulty_list[problem.difficulty_name]] +
                    ' text-white'
                  "
                  style="white-space: nowrap"
                >
                  {{ problem.difficulty_name }}
                </span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="problem_list.length === 0"
      class="mx-auto font-bold text-gray-400"
    >
      <span class="my-4" style="font-size: 48px"> 暂无任何匹配记录┭┮﹏┭┮ </span>
    </div>
    <Pagination
        :total-pages="PageSum ?? 1"
        :current-page="searchRequest.pageNum ?? 1"
        @current-page="handlePageChange"
    />
  </div>

</template>

<style scoped>
.svg-hover:hover {
  path {
    fill: rgba(2, 132, 199, 0.99);
  }
}

.problemBody tr:nth-child(odd) {
  background-color: #f9f9f9;
}
</style>
