<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, Ref, ref, watch } from "vue";
import UserStore from "@/store/user";
import { WebSocketControllerService } from "../../../generated";
import dayjs from "dayjs";
import { ChatList } from "@/models/ChatList";
import router from "@/router";

const useStore = UserStore();

const user = useStore.loginUser;
const user_list = ref([]);
const send_message: Ref<string> = ref("");
const Chat_list: Ref<ChatList[]> = ref([]);
const Chat_loading_list: Ref<ChatList[]> = ref([]);
const isShow = ref(false);
const num = ref(0);
const currentPage = ref(1);
const currentHeight = ref(0);
const message: Ref<string> = ref("");
const flag = ref(2);

let socketUrl: Ref<string> = ref("");

const ChatRoom: any = ref({
  room_id: 1,
  room_name: "Welcome To Mogullzr’s ChatRoom",
  first_avatar:
    "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
  second_avatar:
    "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
  third_avatar:
    "https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502101206472.png",
  online_num: 4,
});

let socket: WebSocket | null = null;

onMounted(async () => {
  const res =
    await WebSocketControllerService.webSocketGetMessageByRoomIdUsingPost(1, 1);
  if (res.code === 0) {
    if (res.data != "") {
      Chat_list.value = res.data;
      ChatRoom.value.room_name = Chat_list.value[0].room_name;
      ChatRoom.value.first_avatar =
        Chat_list.value.length >= 1 ? Chat_list.value[0].avatar : "";
      ChatRoom.value.second_avatar =
        Chat_list.value.length >= 2 ? Chat_list.value[1].avatar : "";
      ChatRoom.value.third_avatar =
        Chat_list.value.length >= 3 ? Chat_list.value[2].avatar : "";
      ChatRoom.value.online_num = Chat_list.value[0].online_num + 1;
      ChatRoom.value.room_id = Chat_list.value[0].room_id;
    }
    if (useStore.loginUser.uuid !== -1) {
      socketUrl.value =
        "wss://www.byteoj.com/api/websocket/" +
        user.uuid +
        "/" +
        ChatRoom.value.room_id;
      connect();
    }
  } else if (res.code === 40101) {
    router.push("/404");
  }
});

const connect = () => {
  if (typeof WebSocket == "undefined") {
    console.log("你的浏览器不支持websocket!!!");
  } else {
    console.log("你的浏览器支持websocket");
    socket = new WebSocket(socketUrl.value);

    // WebSocket心跳检测
    const ws_heartCheck: any = {
      timeout: 3000, // 5 秒一次心跳
      timeoutObj: null, // 执行心跳的定时器
      serverTimeoutObj: null, // 服务器超时定时器
      reset: () => {
        // 重置方法
        clearTimeout(ws_heartCheck.timeoutObj);
        clearTimeout(ws_heartCheck.serverTimeoutObj);
        return ws_heartCheck;
      },
      start: () => {
        // 启动方法
        const self = ws_heartCheck;
        self.reset();
        let message_json: any = {
          uuid: user.uuid,
          room_id: ChatRoom.value.room_id,
          avatar: user.avatar,
          message_content: "heartbeat", // 发送心跳标识
        };
        socket.send(JSON.stringify(message_json));

        self.timeoutObj = setTimeout(() => {
          // 这里发送一个心跳信息，后端收到后，返回一个消息，在 onmessage 拿到返回的心跳（信息）就说明连接正常
          self.start();
          // 如果超过一定时间还没重置，说明后端主动断开了
          self.serverTimeoutObj = setTimeout(() => {
            socket.close();
          }, self.timeout);
        }, self.timeout);
      },
    };

    socket.onopen = () => {
      ws_heartCheck.start();
      console.log("websocket已经打开");
    };

    //浏览器端接受消息，获取从服务器发送过来的文本信息
    socket.onmessage = (msg) => {
      let data = JSON.parse(msg.data);
      if (data.user_list != null) {
        user_list.value = data.user_list;
        ChatRoom.value.online_num = user_list.value.length;
      } else if (data.message_content === "heartbeat") {
        // 处理后端返回的心跳响应
        ws_heartCheck.reset();
      } else {
        Chat_list.value.push(data);
      }
    };

    // 连接断开
    socket.onclose = () => {
      socket.close();
      flag.value = 1;
      message.value = "重连中......";
      setTimeout(() => {
        flag.value = 2;
        connect();
      }, 3000);
      console.log("websocket连接已断开！！！！！");
    };

    //发生了错误事件
    socket.onerror = () => {
      flag.value = 1;
      message.value = "重连中......";
      setTimeout(() => {
        flag.value = 2;
        connect();
      }, 3000);
      console.log("websocket发生了错误");
    };
  }
};

onBeforeUnmount(() => {
  if (useStore.loginUser.uuid !== -1) {
    socket.close();
  }
});

const send = (message: string) => {
  if (typeof WebSocket === "undefined") {
    console.log("你的浏览器不支持websocket");
  } else {
    console.log("你的浏览器支持websocket");
    if (message.length !== 0) {
      let message_json: any = {
        uuid: user.uuid,
        room_id: ChatRoom.value.room_id,
        avatar: user.avatar,
        message_content: message,
      };
      socket.send(JSON.stringify(message_json));
      send_message.value = "";
    }
  }
};

watch(
  Chat_list,
  (newValue, OldValue) => {
    nextTick(() => {
      if (Math.abs(newValue.length - OldValue.length) > 0) {
        const chatContainer = document.getElementById("ChatContainer");
        if (currentHeight.value === 0) {
          currentHeight.value = chatContainer.scrollHeight;
          chatContainer.scroll(0, currentHeight.value);
        } else if (chatContainer) {
          // chatContainer.scrollTop = chatContainer.scrollHeight;
          chatContainer.scroll(
            0,
            chatContainer.scrollHeight - currentHeight.value
          );
        }
      } else {
        const chatContainer = document.getElementById("ChatContainer");
        currentHeight.value = chatContainer.scrollHeight;
        chatContainer.scroll(0, currentHeight.value);
      }
    });
  },
  { deep: true }
);

const scroll = async () => {
  let isLoading = true;
  let LoadDiv: any = document.getElementById("ChatContainer");
  let bottomOfWindow = LoadDiv.offsetHeight - LoadDiv.scrollTop >= 700;
  if (bottomOfWindow && isLoading && num.value === 0) {
    isShow.value = true;
    num.value++;
    currentPage.value++;
    const res =
      await WebSocketControllerService.webSocketGetMessageByRoomIdUsingPost(
        currentPage.value,
        ChatRoom.value.room_id
      );
    if (res.code === 0) {
      Chat_loading_list.value = res.data;
      if (Chat_loading_list.value.length === 0) {
        setTimeout(() => {
          isShow.value = false;
        }, 2000);
      } else {
        currentHeight.value = LoadDiv.scrollHeight;
        setTimeout(() => {
          Chat_list.value = Chat_loading_list.value.concat(Chat_list.value);
          num.value = 0;
          isShow.value = false;
        }, 2000);
      }
    } else {
      isLoading = false;
    }
  }
};
</script>
<template>
  <div
    role="alert"
    class="alert alert-success w-10/12 mx-36 mt-20"
    v-if="flag == 0"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      class="stroke-info h-6 w-6 shrink-0"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      ></path>
    </svg>
    <span>{{ message }}</span>
  </div>
  <div
    role="alert"
    class="alert alert-error w-10/12 mx-36"
    v-else-if="flag == 1"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 shrink-0 stroke-current"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span>{{ message }}</span>
  </div>
  <div
    class="card bg-neutral text-neutral-content mx-auto"
    style="max-width: 1150px"
  >
    <div
      class="card-body text-black overflow-y-auto"
      style="height: 700px"
      id="ChatContainer"
      @scroll="scroll"
    >
      <div class="card-title fixed">
        <div class="flex-1">{{ ChatRoom.room_name }}</div>
        <div class="float-right">在线情况：</div>
        <div class="avatar-group -space-x-6 rtl:space-x-reverse">
          <div class="avatar" v-if="ChatRoom.online_num >= 3">
            <div class="w-12">
              <img
                @dragstart.prevent
                :src="ChatRoom.first_avatar"
                alt="ByteOJ出品"
              />
            </div>
          </div>
          <div class="avatar">
            <div class="w-12" v-if="ChatRoom.online_num >= 1">
              <img
                @dragstart.prevent
                :src="ChatRoom.second_avatar"
                alt="ByteOJ出品"
              />
            </div>
          </div>
          <div class="avatar" v-if="ChatRoom.online_num >= 2">
            <div class="w-12">
              <img
                @dragstart.prevent
                :src="ChatRoom.third_avatar"
                alt="ByteOJ出品"
              />
            </div>
          </div>
          <div class="avatar placeholder">
            <div class="bg-neutral text-neutral-content w-12">
              <span>{{
                ChatRoom.online_num > 99 ? "++99" : ChatRoom.online_num
              }}</span>
            </div>
          </div>
        </div>
        <div class="avatar online">
          <div class="w-16 rounded-full">
            <img
              @dragstart.prevent
              :src="useStore.loginUser.avatar"
              alt="ByteOJ出品"
            />
          </div>
        </div>
      </div>
      <span
        class="loading loading-dots loading-lg m-auto"
        id="loading"
        v-show="isShow"
        >123</span
      >
      <div v-for="Chat in Chat_list" :key="Chat.uuid" class="chat_message">
        <div
          class="chat chat-start my-2"
          v-if="Chat.uuid !== useStore.loginUser.uuid"
        >
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img @dragstart.prevent alt="ByteOJ出品" :src="Chat.avatar" />
            </div>
          </div>
          <div class="chat-header text-black">
            {{ Chat.username }}
            <time class="text-xs opacity-50"
              >{{ dayjs(Chat.create_time).format("YYYY-MM-DD HH:mm:ss") }}
            </time>
          </div>
          <div
            class="chat-bubble bg-gray-50 text-black"
            style="overflow-wrap: break-word"
          >
            {{ Chat.message_content }}
          </div>
        </div>
        <div class="chat chat-end my-2" v-else>
          <div class="chat-image avatar">
            <div class="w-10 rounded-full">
              <img @dragstart.prevent alt="ByteOJ出品" :src="Chat.avatar" />
            </div>
          </div>
          <div class="chat-header">
            {{ Chat.username }}
            <time class="text-xs opacity-50"
              >{{ dayjs(Chat.create_time).format("YYYY-MM-DD HH:mm:ss") }}
            </time>
          </div>
          <div class="chat-bubble" style="overflow-wrap: break-word">
            {{ Chat.message_content }}
          </div>
          <div class="chat-footer opacity-50"></div>
        </div>
      </div>
    </div>
    <div class="divider divider-neutral m-0"></div>
    <div class="flex">
      <input
        class="textarea textarea-bordered text-black font-bold w-1/2 mx-auto"
        placeholder="在这里填写你要发送的消息,注意不允许超过1000字"
        v-model="send_message"
        @keyup.enter="send(send_message)"
      />
      <button @click="send(send_message)">发送</button>
    </div>
  </div>
</template>

<style scoped>
.chat_message {
  animation: chat_message 1s 1;
}

@keyframes chat_message {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.card {
  background: #757f9a; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #d7dde8,
    #757f9a
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #d7dde8,
    #757f9a
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.textarea {
  background: #757f9a; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #d7dde8,
    #757f9a
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #d7dde8,
    #757f9a
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.alert-error {
  animation: alert-error 3s 1;
}

@keyframes alert-error {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.alert-success {
  animation: alert-success 5s 1;
}

@keyframes alert-success {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
