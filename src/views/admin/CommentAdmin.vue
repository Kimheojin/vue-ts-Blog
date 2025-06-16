<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { container } from "tsyringe";
import CommentAdminRepository from "../../repository/comment/CommentAdminRepository.ts";
import PostAdminRepository from "../../repository/post/PostAdminRepository.ts";
import AuthService from "../../service/AuthService.ts";
import CommentDeleteRequest from "../../entity/comment/request/CommentDeleteRequest.ts";
import type Comment from "../../entity/comment/data/Comment.ts";
import type PostItem from "../../entity/post/data/PostItem.ts";
import type PostPageResponse from "../../entity/post/response/PostPageResponse.ts";

const router = useRouter();
const COMMENT_ADMIN_REPOSITORY = container.resolve(CommentAdminRepository);
const POST_ADMIN_REPOSITORY = container.resolve(PostAdminRepository);
const AUTH_SERVICE = container.resolve(AuthService);

const posts = ref<PostItem[]>([]);
const comments = ref<Comment[]>([]);
const selectedPost = ref<PostItem | null>(null);
const isLoading = ref(false);
const isLoadingComments = ref(false);
const isDeleting = ref(false);
const isCheckingAuth = ref(true);
const currentPage = ref(0);
const totalPages = ref(0);
const totalElements = ref(0);

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

    await loadPosts();
  } catch (error) {
    console.error('인증 확인 중 오류:', error);
    ElMessage.warning('세션이 만료되었습니다. 다시 로그인해주세요.');
    router.replace("/admin/login");
  } finally {
    isCheckingAuth.value = false;
  }
}

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

async function loadComments(postId: number) {
  isLoadingComments.value = true;
  try {
    comments.value = await COMMENT_ADMIN_REPOSITORY.getAdminCommentByPostId(postId);
  } catch (error) {
    ElMessage.error('댓글을 불러오는데 실패했습니다.');
    comments.value = [];
  } finally {
    isLoadingComments.value = false;
  }
}

async function handleSelectPost(post: PostItem) {
  selectedPost.value = post;
  await loadComments(post.postId);
}

async function handleDeleteComment(comment: Comment) {
  try {
    await ElMessageBox.confirm(
        `이 댓글을 삭제하시겠습니까?\n작성자: ${comment.email}`,
        '댓글 삭제',
        {
          confirmButtonText: '삭제',
          cancelButtonText: '취소',
          type: 'warning',
        }
    );

    isDeleting.value = true;

    const request = new CommentDeleteRequest();
    request.commentId = comment.id;
    request.content = comment.content;
    request.email = comment.email;
    request.postId = comment.postId;
    request.parentId = comment.parentId;

    await COMMENT_ADMIN_REPOSITORY.addCategory(request);
    ElMessage.success('댓글이 성공적으로 삭제되었습니다.');

    if (selectedPost.value) {
      await loadComments(selectedPost.value.postId);
    }

  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('댓글 삭제에 실패했습니다.');
    }
  } finally {
    isDeleting.value = false;
  }
}

async function handlePageChange(page: number) {
  await loadPosts(page - 1);
  selectedPost.value = null;
  comments.value = [];
}

function handleCancel() {
  router.back();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusText(status: string): string {
  return status === 'PUBLISHED' ? '발행' : '임시저장';
}
</script>

<template>
  <div class="comment-admin-page">
    <div class="comment-admin-container">
      <div v-if="isCheckingAuth" class="loading-text">
        인증 확인 중...
      </div>

      <div v-else>
        <h2 class="page-title bold-text">댓글 관리</h2>

        <!-- 게시글 선택 섹션 -->
        <div class="section">
          <h3 class="section-title bold-text">게시글 선택</h3>

          <div v-if="isLoading" class="loading-text">
            게시글 목록을 불러오는 중...
          </div>

          <div v-else-if="posts.length === 0" class="empty-text">
            게시글이 없습니다.
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
                  :class="{ 'selected': selectedPost?.postId === post.postId }"
                  @click="handleSelectPost(post)"
              >
                <h4 class="post-title">{{ post.title }}</h4>
                <div class="post-meta">
                  <span class="post-author">{{ post.memberName }}</span>
                  <span class="post-category">{{ post.categoryName }}</span>
                  <span class="post-status">{{ getStatusText(post.status) }}</span>
                  <span class="post-date">{{ formatDate(post.regDate) }}</span>
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
        </div>

        <!-- 댓글 목록 섹션 -->
        <div v-if="selectedPost" class="section">
          <h3 class="section-title bold-text">
            "{{ selectedPost.title }}" 게시글의 댓글 목록
          </h3>

          <div v-if="isLoadingComments" class="loading-text">
            댓글을 불러오는 중...
          </div>

          <div v-else-if="comments.length === 0" class="empty-text">
            이 게시글에는 댓글이 없습니다.
          </div>

          <div v-else class="comments-section">
            <div class="comments-info">
              총 {{ comments.length }}개의 댓글
            </div>

            <div class="comments-list">
              <div
                  v-for="comment in comments"
                  :key="comment.id"
                  class="comment-item"
                  :class="{ 'reply': comment.parentId }"
              >
                <div class="comment-header">
                  <div class="comment-info">
                    <span class="comment-level">
                      {{ comment.parentId ? '↳ 대댓글' : '원댓글' }}
                    </span>
                    <span class="comment-email">{{ comment.email }}</span>
                    <span class="comment-id">ID: {{ comment.id }}</span>
                    <span v-if="comment.parentId" class="parent-id">
                      부모 ID: {{ comment.parentId }}
                    </span>
                  </div>
                  <el-button
                      type="danger"
                      size="small"
                      @click="handleDeleteComment(comment)"
                      :loading="isDeleting"
                  >
                    삭제
                  </el-button>
                </div>

                <div class="comment-content">
                  {{ comment.content }}
                </div>
              </div>
            </div>
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

<style scoped>
@import url('https://hangeul.pstatic.net/hangeul_static/css/nanum-barun-pen.css');

</style>