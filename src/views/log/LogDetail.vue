<script setup lang="ts">
import {ref, onMounted} from "vue";
import {useRouter} from "vue-router";
import {ArrowLeft} from "@element-plus/icons-vue";
import {MdPreview} from "md-editor-v3";
import "md-editor-v3/lib/preview.css";
import {ElMessage} from "element-plus";
import {LogControllerService} from "../../../generated/services/LogControllerService.ts";
import {LogGetSingleInfo} from "../../../generated/models/LogGetSingleInfo.ts";

// Define props first without depending on route
const props = defineProps({
  logType: {
    type: String,
    required: false,
    default: "",
  },
  logId: {
    type: Number,
    required: false,
    default: 0,
  },
});

const router = useRouter();

const logType = ref(props.logType); // 'operation' or 'exception'
const logId = ref(props.logId);

// Log data
const logData = ref<any>(null);
const loading = ref(true);

// 辅助函数：安全地格式化JSON字符串
const safeFormatJson = (jsonStr: string | null) => {
  if (!jsonStr) return '{}';

  try {
    // 尝试解析并重新格式化JSON
    const parsed = JSON.parse(jsonStr);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    // 如果不是有效的JSON，返回原始字符串
    return jsonStr;
  }
};

// Fetch log data function
const fetchLogData = async () => {
  loading.value = true;

  try {
    const request = {
      log_id: logId.value,
      status: logType.value
    } as LogGetSingleInfo;

    const res = await LogControllerService.logDetailInfoGetUsingGet(request);

    if (res.code === 0 && res.data) {
      const apiData = res.data;

      if (logType.value === "operation") {
        // 映射操作日志数据
        logData.value = {
          id: apiData.log_id,
          username: apiData.username,
          operation: apiData.description || '无描述',
          description: `访问 ${apiData.module} 模块的 ${apiData.url} 接口`,
          ip: apiData.ip,
          deviceInfo: '未知设备',
          module: apiData.module,
          status: apiData.code === 0 ? '成功' : '失败',
          time: apiData.create_time,
          duration: `${apiData.operation_time}ms`,
          requestParams: safeFormatJson(apiData.request_param),
          responseData: safeFormatJson(apiData.response_param)
        };
      } else if (logType.value === "exception") {
        // 映射异常日志数据
        logData.value = {
          id: apiData.log_id,
          type: '系统异常',
          level: 'ERROR',
          description: apiData.error_message?.split('\n')[0] || '未知异常',
          module: apiData.module,
          className: apiData.method?.split('(')[0] || '未知类',
          methodName: apiData.method?.split('.').pop()?.split('(')[0] || '未知方法',
          lineNumber: 0,
          params: safeFormatJson(apiData.request_param),
          stacktrace: apiData.error_message || '无堆栈信息',
          status: '未处理',
          time: apiData.create_time,
          ip: apiData.ip,
          userId: apiData.username
        };
      }
    } else {
      ElMessage.error(res.message || '获取日志详情失败');
      router.push("/log");
    }
  } catch (error) {
    ElMessage.error('请求日志详情出错');
    console.error(error);
    router.push("/log");
  } finally {
    loading.value = false;
  }
};

// Mark exception as handled
const markAsHandled = () => {
  if (logType.value !== "exception") return;

  // Simulate API call
  ElMessage.success("已标记为处理完成");
  logData.value.status = "已处理";
};

// Go back function
const goBack = () => {
  router.push("/log");
  // Also emit the back event for parent component
  emit("back");
};

const emit = defineEmits(["back"]);

onMounted(async () => {
  console.log(props);
  await fetchLogData();
});
</script>
<template>
  <div class="log-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <el-button type="primary" :icon="ArrowLeft" plain @click="goBack">
            返回
          </el-button>
          <span>{{
              logType === "operation" ? "操作日志详情" : "异常日志详情"
            }}</span>
          <div class="header-actions">
            <el-button
                v-if="logType === 'exception' && logData?.status === '未处理'"
                type="success"
                @click="markAsHandled"
            >
              标记为已处理
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="logData">
        <!-- Operation Log Details -->
        <div v-if="logType === 'operation'" class="detail-content">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="日志ID">{{
                logData.id
              }}
            </el-descriptions-item>
            <el-descriptions-item label="用户名">{{
                logData.username
              }}
            </el-descriptions-item>
            <el-descriptions-item label="操作">{{
                logData.operation
              }}
            </el-descriptions-item>
            <el-descriptions-item label="描述">{{
                logData.description
              }}
            </el-descriptions-item>
            <el-descriptions-item label="模块">{{
                logData.module
              }}
            </el-descriptions-item>
            <el-descriptions-item label="IP地址">{{
                logData.ip
              }}
            </el-descriptions-item>
            <el-descriptions-item label="设备信息">{{
                logData.deviceInfo
              }}
            </el-descriptions-item>
            <el-descriptions-item label="操作状态">
              <el-tag :type="logData.status === '成功' ? 'success' : 'danger'">
                {{ logData.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="操作时间">{{
                logData.time
              }}
            </el-descriptions-item>
            <el-descriptions-item label="执行耗时">{{
                logData.duration
              }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="section-title">请求参数</div>
          <el-card class="code-block">
            <MdPreview
                :modelValue="`\`\`\`json\n${logData.requestParams}\n\`\`\``"
                :preview-theme="'github'"
            />
          </el-card>

          <div class="section-title">响应数据</div>
          <el-card class="code-block">
            <MdPreview
                :modelValue="`\`\`\`json\n${logData.responseData}\n\`\`\``"
                :preview-theme="'github'"
            />
          </el-card>
        </div>

        <!-- Exception Log Details -->
        <div v-if="logType === 'exception'" class="detail-content">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="日志ID">{{
                logData.id
              }}
            </el-descriptions-item>
            <el-descriptions-item label="异常类型">{{
                logData.type
              }}
            </el-descriptions-item>
            <el-descriptions-item label="异常级别">
              <el-tag :type="logData.level === 'ERROR' ? 'danger' : 'warning'">
                {{ logData.level }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="异常描述">{{
                logData.description
              }}
            </el-descriptions-item>
            <el-descriptions-item label="模块">{{
                logData.module
              }}
            </el-descriptions-item>
            <el-descriptions-item label="类名">{{
                logData.className
              }}
            </el-descriptions-item>
            <el-descriptions-item label="方法名">{{
                logData.methodName
              }}
            </el-descriptions-item>
            <el-descriptions-item label="行号">{{
                logData.lineNumber
              }}
            </el-descriptions-item>
            <el-descriptions-item label="处理状态">
              <el-tag
                  :type="logData.status === '已处理' ? 'success' : 'warning'"
              >
                {{ logData.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="发生时间">{{
                logData.time
              }}
            </el-descriptions-item>
            <el-descriptions-item label="IP地址">{{
                logData.ip
              }}
            </el-descriptions-item>
            <el-descriptions-item label="用户ID">{{
                logData.userId
              }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="section-title">请求参数</div>
          <el-card class="code-block">
            <MdPreview
                :modelValue="`\`\`\`json\n${logData.params}\n\`\`\``"
                :preview-theme="'github'"
            />
          </el-card>

          <div class="section-title">堆栈信息</div>
          <el-card class="code-block">
            <MdPreview
                :modelValue="`\`\`\`java\n${logData.stacktrace}\n\`\`\``"
                :preview-theme="'github'"
            />
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.log-detail {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 48px);
}

.el-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.el-card:hover {
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.card-header span {
  font-size: 20px;
  font-weight: bold;
  margin-left: 20px;
  color: #303133;
  position: relative;
  background: linear-gradient(90deg, #303133, #606266);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-actions {
  margin-left: auto;
}

.detail-content {
  padding: 15px 5px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-top: 24px;
  margin-bottom: 12px;
  padding: 5px 10px;
  border-left: 4px solid #409eff;
  background-color: #ecf5ff;
  border-radius: 0 4px 4px 0;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 美化描述列表 */
:deep(.el-descriptions) {
  margin-bottom: 20px;
}

:deep(.el-descriptions__header) {
  margin-bottom: 15px;
}

:deep(.el-descriptions__title) {
  font-weight: bold;
  color: #303133;
}

:deep(.el-descriptions__body) {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-descriptions-item__label) {
  font-weight: bold;
  color: #606266;
  background-color: #f5f7fa;
}

:deep(.el-descriptions-item__content) {
  color: #303133;
}

.code-block {
  background-color: #ffffff;
  padding: 0;
  overflow: hidden;
}

/* 覆盖markdown预览的默认样式 */
.code-block :deep(.md-editor-preview) {
  padding: 0;
  background-color: transparent;
}

.code-block :deep(.md-editor-preview pre) {
  margin: 0;
  border-radius: 0;
}

.code-block :deep(.md-editor-preview code) {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro",
  monospace;
}
</style>
