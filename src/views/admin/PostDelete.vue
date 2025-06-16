<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useRouter} from "vue-router";
import {ElMessage, ElMessageBox} from "element-plus";
import {container} from "tsyringe";
import PostAdminRepository from "../../repository/post/PostAdminRepository.ts";
import DeletePostRequest from "../../entity/post/request/DeletePostRequest.ts";
import type PostItem from "../../entity/post/data/PostItem.ts";
import type PostPageResponse from "../../entity/post/response/PostPageResponse.ts";
import {useAdminAuth} from "../../composables/useAdminAuth.ts";

const router = useRouter();
const POST_ADMIN_REPOSITORY = container.resolve(PostAdminRepository);


const posts = ref<PostItem[]>([]);
const isLoading = ref(false);
const isDeleting = ref(false);

const currentPage = ref(0);
const totalPages = ref(0);
const totalElements = ref(0);

const { isCheckingAuth, checkAuth } = useAdminAuth();


onMounted(async () => {
  const isAuth = await checkAuth();
  if (isAuth) {
    await loadPosts();
  }
});

async function loadPosts(page: number = 0) {
  isLoading.value = true;
  try {
    const response: PostPageResponse<PostItem> = await POST_ADMIN_REPOSITORY.getAdminPagePosts(page, 10);
    posts.value = response.content;
    currentPage.value = response.pageNumber;
    totalPages.value = response.totalPages;
    totalElements.value = response.totalElements;
  } catch (error) {
    ElMessage.error('게시글을 불러오는데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
}

async function handleDelete(post: PostItem) {
  try {
    await ElMessageBox.confirm(
        `"${post.title}" 게시글을 삭제하시겠습니까?`,
        '게시글 삭제',
        {
          confirmButtonText: '삭제',
          cancelButtonText: '취소',
          type: 'warning',
        }
    );

    isDeleting.value = true;

    const request = new DeletePostRequest();
    request.postId = post.postId;

    await POST_ADMIN_REPOSITORY.deletePost(request);
    ElMessage.success('게시글이 성공적으로 삭제되었습니다.');

    await loadPosts(currentPage.value);

  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('게시글 삭제에 실패했습니다.');
    }
  } finally {
    isDeleting.value = false;
  }
}

async function handlePageChange(page: number) {
  await loadPosts(page - 1);
}

function handleCancel() {
  router.back();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR');
}

function getStatusText(status: string): string {
  return status === 'PUBLISHED' ? '발행' : '임시저장';
}
</script>

<template>
  <div class="post-delete-page">
    <div class="post-delete-container">
      <div v-if="isCheckingAuth" class="loading-text">
        인증 확인 중...
      </div>

      <div v-else>
        <h2 class="page-title bold-text">게시글 삭제</h2>

        <div v-if="isLoading" class="loading-text">
          게시글 목록을 불러오는 중...
        </div>

        <div v-else-if="posts.length === 0" class="empty-text">
          삭제할 게시글이 없습니다.
        </div>

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
              <div class="post-header">
                <h3 class="post-title">{{ post.title }}</h3>
                <el-button
                    type="danger"
                    size="small"
                    @click="handleDelete(post)"
                    :loading="isDeleting"
                    class="delete-btn"
                >
                  삭제
                </el-button>
              </div>

              <div class="post-meta">
                <span class="post-author">{{ post.memberName }}</span>
                <span class="post-category">{{ post.categoryName }}</span>
                <span class="post-status">{{ getStatusText(post.status) }}</span>
                <span class="post-date">{{ formatDate(post.regDate) }}</span>
              </div>

              <div class="post-content-preview">
                {{ post.content.substring(0, 100) }}{{ post.content.length > 100 ? '...' : '' }}
              </div>
            </div>
          </div>

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