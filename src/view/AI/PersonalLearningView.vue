<template>
  <div class="ai-engine-page">
    <!-- 浅色梦幻背景（保留你喜欢的漩涡山脉，但调亮） -->
    <div class="bg-overlay"></div>
    <div class="bg-mask"></div>

    <div class="content">
      <!-- 标题 -->
      <header class="engine-header">
        <h1 class="title">ByteOJ AI</h1>
        <p class="subtitle">个性化学习路径智能推荐引擎</p>
        <p class="desc">基于您的选择，系统自动分析并生成专属学习路径报告</p>
      </header>

      <!-- 预设标签选择（单选） -->
      <div class="tag-selector">
        <div class="tags-grid">
          <label
              v-for="tag in presetTags"
              :key="tag.value"
              class="tag-card"
              :class="{ active: selectedTag === tag.value }"
          >
            <input
                type="radio"
                v-model="selectedTag"
                :value="tag.value"
                name="learning-tag"
                hidden
            />
            <div class="tag-inner">
              <span class="tag-icon">{{ tag.icon }}</span>
              <span class="tag-name">{{ tag.name }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- 生成按钮 -->
      <button
          class="generate-btn"
          :disabled="!selectedTag"
          @click="generatePath"
      >
        生成我的专属路径
      </button>

      <!-- 结果展示 -->
      <div v-if="result" class="result-panel">
        <div class="report-header">推荐学习路径报告</div>
        <div class="report-content">
          <MarkdownView :generate-data="result" />
        </div>
      </div>

      <!-- 加载 -->
      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MarkdownView from '@/view/Markdown/MarkdownView.vue'
import {error} from "echarts/types/src/util/log";

const selectedTag = ref<string | null>(null)
const result = ref<string>('')
const loading = ref(false)

const presetTags = ref([
  { value: '计算机考研408', name: '计算机考研408', icon: '📚' },
  { value: '考研数学', name: '考研数学一/二/三', icon: '√' },
  { value: '四六级备考', name: '英语四六级', icon: '🇬🇧' },
  { value: '算法入门', name: '算法入门/刷题', icon: '💻' },
  { value: '软件测试师', name: '软件测试师入门', icon: '🧪' },
  { value: '全栈工程师', name: '全栈开发工程师', icon: '🌐' },
  { value: '数据分析师', name: '数据分析自学', icon: '📊' },
  { value: '产品经理', name: '产品经理入门', icon: '🚀' },
  { value: '蓝桥杯', name: '蓝桥杯竞赛', icon: '🏆' },
  { value: '教师资格证', name: '教师资格证笔试', icon: '🧑‍🏫' },
])

// 处理 SSE 数据流
const handleSSEData = async (
    reader: ReadableStreamDefaultReader<Uint8Array>
) => {
  const decoder = new TextDecoder();
  let buffer = "";
  let flag = ref(1);

  while (true) {

    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // 保留不完整的行

    for (const line of lines) {
      if (line.startsWith("data:")) {
        const payload = line.slice(5).trim(); // 去掉 "data:"

        // 处理流结束信号
        if (payload === "[DONE]") {
          return;
        }

        try {

          const data = JSON.parse(payload);
          if (data.content !== undefined) {

            // ✅ 直接更新响应式变量，触发 UI 重渲染
            result.value += data.content;
            if (result.value.includes("[DONE]") && flag.value == 1) {
              result.value = "";
              flag.value += 1;
            } else if (result.value.includes("[DONE]")) {
              result.value = result.value.split("[DONE]")[0];
            }
          }
        } catch (err) {
          console.error("Failed to parse SSE payload:", payload, err);
          // 可选择继续或中断，通常建议记录日志但不停止
        }
      }
    }
  }
};

const generatePath = async () => {
  if (!selectedTag.value) return
  loading.value = true
  result.value = ''

  try {
    let requestBody = {
      messageList: [],
      model: "deepseek-v3-tenCloud", // 使用当前选中的模型状态
      status: 2,
      code: selectedTag.value,
    } as any;
    // const response: any = await fetch("http://localhost:7091/api/ai/ask", {
    const response: any = await fetch("https://www.byteoj.com/api/ai/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: document.cookie, // 添加 Cookie 到请求头
      },
      body: JSON.stringify(requestBody),
      credentials: "include", // 确保发送跨域请求时包含 Cookie
    });
    const reader = response.body?.getReader();
    loading.value = false;
    await handleSSEData(reader); // 处理 SSE 数据流
  } catch {
    result.value = '系统错误，请刷新重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 白色主题核心变量 */
:root {
  --bg: #f8fcff;
  --card: rgba(255, 255, 255, 0.85);
  --border: rgba(0, 198, 255, 0.2);
  --primary: #00c6ff;
  --primary-dark: #0099cc;
  --text: #1a2a44;
  --text-light: #4a6a8a;
}

.ai-engine-page {
  position: relative;
  min-height: 100vh;
  background: #f9fcff;  /* 纯白底，防透 */
  color: #1a2a44;
  overflow: hidden;
  font-family: system-ui, sans-serif;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80') center/cover no-repeat;
  opacity: 0.09;  /* 压到极低，避免抢镜 */
  filter: brightness(1.4) blur(3px);  /* 更亮更柔和 */
  z-index: 1;
}

.bg-mask {  /* 新增遮罩层，让背景不那么透 */
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(249, 252, 255, 0.85), rgba(249, 252, 255, 0.92));
  z-index: 2;
  pointer-events: none;
}

.content {
  position: relative;
  z-index: 3;
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 2rem 4rem;
  text-align: center;
}

.engine-header {
  margin-bottom: 4rem;
}

.title {
  font-size: 4.5rem;
  font-weight: 800;
  background: linear-gradient(90deg, #00b4ff, #00d4cc);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 0.5rem;
}
.subtitle {
  font-size: 1.8rem;
  color: var(--text);
  margin: 0.8rem 0;
  font-weight: 500;
}

.desc {
  font-size: 1.2rem;
  color: var(--text-light);
  max-width: 800px;
  margin: 1rem auto 0;
}

.tag-selector {
  margin: 3rem 0;
}

.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

/* 卡片 - 纯白 + 阴影 + 浅蓝边框，不再玻璃态 */
.tag-card {
  cursor: pointer;
  border-radius: 1.2rem;
  overflow: hidden;
  transition: all 0.35s ease;
  background: #ffffff;          /* 纯白，不透明 */
  border: 1px solid rgba(0, 180, 255, 0.18);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
}
.tag-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 50px rgba(0, 180, 255, 0.15);
  border-color: rgba(0, 180, 255, 0.4);
}

.tag-card.active {
  border-color: #00b4ff;
  box-shadow: 0 0 40px rgba(0, 180, 255, 0.25);
  background: linear-gradient(to bottom, rgba(0, 180, 255, 0.03), #ffffff);
}

.tag-inner {
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.tag-icon {
  font-size: 3rem;
}

.tag-name {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--primary-dark);
}

.generate-btn {
  margin-top: 3rem;
  padding: 1.2rem 4rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #00b4ff, #00d4cc);
  border: none;
  border-radius: 3rem;
  box-shadow: 0 10px 30px rgba(0, 180, 255, 0.25);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 16px 48px rgba(0, 198, 255, 0.4);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 结果面板 */
.result-panel {
  margin-top: 5rem;
  padding: 2.5rem;
  background: #ffffff;
  border-radius: 1.2rem;
  border: 1px solid rgba(0, 180, 255, 0.12);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}/* 强制统一 Markdown 内容样式 */
.report-content :deep(*) {
  font-size: 2rem !important;
  line-height: 1.8 !important;
  color: var(--text) !important;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
}

.report-content :deep(h1),
.report-content :deep(h2),
.report-content :deep(h3),
.report-content :deep(h4) {
  margin-top: 2em !important;
  margin-bottom: 0.8em !important;
  font-weight: 700 !important;
  color: var(--primary-dark) !important;
  text-align: left !important;
}

.report-content :deep(h1) {
  font-size: 2.2rem !important;
  border-bottom: 2px solid var(--border) !important;
  padding-bottom: 0.5rem !important;
}

.report-content :deep(h2) {
  font-size: 1.7rem !important;
  border-bottom: 1px solid var(--border) !important;
  padding-bottom: 0.3rem !important;
}

.report-content :deep(p) {
  margin: 1.2em 0 !important;
  text-indent: 2em !important; /* 中文首行缩进 */
  text-align: left !important;
}

.report-content :deep(ul),
.report-content :deep(ol) {
  padding-left: 2rem !important;
  margin: 1.2em 0 !important;
}

.report-content :deep(li) {
  margin: 0.6em 0 !important;
  text-align: left !important;
}

.report-content :deep(code) {
  background: rgba(0, 198, 255, 0.1) !important;
  padding: 0.2em 0.4em !important;
  border-radius: 4px !important;
  font-family: monospace !important;
}

.report-content :deep(pre) {
  background: #f8fbff !important;
  border: 1px solid var(--border) !important;
  border-radius: 8px !important;
  padding: 1rem !important;
  overflow-x: auto !important;
  font-size: 0.95rem !important;
}
.report-header {
  font-size: 2.2rem;
  color: var(--primary-dark);
  margin-bottom: 1.8rem;
  text-align: center;
  font-weight: 700;
}

/* 加载 */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(249, 252, 255, 0.92);
  backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 5px solid rgba(0, 198, 255, 0.2);
  border-top: 5px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.2rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>