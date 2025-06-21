<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { container } from "tsyringe";
import CategoryRepository from "../../repository/category/CategoryRepository.ts";

import CategoryDeleteRequest from "../../entity/category/request/CategoryDeleteRequest.ts";
import type Category from "../../entity/category/data/Category.ts";
import CategoryAdminRepository from "../../repository/category/CategoryAdminRepository.ts";
import {useAdminAuth} from "../../composables/useAdminAuth.ts";

const router = useRouter()
const CATEGORY_REPOSITORY = container.resolve(CategoryRepository)
const CATEGORY_ADMIN_REPOSITORY = container.resolve(CategoryAdminRepository)
const { isCheckingAuth, checkAuth } = useAdminAuth();

const categories = ref<Category[]>([]);
const isLoading = ref(false);
const isDeleting = ref(false);

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
    console.error('카테고리를 불러오는 중 오류:', error);
    ElMessage.error('카테고리를 불러오는데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
}

async function handleDelete(category: Category) {
  try {
    await ElMessageBox.confirm(
        `"${category.categoryName}" 카테고리를 삭제하시겠습니까?\n\n삭제된 카테고리는 복구할 수 없습니다.`,
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
      console.error('카테고리 삭제 중 오류:', error);
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
        <div class="page-header">
          <h2 class="page-title bold-text">카테고리 삭제</h2>
          <div class="header-actions">
            <span class="categories-count">총 {{ categories.length }}개의 카테고리</span>
            <el-button @click="handleCancel" class="bold-text">돌아가기</el-button>
          </div>
        </div>

        <div v-if="isLoading" class="loading-text">
          카테고리 목록을 불러오는 중...
        </div>

        <div v-else-if="categories.length === 0" class="empty-text">
          삭제할 카테고리가 없습니다.
        </div>

        <div v-else>
          <div class="warning-notice">
            <div class="warning-icon">⚠️</div>
            <div class="warning-content">
              <h4>주의사항</h4>
              <p>카테고리를 삭제하면 해당 카테고리에 속한 모든 게시글의 카테고리 정보가 영향을 받을 수 있습니다. 삭제 전에 신중히 확인해주세요.</p>
            </div>
          </div>

          <div class="categories-grid">
            <div
                v-for="category in categories"
                :key="`category-${category.categoryId}`"
                class="category-card"
            >
              <div class="category-content">
                <div class="category-info">
                  <div class="category-icon">📁</div>
                  <div class="category-details">
                    <h3 class="category-name">{{ category.categoryName }}</h3>
                    <span class="category-id">ID: {{ category.categoryId }}</span>
                  </div>
                </div>

                <div class="category-actions">
                  <el-button
                      type="danger"
                      size="small"
                      @click="handleDelete(category)"
                      :loading="isDeleting"
                      class="delete-btn bold-text"
                  >
                    삭제
                  </el-button>
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

.category-delete-page {
  padding: 20px;
  font-family: 'NanumBarunPen', sans-serif;
  background-color: #1a1a1a;
  min-height: 100vh;
  color: #e0e0e0;
}

.category-delete-container {
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

.warning-notice {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  background-color: #2a1f1a;
  border: 1px solid #e6a23c;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
}

.warning-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.warning-content h4 {
  color: #e6a23c;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.warning-content p {
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
  overflow: hidden;
  transition: all 0.3s ease;
}

.category-card:hover {
  border-color: #f56c6c;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.2);
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

.category-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.delete-btn:hover {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

/* 단일 컬럼 레이아웃을 위한 미디어 쿼리 */
@media (max-width: 768px) {
  .category-delete-page {
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

  .warning-notice {
    flex-direction: column;
    gap: 10px;
  }

  .category-content {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .category-info {
    justify-content: flex-start;
  }

  .category-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .category-content {
    padding: 15px;
  }

  .warning-notice {
    padding: 15px;
  }
}
</style>