<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { container } from 'tsyringe';
import { ElMessage } from 'element-plus';
import PostRepository from '../repository/post/PostRepository.ts';
import type PostItem from '../entity/data/PostItem.ts';
import type PostPageResponse from '../entity/response/PostPageResponse.ts';

const route = useRoute();
const POST_REPOSITORY = container.resolve(PostRepository);

const categoryName = ref<string>('');
const posts = ref<PostItem[]>([]);
const isLoading = ref(true);
const currentPage = ref(0);
const totalPages = ref(0);
const totalElements = ref(0);

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
        10
    );

    posts.value = response.content;
    currentPage.value = response.pageNumber;
    totalPages.value = response.totalPages;
    totalElements.value = response.totalElements;
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
  return new Date(dateString).toLocaleDateString('ko-KR');
}
</script>

<template>
  <div class="category-posts-page">
    <div class="category-posts-container">
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
          >
            <h3 class="post-title">{{ post.title }}</h3>
            <div class="post-meta">
              <span class="post-author">{{ post.memberName }}</span>
              <span class="post-date">{{ formatDate(post.regDate) }}</span>
            </div>
            <div class="post-content-preview">
              {{ post.content.substring(0, 150) }}{{ post.content.length > 150 ? '...' : '' }}
            </div>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div class="pagination-container" v-if="totalPages > 1">
          <el-pagination
              v-model:current-page="currentPage"
              :page-size="10"
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
.category-posts-page {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
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
  border-radius: 8px;
  border: 1px solid #444;
}

.post-title {
  font-size: 20px;
  margin: 0 0 10px 0;
  color: #e0e0e0;
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
  line-height: 1.5;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>