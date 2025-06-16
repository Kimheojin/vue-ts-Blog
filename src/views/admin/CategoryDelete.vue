<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { container } from "tsyringe";
import CategoryRepository from "../../repository/category/CategoryRepository.ts";
import AuthService from "../../service/AuthService.ts";
import CategoryDeleteRequest from "../../entity/category/request/CategoryDeleteRequest.ts";
import type Category from "../../entity/category/data/Category.ts";
import CategoryAdminRepository from "../../repository/category/CategoryAdminRepository.ts";

const router = useRouter()
const CATEGORY_REPOSITORY = container.resolve(CategoryRepository)
const CATEGORY_ADMIN_REPOSITORY = container.resolve(CategoryAdminRepository)
const AUTH_SERVICE = container.resolve(AuthService)

const categories = ref<Category[]>([]);
const isLoading = ref(false);
const isDeleting = ref(false);
const isCheckingAuth = ref(true);


onMounted(() => {
  checkAuth();
});

async function checkAuth() {
  try {
    const isAuthenticated = await AUTH_SERVICE.isAuthenticated();

    if (!isAuthenticated) {
      ElMessage.warning('로그인이 필요합니다.');
      router.replace("/admin/login");
      return;
    }

    await loadCategories();
  } catch (error) {
    console.error('인증 확인 중 오류:', error);
    ElMessage.warning('세션이 만료되었습니다. 다시 로그인해주세요.');
    router.replace("/admin/login");
  } finally {
    isCheckingAuth.value = false;
  }
}

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

async function handleDelete(category: Category) {
  try {
    await ElMessageBox.confirm(
        `"${category.categoryName}" 카테고리를 삭제하시겠습니까?`,
        '카테고리 삭제',
        {
          confirmButtonText: '삭제',
          cancelButtonText: '취소',
          type: 'warning',
        }
    );

    isDeleting.value = true;

    const request = new CategoryDeleteRequest();
    request.categoryId = category.categoryId;
    request.categoryName = category.categoryName;

    await CATEGORY_ADMIN_REPOSITORY.DeleteCategory(request);
    ElMessage.success('카테고리가 성공적으로 삭제되었습니다.');

    await loadCategories();

  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('카테고리 삭제에 실패했습니다.');
    }
  } finally {
    isDeleting.value = false;
  }
}

function handleCancel() {
  router.back();
}

</script>

<template>
  <div class="category-delete-page">
    <div class="category-delete-container">
      <div v-if="isCheckingAuth" class="loading-text">
        인증 확인 중...
      </div>

      <div v-else>
        <h2 class="page-title bold-text">카테고리 삭제</h2>

        <div v-if="isLoading" class="loading-text">
          카테고리 목록을 불러오는 중...
        </div>

        <div v-else-if="categories.length === 0" class="empty-text">
          삭제할 카테고리가 없습니다.
        </div>

        <div v-else class="category-list">
          <div
              v-for="category in categories"
              :key="category.categoryId"
              class="category-item"
          >
            <span class="category-name">{{ category.categoryName }}</span>
            <el-button
                type="danger"
                size="small"
                @click="handleDelete(category)"
                :loading="isDeleting"
                class="delete-btn"
            >
              삭제
            </el-button>
          </div>
        </div>

        <div class="button-group">
          <el-button @click="handleCancel" class="bold-text">
            돌아가기
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>

</style>