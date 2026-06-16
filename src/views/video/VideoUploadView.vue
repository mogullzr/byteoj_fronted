<script setup lang="ts">
import {onMounted, ref} from "vue";
import {SearchControllerService,} from "../../../generated";
import {ElMessage} from "element-plus";
import {VideoCamera, Upload, RefreshRight} from "@element-plus/icons-vue";
import {VideoControllerService} from "../../../generated/services/VideoControllerService.ts";

// 定义题目数据类型
interface Problem {
  problem_id: number;
  chinese_name: string;
  difficulty_name: string;
  source: string;
  ac_total: number;
  test_total: number;
  algorithm_tags: string[];
  vid: string | null;
  pages: number | null;
}

// 响应式数据
const problemList = ref<Problem[]>([]);
const loading = ref(false);
const uploadDialogVisible = ref(false);
const currentProblem = ref<Problem | null>(null);
const uploading = ref(false);
const selectedFile = ref<File | null>(null);
const videoPreviewUrl = ref('');
const videoPlayer = ref<HTMLVideoElement | null>(null);
const videoError = ref(false);

// 分页相关
const currentPage = ref(1);
const pageSize = 15;
const total = ref(0);

// 获取题目列表
const fetchProblems = async () => {
  loading.value = true;
  try {
    let request = {
      category: "algorithm",
      keyword: "",
      pageNum: currentPage.value,
      pageSize: pageSize,
    }
    const res = await SearchControllerService.searchAllUsingPost(request);
    if (res.code === 0 && res.data) {
      problemList.value = res.data.dataList || [];
      if (problemList.value.length > 0 && problemList.value[0].pages) {
        total.value = problemList.value[0].pages * pageSize;
      }
    } else {
      ElMessage.error('获取题目列表失败');
    }
  } catch (error) {
    ElMessage.error('获取题目列表出错');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 分页变化处理
const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchProblems();
};

// 打开上传对话框
const openUploadDialog = (problem: Problem) => {
  currentProblem.value = problem;
  selectedFile.value = null;
  videoPreviewUrl.value = '';
  uploadDialogVisible.value = true;
};

// 处理文件选择
const handleFileChange = (file: any) => {
  selectedFile.value = file.raw;
  // 生成视频预览 URL
  if (file.raw) {
    // 释放之前的 URL
    if (videoPreviewUrl.value) {
      URL.revokeObjectURL(videoPreviewUrl.value);
    }
    videoPreviewUrl.value = URL.createObjectURL(file.raw);
    // 等待 DOM 更新后加载视频
    setTimeout(() => {
      if (videoPlayer.value) {
        videoPlayer.value.load();
      }
    }, 100);
  }
  return false; // 阻止自动上传
};

// 视频加载完成
const onVideoLoaded = () => {
  console.log('视频加载完成');
  videoError.value = false;
  if (videoPlayer.value) {
    videoPlayer.value.play().catch(() => {
      // 自动播放可能被浏览器阻止,忽略错误
    });
  }
};

// 视频加载错误
const onVideoError = (e: Event) => {
  console.error('视频加载错误:', e);
  videoError.value = true;
};

// 上传视频
const handleUpload = async () => {
  if (!selectedFile.value || !currentProblem.value) {
    ElMessage.warning('请先选择视频文件');
    return;
  }

  uploading.value = true;
  try {
    // 使用 FormData 上传文件
    const formData = new FormData();
    formData.append('problem_id', currentProblem.value.problem_id.toString());
    formData.append('videoFile', selectedFile.value);
    
    console.log('开始上传视频...', currentProblem.value.chinese_name);
    
    // 直接使用 fetch 发送请求,因为生成的接口可能不支持 FormData
    const response = await fetch('/api/video/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include', // 携带 Cookie
    });
    
    const res = await response.json();
    console.log('上传响应:', res);
    
    if (res.code === 0) {
      console.log('上传成功,设置 uploadSuccess = true');
      ElMessage.success('视频上传成功');
      uploadDialogVisible.value = false; // 上传成功后关闭对话框
      // 更新本地数据
      const problem = problemList.value.find(p => p.problem_id === currentProblem.value!.problem_id);
      if (problem) {
        problem.vid = 'uploaded'; // 标记为已上传
      }
    } else {
      ElMessage.error(res.message || '视频上传失败');
    }
  } catch (error) {
    ElMessage.error('视频上传出错');
    console.error(error);
  } finally {
    uploading.value = false;
  }
};

// 页面加载时获取数据
onMounted(async () => {
  await fetchProblems();
});
</script>

<template>
  <div class="video-upload">
    <el-card header="视频上传管理">
      <el-table
        :data="problemList"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="problem_id" label="ID" width="80" />
        
        <el-table-column prop="chinese_name" label="题目名称" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="difficulty_name" label="难度" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.difficulty_name === '简单' ? 'success' : row.difficulty_name === '中等' ? 'warning' : 'danger'"
              size="small"
            >
              {{ row.difficulty_name }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="source" label="来源" width="100" />
        
        <el-table-column label="通过率" width="120">
          <template #default="{ row }">
            {{ row.test_total > 0 ? ((row.ac_total / row.test_total) * 100).toFixed(1) : 0 }}%
          </template>
        </el-table-column>
        
        <el-table-column label="视频状态" width="120">
          <template #default="{ row }">
            <el-tag 
              :type="row.vid && row.vid !== '' ? 'success' : 'info'"
              size="small"
            >
              <el-icon style="margin-right: 4px;">
                <VideoCamera v-if="row.vid && row.vid !== ''" />
                <Upload v-else />
              </el-icon>
              {{ row.vid && row.vid !== '' ? '已上传' : '未上传' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              :type="row.vid && row.vid !== '' ? 'warning' : 'primary'"
              size="small"
              @click="openUploadDialog(row)"
            >
              <el-icon style="margin-right: 4px;">
                <RefreshRight v-if="row.vid && row.vid !== ''" />
                <Upload v-else />
              </el-icon>
              {{ row.vid && row.vid !== '' ? '重新上传' : '上传视频' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-pagination
        v-if="total > pageSize"
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>
    
    <!-- 上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      :title="currentProblem?.vid && currentProblem.vid !== '' ? '重新上传视频' : '上传视频'"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentProblem" class="upload-dialog">
        <el-alert
          v-if="currentProblem.vid && currentProblem.vid !== ''"
          title="该题目已有视频,上传新视频将覆盖原有视频"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 20px;"
        />
        
        <div class="problem-info">
          <h3>{{ currentProblem.chinese_name }}</h3>
          <div class="info-tags">
            <el-tag size="small">{{ currentProblem.difficulty_name }}</el-tag>
            <el-tag size="small" type="info">{{ currentProblem.source }}</el-tag>
          </div>
        </div>
        
        <!-- 视频预览 -->
        <div v-if="videoPreviewUrl" class="video-preview-container">
          <video 
            ref="videoPlayer"
            :src="videoPreviewUrl" 
            controls 
            class="preview-video"
            preload="auto"
            playsinline
            webkit-playsinline
            @loadeddata="onVideoLoaded"
            @error="onVideoError"
          />
          <div v-if="videoError" class="video-error-tip">
            视频格式不支持,但仍可上传
          </div>
        </div>
        
        <el-upload
          class="upload-area"
          drag
          action=""
          :auto-upload="false"
          :show-file-list="false"
          :limit="1"
          accept="video/*"
          @change="handleFileChange"
        >
          <div class="upload-content">
            <el-icon class="upload-icon"><Upload /></el-icon>
            <div class="upload-text">
              将视频文件拖到此处,或<em>点击上传</em>
            </div>
            <div class="upload-tip">
              支持 MP4、AVI、MOV 等视频格式
            </div>
          </div>
        </el-upload>
      </div>
      
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleUpload"
          :loading="uploading"
          :disabled="!selectedFile"
        >
          {{ uploading ? '上传中...' : '开始上传' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.video-upload {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.upload-dialog {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.problem-info {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

.problem-info h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #303133;
}

.info-tags {
  display: flex;
  gap: 8px;
}

.upload-area {
  width: 100%;
}

:deep(.el-upload-dragger) {
  padding: 40px 20px;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  font-size: 48px;
  color: #409eff;
}

.upload-text {
  font-size: 14px;
  color: #606266;
}

.upload-text em {
  color: #409eff;
  font-style: normal;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.video-preview-container {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
  max-height: 300px;
  position: relative;
}

.preview-video {
  width: 100%;
  display: block;
  max-height: 300px;
  object-fit: contain;
}

.video-error-tip {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  white-space: nowrap;
}
</style>