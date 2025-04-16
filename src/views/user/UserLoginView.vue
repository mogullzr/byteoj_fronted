<template>
  <div class="body">
    <div class="main">
      <div class="container b-container" id="b-container">
        <form class="form" id="b-form" method="" action="">
          <h2 class="form_title title">注册管理员？(想得到美)</h2>
          <div class="form__icons">
            <a href="https://github.com/mogullzr?tab=repositories">
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
          </div>
          <input class="form__input" type="text" placeholder="用户名" />
          <input class="form__input" type="text" placeholder="邮箱" />
          <input class="form__input" type="password" placeholder="密码" />
          <input class="form__input" type="password" placeholder="确认密码" />
          <button class="form__button button submit">SIGN UP</button>
        </form>
      </div>
      <div class="container a-container" id="a-container">
        <form class="form" id="a-form" method="" action="">
          <h2 class="form_title title">登录MogullzrAdmim</h2>
          <div class="form__icons">
            <a href="https://github.com/mogullzr?tab=repositories">
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
          </div>
          <input
            class="form__input"
            type="text"
            placeholder="账户"
            v-model="userAccount"
          />
          <input
            class="form__input"
            type="password"
            placeholder="密码"
            v-model="userPassword"
          />
          <input
            class="form__input"
            type="text"
            placeholder="口令(定时修改)"
            v-model="token"
          />
          <button class="form__button button submit" @click.prevent="userLogin">
            SIGN IN
          </button>
        </form>
      </div>
      <div class="switch" id="switch-cnt">
        <div class="switch__circle"></div>
        <div class="switch__circle switch__circle--t"></div>
        <div class="switch__container" id="switch-c1">
          <h2 class="switch__title title">回去登录吧</h2>
          <p class="switch__description description">返回登录界面</p>
          <button class="switch__button button switch-btn">SIGN UP</button>
        </div>
        <div class="switch__container is-hidden" id="switch-c2">
          <h2 class="switch__title title">Hello Friend !</h2>
          <p class="switch__description description">
            点击即可前往管理员注册界面
          </p>
          <button class="switch__button button switch-btn">SIGN IN</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import {
  RsaControllerService,
  UserControllerService,
} from "../../../generated/index.ts";
import router from "../../router/index.ts";
import { ElNotification } from "element-plus";
import UseStore from "../../store/store.ts";
import { JSEncrypt } from "jsencrypt"; // Define reactive state

// Define reactive state
const useStore = UseStore();
const userAccount = ref("");
const userPassword = ref("");
const token = ref("");

// 设置Cookie
// const setCookie = (name, value) => {
//   const Days = 7;
//   const exp = new Date(new Date().getTime() + Days * 24 * 60 * 60 * 1000);
//   document.cookie = name + "=" + escape(value) + ";expires=" + exp + ";path=/;SameSite=None;";
// };

// 登录
const userLogin = async () => {
  let encrypt = new JSEncrypt();

  // 获取公钥
  const resPublicGet = await RsaControllerService.getPublicKeyUsingGet();
  if (resPublicGet.code === 0) {
    encrypt.setPublicKey(resPublicGet.data.replace("Mogul/", ""));
  } else {
    ElNotification.success({
      title: "公钥获取失败",
      showClose: false,
    });
    return;
  }

  if (encrypt.getPublicKey() != null) {
    let t = Date.now();
    const res = await UserControllerService.adminLoginUsingPost({
      account: encrypt.encrypt(`${userAccount.value}:${t}`),
      password: encrypt.encrypt(`${userPassword.value}:${t}`),
      token: encrypt.encrypt(`${token.value}:${t}`),
    });

    if (res.code === 0) {
      ElNotification.success({
        title: "登录成功",
        showClose: false,
      });
      window.location.replace("/home");
    } else {
      ElNotification.error({
        title: "登录失败",
        message: res.message,
        showClose: false,
      });
    }
  }
};

// Function to prevent default action
const getButtons = (e) => {
  e.preventDefault();
};

// Function to change form
const changeForm = (e) => {
  const switchCtn = document.querySelector("#switch-cnt");
  const switchC1 = document.querySelector("#switch-c1");
  const switchC2 = document.querySelector("#switch-c2");
  const switchCircle = document.querySelectorAll(".switch__circle");
  const aContainer = document.querySelector("#a-container");
  const bContainer = document.querySelector("#b-container");

  switchCtn.classList.add("is-gx");
  setTimeout(() => {
    switchCtn.classList.remove("is-gx");
  }, 1500);

  switchCtn.classList.toggle("is-txr");
  switchCircle[0].classList.toggle("is-txr");
  switchCircle[1].classList.toggle("is-txr");

  switchC1.classList.toggle("is-hidden");
  switchC2.classList.toggle("is-hidden");
  aContainer.classList.toggle("is-txl");
  bContainer.classList.toggle("is-txl");
  bContainer.classList.toggle("is-z200");
};

// Setup event listeners when component is mounted
onMounted(() => {
  const allButtons = document.querySelectorAll(".submit");
  const switchBtn = document.querySelectorAll(".switch-btn");

  allButtons.forEach((button) => button.addEventListener("click", getButtons));
  switchBtn.forEach((button) => button.addEventListener("click", changeForm));
});
</script>

<style scoped>
*,
*::after,
*::before {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
}

/* Generic */
body {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  background-color: #ffffff;
  color: #a0a5a8;
}

/**/
.main {
  position: relative;
  width: 1000px;
  min-width: 1000px;
  min-height: 600px;
  height: 600px;
  padding: 25px;
  background-color: #ecf0f3;
  box-shadow:
    5px 5px 5px #d1d9e6,
    -5px -5px 5px #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
  margin: 100px auto;
}

@media (max-width: 1200px) {
  .main {
    transform: scale(0.7);
  }
}

@media (max-width: 1000px) {
  .main {
    transform: scale(0.6);
  }
}

@media (max-width: 800px) {
  .main {
    transform: scale(0.5);
  }
}

@media (max-width: 600px) {
  .main {
    transform: scale(0.4);
  }
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  width: 600px;
  height: 100%;
  padding: 25px;
  background-color: #ecf0f3;
  transition: 1.25s;
}

.form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
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

.form__input {
  width: 350px;
  height: 40px;
  margin: 4px 0;
  padding-left: 25px;
  font-size: 13px;
  letter-spacing: 0.15px;
  border: none;
  outline: none;
  font-family: "Montserrat", sans-serif;
  background-color: #ecf0f3;
  transition: 0.25s ease;
  border-radius: 8px;
  box-shadow:
    inset 2px 2px 4px #d1d9e6,
    inset -2px -2px 4px #f9f9f9;
}

.form__input:focus {
  box-shadow:
    inset 4px 4px 4px #d1d9e6,
    inset -4px -4px 4px #f9f9f9;
}

.form__span {
  margin-top: 30px;
  margin-bottom: 12px;
}

.form__link {
  color: #181818;
  font-size: 15px;
  margin-top: 25px;
  border-bottom: 1px solid #a0a5a8;
  line-height: 2;
}

.title {
  font-size: 34px;
  font-weight: 700;
  line-height: 3;
  color: #181818;
}

.description {
  font-size: 14px;
  letter-spacing: 0.25px;
  text-align: center;
  line-height: 1.6;
}

.button {
  width: 180px;
  height: 50px;
  border-radius: 25px;
  margin-top: 50px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1.15px;
  background-color: #4b70e2;
  color: #f9f9f9;
  box-shadow:
    8px 8px 16px #d1d9e6,
    -8px -8px 16px #f9f9f9;
  border: none;
  outline: none;
}

/**/
.a-container {
  z-index: 100;
  left: calc(100% - 600px);
}

.b-container {
  left: calc(100% - 600px);
  z-index: 0;
}

.switch {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 400px;
  padding: 50px;
  z-index: 200;
  transition: 1.25s;
  background-color: #ecf0f3;
  overflow: hidden;
  box-shadow:
    12px 12px 12px #d1d9e6,
    -12px -12px 12px #f9f9f9;
}

.switch__circle {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background-color: #ecf0f3;
  box-shadow:
    inset 8px 8px 12px #d1d9e6,
    inset -8px -8px 12px #f9f9f9;
  bottom: -60%;
  left: -60%;
  transition: 1.25s;
}

.switch__circle--t {
  top: -30%;
  left: 60%;
  width: 300px;
  height: 300px;
}

.switch__container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute;
  width: 400px;
  padding: 50px 55px;
  transition: 1.25s;
}

.switch__button {
  cursor: pointer;
}

.switch__button:hover {
  box-shadow:
    6px 6px 10px #d1d9e6,
    -6px -6px 10px #f9f9f9;
  transform: scale(0.985);
  transition: 0.25s;
}

.switch__button:active,
.switch__button:focus {
  box-shadow:
    2px 2px 6px #d1d9e6,
    -2px -2px 6px #f9f9f9;
  transform: scale(0.97);
  transition: 0.25s;
}

/**/
.is-txr {
  left: calc(100% - 400px);
  transition: 1.25s;
  transform-origin: left;
}

.is-txl {
  left: 0;
  transition: 1.25s;
  transform-origin: right;
}

.is-z200 {
  z-index: 200;
  transition: 1.25s;
}

.is-hidden {
  visibility: hidden;
  opacity: 0;
  position: absolute;
  transition: 1.25s;
}

.is-gx {
  animation: is-gx 1.25s;
}

@keyframes is-gx {
  0%,
  10%,
  100% {
    width: 400px;
  }
  30%,
  50% {
    width: 500px;
  }
}
</style>
