<script setup lang="ts">
import {onMounted, onUnmounted, ref, Ref} from "vue";

import {useRouter} from "vue-router";
import {
  RsaControllerService,
  UserControllerService,
} from "../../../generated";
import UserStore from "@/store/user";
import Vcode from "vue3-puzzle-vcode";
import {JSEncrypt} from "jsencrypt";
import {useMessageBox} from "@/view/components/alert/useMessageBox";

const Account = ref("");
const Password = ref("");
const router = useRouter();
// 用于判断处于登录还是注册界面
const isShow: Ref<number> = ref(0);
// 验证块是否出现
const blockIsShow: Ref<boolean> = ref(false);
const check: Ref<number> = ref(0);
const userStore = UserStore();

const githubBaseUrl = userStore.githubBaseUrl;
const client_id = userStore.client_id;
const redirect_uri = userStore.redirect_uri;
// 注册使用
const userAccount = ref("");
const email = ref("");
const newEmail = ref("");
const confirmNumber: Ref<string> = ref("");
const userPassword = ref("");
const userCheckPassword = ref("");
const userNewPassword = ref("");
const userNewCheckPassword = ref("");
const confirmNewNumber = ref("");
// 60s倒计时
const initialTime = 60;
// 剩余时间
const timeLeft = ref(0);
let timer: any = ref();

// 正确方式
const setCookie = (name: string, value: string) => {
  const Days = 7;
  const exp = new Date(new Date().getTime() + Days * 24 * 60 * 60 * 1000);
  document.cookie = name + "=" + escape(value) + ";expires=" + exp;
};

const onLoginSubmit = async () => {
  let encrypt = new JSEncrypt();

  // 获取公钥
  const resPublicGet = await RsaControllerService.getPublicKeyUsingGet();

  if (resPublicGet.code === 0) {
    if (resPublicGet.data != null) {
      encrypt.setPublicKey(resPublicGet.data.replace("Mogul/", ""));
    }
  } else {
    return;
  }

  if (encrypt.getPublicKey() != null) {
    let t = Date.now();
    const res = await UserControllerService.userLoginUsingPost({
      account: encrypt.encrypt(`${Account.value}:${t}`),
      password: encrypt.encrypt(`${Password.value}:${t}`),
    });
    if (res.code === 0) {
      success("登录成功");
      setCookie("JSESSIONID", res.data.sessionId);
      setTimeout(function () {
        window.location.replace("/home");
      }, 1500);
    } else {
      error(res.message);
    }
  }
};

const onRegisterSubmit = async () => {
  const res = await UserControllerService.userRegisterUsingPost({
    account: userAccount.value,
    checkPassword: userCheckPassword.value,
    confirmNumber: confirmNumber.value,
    email: email.value,
    password: userPassword.value,
  });

  if (res.code === 0) {
    success("注册成功");
    setTimeout(function () {
      window.location.reload();
      router.replace("/login");
    }, 1500);
  } else {
    error(res.message);
  }
};

// 发送验证信息
const QQMessageSend = (num: number) => {
  check.value = num;
  blockIsShow.value = true;
};

const {success, error, warning} = useMessageBox();
onMounted(() => {
  // 获得两个按钮
  let register: any = document.getElementById("register");
  let login: any = document.getElementById("login");
  let findPassword: any = document.getElementById("findPassword");

  // 绑定事件
  let formBox: any = document.getElementsByClassName("form-box")[0];

  register.addEventListener("click", () => {
    // 表格盒子向右平移
    formBox.style.transform = "translateX(100%)";
    isShow.value = 1;
  });

  login.addEventListener("click", () => {
    // 表格盒子恢复最左侧状态
    formBox.style.transform = "translateX(0%)";
    isShow.value = 0;
  });
  findPassword.addEventListener("click", () => {
    console.log(isShow.value);
    formBox.style.transform = "translateX(100%)";
    isShow.value = 2;
  });
});

const ModifyPassword = async () => {
  const res = await UserControllerService.userSetPasswordUsingPost({
    email: newEmail.value,
    confirmNumber: confirmNewNumber.value,
    password: userNewPassword.value,
    checkPassword: userNewCheckPassword.value,
  });

  if (res.code === 0) {
    location.reload();
  }
};

// 成功的时候,0表示注册时，1表示找回密码时
const onSuccess = async () => {
  blockIsShow.value = false;
  let nowEmail = "";
  console.log(check.value, email.value, newEmail.value);
  if (check.value == 1) {
    nowEmail = email.value;
  } else if (check.value == 2) {
    nowEmail = newEmail.value;
  }
  const res = await UserControllerService.userEmailSendUsingPost(nowEmail);
  if (res.code === 0) {
    timeLeft.value = initialTime;
    timer = setInterval(updateCountdown, 1000);
  }
};

// 关闭的时候
const onClose = () => {
  blockIsShow.value = false;
};

// 更新倒计时
const updateCountdown = () => {
  if (timeLeft.value > 0) {
    timeLeft.value -= 1;
  } else {
    clearInterval(timer);
  }
};

const getRedirectUrl = async () => {
  const res = await UserControllerService.userQqAutoLoginUsingGet();
  if (res.code === 0) {
    window.location.href = res.data;
  }
};
// 清理定时器
onUnmounted(() => {
  if (timer.value != null) {
    clearInterval(timer);
  }
});
</script>

<template>
  <!-- 最外层大盒子 -->
  <div class="container mx-auto my-20">
    <!-- 表格盒子 -->
    <div class="form-box bg-blue-300">
      <Vcode/>
      <!-- 注册表格盒子 -->
      <div class="register-box" v-show="isShow == 1">
        <h1 class="text-5xl">REGISTER</h1>
        <label class="input input-bordered flex items-center gap-2 mt-4">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4 opacity-70"
          >
            <path
                d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
            />
          </svg>
          <input
              type="text"
              name="用户名"
              class="grow"
              placeholder="填写用户名"
              v-model="userAccount"
          />
        </label>
        <label class="input input-bordered flex items-center gap-2 mt-4">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4 opacity-70"
          >
            <path
                d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"
            />
            <path
                d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"
            />
          </svg>
          <input
              type="text"
              class="grow"
              placeholder="填写你的QQ邮箱"
              v-model="email"
          />
        </label>
        <div class="flex w-8/12">
          <label
              class="input input-bordered flex items-center gap-2 mr-2 w-11/12 mt-4"
          >
            <input
                type="text"
                class="grow"
                placeholder="填写验证码"
                v-model="confirmNumber"
            />
          </label>
          <button
              :class="
              'text-sm mr-2 ' + (timeLeft > 0 ? 'bg-gray-300' : 'bg-red-200')
            "
              @click="QQMessageSend(1)"
          >
            <span v-if="timeLeft == 0">发送验证码</span>
            <span v-else>重新发送</span>
            <span v-if="timeLeft > 0">({{ timeLeft }})</span>
          </button>
        </div>
        <label class="input input-bordered flex items-center gap-2 mt-4">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4 opacity-70"
          >
            <path
                fill-rule="evenodd"
                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                clip-rule="evenodd"
            />
          </svg>
          <input
              type="password"
              class="grow"
              value="userPassword"
              placeholder="请确认密码"
              v-model="userPassword"
          />
        </label>
        <label class="input input-bordered flex items-center gap-2 mt-4">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4 opacity-70"
          >
            <path
                fill-rule="evenodd"
                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                clip-rule="evenodd"
            />
          </svg>
          <input
              type="password"
              class="grow"
              value="userCheckPassword"
              placeholder="请确认密码"
              v-model="userCheckPassword"
          />
        </label>
        <button
            class="btn bg-white text-xl text-sky-400"
            @click.prevent="onRegisterSubmit"
        >
          注 册
        </button>
      </div>
      <!-- 登录表格盒子 -->
      <div class="login-box font-bold" v-show="isShow == 0">
        <h1 class="text-5xl">LOGIN</h1>
        <label class="input input-bordered flex items-center gap-2 mt-4">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4 opacity-70"
          >
            <path
                d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
            />
          </svg>
          <input
              type="text"
              name="用户名"
              v-model="Account"
              placeholder="用户名"
          />
        </label>
        <label class="input input-bordered flex items-center gap-2 mt-4">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4 opacity-70"
          >
            <path
                fill-rule="evenodd"
                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                clip-rule="evenodd"
            />
          </svg>
          <input
              type="password"
              name="密码"
              v-model="Password"
              placeholder="密码"
              @keyup.enter="onLoginSubmit"
          />
        </label>
        <button
            id="findPassword"
            class="ml-48"
            style="width: 80px; margin-top: 0"
        >
          忘记密码
        </button>
        <div class="w-9/12 social-icons flex gap-4 bg-white rounded-2xl p-3 shadow-md hover:shadow-lg transition-shadow">
          <span class="float-left">第三方登录：</span>
          <a
              :href="
              githubBaseUrl +
              '?client_id=' +
              client_id +
              '&redirect_uri=' +
              redirect_uri
            "
              class="icon-link hover:scale-110 transition-transform"
              aria-label="Login with GitHub"
          >
            <svg
                class="form__icon"
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                viewBox="0 0 24 24"
            >
              <path
                  fill="#000000"
                  d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
              />
            </svg>
          </a>
          <a
              @click="getRedirectUrl"
              class="icon-link hover:scale-110 transition-transform"
              aria-label="QQ login option"
          >
            <svg t="1754554872226" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                 p-id="7932" width="25" height="25">
              <path
                  d="M511.09761 957.257c-80.159 0-153.737-25.019-201.11-62.386-24.057 6.702-54.831 17.489-74.252 30.864-16.617 11.439-14.546 23.106-11.55 27.816 13.15 20.689 225.583 13.211 286.912 6.767v-3.061z"
                  fill="#FAAD08" p-id="7933"></path>
              <path
                  d="M496.65061 957.257c80.157 0 153.737-25.019 201.11-62.386 24.057 6.702 54.83 17.489 74.253 30.864 16.616 11.439 14.543 23.106 11.55 27.816-13.15 20.689-225.584 13.211-286.914 6.767v-3.061z"
                  fill="#FAAD08" p-id="7934"></path>
              <path
                  d="M497.12861 474.524c131.934-0.876 237.669-25.783 273.497-35.34 8.541-2.28 13.11-6.364 13.11-6.364 0.03-1.172 0.542-20.952 0.542-31.155C784.27761 229.833 701.12561 57.173 496.64061 57.162 292.15661 57.173 209.00061 229.832 209.00061 401.665c0 10.203 0.516 29.983 0.547 31.155 0 0 3.717 3.821 10.529 5.67 33.078 8.98 140.803 35.139 276.08 36.034h0.972z"
                  fill="#000000" p-id="7935"></path>
              <path
                  d="M860.28261 619.782c-8.12-26.086-19.204-56.506-30.427-85.72 0 0-6.456-0.795-9.718 0.148-100.71 29.205-222.773 47.818-315.792 46.695h-0.962C410.88561 582.017 289.65061 563.617 189.27961 534.698 185.44461 533.595 177.87261 534.063 177.87261 534.063 166.64961 563.276 155.56661 593.696 147.44761 619.782 108.72961 744.168 121.27261 795.644 130.82461 796.798c20.496 2.474 79.78-93.637 79.78-93.637 0 97.66 88.324 247.617 290.576 248.996a718.01 718.01 0 0 1 5.367 0C708.80161 950.778 797.12261 800.822 797.12261 703.162c0 0 59.284 96.111 79.783 93.637 9.55-1.154 22.093-52.63-16.623-177.017"
                  fill="#000000" p-id="7936"></path>
              <path
                  d="M434.38261 316.917c-27.9 1.24-51.745-30.106-53.24-69.956-1.518-39.877 19.858-73.207 47.764-74.454 27.875-1.224 51.703 30.109 53.218 69.974 1.527 39.877-19.853 73.2-47.742 74.436m206.67-69.956c-1.494 39.85-25.34 71.194-53.24 69.956-27.888-1.238-49.269-34.559-47.742-74.435 1.513-39.868 25.341-71.201 53.216-69.974 27.909 1.247 49.285 34.576 47.767 74.453"
                  fill="#FFFFFF" p-id="7937"></path>
              <path
                  d="M683.94261 368.627c-7.323-17.609-81.062-37.227-172.353-37.227h-0.98c-91.29 0-165.031 19.618-172.352 37.227a6.244 6.244 0 0 0-0.535 2.505c0 1.269 0.393 2.414 1.006 3.386 6.168 9.765 88.054 58.018 171.882 58.018h0.98c83.827 0 165.71-48.25 171.881-58.016a6.352 6.352 0 0 0 1.002-3.395c0-0.897-0.2-1.736-0.531-2.498"
                  fill="#FAAD08" p-id="7938"></path>
              <path
                  d="M467.63161 256.377c1.26 15.886-7.377 30-19.266 31.542-11.907 1.544-22.569-10.083-23.836-25.978-1.243-15.895 7.381-30.008 19.25-31.538 11.927-1.549 22.607 10.088 23.852 25.974m73.097 7.935c2.533-4.118 19.827-25.77 55.62-17.886 9.401 2.07 13.75 5.116 14.668 6.316 1.355 1.77 1.726 4.29 0.352 7.684-2.722 6.725-8.338 6.542-11.454 5.226-2.01-0.85-26.94-15.889-49.905 6.553-1.579 1.545-4.405 2.074-7.085 0.242-2.678-1.834-3.786-5.553-2.196-8.135"
                  fill="#000000" p-id="7939"></path>
              <path
                  d="M504.33261 584.495h-0.967c-63.568 0.752-140.646-7.504-215.286-21.92-6.391 36.262-10.25 81.838-6.936 136.196 8.37 137.384 91.62 223.736 220.118 224.996H506.48461c128.498-1.26 211.748-87.612 220.12-224.996 3.314-54.362-0.547-99.938-6.94-136.203-74.654 14.423-151.745 22.684-215.332 21.927"
                  fill="#FFFFFF" p-id="7940"></path>
              <path
                  d="M323.27461 577.016v137.468s64.957 12.705 130.031 3.91V591.59c-41.225-2.262-85.688-7.304-130.031-14.574"
                  fill="#EB1C26" p-id="7941"></path>
              <path
                  d="M788.09761 432.536s-121.98 40.387-283.743 41.539h-0.962c-161.497-1.147-283.328-41.401-283.744-41.539l-40.854 106.952c102.186 32.31 228.837 53.135 324.598 51.926l0.96-0.002c95.768 1.216 222.4-19.61 324.6-51.924l-40.855-106.952z"
                  fill="#EB1C26" p-id="7942"></path>
            </svg>
          </a>
        </div>
        <button
            class="btn bg-white text-xl text-sky-400"
            @click.prevent="onLoginSubmit"
        >
          登 录
        </button>
      </div>
      <div class="login-box font-bold" v-show="isShow == 2">
        <h1 class="text-5xl">找回密码</h1>
        <label class="input input-bordered flex items-center gap-2 mt-4">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4 opacity-70"
          >
            <path
                d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z"
            />
            <path
                d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z"
            />
          </svg>
          <input
              type="text"
              class="grow"
              placeholder="请输入你的绑定邮箱"
              v-model="newEmail"
          />
        </label>
        <div class="flex w-9/12">
          <label
              class="input input-bordered flex items-center gap-2 ml-2 mr-4 w-10/12 mt-4"
          >
            <input
                type="text"
                class="grow"
                placeholder="填写验证码"
                v-model="confirmNewNumber"
            />
          </label>
          <button
              :class="
              'text-sm mr-2 ' + (timeLeft > 0 ? 'bg-gray-300' : 'bg-red-200')
            "
              @click="QQMessageSend(2)"
          >
            <span v-if="timeLeft == 0">发送验证码</span>
            <span v-else>重新发送</span>
            <span v-if="timeLeft > 0">({{ timeLeft }})</span>
          </button>
        </div>
        <label class="input input-bordered flex items-center gap-2 mt-4">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4 opacity-70"
          >
            <path
                fill-rule="evenodd"
                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                clip-rule="evenodd"
            />
          </svg>
          <input
              type="password"
              class="grow"
              value="userCheckPassword"
              placeholder="请输入密码"
              v-model="userNewPassword"
          />
        </label>
        <label class="input input-bordered flex items-center gap-2 mt-4">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              class="h-4 w-4 opacity-70"
          >
            <path
                fill-rule="evenodd"
                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                clip-rule="evenodd"
            />
          </svg>
          <input
              type="password"
              class="grow"
              value="userCheckPassword"
              placeholder="再次确认密码"
              v-model="userNewCheckPassword"
          />
        </label>
        <button
            class="btn bg-white text-xl text-sky-400"
            @click.prevent="ModifyPassword"
        >
          修改
        </button>
      </div>
    </div>
    <!-- （注册对应内容页）去登陆 -->
    <div class="con-box left" style="color: #a59f9a">
      <h2 class="text-4xl">
        <span class="font-bold">欢迎来到</span
        ><span class="font-bold text-sky-600">算法的世界</span>
      </h2>
      <p>快来开启你的<span class="font-bold">算法编程</span>旅程吧</p>
      <div class="avatar">
        <div class="w-36 rounded-full">
          <img
              src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502091611291.png"
              alt="ByteOJ出品"
          />
        </div>
      </div>

      <p class="text-2xl py-4 px-auto text-gray-400">已有账号</p>
      <button
          id="login"
          class="btn text-white text-xl font-bold bg-sky-400 hover:bg-sky-500 active:bg-sky-600"
      >
        去登录
      </button>
    </div>
    <!--（登录对应内容页）去注册 -->
    <div class="con-box right">
      <h2 class="text-4xl">
        <span class="font-bold">欢迎来到</span
        ><span class="font-bold text-sky-600">算法的世界</span>
      </h2>
      <p>提升你的<span>算法编程</span>能力</p>
      <div class="avatar">
        <div class="w-36 rounded-full">
          <img
              src="https://mogullzr001.oss-cn-beijing.aliyuncs.com/typora_img/202502091611291.png"
              alt="ByteOJ出品"
          />
        </div>
      </div>
      <p class="text-2xl py-4 px-auto text-gray-400">没有账号？</p>
      <button
          id="register"
          class="btn text-white text-xl font-bold bg-sky-400 hover:bg-sky-500 active:bg-sky-600"
      >
        去注册
      </button>
    </div>
  </div>
  <Vcode :show="blockIsShow" @success="onSuccess()" @close="onClose()"/>
</template>

<style scoped>
body {
  /* 也就是100% 被子元素完全撑开 */
  height: 100vh;
  /* 弹性布局 水平+垂直居中 */
  display: flex;
  /* body中的盒子垂直居中*/
  justify-content: center;
  /* body中的盒子水平居中*/
  align-items: center;
  /* 渐变轴为 45 度，从蓝色渐变到红色 */
}

.container {
  background-color: #fff;
  width: 820px;
  height: 600px;
  border-radius: 10px;
  /* 阴影 */
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
  /* 相对定位 */
  position: relative;
}

.form-box {
  /* 绝对定位 */
  position: absolute;
  /* 上面突出来一小节 */
  top: -12px;
  left: 10px;
  width: 400px;
  height: 624px;
  z-index: 2;
  border-radius: 10px;
  box-shadow: 2px 0px 6px rgba(0, 0, 0, 0.1);
  /* 弹性布局 */
  display: flex;
  /* 内容水平居中显示 */
  align-items: center;
  transition: 1s ease-in-out;
}

.register-box,
.login-box {
  /* 弹性布局 */
  display: flex;
  /* 决定伸缩盒子内的项目排列方式 垂直排列 主轴为垂直方向 */
  flex-direction: column;
  /* 中点对齐 */
  align-items: center;
  width: 100%;
}

/* 标题 */
h1 {
  text-align: center;
  margin-bottom: 48px;
  /* 转换为大写 */
  text-transform: uppercase;
  color: #fff;
  /* 设置字间距 */
  letter-spacing: 3px;
}

input {
  /* 将输入框背景改为透明 */
  width: 70%;
  margin: 10px;
  border-radius: 6px;
  padding: 10px 4px;
}

/* 渲染注册/登录按钮 */
.form-box button {
  margin-top: 20px;
  width: 70%;
  height: 40px;
  font-weight: 700;
  /* 不要边框 */
  border: none;
  border-radius: 8px;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
  /* 当鼠标悬浮在按钮上时 变为指针手势 */
  cursor: pointer;
}

/* 鼠标悬浮在按钮上时 背景&字体颜色改变 并且有0.5秒的过渡 */

.con-box {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* 绝对定位 */
  position: absolute;
  top: 50%;
  /* css3  将盒子进行平移操作 向y轴负方向也就是上方 平移半个盒子高度距离*/
  transform: translateY(-50%);
  /* 这两个操作实现盒子的水平居中 */
}

.con-box.left {
  left: 0%;
}

.con-box.right {
  right: 0%;
}

.con-box * {
  margin-top: 10px;
}

.con-box h2 {
  letter-spacing: 3px;
  text-align: center;
}

.con-box h2 span {
  letter-spacing: 3px;
  text-align: center;
}

.con-box p {
  letter-spacing: 1px;
  text-align: center;
  font-weight: 500;
}

.con-box span {
  font-weight: 700;
}

.con-box img {
  /* 之前写过 现在加上这两行即可 */
  /* 设置透明度 */
  opacity: 0.9;
  margin: 20px 0;
}

.con-box button {
  margin-top: 20px;
  width: 30%;
  height: 30px;
  font-weight: 600;
  border: none;
  outline: none;
  border-radius: 8px;
  box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.form__icon {
  object-fit: contain;
  width: 30px;
  margin: 0 5px;
  opacity: 0.5;
  transition: 0.15s;
}

.form__icon:hover {
  opacity: 1;
  transition: 0.15s;
  cursor: pointer;
}
</style>
