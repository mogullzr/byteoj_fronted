<script setup lang="ts">
import {onMounted, ref, computed} from "vue";
import {UserControllerService} from "../../../generated";
import {ElMessage, ElMessageBox} from "element-plus";
import {Picture, ZoomIn} from "@element-plus/icons-vue";

// 定义图片数据类型
interface Picture {
  id: number;
  picture_address: string;
  create_time: string;
  uuid: number;
}

// 响应式数据
const pictureList = ref<Picture[]>([]);
const loading = ref(false);
const previewDialogVisible = ref(false);
const currentPreviewUrl = ref('');

// 假分页相关 - 渐进式加载
const displayCount = ref(12); // 初始显示12张
const pageSize = 12; // 每次加载12张
const isLoadingMore = ref(false);

// 获取图片列表
const fetchPictures = async () => {
  loading.value = true;
  try {
    const res = await UserControllerService.userGetPictureUsingGet();
    if (res.code === 0 && res.data) {
      pictureList.value = res.data;
      displayCount.value = Math.min(12, res.data.length); // 初始最多显示12张
    } else {
      ElMessage.error('获取图片列表失败');
    }
  } catch (error) {
    ElMessage.error('获取图片列表出错');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 加载更多图片
const loadMore = () => {
  if (isLoadingMore.value || displayCount.value >= pictureList.value.length) {
    return;
  }
  
  isLoadingMore.value = true;
  // 模拟加载延迟,让用户感觉到在加载
  setTimeout(() => {
    displayCount.value = Math.min(displayCount.value + pageSize, pictureList.value.length);
    isLoadingMore.value = false;
  }, 300);
};

// 计算当前显示的图片
const displayedPictures = computed(() => {
  return pictureList.value.slice(0, displayCount.value);
});

// 是否还有更多图片
const hasMore = computed(() => {
  return displayCount.value < pictureList.value.length;
});

// 预览图片
const previewImage = (url: string) => {
  currentPreviewUrl.value = url;
  previewDialogVisible.value = true;
};

// 删除图片
const handleDelete = async (id: number) => {
  ElMessageBox.confirm(
    '确定要删除此图片吗?此操作不可恢复!',
    '确认删除',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const res = await UserControllerService.userDeleteBackgroundUsingPost(id);
      if (res.code === 0) {
        ElMessage.success('删除成功');
        // 直接从列表中移除,不重新请求
        const index = pictureList.value.findIndex(p => p.id === id);
        if (index !== -1) {
          pictureList.value.splice(index, 1);
          // 如果删除后显示数量超过当前总数,调整displayCount
          if (displayCount.value > pictureList.value.length) {
            displayCount.value = pictureList.value.length;
          }
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
  await fetchPictures();
});
</script>

<template>
  <div class="picture-management">
    <el-card header="图片管理">
      <div v-loading="loading" class="picture-grid" ref="gridContainer">
        <div v-if="displayedPictures.length === 0" class="empty-container">
          <el-empty description="暂无图片" />
        </div>
        <div 
          v-else
          v-for="picture in displayedPictures" 
          :key="picture.id"
          class="picture-item"
        >
          <div class="picture-wrapper">
            <el-image
              :src="picture.picture_address"
              fit="cover"
              class="picture-image"
              lazy
              @click="previewImage(picture.picture_address)"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>加载失败</span>
                </div>
              </template>
            </el-image>
            <div class="picture-overlay">
              <el-button 
                type="primary" 
                size="small"
                circle
                @click="previewImage(picture.picture_address)"
              >
                <el-icon><ZoomIn /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="picture-info">
            <div class="picture-time">
              {{ new Date(picture.create_time).toLocaleString('zh-CN') }}
            </div>
            <el-popconfirm
              title="确定要删除此图片吗?"
              confirm-button-text="确定"
              cancel-button-text="取消"
              confirm-button-type="danger"
              @confirm="handleDelete(picture.id)"
            >
              <template #reference>
                <el-button type="danger" size="small" link>删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>
      
      <!-- 加载更多按钮 -->
      <div v-if="hasMore" class="load-more-container">
        <el-button 
          @click="loadMore" 
          :loading="isLoadingMore"
          type="primary"
          plain
        >
          加载更多图片
        </el-button>
        <div class="load-more-info">
          已显示 {{ displayedPictures.length }} / {{ pictureList.length }} 张图片
        </div>
      </div>
    </el-card>
    
    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="图片预览"
      width="800px"
    >
      <div class="preview-container">
        <el-image
          :src="currentPreviewUrl"
          fit="contain"
          style="width: 100%"
        />
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.picture-management {
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

.picture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.empty-container {
  grid-column: 1 / -1;
  padding: 60px 0;
}

.picture-item {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}

.picture-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.picture-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  cursor: pointer;
}

.picture-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  gap: 8px;
}

.image-error .el-icon {
  font-size: 32px;
}

.picture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.picture-wrapper:hover .picture-overlay {
  opacity: 1;
}

.picture-info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.picture-time {
  font-size: 12px;
  color: #909399;
}

.preview-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.load-more-container {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.load-more-info {
  color: #909399;
  font-size: 13px;
}
</style>