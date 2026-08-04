<template>
  <div class="exam-container" v-if="loading">
    <div class="loading-state">🔄 正在加载试卷资源...</div>
  </div>

  <div class="exam-container" v-else-if="!examData && !questions.length">
    <div class="error-state">❌ 未找到考试信息或题目为空</div>
  </div>

  <div class="exam-container" v-else @click.capture="handleExamImageClick">
    <transition name="modal-fade">
      <div v-if="imagePreviewUrl" class="exam-image-viewer" @click.self.stop="closeImagePreview">
        <section class="exam-image-viewer-dialog" role="dialog" aria-modal="true" aria-label="图片放大预览" @click.stop>
          <header>
            <strong>{{ imagePreviewTitle }}</strong>
            <button type="button" title="关闭预览" @click="closeImagePreview">
              <XMarkIcon aria-hidden="true" />
            </button>
          </header>
          <div class="exam-image-viewer-stage" @wheel.prevent="handleImagePreviewWheel">
            <div
                class="exam-image-viewer-canvas"
                :style="{ width: `${imagePreviewScale * 100}%`, height: `${imagePreviewScale * 100}%` }"
            >
              <img :src="imagePreviewUrl" :alt="imagePreviewTitle" draggable="false" />
            </div>
          </div>
          <footer>
            <button type="button" title="缩小" :disabled="imagePreviewScale <= 0.5" @click="adjustImagePreviewScale(-0.25)">
              <MinusIcon aria-hidden="true" />
            </button>
            <output>{{ Math.round(imagePreviewScale * 100) }}%</output>
            <button type="button" title="放大" :disabled="imagePreviewScale >= 4" @click="adjustImagePreviewScale(0.25)">
              <PlusIcon aria-hidden="true" />
            </button>
            <button type="button" title="恢复原始比例" @click="imagePreviewScale = 1">
              <ArrowPathIcon aria-hidden="true" />
            </button>
          </footer>
        </section>
      </div>
    </transition>

    <!-- 确认交卷弹窗 -->
    <transition name="modal-fade">
      <div v-if="showConfirmModal" class="modal-overlay">
        <div class="confirm-modal">
          <h3>确定要交卷吗？</h3>
          <p>交卷后无法修改答案，请仔细检查！</p>
          <div class="modal-buttons">
            <button class="btn cancel" @click="showConfirmModal = false">我再检查一下</button>
            <button class="btn confirm" @click="confirmSubmit" :disabled="submitting">
              {{ submitting ? '提交中...' : '确认交卷' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 提交中加载遮罩 - 代码终端风格 -->
    <transition name="fade">
      <div v-if="submitting" class="loading-overlay">
        <div class="loading-terminal">
          <div class="terminal-header">
            <span class="term-dot red"></span>
            <span class="term-dot yellow"></span>
            <span class="term-dot green"></span>
            <span class="term-title">submit.sh — exam #{{ examData?.exam_id }}</span>
          </div>
          <div class="terminal-body">
            <div class="term-line">
              <span class="prompt">$</span>
              <span class="log-text">submit --exam {{ examData?.exam_id }} --answers {{ questions.length }}</span>
            </div>
            <div v-for="(log, i) in visibleLogs" :key="i" class="term-line">
              <span :class="log.tag === 'OK' ? 'log-ok' : 'log-info'">[{{ log.tag }}]</span>
              <span class="log-text"> {{ log.text }}</span>
            </div>
            <div class="progress-block">
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: submitProgress + '%' }"></div>
              </div>
              <span class="progress-percent">{{ Math.floor(submitProgress) }}%</span>
            </div>
            <div class="term-line">
              <span class="prompt">&gt;</span>
              <span class="log-text">please wait, do not close or refresh the page</span>
              <span class="term-cursor">█</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showDesktopCamera" class="desktop-camera-overlay" @click.self="closeDesktopCamera">
        <section class="desktop-camera-modal" role="dialog" aria-modal="true" aria-label="电脑摄像头拍照">
          <div class="desktop-camera-header">
            <div>
              <h3>电脑摄像头拍照</h3>
              <span>第 {{ desktopCameraQuestionOrder }} 题</span>
            </div>
            <button type="button" class="camera-icon-button" title="关闭摄像头" @click="closeDesktopCamera">
              <XMarkIcon aria-hidden="true" />
            </button>
          </div>

          <div class="desktop-camera-device-bar">
            <label>
              <span>拍照设备</span>
              <select
                  v-model="desktopCameraDeviceId"
                  :disabled="desktopCameraStarting || desktopCameraProcessing"
                  @change="switchDesktopCameraDevice"
              >
                <option
                    v-for="(device, index) in desktopCameraDevices"
                    :key="device.deviceId"
                    :value="device.deviceId"
                >
                  {{ device.label || `摄像头 ${index + 1}` }}
                </option>
              </select>
            </label>
            <span class="desktop-camera-resolution">
              {{ desktopCameraResolution || '正在读取实际分辨率...' }}
            </span>
          </div>

          <div class="desktop-camera-stage">
            <video
                v-show="!desktopCameraPreviewUrl && !desktopCameraError"
                ref="desktopCameraVideo"
                autoplay
                muted
                playsinline
            ></video>
            <img v-if="desktopCameraPreviewUrl" :src="desktopCameraPreviewUrl" alt="已拍摄的答题图片" />
            <div v-if="desktopCameraStarting" class="desktop-camera-status">正在启动摄像头...</div>
            <div v-else-if="desktopCameraError" class="desktop-camera-status camera-error">
              {{ desktopCameraError }}
            </div>
            <div v-else-if="desktopCameraProcessing" class="desktop-camera-status camera-processing">
              {{ desktopCameraSelectingFrame ? '正在选择最清晰的一帧...' : '正在增强清晰度和颜色...' }}
            </div>
            <canvas ref="desktopCameraCanvas" hidden></canvas>
          </div>

          <div class="desktop-camera-enhancement">
            <label class="camera-enhancement-toggle">
              <input
                  v-model="desktopCameraEnhancementEnabled"
                  type="checkbox"
                  :disabled="desktopCameraProcessing"
                  @change="refreshDesktopCameraEnhancement"
              />
              <span>文档增强</span>
            </label>
            <label class="camera-enhancement-strength" :class="{ disabled: !desktopCameraEnhancementEnabled }">
              <span>颜色/对比度</span>
              <input
                  v-model.number="desktopCameraEnhancementStrength"
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  :disabled="!desktopCameraEnhancementEnabled || desktopCameraProcessing"
                  @change="refreshDesktopCameraEnhancement"
              />
              <output>{{ desktopCameraEnhancementStrength }}%</output>
            </label>
            <label class="camera-enhancement-strength" :class="{ disabled: !desktopCameraEnhancementEnabled }">
              <span>文字锐化</span>
              <input
                  v-model.number="desktopCameraSharpenStrength"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  :disabled="!desktopCameraEnhancementEnabled || desktopCameraProcessing"
                  @change="refreshDesktopCameraEnhancement"
              />
              <output>{{ desktopCameraSharpenStrength }}%</output>
            </label>
          </div>

          <footer class="desktop-camera-actions">
            <button type="button" class="camera-secondary-button" @click="closeDesktopCamera">取消</button>
            <button
                v-if="desktopCameraPreviewUrl"
                type="button"
                class="camera-secondary-button"
                :disabled="uploading || desktopCameraProcessing"
                @click="retakeDesktopPhoto"
            >
              <ArrowPathIcon aria-hidden="true" />
              重拍
            </button>
            <button
                v-if="!desktopCameraPreviewUrl"
                type="button"
                class="camera-primary-button"
                :disabled="desktopCameraStarting || desktopCameraProcessing || !!desktopCameraError || !desktopCameraStream"
                @click="captureDesktopPhoto"
            >
              <CameraIcon aria-hidden="true" />
              拍照
            </button>
            <template v-else>
              <button
                  type="button"
                  class="camera-secondary-button"
                  :disabled="uploading || desktopCameraProcessing"
                  @click="sendDesktopPhotoToSplitter"
              >
                <ScissorsIcon aria-hidden="true" />
                进入整页切分
              </button>
              <button
                  type="button"
                  class="camera-primary-button"
                  :disabled="uploading || desktopCameraProcessing"
                  @click="uploadDesktopPhotoToQuestion"
              >
                <ArrowUpTrayIcon aria-hidden="true" />
                {{ uploading ? '上传中...' : '上传到本题' }}
              </button>
            </template>
          </footer>
        </section>
      </div>
    </transition>

    <transition name="modal-fade">
      <div v-if="showPhoneCamera" class="desktop-camera-overlay" @click.self="closePhoneCamera">
        <section class="desktop-camera-modal" role="dialog" aria-modal="true" aria-label="手机高清相机">
          <div class="desktop-camera-header">
            <div>
              <h3>手机高清相机</h3>
              <span>批量切分连续拍照 · 局域网原图直传</span>
            </div>
            <button type="button" class="camera-icon-button" title="关闭手机相机" @click="closePhoneCamera">
              <XMarkIcon aria-hidden="true" />
            </button>
          </div>

          <div class="phone-camera-address-bar">
            <label>
              <span>手机地址</span>
              <input
                  v-model.trim="phoneCameraAddress"
                  type="text"
                  inputmode="url"
                  placeholder="例如 192.168.1.88:8765"
                  :disabled="phoneCameraConnecting || phoneCameraCapturing"
                  @keyup.enter="connectPhoneCamera"
              />
            </label>
            <button
                type="button"
                class="camera-secondary-button"
                :disabled="phoneCameraConnecting || phoneCameraCapturing || !phoneCameraAddress"
                @click="connectPhoneCamera"
            >
              {{ phoneCameraConnecting ? '连接中...' : '连接' }}
            </button>
            <span :class="['phone-camera-connection', { connected: phoneCameraConnected }]">
              {{ phoneCameraConnected ? '已连接' : '未连接' }}
            </span>
          </div>

          <div class="phone-camera-download-bar">
            <span>电脑桥接安装包</span>
            <a
                v-for="download in phoneCameraBridgeDownloads"
                :key="download.platform"
                :href="download.url"
                class="phone-camera-download-link"
                download
            >
              <ArrowDownTrayIcon aria-hidden="true" />
              {{ download.label }}
            </a>
          </div>

          <div class="desktop-camera-stage phone-camera-stage">
            <img
                v-if="phoneCameraConnected && phoneCameraLivePreviewUrl"
                :src="phoneCameraLivePreviewUrl"
                alt="手机相机实时预览"
                @load="phoneCameraError = ''"
                @error="handlePhoneCameraPreviewError"
            />
            <div v-if="phoneCameraConnecting" class="desktop-camera-status">正在连接手机相机...</div>
            <div v-else-if="phoneCameraCapturing" class="desktop-camera-status camera-processing">
              手机正在对焦并拍摄高清原图...
            </div>
            <div v-else-if="phoneCameraError" class="desktop-camera-status camera-error">
              <span>{{ phoneCameraError }}</span>
              <a
                  v-if="isHttpsPage"
                  class="camera-secondary-button phone-camera-bridge-download"
                  :href="recommendedPhoneCameraBridgeDownloadUrl"
                  download
              >
                下载本机桥接
              </a>
            </div>
            <div v-else-if="!phoneCameraConnected" class="desktop-camera-status">
              打开手机上的 ByteOJ 高清相机，并输入应用显示的地址
            </div>
          </div>

          <div v-if="phoneCameraShots.length" class="phone-camera-shots">
            <div v-for="(shot, index) in phoneCameraShots" :key="shot.id" class="phone-camera-shot">
              <img :src="shot.previewUrl" :alt="`已拍摄第 ${index + 1} 张`" />
              <span>{{ index + 1 }}</span>
              <button
                  type="button"
                  title="删除这张照片"
                  :disabled="phoneCameraCapturing || uploading"
                  @click="removePhoneCameraShot(shot.id)"
              >
                <XMarkIcon aria-hidden="true" />
              </button>
            </div>
          </div>

          <div class="phone-camera-photo-info">
            <span v-if="phoneCameraShots.length">
              已连续拍摄 {{ phoneCameraShots.length }} 张 · {{ phoneCameraPhotoResolution }}
            </span>
            <span v-else>预览使用轻量画质，拍照传输手机原始 JPEG</span>
            <span v-if="phoneCameraLatestShot">{{ formatFileSize(phoneCameraLatestShot.file.size) }}</span>
          </div>

          <footer class="desktop-camera-actions">
            <button type="button" class="camera-secondary-button" @click="closePhoneCamera">取消</button>
            <button
                v-if="phoneCameraShots.length"
                type="button"
                class="camera-secondary-button"
                :disabled="uploading || phoneCameraCapturing"
                @click="clearPhoneCameraShots"
            >
              <TrashIcon aria-hidden="true" />
              清空已拍
            </button>
            <button
                type="button"
                class="camera-primary-button"
                :disabled="!phoneCameraConnected || phoneCameraCapturing || phoneCameraConnecting || phoneCameraShots.length >= 30"
                @click="capturePhonePhoto"
            >
              <CameraIcon aria-hidden="true" />
              {{ phoneCameraCapturing ? '拍摄中...' : phoneCameraShots.length ? `继续拍摄（${phoneCameraShots.length}/30）` : '拍摄高清原图' }}
            </button>
            <template v-if="phoneCameraShots.length">
              <button
                  type="button"
                  class="camera-primary-button"
                  :disabled="uploading"
                  @click="sendPhonePhotosToSplitter"
              >
                <ScissorsIcon aria-hidden="true" />
                导入批量切分（{{ phoneCameraShots.length }}）
              </button>
            </template>
          </footer>
        </section>
      </div>
    </transition>

    <!-- 交卷结果遮罩层 -->
    <div v-if="showResult" class="result-overlay">
      <div class="result-card">
        <div class="result-header">
          <h2>交卷成功！</h2>
          <div class="result-icon success">✓</div>
        </div>

        <div class="result-body">
          <div class="exam-info">
            <div class="info-row">
              <span class="label">考试名称</span>
              <span class="value">{{ resultData.exam_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">考生</span>
              <span class="value">{{ resultData.username }}</span>
            </div>
            <div class="info-row total-score">
              <span class="label">总分</span>
              <span class="value highlight font-bold">{{ resultData.score_subjective + resultData.score_option }} / {{ resultData.total_score }} 分</span>
            </div>
          </div>

          <div class="score-breakdown">
            <div class="score-item">
              <div class="score-label">客观题得分</div>
              <div class="score-value">{{ resultData.score_option }} 分</div>
            </div>
            <div class="score-item">
              <div class="score-label">主观题得分</div>
              <div class="score-value">{{ resultData.score_subjective }} 分</div>
            </div>
          </div>

          <div class="result-footer">
            <p class="tip">成绩已提交，请等待老师批改主观题</p>
            <div class="buttons">
              <button class="btn primary" @click="goToDashboard">返回首页</button>
              <button class="btn secondary" @click="showResult = false">查看答题卡</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 顶部 Header -->
    <header>
      <div class="header-inner">
        <div class="exam-title">
          {{ examData?.exam_name || '未知考试' }}
        </div>
        <div class="timer" :class="{ 'timer-warning': remaining <= 300 }">
          {{ displayTimer }}
        </div>
      </div>
    </header>

    <!-- 左侧题目区 -->
    <main class="question-panel">
      <div class="question-header">
        <div class="q-type">
          <span class="badge">{{ getQuestionTypeLabel(currentQuestion.option_type, currentQuestion.status) }}</span>
          <span class="q-index">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</span>
          <span class="q-score"> ({{ currentQuestion.score }}分)</span>
        </div>
        <div class="q-title">试卷第 {{ currentIndex + 1 }} 题</div>

        <!-- 标签展示 -->
        <div class="q-tags" v-if="currentQuestion.tagsList && currentQuestion.tagsList.length">
          <span v-for="(tag, idx) in currentQuestion.tagsList" :key="idx" class="tag-item">{{ tag }}</span>
        </div>
      </div>
      <!-- 题目描述 (Description) - 支持数学公式渲染 -->
      <div class="problem-description" v-if="currentQuestion.description">
        <h4>题目描述：</h4>

        <MarkdownView
            :generate-data="currentQuestion.description"
            class="p-0"
        />
      </div>
      <div class="q-content">
        <!-- 情况1: 算法题 (status === 3) -->
        <div v-if="isAlgorithmQuestion(currentQuestion)" class="algorithm-answer-area">
          <div class="algorithm-toolbar">
            <label>编程语言</label>
            <select
                v-model="languageAnswers[currentQuestion.problem_id]"
                class="algorithm-language"
                @change="ensureAlgorithmAnswer(currentQuestion.problem_id)"
            >
              <option v-for="language in algorithmLanguages" :key="language" :value="language">
                {{ language }}
              </option>
            </select>
          </div>
          <textarea
              v-model="answers[currentQuestion.problem_id]"
              class="algorithm-code"
              placeholder="请在这里填写算法题代码..."
              rows="18"
              @input="ensureAlgorithmLanguage(currentQuestion.problem_id)"
          ></textarea>
        </div>

        <!-- 情况2: 有选项的题目 -->
        <template v-else-if="currentQuestion.option_type === 1 || currentQuestion.option_type === 2">
          <label
              v-for="(optText, index) in parsedOptions"
              :key="index"
              class="option-item"
              :class="{ selected: isSelected(currentQuestion.problem_id, getLetter(index)) }"
              :style="isSelected(currentQuestion.problem_id, getLetter(index)) ? 'background-color: #eef2ff; border-color: #3034ec;' : ''"
          >
            <input
                :type="currentQuestion.option_type === 1 ? 'radio' : 'checkbox'"
                :value="getLetter(index)"
                v-model="answers[currentQuestion.problem_id]"
                class="hidden-input"
            />

            <span class="option-letter">{{ getLetter(index) }}.</span>

            <!-- Markdown 组件 -->
            <MarkdownView
                :style="isSelected(currentQuestion.problem_id, getLetter(index)) ? 'background-color: #eef2ff; border-color: #3034ec;' : ''"
                :generate-data="'$' + getLetter(index) + '$' + '.' + renderMath(optText)"
                class="markdown-content"
            />
          </label>
        </template>

        <!-- 情况3: 填空题 (option_type=3) 或 简答题 (option_type=0) -->
        <template v-else>
          <div class="fill-answer-area">
            <div v-if="uploadedAnswerImageCount" class="image-answer-summary">
              <span>已上传 {{ uploadedAnswerImageCount }} 道题的图片答案</span>
              <button type="button" class="clear-images-button" :disabled="uploading" @click="clearAllAnswerImages">
                <TrashIcon aria-hidden="true" />
                清空全部题目图片
              </button>
            </div>

            <!-- 已上传的图片展示区 -->
            <div class="uploaded-images" v-if="getAnswerImages(currentQuestion.problem_id).length">
              <div
                  v-for="(imgUrl, idx) in getAnswerImages(currentQuestion.problem_id)"
                  :key="idx"
                  class="image-preview-item"
              >
                <img :src="imgUrl" alt="答题图片" class="preview-img" />
                <button
                    class="remove-btn"
                    @click="removeUploadedImage(currentQuestion.problem_id, idx)"
                    title="删除这张图片"
                >×</button>
              </div>
            </div>

            <!-- 上传区域 -->
            <div
                class="upload-zone"
                :class="{ 'is-dragging': isDraggingImages }"
                @dragenter.prevent="handleImageDragEnter"
                @dragover.prevent="isDraggingImages = true"
                @dragleave.prevent="handleImageDragLeave"
                @drop.prevent="handleImageDrop"
            >
              <input
                  type="file"
                  accept="image/*"
                  class="file-input"
                  id="file-upload"
                  ref="fileInput"
                  @change="handleFileChange"
                  hidden
              />
              <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  class="file-input"
                  ref="cameraInput"
                  @change="handleFileChange"
                  hidden
              />

              <div class="drop-zone-copy">
                <PhotoIcon aria-hidden="true" />
                <div>
                  <strong>拖入整页答题照片</strong>
                  <span>电脑端可一次拖入多张，随后检查切割位置和题目映射</span>
                </div>
              </div>

              <div class="upload-buttons">
                <button
                    type="button"
                    class="btn-upload"
                    @click="triggerUpload"
                    :disabled="uploading"
                >
                  <ArrowUpTrayIcon aria-hidden="true" />
                  <span v-if="uploading">上传中...</span>
                  <span v-else>选择本题图片</span>
                </button>
                <button
                    type="button"
                    class="btn-upload camera-upload"
                    @click="triggerCamera"
                    :disabled="uploading"
                >
                  <CameraIcon aria-hidden="true" />
                  拍照上传本题
                </button>
                <button
                    type="button"
                    class="btn-upload desktop-camera-upload"
                    @click="openDesktopCamera"
                    :disabled="uploading"
                >
                  <VideoCameraIcon aria-hidden="true" />
                  电脑摄像头拍照
                </button>
                <button
                    type="button"
                    class="btn-upload batch-upload"
                    @click="openImageSplitter()"
                    :disabled="uploading || !eligibleImageQuestions.length"
                >
                  <ScissorsIcon aria-hidden="true" />
                  整页图片批量切分
                </button>
              </div>

              <div class="upload-tip" v-if="!uploading">
                直接选择或拍照会覆盖本题原图；整页照片请使用批量切分
              </div>
            </div>

            <!-- 可选：保留文本输入框（有些人可能想既写文字又传图） -->
            <textarea
                v-model="textAnswers[currentQuestion.problem_id]"
                class="fill-blank"
                placeholder="可在此补充文字说明（非必填）..."
                rows="6"
            ></textarea>
          </div>
        </template>
      </div>

      <!-- 底部导航 -->
      <div class="question-footer">
        <button class="nav-btn prev" :disabled="currentIndex === 0" @click="goPrev">
          ← 上一题
        </button>
        <button class="nav-btn next" :disabled="currentIndex === questions.length - 1" @click="goNext">
          下一题 →
        </button>
      </div>
    </main>

    <!-- 右侧工具栏 -->
    <aside class="sidebar">
      <!-- 答题卡 -->
      <!-- 答题卡部分 -->
      <div class="card">
        <div class="card-header">答题卡</div>

        <div class="question-nav-wrapper">

          <!-- 先按 option_type 分组 -->
          <template v-for="(group, groupIndex) in groupedQuestions" :key="'group-'+groupIndex">

            <!-- 分组标题 -->
            <div class="group-title">
              {{ numberToChinese(groupIndex + 1) }}、{{ getGroupTypeName(group[0]) }}
            </div>

            <!-- 该组的题目按钮 -->
            <div class="question-nav group-nav">
              <button
                  v-for="(q, idx) in group"
                  :key="q.problem_id"
                  class="q-btn"
                  :class="{
            answered: isAnswered(q.problem_id),
            current: questions.indexOf(q) === currentIndex,
            'is-algo': isAlgorithmQuestion(q)
          }"
                  @click="currentIndexChange(questions.indexOf(q), q.status, q.problem_id)"
              >
                {{ questions.indexOf(q) + 1 }}
              </button>
            </div>

          </template>

        </div>
      </div>

      <!-- 考试信息 -->
      <div class="card">
        <div class="card-header">考试信息</div>
        <div class="info-item">
          <span class="info-label">考生</span>
          <span class="info-value">莫顾 &emsp; 2021xxxxxx</span>
        </div>
        <div class="info-item">
          <span class="info-label">剩余时间</span>
          <span class="info-value">{{ displayTimer }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">已答题数</span>
          <span class="info-value">{{ answeredCount }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">完成度</span>
          <span class="info-value">{{ progress }}%</span>
        </div>
        <div class="info-item">
          <span class="info-label">总分</span>
          <span class="info-value">{{ totalScore }} 分</span>
        </div>
      </div>

      <!-- 交卷按钮 -->
      <div class="submit-wrapper">
        <button class="btn-submit" @click="handleSubmit">
          我要交卷
        </button>
      </div>
    </aside>
  </div>

  <ExamImageSplitter
      v-if="showImageSplitter"
      ref="imageSplitter"
      :questions="eligibleImageQuestions"
      :upload-image="uploadAnswerImage"
      :initial-files="splitterInitialFiles"
      @close="closeImageSplitter"
      @applied="handleSplitImagesApplied"
      @request-phone-camera="openPhoneCameraForSplitter"
  />
</template>

<script setup lang="ts">
import {ref, computed, nextTick, onMounted, onUnmounted, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
// 假设你的服务文件路径如下，请根据实际项目结构调整
import MarkdownView from "@/view/Markdown/MarkdownView.vue";
import router from "@/router";
import Router from "@/router";
import {ProblemsControllerService} from "../../../generated/services/ProblemsControllerService";
import {UserControllerService} from "../../../generated";
import {useMessageBox} from "@/view/components/alert/useMessageBox";
import ExamImageSplitter from "./ExamImageSplitter.vue";
import { canvasToFile, enhanceDocumentCanvas, imageToCanvas } from './examImageSplitter'
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CameraIcon,
  PhotoIcon,
  MinusIcon,
  PlusIcon,
  ScissorsIcon,
  TrashIcon,
  VideoCameraIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
// --- 类型定义 ---
interface ProblemItem {
  problem_id: number
  problem_name: string
  description: string
  options: string | null // 后端返回的是字符串化的 JSON 数组
  option_type: number | null // 0:简答, 1:单选, 2:多选, 3:填空, null:其他
  status: number // 3: 算法题
  tagsList: string[]
  score: number
}

interface ExamInfo {
  exam_name: string
  exam_id: number
  time: number // 考试时长(分钟)
}

// --- 状态变量 ---
const route = useRoute()
const loading = ref(true)
const examData = ref<ExamInfo | null>(null)
const questions = ref<ProblemItem[]>([])
const currentIndex = ref(0)
const answers = ref<Record<number, any>>({}) // key: problem_id
const languageAnswers = ref<Record<number, string>>({})
const algorithmLanguages = ['C/C++', 'Java', 'Python3']
const defaultAlgorithmLanguage = 'C/C++'
const algorithmLanguageMap: Record<string, string> = {
  'C/C++': 'cpp',
  Java: 'java',
  Python3: 'python',
}
const remaining = ref(3600) // 默认1小时，后续可从 examData.time 获取
let timerInterval: number | null = null
// ==================== 新增的状态 ====================
const uploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const cameraInput = ref<HTMLInputElement | null>(null)
const imagePreviewUrl = ref('')
const imagePreviewTitle = ref('图片预览')
const imagePreviewScale = ref(1)
const showImageSplitter = ref(false)
const splitterInitialFiles = ref<File[]>([])
const isDraggingImages = ref(false)
const showDesktopCamera = ref(false)
const desktopCameraStarting = ref(false)
const desktopCameraError = ref('')
const desktopCameraVideo = ref<HTMLVideoElement | null>(null)
const desktopCameraCanvas = ref<HTMLCanvasElement | null>(null)
const desktopCameraStream = ref<MediaStream | null>(null)
const desktopCameraFile = ref<File | null>(null)
const desktopCameraPreviewUrl = ref('')
const desktopCameraProblemId = ref<number | null>(null)
const desktopCameraQuestionOrder = ref(0)
const desktopCameraProcessing = ref(false)
const desktopCameraSelectingFrame = ref(false)
const desktopCameraEnhancementEnabled = ref(true)
const desktopCameraEnhancementStrength = ref(72)
const desktopCameraSharpenStrength = ref(68)
const desktopCameraDevices = ref<MediaDeviceInfo[]>([])
const desktopCameraDeviceId = ref('')
const desktopCameraResolution = ref('')
const showPhoneCamera = ref(false)
const phoneCameraAddress = ref(localStorage.getItem('byteoj-phone-camera-address') || '')
const phoneCameraConnected = ref(false)
const phoneCameraConnecting = ref(false)
const phoneCameraCapturing = ref(false)
const phoneCameraError = ref('')
const phoneCameraLivePreviewUrl = ref('')
const phoneCameraPhotoResolution = ref('')
const isHttpsPage = window.location.protocol === 'https:'
type PhoneBridgePlatform = 'windows' | 'macos' | 'linux'
interface PhoneBridgeDownload {
  platform: PhoneBridgePlatform
  label: string
  url: string
}
const defaultPhoneCameraBridgeUrls: Record<PhoneBridgePlatform, string> = {
  windows: 'https://www.byteoj.com/ByteOJ-Windows-v1.0.zip',
  macos: 'https://www.byteoj.com/ByteOJ-macOS-v1.0.zip',
  linux: 'https://www.byteoj.com/ByteOJ-Linux-v1.0.zip',
}
const phoneCameraBridgeUrls = ref<Record<PhoneBridgePlatform, string>>({ ...defaultPhoneCameraBridgeUrls })
const phoneCameraBridgeDownloads = computed<PhoneBridgeDownload[]>(() => [
  { platform: 'windows', label: 'Windows', url: phoneCameraBridgeUrls.value.windows },
  { platform: 'macos', label: 'macOS', url: phoneCameraBridgeUrls.value.macos },
  { platform: 'linux', label: 'Linux', url: phoneCameraBridgeUrls.value.linux },
].filter(download => Boolean(download.url)))
const currentPhoneBridgePlatform = (): PhoneBridgePlatform => {
  const platform = navigator.platform.toLowerCase()
  if (platform.includes('win')) return 'windows'
  if (platform.includes('linux')) return 'linux'
  return 'macos'
}
const recommendedPhoneCameraBridgeDownloadUrl = computed(() =>
  phoneCameraBridgeUrls.value[currentPhoneBridgePlatform()] || phoneCameraBridgeUrls.value.macos
)
interface PhoneCameraShot {
  id: number
  file: File
  previewUrl: string
  width: number
  height: number
}
const phoneCameraShots = ref<PhoneCameraShot[]>([])
const phoneCameraLatestShot = computed(() => phoneCameraShots.value[phoneCameraShots.value.length - 1] || null)
let phoneCameraPreviewTimer: number | null = null
const imageSplitter = ref<{ addExternalFiles: (files: File[]) => Promise<void> } | null>(null)

// 单独存文本部分（可选，如果你想同时支持文字+图片）
const textAnswers = ref<Record<number, string>>({})
// 新增：用于存储的 key（用 exam_id 区分不同考试）
const storageKey = computed(() => {
  const examId = examData.value?.exam_id
  return examId ? `exam-${examId}-answers` : null
})
const languageStorageKey = computed(() => {
  const examId = examData.value?.exam_id
  return examId ? `exam-${examId}-languages` : null
})
const { success, error, warning } = useMessageBox();

const closeImagePreview = () => {
  imagePreviewUrl.value = ''
  imagePreviewScale.value = 1
}

const adjustImagePreviewScale = (offset: number) => {
  imagePreviewScale.value = Math.min(4, Math.max(0.5, imagePreviewScale.value + offset))
}

const handleImagePreviewWheel = (event: WheelEvent) => {
  adjustImagePreviewScale(event.deltaY < 0 ? 0.25 : -0.25)
}

const handleExamImageClick = (event: MouseEvent) => {
  const target = event.target
  if (!(target instanceof HTMLImageElement) || target.closest('.exam-image-viewer')) return
  const source = target.currentSrc || target.src
  if (!source) return
  event.preventDefault()
  event.stopPropagation()
  imagePreviewUrl.value = source
  imagePreviewTitle.value = target.alt || '图片预览'
  imagePreviewScale.value = 1
}

const handleImagePreviewKeydown = (event: KeyboardEvent) => {
  if (!imagePreviewUrl.value) return
  if (event.key === 'Escape') closeImagePreview()
  else if (event.key === '+' || event.key === '=') adjustImagePreviewScale(0.25)
  else if (event.key === '-') adjustImagePreviewScale(-0.25)
}

// 新增状态
const showResult = ref(false)
const resultData = ref({
  exam_id: 0,
  exam_name: '',
  total_score: 0,
  uuid: 0,
  username: '',
  score_option: 0,
  score_subjective: 0
})
// 新增状态
const showConfirmModal = ref(false)
const submitting = ref(false)

// 提交假进度条：约 60s 匀速走完，提前完成则快速补满到 100%
const submitProgress = ref(0)
let progressTimer: number | null = null

const visibleLogs = computed(() => {
  const p = submitProgress.value
  const logs: { tag: string; text: string }[] = []
  if (p >= 2)  logs.push({ tag: 'INFO', text: 'connecting to exam server...' })
  if (p >= 14) logs.push({ tag: 'INFO', text: 'authenticating user session...' })
  if (p >= 30) logs.push({ tag: 'INFO', text: 'serializing answers payload...' })
  if (p >= 50) logs.push({ tag: 'INFO', text: 'encrypting and uploading data...' })
  if (p >= 72) logs.push({ tag: 'INFO', text: 'awaiting server response...' })
  if (p >= 100) logs.push({ tag: 'OK', text: 'submission accepted successfully' })
  return logs
})

const startProgress = () => {
  submitProgress.value = 0
  if (progressTimer) clearInterval(progressTimer)
  const duration = 120000
  const interval = 80
  const increment = 100 / (duration / interval)
  progressTimer = window.setInterval(() => {
    if (submitProgress.value < 100) {
      submitProgress.value = Math.min(submitProgress.value + increment, 100)
    }
  }, interval)
}

const finishProgress = () => {
  return new Promise<void>((resolve) => {
    if (progressTimer) {
      clearInterval(progressTimer)
      progressTimer = null
    }
    if (submitProgress.value >= 100) {
      resolve()
      return
    }
    const start = submitProgress.value
    const startTime = performance.now()
    const animDuration = 450
    const step = () => {
      const t = Math.min((performance.now() - startTime) / animDuration, 1)
      submitProgress.value = start + (100 - start) * t
      if (t < 1) {
        requestAnimationFrame(step)
      } else {
        submitProgress.value = 100
        resolve()
      }
    }
    requestAnimationFrame(step)
  })
}

const stopProgress = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

// 统一从 answers 里取图片链接的辅助函数
const getAnswerImages = (problemId: number) => {
  const ans = answers.value[problemId]
  if (!ans) return []
  if (typeof ans === 'string' && ans.startsWith('http')) return [ans]
  if (Array.isArray(ans)) return ans.filter(item => typeof item === 'string' && item.startsWith('http'))
  return []
}

// 触发文件选择
const triggerUpload = () => {
  fileInput.value?.click()
}

const triggerCamera = () => {
  cameraInput.value?.click()
}

const openImageSplitter = (files: File[] = []) => {
  splitterInitialFiles.value = files
  showImageSplitter.value = true
}

const closeImageSplitter = () => {
  showImageSplitter.value = false
  splitterInitialFiles.value = []
}

const handleImageDragEnter = (event: DragEvent) => {
  const hasFiles = Array.from(event.dataTransfer?.items || []).some(item => item.kind === 'file')
  if (hasFiles) isDraggingImages.value = true
}

const handleImageDragLeave = (event: DragEvent) => {
  const zone = event.currentTarget as HTMLElement
  const nextTarget = event.relatedTarget as Node | null
  if (!nextTarget || !zone.contains(nextTarget)) isDraggingImages.value = false
}

const handleImageDrop = (event: DragEvent) => {
  isDraggingImages.value = false
  const files = Array.from(event.dataTransfer?.files || []).filter(file => file.type.startsWith('image/'))
  if (!files.length) {
    warning('请拖入 jpg、png 等图片文件')
    return
  }
  openImageSplitter(files)
}

const stopDesktopCameraStream = () => {
  desktopCameraStream.value?.getTracks().forEach(track => track.stop())
  desktopCameraStream.value = null
  if (desktopCameraVideo.value) desktopCameraVideo.value.srcObject = null
}

const clearDesktopCameraCapture = () => {
  if (desktopCameraPreviewUrl.value) URL.revokeObjectURL(desktopCameraPreviewUrl.value)
  desktopCameraPreviewUrl.value = ''
  desktopCameraFile.value = null
}

const desktopCameraErrorMessage = (cameraError: unknown) => {
  if (cameraError instanceof DOMException) {
    if (cameraError.name === 'NotAllowedError') return '摄像头权限被拒绝，请在浏览器站点设置中允许使用摄像头。'
    if (cameraError.name === 'NotFoundError') return '没有检测到可用的摄像头。'
    if (cameraError.name === 'NotReadableError') return '摄像头正在被其他程序占用，请关闭后重试。'
  }
  return '无法启动摄像头。请使用 HTTPS 或 localhost 打开页面后重试。'
}

const refreshDesktopCameraDevices = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  desktopCameraDevices.value = devices.filter(device => device.kind === 'videoinput')
}

const startDesktopCameraStream = async (deviceId = '', preferPhone = true) => {
  stopDesktopCameraStream()
  desktopCameraStarting.value = true
  desktopCameraResolution.value = ''

  try {
    const selectedDevice = desktopCameraDevices.value.find(device => device.deviceId === deviceId)
    const isCamoDevice = /camo/i.test(selectedDevice?.label || '')
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        // Camo 免费配置实际输出 720P。请求更高尺寸只会触发浏览器插值放大，反而让文字发虚。
        width: { ideal: isCamoDevice ? 1280 : 3840 },
        height: { ideal: isCamoDevice ? 720 : 2160 },
        frameRate: { ideal: 30 },
        ...(isCamoDevice ? { resizeMode: 'none' } : {}),
      },
    })
    if (!showDesktopCamera.value) {
      stream.getTracks().forEach(track => track.stop())
      return
    }

    desktopCameraStream.value = stream
    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack?.getCapabilities) {
      const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & {
        focusMode?: string[]
      }
      const width = capabilities.width?.max
      const height = capabilities.height?.max
      const advanced: MediaTrackConstraintSet[] = []
      if (capabilities.focusMode?.includes('continuous')) {
        advanced.push({ focusMode: 'continuous' } as MediaTrackConstraintSet)
      }
      try {
        await videoTrack.applyConstraints({
          ...(width ? { width: { ideal: isCamoDevice ? Math.min(width, 1280) : Math.min(width, 4096) } } : {}),
          ...(height ? { height: { ideal: isCamoDevice ? Math.min(height, 720) : Math.min(height, 3072) } } : {}),
          ...(advanced.length ? { advanced } : {}),
        })
      } catch (constraintError) {
        console.warn('摄像头不支持高分辨率或连续对焦约束', constraintError)
      }
    }

    if (desktopCameraVideo.value) {
      desktopCameraVideo.value.srcObject = stream
      await desktopCameraVideo.value.play()
    }

    const settings = videoTrack?.getSettings()
    desktopCameraDeviceId.value = settings?.deviceId || deviceId
    desktopCameraResolution.value = settings?.width && settings?.height
      ? `${settings.width} × ${settings.height}`
      : '分辨率未知'
    await refreshDesktopCameraDevices()

    const phoneCamera = desktopCameraDevices.value.find(device =>
      /camo|redmi|xiaomi|小米/i.test(device.label),
    )
    if (preferPhone && phoneCamera && phoneCamera.deviceId !== desktopCameraDeviceId.value) {
      desktopCameraDeviceId.value = phoneCamera.deviceId
      await startDesktopCameraStream(phoneCamera.deviceId, false)
    }
  } catch (cameraError) {
    desktopCameraError.value = desktopCameraErrorMessage(cameraError)
  } finally {
    desktopCameraStarting.value = false
  }
}

const openDesktopCamera = async () => {
  desktopCameraProblemId.value = currentQuestion.value.problem_id
  desktopCameraQuestionOrder.value = currentIndex.value + 1
  desktopCameraError.value = ''
  clearDesktopCameraCapture()
  showDesktopCamera.value = true
  desktopCameraStarting.value = true
  await nextTick()

  if (!navigator.mediaDevices?.getUserMedia) {
    desktopCameraStarting.value = false
    desktopCameraError.value = '当前浏览器不支持摄像头拍照，请使用最新版 Chrome、Edge 或 Safari。'
    return
  }

  await startDesktopCameraStream(desktopCameraDeviceId.value)
}

const switchDesktopCameraDevice = async () => {
  clearDesktopCameraCapture()
  desktopCameraError.value = ''
  await startDesktopCameraStream(desktopCameraDeviceId.value, false)
}

const closeDesktopCamera = () => {
  showDesktopCamera.value = false
  desktopCameraStarting.value = false
  desktopCameraProcessing.value = false
  desktopCameraSelectingFrame.value = false
  desktopCameraError.value = ''
  stopDesktopCameraStream()
  clearDesktopCameraCapture()
  desktopCameraProblemId.value = null
  desktopCameraResolution.value = ''
  if (desktopCameraCanvas.value) {
    desktopCameraCanvas.value.width = 0
    desktopCameraCanvas.value.height = 0
  }
}

const refreshDesktopCameraEnhancement = async () => {
  const source = desktopCameraCanvas.value
  if (!source?.width || !source.height) return
  desktopCameraProcessing.value = true
  desktopCameraError.value = ''
  try {
    await nextTick()
    await new Promise(resolve => window.setTimeout(resolve, 0))
    const output = desktopCameraEnhancementEnabled.value
      ? enhanceDocumentCanvas(
          source,
          desktopCameraEnhancementStrength.value / 100,
          desktopCameraSharpenStrength.value / 100,
        )
      : imageToCanvas(source, source.width, source.height)
    const file = await canvasToFile(output, `exam-camera-${Date.now()}.jpg`, 0.99)
    clearDesktopCameraCapture()
    desktopCameraFile.value = file
    desktopCameraPreviewUrl.value = URL.createObjectURL(file)
  } catch (enhancementError) {
    desktopCameraError.value = enhancementError instanceof Error
      ? enhancementError.message
      : '照片增强失败。'
  } finally {
    desktopCameraProcessing.value = false
  }
}

const calculateFrameSharpness = (source: HTMLCanvasElement) => {
  const sampleWidth = Math.min(360, source.width)
  const sampleHeight = Math.max(1, Math.round(source.height * sampleWidth / source.width))
  const sample = imageToCanvas(source, sampleWidth, sampleHeight)
  const context = sample.getContext('2d', { willReadFrequently: true })
  if (!context || sampleWidth < 3 || sampleHeight < 3) return 0

  const pixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data
  const grayscale = new Float32Array(sampleWidth * sampleHeight)
  for (let index = 0; index < grayscale.length; index += 1) {
    const pixel = index * 4
    grayscale[index] = pixels[pixel] * 0.299 + pixels[pixel + 1] * 0.587 + pixels[pixel + 2] * 0.114
  }

  let edgeEnergy = 0
  let samples = 0
  for (let y = 1; y < sampleHeight - 1; y += 2) {
    for (let x = 1; x < sampleWidth - 1; x += 2) {
      const index = y * sampleWidth + x
      const laplacian = grayscale[index] * 4
        - grayscale[index - 1]
        - grayscale[index + 1]
        - grayscale[index - sampleWidth]
        - grayscale[index + sampleWidth]
      edgeEnergy += laplacian * laplacian
      samples += 1
    }
  }
  return samples ? edgeEnergy / samples : 0
}

const captureSharpestDesktopFrame = async (video: HTMLVideoElement) => {
  const frameCount = 6
  let bestFrame: HTMLCanvasElement | null = null
  let bestScore = -1

  for (let index = 0; index < frameCount; index += 1) {
    if (index) await new Promise(resolve => window.setTimeout(resolve, 120))
    const frame = imageToCanvas(video, video.videoWidth, video.videoHeight)
    const score = calculateFrameSharpness(frame)
    if (score > bestScore) {
      bestScore = score
      bestFrame = frame
    }
  }

  if (!bestFrame) throw new Error('无法获取摄像头画面。')
  return bestFrame
}

const prepareDesktopCameraFocus = async () => {
  const videoTrack = desktopCameraStream.value?.getVideoTracks()[0]
  if (!videoTrack?.getCapabilities) return

  const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & {
    focusMode?: string[]
  }
  const focusModes = capabilities.focusMode || []
  const focusMode = focusModes.includes('single-shot')
    ? 'single-shot'
    : focusModes.includes('continuous') ? 'continuous' : ''
  if (!focusMode) return

  try {
    await videoTrack.applyConstraints({
      advanced: [{ focusMode } as MediaTrackConstraintSet],
    })
    await new Promise(resolve => window.setTimeout(resolve, focusMode === 'single-shot' ? 700 : 300))
  } catch (focusError) {
    console.warn('摄像头无法重新触发自动对焦', focusError)
  }
}

const captureDesktopPhoto = async () => {
  const video = desktopCameraVideo.value
  const canvas = desktopCameraCanvas.value
  if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
    desktopCameraError.value = '摄像头画面还未准备好，请稍后再拍。'
    return
  }

  desktopCameraProcessing.value = true
  desktopCameraSelectingFrame.value = true
  desktopCameraError.value = ''
  try {
    await prepareDesktopCameraFocus()
    const sharpestFrame = await captureSharpestDesktopFrame(video)
    canvas.width = sharpestFrame.width
    canvas.height = sharpestFrame.height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('无法生成拍照图片。')
    context.imageSmoothingEnabled = false
    context.drawImage(sharpestFrame, 0, 0)
    desktopCameraSelectingFrame.value = false
    await refreshDesktopCameraEnhancement()
  } catch (captureError) {
    desktopCameraError.value = captureError instanceof Error
      ? captureError.message
      : '摄像头拍照失败。'
    desktopCameraProcessing.value = false
  } finally {
    desktopCameraSelectingFrame.value = false
  }
}

const retakeDesktopPhoto = () => {
  clearDesktopCameraCapture()
  desktopCameraError.value = ''
}

const uploadDesktopPhotoToQuestion = async () => {
  const file = desktopCameraFile.value
  const problemId = desktopCameraProblemId.value
  if (!file || !problemId) return
  uploading.value = true
  try {
    answers.value[problemId] = await uploadAnswerImage(file, problemId)
    closeDesktopCamera()
    success('摄像头照片已上传到本题')
  } catch (uploadError) {
    error(uploadError instanceof Error ? uploadError.message : '摄像头照片上传失败')
  } finally {
    uploading.value = false
  }
}

const sendDesktopPhotoToSplitter = () => {
  const file = desktopCameraFile.value
  if (!file) return
  closeDesktopCamera()
  openImageSplitter([file])
}

const normalizePhoneCameraAddress = (value: string) => {
  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
}

const phoneCameraBridgeBaseUrl = 'http://127.0.0.1:8767'

const loadPhoneCameraBridgeDownloadUrls = async () => {
  try {
    const response = await fetch(`/phone-camera-bridge-downloads.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!response.ok) return
    const configuredUrls = await response.json() as Partial<Record<PhoneBridgePlatform, string>>
    phoneCameraBridgeUrls.value = {
      windows: configuredUrls.windows?.trim() || defaultPhoneCameraBridgeUrls.windows,
      macos: configuredUrls.macos?.trim() || defaultPhoneCameraBridgeUrls.macos,
      linux: configuredUrls.linux?.trim() || defaultPhoneCameraBridgeUrls.linux,
    }
  } catch (loadError) {
    console.warn('手机相机桥接下载地址加载失败，使用内置地址', loadError)
  }
}

const buildPhoneCameraRequestUrl = (path: string) => {
  const phoneBaseUrl = normalizePhoneCameraAddress(phoneCameraAddress.value)
  if (!phoneBaseUrl) return ''

  if (isHttpsPage) {
    const query = new URLSearchParams({
      phone: phoneBaseUrl,
      t: String(Date.now()),
    })
    return `${phoneCameraBridgeBaseUrl}${path}?${query.toString()}`
  }

  return `${phoneBaseUrl}${path}?t=${Date.now()}`
}

const stopPhoneCameraPreview = () => {
  if (phoneCameraPreviewTimer !== null) {
    window.clearInterval(phoneCameraPreviewTimer)
    phoneCameraPreviewTimer = null
  }
  phoneCameraLivePreviewUrl.value = ''
}

const startPhoneCameraPreview = () => {
  stopPhoneCameraPreview()
  phoneCameraLivePreviewUrl.value = buildPhoneCameraRequestUrl('/stream.mjpeg')
}

const clearPhoneCameraShots = () => {
  phoneCameraShots.value.forEach(shot => URL.revokeObjectURL(shot.previewUrl))
  phoneCameraShots.value = []
  phoneCameraPhotoResolution.value = ''
}

const removePhoneCameraShot = (shotId: number) => {
  const shot = phoneCameraShots.value.find(item => item.id === shotId)
  if (shot) URL.revokeObjectURL(shot.previewUrl)
  phoneCameraShots.value = phoneCameraShots.value.filter(item => item.id !== shotId)
  const latest = phoneCameraLatestShot.value
  phoneCameraPhotoResolution.value = latest ? `${latest.width} × ${latest.height}` : ''
}

const connectPhoneCamera = async () => {
  const baseUrl = normalizePhoneCameraAddress(phoneCameraAddress.value)
  if (!baseUrl) return
  phoneCameraConnecting.value = true
  phoneCameraConnected.value = false
  phoneCameraError.value = ''
  stopPhoneCameraPreview()

  try {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 5000)
    let response: Response
    try {
      response = await fetch(buildPhoneCameraRequestUrl('/status'), {
        cache: 'no-store',
        signal: controller.signal,
      })
    } finally {
      window.clearTimeout(timeout)
    }
    if (!response.ok) {
      const failure = await response.json().catch(() => null) as { message?: string } | null
      throw new Error(failure?.message || `手机返回 ${response.status}`)
    }
    const status = await response.json() as { ready?: boolean }
    if (!status.ready) throw new Error('手机相机还没有准备好')
    phoneCameraAddress.value = baseUrl
    localStorage.setItem('byteoj-phone-camera-address', baseUrl)
    phoneCameraConnected.value = true
    startPhoneCameraPreview()
  } catch (connectionError) {
    phoneCameraError.value = isHttpsPage
      ? `连接失败：${connectionError instanceof Error ? connectionError.message : '未检测到本机桥接'}。线上页面需要在这台电脑安装并启动 ByteOJ 手机相机桥接。`
      : `连接失败：${connectionError instanceof Error ? connectionError.message : '请确认手机与电脑在同一 Wi-Fi'}`
  } finally {
    phoneCameraConnecting.value = false
  }
}

const openPhoneCameraForSplitter = async () => {
  closeDesktopCamera()
  phoneCameraError.value = ''
  clearPhoneCameraShots()
  showPhoneCamera.value = true
  await nextTick()
  if (phoneCameraAddress.value) await connectPhoneCamera()
}

const closePhoneCamera = () => {
  showPhoneCamera.value = false
  phoneCameraConnecting.value = false
  phoneCameraCapturing.value = false
  phoneCameraConnected.value = false
  phoneCameraError.value = ''
  stopPhoneCameraPreview()
  clearPhoneCameraShots()
}

const handlePhoneCameraPreviewError = () => {
  if (!phoneCameraCapturing.value && phoneCameraConnected.value) {
    phoneCameraError.value = '暂时没有收到预览画面，请保持手机应用在前台。'
  }
}

const capturePhonePhoto = async () => {
  const baseUrl = normalizePhoneCameraAddress(phoneCameraAddress.value)
  if (!baseUrl || !phoneCameraConnected.value) return
  if (phoneCameraShots.value.length >= 30) {
    warning('一次最多连续拍摄 30 张，请先进入整页切分或清空已拍照片')
    return
  }
  phoneCameraCapturing.value = true
  phoneCameraError.value = ''
  stopPhoneCameraPreview()

  try {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 25000)
    let response: Response
    try {
      response = await fetch(buildPhoneCameraRequestUrl('/capture'), {
        method: 'POST',
        cache: 'no-store',
        signal: controller.signal,
      })
    } finally {
      window.clearTimeout(timeout)
    }
    if (!response.ok) {
      const failure = await response.json().catch(() => null) as { message?: string } | null
      throw new Error(failure?.message || `拍照失败（${response.status}）`)
    }
    const blob = await response.blob()
    if (!blob.type.startsWith('image/')) throw new Error('手机没有返回有效图片')
    const file = new File([blob], `exam-phone-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' })
    const previewUrl = URL.createObjectURL(file)
    const image = new Image()
    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error('无法读取手机照片'))
        image.src = previewUrl
      })
    } catch (imageError) {
      URL.revokeObjectURL(previewUrl)
      throw imageError
    }
    phoneCameraShots.value.push({
      id: Date.now() + phoneCameraShots.value.length,
      file,
      previewUrl,
      width: image.naturalWidth,
      height: image.naturalHeight,
    })
    phoneCameraPhotoResolution.value = `${image.naturalWidth} × ${image.naturalHeight}`
  } catch (captureError) {
    phoneCameraError.value = captureError instanceof Error ? captureError.message : '手机高清拍照失败'
  } finally {
    phoneCameraCapturing.value = false
    if (phoneCameraConnected.value) startPhoneCameraPreview()
  }
}

const sendPhonePhotosToSplitter = async () => {
  const files = phoneCameraShots.value.map(shot => shot.file)
  if (!files.length) return
  closePhoneCamera()
  await nextTick()
  await imageSplitter.value?.addExternalFiles(files)
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const uploadAnswerImage = async (file: File, _problemId?: number) => {
  const formData = new FormData()
  formData.append('files[]', file, file.name)
  const res = await UserControllerService.userUploadPictureUsingPost(formData, 2)
  if (res.code !== 0 || typeof res.data !== 'string' || !res.data) {
    throw new Error(res.message || '图片上传失败')
  }
  return res.data
}

interface SplitterQuestion {
  problemId: number
  order: number
  typeLabel: string
  hasImage: boolean
}

// 处理当前题目的单张图片上传
const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  uploading.value = true
  const problemId = currentQuestion.value.problem_id

  try {
    answers.value[problemId] = await uploadAnswerImage(target.files[0], problemId)
    success('答题图片上传成功')
  } catch (err) {
    console.error("图片上传异常", err)
    error(err instanceof Error ? err.message : "上传过程中发生错误")
  } finally {
    uploading.value = false
    // 清空 input 防止重复触发相同文件
    target.value = ''
  }
}

const handleSplitImagesApplied = (results: Record<number, string>) => {
  Object.entries(results).forEach(([problemId, url]) => {
    answers.value[Number(problemId)] = url
  })
  closeImageSplitter()
  success(`已为 ${Object.keys(results).length} 道题上传答案图片`)
}

// 删除已上传图片
const removeUploadedImage = (problemId: number, index: number) => {
  const current = answers.value[problemId]
  if (Array.isArray(current)) {
    current.splice(index, 1)
    if (current.length === 0) {
      delete answers.value[problemId]
    }
  } else {
    // 单张直接删除
    delete answers.value[problemId]
  }
}

const clearAllAnswerImages = () => {
  const problemIds = eligibleImageQuestions.value
      .filter(question => question.hasImage)
      .map(question => question.problemId)
  if (!problemIds.length) return
  if (!window.confirm(`确定清空已上传的 ${problemIds.length} 道题图片吗？文字答案不会被删除。`)) return
  problemIds.forEach(problemId => delete answers.value[problemId])
  success(`已清空 ${problemIds.length} 道题的图片答案`)
}

// ==================== 提交时的数据处理调整 ====================
const handleSubmit = async () => {
  showConfirmModal.value = true
}

// 确认后真正提交
const confirmSubmit = async () => {
  showConfirmModal.value = false
  submitting.value = true
  startProgress()

  const answerList = []

  for (const q of questions.value) {
    const pid = q.problem_id
    const val = answers.value[pid]

    let finalAnswer = ""
    let language = ""
    let submitStatus = getSubmitStatus(q)

    if (isAlgorithmQuestion(q)) {
      finalAnswer = typeof val === 'string' ? val : ''
      language = toJudgeLanguage(languageAnswers.value[pid] || defaultAlgorithmLanguage)
    } else {
      // 根据题型（q.option_type）决定 answer 格式
      switch (q.option_type) {
        case 1: // 单选
          finalAnswer = val ? `['${val}']` : ''
          break

        case 2: // 多选
          if (Array.isArray(val) && val.length > 0) {
            finalAnswer = `[${val.map(v => `'${v}'`).join(',')}]`
          }
          break

        case 3: // 填空
        case 0: // 简答
          // 后端只能识别一个纯图片 URL；有图片时不再拼接文字。
          if (typeof val === 'string' && val.startsWith('http')) finalAnswer = val
          else if (Array.isArray(val)) {
            finalAnswer = val.find(item => typeof item === 'string' && item.startsWith('http')) || ''
          }
          if (!finalAnswer) finalAnswer = textAnswers.value[pid]?.trim() || ''
          break

        case 4: // 算法题
                // 如果你后面实现了代码保存，这里可以放代码字符串
          finalAnswer = val || ""   // 目前大多为空
          break

        default:
          finalAnswer = String(val || "").trim()
      }
    }

    // 无论是否作答，都包含这条记录，并带上真实的题型 status
    answerList.push({
      problem_id: pid,
      answer: finalAnswer,
      language,
      status: submitStatus
    })
  }

  const request = {
    exam_id: examData.value?.exam_id,
    answers: answerList
  }

  console.log('准备提交的数据：', JSON.stringify(request, null, 2))

  // 调用接口...
  try {
    const res = await ProblemsControllerService.problemExamSubmitUsingPost(request)
    if (res.code === 0) {
      resultData.value = res.data
      await finishProgress()
      await new Promise(r => setTimeout(r, 350))
      showResult.value = true
    } else {
      error("提交失败：" + (res.message || "未知错误"))
    }
  } catch (err) {
    error("网络错误，提交失败")
  } finally {
    stopProgress()
    submitting.value = false
  }
}
// --- 计算属性 ---
const currentQuestion = computed(() => questions.value[currentIndex.value] || {})

const eligibleImageQuestions = computed<SplitterQuestion[]>(() => {
  return questions.value.flatMap((question, index) => {
    if (isAlgorithmQuestion(question) || (question.option_type !== 0 && question.option_type !== 3)) return []
    return [{
      problemId: question.problem_id,
      order: index + 1,
      typeLabel: question.option_type === 3 ? '填空题' : '简答题',
      hasImage: getAnswerImages(question.problem_id).length > 0,
    }]
  })
})

const uploadedAnswerImageCount = computed(() => {
  return eligibleImageQuestions.value.filter(question => question.hasImage).length
})

const displayTimer = computed(() => {
  const h = Math.floor(remaining.value / 3600).toString().padStart(2, '0')
  const m = Math.floor((remaining.value % 3600) / 60).toString().padStart(2, '0')
  const s = (remaining.value % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

const answeredCount = computed(() => {
  const count = questions.value.filter(q => isAnswered(q.problem_id)).length
  return `${count} / ${questions.value.length}`
})

const progress = computed(() => {
  if (questions.value.length === 0) return 0
  const count = questions.value.filter(q => isAnswered(q.problem_id)).length
  return Math.round((count / questions.value.length) * 100)
})

const totalScore = computed(() => {
  return questions.value.reduce((sum, q) => sum + (q.score || 0), 0)
})

// 解析选项：后端返回的是字符串 "['A', 'B']", 需要转为数组
const parsedOptions = computed(() => {
  const optStr = currentQuestion.value.options
  if (!optStr) return []
  try {
    // 处理可能存在的单引号问题，JSON.parse 只支持双引号
    // 如果后端严格返回标准 JSON 字符串则直接 parse，否则需要替换单引号
    const normalized = optStr.replace(/'/g, '"')
    return JSON.parse(normalized)
  } catch (e) {
    console.error('解析选项失败', e)
    return []
  }
})

// --- 方法 ---

// 获取题型标签
const getQuestionTypeLabel = (type: number | null, status: number) => {
  if (status === 3) return '算法题'
  switch (type) {
    case 1: return '单选题'
    case 2: return '多选题'
    case 3: return '填空题'
    case 0: return '简答题'
    default: return '未知题型'
  }
}

const getLetter = (i: number) => String.fromCharCode(65 + i)

const isAlgorithmQuestion = (q: Partial<ProblemItem>) => {
  return q.status === 3 || q.option_type === 4
}

const getSubmitStatus = (q: ProblemItem) => {
  return isAlgorithmQuestion(q) ? 4 : (q.option_type ?? q.status)
}

const toJudgeLanguage = (language: string) => {
  return algorithmLanguageMap[language] || language || 'cpp'
}

const ensureAlgorithmLanguage = (problemId: number) => {
  if (!languageAnswers.value[problemId]) {
    languageAnswers.value[problemId] = defaultAlgorithmLanguage
  }
}

const ensureAlgorithmAnswer = (problemId: number) => {
  ensureAlgorithmLanguage(problemId)
  if (answers.value[problemId] === undefined || answers.value[problemId] === null) {
    answers.value[problemId] = ''
  }
}

// 判断是否选中 (兼容单选字符串和多选数组)
const isSelected = (id: number, letter: string) => {
  const ans = answers.value[id]
  if (ans === undefined) return false
  if (typeof ans === 'string') return ans === letter
  if (Array.isArray(ans)) return ans.includes(letter)
  return false
}

// 判断是否已作答
const isAnswered = (id: number) => {
  const ans = answers.value[id]
  if (ans === undefined || ans === null) return false
  if (Array.isArray(ans)) return ans.length > 0
  return String(ans).trim().length > 0
}
// 监听 answers 变化 → 保存到 localStorage（防抖版本更友好）
watch(
    answers,
    (newAnswers) => {
      if (!storageKey.value) return

      // 简单深拷贝，避免循环引用问题
      const toSave = JSON.parse(JSON.stringify(newAnswers))

      localStorage.setItem(storageKey.value, JSON.stringify(toSave))
      console.log('答案已保存到 localStorage')
    },
    { deep: true, debounce: 800 }  // 防抖 800ms，避免频繁写入
)
watch(
    languageAnswers,
    (newLanguages) => {
      if (!languageStorageKey.value) return
      localStorage.setItem(languageStorageKey.value, JSON.stringify(newLanguages))
    },
    { deep: true, debounce: 800 }
)
const currentIndexChange = (index: number, status: number, problem_id: number) => {
  currentIndex.value = index;
  localStorage.setItem(examData.value?.exam_id + "-currentIndex", index);
  const question = questions.value[index]
  if (isAlgorithmQuestion(question)) {
    ensureAlgorithmAnswer(problem_id)
    router.replace({
      name: route.name,
      query: {
        exam_id: examData.value?.exam_id,
        problem_id: problem_id ?? null
      }
    });
  }
};
// 简单的数学公式渲染占位 (实际项目中建议引入 katex 或 mathjax)
const renderMath = (text: string) => {
  if (!text) return ''
  // 这里仅做简单的换行处理，实际需对接公式库
  return text.replace(/\n/g, '<br/>')
}

const goPrev = () => { if (currentIndex.value > 0) currentIndex.value-- }
const goNext = () => { if (currentIndex.value < questions.value.length - 1) currentIndex.value++ }

const startTimer = () => {
  // 如果有后端返回的考试时间，可以在这里初始化 remaining
  // if (examData.value?.time) remaining.value = examData.value.time * 60

  timerInterval = window.setInterval(() => {
    remaining.value--
    if (remaining.value <= 0) {
      stopTimer()
      error('考试时间到！系统将自动提交～')
      handleSubmit()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// 分组后的数据
const groupedQuestions = computed(() => {
  if (!questions.value.length) return []

  const groups: ProblemItem[][] = []
  let currentGroup: ProblemItem[] = []
  let prevType: number | null = null

  questions.value.forEach(q => {
    const type = getEffectiveType(q)  // 统一处理 type

    if (type !== prevType || currentGroup.length === 0) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup)
      }
      currentGroup = [q]
      prevType = type
    } else {
      currentGroup.push(q)
    }
  })

  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }

  return groups
})

// 获取显示用的类型名称
const getGroupTypeName = (q: ProblemItem) => {
  if (isAlgorithmQuestion(q)) return '算法题'
  switch (q.option_type) {
    case 0: return '简答题'
    case 1: return '单选题'
    case 2: return '多选题'
    case 3: return '填空题'
    case 4: return '算法题'   // 如果有独立用4表示算法题的情况
    default: return '其他题型'
  }
}

// 把 1,2,3,4... 转成 一、二、三...
const numberToChinese = (n: number) => {
  const chineseNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  if (n <= 10) return chineseNums[n - 1]
  if (n === 11) return '十一'
  // 更多可以继续扩展，或者用更通用的转换函数
  return n.toString()
}

// 统一获取“类型”，方便分组（因为算法题用 status=3 判断）
const getEffectiveType = (q: ProblemItem) => {
  if (isAlgorithmQuestion(q)) return -1   // 用一个特殊值代表算法题
  return q.option_type
}
// --- 生命周期 ---
onMounted(async () => {
  window.addEventListener('keydown', handleImagePreviewKeydown)
  await loadPhoneCameraBridgeDownloadUrls()

  const examId = route.query.exam_id
  let current = localStorage.getItem(examId + "-currentIndex");
  if (current) {
    currentIndex.value = parseInt(current);
  } else {
    currentIndex.value = 0
  }
  if (!examId) {
    error('缺少考试ID参数')
    loading.value = false
    return
  }

  try {
    // 1. 获取考试基本信息 (可选，如果需要展示考试名称等)
    const infoRes = await ProblemsControllerService.problemSearchExamIdUsingGet(Number(examId))
    if (infoRes.code === 0) examData.value = infoRes.data

    // 2. 获取题目列表 (核心接口)
    const res = await ProblemsControllerService.problemExamSearchDetailUsingGet(Number(examId))

    if (res.code === 0 && Array.isArray(res.data)) {
      questions.value = res.data
      questions.value.forEach((question) => {
        if (isAlgorithmQuestion(question)) {
          ensureAlgorithmLanguage(question.problem_id)
        }
      })
      if (questions.value.length > 0) {
        if (isAlgorithmQuestion(questions.value[currentIndex.value])) {
          ensureAlgorithmAnswer(questions.value[currentIndex.value].problem_id)
          router.replace({
            name: route.name,
            query: {
              exam_id: examData.value?.exam_id,
              problem_id: questions.value[currentIndex.value].problem_id ?? null
            }
          });
        }
      }
      // 初始化计时器 (假设默认3小时，或者从 infoRes 中获取)
      remaining.value = 3 * 3600
      startTimer()
    } else {
      error('获取题目失败：' + res.message)
    }
  } catch (error) {
    error('网络错误，加载失败')
  } finally {
    loading.value = false
  }

  if (storageKey.value) {
    const saved = localStorage.getItem(storageKey.value)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        answers.value = parsed
        console.log('已从 localStorage 恢复答案')
      } catch (e) {
        console.warn('localStorage 答案解析失败，已忽略', e)
      }
    }
  }

  if (languageStorageKey.value) {
    const savedLanguages = localStorage.getItem(languageStorageKey.value)
    if (savedLanguages) {
      try {
        languageAnswers.value = JSON.parse(savedLanguages)
      } catch (e) {
        console.warn('localStorage 语言解析失败，已忽略', e)
      }
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleImagePreviewKeydown)
  stopTimer()
  stopDesktopCameraStream()
  clearDesktopCameraCapture()
  stopPhoneCameraPreview()
  clearPhoneCameraShots()
})
</script>
<style scoped>
/* --- 1. 局部变量定义 --- */
.exam-container {
  --bg-main: #f8f9fc;
  --bg-card: #ffffff;
  --border: #e2e8f0;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --primary: #6366f1;
  --primary-soft: #818cf8;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --algo-bg: #1e1e1e;
  --algo-text: #d4d4d4;

  background-color: var(--bg-main);
}

.exam-container :deep(img:not(.exam-image-viewer img)) {
  cursor: zoom-in;
}

.exam-image-viewer {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(3, 7, 18, 0.88);
}

.exam-image-viewer-dialog {
  width: min(1280px, 100%);
  height: min(900px, calc(100vh - 40px));
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid #475569;
  border-radius: 8px;
  background: #111827;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}

.exam-image-viewer-dialog > header,
.exam-image-viewer-dialog > footer {
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: #ffffff;
  color: #1f2937;
}

.exam-image-viewer-dialog > header {
  justify-content: space-between;
  border-bottom: 1px solid #dbe2ea;
}

.exam-image-viewer-dialog > header strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.exam-image-viewer-dialog button {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
}

.exam-image-viewer-dialog button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.exam-image-viewer-dialog button svg {
  width: 20px;
  height: 20px;
}

.exam-image-viewer-stage {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
  background: #111827;
}

.exam-image-viewer-canvas {
  min-width: 100%;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exam-image-viewer-canvas img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
  cursor: default;
  user-select: none;
}

.exam-image-viewer-dialog > footer {
  justify-content: center;
  border-top: 1px solid #dbe2ea;
}

.exam-image-viewer-dialog output {
  width: 56px;
  color: #475569;
  font-size: 13px;
  text-align: center;
}

/* --- 2. 基础重置 --- */
.exam-container,
.exam-container * {
  box-sizing: border-box;
}

/* --- 3. 布局与主要结构 --- */
.exam-container {
  max-width: 1280px;
  margin: 40px auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;
  /* 默认字体，但会被内部的代码/公式规则覆盖 */
  font-family: "Segoe UI", "Microsoft YaHei", sans-serif;
  border-radius: 2%;
  color: var(--text-primary);
  line-height: 1.6;
}

header {
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 20px 28px;
  position: sticky;
  top: 0;
  z-index: 100;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.exam-title {
  font-size: 1.42rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.timer {
  font-size: 1.38rem;
  font-weight: 700;
  color: var(--primary);
  font-family: "Courier New", monospace;
  background: #f0f4ff;
  padding: 8px 20px;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

.timer-warning {
  color: #ef4444;
  background: #fef2f2;
  animation: pulse 1s infinite;
}

.question-panel {
  background: var(--bg-card);
  border-radius: 24px;
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.question-header {
  padding: 28px 32px;
  border-bottom: 1px solid var(--gray-200);
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
}

.q-type {
  font-size: 0.95rem;
  color: var(--primary);
  font-weight: 700;
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.badge {
  background: #e0e7ff;
  color: #4338ca;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.q-title {
  font-size: 1.25rem;
  line-height: 1.55;
  font-weight: 600;
  margin-bottom: 12px;
}

.q-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.tag-item {
  font-size: 0.8rem;
  background: #f1f5f9;
  color: var(--text-secondary);
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid var(--gray-200);
}

.q-content {
  padding: 28px;
}

/* --- 4. 算法题占位符 --- */
.algo-editor-placeholder {
  background: #2d2d2d;
  color: #fff;
  padding: 30px;
  border-radius: 16px;
  text-align: center;
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.mock-editor {
  background: #1e1e1e;
  color: #d4d4d4;
  text-align: left;
  padding: 20px;
  border-radius: 8px;
  font-family: 'Consolas', monospace;
  margin-top: 20px;
  border: 1px solid #444;
}

/* --- 5. 选项样式 (核心修复部分) --- */
.option-item {
  display: flex;
  align-items: flex-start;
  padding: 18px 20px;
  margin: 12px 0;
  border: 1.5px solid var(--gray-200);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
  background: #fff;
}

.option-item:hover {
  background: #f8fbff;
  border-color: var(--primary-soft);
  transform: translateY(-2px);
}

/* ✅ 选中状态 */
.option-item.selected {
  background-color: #f0f4ff !important;
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

/* 🔴 修复：对勾颜色改为深色，确保在浅蓝背景上可见 */
.option-item.selected::after {
  content: "✓";
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.35rem;
  color: #4338ca; /* 深靛蓝色 */
  font-weight: bold;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

.option-letter {
  font-weight: 700;
  color: var(--text-secondary);
  margin-right: 12px;
  min-width: 24px;
}

.option-text {
  flex: 1;
  line-height: 1.6;
  font-size: 1.05rem;
}

input[type="radio"],
input[type="checkbox"] {
  margin-top: 5px;
  accent-color: var(--primary);
  transform: scale(1.15);
}

/* 🔴 修复：精准重置普通文本样式，但不破坏数学公式 */
.option-item :deep(.markdown-content),
.option-item :deep(p),
.option-item :deep(ul),
.option-item :deep(ol),
.option-item :deep(li),
.option-item :deep(blockquote) {
  background-color: transparent !important;
  color: inherit;
  border: none !important;
}

/* 🛡️ 关键修复：保护数学公式 (KaTeX/MathJax) 不被上面的 border:none 破坏 */
/* 这解决了分数线消失的问题 */
.option-item :deep(.katex),
.option-item :deep(.mjx-container),
.option-item :deep(.mjx-container *) {
  background-color: initial !important;
  border: initial !important;      /* 恢复分数线 border */
  color: initial !important;       /* 恢复公式默认颜色 */
  line-height: normal !important;  /* 防止行高压缩导致公式变形 */
  font-family: 'KaTeX_Main', 'Times New Roman', serif !important;
}

/* 🛡️ 保护代码块字体 */
.option-item :deep(pre),
.option-item :deep(code) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
  background-color: rgba(0, 0, 0, 0.03) !important; /* 轻微背景以区分代码 */
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}

/* --- 6. 填空题与其他 --- */
.fill-blank {
  width: 100%;
  padding: 18px 20px;
  border: 1.5px solid var(--gray-200);
  border-radius: 18px;
  font-size: 1.08rem;
  resize: vertical;
  min-height: 140px;
  font-family: inherit;
}

.fill-blank:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
  outline: none;
}

.problem-description {
  margin: 5px 40px;
  padding-top: 20px;
  border-top: 1px dashed var(--gray-200);
}

.problem-description h4 {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.desc-content {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #334155;
}

/* --- 7. 侧边栏与按钮 --- */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.card {
  background: var(--bg-card);
  border-radius: 22px;
  border: 1px solid var(--border);
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
}

.card-header {
  padding: 18px 24px;
  background: #f8fafc;
  font-weight: 700;
  color: var(--text-secondary);
}

.question-nav {
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.q-btn {
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1.5px solid var(--gray-200);
  background: white;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.q-btn:hover {
  background: #f1f5f9;
  transform: scale(1.08);
}

.q-btn.answered {
  background: #e0f2fe;
  border-color: #38bdf8;
  color: #0ea5e9;
}

.q-btn.current {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.25);
}

.q-btn.is-algo {
  background: #2d2d2d;
  color: #fff;
  border-color: #444;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid var(--gray-100);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--text-secondary);
}

.info-value {
  font-weight: 600;
}

.submit-wrapper {
  padding-top: 4px;
}

.btn-submit {
  width: 100%;
  padding: 18px 32px;
  font-size: 1.22rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);
}

.btn-submit:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.45);
}

.question-footer {
  padding: 20px 28px 28px;
  display: flex;
  gap: 16px;
  background: #fafcff;
  border-top: 1px solid var(--gray-200);
}

.nav-btn {
  flex: 1;
  padding: 16px 24px;
  font-size: 1.05rem;
  font-weight: 600;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.25s;
}

.nav-btn.prev {
  background: #f1f5f9;
  color: #64748b;
}

.nav-btn.next {
  background: var(--primary);
  color: white;
}

.nav-btn:hover {
  transform: translateY(-3px);
}

.nav-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 100px 20px;
  font-size: 1.2rem;
  color: var(--text-secondary);
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

@media (max-width: 960px) {
  .exam-container {
    grid-template-columns: 1fr;
  }
  .sidebar {
    order: -1;
  }
}

.fill-answer-area {
  padding: 12px 0;
}

.image-answer-summary {
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding: 8px 12px;
  border: 1px solid #dbe2ea;
  border-radius: 6px;
  background: #f8fafc;
  color: #475569;
  font-size: 14px;
}

.clear-images-button {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  background: #ffffff;
  color: #b91c1c;
  cursor: pointer;
}

.clear-images-button svg {
  width: 17px;
  height: 17px;
}

.clear-images-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.uploaded-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.image-preview-item {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #f8fafc;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
}

.upload-zone {
  margin: 16px 0 24px;
  padding: 20px;
  border: 2px dashed #b8c4d4;
  border-radius: 8px;
  background: #fbfcfe;
  transition: border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease;
}

.upload-zone.is-dragging {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.drop-zone-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #334155;
}

.drop-zone-copy > svg {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  color: #2563eb;
}

.drop-zone-copy strong,
.drop-zone-copy span {
  display: block;
}

.drop-zone-copy strong {
  font-size: 15px;
}

.drop-zone-copy span {
  margin-top: 2px;
  color: #64748b;
  font-size: 13px;
}

.upload-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.btn-upload {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 24px;
  font-size: 1.05rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-upload svg {
  width: 19px;
  height: 19px;
}

.btn-upload:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-upload.batch-upload {
  background: #ffffff;
  color: #4338ca;
  border: 1px solid #6366f1;
}

.camera-upload {
  display: none;
  background: #0f766e;
}

.desktop-camera-upload {
  background: #0f766e;
}

.desktop-camera-overlay {
  position: fixed;
  inset: 0;
  z-index: 5200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.78);
}

.desktop-camera-modal {
  width: min(820px, 100%);
  max-height: calc(100vh - 40px);
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr) auto auto;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.38);
}

.desktop-camera-header {
  min-height: 66px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid #dbe2ea;
}

.desktop-camera-header h3 {
  margin: 0;
  color: #172033;
  font-size: 18px;
}

.desktop-camera-header span {
  display: block;
  margin-top: 2px;
  color: #64748b;
  font-size: 13px;
}

.desktop-camera-device-bar {
  min-height: 54px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 9px 18px;
  border-bottom: 1px solid #dbe2ea;
  background: #f8fafc;
}

.desktop-camera-device-bar label {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.desktop-camera-device-bar select {
  min-width: 0;
  flex: 1;
  height: 34px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #172033;
  font: inherit;
}

.phone-camera-address-bar {
  min-height: 58px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 18px;
  border-bottom: 1px solid #dbe2ea;
  background: #f8fafc;
}

.phone-camera-address-bar label {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.phone-camera-address-bar input {
  min-width: 0;
  flex: 1;
  height: 36px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #172033;
  font: inherit;
}

.phone-camera-connection {
  flex: 0 0 auto;
  color: #b91c1c;
  font-size: 13px;
}

.phone-camera-connection.connected {
  color: #047857;
}

.phone-camera-download-bar {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 18px;
  border-bottom: 1px solid #dbe2ea;
  background: #ffffff;
  color: #475569;
  font-size: 13px;
}

.phone-camera-download-bar > span {
  margin-right: 2px;
  font-weight: 600;
}

.phone-camera-download-link {
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
  color: #334155;
  text-decoration: none;
}

.phone-camera-download-link:hover {
  border-color: #2563eb;
  color: #1d4ed8;
}

.phone-camera-download-link svg {
  width: 15px;
  height: 15px;
}

.phone-camera-stage {
  aspect-ratio: 16 / 10;
}

.phone-camera-shots {
  min-height: 82px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 18px;
  border-top: 1px solid #dbe2ea;
  background: #ffffff;
}

.phone-camera-shot {
  position: relative;
  width: 72px;
  height: 64px;
  flex: 0 0 72px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #0f172a;
}

.phone-camera-shot > img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.phone-camera-shot > span {
  position: absolute;
  left: 4px;
  bottom: 4px;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.82);
  color: #ffffff;
  font-size: 12px;
  line-height: 20px;
  text-align: center;
}

.phone-camera-shot > button {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: rgba(185, 28, 28, 0.9);
  color: #ffffff;
  cursor: pointer;
}

.phone-camera-shot > button svg {
  width: 16px;
  height: 16px;
}

.phone-camera-shot > button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.phone-camera-photo-info {
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 18px;
  border-top: 1px solid #dbe2ea;
  color: #475569;
  font-size: 13px;
}

.desktop-camera-resolution {
  flex: 0 0 auto;
  color: #475569;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.camera-icon-button {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
}

.camera-icon-button svg {
  width: 21px;
  height: 21px;
}

.desktop-camera-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  min-height: 0;
  overflow: hidden;
  background: #0f172a;
}

.desktop-camera-stage video,
.desktop-camera-stage img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.desktop-camera-status {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  color: #e2e8f0;
  text-align: center;
}

.desktop-camera-status.camera-error {
  color: #fecaca;
}

.phone-camera-stage .desktop-camera-status.camera-error {
  flex-direction: column;
  gap: 14px;
}

.phone-camera-bridge-download {
  min-height: 36px;
  text-decoration: none;
}

.desktop-camera-status.camera-processing {
  background: rgba(15, 23, 42, 0.54);
  color: #dbeafe;
}

.desktop-camera-enhancement {
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 9px 18px;
  border-top: 1px solid #dbe2ea;
  background: #f8fafc;
  color: #334155;
  font-size: 13px;
}

.camera-enhancement-toggle,
.camera-enhancement-strength {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.camera-enhancement-toggle {
  font-weight: 600;
  cursor: pointer;
}

.camera-enhancement-toggle input {
  width: 18px;
  height: 18px;
  margin: 0;
}

.camera-enhancement-strength {
  min-width: 280px;
  flex: 1;
}

.camera-enhancement-strength input[type="range"] {
  min-width: 140px;
  flex: 1;
  accent-color: #2563eb;
}

.camera-enhancement-strength output {
  width: 42px;
  color: #1d4ed8;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.camera-enhancement-strength.disabled {
  opacity: 0.48;
}

.desktop-camera-actions {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid #dbe2ea;
}

.camera-primary-button,
.camera-secondary-button {
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
}

.camera-primary-button {
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.camera-secondary-button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.camera-primary-button svg,
.camera-secondary-button svg {
  width: 18px;
  height: 18px;
}

.camera-primary-button:disabled,
.camera-secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.upload-tip {
  margin-top: 8px;
  text-align: center;
  font-size: 0.9rem;
  color: #64748b;
}

@media (hover: none), (pointer: coarse) {
  .camera-upload {
    display: inline-flex;
  }

  .drop-zone-copy {
    display: none;
  }

  .upload-buttons {
    margin-top: 0;
  }

}

@media (max-width: 640px) {
  .image-answer-summary {
    align-items: stretch;
    flex-direction: column;
  }

  .clear-images-button,
  .btn-upload {
    width: 100%;
  }

  .upload-zone {
    padding: 14px;
  }

  .desktop-camera-upload {
    display: none;
  }

  .desktop-camera-overlay {
    padding: 0;
  }

  .desktop-camera-modal {
    width: 100%;
    max-height: 100vh;
    border: 0;
    border-radius: 0;
  }

  .desktop-camera-actions > button {
    flex: 1 1 140px;
  }

  .desktop-camera-enhancement {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
  }

  .camera-enhancement-strength {
    min-width: 0;
    width: 100%;
  }

  .desktop-camera-device-bar {
    align-items: stretch;
    flex-direction: column;
    gap: 6px;
  }

  .desktop-camera-device-bar label {
    align-items: stretch;
    flex-direction: column;
    gap: 5px;
  }

  .phone-camera-address-bar {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .phone-camera-address-bar label {
    flex-basis: 100%;
    align-items: stretch;
    flex-direction: column;
    gap: 5px;
  }

  .phone-camera-download-bar {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .phone-camera-download-bar > span {
    flex-basis: 100%;
  }
}

.fill-blank {
  /* 原来的样式 */
  margin-top: 16px;
}

.result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.4s ease;
}

.result-card {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 32px 24px;
  text-align: center;
  position: relative;
}

.result-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.result-icon.success {
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: bold;
  margin: 16px auto 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.result-body {
  padding: 32px 28px;
}

.exam-info {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 28px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #64748b;
  font-weight: 500;
}

.value {
  font-weight: 600;
  color: #1e293b;
}

.total-score .value {
  font-size: 1.5rem;
  color: #6366f1;
}

.score-breakdown {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.score-item {
  background: #f1f5f9;
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
}

.score-label {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.score-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
}

.result-footer {
  text-align: center;
}

.tip {
  color: #64748b;
  margin-bottom: 24px;
  font-size: 0.95rem;
}

.buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 14px 32px;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s;
  border: none;
}

.btn.primary {
  background: #6366f1;
  color: white;
}

.btn.primary:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}

.btn.secondary {
  background: #e2e8f0;
  color: #1e293b;
}

.btn.secondary:hover {
  background: #cbd5e1;
  transform: translateY(-2px);
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
.result-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.4s ease;
}

.result-card {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.result-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 32px 24px;
  text-align: center;
  position: relative;
}

.result-header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.result-icon.success {
  width: 80px;
  height: 80px;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: bold;
  margin: 16px auto 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.result-body {
  padding: 32px 28px;
}

.exam-info {
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 28px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  color: #64748b;
  font-weight: 500;
}

.value {
  font-weight: 600;
  color: #1e293b;
}

.total-score .value {
  font-size: 1.5rem;
  color: #6366f1;
}

.score-breakdown {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.score-item {
  background: #f1f5f9;
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
}

.score-label {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.score-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1e293b;
}

.result-footer {
  text-align: center;
}

.tip {
  color: #64748b;
  margin-bottom: 24px;
  font-size: 0.95rem;
}

.buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 14px 32px;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s;
  border: none;
}

.btn.primary {
  background: #6366f1;
  color: white;
}

.btn.primary:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}

.btn.secondary {
  background: #e2e8f0;
  color: #1e293b;
}

.btn.secondary:hover {
  background: #cbd5e1;
  transform: translateY(-2px);
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
}

.confirm-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 420px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
}

.confirm-modal h3 {
  margin: 0 0 16px;
  font-size: 1.5rem;
  color: #1e293b;
}

.confirm-modal p {
  color: #64748b;
  margin: 0 0 28px;
}

.modal-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 12px 32px;
  font-size: 1.05rem;
  font-weight: 600;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn.cancel {
  background: #e2e8f0;
  color: #475569;
}

.btn.cancel:hover {
  background: #cbd5e1;
}

.btn.confirm {
  background: #ef4444;
  color: white;
}

.btn.confirm:hover:not(:disabled) {
  background: #dc2626;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 提交中加载 - 代码终端风格 */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(13, 17, 23, 0.88);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1800;
}

.loading-terminal {
  width: 90%;
  max-width: 540px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 12px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55),
              0 0 0 1px rgba(255, 255, 255, 0.03) inset;
  overflow: hidden;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  animation: termIn 0.4s ease;
}

@keyframes termIn {
  from { transform: translateY(20px) scale(0.96); opacity: 0; }
  to   { transform: translateY(0) scale(1); opacity: 1; }
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.term-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.term-dot.red    { background: #ff5f56; }
.term-dot.yellow { background: #ffbd2e; }
.term-dot.green  { background: #27c93f; }

.term-title {
  margin-left: 10px;
  color: #8b949e;
  font-size: 0.8rem;
  letter-spacing: 0.3px;
}

.terminal-body {
  padding: 20px 22px;
  color: #c9d1d9;
  font-size: 0.88rem;
  line-height: 1.85;
}

.term-line {
  white-space: nowrap;
  overflow: hidden;
}

.prompt {
  color: #3fb950;
  margin-right: 8px;
  font-weight: 700;
}

.log-info { color: #58a6ff; font-weight: 700; }
.log-ok   { color: #3fb950; font-weight: 700; }
.log-text { color: #c9d1d9; }

/* 进度条 */
.progress-block {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 0 12px;
}

.progress-track {
  flex: 1;
  height: 10px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1f6feb 0%, #3fb950 100%);
  border-radius: 3px;
  transition: width 0.12s linear;
  box-shadow: 0 0 14px rgba(63, 185, 80, 0.45);
  position: relative;
}

/* 进度条流光扫描 */
.progress-fill::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  background-size: 60px 100%;
  background-repeat: no-repeat;
  animation: progScan 1.2s linear infinite;
}

@keyframes progScan {
  from { background-position: -60px 0; }
  to   { background-position: calc(100% + 60px) 0; }
}

.progress-percent {
  color: #3fb950;
  font-weight: 700;
  min-width: 52px;
  text-align: right;
  font-size: 0.9rem;
}

/* 闪烁光标 */
.term-cursor {
  color: #3fb950;
  margin-left: 4px;
  animation: termBlink 1s step-end infinite;
}

@keyframes termBlink {
  0%, 50%   { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 扫描线效果 */
.terminal-body::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.02) 0px,
    rgba(255, 255, 255, 0.02) 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
}

/* 动画过渡 */
.modal-fade-enter-active, .modal-fade-leave-active,
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from, .modal-fade-leave-to,
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.btn-submit {
  width: 100%;
  padding: 18px 32px;
  font-size: 1.22rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.35);
  position: relative;
  overflow: hidden;
}

.btn-submit:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.45);
}

.btn-submit:active {
  transform: translateY(1px);
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.3);
}

.question-nav-wrapper {
  padding: 20px;
}

.group-title {
  font-weight: 700;
  color: #475569;
  padding: 12px 8px 6px;
  font-size: 1.05rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 12px;
  background: #f8fafc;
  border-radius: 8px 8px 0 0;
}

.group-nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #cbd5e1;
}

.group-nav:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

/* 让分组之间的间距更明显一点 */
.group-nav + .group-title {
  margin-top: 20px;
}

.algorithm-answer-area {
  border: 1px solid #dbe3ef;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}

.algorithm-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
  font-weight: 600;
}

.algorithm-language {
  min-width: 150px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  padding: 9px 12px;
  outline: none;
}

.algorithm-code {
  width: 100%;
  min-height: 460px;
  padding: 18px;
  border: none;
  outline: none;
  resize: vertical;
  background: #0f172a;
  color: #e2e8f0;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 15px;
  line-height: 1.7;
}
</style>
