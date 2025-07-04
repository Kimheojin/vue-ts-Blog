<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue';
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { container } from "tsyringe";
import CategoryRepository from "../../../repository/category/CategoryRepository.ts";
import CategoryAdminRepository from "../../../repository/category/CategoryAdminRepository.ts";
import CategoryAddRequest from "../../../entity/category/request/CategoryRequest.ts";
import type Category from "../../../entity/category/data/Category.ts";
import { useAdminAuth } from "../../../composables/useAdminAuth.ts";
import { useErrorHandler } from '../../../composables/useErrorHandler.ts';

const { customHandleError } = useErrorHandler();

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

// priority로 정렬된 카테고리 목록
const sortedCategories = computed(() => {
  return [...categories.value].sort((a, b) => a.priority - b.priority);
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
    customHandleError(error, '카테고리를 불러오는데 실패했습니다.');
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
    customHandleError(error, '카테고리 추가에 실패했습니다.');
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
    <div class="container">
      <div v-if="isCheckingAuth" class="loading">
        인증 확인 중...
      </div>

      <div v-else>
        <div class="header">
          <h2>카테고리 추가</h2>
          <div class="header-right">
            <span>현재 {{ categories.length }}개의 카테고리</span>
            <el-button @click="goBack">돌아가기</el-button>
          </div>
        </div>

        <div class="content">
          <!-- 추가 폼 -->
          <div class="form-section">
            <div class="form-header">
              <div class="form-icon">ADD</div>
              <div>
                <h3>새 카테고리 추가</h3>
                <p>새로운 카테고리를 생성합니다</p>
              </div>
            </div>

            <el-form label-position="top">
              <el-form-item label="카테고리명">
                <el-input
                    v-model="state.category.categoryName"
                    placeholder="카테고리명을 입력해주세요"
                    clearable
                    maxlength="50"
                    show-word-limit
                    @keyup.enter="handleAdd"
                />
                <div class="input-help">
                  영문, 한글, 숫자를 포함하여 최대 50자까지 입력 가능합니다.
                </div>
              </el-form-item>

              <el-form-item label="우선순위">
                <el-input-number
                    v-model="state.category.priority"
                    :min="0"
                    :max="999999"
                    placeholder="우선순위를 입력해주세요"
                    controls-position="right"
                    style="width: 100%"
                />
                <div class="input-help">
                  숫자가 낮을수록 먼저 표시됩니다. (0이 가장 우선)
                </div>
              </el-form-item>

              <el-form-item>
                <div class="button-group">
                  <el-button
                      type="primary"
                      @click="handleAdd"
                      :loading="isAdding"
                      :disabled="!state.category.categoryName.trim()"
                  >
                    {{ isAdding ? '추가 중...' : '카테고리 추가' }}
                  </el-button>

                  <el-button
                      @click="resetForm"
                      :disabled="isAdding"
                  >
                    초기화
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <!-- 기존 카테고리 목록 -->
          <div class="list-section">
            <div class="list-header">
              <h3>기존 카테고리 목록</h3>
              <span class="count">{{ categories.length }}개</span>
            </div>

            <div v-if="isLoadingCategories" class="loading-small">
              카테고리 목록을 불러오는 중...
            </div>

            <div v-else-if="categories.length === 0" class="empty">
              등록된 카테고리가 없습니다.
            </div>

            <div v-else class="category-list">
              <div
                  v-for="(category, index) in sortedCategories"
                  :key="`category-${category.categoryId}`"
                  class="category-item"
              >
                <div class="category-number">{{ index + 1 }}</div>
                <div class="category-info">
                  <span class="category-name">{{ category.categoryName }}</span>
                  <div class="category-details">
                    <span class="category-id">ID: {{ category.categoryId }}</span>
                    <span class="category-priority">우선순위: {{ category.priority }}</span>
                  </div>
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
.category-add-page {
  padding: 10px;
  min-height: 100vh;
  margin-bottom: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 10px;
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

.loading {
  text-align: center;
  color: #ccc;
  font-size: 18px;
  margin: 60px 0;
  padding: 40px;
  border-radius: 8px;
  border: 1px solid #444;
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.form-section {
  border-radius: 8px;
  border: 1px solid #444;
  padding: 15px;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.form-icon {
  color: #409eff;
  width: 50px;
  height: 50px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid #409eff;
}

.form-header h3 {
  margin: 0 0 5px 0;
  color: #fff;
  font-size: 18px;
}

.form-header p {
  margin: 0;
  color: #ccc;
  font-size: 14px;
}

.input-help {
  font-size: 12px;
  color: #aaa;
  margin-top: 5px;
}

.button-group {
  display: flex;
  gap: 15px;
}

.list-section {
  border-radius: 8px;
  border: 1px solid #444;
  padding: 15px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 15px;
  border-bottom: 1px solid #444;
}

.list-header h3 {
  margin: 0;
  color: #fff;
  font-size: 16px;
}

.count {
  color: #409eff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid #409eff;
}

.loading-small,
.empty {
  text-align: center;
  color: #aaa;
  font-size: 14px;
  padding: 30px 0;
}

.category-list {
  max-height: 400px;
  overflow-y: auto;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
  border: 1px solid #444;
}

.category-item:hover {
  border-color: #666;
}

.category-number {
  width: 30px;
  height: 30px;
  color: #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
  border: 1px solid #666;
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.category-name {
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

.category-id {
  color: #aaa;
  font-size: 11px;
}

@media (max-width: 968px) {
  .content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .category-add-page {
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

  .form-section,
  .list-section {
    padding: 20px;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>