<!-- BlogHome.vue -->
<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <!-- 顶部导航 - 白色 -->
    <header class="fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div class="flex items-center gap-8">
          <div class="text-xl font-bold text-gray-900">{{ user.username }}</div>
          <nav class="hidden md:flex items-center gap-6 text-sm text-gray-700">
            <a href="#" class="hover:text-emerald-600 transition-colors">全部文章</a>
<!--            <a href="#" class="hover:text-emerald-600 transition-colors">分类</a>-->
<!--            <a href="#" class="hover:text-emerald-600 transition-colors">归档</a>-->
<!--            <a href="#" class="hover:text-emerald-600 transition-colors">标签</a>-->
          </nav>
        </div>
        <router-link class="flex items-center gap-4" to="/user">
          <span class="text-sm text-gray-600">去用户中心</span>
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer overflow-hidden">
            <img :src="user.avatar" alt="用户头像" class="w-full h-full object-cover" />
          </div>
        </router-link>
      </div>
    </header>

    <div class="pt-14 flex">
      <!-- 左侧栏 -->
      <aside class="fixed left-0 top-14 bottom-0 w-80 md:w-72 bg-white border-r border-gray-200 shadow-md overflow-y-auto"
             :class="{ 'translate-x-0': sidebarVisible, '-translate-x-full': !sidebarVisible }"
             style="transition: transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)">
        <div class="p-6 flex flex-col gap-12 pt-4">
          <!-- 返回按钮 -->
          <router-link to="/" class="flex items-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>返回ByteOJ</span>
          </router-link>

          <!-- 头像 + 信息 -->
          <div class="flex flex-col items-center text-center gap-3">
            <div class="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-lg ring-2 ring-purple-200 ring-offset-2 ring-offset-white">
              <img :src="user.avatar" alt="用户头像" class="w-full h-full object-cover" />
            </div>
            <div>
              <div class="font-semibold text-gray-900 text-lg">{{ user.username }}</div>
              <div class="text-sm text-gray-500 mt-1">ByteOJ & 个人博客中心</div>
            </div>
          </div>

          <!-- 介绍文字 -->
          <div class="space-y-8 text-sm text-gray-700 leading-relaxed">
            <div v-for="(item, i) in introTexts" :key="i"
                 class="opacity-0 translate-y-4"
                 :class="`animate-[fadeInUp_0.8s_${i*0.2}s_forwards]`">
              {{ item }}
            </div>
          </div>

          <!-- 底部链接 -->
          <div class="mt-auto pt-12 text-xs text-gray-500 flex flex-wrap justify-center gap-4">
            <a href="#" class="hover:text-emerald-600 transition-colors">关于博主</a>
            <span>|</span>
            <a href="#" class="hover:text-emerald-600 transition-colors">意见反馈</a>
            <span>|</span>
            <a href="#" class="hover:text-emerald-600 transition-colors">免责声明</a>
            <div class="w-full text-center mt-2">
              <router-link to="/" class="hover:text-emerald-600 transition-colors">ByteOJ 首页</router-link>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主内容区 - 右侧帖子列表区域更窄 -->
      <main class="flex-1 max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-16">  <!-- max-w-4xl 比原来的 max-w-5xl 窄，视觉更紧凑 -->
        <!-- 欢迎标题区域 -->
        <div class="text-center mb-16 relative">
          <h1 class="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 translate-y-8"
              :class="{ 'animate-[fadeInUp_1s_0.2s_forwards]': isLoaded }">
            {{ user.username }} 的个人博客
          </h1>
          <p class="text-xl text-gray-600 mb-6 opacity-0 translate-y-8"
             :class="{ 'animate-[fadeInUp_1s_0.4s_forwards]': isLoaded }">
            长风破浪会有时，直挂云帆济沧海
          </p>
          <div class="flex justify-center gap-10 text-4xl md:text-5xl text-gray-400 opacity-80 opacity-0 translate-y-8"
               :class="{ 'animate-[fadeInUp_1s_0.6s_forwards]': isLoaded }">
            <span class="inline-block opacity-0 font-black" :class="{ 'animate-[fadeIn_0.8s_0.8s_forwards]': isLoaded }">B</span>
            <span class="inline-block opacity-0" :class="{ 'animate-[fadeIn_0.8s_1s_forwards]': isLoaded }">Ø</span>
            <span class="inline-block opacity-0 font-black" :class="{ 'animate-[fadeIn_0.8s_1.2s_forwards]': isLoaded }">J</span>
          </div>
        </div>

        <!-- 我的帖子列表（右侧主区域） -->
        <section class="space-y-10">
          <h2 class="text-2xl font-semibold border-l-4 border-emerald-500 pl-4 text-gray-800">
            我的帖子 (共 {{ posts.length }} 篇)
          </h2>

          <!-- 分页 -->
          <div v-if="totalPages > 1" class="flex justify-center items-center gap-6 mb-8">
            <button
                @click="loadPosts(currentPage - 1)"
                :disabled="currentPage === 1 || loading"
                class="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
            >
              上一页
            </button>
            <span class="text-gray-700 font-medium text-lg">{{ currentPage }} / {{ totalPages }}</span>
            <button
                @click="loadPosts(currentPage + 1)"
                :disabled="currentPage === totalPages || loading"
                class="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
            >
              下一页
            </button>
          </div>

          <!-- 帖子卡片列表 -->
          <div v-if="posts.length > 0" class="space-y-8">
            <article
                v-for="post in posts"
                :key="post.post_id"
                class="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 p-6 transition-all duration-300 group"
            >
              <h3 class="text-xl font-medium mb-3 text-gray-900 group-hover:text-emerald-700 transition-colors">
                {{ post.title }}
              </h3>

              <div class="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed prose prose-sm" v-html="truncateContent(post.content, 200) + '...'"></div>

              <div class="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
                <span>📅 {{ formatTime(post.create_time) }}</span>
                <span>👀 {{ post.reading }}</span>
                <span>❤️ {{ post.thumbs_up }}</span>
                <span>💬 {{ post.comment_num }}</span>
                <span v-if="post.school" class="text-green-600">{{ post.school }}</span>
              </div>

              <div class="flex flex-wrap gap-2 mb-4">
                <span class="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                  {{ post.tag_first || '未分类' }}
                </span>
                <span v-for="tag in post.tag_list" :key="tag" class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {{ tag }}
                </span>
              </div>

              <div class="flex justify-end gap-4">
                <router-link :to="`/posts/${post.post_id}`" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium">
                  查看全文
                </router-link>
                <button @click="deletePost(post.post_id)" class="px-5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors text-sm font-medium">
                  移出博客
                </button>
              </div>
            </article>
          </div>

          <div v-else class="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm">
            <p class="text-xl font-medium">暂无帖子</p>
            <p class="mt-2">快去发布你的第一篇吧～</p>
          </div>
        </section>

        <!-- 底部 -->
        <footer class="mt-32 text-center py-12 text-gray-500 text-sm border-t border-gray-200">
          <p class="text-lg mb-2 text-emerald-600/90">✎ ByteOJ 博客，记录你的成长</p>
          <p>江西省南昌豫章师范学院专属 · 8989561494@qq.com</p>
        </footer>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, Ref} from 'vue'
import {PostsControllerService, SearchControllerService, SearchRequest} from "../../../generated"
import UserStore from "@/store/user"
import { useMessageBox } from "@/view/components/alert/useMessageBox"
import {useRoute, useRouter} from 'vue-router'

const route = useRoute();
const searchRequest: Ref<SearchRequest> = ref({
  category: "post",
  pageNum: parseInt(<string>route.query.pageNum ?? "1") ?? 1,
  pageSize: 10,
  status: 4
} as any);

const router = useRouter()
const { success, error } = useMessageBox()
const userStore = UserStore()
const user = ref({})
const sidebarVisible = ref(false)
const isLoaded = ref(false)
const introTexts = ref<string[]>([
  "这里是随机占位文字～",
  "后续会从后端拉取真实介绍",
  "支持 Markdown / 数学公式 / 图片插入",
  "专注算法、竞赛与编程成长",
  "日常在 ByteDance 卷 & 摸鱼"
])
const posts = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const loading = ref(false)

const loadPosts = async (page = 1) => {
  loading.value = true
  try {
    const res = await SearchControllerService.searchAllUsingPost(searchRequest.value);
    if (res.code === 0) {
      posts.value = res.data.dataList || []
      currentPage.value = page
      if (Array.isArray(res.data) && res.data.length > 0 && typeof res.data[0].pages === 'number') {
        totalPages.value = res.data[0].pages
      } else {
        totalPages.value = 1
      }
    } else {
      throw new Error(res.message || '加载失败')
    }
  } catch (err) {
    error('加载帖子失败，请稍后重试')
    posts.value = []
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

const deletePost = async (postId) => {
  if (!confirm(`确定要从当前博客移除该帖子吗？此操作不可撤销`)) return
  loading.value = true
  try {
    const res = await PostsControllerService.userDeletePostToBlogUsingPost(postId)
    if (res.code === 0) {
      success('帖子移除成功！')
      await loadPosts(currentPage.value);
    } else {
      throw new Error(res.message || '移除失败')
    }
  } catch (err) {
    error(`删除失败：${err.message || '未知错误'}`)
  } finally {
    loading.value = false
  }
}

const truncateContent = (content, length) => {
  if (!content) return ''
  if (content.length <= length) return content
  let truncated = content.slice(0, length)
  if (truncated.includes('```')) {
    truncated = truncated.split('```')[0] + '...'
  }
  return truncated
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  user.value = userStore.loginUser
  setTimeout(() => { sidebarVisible.value = true }, 400)
  setTimeout(() => { isLoaded.value = true }, 300)
  loadPosts(1)
})
</script>

<style>
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(32px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 代码块样式 */
.prose code {
  background-color: #f3f4f6;
  padding: 2px 4px;
  border-radius: 4px;
}
</style>