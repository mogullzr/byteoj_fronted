<template>
  <div :class="['notification', type]" ref="notification">
    <span class="icon">{{ getIcon(type) }}</span>
    <div class="content">{{ message }}</div>
    <span class="close" @click="close">&times;</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "info",
  },
  message: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    default: 3000,
  },
});

const emit = defineEmits(["close"]);
const notification = ref(null);

const getIcon = (type) => {
  switch (type) {
    case "success":
      return "√";
    case "error":
      return "X"; // 使用警告符号
    case "info":
      return "ℹ";
    case "warning":
      return "⚠";
    default:
      return "ℹ";
  }
};

const close = () => {
  notification.value.style.animation = "slideOut 0.3s ease-in forwards";
  setTimeout(() => emit("close"), 300);
};

onMounted(() => {
  setTimeout(() => close(), props.duration);
});
</script>

<style scoped>
.notification {
  width: 300px;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  position: relative;
  animation: slideIn 0.3s;
  border: 1px solid #e4e7ed;
  font-weight: bold;
}

.notification.success {
  border-left: 4px solid #67c23a;
  background-color: #f0f9eb;
}

.notification.error {
  border-left: 4px solid #f56c6c;
  background-color: #fef0f0;
}

.notification.info {
  border-left: 4px solid #409eff;
  background-color: #ecf5ff;
}

.notification.warning {
  border-left: 4px solid #e6a23c;
  background-color: #fdf6ec;
}

.notification .icon {
  margin-right: 10px;
  font-size: 20px;
  color: #606266;
  font-weight: bold;
}

.notification.error .icon {
  color: #f56c6c; /* 红色警告符号 */
}

.notification.success .icon {
  color: #67c23a; /* 红色警告符号 */
}

.notification.warning .icon {
  color: #e6a23c; /* 红色警告符号 */
}
.notification .content {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.notification .close {
  position: absolute;
  animation: slideOut 0.3s;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 16px;
  color: #c0c4cc;
}

.notification .close:hover {
  color: #909399;
  animation: slideOut 0.3s;
}
@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
