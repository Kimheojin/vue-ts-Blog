<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { ElMessage } from "element-plus";
import { container } from "tsyringe";
import { useAdminAuth } from "../composables/useAdminAuth.ts";
import AuthRepository from "../repository/auth/AuthRepository.ts";
import HttpError from "../http/HttpError.ts";

const router = useRouter();
const AUTH_REPOSITORY = container.resolve(AuthRepository)

const { isCheckingAuth, checkAuth } = useAdminAuth();

onMounted(async () => {
  await checkAuth();
});

async function handleLogout() {
  try {
    await AUTH_REPOSITORY.logout();
    ElMessage.success('로그아웃 되었습니다.');
    await router.replace('/admin/login');
  } catch (error) {
    const httpError = error as HttpError;
    if (httpError.getCode() === 401) {
      ElMessage.warning('세션이 만료되었습니다.');
      await router.replace('/admin/login');
    } else {
      ElMessage.error('로그아웃 중 오류가 발생했습니다: ' + httpError.getMessage());
    }
  }
}

function goToPostWrite() {
  router.push('/admin/post/write');
}

function goToPostDelete() {
  router.push('/admin/post/delete');
}
function goToAdminPosts() {
  router.push('/admin/post/delete');
}
function goToPostModify() {
  router.push('/admin/post/modify');
}
function goToCommentManage() {
  router.push('/admin/comment');
}

function goToCategoryAdd() {
  router.push('/admin/category/add');
}
function goToCategoryModify() {
  router.push('/admin/category/modify');
}

function goToCategoryDelete() {
  router.push('/admin/category/delete');
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-container">
      <div v-if="isCheckingAuth" class="loading-text">
        인증 확인 중...
      </div>

      <div v-else>

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
            <el-button type="success" @click="goToPostWrite">Post 작성</el-button>
            <el-button type="success" @click="goToPostDelete">Post 삭제</el-button>
            <el-button type="success" @click="goToPostModify">Post 수정</el-button>
            <el-button type="success" @click="goToCommentManage">Comment 수정</el-button>
            <el-button type="success" @click="goToAdminPosts">관리자 post 보기</el-button>
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
  text-align: center;
}

.admin-actions .el-button {
  min-width: 120px;
}

.loading-text {
  text-align: center;
  color: #e0e0e0;
  font-size: 16px;

}
</style>