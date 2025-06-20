<template>
  <div class="chat-container">
    <!-- 模型切换下拉菜单 -->
    <div class="header-section">
      <div class="model-selector">
        <label for="model-select" class="model-label">AI MODEL</label>
        <select
          id="model-select"
          v-model="selectedModel"
          @change="updateModel"
          class="model-select"
        >
          <option value="deepseek-ai/DeepSeek-R1-Distill-Llama-70B">
            DeepSeek Reasoner
          </option>
          <option value="deepseek-chat">DeepSeek V3 线路一</option>
          <option value="deepseek-ai/DeepSeek-V3">DeepSeek V3 线路二</option>
        </select>
      </div>
      <div class="tech-badge">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 15C10.3431 15 9 13.6569 9 12H15C15 13.6569 13.6569 15 12 15Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span>ByteOJ AI</span>
      </div>
    </div>

    <!-- 常见问题按钮组 -->
    <div v-if="route.path != '/chatbot' && !isLoading" class="quick-questions">
      <div
        v-for="(question, index) in quickQuestions"
        :key="index"
        @click="fillInput(question)"
        class="quick-question-item"
      >
        <button class="quick-question-button">
          <span class="question-icon">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 17H12.01"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="question-text">{{ question }}</span>
          <span class="tech-arrow"></span>
        </button>
      </div>
    </div>

    <div class="chat-output" ref="chatOutput">
      <div class="circuit-bg"></div>
      <!-- 聊天记录 -->
      <div v-if="chatHistory.length > 0" class="message-container">
        <div
          v-for="(message, index) in chatHistory"
          :key="index"
          :class="[
            'message-wrapper',
            message.role === 'user' ? 'user-wrapper' : 'ai-wrapper',
          ]"
        >
          <!-- AI 头像 -->
          <div
            v-if="message.role === 'system'"
            class="avatar-container ai-avatar"
          >
            <img
              src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502121127266.jpg"
              alt="ByteOJ出品"
              class="avatar"
            />
            <div class="avatar-glow"></div>
          </div>
          <!-- 消息内容 -->
          <div
            :class="[
              'message',
              message.role === 'user' ? 'user-message' : 'ai-message',
            ]"
          >
            <div class="tech-corner top-left"></div>
            <div class="tech-corner top-right"></div>
            <div class="tech-corner bottom-left"></div>
            <div class="tech-corner bottom-right"></div>
            <div class="message-content">
              <span v-if="message.role === 'user'">{{ message.content }}</span>
              <MarkdownView
                v-else
                :generate-data="message.content"
                class="p-0"
              />
            </div>
          </div>
          <!-- 用户头像 -->
          <div
            v-if="message.role === 'user'"
            class="avatar-container user-avatar"
          >
            <img
              :src="useStore.loginUser.avatar"
              alt="ByteOJ用户"
              class="avatar"
            />
            <div class="avatar-ring"></div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-indicator">
        <div class="tech-spinner">
          <div class="spinner-circle"></div>
          <div class="spinner-line line-1"></div>
          <div class="spinner-line line-2"></div>
          <div class="spinner-line line-3"></div>
          <div class="spinner-line line-4"></div>
        </div>
        <span class="loading-text">AI PROCESSING</span>
      </div>

      <!-- 空白状态 -->
      <div v-if="!isLoading && chatHistory.length === 0" class="empty-state">
        <div class="empty-icon-container">
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M10.5 8.67001V15.33C10.5 15.61 10.69 15.84 10.96 15.93C11.23 16.02 11.52 15.93 11.7 15.71L14.2 12.52C14.42 12.24 14.42 11.76 14.2 11.48L11.7 8.29001C11.52 8.07001 11.23 7.98 10.96 8.07C10.69 8.16 10.5 8.39 10.5 8.67001Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <p class="status-text">请输入你的问题</p>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="input-wrapper">
      <div class="tech-frame"></div>
      <div class="input-container">
        <div class="input-prefix">></div>
        <input
          v-model="currentChat.content"
          type="text"
          placeholder="输入指令..."
          class="chat-input"
          @keyup.enter="startChat"
          :disabled="isLoading"
        />
        <div class="button-group">
          <button
            :disabled="isLoading"
            @click="clearMessage"
            class="clear-button"
            title="清空记录"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6H21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button @click="startChat" class="ask-button" :disabled="isLoading">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 2L11 13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, ref, onMounted, watch, nextTick } from "vue";
import user from "@/store/user";
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import { useMessageBox } from "@/view/components/alert/useMessageBox";
import router from "@/router";
import { useRoute } from "vue-router";

type DeepSeekRequest = {
  messageList: ChatMessage[];
  model: string;
  problem_id: number;
  status: number;
  code: string;
};

type ChatMessage = {
  role: "user" | "system";
  content: string;
};

const { success, error, warning } = useMessageBox();
const useStore = user();
const route = useRoute();

//
const props = defineProps<{
  status: number;
}>();
// 题目信息
const path = router.currentRoute.value.fullPath;
const problem_id: Ref<any> = ref(path.toString().split("/")[3]);
//

const deepSeekRequest: Ref<DeepSeekRequest> = ref({
  messageList: [],
  model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B", // 默认模型
  problem_id: problem_id.value,
  status: 0,
  code: "",
});
const currentChat: Ref<ChatMessage> = ref({
  role: "user",
  content: "",
} as ChatMessage);
const chatHistory: Ref<ChatMessage[]> = ref([]);
const selectedModel = ref("deepseek-ai/DeepSeek-R1-Distill-Llama-70B"); // 默认选中第一个模型
const isLoading = ref(false); // 加载状态
const chatOutput = ref<any>(); // 聊天输出容器的引用

// 常见问题列表
const quickQuestions = ref([
  "请你给些思路提示",
  "帮我检查一下代码",
  "优化代码时间复杂度",
]);

// 填充输入框
const fillInput = (question: string) => {
  currentChat.value.content = question;
  startChat();
};

// 更新模型状态
const updateModel = () => {
  deepSeekRequest.value.model = selectedModel.value;
};

// 处理 SSE 数据流
const handleSSEData = async (
  reader: ReadableStreamDefaultReader<Uint8Array>
) => {
  const decoder = new TextDecoder();
  let buffer = "";
  let aiResponse = "";
  // 添加 AI 消息占位符
  chatHistory.value.push({
    role: "system",
    content: aiResponse,
  });
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (line.startsWith("data:")) {
        try {
          const jsonString = line.slice(5).trim();
          const data = JSON.parse(jsonString);
          if (data.content) {
            if (data.content === "[DONE]") {
              return; // 结束流
            } else {
              aiResponse += data.content;
              // 更新最后一条 AI 消息的内容
              chatHistory.value[chatHistory.value.length - 1].content =
                aiResponse;
            }
          }
        } catch (message) {}
      }
    }
  }
};

// 开始聊天
const startChat = async () => {
  if (currentChat.value.content.trim() === "") {
    warning("请输入问题！！！");
    return;
  }

  // 添加用户消息
  chatHistory.value.push({
    role: "user",
    content: currentChat.value.content,
  });
  isLoading.value = true; // 开始加载
  currentChat.value.content = ""; // 清空输入框
  try {
    // 必要信息
    let competition_id = parseInt(path.toString().split("/")[2]);
    const current_language: Ref<string> = ref(
      localStorage.getItem("current_language") ?? "C++"
    );
    let index = path.toString().split("/")[4];

    // 创建 DeepSeekRequest 对象
    let requestBody: DeepSeekRequest = {} as DeepSeekRequest;
    if (route.path.split("/")[1] == "problems") {
      requestBody = {
        messageList: chatHistory.value,
        model: deepSeekRequest.value.model, // 使用当前选中的模型状态
        problem_id: problem_id.value,
        status: props.status ?? 0,
        code:
          localStorage.getItem(
            problem_id.value +
              "-" +
              useStore.loginUser.uuid +
              "-" +
              current_language.value
          ) ?? "",
      };
    } else if (route.path.split("/")[1] == "competition") {
      error("对不起，不允许在竞赛模式下使用该功能！！！");
      return;
      // requestBody = {
      //   messageList: chatHistory.value,
      //   model: deepSeekRequest.value.model, // 使用当前选中的模型状态
      //   problem_id: problem_id.value,
      //   status: props.status ?? 0,
      //   code:
      //     localStorage.getItem(
      //       competition_id +
      //         "-" +
      //         index +
      //         "-" +
      //         useStore.loginUser.uuid +
      //         "-" +
      //         current_language.value
      //     ) ?? "",
      // };
    } else {
      requestBody = {
        messageList: chatHistory.value,
        model: deepSeekRequest.value.model, // 使用当前选中的模型状态
        status: props.status ?? 0,
      } as any;
    }

    const response: any = await fetch("http://localhost:7091/api/ai/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: document.cookie, // 添加 Cookie 到请求头
      },
      body: JSON.stringify(requestBody),
      credentials: "include", // 确保发送跨域请求时包含 Cookie
    });
    if (!response.ok) {
      error(response.message);
      return;
    }
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("无法读取响应流！");
    }
    await handleSSEData(reader); // 处理 SSE 数据流
  } catch (err) {
    console.error("Error:", err);
    error("请求失败，请稍后重试！");
  } finally {
    isLoading.value = false; // 结束加载
  }
};
// 创建 WebSocket 连接
// const socket = new WebSocket("ws://localhost:7091/ws");
// let aiResponse = "";
// // 处理 WebSocket 消息
// socket.onmessage = (event) => {
//   const data = JSON.parse(event.data);
//   if (data.content === "[DONE]") {
//     return; // 结束流
//   } else {
//     aiResponse += data.content;
//     // 更新最后一条 AI 消息的内容
//     chatHistory.value[chatHistory.value.length - 1].content = aiResponse;
//   }
// };
//
// // 开始聊天
// const startChat = async () => {
//   if (currentChat.value.content.trim() === "") {
//     warning("请输入问题！！！");
//     return;
//   }
//
//   // 检查 WebSocket 连接状态
//   if (socket.readyState !== WebSocket.OPEN) {
//     console.error("WebSocket 连接未打开，当前状态:", socket.readyState);
//     error("WebSocket 连接未打开，请重试！");
//     return;
//   }
//
//   // 添加用户消息
//   chatHistory.value.push({
//     role: "user",
//     content: currentChat.value.content,
//   });
//   isLoading.value = true; // 开始加载
//   currentChat.value.content = ""; // 清空输入框
//   try {
//     // 必要信息
//     let competition_id = parseInt(path.toString().split("/")[2]);
//     const current_language: Ref<string> = ref(
//       localStorage.getItem("current_language") ?? "C++"
//     );
//     let index = path.toString().split("/")[4];
//
//     // 创建 DeepSeekRequest 对象
//     const requestBody: DeepSeekRequest = {
//       messageList: chatHistory.value,
//       model: deepSeekRequest.value.model, // 使用当前选中的模型状态
//       problem_id: problem_id.value,
//       status: props.status ?? 0,
//       code:
//         localStorage.getItem(
//           competition_id +
//             "-" +
//             index +
//             "-" +
//             useStore.loginUser.uuid +
//             "-" +
//             current_language.value
//         ) ?? "",
//     };
//
//     // 发送 WebSocket 消息
//     socket.send(JSON.stringify(requestBody));
//   } catch (err) {
//     console.error("Error:", err);
//     error("请求失败，请稍后重试！");
//   } finally {
//     isLoading.value = false; // 结束加载
//   }
// };
// 监听 chatHistory 的变化，自动滚动到底部
watch(
  chatHistory,
  () => {
    if (chatOutput.value) {
      if (chatHistory.value.length > 30) {
        chatHistory.value.splice(0, chatHistory.value.length - 30);
      }
      console.log(chatHistory.value);
      // 使用 nextTick 确保 DOM 更新完成后再滚动
      nextTick(() => {
        const { scrollTop, scrollHeight, clientHeight } = chatOutput.value;
        const isNearBottom = scrollHeight - (scrollTop + clientHeight) <= 50;

        if (isNearBottom) {
          chatOutput.value.scrollTop = chatOutput.value.scrollHeight;
        }
      });
      // 边滚动，边保存本地缓存记录(当且仅当登录之后)
      if (useStore.loginUser.uuid !== -1) {
        if (path.toString().split("/")[2] == "algorithm") {
          localStorage.setItem(
            problem_id.value + "-" + useStore.loginUser.uuid + "-AI",
            JSON.stringify(chatHistory.value)
          );
        } else {
          localStorage.setItem(
            useStore.loginUser.uuid + "-ChatBox",
            JSON.stringify(chatHistory.value)
          );
        }
      }
    }
  },
  { deep: true }
);
onMounted(() => {
  if (
    props.status != null &&
    localStorage.getItem(`${problem_id.value}-${useStore.loginUser.uuid}-AI`)
  ) {
    chatHistory.value = JSON.parse(
      localStorage.getItem(
        `${problem_id.value}-${useStore.loginUser.uuid}-AI`
      ) ?? ""
    );
  } else if (
    props.status == null &&
    localStorage.getItem(`${useStore.loginUser.uuid}-ChatBox`)
  ) {
    chatHistory.value = JSON.parse(
      localStorage.getItem(`${useStore.loginUser.uuid}-ChatBox`) ?? ""
    );
  }
  if (problem_id?.value != "problem") {
    problem_id.value = parseInt(problem_id?.value);
  }
  if (chatOutput.value) {
    const { scrollTop, scrollHeight, clientHeight } = chatOutput.value;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) <= 50;

    if (isNearBottom) {
      chatOutput.value.scrollTop = chatOutput.value.scrollHeight;
    }
  }
});

const clearMessage = () => {
  localStorage.removeItem(
    problem_id.value + "-" + useStore.loginUser.uuid + "-AI"
  );
  chatHistory.value = [];
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 480px;
  background-color: #ffffff;
  padding: 16px;
  box-sizing: border-box;
  color: #445566;
  position: relative;
  border: 1px solid rgba(42, 171, 210, 0.15);
  border-radius: 6px;
  overflow: hidden;
}

.chat-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #2aabd2, #44cefb);
  z-index: 2;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
}

.tech-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: rgba(42, 171, 210, 0.08);
  color: #2aabd2;
  border: 1px solid rgba(42, 171, 210, 0.2);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  letter-spacing: 0.5px;
  font-weight: 500;
  text-transform: uppercase;
}

.model-selector {
  width: 65%;
  position: relative;
}

.model-label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 500;
  color: #2aabd2;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.model-selector::after {
  content: "▾";
  position: absolute;
  bottom: 13px;
  right: 12px;
  color: #2aabd2;
  pointer-events: none;
  font-size: 12px;
}

.model-select {
  width: 100%;
  padding: 10px 14px;
  border-radius: 4px;
  border: 1px solid rgba(42, 171, 210, 0.2);
  font-size: 13px;
  color: #445566;
  background-color: #f8fafc;
  outline: none;
  transition: all 0.2s;
  appearance: none;
  cursor: pointer;
  height: 40px;
}

.model-select:hover {
  border-color: rgba(42, 171, 210, 0.3);
  box-shadow: 0 0 0 1px rgba(42, 171, 210, 0.1);
}

.model-select:focus {
  border-color: #2aabd2;
  box-shadow: 0 0 0 1px rgba(42, 171, 210, 0.2), 0 0 8px rgba(42, 171, 210, 0.1);
}

.model-select option {
  background-color: #ffffff;
  color: #445566;
}

.quick-questions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.quick-question-item {
  width: 100%;
}

.quick-question-button {
  width: 100%;
  padding: 10px 14px;
  background-color: #f8fafc;
  border: 1px solid rgba(42, 171, 210, 0.2);
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  height: 40px;
  color: #445566;
  position: relative;
  overflow: hidden;
}

.question-icon {
  display: flex;
  align-items: center;
  margin-right: 10px;
  color: #2aabd2;
}

.question-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tech-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-right: 2px solid rgba(42, 171, 210, 0.6);
  border-bottom: 2px solid rgba(42, 171, 210, 0.6);
  transform: translateY(-50%) rotate(-45deg);
}

.quick-question-button:hover {
  background-color: rgba(42, 171, 210, 0.05);
  border-color: rgba(42, 171, 210, 0.4);
  box-shadow: 0 0 10px rgba(42, 171, 210, 0.1);
}

.quick-question-button:hover .tech-arrow {
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.chat-output {
  width: 100%;
  flex: 1;
  min-height: 320px;
  overflow-y: auto;
  margin-bottom: 16px;
  padding: 16px;
  border-radius: 6px;
  background-color: #f8fafc;
  border: 1px solid rgba(42, 171, 210, 0.15);
  font-size: 14px;
  line-height: 1.6;
  scroll-behavior: smooth;
  position: relative;
  z-index: 1;
}

.circuit-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.03;
  background: linear-gradient(
        90deg,
        transparent 0%,
        transparent 49%,
        rgba(42, 171, 210, 0.5) 50%,
        transparent 51%,
        transparent 100%
      )
      0 0 / 50px 50px,
    linear-gradient(
        0deg,
        transparent 0%,
        transparent 49%,
        rgba(42, 171, 210, 0.5) 50%,
        transparent 51%,
        transparent 100%
      )
      0 0 / 50px 50px;
  pointer-events: none;
  z-index: -1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
}

.empty-icon-container {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #2aabd2;
  background: radial-gradient(
    circle,
    rgba(42, 171, 210, 0.1) 0%,
    rgba(255, 255, 255, 0) 70%
  );
  position: relative;
}

.empty-icon-container::after {
  content: "";
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 1px dashed rgba(42, 171, 210, 0.3);
  border-radius: 50%;
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.status-text {
  font-size: 15px;
  margin: 0;
  color: #667788;
  font-weight: 500;
  letter-spacing: 1px;
}

.message-container {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 4px;
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-wrapper {
  justify-content: flex-end;
  margin-left: auto;
  max-width: 85%;
}

.ai-wrapper {
  justify-content: flex-start;
  margin-right: auto;
  max-width: 85%;
}

.avatar-container {
  width: 38px;
  height: 38px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.ai-avatar::before {
  content: "";
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #2aabd2, #44cefb);
  z-index: -1;
}

.user-avatar {
  border: 1px solid rgba(42, 171, 210, 0.2);
}

.avatar-glow {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 5px;
  background: radial-gradient(
    ellipse at center,
    rgba(42, 171, 210, 0.6),
    rgba(42, 171, 210, 0) 70%
  );
}

.avatar-ring {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 1px solid rgba(42, 171, 210, 0.2);
  border-radius: 4px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message {
  position: relative;
  padding: 12px 16px;
  border-radius: 4px;
  word-wrap: break-word;
  font-size: 14px;
  line-height: 1.6;
  max-width: calc(100% - 48px);
}

.tech-corner {
  position: absolute;
  width: 6px;
  height: 6px;
  background-color: transparent;
}

.top-left {
  top: -1px;
  left: -1px;
  border-top: 2px solid rgba(42, 171, 210, 0.6);
  border-left: 2px solid rgba(42, 171, 210, 0.6);
}

.top-right {
  top: -1px;
  right: -1px;
  border-top: 2px solid rgba(42, 171, 210, 0.6);
  border-right: 2px solid rgba(42, 171, 210, 0.6);
}

.bottom-left {
  bottom: -1px;
  left: -1px;
  border-bottom: 2px solid rgba(42, 171, 210, 0.6);
  border-left: 2px solid rgba(42, 171, 210, 0.6);
}

.bottom-right {
  bottom: -1px;
  right: -1px;
  border-bottom: 2px solid rgba(42, 171, 210, 0.6);
  border-right: 2px solid rgba(42, 171, 210, 0.6);
}

.user-message {
  background-color: rgba(42, 171, 210, 0.08);
  color: #445566;
  border: 1px solid rgba(42, 171, 210, 0.2);
}

.user-message .tech-corner {
  border-color: rgba(42, 171, 210, 0.4);
}

.ai-message {
  background-color: #ffffff;
  color: #445566;
  border: 1px solid rgba(42, 171, 210, 0.3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.ai-message .tech-corner {
  border-color: rgba(42, 171, 210, 0.6);
}

.message-content {
  font-size: 14px;
  line-height: 1.6;
}

/* Make markdown content match other text */
.message-content :deep(p) {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.6;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message-content :deep(pre) {
  margin: 8px 0;
  background-color: #f0f5f9;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 13px;
  border: 1px solid rgba(42, 171, 210, 0.15);
}

.message-content :deep(code) {
  background-color: rgba(42, 171, 210, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
}

.message-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.input-wrapper {
  width: 100%;
  position: relative;
}

.tech-frame {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 1px solid rgba(42, 171, 210, 0.4);
  border-radius: 6px;
  pointer-events: none;
  opacity: 0.4;
}

.input-container {
  display: flex;
  width: 100%;
  gap: 10px;
  border-radius: 4px;
  background-color: #f8fafc;
  border: 1px solid rgba(42, 171, 210, 0.2);
  padding: 0 4px 0 0;
}

.input-prefix {
  display: flex;
  align-items: center;
  padding: 0 8px;
  color: #2aabd2;
  font-weight: bold;
  font-size: 16px;
}

.chat-input {
  flex: 1;
  padding: 0 12px 0 0;
  border: none;
  border-radius: 0;
  font-size: 14px;
  outline: none;
  height: 46px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: normal;
  display: block;
  box-sizing: border-box;
  background-color: transparent;
  color: #445566;
  font-family: "SF Mono", "Roboto Mono", Menlo, monospace;
}

.chat-input::placeholder {
  color: rgba(68, 85, 102, 0.4);
}

.button-group {
  display: flex;
  gap: 6px;
  align-items: center;
}

.ask-button,
.clear-button {
  width: 36px;
  height: 36px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.ask-button {
  background-color: rgba(42, 171, 210, 0.8);
}

.clear-button {
  background-color: rgba(255, 106, 107, 0.7);
}

.ask-button:hover:not(:disabled),
.clear-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 10px rgba(42, 171, 210, 0.3);
}

.ask-button:hover:not(:disabled) {
  background-color: rgba(42, 171, 210, 1);
}

.clear-button:hover:not(:disabled) {
  background-color: rgba(255, 106, 107, 0.9);
}

.ask-button:active:not(:disabled),
.clear-button:active:not(:disabled) {
  transform: translateY(0);
}

.ask-button:disabled,
.clear-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  height: 140px;
  gap: 16px;
}

.loading-text {
  font-size: 14px;
  letter-spacing: 1px;
  color: #2aabd2;
}

.tech-spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(42, 171, 210, 0.1);
  border-top-color: #2aabd2;
  animation: tech-spinner-rotate 1.5s linear infinite;
}

.spinner-line {
  position: absolute;
  background-color: rgba(42, 171, 210, 0.2);
}

.line-1 {
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  transform: translateY(-50%);
}

.line-2 {
  top: 0;
  left: 50%;
  width: 1px;
  height: 100%;
  transform: translateX(-50%);
}

.line-3,
.line-4 {
  top: 50%;
  left: 50%;
  width: 70%;
  height: 1px;
}

.line-3 {
  transform: translate(-50%, -50%) rotate(45deg);
}

.line-4 {
  transform: translate(-50%, -50%) rotate(-45deg);
}

@keyframes tech-spinner-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Custom scrollbar for the chat output */
.chat-output::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.chat-output::-webkit-scrollbar-track {
  background: rgba(240, 245, 250, 0.6);
}

.chat-output::-webkit-scrollbar-thumb {
  background: rgba(42, 171, 210, 0.3);
  border-radius: 3px;
}

.chat-output::-webkit-scrollbar-thumb:hover {
  background: rgba(42, 171, 210, 0.5);
}
</style>
