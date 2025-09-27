<script setup lang="ts">
import { onMounted, onUnmounted, ref, Ref } from "vue";
import dayjs from "dayjs";
import UserStore from "@/store/user";
import MarkdownEditorView from "@/view/Markdown/MarkdownView.vue";
import CourceView from "@/view/cources/CourceView.vue";
import CourseProblemsView from "@/view/cources/CourseProblemsView.vue";
import CourseRecordsView from "@/view/cources/CourseRecordsView.vue";
import router from "@/router";
import CourseRankView from "@/view/cources/CourseRankView.vue";
import {CourseControllerService, LantuPayControllerService} from "../../../generated";
import {LantuPayRequest, LantuPayOtherRequest} from "../../../../generated";
import { useMessageBox } from "@/view/components/alert/useMessageBox";

const useStore = UserStore();
const messageBox = useMessageBox();
const path = router.currentRoute.value.fullPath;
const course_id = ref(parseInt(path.toString().split("/")[2]));

const course: Ref<any> = ref({} as any);
const isJoined = ref(false);
const isCheckingStatus = ref(true); // 添加检查状态的加载状态
const showPayment = ref(false);
const paymentData = ref({
  weixin_url: "",
  out_trade_no: "",
  fund: ""
});
const isLoading = ref(false);
const paymentPollingTimer = ref<NodeJS.Timeout | null>(null);
const isQrCodeExpired = ref(false);
const isRefreshing = ref(false);

// 0表示显示前言，1表示显示试题，2表示大家的提交记录，3表示排名，4表示学习宝典
// 初始值将在获取报名状态后根据情况设置
const isShow = ref(0);

// 获取初始选中态
onMounted(async () => {
  try {
  const res = await CourseControllerService.courseSearchByCourseIdUsingPost(
    course_id.value
  );
  if (res.code === 0) {
    course.value = res.data;
  }

  // 判断是否报名
  const isJoin = await CourseControllerService.courseSearchProblemsByCourseIdUsingPost(course_id.value);

    if (isJoin.code == 40101) {
      // 用户未报名，需要显示报名按钮，默认显示前言
      isJoined.value = false;
      // 检查是否有本地存储的状态，如果没有则默认显示前言(0)
      const local = localStorage.getItem("study-" + course_id.value + "-status");
      isShow.value = local ? parseInt(local) : 0;
  } else {
      // 用户已报名，显示正常的用户信息，默认显示试题
      isJoined.value = true;
      // 检查是否有本地存储的状态，如果没有则默认显示试题(1)
      const local = localStorage.getItem("study-" + course_id.value + "-status");
      isShow.value = local ? parseInt(local) : 1;
    }
    
    // 设置选中态
    let element: any = document.getElementById(isShow.value.toString());
    if (element !== null) {
      element.checked = true;
    }
  } catch (error) {
    console.error("获取课程状态失败:", error);
    // 发生错误时默认显示报名按钮，让用户可以尝试操作
    isJoined.value = false;
    messageBox.error("获取课程状态失败，请刷新页面重试");
  } finally {
    // 无论成功失败都要结束加载状态
    isCheckingStatus.value = false;
  }
  
  // 添加键盘事件监听器
  document.addEventListener('keydown', handleKeydown);
});

// 组件卸载时移除事件监听器和清理定时器
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  if (paymentPollingTimer.value) {
    clearInterval(paymentPollingTimer.value);
    paymentPollingTimer.value = null;
  }
});

// 处理课程报名支付
const handleCoursePayment = async () => {
  try {
    isLoading.value = true;
    const lantuPayRequest: LantuPayRequest = {
      course_id: course_id.value
    };
    
    const res = await LantuPayControllerService.lantuPayUsingPost(lantuPayRequest);
    
    if (res.code === 0 && res.data) {
      paymentData.value = {
        weixin_url: res.data.weixin_url || "",
        out_trade_no: res.data.out_trade_no || "",
        fund: res.data.fund || ""
      };
      showPayment.value = true;
      
      // 开始轮询支付状态
      startPaymentPolling(res.data.out_trade_no);
    } else {
      messageBox.error("支付订单创建失败，请稍后重试");
    }
  } catch (error) {
    console.error("支付请求失败:", error);
    messageBox.error("支付请求失败，请检查网络连接");
  } finally {

    isLoading.value = false;
  }
};

// 开始支付状态轮询
const startPaymentPolling = (outTradeNo: string) => {
  // 清除之前的轮询
  if (paymentPollingTimer.value) {
    clearInterval(paymentPollingTimer.value);
    paymentPollingTimer.value = null;
  }
  
  // 重置过期状态
  isQrCodeExpired.value = false;
  
  let pollCount = 0;
  const maxPolls = 90; // 3分钟 = 180秒，每2秒一次 = 90次
  
  console.log(`开始支付状态轮询，订单号: ${outTradeNo}，最大轮询次数: ${maxPolls}`);
  
  paymentPollingTimer.value = setInterval(async () => {
    pollCount++;
    console.log(`第${pollCount}次轮询支付状态，剩余${maxPolls - pollCount}次`);
    
    try {
      const lantuPayOtherRequest: LantuPayOtherRequest = {
        out_trade_no: outTradeNo
      };
      
      const statusRes = await LantuPayControllerService.lantuPayStatusUsingPost(lantuPayOtherRequest);
      
      if (statusRes.code === 0 && statusRes.data === true) {
        // 支付成功
        console.log("检测到支付成功，停止轮询");
        clearInterval(paymentPollingTimer.value!);
        paymentPollingTimer.value = null;
        messageBox.success("支付成功！正在刷新页面...");
        
        // 延迟1秒后刷新页面
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      }
      
      // 检查是否超时
      if (pollCount >= maxPolls) {
        console.log("支付状态轮询达到最大次数，停止轮询");
        clearInterval(paymentPollingTimer.value!);
        paymentPollingTimer.value = null;
        isQrCodeExpired.value = true; // 设置二维码过期状态
        console.log("二维码已设置为过期状态");
        return; // 重要：退出当前轮询循环
      }
    } catch (error) {
      console.error(`第${pollCount}次支付状态查询失败:`, error);
      // 继续轮询，不中断
      
      // 如果连续失败次数过多，也要考虑停止轮询
      if (pollCount >= maxPolls) {
        console.log("轮询次数已达上限，即使有错误也要停止");
        clearInterval(paymentPollingTimer.value!);
        paymentPollingTimer.value = null;
        isQrCodeExpired.value = true;
        return;
      }
    }
  }, 2000); // 每2秒轮询一次
};

// 停止支付轮询
const stopPaymentPolling = () => {
  if (paymentPollingTimer.value) {
    console.log("手动停止支付轮询");
    clearInterval(paymentPollingTimer.value);
    paymentPollingTimer.value = null;
  } else {
    console.log("没有活跃的支付轮询需要停止");
  }
};

// 关闭支付页面
const closePayment = () => {
  stopPaymentPolling(); // 停止轮询
  showPayment.value = false;
  isQrCodeExpired.value = false; // 重置二维码过期状态
  paymentData.value = {
    weixin_url: "",
    out_trade_no: "",
    fund: ""
  };
};

// 复制订单号
const copyOrderNumber = async () => {
  try {
    await navigator.clipboard.writeText(paymentData.value.out_trade_no);
    messageBox.success("订单号已复制到剪贴板");
  } catch (error) {
    // 降级方案：使用传统的复制方法
    const textArea = document.createElement("textarea");
    textArea.value = paymentData.value.out_trade_no;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    messageBox.success("订单号已复制到剪贴板");
  }
};

// 刷新二维码和订单号
const refreshPaymentCode = async () => {
  try {
    isRefreshing.value = true;
    
    // 停止当前轮询
    stopPaymentPolling();
    
    // 重新请求支付订单
    const lantuPayRequest: LantuPayRequest = {
      course_id: course_id.value
    };
    
    const res = await LantuPayControllerService.lantuPayUsingPost(lantuPayRequest);
    
    if (res.code === 0 && res.data) {
      // 更新支付数据
      paymentData.value = {
        weixin_url: res.data.weixin_url || "",
        out_trade_no: res.data.out_trade_no || "",
        fund: res.data.fund || ""
      };
      
      // 重置过期状态
      isQrCodeExpired.value = false;
      
      // 开始新的轮询
      startPaymentPolling(res.data.out_trade_no);
      
      messageBox.success("二维码已刷新，请重新扫码支付");
    } else {
      messageBox.error("刷新二维码失败，请稍后重试");
    }
  } catch (error) {
    console.error("刷新二维码失败:", error);
    messageBox.error("刷新二维码失败，请检查网络连接");
  } finally {
    isRefreshing.value = false;
  }
};

// 检查支付状态（刷新页面重新检查报名状态）
const checkPaymentStatus = () => {
  closePayment();
  // 刷新页面重新检查用户的报名状态
  window.location.reload();
};

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showPayment.value) {
    closePayment();
  }
};

// 修改展示页面
const changeShow = (key: number) => {
  isShow.value = key;
  localStorage.setItem("study-" + course_id.value + "-status", key.toString());
  let element: any = document.getElementById(isShow.value.toString());
  if (element) {
    element.checked = true;
  }
};
</script>

<template>
  <div class="card bg-base-100 shadow-xl mx-auto" style="width: 1150px">
    <div class="flex p-4 w-full">
      <div
        class="text-sky-500 link link-hover hover:text-sky-400 text-2xl flex-1 float-left my-auto"
      >
        <button>
          {{ course.course_title }}
        </button>
      </div>
      <router-link
        class="btn font-bold text-lg hover:bg-blue-500 hover:text-white"
        to="/study"
      >
        返回学习计划专栏
      </router-link>
    </div>
    <div class="flex p-4 w-full text-gray-500 text-xl">
      <div class="flex-1">
        <span>参加人数 : {{ course.num }}</span>
        <span class="pl-4">参加时间：</span>
        <span v-if="course.start_time != null && course.start_time != ''">{{
          dayjs(course.start_time).format("YYYY-MM-DD")
        }}</span>
        <span v-if="course.start_time != null && course.start_time != ''"
          >~</span
        >
        <span v-if="course.end_time != null && course.end_time != ''">{{
          dayjs(course.end_time).format("YYYY-MM-DD")
        }}</span>
        <span v-else>永久</span>
      </div>
      <!-- 状态检查中显示加载状态 -->
      <div v-if="isCheckingStatus" class="flex items-center">
        <div class="status-loading">
          <div class="loading-spinner"></div>
          <span class="loading-text">加载中...</span>
        </div>
      </div>
      
      <!-- 已报名用户显示用户信息 -->
      <div v-else-if="isJoined" class="card bg-base-100 shadow-2xl">
        <div class="card-body flex py-0">
          <div class="avatar">
            <div
              class="bg-neutral text-neutral-content w-12 rounded-full mx-auto"
            >
              <router-link :to="'/user/space/' + useStore.loginUser.uuid">
                <img :src="useStore.loginUser.avatar" alt="ByteOJ出品" />
              </router-link>
            </div>
          </div>
          <router-link
            class="link link-hover text-sky-500 hover:text-sky-600 active:text-sky-700 px-2 text-sm"
            :to="'/user/space/' + useStore.loginUser.uuid"
            >{{ useStore.loginUser.username }}</router-link
          >
          <button
            @click="changeShow(3)"
            class="link link-hover text-sky-500 hover:text-sky-600 active:text-sky-700 px-2 text-sm"
          >
            {{ course.rank_num }} / {{ course.course_num }}
          </button>
        </div>
      </div>
      
      <!-- 未报名用户显示报名按钮 -->
      <div v-else class="register-section">
        <div class="qq-tip-highlighted">
          <div class="tip-content">
            <span class="tip-icon">💡</span>
            <span class="tip-text">豫章数计的同学请联系QQ</span>
          </div>
          <div class="qq-contact-highlight">
            <strong>898561494@qq.com</strong>
          </div>
        </div>
        <button 
          @click="handleCoursePayment"
          :disabled="isLoading"
          class="custom-register-btn"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          <span class="btn-text">{{ isLoading ? '处理中...' : '立即报名' }}</span>
        </button>
      </div>
    </div>
    <div role="tablist" class="tabs tabs-lifted tabs-lg">
      <input
        id="0"
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="'tab ' + (isShow == 0 ? '' : 'text-sky-500')"
        aria-label="前言"
        style="white-space: nowrap"
        @click="changeShow(0)"
      />
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box p-6"
        v-if="isShow === 0"
        style="word-wrap: break-word"
      >
        <MarkdownEditorView :generateData="course.course_title_description" />
      </div>
      <input
        id="1"
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="'tab ' + (isShow == 1 ? '' : 'text-sky-500')"
        aria-label="试题"
        style="white-space: nowrap"
        @click="changeShow(1)"
      />
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box p-6"
        style="word-wrap: break-word"
        v-if="isShow === 1"
      >
        <CourseProblemsView />
      </div>
      <input
        id="2"
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="'tab ' + (isShow == 2 ? '' : 'text-sky-500')"
        aria-label="提交记录"
        style="white-space: nowrap"
        @click="changeShow(2)"
      />
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box p-6"
        v-if="isShow === 2"
        style="word-wrap: break-word"
      >
        <CourseRecordsView />
      </div>
      <input
        id="3"
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="'tab ' + (isShow == 3 ? '' : 'text-sky-500')"
        aria-label="排名"
        style="white-space: nowrap"
        @click="changeShow(3)"
      />
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box p-6"
        v-if="isShow === 3"
        style="word-wrap: break-word"
      >
        <CourseRankView />
      </div>
      <input
        id="4"
        type="radio"
        name="my_tabs_2"
        role="tab"
        :class="'tab ' + (isShow == 4 ? '' : 'text-sky-500')"
        aria-label="学习宝典"
        style="white-space: nowrap"
        @click="changeShow(4)"
      />
      <div
        role="tabpanel"
        class="tab-content bg-base-100 border-base-300 rounded-box p-6"
        v-if="isShow === 4"
        style="word-wrap: break-word"
      >      </div>
    </div>
  </div>

  <!-- 支付页面模态框 -->
  <div v-if="showPayment" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div class="payment-modal">
      <!-- 标题栏 -->
      <div class="payment-header">
        <h2 class="payment-title">课程报名支付</h2>
        <button @click="closePayment" class="payment-close">✕</button>
      </div>

      <!-- 课程信息 -->
      <div class="course-info">
        <h3 class="course-title">{{ course.course_title }}</h3>
        <div class="course-details">
          <span>👥 {{ course.num }}人</span>
          <span v-if="course.start_time">📅 {{ dayjs(course.start_time).format("MM-DD") }}</span>
          <span v-if="paymentData.fund" class="course-price">💰 ¥{{ paymentData.fund }}</span>
        </div>
      </div>

      <!-- 支付二维码 - 更大更显眼 -->
      <div class="qr-section">
        <div class="qr-container">
          <div class="qr-wrapper" :class="{ 'qr-expired': isQrCodeExpired }">
            <img 
              v-if="paymentData.weixin_url" 
              :src="paymentData.weixin_url" 
              alt="微信支付二维码" 
              class="qr-image"
            />
            <div v-else class="qr-loading">
              <div class="loading-spinner"></div>
              <span>二维码生成中...</span>
            </div>
            <!-- 过期提示 -->
            <div v-if="isQrCodeExpired" class="qr-expired-overlay">
              <div class="expired-content">
                <span class="expired-icon">⏰</span>
                <span class="expired-text">二维码已过期</span>
                <span class="expired-subtitle">请重新生成支付码</span>
              </div>
            </div>
          </div>
        </div>
        <div class="wechat-tip">
          <span class="wechat-icon">💬</span>
          <span>使用微信扫码支付</span>
        </div>
        <div v-if="paymentData.fund" class="payment-amount">
          支付金额：<span class="amount-value">¥{{ paymentData.fund }}</span>
        </div>
        
        <!-- 刷新按钮 -->
        <div class="refresh-section">
          <button 
            @click="refreshPaymentCode"
            :disabled="isRefreshing"
            class="refresh-btn"
            :class="{ 'refresh-btn-expired': isQrCodeExpired }"
          >
            <span v-if="isRefreshing" class="refresh-spinner"></span>
            <span v-else class="refresh-icon">🔄</span>
            <span class="refresh-text">
              {{ isRefreshing ? '刷新中...' : (isQrCodeExpired ? '重新生成' : '刷新二维码') }}
            </span>
          </button>
        </div>
      </div>

      <!-- 订单信息 - 更紧凑 -->
      <div class="order-info">
        <span class="order-label">订单号</span>
        <div class="order-number">
          <span>{{ paymentData.out_trade_no }}</span>
          <button @click="copyOrderNumber" class="copy-btn" title="复制">📋</button>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="payment-actions">
        <button @click="closePayment" class="cancel-btn">取消</button>
        <button @click="checkPaymentStatus" class="confirm-btn">已完成支付</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 注册区域样式 */
.register-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

/* 突出显示的QQ联系提示 */
.qq-tip-highlighted {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  animation: highlightPulse 2s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

.qq-tip-highlighted::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -100%;
  width: 100%;
  height: calc(100% + 4px);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes highlightPulse {
  0%, 100% { 
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  }
  50% { 
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  }
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.tip-content {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.tip-text {
  font-size: 14px;
  color: #92400e;
  font-weight: 500;
}

.qq-contact-highlight {
  text-align: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  padding: 4px 8px;
  border: 1px solid #fed7aa;
}

.qq-contact-highlight strong {
  color: #1e40af;
  font-family: monospace;
  font-size: 13px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(30, 64, 175, 0.1);
}

.tip-icon {
  font-size: 14px;
  color: #f59e0b;
}

.qq-tip strong {
  color: #1e40af;
  font-family: monospace;
}

/* 自定义报名按钮样式 - 淡雅风格 */
.custom-register-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.custom-register-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #334155;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.custom-register-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.custom-register-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #94a3b8;
}

.custom-register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.4s;
}

.custom-register-btn:hover:not(:disabled)::before {
  left: 100%;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-icon {
  position: relative;
  z-index: 1;
  font-size: 16px;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(148, 163, 184, 0.3);
  border-top: 2px solid #64748b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 状态检查加载样式 */
.status-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
}

.loading-text {
  font-size: 14px;
  color: #64748b;
}

/* 支付模态框样式 */
.payment-modal {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.payment-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.payment-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
}

.payment-close:hover {
  background: #f5f5f5;
  color: #333;
}

.course-info {
  background: #f8f9ff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 6px 0;
}

.course-details {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
}

.course-price {
  color: #dc2626 !important;
  font-weight: 600 !important;
  background: #fef2f2;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #fecaca;
}

/* 二维码区域 - 更大更显眼 */
.qr-section {
  text-align: center;
  margin-bottom: 20px;
}

.qr-container {
  background: white;
  border: 3px solid #e8f4fd;
  border-radius: 12px;
  padding: 16px;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.qr-wrapper {
  position: relative;
  transition: all 0.3s ease;
}

.qr-wrapper.qr-expired {
  filter: blur(3px);
  opacity: 0.6;
}

.qr-image {
  width: 280px;
  height: 280px;
  border-radius: 8px;
}

.qr-loading {
  width: 280px;
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
  font-size: 14px;
}

/* 二维码过期遮罩 */
.qr-expired-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  z-index: 10;
}

.expired-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: white;
  text-align: center;
}

.expired-icon {
  font-size: 32px;
  animation: pulse 2s ease-in-out infinite;
}

.expired-text {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.expired-subtitle {
  font-size: 14px;
  color: #fbbf24;
  font-weight: 500;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* 刷新按钮区域 */
.refresh-section {
  margin: 16px 0 8px 0;
  text-align: center;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.refresh-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.refresh-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 过期时的刷新按钮样式 */
.refresh-btn-expired {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
  border-color: #fca5a5 !important;
  color: #dc2626 !important;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2) !important;
  animation: refreshPulse 2s ease-in-out infinite;
}

.refresh-btn-expired:hover:not(:disabled) {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%) !important;
  border-color: #f87171 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3) !important;
}

@keyframes refreshPulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.2);
  }
  50% {
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
  }
}

.refresh-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.refresh-btn:hover .refresh-icon {
  transform: rotate(180deg);
}

.refresh-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(71, 85, 105, 0.3);
  border-top: 2px solid #475569;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.refresh-text {
  font-weight: 500;
}

.wechat-tip {
  margin: 12px 0 8px 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.wechat-icon {
  font-size: 16px;
  color: #07c160;
}

.payment-amount {
  margin: 12px 0 16px 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
  text-align: center;
}

.amount-value {
  color: #dc2626;
  font-weight: 800;
  font-size: 28px;
  text-shadow: 0 1px 3px rgba(220, 38, 38, 0.3);
}

/* 联系信息样式 */
.contact-info {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  text-align: center;
}

.contact-tip {
  font-size: 13px;
  color: #92400e;
  font-weight: 600;
  margin-bottom: 6px;
}

.qq-contact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 4px;
}

.qq-icon {
  font-size: 16px;
}

.qq-number {
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  font-family: monospace;
  background: rgba(255, 255, 255, 0.7);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #dbeafe;
}

/* 订单信息 - 更紧凑 */
.order-info {
  background: #f0f8ff;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 15px;
}

.order-label {
  color: #666;
  font-weight: 500;
  font-size: 15px;
}

.order-number {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: monospace;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.copy-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background 0.2s;
  font-size: 16px;
}

.copy-btn:hover {
  background: rgba(0, 0, 0, 0.08);
}

/* 操作按钮 */
.payment-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 8px 20px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e8e8e8;
  border-color: #ccc;
}

.confirm-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(79, 172, 254, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}
</style>
