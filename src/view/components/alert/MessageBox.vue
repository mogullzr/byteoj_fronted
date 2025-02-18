<template>
  <transition name="fade">
    <div v-if="visible" :class="['notification-box', type]">
      <div class="notification-body">
        <span class="notification-icon">
          <i v-if="type === 'success'" class="icon-success">√</i>
          <i v-if="type === 'error'" class="icon-error">×</i>
          <i v-if="type === 'warning'" class="icon-warning">!</i>
        </span>
        <div class="notification-text">
          <strong>{{ typeName }}</strong>
        </div>
        <span class="notification-close" @click="visible = false">×</span>
      </div>
      <div>
        <span class="ml-4 text-sm text-gray-500 font-bold">{{ message }}</span>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

export default defineComponent({
  name: 'NotificationBox',
  props: {
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String as () => 'success' | 'error' | 'warning',
      default: 'success',
    },
    duration: {
      type: Number,
      default: 4500,
    },
  },
  setup(props) {
    const visible = ref(true);

    // 计算提示类型名称
    const typeName = computed(() => {
      switch (props.type) {
        case 'success':
          return 'Success';
        case 'error':
          return 'Error';
        case 'warning':
          return 'Warning';
        default:
          return '';
      }
    });

    // 自动消失
    setTimeout(() => {
      visible.value = false;
    }, props.duration);

    return {
      visible,
      typeName,
    };
  },
});
</script>

<style scoped>
.notification-box {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 360px;
  padding: 20px;
  border-radius: 12px; /* 圆润边角 */
  background-color: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2); /* 更强的阴影效果 */
  z-index: 9999;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.notification-body {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 图标与文本分开 */
}

.notification-icon {
  margin-right: 15px; /* 增大图标与文本之间的间距 */
  font-size: 28px; /* 增大图标尺寸 */
  font-weight: bold;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2); /* 增强加粗效果 */
}

.icon-success {
  color: #52c41a;
}

.icon-error {
  color: #f56c6c;
}

.icon-warning {
  color: #faad14;
}

.notification-text {
  color: #303133;
  font-size: 15px; /* 调整字体大小 */
  flex-grow: 1; /* 使文本区域占据剩余空间 */
  display: flex;
  align-items: center;
}

.notification-text strong {
  font-weight: bold;
  margin-right: 8px; /* 加强 Success/Error 标签的间距 */
}

.notification-close {
  cursor: pointer;
  font-size: 20px;
  color: #909399;
  transition: color 0.2s;
}

.notification-close:hover {
  color: #606266;
}

.success {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
}

.error {
  background-color: #fff2f0;
  border: 1px solid #ffa39e;
}

.warning {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 0.3s ease-in-out;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
