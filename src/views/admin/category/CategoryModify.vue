<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { container } from "tsyringe";
import CategoryRepository from "../../../repository/category/CategoryRepository.ts";
import CategoryAdminRepository from "../../../repository/category/CategoryAdminRepository.ts";
import CategoryModifyRequest from "../../../entity/category/request/CategoryModifyRequest.ts";
import type Category from "../../../entity/category/data/Category.ts";
import type HttpError from "../../../http/HttpError.ts";
import {useAdminAuth} from "../../../composables/useAdminAuth.ts";

const router = useRouter();
const CATEGORY_REPOSITORY = container.resolve(CategoryRepository);
const CATEGORY_ADMIN_REPOSITORY = container.resolve(CategoryAdminRepository);

const { isCheckingAuth, checkAuth } = useAdminAuth();

const categories = ref<Category[]>([]);
const selectedCategory = ref<Category | null>(null);
const isLoadingCategories = ref(false);
const isModifying = ref(false);

const state = reactive({
  category: new CategoryModifyRequest()
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

function selectCategory(category: Category) {
  selectedCategory.value = category;
  state.category.categoryId = category.categoryId;
  state.category.categoryName = category.categoryName;
}

async function handleModify() {
  if (!selectedCategory.value) {
    ElMessage.warning('수정할 카테고리를 선택해주세요.');
    return;
  }

  if (!state.category.categoryName.trim()) {
    ElMessage.warning('카테고리명을 입력해주세요.');
    return;
  }

  if (state.category.categoryName === selectedCategory.value.categoryName) {
    ElMessage.warning('변경된 내용이 없습니다.');
    return;
  }

  // 중복 체크
  const isDuplicate = categories.value.some(cat =>
      cat.categoryId !== selectedCategory.value!.categoryId &&
      cat.categoryName === state.category.categoryName.trim()
  );

  if (isDuplicate) {
    ElMessage.warning('이미 존재하는 카테고리명입니다.');
    return;
  }

  isModifying.value = true;

  try {
    await CATEGORY_ADMIN_REPOSITORY.ModifyCategory(state.category);
    ElMessage.success('카테고리가 성공적으로 수정되었습니다.');

    backToCategoryList();
    await loadCategories();

  } catch (error) {
    const httpError = error as HttpError;
    console.error('카테고리 수정 중 오류:', error);
    ElMessage.error('카테고리 수정에 실패했습니다: ' + httpError.getMessage());
  } finally {
    isModifying.value = false;
  }
}

function backToCategoryList() {
  selectedCategory.value = null;
  state.category = new CategoryModifyRequest();
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="category-modify-page">
    <div class="category-modify-container">
      <div v-if="isCheckingAuth" class="loading-text">
        인증 확인 중...
      </div>

      <div v-else>
        <!-- 카테고리 목록 화면 -->
        <div v-if="!selectedCategory">
          <div class="page-header">
            <h2 class="page-title bold-text">카테고리 수정 - 카테고리 선택</h2>
            <div class="header-actions">
              <span class="categories-count">총 {{ categories.length }}개의 카테고리</span>
              <el-button @click="goBack" class="bold-text">돌아가기</el-button>
            </div>
          </div>

          <div v-if="isLoadingCategories" class="loading-text">
            카테고리 목록을 불러오는 중...
          </div>

          <div v-else-if="categories.length === 0" class="empty-text">
            수정할 카테고리가 없습니다.
          </div>

          <div v-else>
            <div class="info-notice">
              <div class="info-icon">ℹ️</div>
              <div class="info-content">
                <h4>카테고리 수정</h4>
                <p>수정하려는 카테고리를 선택해주세요. 카테고리명을 변경할 수 있습니다.</p>
              </div>
            </div>

            <div class="categories-grid">
              <div
                  v-for="category in categories"
                  :key="`category-${category.categoryId}`"
                  class="category-card"
                  @click="selectCategory(category)"
              >
                <div class="category-content">
                  <div class="category-info">
                    <div class="category-icon">📁</div>
                    <div class="category-details">
                      <h3 class="category-name">{{ category.categoryName }}</h3>
                      <span class="category-id">ID: {{ category.categoryId }}</span>
                    </div>
                  </div>
                  <div class="edit-indicator">✏️</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 수정 폼 화면 -->
        <div v-else>
          <div class="page-header">
            <h2 class="page-title bold-text">카테고리 수정</h2>
            <div class="header-actions">
              <el-button @click="backToCategoryList" class="bold-text">카테고리 목록</el-button>
            </div>
          </div>

          <!-- 선택된 카테고리 정보 -->
          <div class="selected-category-info">
            <div class="selected-header">
              <div class="selected-icon">📝</div>
              <div>
                <h3 class="selected-title">수정 중인 카테고리</h3>
                <p class="selected-subtitle">기존: "{{ selectedCategory?.['categoryName'] }}"</p>
              </div>
            </div>
          </div>

          <!-- 수정 폼 -->
          <div class="form-section">
            <el-form class="modify-form" label-position="top">
              <el-form-item label="카테고리 ID" class="bold-text">
                <el-input
                    :value="selectedCategory.categoryId"
                    disabled
                    placeholder="자동 생성"
                >
                  <template #prefix>
                    <span style="color: #888;">ID:</span>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item label="카테고리명" class="bold-text">
                <el-input
                    v-model="state.category.categoryName"
                    placeholder="새로운 카테고리명을 입력해주세요"
                    clearable
                    maxlength="50"
                    show-word-limit
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
                      @click="handleModify"
                      :loading="isModifying"
                      :disabled="!state.category.categoryName.trim()"
                      class="bold-text"
                  >
                    {{ isModifying ? '수정 중...' : '카테고리 수정' }}
                  </el-button>

                  <el-button
                      @click="backToCategoryList"
                      :disabled="isModifying"
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
    </div>
  </div>
</template>

<style scoped>
/* 나눔바른펜 폰트 import */
@import url('https://hangeul.pstatic.net/hangeul_static/css/nanum-barun-pen.css');

.bold-text {
  font-family: 'NanumBarunPenBold', sans-serif;
}

.category-modify-page {
  padding: 20px;
  font-family: 'NanumBarunPen', sans-serif;
  background-color: #1a1a1a;
  min-height: 100vh;
  color: #e0e0e0;
}

.category-modify-container {
  max-width: 1000px;
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

.loading-text,
.empty-text {
  text-align: center;
  color: #b0b0b0;
  font-size: 18px;
  margin: 60px 0;
  padding: 40px;
  background-color: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #444;
}

.info-notice {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  background-color: #1a2a2a;
  border: 1px solid #66b1ff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.info-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.info-content h4 {
  color: #66b1ff;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.info-content p {
  color: #d0d0d0;
  margin: 0;
  line-height: 1.5;
  font-size: 14px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.category-card {
  background-color: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #444;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.category-card:hover {
  border-color: #66b1ff;
  box-shadow: 0 4px 12px rgba(102, 177, 255, 0.2);
  transform: translateY(-2px);
}

.category-content {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.category-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3a3a3a;
  border-radius: 8px;
  flex-shrink: 0;
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-name {
  color: #e0e0e0;
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.category-id {
  color: #888;
  font-size: 12px;
}

.edit-indicator {
  font-size: 20px;
  opacity: 0.7;
}

.selected-category-info {
  background-color: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #66b1ff;
  padding: 20px;
  margin-bottom: 30px;
}

.selected-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.selected-icon {
  font-size: 32px;
  background-color: #66b1ff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-title {
  color: #e0e0e0;
  margin: 0 0 5px 0;
  font-size: 18px;
}

.selected-subtitle {
  color: #b0b0b0;
  margin: 0;
  font-size: 14px;
}

.form-section {
  background-color: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #444;
  padding: 30px;
}

.modify-form .el-form-item {
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
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .category-modify-page {
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

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .info-notice {
    flex-direction: column;
    gap: 10px;
  }

  .selected-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .form-section {
    padding: 20px;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>