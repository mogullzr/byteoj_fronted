<script setup lang="ts">
import { Ref, ref, UnwrapRef } from "vue";
import { useRouter } from "vue-router";
import { UserControllerService } from "../../../generated";
import UserStore from "@/store/user";

const Account = ref("");
const Password = ref("");
const success_message = ref("");
const error_message = ref("");
const router = useRouter();
const IsShow = ref();
const userStore = UserStore();
const onSubmit = async () => {
  const res = await UserControllerService.userLoginUsingPost({
    account: Account.value,
    password: Password.value,
  });
  if (res.code === 0) {
    success_message.value = "登录成功";
    IsShow.value = true;
    setTimeout(function () {
      window.location.replace("/");
    }, 1500);
  } else {
    error_message.value = res.message;
    IsShow.value = false;
  }
};
</script>

<template>
  <div class="modal-box mx-auto">
    <div class="card w-96 mx-auto">
      <div class="alert alert-success" v-if="IsShow === true">
        <span style="color: white">{{ success_message }}</span>
      </div>
      <div
        class="alert alert-error"
        style="color: white"
        v-else-if="IsShow === false"
      >
        <span>{{ error_message }}</span>
      </div>
      <div class="pl-32">
        <form method="dialog">
          <button
            to="/"
            class="btn btn-ghost text-xl p-2 flex-none px-0.5 mx-2 btn btn-ghost text-xl pl-0.5 mt-12"
            style="font-size: 40px"
          >
            ByteOJ
          </button>
        </form>
      </div>
      <div class="w-12 h-2 space-x-8 pl-3 mr-0.5">
        <svg
          t="1711372491878"
          class="icon"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          p-id="4894"
          width="200"
          height="200"
        >
          <path
            d="M295.232 208.768a19.2 19.2 0 0 1 27.2 0l18.048 18.112a19.2 19.2 0 0 1 0 27.2L82.56 512l257.984 257.92a19.2 19.2 0 0 1 2.816 23.68l-2.816 3.52-18.048 18.112a19.2 19.2 0 0 1-27.2 0L5.632 525.568a19.2 19.2 0 0 1 0-27.136l289.6-289.664z m433.536 0a19.2 19.2 0 0 0-27.2 0l-18.048 18.112a19.2 19.2 0 0 0 0 27.2L941.44 512l-257.984 257.92a19.2 19.2 0 0 0-2.816 23.68l2.816 3.52 18.048 18.112a19.2 19.2 0 0 0 27.2 0l289.6-289.664a19.2 19.2 0 0 0 0-27.136l-289.6-289.664z m-128 13.248l-114.752 590.528a19.2 19.2 0 0 1-22.528 15.232l-25.088-4.928a19.2 19.2 0 0 1-15.232-22.528l114.816-590.528a19.2 19.2 0 0 1 22.528-15.168l25.088 4.864a19.2 19.2 0 0 1 15.232 22.528z"
            fill="#ffffff"
            p-id="4895"
          ></path>
        </svg>
      </div>
      <form class="card-body">
        <div class="form-control">
          <input
            type="text"
            v-model="Account"
            placeholder="请输入账号"
            class="input input-bordered"
            required
          />
        </div>
        <div class="form-control">
          <input
            type="password"
            v-model="Password"
            placeholder="请输入密码"
            class="input input-bordered"
            required
          />
          <label class="label">
            <a href="#" class="label-text-alt link link-hover">忘记密码?</a>
            <!-- Open the modal using ID.showModal() method -->
            <form method="dialog">
              <button onclick="my_modal_2.showModal()">
                没有帐号?点击注册
              </button>
            </form>
          </label>
        </div>
        <div class="form-control mt-6">
          <button class="btn btn-primary">登录</button>
        </div>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</template>

<style scoped></style>
