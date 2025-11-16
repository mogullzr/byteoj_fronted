<script setup lang="ts">
import { onMounted, onUnmounted, Ref, ref } from "vue";
import {SearchControllerService, SearchRequest, UserControllerService} from "../../../generated";
import { useRoute, useRouter } from "vue-router";
import UserStore from "@/store/user";
import { ACCESS_ENUM } from "@/access/access";

const darkTheme = ref<string>("ByteOJLight");
const router = useRouter();
const route = useRoute();
const useStore = UserStore();
const isMobileMenuOpen = ref(false);
const isMoreMenuOpen = ref(false);
const searchRequest: Ref<SearchRequest> = ref({
  category: route.query.category ?? "post",
  difficulty: route.query.difficulty ?? "",
  keyword: route.query.keyword ?? "",
  pageNum: parseInt(<string>route.query.pageNum ?? "1") ?? 1,
  pageSize: parseInt(<string>route.query.pageSize ?? "10") ?? 10,
  sourceList: route.query.sourceList ?? "",
  tagsList: route.query.tagsList ?? "",
} as any);

// 自动补全相关
const results: Ref<any[]> = ref([]);
const showResults = ref(false);
const selectedIndex = ref(-1); // 当前选中的索引
const debounceTimer: Ref<NodeJS.Timeout | null> = ref(null);

// Check if in iframe
const isInIframe = ref(window !== window.parent);

// Toggle mobile menu
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Toggle more menu
const toggleMoreMenu = () => {
  isMoreMenuOpen.value = !isMoreMenuOpen.value;
};

// Handle page navigation
const handleNavigation = (path: string) => {
  router.push(path);
  if (isInIframe.value) {
    try {
      window.parent.postMessage(
          {
            type: "navigation",
            path: path,
          },
          window.location.origin
      );
    } catch (e) {
      console.error("Unable to send navigation message to parent window", e);
    }
  }
  isMobileMenuOpen.value = false; // Close mobile menu after navigation
  isMoreMenuOpen.value = false; // Close more menu after navigation
};

// Theme switching
const handleChangeTheme = () => {
  const html = document.getElementsByTagName("html")[0];
  darkTheme.value = html.dataset.theme || "ByteOJLight";
  html.dataset.theme = darkTheme.value === "ByteOJLight" ? "ByteOJDark" : "ByteOJLight";
};

// Logout
const logout = async () => {
  const res = await UserControllerService.userLogoutUsingPost();
  if (res.code === 0) {
    setTimeout(() => {
      useStore.loginUser = {};
      window.location.replace("/");
    }, 500);
  } else {
    console.log(res.data);
  }
};

// Search functionality Search functionality
const searchInfo = () => {
  searchRequest.value.pageNum = 1;
  router.replace(
      `/together/search?category=${searchRequest.value.category}&keyword=${encodeURIComponent(
          searchRequest.value.keyword
      )}&difficulty=${searchRequest.value.difficulty}&tagsList=${searchRequest.value.tagsList}&sourceList=${
          searchRequest.value.sourceList
      }&pageNum=${searchRequest.value.pageNum}&pageSize=${searchRequest.value.pageSize}`
  );
};

// 键盘导航处理
const handleKeyDown = (event: KeyboardEvent) => {
  if (!showResults.value || results.value.length === 0) return;

  switch (event.key) {
    case "ArrowUp":
      event.preventDefault();
      if (selectedIndex.value <= 0) {
        selectedIndex.value = results.value.length - 1;
      } else {
        selectedIndex.value--;
      }
      break;

    case "ArrowDown":
      event.preventDefault;
      if (selectedIndex.value >= results.value.length - 1) {
        selectedIndex.value = 0;
      } else {
        selectedIndex.value++;
      }
      break;

    case "Enter":
      event.preventDefault;
      if (selectedIndex.value >= 0 && selectedIndex.value < results.value.length) {
        // 选中并触发搜索
        selectAndSearch(results.value[selectedIndex.value].raw);
      } else {
        // 如果没有选中任何项，直接搜索当前输入内容
        searchInfo();
      }
      break;

    case "Escape":
      showResults.value = false;
      selectedIndex.value = -1;
      break;
  }
};

// 选中并立即搜索
const selectAndSearch = (raw: string) => {
  searchRequest.value.keyword = raw;
  results.value = [];
  showResults.value = false;
  selectedIndex.value = -1;

  // 延迟一小段时间后执行搜索，确保UI更新完成
  setTimeout(() => {
    searchInfo();
  }, 10);
};

// 自动补全：输入处理（200ms防抖）
const handleInput = () => {
  selectedIndex.value = -1; // 输入时重置选中状态

  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }
  debounceTimer.value = setTimeout(async () => {
    const kw = searchRequest.value.keyword.trim();
    if (kw.length > 0) {
      try {
        const res = await SearchControllerService.searchAutoCompleteUsingGet(kw, 10);
        if (res.code === 0) {
          results.value = res.data || [];
          showResults.value = results.value.length > 0;
        } else {
          results.value = [];
          showResults.value = false;
        }
      } catch (error) {
        console.error("Autocomplete API error:", error);
        results.value = [];
        showResults.value = false;
      }
    } else {
      results.value = [];
      showResults.value = false;
    }
  }, 200);
};

// 选择建议项
const selectItem = (raw: string) => {
  selectAndSearch(raw);
};

// 高亮keyword（返回HTML）- 增强版支持选中状态
const getHighlightedHtml = (text: string, keyword: string, isSelected: boolean) => {
  if (!keyword || !text) return text;
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedKeyword})`, 'gi');
  return text.replace(regex, '<span class="highlight">$1</span>');
};

// 当鼠标悬停时更新选中索引
const handleMouseOver = (index: number) => {
  selectedIndex.value = index;
};

// 在关闭下拉列表时重置选中索引
const resetSelection = () => {
  selectedIndex.value = -1;
};

// 点击外部关闭更多菜单 + 搜索下拉
const closeMenusOnClickOutside = (event: MouseEvent) => {
  // 现有逻辑：关闭更多菜单
  if (isMoreMenuOpen.value) {
    isMoreMenuOpen.value = false;
  }
  // 新增：关闭搜索下拉
  const searchContainer = (event.target as HTMLElement).closest('.search-container');
  if (!searchContainer && showResults.value) {
    showResults.value = false;
    resetSelection();
  }
};

onMounted(async () => {
  // 移除原"Mog"测试，实际输入时触发
  darkTheme.value = "ByteOJLight";
  // 添加全局点击监听器（合并更多菜单和搜索关闭）
  document.addEventListener('click', closeMenusOnClickOutside);
});

// 组件卸载时移除监听器
onUnmounted(() => {
  document.removeEventListener('click', closeMenusOnClickOutside);
  if (debounceTimer.value) {
    clearTimeout(debounceTimer.value);
  }
});
</script>

<template>
  <div class="navbar bg-base-100 mb-2 shadow-lg">
    <div class="navbar bg-base-100 mx-auto flex justify-between items-center" style="max-width: 1150px">
      <!-- Logo and Brand -->
      <div class="flex-none">
        <router-link class="w-12 h-10 space-x-9 pl-3 mr-0.5" to="/">
          <svg t="1711118928554" class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" p-id="6680" width="38" height="38" >
            <path d="M295.232 208.768a19.2 19.2 0 0 1 27.2 0l18.048 18.112a19.2 19.2 0 0 1 0 27.2L82.56 512l257.984 257.92a19.2 19.2 0 0 1 2.816 23.68l-2.816 3.52-18.048 18.112a19.2 19.2 0 0 1-27.2 0L5.632 525.568a19.2 19.2 0 0 1 0-27.136l289.6-289.664z m433.536 0a19.2 19.2 0 0 0-27.2 0l-18.048 18.112a19.2 19.2 0 0 0 0 27.2L941.44 512l-257.984 257.92a19.2 19.2 0 0 0-2.816 23.68l2.816 3.52 18.048 18.112a19.2 19.2 0 0 0 27.2 0l289.6-289.664a19.2 19.2 0 0 0 0-27.136l-289.6-289.664z m-128 13.248l-114.752 590.528a19.2 19.2 0 0 1-22.528 15.232l-25.088-4.928a19.2 19.2 0 0 1-15.232-22.528l114.816-590.528a19.2 19.2 0 0 1 22.528-15.168l25.088 4.864a19.2 19.2 0 0 1 15.232 22.528z" fill="#292939" p-id="6681" ></path>
          </svg>
        </router-link>
        <router-link to="/" class="btn btn-ghost text-xl p-1 px-0.5 ml-2"> ByteOJ </router-link>
      </div>

      <!-- Hamburger Menu Button (Visible on Mobile, Top-Right) -->
      <div class="flex-none lg:hidden ml-auto">
        <button class="btn btn-square btn-ghost" @click="toggleMobileMenu" aria-label="Toggle Menu" >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current" >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" ></path>
          </svg>
        </button>
      </div>

      <!-- Navigation Links (Visible on Desktop) -->
      <div class="navbar-start hidden lg:flex flex-1 px-1 mr-1">
        <ul class="menu menu-horizontal">
          <li>
            <a @click.prevent="handleNavigation('/home')" href="/home">首页</a>
          </li>
          <li>
            <a @click.prevent="handleNavigation('/problems')" href="/problems">题库</a>
          </li>
          <li>
            <a @click.prevent="handleNavigation('/study')" href="/study">学习</a>
          </li>
          <li>
            <a @click.prevent="handleNavigation('/competition')" href="/competition">竞赛</a>
          </li>
          <li>
            <a @click.prevent="handleNavigation('/special')" href="/special">Byte专栏</a>
          </li>

          <!-- More dropdown menu -->
          <li class="dropdown" :class="{ 'dropdown-open': isMoreMenuOpen }">
            <div tabindex="0" role="button" class="flex items-center" @click.stop="toggleMoreMenu">
              更多
              <svg class="fill-current ml-1 transition-transform duration-200" :class="{ 'rotate-180': isMoreMenuOpen }" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                <path d="m7,10l5,5l5-5z"/>
              </svg>
            </div>
            <ul v-show="isMoreMenuOpen" tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50" @click.stop>
              <li>
                <a @click.prevent="handleNavigation('/introduction')" href="/introduction">网站介绍</a>
              </li>
              <li>
                <a @click.prevent="handleNavigation('/requirements')" href="/requirements">需求模块</a>
              </li>
              <li>
                <a class="disabled" @click.prevent="handleNavigation('/data-structure-animation')" href="/data-structure-animation">数据结构动画(努力制作中...)</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- Mobile Menu (Visible when toggled, only navigation links) -->
      <div v-if="isMobileMenuOpen" class="lg:hidden absolute top-16 left-0 w-full bg-base-100 shadow-lg z-50 transition-all duration-300" :class="{ 'opacity-100 translate-y-0': isMobileMenuOpen, 'opacity-0 -translate-y-4 pointer-events-none': !isMobileMenuOpen }" >
        <ul class="menu menu-vertical w-full p-4">
          <li>
            <a @click.prevent="handleNavigation('/home')" href="/home">首页</a>
          </li>
          <li>
            <a @click.prevent="handleNavigation('/problems')" href="/problems">题库</a>
          </li>
          <li>
            <a @click.prevent="handleNavigation('/study')" href="/study">学习</a>
          </li>
          <li>
            <a @click.prevent="handleNavigation('/competition')" href="/competition">竞赛</a>
          </li>
          <li>
            <a @click.prevent="handleNavigation('/special')" href="/special">Byte专栏</a>
          </li>
          <li>
            <a @click.prevent="handleNavigation('/introduction')" href="/introduction">网站介绍</a>
          </li>
          <li>
            <a @click.prevent="handleNavigation('/requirements')" href="/requirements">需求模块</a>
          </li>
          <li>
            <a class="disabled" @click.prevent="handleNavigation('/data-structure-animation')" href="/data-structure-animation">数据结构动画</a>
          </li>
        </ul>
      </div>

      <!-- Search and User Actions (Visible on Desktop Only) -->
      <div class="hidden lg:flex flex-none items-center space-x-2">
        <div class="relative">
          <div class="form-control">
            <input
                v-model="searchRequest.keyword"
                type="text"
                placeholder="请输入关键词"
                class="search-input"
                @input="handleInput"
                @keydown="handleKeyDown"
                @focus="resetSelection"
            />
          </div>
          <div
              v-if="showResults"
              class="autocomplete absolute top-full left-0 right-0 bg-base-100/95 backdrop-blur-sm border border-base-200 rounded-xl shadow-xl max-h-52 overflow-y-auto z-50 mt-1"
          >
            <div
                v-for="(item, index) in results"
                :key="index"
                class="autocomplete-item px-4 py-3 cursor-pointer transition-all duration-150 border-b border-base-200/50 last:border-b-0"
                :class="[
                selectedIndex === index
                  ? 'bg-primary/20 ring-2 ring-primary/30'

                  : 'hover:bg-primary/5'
              ]"
                @mouseover="handleMouseOver(index)"
                @click="selectItem(item.raw)"
            >
            <span
                class="text-sm text-base-content/80 block leading-relaxed"
                v-html="getHighlightedHtml(item.raw, searchRequest.keyword, selectedIndex === index)"
            ></span>
            </div>
            <div v-if="results.length === 0" class="px-4 py-3 text-base-content/50 text-center text-sm">
              ">
              没有找到结果
            </div>
          </div>
        </div>

        <button @click="searchInfo" class="svg-hover mx-2">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" >
            <path fill="#999999" d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14" />
          </svg>
        </button>

        <!-- User Dropdown -->
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar mr-2">
            <div class="rounded-full">
              <img v-if="useStore.loginUser.avatar" :src="useStore.loginUser.avatar" alt="User Avatar" @dragstart.prevent />
              <span v-else class="loading loading-dots loading-sm"></span>
            </div>
          </div>
          <ul tabindex="0" class="shadow menu dropdown-content bg-base-100 rounded-box w-40 mt-3 z-50" >
            <li v-if="useStore.loginUser.role === 2">
              <a href="https://admin.byteoj.com/home" target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" class="ml-4 icon" width="24" height="24" viewBox="0 0 36 36" >
                  <path fill="#000000" d="M14.68 14.81a6.76 6.76 0 1 1 6.76-6.75a6.77 6.77 0 0 1-6.76 6.75m0-11.51a4.76 4.76 0 1 0 4.76 4.76a4.76 4.76 0 0 0-4.76-4.76" />
                  <path fill="#000000" d="M16.42 31.68A2.14 2.14 0 0 1 15.8 30H4v-5.78a14.8 14.8 0 0 1 11.09-4.68h.72a2.2 2.2 0 0 1 .62-1.85l.12-.11c-.47 0-1-.06-1.46-.06A16.47 16.47 0 0 0 2.2 23.26a1 1 0 0 0-.2.6V30a2 2 0 0 0 2 2h12.7Z" />
                  <path fill="#000000" d="m33.68 23.32l-2-.61a7.2 7.2 0 0 0-.58-1.41l1-1.86A.38.38 0 0 0 32 19l-1.45-1.45a.36.36 0 0 0-.44-.07l-1.84 1a7 7 0 0 0-1.43-.61l-.61-2a.36.36 0 0 0-.36-.24h-2.05a.36.36 0 0 0-.35.26l-.61 2a7 7 0 0 0-1.44.6l-1.82-1a.35.35 0 0 0-.43.07L17.69 19a.38.38 0 0 0-.06.44l1 1.82a6.8 6.8 0 0 0-.63 1.43l-2 .6a.36.36 0 0 0-.26.35v2.05A.35.35 0 0 0 16 26l2 .61a7 7 0 0 0 .6 1.41l-1 1.91a.36.36 0 0 0 .06.43l1.45 1.45a.38.38 0 0 0 .44.07l1.87-1a7 7 0 0 0 1.4.57l.6 2a.38.38 0 0 0 .35.26h2.05a.37.37 0 0 0 .35-.26l.61-2.05a7 7 0 0 0 1.38-.57l1.89 1a.36.36 0 0 0 .43-.07L32 30.4a.35.35 0 0 0 0-.4l-1-1.88a7 7 0 0 0 .58-1.39l2-.61a.36.36 0 0 0 .26-.35v-2.1a.36.36 0 0 0-.16-.35M24.85 28a3.34 3.34 0 1 1 3.33-3.33A3.34 3.34 0 0 1 24.85 28" />
                  />
                  <path fill="none" d="M0 0h36v36H0z" />
                </svg>
                管理中心
              </a>
            </li>
            <li v-if="useStore.loginUser.role && useStore.loginUser.role !== ACCESS_ENUM.NOT_LOGIN">
              <router-link to="/user">
                <svg t="1711427146368" class="ml-4 icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4889" width="24" height="24" >
                  <path d="M919.256367 971.476126c-19.278038 0-34.907718-15.628656-34.907718-34.907718 0-205.311569-167.032985-372.344554-372.344554-372.344554-205.310545 0-372.34353 167.032985-372.34353 372.344554 0 19.279062-15.628656 34.907718-34.906694 34.907718s-34.906694-15.628656-34.906694-34.907718c0-59.676214 11.694613-117.585077 34.761292-172.120003 22.271065-52.655964 54.14787-99.939227 94.743669-140.534002 40.595799-40.595799 87.878037-72.472604 140.535026-94.743669 54.533902-23.065655 112.442765-34.761292 172.118979-34.761292 59.676214 0 117.585077 11.694613 172.120003 34.761292 52.655964 22.271065 99.939227 54.14787 140.534002 94.743669 40.595799 40.595799 72.472604 87.878037 94.743669 140.534002 23.065655 54.533902 34.761292 112.443789 34.761292 172.120003C954.164085 955.84747 938.536453 971.476126 919.256367 971.476126zM512.254965 564.4737c-68.380872 0-132.665916-26.625954-181.012045-74.973107-48.347153-48.347153-74.974131-112.632197-74.974131-181.013069 0-68.371656 26.625954-132.653629 74.973107-181.003854 48.350225-48.353297 112.635269-74.983347 181.013069-74.983347 68.378824 0 132.664892 26.629026 181.014093 74.983347 48.347153 48.350225 74.973107 112.632197 74.973107 181.003854 0 68.380872-26.626978 132.665916-74.974131 181.013069S580.635837 564.4737 512.254965 564.4737zM512.254965 122.315759c-102.654761 0-186.171765 83.51598-186.171765 186.171765 0 102.654761 83.517004 186.171765 186.171765 186.171765 102.655784 0 186.171765-83.517004 186.171765-186.171765C698.42673 205.831739 614.91075 122.315759 512.254965 122.315759z" fill="#272636" p-id="4890" ></path>
                </svg>
                个人中心
              </router-link>
            </li>
            <li v-if="useStore.loginUser.role && useStore.loginUser.role !== ACCESS_ENUM.NOT_LOGIN">
              <button @click.prevent="logout">
                <svg t="1711436415500" class="ml-4 icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4681" width="24" height="24" >
                  >
                  <path d="M599.36 643.36V786.4c0 17.792-14.304 32.224-31.936 32.224H114.88c-17.632 0-31.936-14.432-31.936-32.224V237.6c0-17.792 14.304-32.224 31.936-32.224h452.544c17.632 0 31.936 14.432 31.936 32.224v143.04h-64.544v-78.048c0-13.568-10.72-24.608-23.936-24.608H171.488c-13.248 0-23.968 11.008-23.968 24.608v418.816c0 13.568 10.72 24.576 23.968 24.576H510.88c13.216 0 23.936-11.008 23.936-24.576V643.36h64.544z m295.392-163.936H322.464v72.384h572.288v-72.352z m46.336 28.992L752 319.296l-55.52 55.52L885.6 563.904l55.488-55.488z m-55.52-52.448L692.352 649.184l55.52 55.52 193.184-193.216-55.488-55.52z" fill="#2c2c2c" p-id="4682" ></path>
                </svg>
                退出登陆
              </button>
            </li>
            <li v-if="!useStore.loginUser.role || useStore.loginUser.role === ACCESS_ENUM.NOT_LOGIN">
              <router-link to="/user/login">
                <svg t="1711436415500" class="ml-4 icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4681" width="24" height="24" >
                  >
                  <path d="M599.36 643.36V786.4c0 17.792-14.304 32.224-31.936 32.224H114.88c-17.632 0-31.936-14.432-31.936-32.224V237.6c0-17.792 14.304-32.224 31.936-32.224h452.544c17.632 0 31.936 14.432 31.936 32.224v143.04h-64.544v-78.048c0-13.568-10.72-24.608-23.936-24.608H171.488c-13.248 0-23.968 11.008-23.968 24.608v418.816c0 13.568 10.72 24.576 23.968 24.576H510.88c13.216 0 23.936-11.008 23.936-24.576V643.36h64.544z m295.392-163.936H322.464v72.384h572.288v-72.352z m46.336 28.992L752 319.296l-55.52 55.52L885.6 563.904l55.488-55.488z m-55.52-52.448L692.352 649.184l55.52 55.520 193.184-193.216-55.488-55.52z" :fill="darkTheme === 'ByteOJDark' ? '#ffffff' : '#2c2c2c'" p-id="4682" ></path>
                </svg>
                登陆/注册
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.svg-hover:hover {
  path {
    fill: rgba(2, 132, 199, 0.99);
  }
}
.bg-base-100 {
  padding: 0;
}
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.menu-vertical {
  padding: 1rem;
}
/* Dropdown menu styles */
.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 50;
  min-width: 200px;
  margin-top: 0.5rem;
  animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Ensure dropdown menu appears above other elements */
.dropdown {
  position: relative;
}
/* 更多按钮和箭头的过渡效果 */
.dropdown svg {
  transition: transform 0.2s ease-in-out;
}
/* 添加点击状态样式 */
.dropdown-open > div {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
}
.disabled {
  pointer-events: none;
  opacity: 0.6;
  cursor: not-allowed;
  /* 其他你想要的禁用样式 */
}

/* 搜索输入框美化 */
.search-input {
  @apply input input-bordered w-48 sm:w-64 lg:w-80 rounded-xl border-base-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200;
  background-color: rgb(var(--fallback-b1,oklch(var(--b1)/1)));
}

/* 搜索高亮 - 加强优先级 */
.autocomplete :deep(.highlight) {
  color: #e74c3c !important;
  font-weight: 700 !important;
  background-color: #fee2e2 !important;
  padding: 2px 4px !important;
  border-radius: 4px !important;
}

/* 选中项的特殊样式 */
.autocomplete-item {
  transition: all 0.15s ease-in-out;
}

/* 确保下拉不被遮挡 */
.autocomplete {
  z-index: 50; /* 已用Tailwind z-50 */
}
</style>