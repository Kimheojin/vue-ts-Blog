<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { container } from 'tsyringe';
import { ElMessage } from 'element-plus';
import PostRepository from '../repository/post/PostRepository.ts';
import type PostItem from '../entity/post/data/PostItem.ts';
import type PostPageResponse from '../entity/post/response/PostPageResponse.ts';

const route = useRoute();
const router = useRouter();
const POST_REPOSITORY = container.resolve(PostRepository);

const categoryName = ref<string>('');
const posts = ref<PostItem[]>([]);
const isLoading = ref(true);
const currentPage = ref(1); // Element Plus는 1부터 시작
const totalPages = ref(0);
const totalElements = ref(0);
const pageSize = ref(10);

onMounted(async () => {
  categoryName.value = route.params.categoryName as string;
  await loadPosts();
});

// 라우트 파라미터 변경 감지
watch(() => route.params.categoryName, async (newCategoryName) => {
  if (newCategoryName) {
    categoryName.value = newCategoryName as string;
    await loadPosts(0); // 새 카테고리로 변경 시 첫 페이지부터
  }
});

async function loadPosts(page: number = 0) {
  isLoading.value = true;
  try {
    const response: PostPageResponse<PostItem> = await POST_REPOSITORY.getCategoryPagePosts(
        categoryName.value,
        page,
        pageSize.value
    );

    posts.value = response.content;
    totalPages.value = response.totalPages;
    totalElements.value = response.totalElements;
    currentPage.value = page + 1; // 서버는 0부터, UI는 1부터
  } catch (error) {
    console.error('게시글을 불러오는 중 오류:', error);
    ElMessage.error('게시글을 불러오는데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
}

async function handlePageChange(page: number) {
  await loadPosts(page - 1); // Element Plus는 1부터 시작, 서버는 0부터 시작
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function goToPost(postId: number) {
  // 단일 게시글 보기 페이지로 이동
  router.push(`/post/${postId}`);
}

function goToAllPosts() {
  router.push('/posts');
}

function goToCategory(categoryName: string) {
  router.push(`/category/${categoryName}`);
}
</script>

<template>
  <div class="category-posts-page">
    <div class="category-posts-container">
      <!-- 네비게이션 버튼 -->
      <div class="navigation-buttons">
        <el-button @click="goToAllPosts" type="info">← 전체 글 보기</el-button>
      </div>

      <h2 class="page-title bold-text">{{ categoryName }} 카테고리</h2>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-text">
        게시글을 불러오는 중...
      </div>

      <!-- 게시글이 없는 경우 -->
      <div v-else-if="posts.length === 0" class="empty-text">
        이 카테고리에는 게시글이 없습니다.
      </div>

      <!-- 게시글 목록 -->
      <div v-else>
        <div class="posts-info">
          총 {{ totalElements }}개의 게시글
        </div>

        <div class="posts-list">
          <div
              v-for="post in posts"
              :key="post.postId"
              class="post-item"
              @click="goToPost(post.postId)"
          >
            <div class="post-header">
              <h3 class="post-title">{{ post.title }}</h3>
              <el-tag
                  class="category-tag"
                  type="info"
                  @click.stop="goToCategory(post.categoryName)"
              >
                {{ post.categoryName }}
              </el-tag>
            </div>

            <div class="post-meta">
              <span class="post-author">{{ post.memberName }}</span>
              <span class="post-date">{{ formatDate(post.regDate) }}</span>
            </div>

            <div class="post-content-preview">
              {{ post.content.substring(0, 200) }}{{ post.content.length > 200 ? '...' : '' }}
            </div>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div class="pagination-container" v-if="totalPages > 1">
          <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="totalElements"
              layout="prev, pager, next"
              @current-change="handlePageChange"
          />
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

.category-posts-page {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'NanumBarunPen', sans-serif;
}

.navigation-buttons {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  margin-bottom: 20px;
  text-align: center;
  color: #e0e0e0;
}

.loading-text, .empty-text {
  text-align: center;
  color: #b0b0b0;
  font-size: 16px;
  margin: 40px 0;
}

.posts-info {
  color: #b0b0b0;
  margin-bottom: 20px;
  font-size: 14px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-item {
  background-color: #3a3a3a;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #444;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-item:hover {
  background-color: #424242;
  border-color: #555;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 15px;
}

.post-title {
  font-size: 20px;
  margin: 0;
  color: #e0e0e0;
  flex: 1;
  font-family: 'NanumBarunPenBold', sans-serif;
}

.category-tag {
  cursor: pointer;
  flex-shrink: 0;
}

.category-tag:hover {
  background-color: #409eff !important;
  color: white !important;
}

.post-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  color: #b0b0b0;
  font-size: 14px;
}

.post-content-preview {
  color: #d0d0d0;
  line-height: 1.6;
  white-space: pre-wrap;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 다크 모드 Element Plus 스타일 조정 */
:deep(.el-pagination) {
  --el-pagination-font-size: 14px;
  --el-pagination-bg-color: #2c2c2c;
  --el-pagination-text-color: #e0e0e0;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next),
:deep(.el-pagination .el-pager li) {
  background-color: #3a3a3a;
  color: #e0e0e0;
  border: 1px solid #444;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover),
:deep(.el-pagination .el-pager li:hover) {
  background-color: #424242;
  color: #ffffff;
}

:deep(.el-pagination .el-pager li.is-active) {
  background-color: #409eff;
  color: #ffffff;
}

@media (max-width: 600px) {
  .navigation-buttons {
    justify-content: center;
  }

  .post-header {
    flex-direction: column;
    gap: 10px;
  }

  .category-tag {
    align-self: flex-start;
  }

  .post-title {
    font-size: 18px;
  }

  .post-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style>