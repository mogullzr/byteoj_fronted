<template>
  <div class="my-posts-page rounded-xl">
    <main class="main-content rounded-xl">
      <div class="user-header">
        <h1 style="font-weight: bold">我的帖子</h1>
        <div class="post-stats">
          <span>我的帖子</span>
          <span>标签</span>
        </div>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button @click="loadPosts(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">上一页</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="loadPosts(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn">下一页</button>
      </div>

      <div class="posts-list" v-if="posts.length > 0">
        <div v-for="post in posts" :key="post.post_id" class="post-card">
          <h2 class="post-title">{{ post.title }}</h2>
          <div class="post-content" v-html="truncateContent(post.content, 300) + '...'"></div>

          <div class="post-meta">
            <span class="author">{{ post.author }}</span>
            <span class="school">{{ post.school }}</span>
            <span v-if="post.location" class="location">{{ post.location }}</span>
            <span class="reading">阅读 {{ post.reading }}</span>
            <span class="thumbs">点赞 {{ post.thumbs_up }}</span>
            <span class="comments">评论 {{ post.comment_num }}</span>
            <span class="time">{{ formatTime(post.create_time) }}</span>
          </div>

          <div class="tags">
            <span class="tag primary">{{ post.tag_first }}</span>
            <span v-for="tag in post.tag_list" :key="tag" class="tag">{{ tag }}</span>
          </div>

          <div class="actions">
            <button @click="addPost(post.post_id)" class="add-btn">加入至个人博客</button>
            <button @click="viewPost(post.post_id)" class="view-btn">查看</button>
            <button @click="deletePost(post.post_id)" class="delete-btn">删除</button>
          </div>
        </div>
      </div>

      <div v-else class="no-posts">
        <p>暂无帖子</p>
      </div>

      <div class="pagination" v-if="totalPages > 1">
        1">
        <button @click="loadPosts(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">上一页</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button @click="loadPosts(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn">下一页</button>
      </div>
    </main>
    <!-- 自定义确认弹窗 -->
    <ConfirmDialog
        v-model:visible="showConfirmModal"
        title="删除确认"
        :message="confirmMessage"
        confirmText="删除"
        danger
        :loading="deleting"
        :confirm-loading="deleting"
        @confirm="handleDeleteConfirm"
        @cancel="handleDeleteCancel"
    />
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import {PostsControllerService} from "../../../generated";
import { useMessageBox } from "@/view/components/alert/useMessageBox";
import ConfirmDialog from "@/view/components/alert/ConfirmDialog.vue";
import {userMessage} from "@/view/components/alert/userMessage";

const { success, error, warning } = useMessageBox();

const posts = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const loading = ref(false)
const deleting = ref(false)
const showConfirmModal = ref(false)
const selectedPost = ref(null)

const confirmMessage = computed(() => {
  if (!selectedPost.value) return ''
  return `确定要删除帖子${selectedPost.value.title}」吗？此操作不可撤销，所有相关的评论和数据都将被永久删除。`
})

// 显示删除确认弹窗
const showDeleteConfirm = (post) => {
  selectedPost.value = post
  showConfirmModal.value = true
}

// 确认删除
const handleDeleteConfirm = async () => {
  if (!selectedPost.value) return

  deleting.value = true

  try {
    const res = await PostsControllerService.postDeleteUsingPost(selectedPost.value.post_id)

    if (res.data === true) {
      success('帖子删除成功！')

      // 从列表中移除被删除的帖子
      const index = posts.value.findIndex(p => p.post_id === selectedPost.value.post_id)
      if (index !== -1) {
        posts.value.splice(index, 1)
      }

      // 如果当前页没有帖子了，尝试加载前一页
      if (posts.value.length === 0 && currentPage.value > 1) {
        await loadPosts(currentPage.value - 1)
      }
    } else {
      throw new Error(res.message || '删除失败')
    }
  } catch (err) {
    console.error('删除帖子失败:', err)
    error(`删除失败：${err.message || '未知错误'}`)
  } finally {
    deleting.value = false
    showConfirmModal.value = false
    selectedPost.value = null
  }
}

// 取消删除
const handleDeleteCancel = () => {
  showConfirmModal.value = false
  selectedPost.value = null
}

const loadPosts = async (pageNum = 1) => {
  loading.value = true
  try {
    const res = await PostsControllerService.postSearchByPageUsingPost("user", pageNum);
    if (res.code === 0) {
      posts.value = res.data || []
      currentPage.value = pageNum

      // 🔥 关键修改：从第一条数据中取 pages（如果存在）
      let total = 1
      if (Array.isArray(res.data) && res.data.length > 0 && typeof res.data[0].pages === 'number') {
        total = res.data[0].pages
      }
      totalPages.value = total
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
  userMessage({
    title: '提交离开比赛',
    content: '确认之后你将无法再进入该页面，你确定？',
    confirmText: '确认',
    onConfirm: async () => {
      try {
        const res = await PostsControllerService.postDeleteUsingPost(postId)
        if (res.data === true) {
          success('删除成功！')

          // 💡 关键逻辑：删除后重新加载当前页
          const current = currentPage.value
          await loadPosts(current)

          // 🔥 如果当前页变空了，且不是第一页，则跳回上一页
          if (posts.value.length === 0 && current > 1) {
            await loadPosts(current - 1)
          }
          // 如果是第一页也空了，那就保持空状态（合理）
        } else {
          error(res.message || '删除失败')
        }
      } catch (error) {
        error(error.message || '删除失败')
      }
    },
    onCancel: () => {
      console.log('取消删除');
    }
  });
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
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const addPost = async (postId) => {
  const res = await PostsControllerService.userAddPostToBlogUsingPost(postId);
  if (res.code === 0) {
    success('加入博客成功');
    posts.value = posts.value.filter(post => post.post_id !== postId)
  } else {
    error(res.message);
  }
}
const viewPost = (postId) => {
  window.location.href = `/posts/${postId}`
}

onMounted(() => {
  loadPosts(currentPage.value)
})
</script>

<style scoped>
/* 极简风格样式 */
.my-posts-page {
  width: 710px;
  background-color: #f5f7fa; /* 浅灰背景 */
  min-height: 100vh;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #333;
}

.main-content {
  width: 710px;
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 头部样式 */
.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0; /* 细灰色下划线 */
}

.user-header h1 {
  font-size: 20px;
  color: #333;
  margin: 0;
  font-weight: 500;
}

.post-stats {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 15px 0;
  padding: 10px;
  background: #fafafa;
  border-radius: 6px;
}

.page-btn {
  background: #f2f2f2;
  color: #666;
  border: 1px solid #e0e0e0;
  padding: 6px 18px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #e8e8e8;
}

.page-btn:disabled {
  background: #f9f9f9;
  color: #ccc;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
}

/* 当前页按钮高亮 */
.page-btn.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

/* 帖子列表样式 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-card {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 20px;
  background: white;
  transition: box-shadow 0.2s ease;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.post-title {
  font-size: 18px;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.4;
  font-weight: 500;
}

.post-content {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 15px;
  word-wrap: break-word;
}

/* 代码块样式优化 */
.post-content pre, .post-content code {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.post-content pre {
  background: #f8f8f8;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 10px;
  overflow-x: auto;
  margin: 10px 0;
  color: #333;
}

.post-content code {
  background: #f2f2f2;
  padding: 2px 4px;
  border-radius: 2px;
  color: #d4380d;
}

/* 元数据样式 */
.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 13px;
  color: #888;
  margin-bottom: 12px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
}

.author {
  color: #409eff;
  font-weight: 500;
}

.school {
  color: #52c41a;
}

/* 标签样式 */
.tags {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.tag {
  background: #f2f2f2;
  color: #666;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.tag.primary {
  background: #e6f7ff;
  color: #1890ff;
}

/* 按钮样式 */
.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.thumbs-btn, .view-btn, .add-btn {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.thumbs-btn {
  background: white;
  color: #666;
  border: 1px solid #e0e0e0;
}

.thumbs-btn:hover {
  background: #f5f5f5;
}

.thumbs-btn.active {
  background: #fff2e8;
  color: #fa8c16;
  border-color: #ffd5b5;
}

.add-btn {
  background: #0b957e;
  color: white;
  border: none;                 /* 去掉那条没用的浅灰边框 */
  border-radius: 6px;           /* 建议加个圆角，现代感强 */
  padding: 10px 16px;
  font-weight: 500;
  transition: all 0.2s ease;    /* 平滑过渡 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.add-btn:hover {
  background: #097c6a;         /* 变深一点，更有“按下去”的感觉 */
  transform: translateY(-1px); /* 轻微浮起，很讨喜 */
  box-shadow: 0 4px 12px rgba(0,0,0,0.18);
}

.add-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
}

.view-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
}

.view-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #e0e0e0;
}

.view-btn:hover {
  background: #e9e9e9;
}

/* 无帖子样式 */
.no-posts {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 15px;
  background: #fafafa;
  border-radius: 6px;
  margin: 15px 0;
}


.delete-btn {
  background: #ffeaea;
  color: #dc3545;
  border: 1px solid #ffcdd2;
  padding: 6px 24px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 19px;
  transition: all 0.23s ease;
}

.delete-btn:hover {
  background: #fdcccc;
  transform: scale(1.04);
}
</style>