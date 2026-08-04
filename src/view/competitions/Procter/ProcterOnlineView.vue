<template>
  <div v-if="isVisible" class="camera-proctor-container">
    <!-- 视频区域 -->
    <div class="video-wrapper">
      <button class="hide-btn" @click="toggleVisibility">✕</button>
      <video
          ref="videoRef"
          autoplay
          muted
          playsinline
          width="640"
          height="480"
      ></video>
      <div v-if="currentStatus" class="status-overlay" :class="statusClass">
        {{ currentStatus }}
      </div>
    </div>

    <!-- 报警信息面板 -->
    <div v-if="latestResult" class="alert-panel">
      <h3>⚠️ 最新监考结果（{{ formatTime(latestResult.procterTime) }}）</h3>
      <div v-if="hasAbnormal" class="alerts-list">
        <div
            v-for="(behavior, index) in abnormalBehaviors"
            :key="index"
            class="alert-item"
            :class="`severity-${behavior.severity}`"
        >
          <span class="badge" :class="behavior.severity">{{ behavior.severity }}</span>
          {{ behavior.description }}
        </div>
      </div>
      <div v-else class="normal-status">
        {{ noFaceDetected ? '❓ 未检测到人脸（画面可能异常）' : '✅ 监考正常' }}
      </div>
    </div>

    <!-- 调试倒计时（可选） -->
    <div class="debug-info" v-if="nextCaptureIn > 0">
      下次自动上传：{{ nextCaptureIn }} 秒后
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, computed, onMounted } from 'vue'

// refs
const isVisible = ref(true)
const videoRef = ref<HTMLVideoElement | null>(null)
const mediaStream = ref<MediaStream | null>(null)
const captureInterval = ref<number | null>(null)
const currentStatus = ref('')
const latestResult = ref<any>(null)
const nextCaptureIn = ref(0)

// 接口地址
// const UPLOAD_URL = 'http://localhost:7091/api/competition/procter'
const UPLOAD_URL = 'https://www.byteoj.com/api/competition/procter'

// 启动摄像头并等待首帧
async function startCamera() {
  if (mediaStream.value) return

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    })
    mediaStream.value = stream

    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }

    // 等待视频加载有效帧（最多3秒）
    await new Promise<void>((resolve) => {
      if (!videoRef.value) {
        resolve()
        return
      }
      const video = videoRef.value
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA
        resolve()
        return
      }
      const onLoaded = () => {
        video.removeEventListener('loadeddata', onLoaded)
        resolve()
      }
      video.addEventListener('loadeddata', onLoaded, { once: true })
      setTimeout(resolve, 3000)
    })

    currentStatus.value = '摄像头已就绪'
  } catch (err) {
    console.error('摄像头访问失败:', err)
    currentStatus.value = `❌ 摄像头错误: ${err instanceof Error ? err.message : '请允许权限'}`
    alert('无法访问摄像头，请确保使用 HTTPS 或 localhost 并允许权限')
  }
}

// 安全截图：确保帧有效且非黑/白屏
function captureValidFrame(): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (!videoRef.value || !mediaStream.value) {
      resolve(null)
      return
    }

    const video = videoRef.value
    if (video.readyState < 2) {
      console.warn('视频帧未就绪，放弃截图')
      resolve(null)
      return
    }

    const width = video.videoWidth || 640
    const height = video.videoHeight || 480
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve(null)
      return
    }

    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(video, 0, 0, width, height)

    // 多点采样
    const samples = [
      { x: width / 4, y: height / 4 },
      { x: 3 * width / 4, y: height / 4 },
      { x: width / 4, y: 3 * height / 4 },
      { x: 3 * width / 4, y: 3 * height / 4 },
      { x: width / 2, y: height / 2 }
    ]

    let totalBrightness = 0
    let validCount = 0

    for (const { x, y } of samples) {
      try {
        const pixel = ctx.getImageData(x, y, 1, 1).data
        const [r, g, b] = pixel
        const brightness = (r + g + b) / 3
        if (brightness >= 10 && brightness <= 245) {
          totalBrightness += brightness
          validCount++
        }
      } catch (e) {}
    }

    if (validCount < 3) {
      console.warn('采样不足，视为无效画面')
      resolve(null)
      return
    }

    const avgBrightness = totalBrightness / validCount
    if (avgBrightness < 30 || avgBrightness > 230) {
      console.warn('平均亮度异常，视为无效画面')
      resolve(null)
      return
    }

    canvas.toBlob(resolve, 'image/jpeg', 0.85)
  })
}

// 自动截图并上传
async function takePhotoAndUpload() {
  const blob = await captureValidFrame()
  if (!blob) {
    currentStatus.value = '❌ 无效画面：黑屏/白屏/未就绪'
    latestResult.value = null
    return
  }

  const formData = new FormData()
  formData.append('file', blob, `frame_${Date.now()}.jpg`)

  try {
    currentStatus.value = '🔍 正在分析...'
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })

    if (response.ok) {
      const result = await response.json()
      latestResult.value = result.data

      const behaviors = result.data?.procterBehavior || []
      const hasHighRisk = behaviors.some((b: any) => b.severity === 'high')
      const hasMediumRisk = behaviors.some((b: any) => b.severity === 'medium')
      const hasFace = behaviors.some((b: any) => b.type === 'face_detected')

      if (hasHighRisk) {
        currentStatus.value = '🚨 检测到高风险作弊行为！'
      } else if (hasMediumRisk) {
        currentStatus.value = '⚠️ 检测到可疑行为'
      } else {
        noFaceDetected.value = result.data?.personNumber != 1;
        currentStatus.value = hasFace ? '✅ 监考正常' : '❓ 未检测到人脸'
      }
    } else {
      throw new Error(`HTTP ${response.status}`)
    }
  } catch (error) {
    console.error('监考分析失败:', error)
    currentStatus.value = `❌ 分析失败: ${(error as Error).message}`
    latestResult.value = null
    noFaceDetected.value = false
  }
}

// 开始自动监考（每1分钟）
async function startProctoring() {
  await startCamera()
  if (!mediaStream.value) return

  // ✅ 延迟1秒后再执行首次截图
  setTimeout(() => {
    takePhotoAndUpload()
  }, 1000)

  // 设置每60秒循环
  clearInterval(captureInterval.value!)
  captureInterval.value = window.setInterval(() => {
    takePhotoAndUpload()
  }, 60 * 1000)
}

// 计算异常行为
const abnormalBehaviors = computed(() => {
  return latestResult.value?.procterBehavior?.filter(
      (b: any) => b.type !== 'normal' && b.severity !== 'low'
  ) || []
})

const hasAbnormal = computed(() => abnormalBehaviors.value.length > 0)
const noFaceDetected = ref(false)

// 状态样式
const statusClass = computed(() => {
  if (currentStatus.value.includes('高风险')) return 'status-high'
  if (currentStatus.value.includes('可疑')) return 'status-medium'
  if (currentStatus.value.includes('✅')) return 'status-normal'
  return ''
})

// 时间格式化
function formatTime(timeStr: string) {
  if (!timeStr) return '未知时间'
  return new Date(timeStr).toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 隐藏确认
const toggleVisibility = () => {
  if (confirm('隐藏监考窗口可能导致考试无效，确定要隐藏吗？')) {
    isVisible.value = false
  }
}

// 生命周期
onMounted(async () => {
  await startProctoring()
})

onBeforeUnmount(() => {
  if (mediaStream.value) {
    mediaStream.value.getTracks().forEach(track => track.stop())
  }
  if (captureInterval.value) {
    clearInterval(captureInterval.value)
  }
})
</script>

<style scoped>
.camera-proctor-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.video-wrapper {
  position: relative;
  display: block;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
}

.status-overlay {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.status-high { background: rgba(220, 53, 69, 0.95); }
.status-medium { background: rgba(255, 193, 7, 0.95); color: #212529; }
.status-normal { background: rgba(40, 167, 69, 0.95); }

.hide-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  z-index: 10;
}
.hide-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.alert-panel {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.alert-panel h3 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 18px;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-item {
  padding: 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.severity-high {
  background: #f8d7da;
  border-left: 4px solid #dc3545;
}
.severity-medium {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.high { background: #dc3545; color: white; }
.medium { background: #ffc107; color: #212529; }

.normal-status {
  color: #28a745;
  font-weight: bold;
}

.debug-info {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
  text-align: center;
}
</style>