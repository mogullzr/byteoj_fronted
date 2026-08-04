<template>
  <div class="splitter-overlay" role="dialog" aria-modal="true" aria-label="整页答题图片切分">
    <div v-if="showUploadGuide" class="upload-guide-backdrop">
      <div v-if="guideImageEnlarged" class="upload-guide-image-viewer" @click.self="guideImageEnlarged = false">
        <button type="button" title="关闭大图" @click="guideImageEnlarged = false">×</button>
        <img
          src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/2026/08/6511afd6e1dd4b508bd63fdb2b3ba2b1.jpg"
          alt="整页答题图片书写与红线分隔示例大图"
        />
      </div>

      <section class="upload-guide" role="dialog" aria-modal="true" aria-labelledby="upload-guide-title">
        <header>
          <div>
            <h2 id="upload-guide-title">整页图片书写与拍摄规则</h2>
            <p>请先按示例整理答题区域，再拍照上传。</p>
          </div>
          <button type="button" class="icon-button" title="取消切分" @click="close">×</button>
        </header>

        <div class="upload-guide-content">
          <ol>
            <li><strong>同一道题的各部分横向排版</strong><span>一题的完整作答请放在同一个横向区域内。</span></li>
            <li><strong>不同题目用红色横线隔开</strong><span>红线尽量平直、清晰，并贯穿答题区域。</span></li>
            <li><strong>保持纸面完整、光线均匀</strong><span>不要遮挡红线，避免严重倾斜、阴影和模糊。</span></li>
          </ol>

          <figure>
            <button type="button" class="upload-guide-image-button" title="点击放大示例图片" @click="guideImageEnlarged = true">
              <img
                src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/2026/08/6511afd6e1dd4b508bd63fdb2b3ba2b1.jpg"
                alt="整页答题图片书写与红线分隔示例"
              />
            </button>
            <figcaption>正确示例：每题占一个横向区域，题目之间使用清晰红线分隔</figcaption>
          </figure>
        </div>

        <footer>
          <label class="upload-guide-dismiss-option">
            <input v-model="dontShowUploadGuideAgain" type="checkbox" />
            本浏览器不再显示此提示
          </label>
          <div>
            <button type="button" @click="close">取消</button>
            <button type="button" class="primary-button" @click="confirmUploadGuide">我已了解，开始切分</button>
          </div>
        </footer>
      </section>
    </div>

    <section
      class="splitter-shell"
      :class="{ 'is-dragging-files': isDraggingFiles }"
      @dragenter.prevent="handleFilesDragEnter"
      @dragover.prevent="isDraggingFiles = true"
      @dragleave.prevent="handleFilesDragLeave"
      @drop.prevent="addDroppedFiles"
    >
      <header class="splitter-header">
        <div>
          <h2>整页答题图片切分</h2>
          <p>红笔横线用于分题。自动识别后请检查切割位置，再映射并上传。</p>
        </div>
        <button class="icon-button close-button" type="button" title="关闭" :disabled="uploading" @click="close">
          ×
        </button>
      </header>

      <div class="splitter-toolbar">
        <input
          ref="fileInput"
          class="hidden-input"
          type="file"
          accept="image/*"
          multiple
          @change="addFiles"
        />
        <input
          ref="cameraInput"
          class="hidden-input"
          type="file"
          accept="image/*"
          capture="environment"
          @change="addFiles"
        />
        <button type="button" class="primary-button" :disabled="loadingFiles || uploading" @click="fileInput?.click()">
          {{ loadingFiles ? '正在读取...' : '添加整页图片' }}
        </button>
        <button type="button" class="camera-add-button" :disabled="loadingFiles || uploading" @click="cameraInput?.click()">
          拍照添加
        </button>
        <button
          type="button"
          class="phone-camera-add-button"
          :disabled="loadingFiles || uploading"
          @click="emit('requestPhoneCamera')"
        >
          手机连续拍照
        </button>
        <div class="view-switch" aria-label="查看方式">
          <button type="button" :class="{ active: viewMode === 'edit' }" @click="viewMode = 'edit'">编辑</button>
          <button type="button" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">并列</button>
          <button type="button" :class="{ active: viewMode === 'vertical' }" @click="viewMode = 'vertical'">纵向</button>
          <button type="button" :class="{ active: viewMode === 'mapping' }" @click="viewMode = 'mapping'">题目映射</button>
        </div>
        <span class="page-summary">{{ pages.length }} 张图片，{{ allSegments.length }} 个片段</span>
      </div>

      <div v-if="!pages.length" class="empty-state">
        <strong>请先添加答题纸照片</strong>
        <span>电脑可直接拖入多张，手机可逐张拍照添加。</span>
      </div>

      <div v-else class="splitter-body">
        <aside class="page-list">
          <div class="page-list-title">图片顺序</div>
          <div
            v-for="(page, index) in pages"
            :key="page.id"
            class="page-list-item"
            :class="{ selected: selectedPageId === page.id }"
            role="button"
            tabindex="0"
            @click="selectPage(page.id)"
            @keydown.enter="selectPage(page.id)"
            @keydown.space.prevent="selectPage(page.id)"
          >
            <img :src="page.previewUrl" :alt="`第 ${index + 1} 张图片`" />
            <span>
              <b>第 {{ index + 1 }} 张</b>
              <small>{{ page.cuts.length + 1 }} 个片段</small>
            </span>
            <span class="page-actions">
              <button type="button" title="上移" :disabled="index === 0 || uploading" @click.stop="movePage(index, -1)">↑</button>
              <button type="button" title="下移" :disabled="index === pages.length - 1 || uploading" @click.stop="movePage(index, 1)">↓</button>
              <button type="button" title="删除" :disabled="uploading" @click.stop="removePage(index)">×</button>
            </span>
          </div>
        </aside>

        <main class="workspace">
          <template v-if="viewMode === 'edit' && selectedPage">
            <div class="editor-toolbar">
              <div class="mode-switch">
                <button type="button" :class="{ active: editMode === 'cut' }" @click="editMode = 'cut'">分割线</button>
                <button type="button" :class="{ active: editMode === 'mask' }" @click="editMode = 'mask'">去除涂改区</button>
              </div>
              <button type="button" @click="redetectSelected">重新识别红线</button>
              <button type="button" :disabled="editMode !== 'mask' || !selectedPage.removals.length" @click="clearMasks">
                清空涂改区
              </button>
              <span class="editor-hint">
                {{ editMode === 'cut' ? '单击空白处添加分割线，拖动红线调整位置。' : '在图片上拖动框选需要变白的区域。' }}
              </span>
            </div>

            <div class="image-editor-scroll">
              <div
                ref="editorImage"
                class="image-editor"
                :class="`mode-${editMode}`"
                :style="{ aspectRatio: `${selectedPage.sourceCanvas.width} / ${selectedPage.sourceCanvas.height}` }"
                @pointerdown="startEditorPointer"
                @pointermove="moveEditorPointer"
                @pointerup="finishEditorPointer"
                @pointercancel="cancelEditorPointer"
              >
                <img :src="selectedPage.previewUrl" alt="当前待切分答题图片" draggable="false" />
                <div
                  v-for="(cut, cutIndex) in selectedPage.cuts"
                  :key="`cut-${cutIndex}`"
                  class="cut-line"
                  :style="{ top: `${cut * 100}%` }"
                  title="拖动调整分割线"
                  @pointerdown.stop="startCutDrag($event, cutIndex)"
                >
                  <span>分割 {{ cutIndex + 1 }}</span>
                  <button type="button" title="删除这条分割线" @pointerdown.stop @click.stop="deleteCut(cutIndex)">×</button>
                </div>
                <button
                  v-for="(mask, maskIndex) in selectedPage.removals"
                  :key="`mask-${maskIndex}`"
                  type="button"
                  class="mask-area"
                  :style="rectStyle(mask)"
                  title="点击删除这个涂改区域"
                  @pointerdown.stop
                  @click.stop="deleteMask(maskIndex)"
                >
                  <span>去除 ×</span>
                </button>
                <div v-if="draftMask" class="mask-area draft-mask" :style="rectStyle(draftMask)"></div>
              </div>
            </div>

            <label v-if="selectedPageIndex < pages.length - 1" class="continuation-option">
              <input v-model="selectedPage.joinWithNext" type="checkbox" @change="autoMapSegments" />
              本页最后一个片段与下一张图片的第一个片段属于同一道题
            </label>
          </template>

          <div v-else-if="viewMode === 'grid'" class="overview-grid">
            <figure v-for="(page, index) in pages" :key="page.id">
              <img :src="page.previewUrl" :alt="`第 ${index + 1} 张图片`" />
              <figcaption>第 {{ index + 1 }} 张 · {{ page.cuts.length + 1 }} 个片段</figcaption>
            </figure>
          </div>

          <div v-else-if="viewMode === 'vertical'" class="overview-vertical">
            <figure v-for="(page, index) in pages" :key="page.id">
              <img :src="page.previewUrl" :alt="`第 ${index + 1} 张图片`" />
              <figcaption>第 {{ index + 1 }} 张</figcaption>
            </figure>
          </div>

          <div v-else class="mapping-workspace">
            <div class="mapping-toolbar">
              <div>
                <strong>片段与题目映射</strong>
                <span>同一题选择多个片段时，上传前会自动等宽纵向拼接。</span>
              </div>
              <button type="button" @click="autoMapSegments">按试卷顺序重新映射</button>
            </div>
            <div class="mapping-question-filter">
              <div class="mapping-question-filter-title">
                <span>
                  <strong>参与本次映射</strong>
                  <small>已选择 {{ activeMappingQuestions.length }}/{{ questions.length }} 题</small>
                </span>
                <button
                  type="button"
                  :disabled="uploading || activeMappingQuestions.length === questions.length"
                  @click="includeAllQuestions"
                >
                  全部参与
                </button>
              </div>
              <div class="mapping-question-options">
                <label
                  v-for="question in questions"
                  :key="question.problemId"
                  :class="{ ignored: isQuestionIgnored(question.problemId) }"
                >
                  <input
                    type="checkbox"
                    :checked="!isQuestionIgnored(question.problemId)"
                    :disabled="uploading"
                    @change="setQuestionIncluded(question.problemId, ($event.target as HTMLInputElement).checked)"
                  />
                  <span>第 {{ question.order }} 题</span>
                  <small>{{ question.typeLabel }}{{ question.hasImage ? ' · 将覆盖原图' : '' }}</small>
                </label>
              </div>
            </div>
            <div class="mapping-table-wrap">
              <table class="mapping-table">
                <thead>
                  <tr>
                    <th>片段</th>
                    <th>来源</th>
                    <th>提交到</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="segment in allSegments" :key="segment.key">
                    <td>片段 {{ segment.globalIndex + 1 }}</td>
                    <td>第 {{ segment.pageIndex + 1 }} 张 / 第 {{ segment.segmentIndex + 1 }} 段</td>
                    <td>
                      <select v-model="segmentAssignments[segment.key]" :disabled="uploading">
                        <option :value="null">请选择题目</option>
                        <option
                          v-for="question in activeMappingQuestions"
                          :key="question.problemId"
                          :value="question.problemId"
                        >
                          第 {{ question.order }} 题 · {{ question.typeLabel }}{{ question.hasImage ? '（将覆盖原图）' : '' }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <span v-if="segmentAssignments[segment.key]" class="status-ready">已映射</span>
                      <span v-else class="status-missing">未映射</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="uploadStates.length" class="upload-status-list">
              <div v-for="item in uploadStates" :key="item.problemId">
                <span>第 {{ item.order }} 题</span>
                <b :class="`upload-${item.status}`">{{ uploadStatusLabel(item.status) }}</b>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer class="splitter-footer">
        <span v-if="message" :class="messageType === 'error' ? 'footer-error' : 'footer-message'">{{ message }}</span>
        <span v-else>图片处理全部在浏览器本地完成，只有最终题目图片会上传。</span>
        <div>
          <button type="button" :disabled="uploading" @click="close">取消</button>
          <button
            type="button"
            class="primary-button"
            :disabled="!pages.length || uploading || loadingFiles"
            @click="uploadAndApply"
          >
            {{ uploading ? `正在上传 ${uploadCompleted}/${uploadTotal}` : '确认切分并上传' }}
          </button>
        </div>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  MIN_CUT_GAP,
  NormalizedRect,
  canvasToFile,
  cropCanvas,
  detectRedCuts,
  imageToCanvas,
  loadImageFile,
  stitchCanvasesVertically,
} from './examImageSplitter'

type SplitterQuestion = {
  problemId: number
  order: number
  typeLabel: string
  hasImage: boolean
}

type SourcePage = {
  id: number
  file: File
  sourceCanvas: HTMLCanvasElement
  previewUrl: string
  cuts: number[]
  removals: NormalizedRect[]
  joinWithNext: boolean
}

type Segment = {
  key: string
  pageId: number
  pageIndex: number
  segmentIndex: number
  globalIndex: number
  top: number
  bottom: number
}

type UploadState = {
  problemId: number
  order: number
  status: 'waiting' | 'processing' | 'uploading' | 'success' | 'failed'
}

const props = defineProps<{
  questions: SplitterQuestion[]
  uploadImage: (file: File, problemId: number) => Promise<string>
  initialFiles?: File[]
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'applied', result: Record<number, string>): void
  (event: 'requestPhoneCamera'): void
}>()

const pages = reactive<SourcePage[]>([])
const selectedPageId = ref<number | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const cameraInput = ref<HTMLInputElement | null>(null)
const editorImage = ref<HTMLElement | null>(null)
const viewMode = ref<'edit' | 'grid' | 'vertical' | 'mapping'>('edit')
const editMode = ref<'cut' | 'mask'>('cut')
const loadingFiles = ref(false)
const uploading = ref(false)
const uploadCompleted = ref(0)
const uploadTotal = ref(0)
const uploadStates = ref<UploadState[]>([])
const message = ref('')
const messageType = ref<'info' | 'error'>('info')
const isDraggingFiles = ref(false)
const UPLOAD_GUIDE_STORAGE_KEY = 'byteoj-exam-image-splitter-guide-dismissed'
const isUploadGuideDismissed = () => {
  try {
    return localStorage.getItem(UPLOAD_GUIDE_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}
const showUploadGuide = ref(!isUploadGuideDismissed())
const dontShowUploadGuideAgain = ref(false)
const guideImageEnlarged = ref(false)
const segmentAssignments = reactive<Record<string, number | null>>({})
const ignoredQuestions = reactive<Record<number, boolean>>({})
let nextPageId = 1
let draggingCutIndex: number | null = null
let maskStart: { x: number; y: number } | null = null
const draftMask = ref<NormalizedRect | null>(null)

const selectedPageIndex = computed(() => pages.findIndex(page => page.id === selectedPageId.value))
const selectedPage = computed(() => pages[selectedPageIndex.value] || null)
const activeMappingQuestions = computed(() =>
  props.questions.filter(question => !ignoredQuestions[question.problemId]),
)

const allSegments = computed<Segment[]>(() => {
  const result: Segment[] = []
  pages.forEach((page, pageIndex) => {
    const boundaries = [0, ...page.cuts.slice().sort((a, b) => a - b), 1]
    for (let index = 0; index < boundaries.length - 1; index += 1) {
      result.push({
        key: `${page.id}-${index}`,
        pageId: page.id,
        pageIndex,
        segmentIndex: index,
        globalIndex: result.length,
        top: boundaries[index],
        bottom: boundaries[index + 1],
      })
    }
  })
  return result
})

const clamp = (value: number, minimum = 0, maximum = 1) => Math.max(minimum, Math.min(maximum, value))

const setMessage = (text: string, type: 'info' | 'error' = 'info') => {
  message.value = text
  messageType.value = type
}

const confirmUploadGuide = () => {
  if (dontShowUploadGuideAgain.value) {
    try {
      localStorage.setItem(UPLOAD_GUIDE_STORAGE_KEY, '1')
    } catch {
      // 浏览器禁用本地存储时，本次仍可正常进入切分工具。
    }
  }
  showUploadGuide.value = false
}

const selectPage = (pageId: number) => {
  selectedPageId.value = pageId
  viewMode.value = 'edit'
  cancelEditorPointer()
}

const ingestFiles = async (inputFiles: File[]) => {
  const files = inputFiles.filter(file => file.type.startsWith('image/'))
  if (!files.length) return
  loadingFiles.value = true
  setMessage('正在读取并识别红色分割线...')
  try {
    for (const file of files) {
      const image = await loadImageFile(file)
      const maximumWidth = 2400
      const maximumHeight = 3200
      const scale = Math.min(1, maximumWidth / image.naturalWidth, maximumHeight / image.naturalHeight)
      const canvas = markRaw(imageToCanvas(image, image.naturalWidth * scale, image.naturalHeight * scale))
      const page: SourcePage = {
        id: nextPageId++,
        file,
        sourceCanvas: canvas,
        previewUrl: URL.createObjectURL(file),
        cuts: detectRedCuts(canvas),
        removals: [],
        joinWithNext: false,
      }
      pages.push(page)
      if (selectedPageId.value === null) selectedPageId.value = page.id
    }
    autoMapSegments()
    setMessage(`已添加 ${files.length} 张图片，请检查红色分割线。`)
  } catch (error) {
    setMessage(error instanceof Error ? error.message : '读取图片失败。', 'error')
  } finally {
    loadingFiles.value = false
  }
}

defineExpose({ addExternalFiles: ingestFiles })

const addFiles = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  target.value = ''
  await ingestFiles(files)
}

const handleFilesDragEnter = (event: DragEvent) => {
  const hasFiles = Array.from(event.dataTransfer?.items || []).some(item => item.kind === 'file')
  if (hasFiles) isDraggingFiles.value = true
}

const handleFilesDragLeave = (event: DragEvent) => {
  const shell = event.currentTarget as HTMLElement
  const nextTarget = event.relatedTarget as Node | null
  if (!nextTarget || !shell.contains(nextTarget)) isDraggingFiles.value = false
}

const addDroppedFiles = async (event: DragEvent) => {
  isDraggingFiles.value = false
  if (loadingFiles.value || uploading.value) return
  const files = Array.from(event.dataTransfer?.files || [])
  if (!files.some(file => file.type.startsWith('image/'))) {
    setMessage('请拖入 jpg、png 等图片文件。', 'error')
    return
  }
  await ingestFiles(files)
}

const movePage = (index: number, offset: number) => {
  const destination = index + offset
  if (destination < 0 || destination >= pages.length) return
  const current = pages[index]
  pages.splice(index, 1)
  pages.splice(destination, 0, current)
  autoMapSegments()
}

const removePage = (index: number) => {
  const page = pages[index]
  URL.revokeObjectURL(page.previewUrl)
  pages.splice(index, 1)
  if (selectedPageId.value === page.id) {
    selectedPageId.value = pages[Math.min(index, pages.length - 1)]?.id ?? null
  }
  autoMapSegments()
}

const redetectSelected = () => {
  if (!selectedPage.value) return
  selectedPage.value.cuts = detectRedCuts(selectedPage.value.sourceCanvas)
  autoMapSegments()
  setMessage(`识别到 ${selectedPage.value.cuts.length} 条红色分割线。`)
}

const clearMasks = () => {
  if (selectedPage.value) selectedPage.value.removals = []
}

const deleteCut = (index: number) => {
  if (!selectedPage.value) return
  selectedPage.value.cuts.splice(index, 1)
  autoMapSegments()
}

const deleteMask = (index: number) => {
  selectedPage.value?.removals.splice(index, 1)
}

const pointInEditor = (event: PointerEvent) => {
  const rect = editorImage.value?.getBoundingClientRect()
  if (!rect) return null
  return {
    x: clamp((event.clientX - rect.left) / rect.width),
    y: clamp((event.clientY - rect.top) / rect.height),
  }
}

const insertCut = (ratio: number) => {
  const page = selectedPage.value
  if (!page || ratio < 0.02 || ratio > 0.98) return
  if (page.cuts.some(cut => Math.abs(cut - ratio) < MIN_CUT_GAP)) return
  page.cuts.push(ratio)
  page.cuts.sort((a, b) => a - b)
  autoMapSegments()
}

const startEditorPointer = (event: PointerEvent) => {
  if (uploading.value) return
  const point = pointInEditor(event)
  if (!point) return
  editorImage.value?.setPointerCapture(event.pointerId)
  if (editMode.value === 'cut') {
    insertCut(point.y)
  } else {
    maskStart = point
    draftMask.value = { left: point.x, top: point.y, right: point.x, bottom: point.y }
  }
}

const startCutDrag = (event: PointerEvent, index: number) => {
  if (uploading.value || !editorImage.value) return
  draggingCutIndex = index
  editorImage.value.setPointerCapture(event.pointerId)
}

const moveEditorPointer = (event: PointerEvent) => {
  const point = pointInEditor(event)
  const page = selectedPage.value
  if (!point || !page) return
  if (draggingCutIndex !== null) {
    const previous = page.cuts[draggingCutIndex - 1] ?? 0
    const next = page.cuts[draggingCutIndex + 1] ?? 1
    page.cuts[draggingCutIndex] = clamp(point.y, previous + MIN_CUT_GAP, next - MIN_CUT_GAP)
  } else if (maskStart) {
    draftMask.value = {
      left: Math.min(maskStart.x, point.x),
      top: Math.min(maskStart.y, point.y),
      right: Math.max(maskStart.x, point.x),
      bottom: Math.max(maskStart.y, point.y),
    }
  }
}

const finishEditorPointer = (event: PointerEvent) => {
  if (editorImage.value?.hasPointerCapture(event.pointerId)) editorImage.value.releasePointerCapture(event.pointerId)
  if (draggingCutIndex !== null) {
    draggingCutIndex = null
    autoMapSegments()
    return
  }
  if (maskStart && draftMask.value && selectedPage.value) {
    const mask = draftMask.value
    if (mask.right - mask.left > 0.01 && mask.bottom - mask.top > 0.01) {
      selectedPage.value.removals.push(mask)
    }
  }
  maskStart = null
  draftMask.value = null
}

const cancelEditorPointer = () => {
  draggingCutIndex = null
  maskStart = null
  draftMask.value = null
}

const rectStyle = (rect: NormalizedRect) => ({
  left: `${rect.left * 100}%`,
  top: `${rect.top * 100}%`,
  width: `${(rect.right - rect.left) * 100}%`,
  height: `${(rect.bottom - rect.top) * 100}%`,
})

const isQuestionIgnored = (problemId: number) => Boolean(ignoredQuestions[problemId])

const setQuestionIncluded = (problemId: number, included: boolean) => {
  if (included) delete ignoredQuestions[problemId]
  else ignoredQuestions[problemId] = true
  autoMapSegments()
}

const includeAllQuestions = () => {
  Object.keys(ignoredQuestions).forEach(problemId => delete ignoredQuestions[Number(problemId)])
  autoMapSegments()
}

const autoMapSegments = () => {
  const validKeys = new Set(allSegments.value.map(segment => segment.key))
  Object.keys(segmentAssignments).forEach(key => {
    if (!validKeys.has(key)) delete segmentAssignments[key]
  })
  let questionIndex = 0
  let previousProblemId: number | null = null
  allSegments.value.forEach(segment => {
    const previousPage = pages[segment.pageIndex - 1]
    const continuesPrevious = segment.segmentIndex === 0 && previousPage?.joinWithNext && previousProblemId !== null
    if (continuesPrevious) {
      segmentAssignments[segment.key] = previousProblemId
      return
    }
    const question = activeMappingQuestions.value[questionIndex]
    segmentAssignments[segment.key] = question?.problemId ?? null
    previousProblemId = question?.problemId ?? null
    questionIndex += 1
  })
}

const uploadStatusLabel = (status: UploadState['status']) => {
  const labels = {
    waiting: '等待处理',
    processing: '正在拼接',
    uploading: '正在上传',
    success: '上传成功',
    failed: '上传失败',
  }
  return labels[status]
}

const uploadAndApply = async () => {
  if (!allSegments.value.length) return
  const missing = allSegments.value.filter(segment => !segmentAssignments[segment.key])
  if (missing.length) {
    viewMode.value = 'mapping'
    setMessage(`还有 ${missing.length} 个片段没有选择题目。`, 'error')
    return
  }

  const grouped = new Map<number, Segment[]>()
  allSegments.value.forEach(segment => {
    const problemId = segmentAssignments[segment.key]
    if (!problemId) return
    const current = grouped.get(problemId) || []
    current.push(segment)
    grouped.set(problemId, current)
  })
  if (!grouped.size) return

  uploading.value = true
  viewMode.value = 'mapping'
  uploadCompleted.value = 0
  uploadTotal.value = grouped.size
  const questionById = new Map(props.questions.map(question => [question.problemId, question]))
  uploadStates.value = Array.from(grouped.keys()).map(problemId => ({
    problemId,
    order: questionById.get(problemId)?.order ?? problemId,
    status: 'waiting',
  }))
  const results: Record<number, string> = {}

  try {
    for (const state of uploadStates.value) {
      state.status = 'processing'
      const segments = grouped.get(state.problemId) || []
      const crops = segments.map(segment => {
        const page = pages.find(item => item.id === segment.pageId)
        if (!page) throw new Error('找不到片段对应的原图。')
        return cropCanvas(page.sourceCanvas, segment.top, segment.bottom, page.removals)
      })
      const merged = stitchCanvasesVertically(crops)
      const file = await canvasToFile(merged, `exam-answer-${state.order}.jpg`, 0.97)
      state.status = 'uploading'
      try {
        results[state.problemId] = await props.uploadImage(file, state.problemId)
        state.status = 'success'
        uploadCompleted.value += 1
      } catch (error) {
        state.status = 'failed'
        throw error
      }
    }
    setMessage(`已成功上传 ${uploadCompleted.value} 道题的答案图片。`)
    emit('applied', results)
  } catch (error) {
    setMessage(error instanceof Error ? error.message : '图片上传失败，请重试。', 'error')
  } finally {
    uploading.value = false
  }
}

const close = () => {
  if (!uploading.value) emit('close')
}

onMounted(() => {
  if (props.initialFiles?.length) void ingestFiles(props.initialFiles)
})

onBeforeUnmount(() => {
  pages.forEach(page => URL.revokeObjectURL(page.previewUrl))
})
</script>

<style scoped>
.splitter-overlay,
.splitter-overlay * {
  box-sizing: border-box;
}

.splitter-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.72);
  color: #172033;
  font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
}

.upload-guide-backdrop {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.78);
}

.upload-guide-image-viewer {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 24px 24px;
  background: rgba(3, 7, 18, 0.94);
}

.upload-guide-image-viewer > button {
  position: absolute;
  top: 18px;
  right: 20px;
  width: 38px;
  height: 38px;
  padding: 0;
  border-color: #64748b;
  background: #ffffff;
  color: #1f2937;
  font-size: 24px;
  line-height: 1;
}

.upload-guide-image-viewer > img {
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 100%;
  display: block;
  object-fit: contain;
  background: #ffffff;
}

.upload-guide {
  width: min(780px, 100%);
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.4);
}

.upload-guide > header,
.upload-guide > footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 18px;
}

.upload-guide > header {
  border-bottom: 1px solid #dbe2ea;
}

.upload-guide h2 {
  margin: 0;
  font-size: 19px;
  line-height: 1.4;
}

.upload-guide header p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 13px;
}

.upload-guide-content {
  min-height: 0;
  overflow: auto;
  padding: 16px 18px;
}

.upload-guide ol {
  margin: 0 0 14px;
  padding-left: 26px;
}

.upload-guide li {
  padding: 4px 0 4px 3px;
  color: #263449;
  font-size: 14px;
}

.upload-guide li strong,
.upload-guide li span {
  display: block;
}

.upload-guide li span {
  margin-top: 2px;
  color: #64748b;
  font-size: 12px;
}

.upload-guide figure {
  margin: 0;
  border: 1px solid #dbe2ea;
  background: #f8fafc;
}

.upload-guide-image-button {
  width: 100%;
  min-height: 0;
  display: block;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 0;
  background: #ffffff;
  cursor: zoom-in;
}

.upload-guide-image-button:hover:not(:disabled) {
  border-color: transparent;
}

.upload-guide img {
  width: 100%;
  max-height: 46vh;
  display: block;
  object-fit: contain;
  background: #ffffff;
}

.upload-guide figcaption {
  padding: 8px 10px;
  color: #475569;
  font-size: 12px;
  text-align: center;
}

.upload-guide > footer {
  border-top: 1px solid #dbe2ea;
  background: #f8fafc;
}

.upload-guide > footer > div {
  display: flex;
  gap: 10px;
}

.upload-guide-dismiss-option {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #475569;
  cursor: pointer;
  font-size: 13px;
}

.upload-guide-dismiss-option input {
  width: 16px;
  height: 16px;
  margin: 0;
}

.splitter-shell {
  width: min(1480px, 100%);
  height: min(920px, calc(100vh - 40px));
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  overflow: hidden;
  background: #f6f8fb;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.32);
}

.splitter-shell.is-dragging-files {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2), 0 24px 70px rgba(15, 23, 42, 0.32);
}

.splitter-header,
.splitter-toolbar,
.splitter-footer {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ffffff;
}

.splitter-header {
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid #dbe2ea;
}

.splitter-header h2 {
  margin: 0;
  font-size: 20px;
  line-height: 1.4;
}

.splitter-header p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 13px;
}

button,
select {
  font: inherit;
}

button {
  min-height: 34px;
  padding: 6px 13px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #263449;
  cursor: pointer;
}

button:hover:not(:disabled) {
  border-color: #2563eb;
  color: #1d4ed8;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.primary-button {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
  font-weight: 600;
}

.primary-button:hover:not(:disabled) {
  background: #1d4ed8;
  color: #ffffff;
}

.icon-button {
  width: 36px;
  min-width: 36px;
  height: 36px;
  padding: 0;
  font-size: 24px;
  line-height: 1;
}

.hidden-input {
  display: none;
}

.camera-add-button {
  display: none;
}

.phone-camera-add-button {
  border-color: #2563eb;
  color: #1d4ed8;
  font-weight: 600;
}

.splitter-toolbar {
  padding: 10px 18px;
  border-bottom: 1px solid #dbe2ea;
}

.view-switch,
.mode-switch {
  display: inline-flex;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
}

.view-switch button,
.mode-switch button {
  border: 0;
  border-right: 1px solid #cbd5e1;
  border-radius: 0;
}

.view-switch button:last-child,
.mode-switch button:last-child {
  border-right: 0;
}

.view-switch button.active,
.mode-switch button.active {
  background: #e8f0ff;
  color: #1d4ed8;
  font-weight: 600;
}

.page-summary {
  margin-left: auto;
  color: #64748b;
  font-size: 13px;
}

.empty-state {
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
}

.empty-state strong {
  color: #263449;
  font-size: 18px;
}

.splitter-body {
  min-height: 0;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
}

.page-list {
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  border-right: 1px solid #dbe2ea;
  background: #eef2f6;
}

.page-list-title {
  padding: 2px 4px 10px;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.page-list-item {
  width: 100%;
  min-height: 74px;
  display: grid;
  grid-template-columns: 50px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  margin-bottom: 8px;
  padding: 7px;
  text-align: left;
}

.page-list-item.selected {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.14);
}

.page-list-item img {
  width: 50px;
  height: 58px;
  object-fit: cover;
  border: 1px solid #dbe2ea;
}

.page-list-item b,
.page-list-item small {
  display: block;
}

.page-list-item small {
  margin-top: 3px;
  color: #64748b;
}

.page-actions {
  display: grid;
  gap: 2px;
}

.page-actions button {
  width: 25px;
  min-width: 25px;
  min-height: 22px;
  padding: 0;
  line-height: 20px;
}

.workspace {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-toolbar,
.mapping-toolbar {
  min-height: 54px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border-bottom: 1px solid #dbe2ea;
  background: #ffffff;
}

.editor-hint {
  margin-left: auto;
  color: #64748b;
  font-size: 12px;
}

.image-editor-scroll {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: 18px;
  background: #dfe5ec;
}

.image-editor {
  position: relative;
  width: min(920px, 100%);
  margin: 0 auto;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.16);
  user-select: none;
  touch-action: none;
}

.image-editor.mode-cut {
  cursor: crosshair;
}

.image-editor.mode-mask {
  cursor: cell;
}

.image-editor > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.cut-line {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 3;
  height: 4px;
  transform: translateY(-50%);
  background: #dc2626;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.9);
  cursor: row-resize;
}

.cut-line > span {
  position: absolute;
  left: 5px;
  top: 5px;
  padding: 2px 6px;
  border-radius: 3px;
  background: #dc2626;
  color: #ffffff;
  font-size: 11px;
}

.cut-line > button {
  position: absolute;
  top: -13px;
  right: 5px;
  width: 26px;
  min-width: 26px;
  min-height: 26px;
  padding: 0;
  border-color: #dc2626;
  background: #ffffff;
  color: #b91c1c;
  font-size: 18px;
  line-height: 22px;
}

.mask-area {
  position: absolute;
  z-index: 2;
  min-height: 0;
  padding: 0;
  border: 2px dashed #475569;
  border-radius: 0;
  background: rgba(255, 255, 255, 0.78);
  color: #334155;
}

.mask-area span {
  position: absolute;
  right: 2px;
  top: 2px;
  padding: 1px 4px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 10px;
}

.draft-mask {
  pointer-events: none;
  background: rgba(255, 255, 255, 0.5);
}

.continuation-option {
  min-height: 46px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid #dbe2ea;
  background: #ffffff;
  font-size: 13px;
}

.overview-grid,
.overview-vertical {
  min-height: 0;
  overflow: auto;
  padding: 18px;
  background: #dfe5ec;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  align-content: start;
  gap: 16px;
}

.overview-grid figure,
.overview-vertical figure {
  margin: 0;
}

.overview-grid img,
.overview-vertical img {
  display: block;
  width: 100%;
  height: auto;
  background: #ffffff;
}

.overview-grid figcaption,
.overview-vertical figcaption {
  padding: 6px 8px;
  background: #ffffff;
  color: #64748b;
  font-size: 12px;
}

.overview-vertical figure {
  width: min(900px, 100%);
  margin: 0 auto;
}

.mapping-workspace {
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.mapping-toolbar {
  justify-content: space-between;
}

.mapping-toolbar strong,
.mapping-toolbar span {
  display: block;
}

.mapping-toolbar span {
  margin-top: 2px;
  color: #64748b;
  font-size: 12px;
}

.mapping-question-filter {
  padding: 10px 14px;
  border-bottom: 1px solid #dbe2ea;
  background: #f8fafc;
}

.mapping-question-filter-title,
.mapping-question-filter-title > span {
  display: flex;
  align-items: center;
}

.mapping-question-filter-title {
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.mapping-question-filter-title > span {
  gap: 10px;
}

.mapping-question-filter-title small {
  color: #64748b;
  font-size: 12px;
}

.mapping-question-filter-title button {
  min-height: 30px;
  padding: 0 10px;
}

.mapping-question-options {
  max-height: 112px;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 7px;
}

.mapping-question-options label {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border: 1px solid #b8c5d4;
  border-radius: 4px;
  background: #ffffff;
  color: #1f2937;
  cursor: pointer;
  font-size: 12px;
}

.mapping-question-options label.ignored {
  border-color: #dbe2ea;
  background: #eef2f6;
  color: #94a3b8;
}

.mapping-question-options input {
  width: 15px;
  height: 15px;
  margin: 0;
}

.mapping-question-options small {
  color: #64748b;
  font-size: 11px;
}

.mapping-question-options label.ignored small {
  color: #94a3b8;
}

.mapping-table-wrap {
  min-height: 0;
  overflow: auto;
  flex: 1;
  padding: 14px;
}

.mapping-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
}

.mapping-table th,
.mapping-table td {
  padding: 10px 12px;
  border: 1px solid #dbe2ea;
  text-align: left;
  font-size: 13px;
}

.mapping-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #eef2f6;
}

.mapping-table select {
  width: 100%;
  min-width: 240px;
  height: 34px;
  padding: 0 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #ffffff;
}

.status-ready,
.upload-success {
  color: #15803d;
}

.status-missing,
.upload-failed {
  color: #b91c1c;
}

.upload-processing,
.upload-uploading {
  color: #1d4ed8;
}

.upload-waiting {
  color: #64748b;
}

.upload-status-list {
  max-height: 130px;
  overflow: auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 7px 16px;
  padding: 10px 14px;
  border-top: 1px solid #dbe2ea;
  background: #ffffff;
}

.upload-status-list div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
}

.splitter-footer {
  min-height: 58px;
  justify-content: space-between;
  padding: 10px 18px;
  border-top: 1px solid #dbe2ea;
  color: #64748b;
  font-size: 13px;
}

.splitter-footer > div {
  display: flex;
  gap: 10px;
}

.footer-error {
  color: #b91c1c;
  font-weight: 600;
}

.footer-message {
  color: #1d4ed8;
}

@media (max-width: 820px) {
  .splitter-overlay {
    padding: 0;
  }

  .upload-guide-backdrop {
    padding: 0;
  }

  .upload-guide {
    width: 100%;
    max-height: 100vh;
    border: 0;
    border-radius: 0;
  }

  .upload-guide-content {
    padding: 14px;
  }

  .upload-guide img {
    max-height: 42vh;
  }

  .upload-guide > footer {
    align-items: stretch;
    flex-direction: column;
  }

  .upload-guide > footer > div {
    justify-content: flex-end;
  }

  .splitter-shell {
    width: 100%;
    height: 100vh;
    border: 0;
    border-radius: 0;
  }

  .splitter-toolbar {
    flex-wrap: wrap;
  }

  .page-summary,
  .editor-hint {
    display: none;
  }

  .splitter-body {
    grid-template-columns: 110px minmax(0, 1fr);
  }

  .page-list-item {
    grid-template-columns: 1fr;
  }

  .page-list-item img {
    width: 100%;
  }

  .page-actions {
    grid-template-columns: repeat(3, 1fr);
  }

  .splitter-footer > span {
    display: none;
  }

  .splitter-footer {
    justify-content: flex-end;
  }
}

@media (hover: none), (pointer: coarse) {
  .camera-add-button {
    display: inline-flex;
    align-items: center;
  }
}
</style>
