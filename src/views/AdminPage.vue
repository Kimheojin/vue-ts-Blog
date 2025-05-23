<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { ElMessage } from "element-plus";
import { container } from "tsyringe";
import AuthService from "../service/AuthService.ts";
import AuthRepository from "../repository/AuthRepository.ts";
import type HttpError from "../http/HttpError.ts";

const router = useRouter();
const AUTH_SERVICE = container.resolve(AuthService)
const AUTH_REPOSITORY = container.resolve(AuthRepository)

// 마운트 시 세션 확인
onMounted(() => {
  checkAuth();
})

// 인증 상태 확인 - 쿠키 기반으로 수정
function checkAuth() {
  const sessionId = AUTH_SERVICE.getSessionId(); // 쿠키에서 JSESSIONID 확인

  // 세션 쿠키가 없으면 로그인 페이지로 리다이렉트
  if (!sessionId) {
    ElMessage.warning('관리자 로그인이 필요합니다.');
    router.replace("/login");
    return;
  }

  verifyAuthStatus();
}

// 서버에 인증 상태 확인
async function verifyAuthStatus() {
  try {
  } catch (error) {
    // 401 에러가 발생하면 자동으로 AuthService.logout()이 호출
    ElMessage.warning('세션이 만료되었습니다. 다시 로그인해주세요.');
    router.replace("/login");
  }
}

function handleLogout() {
  AUTH_REPOSITORY.logout()
      .then(() => {
        ElMessage.success('로그아웃 되었습니다.');
        router.replace('/login');
      })
      .catch((e: HttpError) => {
        ElMessage.error('로그아웃 중 오류가 발생했습니다: ' + e.getMessage());
      });
}

// 글 작성 페이지로 이동
function goToPostWrite() {
  router.push('/admin/post/write');
}

// 카테고리 추가 페이지로 이동
function goToCategoryAdd() {
  router.push('/admin/category/add');
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
          <el-button @click="handleLogout">
            로그아웃
          </el-button>

          <el-button type="success" @click="goToCategoryAdd">카테고리 추가</el-button>
          <el-button>카테고리 삭제</el-button>
          <el-button>Post 수정</el-button>
          <el-button type="primary" @click="goToPostWrite">Post 작성</el-button>
          <el-button>Post 삭제</el-button>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  display: flex;
  justify-content: center;
  align-items: center;
}

.admin-container {
  width: 100%;
  max-width: 1000px;
  text-align: center;
}

.admin-title {
  font-size: 28px;
  margin-bottom: 20px;
  color: #e0e0e0;
}

.admin-actions .el-button {
  min-width: 120px;
}
</style>