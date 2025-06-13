<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { container } from "tsyringe";
import PostRepository from "../repository/PostRepository.ts";
import CategoryRepository from "../repository/CategoryRepository.ts";
import AuthService from "../service/AuthService.ts";
import PostRequest from "../entity/request/PostRequest.ts";
import type Category from "../entity/data/Category.ts";
import type HttpError from "../http/HttpError.ts";

const router = useRouter();
const POST_REPOSITORY = container.resolve(PostRepository);
const CATEGORY_REPOSITORY = container.resolve(CategoryRepository);
const AUTH_SERVICE = container.resolve(AuthService);

const state = reactive({
  post: new PostRequest()
});

const categories = ref<Category[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const isCheckingAuth = ref(true);

// 컴포넌트 마운트 시 인증 확인 및 카테고리 로드
onMounted(() => {
  checkAuth();
});

// HTTPOnly 쿠키 사용 시 서버 API로 인증 상태 확인
async function checkAuth() {
  try {
    const isAuthenticated = await AUTH_SERVICE.isAuthenticated();

    if (!isAuthenticated) {
      ElMessage.warning('로그인이 필요합니다.');
      router.replace("/admin/login");
      return;
    }

    // 인증 확인 후 카테고리 로드
    await loadCategories();
  } catch (error) {
    ElMessage.warning('세션이 만료되었습니다. 다시 로그인해주세요.');
    router.replace("/amdin/login");
  } finally {
    isCheckingAuth.value = false;
  }
}

// 카테고리 목록 로드
async function loadCategories() {
  isLoading.value = true;
  try {
    categories.value = await CATEGORY_REPOSITORY.getCategories();
  } catch (error) {
    ElMessage.error('카테고리를 불러오는데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
}

// 글 작성 처리
async function handleSubmit() {
  // 입력값 검증
  if (!state.post.title.trim()) {
    ElMessage.warning('제목을 입력해주세요.');
    return;
  }

  if (!state.post.content.trim()) {
    ElMessage.warning('내용을 입력해주세요.');
    return;
  }

  if (!state.post.categoryName) {
    ElMessage.warning('카테고리를 선택해주세요.');
    return;
  }

  isSubmitting.value = true;

  try {
    await POST_REPOSITORY.createPost(state.post);
    ElMessage.success('글이 성공적으로 작성되었습니다.');
    router.replace('/'); // 메인 페이지로 이동
  } catch (error) {
    const httpError = error as HttpError;
    ElMessage.error('글 작성에 실패했습니다: ' + httpError.getMessage());
  } finally {
    isSubmitting.value = false;
  }
}

// 취소 버튼 처리
function handleCancel() {
  router.back();
}

// 폼 초기화
function handleReset() {
  state.post = new PostRequest();
}
</script>

<template>
  <div class="post-write-page">
    <div class="post-write-container">
      <!-- 인증 확인 중 로딩 표시 -->
      <div v-if="isCheckingAuth" class="loading-text">
        인증 확인 중...
      </div>

      <div v-else>
        <h2 class="page-title bold-text">글 작성</h2>

        <el-form class="post-form" label-position="top">
          <!-- 제목 입력 -->
          <el-form-item label="제목" class="bold-text">
            <el-input
                v-model="state.post.title"
                placeholder="제목을 입력해주세요"
                maxlength="100"
                show-word-limit
                clearable
            />
          </el-form-item>

          <!-- 카테고리 선택 -->
          <el-form-item label="카테고리" class="bold-text">
            <el-select
                v-model="state.post.categoryName"
                placeholder="카테고리를 선택해주세요"
                style="width: 100%"
                :loading="isLoading"
            >
              <el-option
                  v-for="category in categories"
                  :key="category.categoryId"
                  :label="category.categoryName"
                  :value="category.categoryName"
              />
            </el-select>
          </el-form-item>

          <!-- 내용 입력 -->
          <el-form-item label="내용" class="bold-text">
            <el-input
                v-model="state.post.content"
                type="textarea"
                placeholder="내용을 입력해주세요"
                :rows="15"
                maxlength="10000"
                show-word-limit
            />
          </el-form-item>

          <!-- 버튼 그룹 -->
          <el-form-item>
            <div class="button-group">
              <el-button
                  type="primary"
                  @click="handleSubmit"
                  :loading="isSubmitting"
                  class="bold-text"
              >
                {{ isSubmitting ? '작성 중...' : '글 작성' }}
              </el-button>

              <el-button
                  @click="handleReset"
                  :disabled="isSubmitting"
                  class="bold-text"
              >
                초기화
              </el-button>

              <el-button
                  @click="handleCancel"
                  :disabled="isSubmitting"
                  class="bold-text"
              >
                취소
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style>

</style>