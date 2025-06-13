<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { container } from "tsyringe";
import CategoryRepository from "../repository/category/CategoryRepository.ts";
import AuthService from "../service/AuthService.ts";
import CategoryRequest from "../entity/request/CategoryRequest.ts";
import type Category from "../entity/data/Category.ts";
import type HttpError from "../http/HttpError.ts";

const router = useRouter()
const CATEGORY_REPOSITORY = container.resolve(CategoryRepository)
const AUTH_SERVICE = container.resolve(AuthService)

const state = reactive({
  category: new CategoryRequest()
})

const existingCategories = ref<Category[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const isCheckingAuth = ref(true);

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
    console.error('인증 확인 중 오류:', error);
    ElMessage.warning('세션이 만료되었습니다. 다시 로그인해주세요.');
    router.replace("/admin/login");
  } finally {
    isCheckingAuth.value = false;
  }
}

// 기존 카테고리 목록 로드
async function loadCategories() {
  isLoading.value = true;
  try {
    existingCategories.value = await CATEGORY_REPOSITORY.getCategories();
  } catch (error) {
    ElMessage.error('카테고리를 불러오는데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
}

// 카테고리 추가 처리
async function handleSubmit() {
  // 입력값 검증
  if (!state.category.categoryName.trim()) {
    ElMessage.warning('카테고리명을 입력해주세요.');
    return;
  }

  // 중복 카테고리 체크
  const isDuplicate = existingCategories.value.some(
      category => category.categoryName === state.category.categoryName.trim()
  );

  if (isDuplicate) {
    ElMessage.warning('이미 존재하는 카테고리명입니다.');
    return;
  }

  isSubmitting.value = true;

  try {
    await CATEGORY_REPOSITORY.addCategory(state.category);
    ElMessage.success('카테고리가 성공적으로 추가되었습니다.');

    // 폼 초기화 및 카테고리 목록 새로고침
    state.category = new CategoryRequest();
    await loadCategories();

  } catch (error) {
    const httpError = error as HttpError;
    ElMessage.error('카테고리 추가에 실패했습니다: ' + httpError.getMessage());
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
  state.category = new CategoryRequest();
}
</script>

<template>
  <div class="category-add-page">
    <div class="category-add-container">
      <!-- 인증 확인 중 로딩 표시 -->
      <div v-if="isCheckingAuth" class="loading-text">
        인증 확인 중...
      </div>

      <div v-else>
        <h2 class="page-title bold-text">카테고리 추가</h2>

        <div class="form-section">
          <el-form class="category-form" label-position="top">
            <!-- 카테고리명 입력 -->
            <el-form-item label="카테고리명" class="bold-text">
              <el-input
                  v-model="state.category.categoryName"
                  placeholder="카테고리명을 입력해주세요"
                  maxlength="50"
                  show-word-limit
                  clearable
                  @keyup.enter="handleSubmit"
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
                  {{ isSubmitting ? '추가 중...' : '카테고리 추가' }}
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

        <!-- 기존 카테고리 목록 -->
        <div class="existing-categories">
          <h3 class="section-title bold-text">기존 카테고리 목록</h3>

          <div v-if="isLoading" class="loading-text">
            카테고리 목록을 불러오는 중...
          </div>

          <div v-else-if="existingCategories.length === 0" class="empty-text">
            등록된 카테고리가 없습니다.
          </div>

          <div v-else class="category-list">
            <el-tag
                v-for="category in existingCategories"
                :key="category.categoryId"
                class="category-tag"
                size="large"
            >
              {{ category.categoryName }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>