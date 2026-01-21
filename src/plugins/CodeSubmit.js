// ============================================
// 你的前端代码 - 优化版本
// 主要改动：复用 WebSocket 连接，支持快速连续提交
// ============================================

import { Client } from '@stomp/stompjs';  // 使用 Client 类（新 API）
import SockJS from 'sockjs-client';
import { useRoute } from "vue-router";
import { ref, onUnmounted } from 'vue';  // 添加 ref 和 onUnmounted

// ============================================
// WebSocket 全局状态（改为 ref）
// ============================================
const route = useRoute();

const stompClient = ref(null);           // WS 客户端
const isConnected = ref(false);          // 连接状态
const subscriptions = ref(new Map());    // 存储所有订阅

// ============================================
// WebSocket 连接管理（新增）
// ============================================

/**
 * 初始化 WebSocket 连接（全局只连接一次）
 */
const initWebSocketConnection = () => {
    // 如果已经连接，直接返回
    if (isConnected.value && stompClient.value) {
        console.log('[WebSocket] 已连接，复用现有连接');
        return Promise.resolve();
    }

    // 如果正在连接中，等待连接完成
    if (stompClient.value && !isConnected.value) {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (isConnected.value) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    console.log('[WebSocket] 开始建立连接...');

    return new Promise((resolve, reject) => {
        try {
            const client = new Client({
                // WebSocket 工厂
                // webSocketFactory: () => new SockJS('http://localhost:7091/api/ws/judge'),
                webSocketFactory: () => new SockJS('https://www.byteoj.com/api/ws/judge'),

                // 心跳配置
                heartbeatIncoming: 20000,
                heartbeatOutgoing: 20000,

                // 自动重连
                reconnectDelay: 3000,

                // 调试日志（生产环境可关闭）
                debug: (str) => {
                    // console.log('[STOMP]', str);
                },

                // 连接成功
                onConnect: (frame) => {
                    console.log('[WebSocket] ✅ 连接成功');
                    isConnected.value = true;
                    resolve();
                },

                // STOMP 错误
                onStompError: (frame) => {
                    console.error('[WebSocket] ❌ STOMP 错误:', frame);
                    isConnected.value = false;
                    reject(new Error('STOMP 连接失败'));
                },

                // WebSocket 错误
                onWebSocketError: (event) => {
                    console.error('[WebSocket] ❌ 连接错误:', event);
                    isConnected.value = false;
                    reject(new Error('WebSocket 连接失败'));
                },

                // 断开连接
                onDisconnect: () => {
                    console.warn('[WebSocket] ⚠️ 连接已断开');
                    isConnected.value = false;
                    subscriptions.value.clear();
                }
            });

            // 激活连接
            client.activate();
            stompClient.value = client;

        } catch (error) {
            console.error('[WebSocket] ❌ 初始化失败:', error);
            reject(error);
        }
    });
};

/**
 * 订阅判题结果（新增）
 */
const subscribeJudgeResult = async (taskId, onMessage) => {
    try {
        // 确保 WebSocket 已连接
        await initWebSocketConnection();

        // 避免重复订阅
        if (subscriptions.value.has(taskId)) {
            console.warn(`[WebSocket] 任务 ${taskId} 已订阅`);
            return;
        }

        console.log(`[WebSocket] 📡 订阅任务: ${taskId}`);

        // 订阅 topic
        const subscription = stompClient.value.subscribe(
            `/topic/judge/${taskId}`,
            (message) => {
                const result = JSON.parse(message.body);
                console.log('[WebSocket] 📥 收到消息:', result);

                // 调用回调函数
                onMessage(result);
            }
        );

        // 保存订阅
        subscriptions.value.set(taskId, subscription);

    } catch (error) {
        console.error('[WebSocket] ❌ 订阅失败:', error);
        throw error;
    }
};

/**
 * 取消订阅（新增）
 */
const unsubscribeJudgeResult = (taskId) => {
    const subscription = subscriptions.value.get(taskId);
    if (subscription) {
        subscription.unsubscribe();
        subscriptions.value.delete(taskId);
        console.log(`[WebSocket] 🚫 取消订阅: ${taskId}`);
    }
};

// ============================================
// 你原有的 submitJudge 函数（优化版）
// ============================================

const submitJudge = async () => {
    const competition_id = parseInt(route.path.split("/")[2]);
    const problem_index = route.path.split("/")[4] ?? "";

    isShow_1.value = true;
    isShow_2.value = true;
    input.value = "";
    code_message.value = "";

    // 语言映射
    let temp_language = "";
    if (current_language.value == "C/C++") {
        temp_language = "cpp";
    } else if (current_language.value == "C") {
        temp_language = "c";
    } else if (current_language.value == "Python3") {
        temp_language = "python";
    } else if (current_language.value == "Java") {
        temp_language = "java";
    } else if (current_language.value == "Go") {
        temp_language = "go";
    } else if (current_language.value == "JavaScript"){
        temp_language = "javascript";
    }

    isLoading.value = true;

    try {
        let res;

        // 提交代码
        if (problem_index == "") {
            res = await ProblemAlgorithmControllerService.problemAlgorithmJudgeSubmitUsingPost({
                problem_id: problem_id.value,
                language: temp_language,
                source_code: content.value,
            });
        } else {
            res = await ProblemAlgorithmControllerService.problemAlgorithmJudgeSubmitUsingPost({
                competition_id: competition_id,
                index: problem_index,
                language: temp_language,
                source_code: content.value,
            });
        }

        // 检查提交结果
        if (res.code !== 0) {
            code_message.value = res.message || "提交失败";
            isLoading.value = false;
            return;
        }

        // 获取 taskId
        const taskId = res.data.taskId;
        code_status.value = res.data.status || "Pending";
        code_message.value = "提交成功，等待判题中...";

        console.log('[提交] ✅ 任务ID:', taskId);

        // ✅ 关键改动：订阅判题结果（复用连接）
        await subscribeJudgeResult(taskId, (result) => {
            handleJudgeResult(taskId, result);
        });

    } catch (error) {
        console.error('[提交] ❌ 出错:', error);
        code_message.value = "提交失败: " + (error.message || '未知错误');
    } finally {
        isLoading.value = false;
    }
};

// ============================================
// 处理判题结果（整合你原有的逻辑）
// ============================================

const handleJudgeResult = (taskId, result) => {
    console.log('[判题结果]', result);

    // 更新状态
    code_status.value = result.status;

    // 根据不同状态处理（保留你原有的逻辑）
    if (result.status === "Pending") {
        code_message.value = "任务排队中...";
    }
    else if (result.status === "Running" || result.status === "running") {
        code_message.value = "判题运行中...";
    }
    else if (result.status === "Retrying") {
        code_message.value = result.message || "判题失败，正在重试...";
    }
    else if (result.status === "Wrong Answer") {
        input.value = result.input || "";
        code_message.value = result.message || result.output || "";
        correctOutput.value = result.correctOutput || "";

        // 判题完成
        finishJudge(taskId);
    }
    else if (result.status === "Nonzero Exit Status") {
        code_message.value = result.message || result.fileId || "";

        finishJudge(taskId);
    }
    else if (result.status === "Accepted" || result.status === "Success") {
        // 播放成功音效
        audioClick.value.volume = 1;
        audioClick.value?.play();
        code_message.value = `Accepted! 分数: ${result.score || '100'}`;

        finishJudge(taskId);
    }
    else if (result.status === "Failed" || result.status === "failed") {
        code_message.value = result.message || "判题失败";

        finishJudge(taskId);
    }
    else {
        // 其他状态
        code_message.value = result.message || `状态: ${result.status}`;
    }
};

// ============================================
// 判题完成后的处理
// ============================================

const finishJudge = (taskId) => {
    // 调用原有的 modify 函数
    modify();

    // 隐藏 UI
    isShow_1.value = false;
    isShow_2.value = false;

    // 取消订阅（释放资源）
    setTimeout(() => {
        unsubscribeJudgeResult(taskId);
    }, 1000);
};

// ============================================
// 组件生命周期
// ============================================

// 组件卸载时断开连接
onUnmounted(() => {
    console.log('[组件] 卸载，清理 WebSocket');

    // 取消所有订阅
    subscriptions.value.forEach((sub) => {
        sub.unsubscribe();
    });
    subscriptions.value.clear();

    // 断开连接
    if (stompClient.value && isConnected.value) {
        stompClient.value.deactivate();
        isConnected.value = false;
    }
});

// ============================================
// 导出（如果需要在其他地方使用）
// ============================================


