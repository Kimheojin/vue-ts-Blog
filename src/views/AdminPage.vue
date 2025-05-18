<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { ElMessage } from "element-plus";
import { container } from "tsyringe";
import AuthService from "../service/AuthService.ts";
import AuthRepository from "../repository/AuthRepository.ts";

const router = useRouter();
const AUTH_SERVICE = container.resolve(AuthService)
const AUTH_REPOSITORY = container.resolve(AuthRepository)

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
}
</script>
<template>
  <div class="admin-page">
    <div class="admin-container">
      <h2 class="admin-title">관리자 페이지</h2>

      <div class="admin-content">
        <p class="admin-message">
          카테고리는 하위 항목 없는 구조<br>
          about me 관리 페이지 따로 만들어야 하나?
        </p>

        <div class="admin-actions">
          <el-button @click="AUTH_REPOSITORY.logout();">
            로그아웃
          </el-button>

          <el-button>카테고리 관리</el-button>
          <el-button>카테고리 삭제</el-button>
          <el-button>Post 수정</el-button>
          <el-button>Post 작성</el-button>
          <el-button>Post 삭제</el-button>

        </div>
      </div>
    </div>
  </div>
</template>
