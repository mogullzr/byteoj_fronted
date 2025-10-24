<template>
  <div class="user-profile">
    <!-- 头像和用户名 -->
    <div class="profile-header">
      <img :src="avatarUrl" alt="ByteOJ出品" class="avatar" />
      <div class="username">{{ username }}</div>
    </div>

    <!-- 等级和学校 -->
    <div class="profile-info">
      <div class="info-item">
        <span class="icon">🏫</span>
        <span class="label">学府</span>
        <span class="value">{{ school }}</span>
      </div>
      <div class="info-item">
        <span class="icon">📚</span>
        <span class="label">Rating</span>
        <span class="value">{{ level }}</span>
      </div>
    </div>

    <!-- 个人简介 -->
    <div class="bio">
      <span class="icon">📖</span>
      <span style="font-weight: bold">个人简介</span>
      <p>{{ bio }}</p>
    </div>

    <!-- 常用算法标签 -->
    <div>
      <span class="icon">📚</span>
      <span style="font-weight: bold">个人标签</span>
    </div>
    <div class="tags">
      <span v-for="(tag, index) in tags" :key="index" class="tag">{{
        tag
      }}</span>
    </div>

    <!-- 个人网站链接 -->
    <a :href="website" target="_blank" class="website">
      <span>探索{{ username }}的个人网站</span>
      <span class="icon font-bold">→</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

// 定义 props
const props = defineProps({
  avatarUrl: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  school: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  website: {
    type: String,
    required: true,
  },
  tags: {
    type: Array as () => string[],
    required: true,
  },
});

</script>

<style scoped>
.user-profile {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 400px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  margin-right: 16px;
  object-fit: cover; /* 解决图片变形问题 */
}

.username {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.profile-info {
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 1rem;
  color: #666;
}

.info-item .icon {
  margin-right: 8px;
}

.info-item .label {
  font-weight: bold;
}

.bio {
  font-size: 1rem;
  color: #444;
  margin-bottom: 20px;
  line-height: 1.6;
}

.bio .icon {
  margin-right: 8px;
}

.bio .label {
  font-weight: bold;
  margin-right: 8px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  background-color: #f0f0f0;
  color: #333;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.website {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-decoration: none;
  color: #007bff;
  font-size: 1rem;
  padding: 12px;
  border: 1px solid #007bff;
  border-radius: 6px;
  transition: background-color 0.2s, color 0.2s;
}

.website:hover {
  background-color: #007bff;
  color: white;
}

.icon {
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
