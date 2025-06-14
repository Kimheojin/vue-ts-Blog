<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { ElMessage } from "element-plus";
import { container } from "tsyringe";
import AuthService from "../service/AuthService.ts";
import AuthRepository from "../repository/auth/AuthRepository.ts";
import HttpError from "../http/HttpError.ts";

const router = useRouter();
const AUTH_SERVICE = container.resolve(AuthService)
const AUTH_REPOSITORY = container.resolve(AuthRepository)

const isCheckingAuth = ref(true);

// 마운트 시 세션 확인
onMounted(() => {
  checkAuth();
})

// HTTPOnly 쿠키 사용 시 서버 API로 인증 상태 확인
async function checkAuth() {
  try {
    const isAuthenticated = await AUTH_SERVICE.isAuthenticated();

    if (!isAuthenticated) {
      ElMessage.warning('관리자 로그인이 필요합니다.');
      await router.replace("/admin/login");
      return;
    }

    // 인증 확인 완료
    isCheckingAuth.value = false;

  } catch (error) {
    console.error('인증 확인 중 오류:', error);
    ElMessage.warning('인증 확인 중 오류가 발생했습니다.');
    await router.replace("/amdin/login");
  }
}

async function handleLogout() {
  try {
    await AUTH_REPOSITORY.logout();
    ElMessage.success('로그아웃 되었습니다.');
    await router.replace('/amdin/login');
  } catch (error) {
    const httpError = error as HttpError;
    // 401 에러는 이미 AuthService.logout()이 호출되므로
    // 여기서는 메시지만 표시하고 로그인 페이지로 이동
    if (httpError.getCode() === 401) {
      ElMessage.warning('세션이 만료되었습니다.');
      await router.replace('/amdin/login');
    } else {
      ElMessage.error('로그아웃 중 오류가 발생했습니다: ' + httpError.getMessage());
    }
  }
}

// 글 작성 페이지로 이동
function goToPostWrite() {
  router.push('/admin/post/write');
}

// 카테고리 추가 페이지로 이동
function goToCategoryAdd() {
  router.push('/admin/category/add');
}
// 카테고리 수정 페이지
function goToCategoryModify() {
  router.push('/admin/category/modify');
}

// 카테고리 삭제 페이지로 이동
function goToCategoryDelete() {
  router.push('/admin/category/delete');
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-container">
      <!-- 인증 확인 중 로딩 표시 -->
      <div v-if="isCheckingAuth" class="loading-text">
        인증 확인 중...
      </div>

      <div v-else>
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
            <el-button type="success" @click="goToCategoryDelete">카테고리 삭제</el-button>
            <el-button type="success" @click="goToCategoryModify">카테고리 수정</el-button>
            <el-button type="primary" @click="goToPostWrite">Post 작성</el-button>
            <el-button>Post 삭제</el-button>
          </div>
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

.loading-text {
  text-align: center;
  color: #e0e0e0;
  font-size: 16px;
  margin: 20px 0;
}
</style>