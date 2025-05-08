<script setup lang="ts">
import {reactive, onMounted} from 'vue';
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {container} from "tsyringe";
import AuthRepository from "../repository/AuthRepository.ts";
import LoginRequest from "../entity/user/LoginRequest.ts";
import type HttpError from "../http/HttpError.ts";
import AuthService from "../service/AuthService.ts";

const router = useRouter()
const AUTH_REPOSITORY = container.resolve(AuthRepository)
const AUTH_SERVICE = container.resolve(AuthService)

const state = reactive({
  login: new LoginRequest()
})

// 컴포넌트 마운트 시 세션 확인
onMounted(() => {
  checkSession();
})

// 세션 ID 존재 여부 확인 함수
function checkSession() {
  const sessionId = AUTH_SERVICE.getSessionId();

  // 세션 ID가 존재하면 관리자 페이지로 리다이렉트
  if (sessionId) {
    ElMessage.info('이미 로그인되어 있습니다.');
    router.replace('/admin');
  }
}

function handleLogin() {
  AUTH_REPOSITORY.login(state.login).then(
      () => {
        ElMessage.success('로그인에 성공했습니다.')
        router.replace('/admin')
      })
      .catch((e: HttpError) =>{
        ElMessage.error(e.getMessage() + " // " +  e.getCode())}
      ).finally(() => {

  })
}
</script>

<template>
  <div class="login-page">
    <div class="admin-container">
      <h1 class="login-title">로그인</h1>

      <div class="login-form">
        <div class="form-group">
          <el-input
              v-model="state.login.email"
              placeholder="이메일 입력해 주세요"
              type="text"
              class="form-input"
              clearable
          />
        </div>

        <div class="form-group">
          <el-input
              v-model="state.login.password"
              type="password"
              placeholder="비밀번호를 입력해 주세요"
              show-password
              @keyup.enter="handleLogin"
          />
        </div>

        <div class="form-group">
          <el-button
              class="admin-button"
              @click="handleLogin"
          >로그인
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-title{
  text-align: center;
}
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
}

.admin-container {
  width: 100%;
  max-width: 400px;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
}


</style>