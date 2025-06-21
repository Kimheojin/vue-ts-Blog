<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {container} from 'tsyringe';
import {ElMessage, ElMessageBox} from 'element-plus';
import CommentDeleteRequest from '../../entity/comment/request/CommentDeleteRequest.ts';
import type Comment from '../../entity/comment/data/Comment.ts';
import type PostItem from '../../entity/post/data/PostItem.ts';
import type PostPageResponse from '../../entity/post/response/PostPageResponse.ts';
import CommentAdminRepository from "../../repository/comment/CommentAdminRepository.ts";
import PostAdminRepository from "../../repository/post/PostAdminRepository.ts";
import {useAdminAuth} from "../../composables/useAdminAuth.ts";
import {useRouter} from "vue-router";

const router = useRouter();
const { isCheckingAuth, checkAuth } = useAdminAuth();

const COMMENT_ADMIN_REPOSITORY = container.resolve(CommentAdminRepository);
const POST_ADMIN_REPOSITORY = container.resolve(PostAdminRepository);

// 게시물 관련 상태
const posts = ref<PostItem[]>([]);
const selectedPost = ref<PostItem | null>(null);
const isLoadingPosts = ref(false);
const currentPage = ref(0);
const totalPages = ref(0);
const totalElements = ref(0);

// 댓글 관련 상태
const comments = ref<Comment[]>([]);
const isLoadingComments = ref(false);
const isDeleting = ref(false);

onMounted(async () => {
  const isAuth = await checkAuth();
  if (isAuth) {
    await loadPosts();
  }
});

// 게시물 목록 불러오기
async function loadPosts(page: number = 0) {
  isLoadingPosts.value = true;
  try {
    const response: PostPageResponse<PostItem> = await POST_ADMIN_REPOSITORY.getAdminPagePosts(page, 10);
    posts.value = response.content;
    currentPage.value = response.pageNumber;
    totalPages.value = response.totalPages;
    totalElements.value = response.totalElements;
  } catch (error) {
    console.error('게시물을 불러오는 중 오류:', error);
    ElMessage.error('게시물을 불러오는데 실패했습니다.');
  } finally {
    isLoadingPosts.value = false;
  }
}

// 게시물 선택 시 댓글 불러오기
async function selectPost(post: PostItem) {
  selectedPost.value = post;
  await loadComments();
}

// 댓글 목록 불러오기
async function loadComments() {
  if (!selectedPost.value) return;

  isLoadingComments.value = true;
  try {
    const allComments = await COMMENT_ADMIN_REPOSITORY.getAdminCommentByPostId(selectedPost.value.postId);
    comments.value = sortComments(allComments);
  } catch (error) {
    console.error('댓글을 불러오는 중 오류:', error);
    ElMessage.error('댓글을 불러오는데 실패했습니다.');
  } finally {
    isLoadingComments.value = false;
  }
}

// 댓글 정렬 함수
function sortComments(commentList: Comment[]): Comment[] {
  const parentComments = commentList
      .filter(comment => comment.parentId === null)
      .sort((a, b) => new Date(a.regDate).getTime() - new Date(b.regDate).getTime());

  const result: Comment[] = [];

  parentComments.forEach(parent => {
    result.push(parent);

    const replies = commentList
        .filter(comment => comment.parentId === parent.id)
        .sort((a, b) => new Date(a.regDate).getTime() - new Date(b.regDate).getTime());

    result.push(...replies);
  });

  return result;
}

// 관리자 댓글 삭제
async function deleteComment(comment: Comment) {
  try {
    const contentPreview = comment.content.length > 50
        ? comment.content.substring(0, 50) + '...'
        : comment.content;

    await ElMessageBox.confirm(
        `댓글을 삭제하시겠습니까?\n\n"${contentPreview}"`,
        '댓글 삭제',
        {
          confirmButtonText: '삭제',
          cancelButtonText: '취소',
          type: 'warning',
        }
    );

    isDeleting.value = true;

    const deleteRequest = new CommentDeleteRequest();
    deleteRequest.commentId = comment.id;
    deleteRequest.content = comment.content;
    deleteRequest.email = comment.email;
    deleteRequest.password = '';
    deleteRequest.postId = selectedPost.value!.postId;
    deleteRequest.parentId = comment.parentId;

    await COMMENT_ADMIN_REPOSITORY.deleteAdminComment(deleteRequest);
    ElMessage.success('댓글이 삭제되었습니다.');

    await loadComments();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('댓글 삭제 중 오류:', error);
      ElMessage.error('댓글 삭제에 실패했습니다.');
    }
  } finally {
    isDeleting.value = false;
  }
}

// 페이지 변경
async function handlePageChange(page: number) {
  await loadPosts(page - 1);
}

// 게시물 목록으로 돌아가기
function backToPostList() {
  selectedPost.value = null;
  comments.value = [];
}

// 이메일 마스킹
function maskEmail(email: string): string {
  if (!email) return '익명';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 3) {
    return `${local[0]}***@${domain}`;
  }
  return `${local.substring(0, 3)}***@${domain}`;
}

// 날짜 포맷팅
function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}

// 댓글 타입 구분
function isReply(comment: Comment): boolean {
  return comment.parentId !== null && comment.parentId !== 0;
}

// 상태 텍스트
function getStatusText(status: string): string {
  return status === 'PUBLISHED' ? '발행' : '임시저장';
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="comment-admin-page">
    <div class="comment-admin-container">
      <div v-if="isCheckingAuth" class="loading-text">
        인증 확인 중...
      </div>

      <div v-else>
        <!-- 게시물 목록 화면 -->
        <div v-if="!selectedPost">
          <div class="page-header">
            <h2 class="page-title bold-text">댓글 관리 - 게시물 선택</h2>
            <div class="header-actions">
              <span class="posts-count">총 {{ totalElements }}개의 게시물</span>
              <el-button @click="goBack" class="bold-text">돌아가기</el-button>
            </div>
          </div>

          <!-- 게시물 목록 -->
          <div class="posts-section">
            <div v-if="isLoadingPosts" class="loading-text">
              게시물을 불러오는 중...
            </div>

            <div v-else-if="posts.length === 0" class="empty-text">
              게시물이 없습니다.
            </div>

            <div v-else>
              <div class="posts-list">
                <div
                    v-for="post in posts"
                    :key="`post-${post.postId}`"
                    class="post-item"
                    @click="selectPost(post)"
                >
                  <div class="post-header">
                    <h3 class="post-title">{{ post.title }}</h3>
                    <div class="post-meta">
                      <span class="post-status">{{ getStatusText(post.status) }}</span>
                      <span class="post-date">{{ formatDate(post.regDate) }}</span>
                    </div>
                  </div>

                  <div class="post-info">
                    <span class="post-author">{{ post.memberName }}</span>
                    <span class="post-category">{{ post.categoryName }}</span>
                  </div>

                  <div class="post-content-preview">
                    {{ post.content.substring(0, 100) }}{{ post.content.length > 100 ? '...' : '' }}
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

        <!-- 댓글 관리 화면 -->
        <div v-else>
          <div class="page-header">
            <h2 class="page-title bold-text">댓글 관리</h2>
            <div class="header-actions">
              <span class="comments-count">총 {{ comments.length }}개의 댓글</span>
              <el-button @click="backToPostList" class="bold-text">게시물 목록</el-button>
            </div>
          </div>

          <!-- 선택된 게시물 정보 -->
          <div class="selected-post-info">
            <h3 class="selected-post-title">{{ selectedPost.title }}</h3>
            <div class="selected-post-meta">
              <span>{{ selectedPost.memberName }}</span>
              <span>{{ selectedPost.categoryName }}</span>
              <span>{{ getStatusText(selectedPost.status) }}</span>
              <span>{{ formatDate(selectedPost.regDate) }}</span>
            </div>
          </div>

          <!-- 댓글 목록 -->
          <div class="comments-section">
            <div v-if="isLoadingComments" class="loading-text">
              댓글을 불러오는 중...
            </div>

            <div v-else-if="comments.length === 0" class="empty-text">
              댓글이 없습니다.
            </div>

            <div v-else class="comments-list">
              <div
                  v-for="comment in comments"
                  :key="`comment-${comment.id}`"
                  class="comment-item"
                  :class="{ 'reply-comment': isReply(comment) }"
              >
                <div v-if="isReply(comment)" class="reply-indicator">
                  ↳ 답글
                </div>

                <div class="comment-content">
                  <div class="comment-header">
                    <div class="comment-info">
                      <span class="comment-author">{{ maskEmail(comment.email) }}</span>
                      <span class="comment-date">{{ formatDate(comment.regDate) }}</span>
                      <span v-if="isReply(comment)" class="reply-badge">답글</span>
                    </div>

                    <div class="comment-actions">
                      <el-button
                          size="small"
                          type="danger"
                          @click="deleteComment(comment)"
                          :loading="isDeleting"
                          class="bold-text"
                      >
                        삭제
                      </el-button>
                    </div>
                  </div>

                  <div class="comment-text">{{ comment.content }}</div>
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

.comment-admin-page {
  padding: 20px;
  font-family: 'NanumBarunPen', sans-serif;
  background-color: #1a1a1a;
  min-height: 100vh;
  color: #e0e0e0;
}

.comment-admin-container {
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

.posts-count,
.comments-count {
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

/* 게시물 목록 스타일 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.post-item {
  background-color: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #444;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-item:hover {
  border-color: #66b1ff;
  box-shadow: 0 2px 8px rgba(102, 177, 255, 0.2);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.post-title {
  color: #e0e0e0;
  margin: 0;
  font-size: 18px;
  flex: 1;
}

.post-meta {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.post-status {
  background-color: #67c23a;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.post-date {
  color: #888;
  font-size: 12px;
}

.post-info {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
  color: #b0b0b0;
  font-size: 14px;
}

.post-author {
  color: #66b1ff;
}

.post-category {
  color: #f56c6c;
}

.post-content-preview {
  color: #ccc;
  line-height: 1.4;
  font-size: 14px;
}

/* 선택된 게시물 정보 */
.selected-post-info {
  background-color: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #66b1ff;
  padding: 20px;
  margin-bottom: 30px;
}

.selected-post-title {
  color: #e0e0e0;
  margin: 0 0 10px 0;
  font-size: 20px;
}

.selected-post-meta {
  display: flex;
  gap: 15px;
  color: #b0b0b0;
  font-size: 14px;
}

/* 댓글 관련 스타일 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  background-color: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #444;
  overflow: hidden;
  transition: all 0.3s ease;
}

.comment-item:hover {
  border-color: #555;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.reply-comment {
  margin-left: 40px;
  background-color: #252525;
  border-left: 4px solid #66b1ff;
}

.reply-indicator {
  padding: 8px 20px;
  background-color: #1e1e1e;
  color: #66b1ff;
  font-size: 12px;
  font-weight: bold;
}

.comment-content {
  padding: 20px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.comment-info {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.comment-author {
  color: #66b1ff;
  font-weight: bold;
  font-size: 14px;
}

.comment-date {
  color: #888;
  font-size: 12px;
}

.reply-badge {
  background-color: #66b1ff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
}

.comment-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.comment-text {
  color: #e0e0e0;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #1e1e1e;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #333;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .comment-admin-page {
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

  .post-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .post-info {
    flex-direction: column;
    gap: 5px;
  }

  .selected-post-meta {
    flex-direction: column;
    gap: 5px;
  }

  .reply-comment {
    margin-left: 20px;
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .comment-info {
    width: 100%;
  }

  .comment-actions {
    align-self: flex-end;
  }
}
</style>