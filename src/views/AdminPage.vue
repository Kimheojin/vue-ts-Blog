<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { ElMessage } from "element-plus";
import { container } from "tsyringe";
import AuthService from "../service/AuthService.ts";

const router = useRouter();
const AUTH_SERVICE = container.resolve(AuthService)

// 마운트 시 세션 확인
onMounted(() => {
  checkAuth();
})

// 인증 상태 확인
function checkAuth() {
  const sessionId = AUTH_SERVICE.getSessionId();

  // 세션 ID가 없으면 로그인 페이지로 리다이렉트
  if (!sessionId) {
    ElMessage.warning('관리자 로그인이 필요합니다.');
    router.replace("/login");
  }
}

function goToLogin () {
  router.replace("/login")
};
</script>
<template>
  <div class="admin-page">
    <div class="admin-container">
      <h2 class="admin-title">관리자 페이지</h2>

      <div class="admin-content">
        <p class="admin-message">
          관리자 페이지에 오신 것을 환영합니다.
        </p>
        <p class="admin-description">
          이 페이지에서 블로그 관리 작업을 수행할 수 있습니다.
        </p>

        <div class="admin-actions">
          <el-button class="logout-button" @click="AUTH_SERVICE.logout(); goToLogin();">
            로그아웃
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>
