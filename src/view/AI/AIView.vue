<!--<template>-->
<!--  <div class="chat-container bg-gradient-to-b from-blue-200 to-blue-300 rounded-2xl shadow-2xl p-6 max-w-4xl mx-auto min-h-[600px] relative overflow-hidden">-->
<!--    &lt;!&ndash; Header: Model selection and branding &ndash;&gt;-->
<!--    <div class="header-section flex justify-between items-center mb-6">-->
<!--      <div class="model-selector w-1/2">-->
<!--        <label for="model-select" class="block text-lg font-medium text-blue-800 mb-2">选择 AI 模型</label>-->
<!--        <select-->
<!--            id="model-select"-->
<!--            v-model="selectedModel"-->
<!--            @change="updateModel"-->
<!--            class="w-full p-2 bg-blue-100/50 border border-blue-400/30 rounded-lg text-blue-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"-->
<!--        >-->
<!--          <option value="deepseek-ai/DeepSeek-R1-Distill-Llama-70B">DeepSeek Reasoner</option>-->
<!--          <option value="deepseek-chat">DeepSeek V3 线路一</option>-->
<!--          <option value="deepseek-ai/DeepSeek-V3">DeepSeek V3 线路二</option>-->
<!--        </select>-->
<!--      </div>-->
<!--      <div class="tech-badge flex items-center gap-2 bg-white text-blue-800 border border-blue-400/30 px-3 py-1 rounded-full text-sm font-semibold">-->
<!--        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">-->
<!--          <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--          <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--          <path d="M12 15C10.3431 15 9 13.6569 9 12H15C15 13.6569 13.6569 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--        </svg>-->
<!--        <span class="font-bold text-lg">蒙来电 AI助手</span>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; Data and Export Options &ndash;&gt;-->
<!--    <div class="options-section flex justify-between mb-6">-->
<!--      <div class="data-type-section flex gap-4">-->
<!--        <button-->
<!--            @click="dataType = 'text'"-->
<!--            :class="{'bg-blue-500 text-white': dataType === 'text', 'bg-blue-100/50 text-blue-800': dataType !== 'text'}"-->
<!--            class="px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-400 hover:text-white"-->
<!--        >-->
<!--          文本数据-->
<!--        </button>-->
<!--        <button-->
<!--            @click="dataType = 'table'"-->
<!--            :class="{'bg-blue-500 text-white': dataType === 'table', 'bg-blue-100/50 text-blue-800': dataType !== 'table'}"-->
<!--            class="px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-400 hover:text-white"-->
<!--        >-->
<!--          表格数据-->
<!--        </button>-->
<!--      </div>-->
<!--      <div class="export-type-section flex gap-4">-->
<!--        <button-->
<!--            @click="exportType = 'excel'"-->
<!--            :class="{'bg-blue-500 text-white': exportType === 'excel', 'bg-blue-100/50 text-blue-800': exportType !== 'excel'}"-->
<!--            class="px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-400 hover:text-white"-->
<!--        >-->
<!--          导出 Excel-->
<!--        </button>-->
<!--        <button-->
<!--            @click="exportType = 'pdf'"-->
<!--            :class="{'bg-blue-500 text-white': exportType === 'pdf', 'bg-blue-100/50 text-blue-800': exportType !== 'pdf'}"-->
<!--            class="px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-400 hover:text-white"-->
<!--        >-->
<!--          导出 PDF-->
<!--        </button>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; Chat output area &ndash;&gt;-->
<!--    <div class="chat-output bg-blue-100/50 rounded-xl p-4 mb-6 overflow-y-auto max-h-[400px] relative shadow-inner" ref="chatOutput">-->
<!--      <div v-if="isFontLoading" class="flex flex-col items-center justify-center h-32 gap-4">-->
<!--        <div class="tech-spinner w-10 h-10 relative">-->
<!--          <div class="absolute inset-0 border-2 border-blue-400/30 border-t-blue-500 rounded-full animate-spin"></div>-->
<!--        </div>-->
<!--        <span class="text-blue-800 text-sm font-medium">加载字体中...</span>-->
<!--      </div>-->
<!--      <div v-else-if="chatHistory.length > 0" class="message-container space-y-4">-->
<!--        <div-->
<!--            v-for="(message, index) in chatHistory"-->
<!--            :key="index"-->
<!--            :class="['flex', message.role === 'user' ? 'justify-end' : 'justify-start', 'gap-3']"-->
<!--        >-->
<!--          <div v-if="message.role === 'system'" class="avatar-container w-8 h-8 rounded-md overflow-hidden relative">-->
<!--            <img-->
<!--                src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502121127266.jpg"-->
<!--                alt="ByteOJ出品"-->
<!--                class="w-full h-full object-cover"-->
<!--            />-->
<!--            <div class="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent"></div>-->
<!--          </div>-->
<!--          <div-->
<!--              :class="[-->
<!--              'p-3 rounded-lg max-w-[80%]',-->
<!--              message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white border border-blue-400/30',-->
<!--              dataType === 'table' && message.role === 'system' ? 'overflow-x-auto' : ''-->
<!--            ]"-->
<!--          >-->
<!--            <span v-if="message.role === 'user'">{{ message.content }}</span>-->
<!--            <div v-else-if="dataType === 'table' && message.role === 'system'">-->
<!--              <table class="w-full border-collapse">-->
<!--                <thead>-->
<!--                <tr class="bg-blue-500 text-white">-->
<!--                  <th class="p-2 text-left">ID</th>-->
<!--                  <th class="p-2 text-left">姓名</th>-->
<!--                  <th class="p-2 text-left">年龄</th>-->
<!--                  <th class="p-2 text-left">职业</th>-->
<!--                </tr>-->
<!--                </thead>-->
<!--                <tbody>-->
<!--                <tr v-for="(item, idx) in parsedTableData(message.content)" :key="idx" class="border-b hover:bg-blue-400/30">-->
<!--                  <td class="p-2">{{ item.id }}</td>-->
<!--                  <td class="p-2">{{ item.name }}</td>-->
<!--                  <td class="p-2">{{ item.age }}</td>-->
<!--                  <td class="p-2">{{ item.occupation }}</td>-->
<!--                </tr>-->
<!--                </tbody>-->
<!--              </table>-->
<!--            </div>-->
<!--            <MarkdownView v-else :generate-data="message.content" class="p-0" />-->
<!--          </div>-->
<!--          <div v-if="message.role === 'user'" class="avatar-container w-8 h-8 rounded-md overflow-hidden relative">-->
<!--            <img :src="useStore.loginUser.avatar" alt="ByteOJ用户" class="w-full h-full object-cover" />-->
<!--            <div class="absolute inset-0 border border-blue-400/30"></div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--      <div v-if="isLoading" class="flex flex-col items-center justify-center h-32 gap-4">-->
<!--        <div class="tech-spinner w-10 h-10 relative">-->
<!--          <div class="absolute inset-0 border-2 border-blue-400/30 border-t-blue-500 rounded-full animate-spin"></div>-->
<!--        </div>-->
<!--        <span class="text-blue-800 text-sm font-medium">AI 处理中...</span>-->
<!--      </div>-->
<!--      <div v-if="!isLoading && !isFontLoading && chatHistory.length === 0" class="flex flex-col items-center justify-center h-64 gap-4">-->
<!--        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-blue-500">-->
<!--          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--          <path d="M10.5 8.67001V15.33C10.5 15.61 10.69 15.84 10.96 15.93C11.23 16.02 11.52 15.93 11.7 15.71L14.2 12.52C14.42 12.24 14.42 11.76 14.2 11.48L11.7 8.29001C11.52 8.07001 11.23 7.98 10.96 8.07C10.69 8.16 10.5 8.39 10.5 8.67001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--        </svg>-->
<!--        <p class="text-blue-800 text-md">请输入你的问题</p>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; Chat input area &ndash;&gt;-->
<!--    <div class="input-wrapper flex items-center bg-blue-100/50 border border-blue-400/30 rounded-xl p-4 mb-6">-->
<!--      <span class="input-prefix text-blue-600 font-bold mx-4">></span>-->
<!--      <input-->
<!--          v-model="currentChat.content"-->
<!--          type="text"-->
<!--          placeholder="输入指令..."-->
<!--          class="flex-1 bg-transparent outline-none text-blue-800 text-base placeholder-blue-500/50 h-12"-->
<!--          @keyup.enter="startChat"-->
<!--          :disabled="isLoading || isFontLoading"-->
<!--      />-->
<!--      <div class="button-group flex gap-3">-->
<!--        <button @click="clearMessage" class="bg-red-500 text-white w-10 h-10 rounded-md flex items-center justify-center hover:bg-red-400 transition duration-200" :disabled="isLoading || isFontLoading" title="清空记录">-->
<!--          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">-->
<!--            <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--            <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--            <path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--          </svg>-->
<!--        </button>-->
<!--        <button @click="startChat" class="bg-blue-500 text-white w-10 h-10 rounded-md flex items-center justify-center hover:bg-blue-400 transition duration-200" :disabled="isLoading || isFontLoading">-->
<!--          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">-->
<!--            <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--          </svg>-->
<!--        </button>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; Export button &ndash;&gt;-->
<!--    <div class="export-button text-center">-->
<!--      <button-->
<!--          @click="exportData"-->
<!--          class="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-400 transition duration-300"-->
<!--          :disabled="isLoading || isFontLoading || chatHistory.length === 0"-->
<!--      >-->
<!--        {{ exportType === 'excel' ? '导出为 Excel' : '导出为 PDF' }}-->
<!--      </button>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import { Ref, ref, onMounted, watch, nextTick } from 'vue';-->
<!--import MarkdownView from '@/view/Markdown/MarkdownView.vue';-->
<!--import { useMessageBox } from '@/view/components/alert/useMessageBox';-->
<!--import { useRoute } from 'vue-router';-->
<!--import user from '@/store/user';-->
<!--import * as XLSX from 'xlsx';-->
<!--import jsPDF from 'jspdf';-->
<!--import 'jspdf-autotable';-->
<!--import { saveAs } from 'file-saver';-->

<!--// jsPDF type declaration for autoTable-->
<!--declare module 'jspdf' {-->
<!--  interface jsPDF {-->
<!--    autoTable: (options: any) => void;-->
<!--    addFileToVFS: (filename: string, data: string) => void;-->
<!--    addFont: (filename: string, name: string, style: string) => void;-->
<!--  }-->
<!--}-->

<!--// Initialize dependencies-->
<!--const { success, error, warning } = useMessageBox();-->
<!--const useStore = user();-->
<!--const route = useRoute();-->

<!--// Type definitions-->
<!--type DeepSeekRequest = {-->
<!--  messageList: ChatMessage[];-->
<!--  model: string;-->
<!--  problem_id: number;-->
<!--  status: number;-->
<!--  code: string;-->
<!--};-->

<!--type ChatMessage = {-->
<!--  role: 'user' | 'system';-->
<!--  content: string;-->
<!--};-->

<!--const props = defineProps<{-->
<!--  status: number;-->
<!--}>();-->

<!--// Data initialization-->
<!--const path = route.path;-->
<!--const problem_id: Ref<any> = ref(path.split('/')[3]);-->
<!--const deepSeekRequest: Ref<DeepSeekRequest> = ref({-->
<!--  messageList: [],-->
<!--  model: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',-->
<!--  problem_id: problem_id.value,-->
<!--  status: 0,-->
<!--  code: '',-->
<!--});-->
<!--const currentChat: Ref<ChatMessage> = ref({ role: 'user', content: '' });-->
<!--const chatHistory: Ref<ChatMessage[]> = ref([]);-->
<!--const selectedModel = ref('deepseek-ai/DeepSeek-R1-Distill-Llama-70B');-->
<!--const isLoading = ref(false);-->
<!--const isFontLoading = ref(true);-->
<!--const chatOutput = ref<HTMLElement | null>(null);-->
<!--const dataType = ref<'text' | 'table'>('text');-->
<!--const exportType = ref<'excel' | 'pdf'>('excel');-->

<!--// Mock AI table data-->
<!--const tableData = ref([-->
<!--  { id: 1, name: '张三', age: 25, occupation: '工程师' },-->
<!--  { id: 2, name: '李四', age: 30, occupation: '设计师' },-->
<!--  { id: 3, name: '王五', age: 28, occupation: '产品经理' },-->
<!--]);-->

<!--// Parse table data-->
<!--const parsedTableData = (content: string) => {-->
<!--  try {-->
<!--    const data = JSON.parse(content);-->
<!--    if (Array.isArray(data)) {-->
<!--      return data;-->
<!--    }-->
<!--    throw new Error('Invalid table data');-->
<!--  } catch {-->
<!--    warning('表格数据解析失败，使用默认数据');-->
<!--    return tableData.value;-->
<!--  }-->
<!--};-->

<!--// Update model-->
<!--const updateModel = () => {-->
<!--  deepSeekRequest.value.model = selectedModel.value;-->
<!--};-->

<!--// Handle SSE data stream-->
<!--const handleSSEData = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {-->
<!--  const decoder = new TextDecoder('utf-8');-->
<!--  let buffer = '';-->
<!--  let aiResponse = '';-->
<!--  chatHistory.value.push({ role: 'system', content: aiResponse });-->
<!--  while (true) {-->
<!--    const { done, value } = await reader.read();-->
<!--    if (done) break;-->
<!--    buffer += decoder.decode(value, { stream: true });-->
<!--    const lines = buffer.split('\n');-->
<!--    buffer = lines.pop() || '';-->
<!--    for (const line of lines) {-->
<!--      if (line.startsWith('data:')) {-->
<!--        try {-->
<!--          const jsonString = line.slice(5).trim();-->
<!--          const data = JSON.parse(jsonString);-->
<!--          if (data.content) {-->
<!--            if (data.content === '[DONE]') {-->
<!--              if (dataType.value === 'table') {-->
<!--                chatHistory.value[chatHistory.value.length - 1].content = JSON.stringify(tableData.value);-->
<!--              }-->
<!--              return;-->
<!--            } else {-->
<!--              aiResponse += data.content;-->
<!--              chatHistory.value[chatHistory.value.length - 1].content = aiResponse;-->
<!--            }-->
<!--          }-->
<!--        } catch (err) {-->
<!--          console.error('SSE 数据解析错误:', err);-->
<!--        }-->
<!--      }-->
<!--    }-->
<!--  }-->
<!--};-->

<!--// Start chat-->
<!--const startChat = async () => {-->
<!--  if (currentChat.value.content.trim() === '') {-->
<!--    warning('请输入问题！');-->
<!--    return;-->
<!--  }-->

<!--  chatHistory.value.push({ role: 'user', content: currentChat.value.content });-->
<!--  isLoading.value = true;-->
<!--  currentChat.value.content = '';-->

<!--  try {-->
<!--    let competition_id = parseInt(path.split('/')[2]);-->
<!--    const current_language: Ref<string> = ref(localStorage.getItem('current_language') ?? 'C++');-->
<!--    let index = path.split('/')[4];-->

<!--    let requestBody: DeepSeekRequest = {-->
<!--      messageList: [-->
<!--        {-->
<!--          role: 'system',-->
<!--          content: ''-->
<!--        },-->
<!--        ...chatHistory.value-->
<!--      ],-->
<!--      model: deepSeekRequest.value.model,-->
<!--      problem_id: problem_id.value,-->
<!--      status: props.status ?? 0,-->
<!--      code: localStorage.getItem(-->
<!--          problem_id.value + '-' + useStore.loginUser.uuid + '-' + current_language.value-->
<!--      ) ?? '',-->
<!--    };-->

<!--    const response = await fetch('http://localhost:7091/api/ai/ask', {-->
<!--      method: 'POST',-->
<!--      headers: {-->
<!--        'Content-Type': 'application/json',-->
<!--        'Cookie': document.cookie,-->
<!--      },-->
<!--      body: JSON.stringify(requestBody),-->
<!--      credentials: 'include',-->
<!--    });-->

<!--    if (!response.ok) {-->
<!--      error(response.statusText);-->
<!--      return;-->
<!--    }-->

<!--    const reader = response.body?.getReader();-->
<!--    if (!reader) {-->
<!--      throw new Error('无法读取响应流！');-->
<!--    }-->
<!--    await handleSSEData(reader);-->
<!--  } catch (err) {-->
<!--    console.error('Error:', err);-->
<!--    error('请求失败，请稍后重试！');-->
<!--  } finally {-->
<!--    isLoading.value = false;-->
<!--  }-->
<!--};-->

<!--// Export data-->
<!--const exportData = () => {-->
<!--  if (chatHistory.value.length === 0) {-->
<!--    warning('没有可导出的数据！');-->
<!--    return;-->
<!--  }-->

<!--  const lastMessage = chatHistory.value[chatHistory.value.length - 1];-->
<!--  if (exportType.value === 'excel') {-->
<!--    if (dataType.value === 'table') {-->
<!--      const data = parsedTableData(lastMessage.content);-->
<!--      const ws = XLSX.utils.json_to_sheet(data, { header: ['id', 'name', 'age', 'occupation'] });-->
<!--      const wb = XLSX.utils.book_new();-->
<!--      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');-->
<!--      XLSX.writeFile(wb, 'table_data.xlsx', { bookType: 'xlsx', type: 'binary', bookSST: true });-->
<!--    } else {-->
<!--      const ws = XLSX.utils.json_to_sheet([{ content: lastMessage.content }]);-->
<!--      const wb = XLSX.utils.book_new();-->
<!--      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');-->
<!--      XLSX.writeFile(wb, 'text_data.xlsx', { bookType: 'xlsx', type: 'binary', bookSST: true });-->
<!--    }-->
<!--  } else {-->
<!--    const doc = new jsPDF();-->
<!--    let fontLoaded = false;-->
<!--    try {-->
<!--      doc.setFont('NotoSansSC', 'normal');-->
<!--      fontLoaded = true;-->
<!--    } catch (err) {-->
<!--      console.error('字体设置错误:', err);-->
<!--      warning('中文字体未正确加载，PDF 中中文可能显示异常');-->
<!--      doc.setFont('Helvetica', 'normal');-->
<!--    }-->

<!--    doc.setFontSize(12);-->
<!--    if (dataType.value === 'table') {-->
<!--      doc.text('AI 生成的表格数据', 10, 10);-->
<!--      const headers = [['ID', '姓名', '年龄', '职业']];-->
<!--      const rows = parsedTableData(lastMessage.content).map(item => [-->
<!--        item.id,-->
<!--        item.name,-->
<!--        item.age,-->
<!--        item.occupation-->
<!--      ]);-->
<!--      doc.autoTable({-->
<!--        head: headers,-->
<!--        body: rows,-->
<!--        startY: 20,-->
<!--        styles: { font: fontLoaded ? 'NotoSansSC' : 'Helvetica', fontSize: 10, cellPadding: 2 },-->
<!--        theme: 'grid',-->
<!--        headStyles: { fillColor: [30, 144, 255], textColor: [255, 255, 255] },-->
<!--        bodyStyles: { textColor: [0, 0, 0] },-->
<!--      });-->
<!--    } else {-->
<!--      doc.text('AI 生成的文本数据', 10, 10);-->
<!--      doc.text(lastMessage.content, 10, 20, { maxWidth: 180 });-->
<!--    }-->
<!--    doc.save('data.pdf');-->
<!--  }-->
<!--};-->

<!--// Clear messages-->
<!--const clearMessage = () => {-->
<!--  localStorage.removeItem(`${problem_id.value}-${useStore.loginUser.uuid}-AI`);-->
<!--  chatHistory.value = [];-->
<!--};-->

<!--// Watch chat history for auto-scroll-->
<!--watch(-->
<!--    chatHistory,-->
<!--    () => {-->
<!--      if (chatOutput.value) {-->
<!--        if (chatHistory.value.length > 30) {-->
<!--          chatHistory.value.splice(0, chatHistory.value.length - 30);-->
<!--        }-->
<!--        nextTick(() => {-->
<!--          chatOutput.value!.scrollTop = chatOutput.value!.scrollHeight;-->
<!--        });-->
<!--        if (useStore.loginUser.uuid !== -1) {-->
<!--          if (path.split('/')[2] === 'algorithm') {-->
<!--            localStorage.setItem(-->
<!--                `${problem_id.value}-${useStore.loginUser.uuid}-AI`,-->
<!--                JSON.stringify(chatHistory.value)-->
<!--            );-->
<!--          } else {-->
<!--            localStorage.setItem(-->
<!--                `${useStore.loginUser.uuid}-ChatBox`,-->
<!--                JSON.stringify(chatHistory.value)-->
<!--            );-->
<!--          }-->
<!--        }-->
<!--      }-->
<!--    },-->
<!--    { deep: true }-->
<!--);-->

<!--// Initialize-->
<!--onMounted(async () => {-->
<!--  isFontLoading.value = true;-->
<!--  try {-->
<!--    const fontUrl = '/assets/fonts/NotoSansSC-Regular.woff';-->
<!--    const fontResponse = await fetch(fontUrl);-->
<!--    if (!fontResponse.ok) {-->
<!--      throw new Error('字体加载失败');-->
<!--    }-->
<!--    const fontArrayBuffer = await fontResponse.arrayBuffer();-->
<!--    const fontBase64 = arrayBufferToBase64(fontArrayBuffer);-->
<!--    (jsPDF as any).API.addFileToVFS('NotoSansSC-Regular.woff', fontBase64);-->
<!--    (jsPDF as any).API.addFont('NotoSansSC-Regular.woff', 'NotoSansSC', 'normal');-->
<!--  } catch (err) {-->
<!--    console.error('字体加载错误:', err);-->
<!--    error('无法加载中文字体，PDF 可能无法正确显示中文');-->
<!--  } finally {-->
<!--    isFontLoading.value = false;-->
<!--  }-->

<!--  if (-->
<!--      props.status != null &&-->
<!--      localStorage.getItem(`${problem_id.value}-${useStore.loginUser.uuid}-AI`)-->
<!--  ) {-->
<!--    chatHistory.value = JSON.parse(-->
<!--        localStorage.getItem(`${problem_id.value}-${useStore.loginUser.uuid}-AI`) ?? '[]'-->
<!--    );-->
<!--  } else if (-->
<!--      props.status == null &&-->
<!--      localStorage.getItem(`${useStore.loginUser.uuid}-ChatBox`)-->
<!--  ) {-->
<!--    chatHistory.value = JSON.parse(-->
<!--        localStorage.getItem(`${useStore.loginUser.uuid}-ChatBox`) ?? '[]'-->
<!--    );-->
<!--  }-->
<!--  if (problem_id.value !== 'problem') {-->
<!--    problem_id.value = parseInt(problem_id.value);-->
<!--  }-->
<!--});-->

<!--// Utility function for font base64 conversion-->
<!--function arrayBufferToBase64(buffer: ArrayBuffer): string {-->
<!--  let binary = '';-->
<!--  const bytes = new Uint8Array(buffer);-->
<!--  const len = bytes.byteLength;-->
<!--  for (let i = 0; i < len; i++) {-->
<!--    binary += String.fromCharCode(bytes[i]);-->
<!--  }-->
<!--  return window.btoa(binary);-->
<!--}-->
<!--</script>-->

<!--<style scoped>-->
<!--.chat-container {-->
<!--  position: relative;-->
<!--  overflow: hidden;-->
<!--}-->

<!--.chat-output {-->
<!--  scrollbar-width: thin;-->
<!--  scrollbar-color: rgba(30, 144, 255, 0.4) rgba(173, 216, 230, 0.6);-->
<!--}-->

<!--.chat-output::-webkit-scrollbar {-->
<!--  width: 5px;-->
<!--}-->

<!--.chat-output::-webkit-scrollbar-track {-->
<!--  background: rgba(173, 216, 230, 0.6);-->
<!--}-->

<!--.chat-output::-webkit-scrollbar-thumb {-->
<!--  background: rgba(30, 144, 255, 0.4);-->
<!--  border-radius: 3px;-->
<!--}-->

<!--.chat-output::-webkit-scrollbar-thumb:hover {-->
<!--  background: rgba(30, 144, 255, 0.6);-->
<!--}-->
<!--</style>-->