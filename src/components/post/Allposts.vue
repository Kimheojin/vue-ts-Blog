<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { container } from 'tsyringe';
import { ElMessage } from 'element-plus';
import PostRepository from '../../repository/post/PostRepository.ts';
import type PostItem from '../../entity/post/data/PostItem.ts';
import type PostPageResponse from '../../entity/post/response/PostPageResponse.ts';

const router = useRouter();
const POST_REPOSITORY = container.resolve(PostRepository);

const posts = ref<PostItem[]>([]);
const isLoading = ref(true);
const currentPage = ref(1); // Element Plus는 1부터 시작
const totalPages = ref(0);
const totalElements = ref(0);
const pageSize = ref(10);

onMounted(async () => {
  await loadPosts();
});

async function loadPosts(page: number = 0) {
  isLoading.value = true;
  try {
    const response: PostPageResponse<PostItem> = await POST_REPOSITORY.getPagePosts(
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

function goToCategory(categoryName: string) {
  router.push(`/category/${categoryName}`);
}
</script>

<template>
  <div class="all-posts-page">
    <div class="all-posts-container">
      <h2 class="page-title bold-text">전체 게시글</h2>

      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-text">
        게시글을 불러오는 중...
      </div>

      <!-- 게시글이 없는 경우 -->
      <div v-else-if="posts.length === 0" class="empty-text">
        게시글이 없습니다.
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

</style>