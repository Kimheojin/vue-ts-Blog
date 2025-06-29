<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { container } from "tsyringe";
import CategoryRepository from "../../../repository/category/CategoryRepository.ts";
import CategoryDeleteRequest from "../../../entity/category/request/CategoryDeleteRequest.ts";
import type Category from "../../../entity/category/data/Category.ts";
import CategoryAdminRepository from "../../../repository/category/CategoryAdminRepository.ts";
import {useAdminAuth} from "../../../composables/useAdminAuth.ts";

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
    <div class="container">
      <div v-if="isCheckingAuth" class="loading">
        인증 확인 중...
      </div>

      <div v-else>
        <div class="header">
          <h2>카테고리 삭제</h2>
          <div class="header-right">
            <span>총 {{ categories.length }}개의 카테고리</span>
            <el-button @click="handleCancel">돌아가기</el-button>
          </div>
        </div>

        <div v-if="isLoading" class="loading">
          카테고리 목록을 불러오는 중...
        </div>

        <div v-else-if="categories.length === 0" class="empty">
          삭제할 카테고리가 없습니다.
        </div>

        <div v-else>
          <div class="warning-notice">
            <div class="warning-icon">WARNING</div>
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
                  <div class="category-icon">FOLDER</div>
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
.category-delete-page {
  padding: 10px;
  min-height: 100vh;
  margin-bottom: 40px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.warning-notice {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  border: 1px solid #e6a23c;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.warning-icon {
  color: #e6a23c;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid #e6a23c;
  padding: 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.warning-content h4 {
  color: #e6a23c;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.warning-content p {
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
  transition: all 0.3s ease;
}

.category-card:hover {
  border-color: #f56c6c;
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

.category-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .category-delete-page {
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