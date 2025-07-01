<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { container } from 'tsyringe';
import PostRepository from '../../repository/post/PostRepository.ts';
import PostList from './PostList.vue';
import type PostItem from '../../entity/post/data/PostItem.ts';
import type PostPageResponse from '../../entity/post/response/PostPageResponse.ts';
import { useErrorHandler } from '../../composables/useErrorHandler.ts';

const { customHandleError } = useErrorHandler();

const route = useRoute();
const POST_REPOSITORY = container.resolve(PostRepository);

const categoryName = ref<string>('');
const posts = ref<PostItem[]>([]);
const isLoading = ref(true);
const currentPage = ref(1);
const totalPages = ref(0);
const totalElements = ref(0);
const pageSize = ref(5);

const title = computed(() => `${categoryName.value} 카테고리`);

onMounted(async () => {
  categoryName.value = route.params.categoryName as string;
  await loadPosts();
});

// 라우트 파라미터 변경 감지
watch(() => route.params.categoryName, async (newCategoryName) => {
  if (newCategoryName) {
    categoryName.value = newCategoryName as string;
    await loadPosts(0);
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
    currentPage.value = page + 1;
  } catch (error) {
    customHandleError(error, '게시글을 불러오는데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
}

async function handlePageChange(page: number) {
  await loadPosts(page - 1);
}
</script>
<template>
  <div class="category-posts-page">
    <PostList
        :posts="posts"
        :is-loading="isLoading"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-elements="totalElements"
        :title="title"
        empty-message="이 카테고리에는 게시글이 없습니다."
        :show-all-posts-button="true"
        @page-change="handlePageChange"
    />
  </div>
</template>

