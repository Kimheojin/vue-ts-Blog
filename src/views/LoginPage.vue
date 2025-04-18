<script setup lang="ts">
import {reactive} from 'vue';
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {container} from "tsyringe";
import AuthRepository from "../repository/AuthRepository.ts";
import LoginRequest from "../entity/user/LoginRequest.ts";
import type HttpError from "../http/HttpError.ts";

const router = useRouter()
const AUTH_REPOSITORY = container.resolve(AuthRepository)

const state = reactive({
  login: new LoginRequest()
})

function handleLogin() {

  AUTH_REPOSITORY.login(state.login).then(
      () => {
        ElMessage.success('로그인에 성공했습니다.')
        router.push('/about')
      })
      .catch((e: HttpError) =>{
          ElMessage.error(e.getMessage())}
      )

}



</script>
<template>
  <div class="login-page">
    <div class="login-container">
      <h2 class="login-title">로그인</h2>

      <div class="login-form">
        <div class="form-group">
          <input
              v-model="state.login.email"
              type="text"
              placeholder="아이디"
              class="form-input"
          />
        </div>

        <div class="form-group">
          <input
              v-model="state.login.password"
              type="password"
              placeholder="비밀번호"
              class="form-input"
              @keyup.enter="handleLogin"
          />
        </div>



        <div class="form-group">
          <button
              class="login-button"
              @click="handleLogin"
          >
            로그인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>