<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/preview.css";
import { ElMessage } from "element-plus";

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

// Mock data for a single log
const mockOperationLog = {
  id: 1,
  username: "管理员",
  userId: "admin001",
  operation: "登录系统",
  description: "用户从IP地址192.168.1.1登录系统",
  ip: "192.168.1.1",
  deviceInfo: "Windows 10 / Chrome 98.0.4758.102",
  module: "认证中心",
  status: "成功",
  time: "2023-06-15 09:30:25",
  duration: "0.35秒",
  requestParams: JSON.stringify(
    { username: "admin", password: "******", rememberMe: true },
    null,
    2,
  ),
  responseData: JSON.stringify(
    {
      code: 200,
      message: "登录成功",
      data: { token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
    },
    null,
    2,
  ),
};

const mockExceptionLog = {
  id: 1,
  type: "系统错误",
  level: "ERROR",
  description: "数据库连接失败",
  module: "用户管理",
  className: "com.example.service.UserServiceImpl",
  methodName: "getUserById",
  lineNumber: 42,
  params: JSON.stringify({ userId: "user123" }, null, 2),
  stacktrace: `java.sql.SQLException: Connection refused
  at com.mysql.jdbc.SQLError.createSQLException(SQLError.java:965)
  at com.mysql.jdbc.SQLError.createSQLException(SQLError.java:898)
  at com.mysql.jdbc.SQLError.createSQLException(SQLError.java:887)
  at com.mysql.jdbc.SQLError.createSQLException(SQLError.java:861)
  at com.mysql.jdbc.ConnectionImpl.connectOneTryOnly(ConnectionImpl.java:2330)
  at com.mysql.jdbc.ConnectionImpl.createNewIO(ConnectionImpl.java:2083)
  at com.mysql.jdbc.ConnectionImpl.<init>(ConnectionImpl.java:806)
  at com.mysql.jdbc.JDBC4Connection.<init>(JDBC4Connection.java:47)
  at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)`,
  status: "未处理",
  time: "2023-06-15 08:13:27",
  ip: "192.168.1.2",
  userId: "user001",
};

// Fetch log data function (mock implementation)
const fetchLogData = () => {
  loading.value = true;

  // Simulate API call
  setTimeout(() => {
    // In a real application, we would use the logId to fetch specific log data
    // For now, we'll use our mock data
    if (logType.value === "operation") {
      logData.value = { ...mockOperationLog, id: logId.value };
    } else if (logType.value === "exception") {
      logData.value = { ...mockExceptionLog, id: logId.value };
    } else {
      // Handle invalid log type
      ElMessage.error("无效的日志类型");
      router.push("/log");
    }

    loading.value = false;
  }, 500);
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

onMounted(() => {
  fetchLogData();
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
            }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{
              logData.username
            }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{
              logData.userId
            }}</el-descriptions-item>
            <el-descriptions-item label="操作">{{
              logData.operation
            }}</el-descriptions-item>
            <el-descriptions-item label="描述">{{
              logData.description
            }}</el-descriptions-item>
            <el-descriptions-item label="模块">{{
              logData.module
            }}</el-descriptions-item>
            <el-descriptions-item label="IP地址">{{
              logData.ip
            }}</el-descriptions-item>
            <el-descriptions-item label="设备信息">{{
              logData.deviceInfo
            }}</el-descriptions-item>
            <el-descriptions-item label="操作状态">
              <el-tag :type="logData.status === '成功' ? 'success' : 'danger'">
                {{ logData.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="操作时间">{{
              logData.time
            }}</el-descriptions-item>
            <el-descriptions-item label="执行耗时">{{
              logData.duration
            }}</el-descriptions-item>
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
            }}</el-descriptions-item>
            <el-descriptions-item label="异常类型">{{
              logData.type
            }}</el-descriptions-item>
            <el-descriptions-item label="异常级别">
              <el-tag :type="logData.level === 'ERROR' ? 'danger' : 'warning'">
                {{ logData.level }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="异常描述">{{
              logData.description
            }}</el-descriptions-item>
            <el-descriptions-item label="模块">{{
              logData.module
            }}</el-descriptions-item>
            <el-descriptions-item label="类名">{{
              logData.className
            }}</el-descriptions-item>
            <el-descriptions-item label="方法名">{{
              logData.methodName
            }}</el-descriptions-item>
            <el-descriptions-item label="行号">{{
              logData.lineNumber
            }}</el-descriptions-item>
            <el-descriptions-item label="处理状态">
              <el-tag
                :type="logData.status === '已处理' ? 'success' : 'warning'"
              >
                {{ logData.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="发生时间">{{
              logData.time
            }}</el-descriptions-item>
            <el-descriptions-item label="IP地址">{{
              logData.ip
            }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{
              logData.userId
            }}</el-descriptions-item>
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
