<script setup lang="ts">
import {onMounted, ref} from "vue";
import {PostsControllerService, SearchControllerService} from "../../../generated";
import {ElMessage, ElMessageBox} from "element-plus";
// 定义帖子数据类型
interface Post {
  post_id: number;
  title: string;
  content: string;
  author: string;
  avatar: string;
  thumbs_up: number;
  reading: number;
  school: string;
  tag_first: string;
  uuid: number;
  comment_num: number;
  tag_list: string[];
  location: string;
  is_thumbs: number;
  create_time: string;
  update_time: string | null;
  pages: number | null;
  status: number;
  url: string | null;
}

// 定义评论数据类型
interface Comment {
  comment_id: number;
  content: string;
  username: string;
  uuid: number;
  avatar: string;
  school: string;
  comment_like_count: number;
  root_comment_id: number;
  to_comment_name: string | null;
  to_comment_uuid: number | null;
  is_thumbs: number;
  create_time: string;
}

// 响应式数据
const postList = ref<Post[]>([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 评论相关
const commentDialogVisible = ref(false);
const currentPostTitle = ref('');
const currentPostId = ref(0);
const commentList = ref<Comment[][]>([]);
const commentLoading = ref(false);

// 获取帖子列表
const fetchPosts = async () => {
  loading.value = true;
  try {
    let params = {
      category: 'post',
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    }
    const res = await SearchControllerService.searchAllUsingPost(params);
    if (res.code === 0 && res.data) {
      postList.value = res.data.dataList || [];
      total.value = res.data.dataList[0].pages * pageSize.value || 0;
    } else {
      ElMessage.error('获取帖子列表失败');
    }
  } catch (error) {
    ElMessage.error('获取帖子列表出错');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 删除帖子
const handleDelete = async (postId: number, title: string) => {
  ElMessageBox.confirm(
    `确定要删除帖子"${title}"吗?此操作不可恢复!`,
    '确认删除',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await PostsControllerService.postDeleteUsingPost(postId);
      if (res.code === 0) {
        ElMessage.success('删除成功');
        // 重新加载列表
        await fetchPosts();
      } else {
        ElMessage.error('删除失败');
      }
    } catch (error) {
      ElMessage.error('删除出错');
      console.error(error);
    }
  }).catch(() => {
    // 用户取消删除
  });
};

// 分页变化处理
const handlePageChange = (page: number) => {
  pageNum.value = page;
  fetchPosts();
};

// 查看评论
const viewComments = async (postId: number, title: string) => {
  currentPostId.value = postId;
  currentPostTitle.value = title;
  commentDialogVisible.value = true;
  commentLoading.value = true;
  
  try {
    const res = await PostsControllerService.postSearchCommentByPostIdUsingPost(postId);
    if (res.code === 0) {
      commentList.value = res.data || [];
    } else {
      ElMessage.error('获取评论列表失败');
    }
  } catch (error) {
    ElMessage.error('获取评论列表出错');
    console.error(error);
  } finally {
    commentLoading.value = false;
  }
};

// 删除评论
const handleDeleteComment = async (commentId: number) => {
  ElMessageBox.confirm(
    '确定要删除此评论吗?此操作不可恢复!',
    '确认删除',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await PostsControllerService.postCommentDeleteUsingPost(commentId);
      if (res.code === 0) {
        ElMessage.success('删除成功');
        // 重新加载当前帖子的评论
        await viewComments(currentPostId.value, currentPostTitle.value);
        // 更新帖子列表中的评论数
        const post = postList.value.find(p => p.post_id === currentPostId.value);
        if (post) {
          post.comment_num = Math.max(0, post.comment_num - 1);
        }
      } else {
        ElMessage.error('删除失败');
      }
    } catch (error) {
      ElMessage.error('删除出错');
      console.error(error);
    }
  }).catch(() => {
    // 用户取消删除
  });
};

// 页面加载时获取数据
onMounted(async () => {
  await fetchPosts();
});


</script>

<template>
  <div class="post-management">
    <el-card header="帖子管理">
      <el-table
        :data="postList"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="post_id" label="ID" width="80" />
              
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
              
        <el-table-column label="作者" width="150">
          <template #default="{ row }">
            <div class="author-cell">
              <el-avatar :size="32" :src="row.avatar" />
              <span class="author-name">{{ row.author }}</span>
            </div>
          </template>
        </el-table-column>
              
        <el-table-column prop="thumbs_up" label="点赞" width="80" />
              
        <el-table-column prop="reading" label="阅读" width="80" />
              
        <el-table-column label="评论" width="80">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              @click="viewComments(row.post_id, row.title)"
            >
              {{ row.comment_num }}
            </el-button>
          </template>
        </el-table-column>
              
        <el-table-column prop="tag_first" label="标签" width="100" />
              
        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.create_time).toLocaleString('zh-CN') }}
          </template>
        </el-table-column>
              
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small"
              link
              @click="viewComments(row.post_id, row.title)"
            >
              查看评论
            </el-button>
            <el-popconfirm
              title="确定要删除此帖子吗?"
              confirm-button-text="确定"
              cancel-button-text="取消"
              confirm-button-type="danger"
              @confirm="handleDelete(row.post_id, row.title)"
            >
              <template #reference>
                <el-button type="danger" size="small" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
            
      <el-pagination
        v-model:current-page="pageNum"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
        style="margin-top: 16px; justify-content: flex-end;"
      />
    </el-card>
    
    <!-- 评论对话框 -->
    <el-dialog
      v-model="commentDialogVisible"
      :title="`评论列表 - ${currentPostTitle}`"
      width="700px"
    >
      <div v-loading="commentLoading" class="comment-container">
        <div v-if="commentList.length === 0" class="empty-comment">
          <el-empty description="暂无评论" />
        </div>
        <div v-else class="comment-list">
          <div 
            v-for="(commentGroup, index) in commentList" 
            :key="index"
            class="comment-group"
          >
            <div 
              v-for="comment in commentGroup" 
              :key="comment.comment_id"
              class="comment-item"
            >
              <div class="comment-header">
                <el-avatar :size="36" :src="comment.avatar" />
                <div class="comment-info">
                  <div class="comment-user">
                    <span class="username">{{ comment.username }}</span>
                    <span v-if="comment.school" class="school">{{ comment.school }}</span>
                  </div>
                  <div class="comment-time">
                    {{ new Date(comment.create_time).toLocaleString('zh-CN') }}
                  </div>
                </div>
                <el-popconfirm
                  title="确定要删除此评论吗?"
                  confirm-button-text="确定"
                  cancel-button-text="取消"
                  confirm-button-type="danger"
                  @confirm="handleDeleteComment(comment.comment_id)"
                >
                  <template #reference>
                    <el-button type="danger" size="small" link class="delete-btn">删除</el-button>
                  </template>
                </el-popconfirm>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              <div class="comment-footer">
                <span class="likes" style="color: #f43f5e"> <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                                  <path
                                      d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2l-1.5.5-1 2-1 4V10H6z"
                                  />
                                </svg> {{ comment.comment_like_count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>


<style scoped>
.post-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.el-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-card__body) {
  padding: 20px;
}

.author-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-name {
  color: #606266;
  font-size: 14px;
}

:deep(.el-table) {
  border-radius: 4px;
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #606266;
  font-weight: 600;
}

:deep(.el-table--border) {
  border-color: #ebeef5;
}

:deep(.el-table td) {
  padding: 12px 0;
}

:deep(.el-pagination) {
  margin-top: 16px;
}

:deep(.el-popconfirm__main) {
  font-size: 14px;
}

.comment-container {
  max-height: 500px;
  overflow-y: auto;
}

.empty-comment {
  padding: 40px 0;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-group {
  padding: 12px;
  background-color: #fafafa;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.comment-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.comment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.school {
  color: #909399;
  font-size: 12px;
}

.comment-time {
  color: #909399;
  font-size: 12px;
}

.delete-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.comment-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  padding-left: 46px;
  white-space: pre-wrap;
  word-break: break-word;
}

.comment-footer {
  padding-left: 46px;
  display: flex;
  gap: 16px;
}

.likes {
  color: #909399;
  font-size: 13px;
}
</style>