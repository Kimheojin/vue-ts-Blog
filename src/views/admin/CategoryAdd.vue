<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { container } from "tsyringe";
import CategoryRepository from "../../repository/category/CategoryRepository.ts";
import CategoryAdminRepository from "../../repository/category/CategoryAdminRepository.ts";
import CategoryAddRequest from "../../entity/category/request/CategoryRequest.ts";
import type Category from "../../entity/category/data/Category.ts";
import type HttpError from "../../http/HttpError.ts";
import {useAdminAuth} from "../../composables/useAdminAuth.ts";

const router = useRouter();
const CATEGORY_REPOSITORY = container.resolve(CategoryRepository);
const CATEGORY_ADMIN_REPOSITORY = container.resolve(CategoryAdminRepository);

const { isCheckingAuth, checkAuth } = useAdminAuth();

const categories = ref<Category[]>([]);
const isLoadingCategories = ref(false);
const isAdding = ref(false);

const state = reactive({
  category: new CategoryAddRequest()
});

onMounted(async () => {
  const isAuth = await checkAuth();
  if (isAuth) {
    await loadCategories();
  }
});

async function loadCategories() {
  isLoadingCategories.value = true;
  try {
    categories.value = await CATEGORY_REPOSITORY.getCategories();
  } catch (error) {
    console.error('카테고리를 불러오는 중 오류:', error);
    ElMessage.error('카테고리를 불러오는데 실패했습니다.');
  } finally {
    isLoadingCategories.value = false;
  }
}

async function handleAdd() {
  if (!state.category.categoryName.trim()) {
    ElMessage.warning('카테고리명을 입력해주세요.');
    return;
  }

  // 중복 체크
  const isDuplicate = categories.value.some(cat =>
      cat.categoryName === state.category.categoryName.trim()
  );

  if (isDuplicate) {
    ElMessage.warning('이미 존재하는 카테고리명입니다.');
    return;
  }

  isAdding.value = true;

  try {
    state.category.categoryName = state.category.categoryName.trim();
    await CATEGORY_ADMIN_REPOSITORY.addCategory(state.category);
    ElMessage.success('카테고리가 성공적으로 추가되었습니다.');

    // 폼 초기화
    state.category = new CategoryAddRequest();
    await loadCategories();

  } catch (error) {
    const httpError = error as HttpError;
    console.error('카테고리 추가 중 오류:', error);
    ElMessage.error('카테고리 추가에 실패했습니다: ' + httpError.getMessage());
  } finally {
    isAdding.value = false;
  }
}

function resetForm() {
  state.category = new CategoryAddRequest();
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="category-add-page">
    <div class="category-add-container">
      <div v-if="isCheckingAuth" class="loading-text">
        인증 확인 중...
      </div>

      <div v-else>
        <div class="page-header">
          <h2 class="page-title bold-text">카테고리 추가</h2>
          <div class="header-actions">
            <span class="categories-count">현재 {{ categories.length }}개의 카테고리</span>
            <el-button @click="goBack" class="bold-text">돌아가기</el-button>
          </div>
        </div>

        <div class="content-layout">
          <!-- 추가 폼 -->
          <div class="form-section">
            <div class="form-header">
              <div class="form-icon">➕</div>
              <div>
                <h3 class="form-title">새 카테고리 추가</h3>
                <p class="form-subtitle">새로운 카테고리를 생성합니다</p>
              </div>
            </div>

            <el-form class="add-form" label-position="top">
              <el-form-item label="카테고리명" class="bold-text">
                <el-input
                    v-model="state.category.categoryName"
                    placeholder="카테고리명을 입력해주세요"
                    clearable
                    maxlength="50"
                    show-word-limit
                    @keyup.enter="handleAdd"
                >
                  <template #prefix>
                    <span style="color: #888;">📁</span>
                  </template>
                </el-input>
                <div class="input-help">
                  영문, 한글, 숫자를 포함하여 최대 50자까지 입력 가능합니다.
                </div>
              </el-form-item>

              <el-form-item>
                <div class="button-group">
                  <el-button
                      type="primary"
                      @click="handleAdd"
                      :loading="isAdding"
                      :disabled="!state.category.categoryName.trim()"
                      class="bold-text"
                  >
                    {{ isAdding ? '추가 중...' : '카테고리 추가' }}
                  </el-button>

                  <el-button
                      @click="resetForm"
                      :disabled="isAdding"
                      class="bold-text"
                  >
                    초기화
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <!-- 기존 카테고리 목록 -->
          <div class="existing-categories">
            <div class="existing-header">
              <h3 class="existing-title bold-text">기존 카테고리 목록</h3>
              <span class="existing-count">{{ categories.length }}개</span>
            </div>

            <div v-if="isLoadingCategories" class="loading-text-small">
              카테고리 목록을 불러오는 중...
            </div>

            <div v-else-if="categories.length === 0" class="empty-text-small">
              등록된 카테고리가 없습니다.
            </div>

            <div v-else class="categories-list">
              <div
                  v-for="(category, index) in categories"
                  :key="`category-${category.categoryId}`"
                  class="category-item"
              >
                <div class="category-number">{{ index + 1 }}</div>
                <div class="category-info">
                  <span class="category-name">{{ category.categoryName }}</span>
                  <span class="category-id">ID: {{ category.categoryId }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 나눔바른펜 폰트 import */
@import url('https://hangeul.pstatic.net/hangeul_static/css/nanum-barun-pen.css');

.bold-text {
  font-family: 'NanumBarunPenBold', sans-serif;
}

.category-add-page {
  padding: 20px;
  font-family: 'NanumBarunPen', sans-serif;
  background-color: #1a1a1a;
  min-height: 100vh;
  color: #e0e0e0;
}

.category-add-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #444;
}

.page-title {
  font-size: 28px;
  color: #e0e0e0;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.categories-count {
  color: #b0b0b0;
  font-size: 16px;
}

.loading-text {
  text-align: center;
  color: #b0b0b0;
  font-size: 18px;
  margin: 60px 0;
  padding: 40px;
  background-color: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #444;
}

.content-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.form-section {
  background-color: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #67c23a;
  padding: 30px;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.form-icon {
  font-size: 32px;
  background-color: #67c23a;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-title {
  color: #e0e0e0;
  margin: 0 0 5px 0;
  font-size: 20px;
}

.form-subtitle {
  color: #b0b0b0;
  margin: 0;
  font-size: 14px;
}

.add-form .el-form-item {
  margin-bottom: 25px;
}

.input-help {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.button-group {
  display: flex;
  gap: 15px;
}

.existing-categories {
  background-color: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #444;
  padding: 30px;
}

.existing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #444;
}

.existing-title {
  color: #e0e0e0;
  margin: 0;
  font-size: 18px;
}

.existing-count {
  background-color: #67c23a;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.loading-text-small,
.empty-text-small {
  text-align: center;
  color: #888;
  font-size: 14px;
  padding: 30px 0;
}

.categories-list {
  max-height: 400px;
  overflow-y: auto;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  background-color: #1e1e1e;
  border: 1px solid #333;
  transition: all 0.2s ease;
}

.category-item:hover {
  background-color: #2e2e2e;
  border-color: #555;
}

.category-number {
  width: 30px;
  height: 30px;
  background-color: #444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: #ccc;
  flex-shrink: 0;
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.category-name {
  color: #e0e0e0;
  font-size: 14px;
  font-weight: bold;
}

.category-id {
  color: #888;
  font-size: 11px;
}

@media (max-width: 968px) {
  .content-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .category-add-page {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .form-section,
  .existing-categories {
    padding: 20px;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>