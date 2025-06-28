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
    <div class="container">
      <div v-if="isCheckingAuth" class="loading">
        인증 확인 중...
      </div>

      <div v-else>
        <!-- 카테고리 목록 화면 -->
        <div v-if="!selectedCategory">
          <div class="header">
            <h2>카테고리 수정 - 카테고리 선택</h2>
            <div class="header-right">
              <span>총 {{ categories.length }}개의 카테고리</span>
              <el-button @click="goBack">돌아가기</el-button>
            </div>
          </div>

          <div v-if="isLoadingCategories" class="loading">
            카테고리 목록을 불러오는 중...
          </div>

          <div v-else-if="categories.length === 0" class="empty">
            수정할 카테고리가 없습니다.
          </div>

          <div v-else>
            <div class="info-notice">
              <div class="info-icon">INFO</div>
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
                    <div class="category-icon">FOLDER</div>
                    <div class="category-details">
                      <h3 class="category-name">{{ category.categoryName }}</h3>
                      <span class="category-id">ID: {{ category.categoryId }}</span>
                    </div>
                  </div>
                  <div class="edit-indicator">EDIT</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 수정 폼 화면 -->
        <div v-else-if="selectedCategory">
          <div class="header">
            <h2>카테고리 수정</h2>
            <div class="header-right">
              <el-button @click="backToCategoryList">카테고리 목록</el-button>
            </div>
          </div>

          <!-- 선택된 카테고리 정보 -->
          <div class="selected-info">
            <div class="selected-header">
              <div class="selected-icon">EDIT</div>
              <div>
                <h3>수정 중인 카테고리</h3>
                <p>기존: "{{ selectedCategory?.['categoryName'] }}"</p>
              </div>
            </div>
          </div>

          <!-- 수정 폼 -->
          <div class="form-section">
            <el-form label-position="top">
              <el-form-item label="카테고리 ID">
                <el-input
                    :value="selectedCategory.categoryId"
                    disabled
                    placeholder="자동 생성"
                />
              </el-form-item>

              <el-form-item label="카테고리명">
                <el-input
                    v-model="state.category.categoryName"
                    placeholder="새로운 카테고리명을 입력해주세요"
                    clearable
                    maxlength="50"
                    show-word-limit
                />
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
                  >
                    {{ isModifying ? '수정 중...' : '카테고리 수정' }}
                  </el-button>

                  <el-button
                      @click="backToCategoryList"
                      :disabled="isModifying"
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
.category-modify-page {
  padding: 20px;
  min-height: 100vh;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #444;
}

.header h2 {
  margin: 0;
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-right span {
  color: #ccc;
  font-size: 14px;
}

.loading,
.empty {
  text-align: center;
  color: #ccc;
  font-size: 18px;
  margin: 60px 0;
  padding: 40px;
  border-radius: 8px;
  border: 1px solid #444;
}

.info-notice {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  border: 1px solid #66b1ff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.info-icon {
  color: #66b1ff;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid #66b1ff;
  padding: 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.info-content h4 {
  color: #66b1ff;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.info-content p {
  color: #ccc;
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
  border-radius: 8px;
  border: 1px solid #444;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  border-color: #66b1ff;
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
  font-size: 10px;
  font-weight: bold;
  color: #ccc;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #666;
  border-radius: 4px;
  flex-shrink: 0;
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-name {
  color: #fff;
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.category-id {
  color: #aaa;
  font-size: 12px;
}

.edit-indicator {
  color: #66b1ff;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid #66b1ff;
  padding: 4px 8px;
  border-radius: 4px;
}

.selected-info {
  border-radius: 8px;
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
  color: #66b1ff;
  font-size: 12px;
  font-weight: bold;
  width: 50px;
  height: 50px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #66b1ff;
}

.selected-header h3 {
  margin: 0 0 5px 0;
  color: #fff;
  font-size: 18px;
}

.selected-header p {
  margin: 0;
  color: #ccc;
  font-size: 14px;
}

.form-section {
  border-radius: 8px;
  border: 1px solid #444;
  padding: 30px;
}

.input-help {
  font-size: 12px;
  color: #aaa;
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

  .header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .header-right {
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