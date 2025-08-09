<template>
  <div class="code-replay-container bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b p-4">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">代码记录回放</h1>
        <p class="text-gray-600">观看代码编写的完整过程</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto p-6">
      <!-- Auto-loaded Success Message -->
      <div v-if="autoLoadedRecords" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="text-green-800 font-medium">
            ✅ 已自动加载编辑器中的 {{ recordList.length }} 条代码记录，可以直接开始回放！
          </span>
        </div>
      </div>

      <!-- Import Records Section -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6" v-if="!hasRecords">
        <h2 class="text-lg font-semibold mb-4">导入记录数据</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              粘贴ACWing格式或数据库格式的记录数据：
            </label>
            <textarea
              v-model="importText"
              class="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="粘贴记录数据..."
            ></textarea>
          </div>
          <div class="flex gap-3">
            <button
              @click="handleImport"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              :disabled="!importText.trim()"
            >
              导入记录
            </button>
            <button
              @click="loadDemo"
              class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              加载示例数据
            </button>
          </div>
        </div>
      </div>

      <!-- Replay Section -->
      <div v-if="hasRecords" class="space-y-6">
        <!-- Controls -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <div class="flex items-center justify-between">
            <!-- Playback Controls -->
            <div class="flex items-center space-x-4">
              <button
                @click="togglePlay"
                class="flex items-center px-4 py-2 rounded-md text-white transition-colors"
                :class="playing ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
              >
                <svg v-if="!playing" class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 5v10l8-5-8-5z"/>
                </svg>
                <svg v-else class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 4h4v12H6V4zm8 0h4v12h-4V4z"/>
                </svg>
                {{ playing ? '暂停' : '播放' }}
              </button>
              
              <button
                @click="resetPlay"
                class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                重置
              </button>
              
              <button
                @click="stepNext"
                class="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                :disabled="stepIndex >= totalSteps"
              >
                单步
              </button>
            </div>

            <!-- Speed Control -->
            <div class="flex items-center space-x-3">
              <label class="text-sm font-medium text-gray-700">速度:</label>
              <select
                v-model="speed"
                class="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option :value="0.25">0.25x</option>
                <option :value="0.5">0.5x</option>
                <option :value="1">1x</option>
                <option :value="2">2x</option>
                <option :value="4">4x</option>
                <option :value="8">8x</option>
              </select>
            </div>

            <!-- Clear Records -->
            <button
              @click="clearAll"
              class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              清空记录
            </button>
          </div>

          <!-- Progress Bar -->
          <div class="mt-4">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>进度: {{ stepIndex }} / {{ totalSteps }}</span>
              <span>时间: {{ Math.round(currentTime / 1000) }}s / {{ Math.round(maxTime / 1000) }}s</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-500 h-2 rounded-full"
                :style="{ width: progressPercent + '%', transition: playing ? 'width 0.1s ease-out' : 'none' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Code Editor Display -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
            <h3 class="font-medium text-gray-800">代码编辑器</h3>
            <div class="flex items-center space-x-4">
              <!-- Language Selector -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">语言:</label>
                <select
                  v-model="currentLanguage"
                  class="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="c_cpp">C/C++</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
              <!-- Theme Selector -->
              <div class="flex items-center space-x-2">
                <label class="text-sm font-medium text-gray-700">主题:</label>
                <select
                  v-model="currentTheme"
                  class="px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="textmate">TextMate</option>
                  <option value="eclipse">Eclipse</option>
                  <option value="twilight">Twilight</option>
                  <option value="monokai">Monokai</option>
                </select>
              </div>
            </div>
          </div>
          <div class="relative">
            <v-ace-editor
              ref="editorRef"
              v-model:value="editorContent"
              :lang="currentLanguage"
              :theme="currentTheme"
              :options="editorOptions"
              class="replay-editor"
              style="height: 400px; width: 100%; transition: none; overflow: auto;"
            />
          </div>
        </div>

        <!-- Current Operation Info -->
        <div class="bg-white rounded-lg shadow-sm p-4" v-if="stepIndex > 0">
          <h3 class="font-medium text-gray-800 mb-3">当前操作</h3>
          <div class="space-y-2">
            <div class="flex items-center space-x-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {{ currentRecord ? (currentRecord.type === 0 ? '插入' : currentRecord.type === 1 ? '删除' : '其他') : '无操作' }}
              </span>
              <span class="text-sm text-gray-600">
                步骤: {{ stepIndex }} / {{ totalSteps }}
              </span>
              <span class="text-sm text-gray-600">
                时间: {{ Math.round(currentTime / 1000) }}s
              </span>
            </div>
            <div v-if="currentRecord && currentRecord.content" class="text-sm">
              <span class="text-gray-600">内容: </span>
              <code class="bg-gray-100 px-2 py-1 rounded">{{ currentRecord.content }}</code>
            </div>
          </div>
        </div>

        <!-- Records List -->
        <div class="bg-white rounded-lg shadow-sm p-4">
          <h3 class="font-medium text-gray-800 mb-3">操作记录 ({{ totalSteps }} 条)</h3>
          <div class="max-h-60 overflow-y-auto">
            <div
              v-for="(record, index) in recordList"
              :key="index"
              class="flex items-center justify-between py-2 px-3 rounded-md mb-1 transition-colors"
              :class="index === stepIndex - 1 ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50'"
            >
              <div class="flex items-center space-x-3">
                <span class="text-sm font-mono text-gray-500 w-8">{{ index + 1 }}</span>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      :class="getOperationTypeClass(record.type)">
                  {{ getOperationTypeText(record.type) }}
                </span>
                <span class="text-sm text-gray-600">
                  {{ record.content || '无内容' }}
                </span>
              </div>
              <span class="text-xs text-gray-500">
                {{ Math.round((record.timestamp || 0) / 1000) }}s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { VAceEditor } from 'vue3-ace-editor';
import '@/plugins/aceConfig.js';

// 简化的数据结构
const importText = ref('');
const recordList = ref<any[]>([]);
const stepIndex = ref(0);
const editorContent = ref('');
const playing = ref(false);
const speed = ref(1);
const currentTime = ref(0);
const playTimer = ref<number | null>(null);
const editorRef = ref();

// 编辑器主题和语言
const currentLanguage = ref('c_cpp');
const currentTheme = ref('textmate');

// 自动加载状态
const autoLoadedRecords = ref(false);

// 计算属性
const hasRecords = computed(() => recordList.value.length > 0);
const totalSteps = computed(() => recordList.value.length);
const maxTime = computed(() => {
  if (recordList.value.length === 0) return 0;
  return recordList.value[recordList.value.length - 1].timestamp || 0;
});
const progressPercent = computed(() => {
  if (totalSteps.value === 0) return 0;
  return Math.round((stepIndex.value / totalSteps.value) * 100);
});
const currentRecord = computed(() => {
  return stepIndex.value > 0 ? recordList.value[stepIndex.value - 1] : null;
});

// 编辑器配置
const editorOptions = {
  useWorker: true,
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: false, // 减少实时自动完成以提高性能
  enableSnippets: true,
  showPrintMargin: false,
  highlightActiveLine: true,
  highlightSelectedWord: true,
  tabSize: 4,
  wrap: false,
  readonly: true,
  minLines: 1, // 设置最小行数为1，让编辑器高度固定
  maxLines: Infinity, // 允许无限行，通过滚动显示
  fontSize: 14,
  showGutter: true,
  showLineNumbers: true,
  animatedScroll: false, // 禁用滚动动画
  fadeFoldWidgets: false, // 禁用折叠小部件的淡入淡出
  scrollPastEnd: 0.5, // 允许滚动到最后一行下方
  fixedWidthGutter: true, // 固定行号栏宽度
};

// 导入数据
const handleImport = () => {
  try {
    const data = JSON.parse(importText.value);
    if (Array.isArray(data)) {
      if (Array.isArray(data[0])) {
        // ACWing格式 [[type, ...], ...]
        recordList.value = parseACWingFormat(data);
      } else {
        // 数据库格式
        recordList.value = data;
      }
      resetPlay();
      alert(`导入成功！共 ${recordList.value.length} 条记录`);
    }
  } catch (error) {
    alert('数据格式错误！');
  }
};

// 解析ACWing格式
const parseACWingFormat = (data: any[][]) => {
  return data.map(item => {
    const [type, ...rest] = item;
    if (type === 0) {
      // 单字符插入操作 [0, row, col, char, timestamp]
      return {
        type,
        new_row: rest[0],
        new_col: rest[1], 
        content: rest[2],
        timestamp: rest[3]
      };
    } else if (type === 1) {
      // 删除操作 [1, startRow, startCol, endRow, endCol, timestamp]
      return {
        type,
        old_row: rest[0],
        old_col: rest[1],
        new_row: rest[2], 
        new_col: rest[3],
        timestamp: rest[4]
      };
    } else if (type === 7) {
      // 批量插入操作 [7, row, col, text, timestamp]
      return {
        type,
        new_row: rest[0],
        new_col: rest[1],
        content: rest[2],
        timestamp: rest[3]
      };
    } else {
      // 其他操作 (光标移动、撤销、重做等)
      return {
        type,
        old_row: rest[0],
        old_col: rest[1],
        new_row: rest[2],
        new_col: rest[3],
        timestamp: rest[4],
        content: rest[5] || null // 某些操作可能有内容
      };
    }
  });
};

// 智能语言检测
const detectLanguage = (content: string) => {
  if (!content.trim()) return 'c_cpp';
  
  // 检测常见的语言特征
  if (content.includes('def ') || content.includes('import ') || content.includes('print(')) {
    return 'python';
  }
  if (content.includes('public class ') || content.includes('System.out.')) {
    return 'java';
  }
  if (content.includes('function ') || content.includes('console.log') || content.includes('const ') || content.includes('let ')) {
    return 'javascript';
  }
  if (content.includes('package main') || content.includes('func main()')) {
    return 'go';
  }
  if (content.includes('fn main()') || content.includes('let mut ')) {
    return 'rust';
  }
  if (content.includes('#include') || content.includes('int main()') || content.includes('std::')) {
    return 'c_cpp';
  }
  
  return 'c_cpp'; // 默认
};

// 加载示例数据
const loadDemo = () => {
  const sampleData = `[[0,0,0,"#",203],[0,0,1,"i",311],[0,0,2,"n",403],[0,0,3,"c",497],[0,0,4,"l",553],[0,0,5,"u",636],[0,0,6,"d",721],[0,0,7,"e",776],[0,0,8," ",887],[0,0,9,"<",1034],[0,0,10,"i",1249],[0,0,11,"o",1305],[0,0,12,"s",1370],[0,0,13,"t",1545],[0,0,14,"r",1685],[0,0,15,"e",1751],[0,0,16,"a",1796],[0,0,17,"m",1835],[0,0,18,">",2093]]`;
  importText.value = sampleData;
  handleImport();
};

// 播放控制
const togglePlay = () => {
  console.log('Toggle play clicked, current playing:', playing.value);
  playing.value = !playing.value;
  if (playing.value) {
    startPlay();
  } else {
    stopPlay();
  }
  console.log('New playing state:', playing.value);
};

const startPlay = () => {
  console.log('Start play called');
  if (stepIndex.value >= totalSteps.value) {
    resetPlay();
  }
  scheduleNext();
};

const stopPlay = () => {
  console.log('Stop play called');
  if (playTimer.value) {
    clearTimeout(playTimer.value);
    playTimer.value = null;
  }
};

const resetPlay = () => {
  console.log('Reset play called');
  stopPlay();
  stepIndex.value = 0;
  currentTime.value = 0;
  editorContent.value = '';
  playing.value = false;
};

const stepNext = () => {
  console.log('Step next called, current step:', stepIndex.value);
  if (stepIndex.value < totalSteps.value) {
    executeStep(stepIndex.value);
    stepIndex.value++;
    console.log('Stepped to:', stepIndex.value);
  }
};

const scheduleNext = () => {
  console.log('Schedule next called, playing:', playing.value, 'step:', stepIndex.value, 'total:', totalSteps.value);
  if (!playing.value || stepIndex.value >= totalSteps.value) {
    playing.value = false;
    return;
  }
  
  const record = recordList.value[stepIndex.value];
  const delay = stepIndex.value === 0 ? 100 : 
    Math.max(30, (record.timestamp - currentTime.value) / speed.value); // 减少最小延迟到30ms
  
  console.log('Scheduling with delay:', delay);
  playTimer.value = setTimeout(() => {
    // 使用 requestAnimationFrame 来确保在浏览器重绘时更新
    requestAnimationFrame(() => {
      executeStep(stepIndex.value);
      stepIndex.value++;
      if (record.timestamp) {
        currentTime.value = record.timestamp;
      }
      scheduleNext();
    });
  }, delay);
};

const clearAll = () => {
  if (confirm('确定要清空所有记录吗？')) {
    stopPlay();
    recordList.value = [];
    importText.value = '';
    autoLoadedRecords.value = false; // 重置自动加载状态
    resetPlay();
  }
};

// 防抖更新编辑器内容
let updateTimer: number | null = null;
const updateEditorContent = (newContent: string) => {
  if (updateTimer) {
    clearTimeout(updateTimer);
  }
  updateTimer = setTimeout(() => {
    editorContent.value = newContent;
  }, 10); // 短暂延迟，合并连续更新
};

// 执行单步操作
const executeStep = (index: number) => {
  console.log('Execute step called for index:', index);
  const record = recordList.value[index];
  if (!record) {
    console.log('No record found for index:', index);
    return;
  }
  
  console.log('Executing record:', record);
  const lines = editorContent.value.split('\n');
  let newContent = '';
  
  if (record.type === 0) {
    // 单字符插入
    const row = record.new_row || 0;
    const col = record.new_col || 0;
    const char = record.content || '';
    
    console.log('Inserting char:', char, 'at', row, col);
    
    // 确保有足够的行
    while (lines.length <= row) {
      lines.push('');
    }
    
    const line = lines[row] || '';
    const newLine = line.substring(0, col) + char + line.substring(col);
    lines[row] = newLine;
    
    newContent = lines.join('\n');
    
    // 直接更新，不使用防抖（因为这是逐字符播放）
    editorContent.value = newContent;
    
    // 自动滚动到插入位置
    setTimeout(() => {
      if (editorRef.value && editorRef.value.aceEditor) {
        const editor = editorRef.value.aceEditor;
        editor.gotoLine(row + 1, col + 1, false); // 移动到插入位置
        editor.scrollToLine(row, true, true, () => {}); // 滚动到该行
      }
    }, 10);
    
    // 减少语言检测的频率，只在有足够内容时检测
    if (newContent.length > 20 && newContent.length % 10 === 0) {
      const detectedLang = detectLanguage(newContent);
      if (detectedLang !== currentLanguage.value) {
        currentLanguage.value = detectedLang;
        console.log('Language auto-detected:', detectedLang);
      }
    }
    
    console.log('New content length:', newContent.length);
  } else if (record.type === 7) {
    // 批量插入（粘贴、代码补全等）
    const row = record.new_row || 0;
    const col = record.new_col || 0;
    const text = record.content || '';
    
    console.log('Batch inserting text:', text, 'at', row, col);
    
    // 确保有足够的行
    while (lines.length <= row) {
      lines.push('');
    }
    
    const line = lines[row] || '';
    const beforeText = line.substring(0, col);
    const afterText = line.substring(col);
    
    // 处理多行文本插入
    const insertLines = text.split('\n');
    if (insertLines.length === 1) {
      // 单行文本
      lines[row] = beforeText + text + afterText;
    } else {
      // 多行文本
      lines[row] = beforeText + insertLines[0];
      // 插入中间的行
      for (let i = 1; i < insertLines.length - 1; i++) {
        lines.splice(row + i, 0, insertLines[i]);
      }
      // 最后一行
      if (insertLines.length > 1) {
        lines.splice(row + insertLines.length - 1, 0, insertLines[insertLines.length - 1] + afterText);
      }
    }
    
    newContent = lines.join('\n');
    editorContent.value = newContent;
    
    // 自动滚动到插入位置
    setTimeout(() => {
      if (editorRef.value && editorRef.value.aceEditor) {
        const editor = editorRef.value.aceEditor;
        const finalRow = row + insertLines.length - 1;
        const finalCol = insertLines.length === 1 ? col + text.length : insertLines[insertLines.length - 1].length;
        editor.gotoLine(finalRow + 1, finalCol, false);
        editor.scrollToLine(finalRow, true, true, () => {});
      }
    }, 10);
    
    // 语言检测
    const detectedLang = detectLanguage(newContent);
    if (detectedLang !== currentLanguage.value) {
      currentLanguage.value = detectedLang;
      console.log('Language auto-detected after batch insert:', detectedLang);
    }
    
    console.log('Batch insert completed, new content length:', newContent.length);
  } else if (record.type === 1) {
    // 删除操作
    const startRow = record.old_row || 0;
    const startCol = record.old_col || 0;
    const endRow = record.new_row || 0;
    const endCol = record.new_col || 0;
    
    console.log('Deleting from', startRow, startCol, 'to', endRow, endCol);
    
    if (startRow === endRow && lines[startRow]) {
      // 同行删除
      const line = lines[startRow];
      const newLine = line.substring(0, startCol) + line.substring(endCol);
      lines[startRow] = newLine;
    } else {
      // 跨行删除
      if (lines[startRow] && lines[endRow]) {
        const startPart = lines[startRow].substring(0, startCol);
        const endPart = lines[endRow].substring(endCol);
        lines[startRow] = startPart + endPart;
        lines.splice(startRow + 1, endRow - startRow);
      }
    }
    
    editorContent.value = lines.join('\n');
  }
  
  // 更新当前时间
  if (record.timestamp) {
    currentTime.value = record.timestamp;
  }
};

// 自动加载localStorage中的数据
const autoLoadFromStorage = () => {
  try {
    const storedData = localStorage.getItem('codeReplayData');
    if (storedData) {
      console.log('Found stored replay data, auto-loading...');
      const data = JSON.parse(storedData);
      if (Array.isArray(data) && data.length > 0) {
        // 检测数据格式
        if (Array.isArray(data[0])) {
          // ACWing格式
          recordList.value = parseACWingFormat(data);
        } else {
          // 数据库格式
          recordList.value = data;
        }
        resetPlay();
        autoLoadedRecords.value = true; // 设置自动加载状态
        console.log(`自动加载了 ${recordList.value.length} 条记录`);
        
        // 清除localStorage中的数据，避免重复加载
        localStorage.removeItem('codeReplayData');
        
        return true; // 表示成功加载了数据
      }
    }
  } catch (error) {
    console.error('自动加载记录失败:', error);
  }
  return false; // 表示没有加载到数据
};

// 生命周期
onMounted(() => {
  console.log('Component mounted');
  
  // 只加载必要的 Ace Editor 模式
  require('ace-builds/src-noconflict/mode-c_cpp');
  require('ace-builds/src-noconflict/mode-python');
  require('ace-builds/src-noconflict/mode-java');
  require('ace-builds/src-noconflict/mode-javascript');
  
  // 只加载你需要的主题
  require('ace-builds/src-noconflict/theme-textmate');
  require('ace-builds/src-noconflict/theme-eclipse');
  require('ace-builds/src-noconflict/theme-twilight');
  require('ace-builds/src-noconflict/theme-monokai');
  
  // 加载必要的工具
  require('ace-builds/src-noconflict/ext-language_tools');
  
  console.log('Ace Editor modules loaded');
  
  // 尝试自动加载localStorage中的数据
  const autoLoaded = autoLoadFromStorage();
  if (autoLoaded) {
    console.log('已自动加载编辑器中的记录数据');
  }
});

// Helper functions for operation type display
const getOperationTypeText = (type: number) => {
  switch (type) {
    case 0: return '插入';
    case 1: return '删除';
    case 2: return '光标';
    case 3: return '粘贴';
    case 4: return '撤销';
    case 5: return '重做';
    case 6: return '清空';
    case 7: return '批量插入';
    default: return '其他';
  }
};

const getOperationTypeClass = (type: number) => {
  switch (type) {
    case 0: return 'bg-green-100 text-green-800'; // 插入
    case 1: return 'bg-red-100 text-red-800';     // 删除
    case 2: return 'bg-blue-100 text-blue-800';   // 光标
    case 3: return 'bg-purple-100 text-purple-800'; // 粘贴
    case 4: return 'bg-yellow-100 text-yellow-800'; // 撤销
    case 5: return 'bg-indigo-100 text-indigo-800'; // 重做
    case 6: return 'bg-gray-100 text-gray-800';     // 清空
    case 7: return 'bg-orange-100 text-orange-800'; // 批量插入
    default: return 'bg-gray-100 text-gray-800';
  }
};

onUnmounted(() => {
  stopPlay();
  if (updateTimer) {
    clearTimeout(updateTimer);
  }
});
</script>

<style scoped>
.replay-editor {
  /* 减少编辑器的重绘和回流 */
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  /* 确保编辑器容器高度固定 */
  height: 400px !important;
  min-height: 400px !important;
  max-height: 400px !important;
  overflow: hidden;
}

.replay-editor :deep(.ace_editor) {
  /* 禁用不必要的动画和过渡 */
  transition: none !important;
  animation: none !important;
  /* 确保编辑器本身也是固定高度 */
  height: 400px !important;
  min-height: 400px !important;
  max-height: 400px !important;
}

.replay-editor :deep(.ace_cursor) {
  /* 隐藏光标，因为是只读模式 */
  display: none !important;
}

.replay-editor :deep(.ace_content) {
  /* 优化内容渲染 */
  will-change: auto;
}

.replay-editor :deep(.ace_scroller) {
  /* 确保滚动容器正确工作 */
  scroll-behavior: auto;
  overflow-y: auto !important;
  overflow-x: auto !important;
  height: 100% !important;
}

.replay-editor :deep(.ace_scrollbar-v) {
  /* 确保垂直滚动条显示 */
  display: block !important;
}

.replay-editor :deep(.ace_scrollbar-h) {
  /* 确保水平滚动条显示 */
  display: block !important;
}

/* 优化进度条动画 */
.bg-blue-500 {
  will-change: width;
}

/* 减少重排和重绘 */
.code-replay-container * {
  box-sizing: border-box;
}

/* 确保编辑器容器不会因为内容变化而改变大小 */
.code-replay-container .relative {
  height: 400px;
  overflow: hidden;
}
</style>