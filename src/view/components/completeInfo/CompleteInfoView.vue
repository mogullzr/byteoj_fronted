<template>
  <div class="page-container">
    <div class="card">
      <!-- 头部区域 -->
      <div class="card-header">
        <div class="icon-wrapper">
          <!-- 用户图标 -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
            <line x1="12" y1="17" x2="12" y2="17.01"></line>
          </svg>
        </div>
        <h1 class="title">完善账户信息(必填)</h1>
        <p class="desc">为了保障您的账户安全与后续服务使用，请补充以下必要信息</p>
      </div>

      <!-- 表单区域 -->
      <form @submit.prevent="handleSubmit" class="form-group">

        <!-- QQ 输入框 -->
        <div class="input-wrapper" :class="{ 'has-error': errors.qq }">
          <label class="input-label">QQ 号码</label>
          <div class="input-box">
            <span class="input-prefix">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            </span>
            <input
                type="text"
                v-model="formData.qq"
                placeholder="请输入您的qq邮箱(如:898561494@qq.com)"
                @input="errors.qq = ''"
            />
          </div>
          <span class="error-msg" v-if="errors.qq">{{ errors.qq }}</span>
        </div>

        <!-- 密码输入框 -->
        <div class="input-wrapper" :class="{ 'has-error': errors.password }">
          <label class="input-label">设置登录密码</label>
          <div class="input-box">
            <span class="input-prefix">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
            <input
                :type="showPassword ? 'text' : 'password'"
                v-model="formData.password"
                placeholder="长度 6-20 位，区分大小写"
                @input="errors.password = ''"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword" title="切换显示/隐藏">
              <span v-if="!showPassword"><svg t="1774505700988" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4783" width="32" height="32"><path d="M512 204.8C233.984 204.8 51.2 483.84 51.2 483.84S186.368 819.2 512 819.2s460.8-335.36 460.8-335.36S790.016 204.8 512 204.8z m0 502.272A200.192 200.192 0 0 1 307.2 512a200.192 200.192 0 0 1 204.8-195.072A200.192 200.192 0 0 1 716.8 512a200.192 200.192 0 0 1-204.8 195.072zM512 409.6a102.4 102.4 0 1 0 102.4 102.4 102.4 102.4 0 0 0-102.4-102.4z" fill="" p-id="4784"></path></svg></span>
              <span v-else><svg t="1774505734658" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5340" width="32" height="32"><path d="M705.8 331.7l199-230.6L863 64 653.4 306.7c-46.7-19.5-94.8-32.1-141.4-32.1-208.7 0-448 252.3-448 252.3s106 111.7 238.4 186.5L121.6 922.8l41.9 37.2 190.2-220.4c51.9 23.7 106 39.5 158.3 39.5 208.7 0 448-252.3 448-252.3S845.5 406.2 705.8 331.7zM344 526.9c0-92.9 75.3-168.2 168-168.2 28.7 0 55.7 7.2 79.4 19.9l-38 44c-12.8-5.1-26.7-7.9-41.3-7.9-61.8 0-112 50.3-112 112.1 0 20.4 5.5 39.5 15 56l-38 44C356.3 599 344 564.4 344 526.9z m168 168.2c-35.1 0-67.7-10.8-94.6-29.2l37-42.8c16.8 10.2 36.6 16 57.6 16 61.8 0 112-50.3 112-112.1 0-26.9-9.5-51.6-25.3-71l37-42.8C663.2 443 680 483 680 526.9c0 92.8-75.2 168.2-168 168.2z" fill="#47444F" p-id="5341"></path></svg></span>
            </button>
          </div>
          <span class="error-msg" v-if="errors.password">{{ errors.password }}</span>
        </div>

        <!-- 确认密码 -->
        <div class="input-wrapper" :class="{ 'has-error': errors.confirmPassword }">
          <label class="input-label">确认密码</label>
          <div class="input-box">
            <span class="input-prefix">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </span>
            <input
                :type="showPassword ? 'text' : 'password'"
                v-model="formData.confirmPassword"
                placeholder="请再次输入密码以确认"
                @input="errors.confirmPassword = ''"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword" title="切换显示/隐藏">
              <span v-if="!showPassword"><svg t="1774505700988" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4783" width="32" height="32"><path d="M512 204.8C233.984 204.8 51.2 483.84 51.2 483.84S186.368 819.2 512 819.2s460.8-335.36 460.8-335.36S790.016 204.8 512 204.8z m0 502.272A200.192 200.192 0 0 1 307.2 512a200.192 200.192 0 0 1 204.8-195.072A200.192 200.192 0 0 1 716.8 512a200.192 200.192 0 0 1-204.8 195.072zM512 409.6a102.4 102.4 0 1 0 102.4 102.4 102.4 102.4 0 0 0-102.4-102.4z" fill="" p-id="4784"></path></svg></span>
              <span v-else><svg t="1774505734658" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5340" width="32" height="32"><path d="M705.8 331.7l199-230.6L863 64 653.4 306.7c-46.7-19.5-94.8-32.1-141.4-32.1-208.7 0-448 252.3-448 252.3s106 111.7 238.4 186.5L121.6 922.8l41.9 37.2 190.2-220.4c51.9 23.7 106 39.5 158.3 39.5 208.7 0 448-252.3 448-252.3S845.5 406.2 705.8 331.7zM344 526.9c0-92.9 75.3-168.2 168-168.2 28.7 0 55.7 7.2 79.4 19.9l-38 44c-12.8-5.1-26.7-7.9-41.3-7.9-61.8 0-112 50.3-112 112.1 0 20.4 5.5 39.5 15 56l-38 44C356.3 599 344 564.4 344 526.9z m168 168.2c-35.1 0-67.7-10.8-94.6-29.2l37-42.8c16.8 10.2 36.6 16 57.6 16 61.8 0 112-50.3 112-112.1 0-26.9-9.5-51.6-25.3-71l37-42.8C663.2 443 680 483 680 526.9c0 92.8-75.2 168.2-168 168.2z" fill="#47444F" p-id="5341"></path></svg></span>
            </button>
          </div>
          <span class="error-msg" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
        </div>

        <!-- 提交按钮 -->
        <button type="submit" class="submit-btn" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span>{{ isLoading ? '正在保存信息...' : '确认并提交' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import userStore from '@/store/user';
import {UserControllerService} from "../../../../generated";
import {useMessageBox} from "@/view/components/alert/useMessageBox";
import user from "@/store/user";
// 请根据你的实际路径调整 API 导入

const router = useRouter();
const store = userStore();

const loginUser = store.loginUser;
// 状态定义
const isLoading = ref(false);
const showPassword = ref(false);
const errors = reactive<{ [key: string]: string }>({
  qq: '',
  password: '',
  confirmPassword: ''
});

const {success, error, warning} = useMessageBox();

const formData = reactive({
  qq: '',
  password: '',
  confirmPassword: ''
});


const validateForm = () => {
  let isValid = true;

  // 验证密码
  if (!formData.password) {
    errors.password = '密码不能为空';
    isValid = false;
  } else if (formData.password.length < 6 || formData.password.length > 20) {
    errors.password = '密码长度需在 6-20 位之间';
    isValid = false;
  } else {
    errors.password = '';
  }

  // 验证确认密码
  if (formData.confirmPassword !== formData.password) {
    errors.confirmPassword = '两次输入的密码不一致';
    isValid = false;
  } else {
    errors.confirmPassword = '';
  }

  return isValid;
};

// 提交处理
const handleSubmit = async () => {
  if (!validateForm()) return;

  isLoading.value = true;

  try {
    // 调用后端 API
    const res = await UserControllerService.userModifyUsingPost({
      uuid: loginUser.uuid,
      email: formData.qq,
      password: formData.password,
      confirm_password: formData.confirmPassword
    });

    if (res.code === 0) {
      success("信息完善完毕，即将跳转至首页......")
      await store.getLoginUser();
      // 跳转回首页
      setTimeout(() => {
        router.replace('/home');
      }, 2000);
    } else {
      error(res.message);
    }
  } catch (error: any) {
    error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
/* 变量定义 - 极简黑白灰风格 */
$primary-color: #2563eb; /* 稳重的蓝色 */
$primary-hover: #1d4ed8;
$error-color: #dc2626;
$text-main: #111827;
$text-sub: #6b7280;
$border-color: #d1d5db;
$bg-input: #ffffff;
$bg-page: #f9fafb; /* 极淡的灰色背景 */

.page-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  position: relative;
}


/* 卡片主体 - 加宽版 */
.card {
  position: relative;
  z-index: 1;
  background: #ffffff;
  padding: 48px 64px; /* 增加内边距 */
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 600px; /* 🔴 关键修改：从 420px 增加到 600px */
  border: 1px solid #e5e7eb;
}

.card-header {
  text-align: center;
  margin-bottom: 40px;

  .icon-wrapper {
    width: 56px;
    height: 56px;
    background: #eff6ff; /* 淡蓝色背景 */
    color: $primary-color;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;

    svg {
      width: 28px;
      height: 28px;
    }
  }

  .title {
    font-size: 26px;
    font-weight: 700;
    color: $text-main;
    margin: 0 0 10px;
    letter-spacing: -0.025em;
  }

  .desc {
    font-size: 15px;
    color: $text-sub;
    margin: 0;
    line-height: 1.6;
    max-width: 80%;
    margin-left: auto;
    margin-right: auto;
  }
}

/* 表单样式 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 24px; /* 增加表单项间距 */
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .input-label {
    font-size: 15px;
    font-weight: 600;
    color: $text-main;
    margin-left: 2px;
  }

  .input-box {
    position: relative;
    display: flex;
    align-items: center;
    background: $bg-input;
    border: 1.5px solid $border-color;
    border-radius: 8px;
    transition: all 0.2s ease;
    height: 52px; /* 固定高度，更整齐 */

    &:focus-within {
      border-color: $primary-color;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    &.has-error {
      border-color: $error-color;
      background: #fef2f2;

      &:focus-within {
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
      }
    }

    .input-prefix {
      padding-left: 16px;
      color: $text-sub;
      display: flex;
      align-items: center;

      svg {
        width: 20px;
        height: 20px;
      }
    }

    input {
      width: 100%;
      border: none;
      background: transparent;
      padding: 0 16px;
      font-size: 16px; /* 字体稍大，适配宽框 */
      color: $text-main;
      outline: none;
      height: 100%;

      &::placeholder {
        color: #9ca3af;
      }
    }

    .toggle-password {
      padding-right: 16px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 20px;
      opacity: 0.5;
      transition: opacity 0.2s;
      display: flex;
      align-items: center;

      &:hover {
        opacity: 1;
      }
    }
  }

  .error-msg {
    font-size: 13px;
    color: $error-color;
    margin-left: 2px;
    min-height: 18px;
    font-weight: 500;
  }
}

/* 提交按钮 */
.submit-btn {
  margin-top: 12px;
  width: 100%;
  height: 52px; /* 与输入框高度一致 */
  border: none;
  border-radius: 8px;
  background: $primary-color;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  &:hover:not(:disabled) {
    background: $primary-hover;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}

/* 加载 Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 底部提示 */
.footer-tip {
  margin-top: 32px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
  color: $text-sub;
  text-align: left;
  background: #f3f4f6;
  padding: 12px 16px;
  border-radius: 8px;
  line-height: 1.5;

  .tip-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: #6b7280;
    margin-top: 1px;
  }
}

/* 移动端适配 */
@media (max-width: 640px) {
  .card {
    padding: 32px 24px;
    max-width: 100%;
  }

  .card-header .desc {
    max-width: 100%;
  }
}
</style>