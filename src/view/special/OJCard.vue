Vue
<template>
  <div class="oj-card">
    <div class="oj-card__image">
      <img :src="image" alt="Contest Image" />
      <!-- 徽章标签 -->
      <div class="oj-card__status-badge" :class="getStatusBadgeClass">
        {{ getStatusBadgeText }}
      </div>
    </div>
    <div class="oj-card__content">
      <div class="oj-card__header">
        <span
          class="oj-card__platform-badge"
          :style="{ backgroundColor: platformColor }"
        >
          {{ platform }}
        </span>
        <span
          class="oj-card__format-badge"
          :style="{ backgroundColor: formatColor }"
        >
          {{ format }}
        </span>
      </div>
      <div class="oj-card__body">
        <h2 class="oj-card__title">{{ title }}</h2>
        <div class="oj-card__info">
          <span class="oj-card__label">开始时间:</span>
          <span class="oj-card__value">{{ startTime }}</span>
        </div>
        <div class="oj-card__info">
          <span class="oj-card__label">结束时间:</span>
          <span class="oj-card__value">{{ endTime }}</span>
        </div>
        <div class="oj-card__info">
          <span class="oj-card__label">比赛时长:</span>
          <span class="oj-card__value">{{
            formatDuration(startTime, endTime)
          }}</span>
        </div>
        <!-- 新增：显示剩余时间 -->
        <div
          class="oj-card__info oj-card__info--highlight"
          v-if="timeRemaining"
        >
          <span class="oj-card__label">剩余时间:</span>
          <span class="oj-card__value">{{ timeRemaining }}</span>
        </div>
      </div>
      <div class="oj-card__footer">
        <a :href="link" class="oj-card__link" target="_blank">查看详情</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onUnmounted } from "vue";
import dayjs from "dayjs";

export default defineComponent({
  name: "OJCard",
  props: {
    platform: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  methods: {
    /**
     * 计算并格式化时间差
     * @param {string} startTime - 开始时间 (ISO 格式)
     * @param {string} endTime - 结束时间 (ISO 格式)
     * @returns {string} - 格式化后的时间差 (例如 "2小时30分钟")
     */
    formatDuration: function (startTime: any, endTime: any) {
      const duration = dayjs(endTime).diff(dayjs(startTime), "minute");
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return (
        `${hours ? `${hours}小时` : ""}${
          minutes ? `${minutes}分钟` : ""
        }`.trim() || "0分钟"
      );
    },
  },
  setup(props) {
    // 平台颜色映射
    const platformColors: Record<string, string> = {
      蓝桥杯: "#007bff",
      Codeforces: "#dc3545",
      LeetCode: "#007bff",
      牛客: "#ffc107",
      acwing: "#28a745",
      jisaunke: "#17a2b8",
      CodeChef: "#6610f2",
    };

    // 赛制颜色映射
    const formatColors: Record<string, string> = {
      OI: "#6c757d",
      IOI: "#20c997",
      ACM: "#fd7e14",
    };

    const platformColor = computed(
      () => platformColors[props.platform] || "#007bff"
    );
    const formatColor = computed(() => formatColors[props.format] || "#6c757d");

    // 判断竞赛状态
    const getStatus = computed(() => {
      const now = dayjs();
      const start = dayjs(props.startTime);
      const end = dayjs(props.endTime);

      if (now.isBefore(start)) {
        return "未开始";
      } else if (now.isAfter(end)) {
        return "已结束";
      } else {
        return "进行中";
      }
    });

    // 徽章文本
    const getStatusBadgeText = computed(() => getStatus.value);

    // 徽章样式类
    const getStatusBadgeClass = computed(() => {
      switch (getStatus.value) {
        case "未开始":
          return "oj-card__status-badge--not-started";
        case "进行中":
          return "oj-card__status-badge--ongoing";
        case "已结束":
          return "oj-card__status-badge--ended";
        default:
          return "";
      }
    });

    // 计算剩余时间
    const timeRemaining = ref("");
    const updateTimeRemaining = () => {
      const now = dayjs();
      const start = dayjs(props.startTime);
      const end = dayjs(props.endTime);

      let targetTime;
      if (now.isBefore(start)) {
        targetTime = start;
      } else if (now.isBefore(end)) {
        targetTime = end;
      } else {
        timeRemaining.value = ""; // 比赛已结束
        return;
      }

      const diff = targetTime.diff(now, "second");
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      const parts = [];
      if (days > 0) parts.push(`${days}天`);
      if (hours > 0) parts.push(`${hours}小时`);
      if (minutes > 0) parts.push(`${minutes}分钟`);
      if (seconds > 0) parts.push(`${seconds}秒`);

      timeRemaining.value = parts.join("") || "0秒";
    };

    // 每秒更新一次剩余时间
    const timer = setInterval(updateTimeRemaining, 1000);
    onUnmounted(() => clearInterval(timer));

    // 初始化剩余时间
    updateTimeRemaining();

    return {
      platformColor,
      formatColor,
      getStatusBadgeText,
      getStatusBadgeClass,
      timeRemaining,
    };
  },
});
</script>

<style scoped>
/* 新增：突出显示剩余时间 */
.oj-card__info--highlight {
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  font-weight: bold;
  color: #dc3545; /* 红色突出显示 */
}

.oj-card__info--highlight .oj-card__label {
  color: #333;
}

.oj-card__info--highlight .oj-card__value {
  color: #dc3545;
}
.oj-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  transition: box-shadow 0.3s ease;
}

.oj-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.oj-card__image {
  position: relative;
  width: 100%;
  height: 180px; /* 固定高度 */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #f5f5f5;
}

.oj-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 徽章标签 */
.oj-card__status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 未开始徽章 */
.oj-card__status-badge--not-started {
  background-color: #dc3545; /* 红色 */
}

/* 进行中徽章 */
.oj-card__status-badge--ongoing {
  background-color: #28a745; /* 绿色 */
}

/* 已结束徽章 */
.oj-card__status-badge--ended {
  background-color: #6c757d; /* 灰色 */
}

.oj-card__content {
  padding: 16px;
}

.oj-card__header {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.oj-card__platform-badge,
.oj-card__format-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.oj-card__title {
  margin: 0 0 16px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.oj-card__body {
  margin-bottom: 16px;
}

.oj-card__info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9375rem;
}

.oj-card__label {
  color: #555555;
  font-weight: 500;
}

.oj-card__value {
  color: #333333;
}

.oj-card__footer {
  text-align: right;
}

.oj-card__link {
  text-decoration: none;
  color: #007bff;
  font-size: 0.875rem;
  font-weight: 500;
}

.oj-card__link:hover {
  text-decoration: underline;
}
</style>
