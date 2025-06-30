
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { container } from 'tsyringe';
import PostRepository from '../../repository/post/PostRepository.ts';
import type PostItem from '../../entity/post/data/PostItem.ts';
import type PostPageResponse from '../../entity/post/response/PostPageResponse.ts';
import PostList from "./PostList.vue";
import { useErrorHandler } from '../../composables/useErrorHandler.ts';

const { customHandleError } = useErrorHandler();

const POST_REPOSITORY = container.resolve(PostRepository);

const posts = ref<PostItem[]>([]);
const isLoading = ref(true);
const currentPage = ref(1);
const totalPages = ref(0);
const totalElements = ref(0);
const pageSize = ref(5);

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
  <div class="all-posts-page">
    <PostList
        :posts="posts"
        :is-loading="isLoading"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-elements="totalElements"
        title="전체 게시글"
        empty-message="게시글이 없습니다."
        @page-change="handlePageChange"
    />
  </div>
</template>

