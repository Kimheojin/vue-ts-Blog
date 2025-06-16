<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {container} from "tsyringe";
import CategoryRepository from "../../repository/category/CategoryRepository.ts";
import CategoryModifyRequest from "../../entity/category/request/CategoryModifyRequest.ts";
import type Category from "../../entity/category/data/Category.ts";
import CategoryAdminRepository from "../../repository/category/CategoryAdminRepository.ts";
import {useAdminAuth} from "../../composables/useAdminAuth.ts";

const router = useRouter()
const CATEGORY_REPOSITORY = container.resolve(CategoryRepository)
const CATEGORY_ADMIN_REPOSITORY = container.resolve(CategoryAdminRepository)


const categories = ref<Category[]>([]);
const isLoading = ref(false);
const isModifying = ref(false);
const selectedCategory = ref<Category | null>(null);
const newCategoryName = ref('');
const { isCheckingAuth, checkAuth } = useAdminAuth();


onMounted(async () => {
  const isAuth = await checkAuth();
  if (isAuth) {
    await loadCategories();
  }
});


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

function handleSelectCategory(category: Category) {
  selectedCategory.value = category;
  newCategoryName.value = category.categoryName;
}

async function handleModify() {
  if (!selectedCategory.value) {
    ElMessage.warning('수정할 카테고리를 선택해주세요.');
    return;
  }

  if (!newCategoryName.value.trim()) {
    ElMessage.warning('새 카테고리명을 입력해주세요.');
    return;
  }

  // 중복 카테고리 체크
  const isDuplicate = categories.value.some(
      category =>
          category.categoryId !== selectedCategory.value!.categoryId &&
          category.categoryName === newCategoryName.value.trim()
  );

  if (isDuplicate) {
    ElMessage.warning('이미 존재하는 카테고리명입니다.');
    return;
  }

  isModifying.value = true;

  try {
    const request = new CategoryModifyRequest();
    request.categoryId = selectedCategory.value.categoryId;
    request.wantCategoryName = newCategoryName.value.trim();

    await CATEGORY_ADMIN_REPOSITORY.ModifyCategory(request);
    ElMessage.success('카테고리가 성공적으로 수정되었습니다.');

    // 폼 초기화 및 카테고리 목록 새로고침
    selectedCategory.value = null;
    newCategoryName.value = '';
    await loadCategories();

  } catch (error) {
    ElMessage.error('카테고리 수정에 실패했습니다.');
  } finally {
    isModifying.value = false;
  }
}

function handleCancel() {
  router.back();
}

function handleReset() {
  selectedCategory.value = null;
  newCategoryName.value = '';
}
</script>

<template>
  <div class="category-modify-page">
    <div class="category-modify-container">
      <div v-if="isCheckingAuth" class="loading-text">
        인증 확인 중...
      </div>

      <div v-else>
        <h2 class="page-title bold-text">카테고리 수정</h2>

        <div v-if="isLoading" class="loading-text">
          카테고리 목록을 불러오는 중...
        </div>

        <div v-else-if="categories.length === 0" class="empty-text">
          수정할 카테고리가 없습니다.
        </div>

        <div v-else>
          <!-- 카테고리 선택 -->
          <div class="section">
            <h3 class="section-title bold-text">수정할 카테고리 선택</h3>
            <div class="category-list">
              <el-button
                  v-for="category in categories"
                  :key="category.categoryId"
                  @click="handleSelectCategory(category)"
                  :type="selectedCategory?.categoryId === category.categoryId ? 'primary' : 'default'"
                  class="category-btn"
              >
                {{ category.categoryName }}
              </el-button>
            </div>
          </div>

          <!-- 수정 폼 -->
          <div v-if="selectedCategory" class="form-section">
            <h3 class="section-title bold-text">카테고리 정보 수정</h3>

            <el-form class="modify-form" label-position="top">
              <el-form-item label="현재 카테고리명" class="bold-text">
                <el-input
                    :value="selectedCategory.categoryName"
                    disabled
                />
              </el-form-item>

              <el-form-item label="새 카테고리명" class="bold-text">
                <el-input
                    v-model="newCategoryName"
                    placeholder="새 카테고리명을 입력해주세요"
                    maxlength="50"
                    show-word-limit
                    clearable
                    @keyup.enter="handleModify"
                />
              </el-form-item>

              <el-form-item>
                <div class="button-group">
                  <el-button
                      type="primary"
                      @click="handleModify"
                      :loading="isModifying"
                      class="bold-text"
                  >
                    {{ isModifying ? '수정 중...' : '카테고리 수정' }}
                  </el-button>

                  <el-button
                      @click="handleReset"
                      :disabled="isModifying"
                      class="bold-text"
                  >
                    초기화
                  </el-button>

                  <el-button
                      @click="handleCancel"
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

</style>