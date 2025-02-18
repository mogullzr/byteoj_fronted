<template>
  <div class="chat-container">
    <h1 class="chat-title">AI 问答聊天</h1>
    <!-- 模型切换下拉菜单 -->
    <div class="model-selector">
      <label for="model-select">选择模型：</label>
      <select id="model-select" v-model="selectedModel" @change="updateModel">
        <option value="deepseek-chat">DeepSeek V3 线路一</option>
        <option value="deepseek-ai/DeepSeek-V3">DeepSeek V3 线路二</option>
        <option value="deepseek-ai/DeepSeek-R1-Distill-Llama-70B">
          DeepSeek Reasoner
        </option>
      </select>
    </div>
    <!-- 常见问题按钮组 -->
    <div v-if="route.path != '/chatbot' && !isLoading" class="quick-questions">
      <div
        v-for="(question, index) in quickQuestions"
        :key="index"
        @click="fillInput(question)"
      >
        <button
          class="quick-question-button font-bold text-lg mx-2 my-1 w-full"
        >
          <div class="flex">
            <div class="my-auto mx-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 1024 1024"
              >
                <path
                  fill="#666666"
                  d="M512 1024q-104 0-199-40.5t-163.5-109T40.5 711T0 512t40.5-199t109-163.5T313 40.5T512 0t199 40.5t163.5 109t109 163.5t40.5 199t-40.5 199t-109 163.5t-163.5 109t-199 40.5m32-896q-40 0-68 28t-28 67.5t28 68t68 28.5t68-28.5t28-68t-28-67.5t-68-28m129 530q-60 63-88 81.5T530 758q-15 0-25.5-13.5T494 710q0-43 82-326l-155-29Q320 604 320 745q0 65 31 108t76 43q81 0 246-162z"
                />
              </svg>
            </div>
            <div>{{ question }}</div>
          </div>
        </button>
      </div>
    </div>
    <div class="chat-output" ref="chatOutput">
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
          <img
            v-if="message.role === 'system'"
            src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502121127266.jpg"
            alt="AI Avatar"
            class="avatar"
          />
          <!-- 消息内容 -->
          <div
            :class="[
              'message',
              message.role === 'user' ? 'user-message' : 'ai-message',
            ]"
          >
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
          <img
            v-if="message.role === 'user'"
            :src="useStore.loginUser.avatar"
            alt="BByteOJ出品"
            class="avatar"
          />
        </div>
      </div>
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-indicator">
        <span>AI 正在思考中...</span>
      </div>
    </div>
    <!-- 输入框 -->
    <div class="input-container">
      <input
        v-model="currentChat.content"
        type="text"
        placeholder="请输入你的问题......"
        class="chat-input"
        @keyup.enter="startChat"
        :disabled="isLoading"
      />
      <button @click="startChat" class="ask-button" :disabled="isLoading">
        {{ isLoading ? "发送中..." : "发送" }}
      </button>
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
  model: "deepseek-chat", // 默认模型
  problem_id: problem_id.value,
  status: 0,
  code: "",
});
const currentChat: Ref<ChatMessage> = ref({
  role: "user",
  content: "",
} as ChatMessage);
const chatHistory: Ref<ChatMessage[]> = ref([]);
const selectedModel = ref("deepseek-chat"); // 默认选中第一个模型
const isLoading = ref(false); // 加载状态
const chatOutput = ref<HTMLElement | null>(); // 聊天输出容器的引用

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
//
// // 处理 SSE 数据流
// const handleSSEData = async (
//   reader: ReadableStreamDefaultReader<Uint8Array>
// ) => {
//   const decoder = new TextDecoder();
//   let buffer = "";
//   let aiResponse = "";
//   // 添加 AI 消息占位符
//   chatHistory.value.push({
//     role: "system",
//     content: aiResponse,
//   });
//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;
//     buffer += decoder.decode(value, { stream: true });
//     const lines = buffer.split("\n");
//     buffer = lines.pop() || "";
//     for (const line of lines) {
//       if (line.startsWith("data:")) {
//         try {
//           const jsonString = line.slice(5).trim();
//           const data = JSON.parse(jsonString);
//           if (data.content) {
//             if (data.content === "[DONE]") {
//               return; // 结束流
//             } else {
//               aiResponse += data.content;
//               // 更新最后一条 AI 消息的内容
//               chatHistory.value[chatHistory.value.length - 1].content =
//                 aiResponse;
//             }
//           }
//         } catch (message) {}
//       }
//     }
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
//     const response = await fetch("http://localhost:7091/api/ai/ask", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(requestBody),
//     });
//     if (!response.ok) {
//       throw new Error(`请求失败：${response.statusText}`);
//     }
//     const reader = response.body?.getReader();
//     if (!reader) {
//       throw new Error("无法读取响应流！");
//     }
//     await handleSSEData(reader); // 处理 SSE 数据流
//   } catch (err) {
//     console.error("Error:", err);
//     error("请求失败，请稍后重试！");
//   } finally {
//     isLoading.value = false; // 结束加载
//   }
// };
// 创建 WebSocket 连接
const socket = new WebSocket("ws://localhost:7091/ws");
let aiResponse = "";
// 处理 WebSocket 消息
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.content === "[DONE]") {
    return; // 结束流
  } else {
    aiResponse += data.content;
    // 更新最后一条 AI 消息的内容
    chatHistory.value[chatHistory.value.length - 1].content = aiResponse;
  }
};

// 开始聊天
const startChat = async () => {
  if (currentChat.value.content.trim() === "") {
    warning("请输入问题！！！");
    return;
  }

  // 检查 WebSocket 连接状态
  if (socket.readyState !== WebSocket.OPEN) {
    console.error("WebSocket 连接未打开，当前状态:", socket.readyState);
    error("WebSocket 连接未打开，请重试！");
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
    const requestBody: DeepSeekRequest = {
      messageList: chatHistory.value,
      model: deepSeekRequest.value.model, // 使用当前选中的模型状态
      problem_id: problem_id.value,
      status: props.status ?? 0,
      code:
        localStorage.getItem(
          competition_id +
            "-" +
            index +
            "-" +
            useStore.loginUser.uuid +
            "-" +
            current_language.value
        ) ?? "",
    };

    // 发送 WebSocket 消息
    socket.send(JSON.stringify(requestBody));
  } catch (err) {
    console.error("Error:", err);
    error("请求失败，请稍后重试！");
  } finally {
    isLoading.value = false; // 结束加载
  }
};
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
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chat-title {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 20px;
}

.model-selector {
  margin-bottom: 20px;
}

.model-selector label {
  font-size: 16px;
  margin-right: 10px;
}

.model-selector select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-size: 16px;
}

.quick-questions {
  width: 100%;
  gap: 10px;
}

.quick-question-button {
  margin-bottom: 4px;
  padding: 8px 12px;
  background-color: #f0f0f0;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.quick-question-button:hover {
  background-color: #e0e0e0;
}

.chat-output {
  width: 100%;
  height: 359px;
  overflow-y: auto;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
  font-family: "Arial", sans-serif;
  line-height: 1.6;
}

.message-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.user-wrapper {
  justify-content: flex-end;
}

.ai-wrapper {
  justify-content: flex-start;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
}

.message {
  max-width: 85%;
  padding: 10px 15px;
  border-radius: 12px;
  word-wrap: break-word;
}

.user-message {
  background-color: #1890ff;
  color: white;
}

.ai-message {
  background-color: white;
  border: 1px solid #e0e0e0;
  color: #333;
}

.input-container {
  display: flex;
  width: 100%;
  gap: 10px;
}

.chat-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s ease;
}

.chat-input:focus {
  border-color: #1890ff;
}

.ask-button {
  padding: 12px 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.ask-button:hover {
  background-color: #0069d9;
}

.ask-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-indicator {
  text-align: center;
  padding: 10px;
  color: #666;
}
</style>
