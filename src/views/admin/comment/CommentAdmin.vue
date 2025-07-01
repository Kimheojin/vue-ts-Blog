<script setup lang="ts">
import {onMounted, ref, computed} from 'vue';
import {container} from 'tsyringe';
import {ElMessage, ElMessageBox} from 'element-plus';
import type Comment from '../../../entity/comment/data/Comment.ts';
import type PostItem from '../../../entity/post/data/PostItem.ts';
import type PostPageResponse from '../../../entity/post/response/PostPageResponse.ts';
import CommentAdminRepository from "../../../repository/comment/CommentAdminRepository.ts";
import PostAdminRepository from "../../../repository/post/PostAdminRepository.ts";
import {useAdminAuth} from "../../../composables/useAdminAuth.ts";
import {useRouter} from "vue-router";
import CommentAdminDeleteRequest from "../../../entity/comment/request/CommentAdminDeleteRequest.ts";
import { useErrorHandler } from '../../../composables/useErrorHandler.ts';

const { customHandleError } = useErrorHandler();

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

// 상태 필터
const statusFilter = ref<string>('ALL');
const statusOptions = [
  { label: '전체', value: 'ALL' },
  { label: '활성', value: 'ACTIVE' },
  { label: '삭제됨', value: 'DELETED' },
  { label: '관리자삭제', value: 'ADMIN_DELETED' }
];

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

    // 첫 번째 게시물 구조 확인
    if (response.content.length > 0) {
      console.log('게시물 데이터 구조:', response.content[0]);
    }
  } catch (error) {
    customHandleError(error, '게시물을 불러오는데 실패했습니다.');
  } finally {
    isLoadingPosts.value = false;
  }
}

// 게시물 선택 시 댓글 불러오기
async function selectPost(post: PostItem) {
  selectedPost.value = post;
  statusFilter.value = 'ALL'; // 상태 필터 초기화
  await loadComments();
}

// 댓글 목록 불러오기
async function loadComments() {
  if (!selectedPost.value) return;

  isLoadingComments.value = true;
  try {
    const allComments = await COMMENT_ADMIN_REPOSITORY.getAdminCommentByPostId(selectedPost.value.postId);

    // 댓글 데이터 구조 확인
    console.log('받아온 댓글 데이터:', allComments);

    // 평면화?해서 표시
    comments.value = flattenComments(allComments);

    console.log('평면화된 댓글:', comments.value);

  } catch (error) {
    customHandleError(error, '댓글을 불러오는데 실패했습니다.');
  } finally {
    isLoadingComments.value = false;
  }
}

// 계층 구조 댓글을 평면화하는 함수
function flattenComments(commentList: Comment[]): Comment[] {
  const result: Comment[] = [];

  function addCommentsRecursively(comments: Comment[]) {
    comments.forEach(comment => {
      result.push(comment);

      // replies가 있으면 재귀적으로 추가
      if (comment.replies && comment.replies.length > 0) {
        addCommentsRecursively(comment.replies);
      }
    });
  }

  addCommentsRecursively(commentList);
  return result;
}

// 상태별 댓글 필터링
const filteredComments = computed(() => {
  if (statusFilter.value === 'ALL') {
    return comments.value;
  }
  return comments.value.filter(comment => {
    const status = comment.status || 'ACTIVE'; // 빈 문자열이면 ACTIVE로 처리
    return status === statusFilter.value;
  });
});

// 상태별 댓글 개수
const commentStatusCounts = computed(() => {
  const counts = {
    ACTIVE: 0,
    DELETED: 0,
    ADMIN_DELETED: 0,
    TOTAL: comments.value.length
  };

  comments.value.forEach(comment => {
    const status = comment.status || 'ACTIVE';
    if (counts[status as keyof typeof counts] !== undefined) {
      counts[status as keyof typeof counts]++;
    }
  });

  return counts;
});

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

    const deleteRequest = new CommentAdminDeleteRequest();
    deleteRequest.commentId = comment.id;
    deleteRequest.content = comment.content;
    deleteRequest.email = comment.email;
    deleteRequest.postId = selectedPost.value!.postId;
    deleteRequest.parentId = comment.parentId;

    console.log('삭제 요청 데이터:', deleteRequest);

    // 삭제 요청 실행 - 업데이트된 댓글 목록을 바로 받음
    const updatedComments = await COMMENT_ADMIN_REPOSITORY.deleteAdminComment(deleteRequest);

    console.log('삭제 후 받은 댓글 목록:', updatedComments);

    // 백엔드에서 반환한 업데이트된 댓글 목록으로 바로 업데이트
    comments.value = flattenComments(updatedComments);

    ElMessage.success('댓글이 삭제되었습니다.');

  } catch (error: any) {
    if (error !== 'cancel') {
      customHandleError(error, '댓글 삭제에 실패했습니다.');

      // 에러가 발생한 경우에만 다시 조회해서 실제 상태 확인
      await loadComments();
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
  statusFilter.value = 'ALL';
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

// 댓글 타입 구분 (parentId가 있으면 대댓글)
function isReply(comment: Comment): boolean {
  return comment.parentId != null && comment.parentId > 0;
}

// 댓글 상태 텍스트
function getCommentStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'ACTIVE': '활성',
    'DELETED': '삭제됨',
    'ADMIN_DELETED': '관리자삭제',
    '': '활성' // 빈 문자열인 경우 활성으로 처리
  };
  return statusMap[status] || '활성';
}

// 댓글 상태 색상
function getCommentStatusColor(status: string): string {
  const colorMap: { [key: string]: string } = {
    'ACTIVE': '#67c23a',
    'DELETED': '#f56c6c',
    'ADMIN_DELETED': '#e6a23c',
    '': '#67c23a' // 빈 문자열인 경우 활성 색상
  };
  return colorMap[status] || '#67c23a';
}

// 삭제 가능한 댓글인지 확인
function canDeleteComment(comment: Comment): boolean {
  const status = comment.status || 'ACTIVE';
  return status === 'ACTIVE'; // 활성 상태인 댓글만 삭제 가능
}

// 상태 텍스트
function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    'PUBLISHED': '발행',
    'DRAFT': '임시저장',
    'PRIVATE': '비공개',
    'SCHEDULED': '예약됨'
  };
  return statusMap[status] || status;
}

// PostItem의 속성명 안전하게 접근하는 함수들
function getPostTitle(post: PostItem): string {
  return (post as any).title || (post as any).postTitle || '제목 없음';
}

function getPostMemberName(post: PostItem): string {
  return (post as any).memberName || (post as any).authorName || (post as any).author || '작성자 없음';
}

function getPostCategoryName(post: PostItem): string {
  return (post as any).categoryName || (post as any).category || '카테고리 없음';
}

function getPostStatus(post: PostItem): string {
  return (post as any).status || (post as any).postStatus || 'PUBLISHED';
}

function getPostRegDate(post: PostItem): string {
  return (post as any).regDate || (post as any).createdDate || (post as any).createDate || '';
}

function getPostContent(post: PostItem): string {
  return (post as any).content || (post as any).postContent || '';
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
                    <h3 class="post-title">{{ getPostTitle(post) }}</h3>
                    <div class="post-meta">
                      <span class="post-status">{{ getStatusText(getPostStatus(post)) }}</span>
                      <span class="post-date">{{ formatDate(getPostRegDate(post)) }}</span>
                    </div>
                  </div>

                  <div class="post-info">
                    <span class="post-author">{{ getPostMemberName(post) }}</span>
                    <span class="post-category">{{ getPostCategoryName(post) }}</span>
                  </div>

                  <div class="post-content-preview">
                    {{ getPostContent(post).substring(0, 100) }}{{ getPostContent(post).length > 100 ? '...' : '' }}
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
             <span class="comments-count">
               총 {{ commentStatusCounts.TOTAL }}개
               (활성: {{ commentStatusCounts.ACTIVE }}, 삭제: {{ commentStatusCounts.DELETED }}, 관리자삭제: {{ commentStatusCounts.ADMIN_DELETED }})
             </span>
              <el-button @click="backToPostList" class="bold-text">게시물 목록</el-button>
            </div>
          </div>

          <!-- 선택된 게시물 정보 -->
          <div class="selected-post-info">
            <h3 class="selected-post-title">{{ getPostTitle(selectedPost) }}</h3>
            <div class="selected-post-meta">
              <span>{{ getPostMemberName(selectedPost) }}</span>
              <span>{{ getPostCategoryName(selectedPost) }}</span>
              <span>{{ getStatusText(getPostStatus(selectedPost)) }}</span>
              <span>{{ formatDate(getPostRegDate(selectedPost)) }}</span>
            </div>
          </div>

          <!-- 상태 필터 -->
          <div class="filter-section">
            <div class="filter-group">
              <label class="filter-label bold-text">상태 필터:</label>
              <el-select v-model="statusFilter" placeholder="상태 선택" style="width: 150px">
                <el-option
                    v-for="option in statusOptions"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                />
              </el-select>
              <span class="filter-result">{{ filteredComments.length }}개 댓글</span>
            </div>
          </div>

          <!-- 댓글 목록 -->
          <div class="comments-section">
            <div v-if="isLoadingComments" class="loading-text">
              댓글을 불러오는 중...
            </div>

            <div v-else-if="filteredComments.length === 0" class="empty-text">
              {{ statusFilter === 'ALL' ? '댓글이 없습니다.' : '해당 상태의 댓글이 없습니다.' }}
            </div>

            <div v-else class="comments-list">
              <div
                  v-for="comment in filteredComments"
                  :key="`comment-${comment.id}`"
                  class="comment-item"
                  :class="{
                   'reply-comment': isReply(comment),
                   'deleted-comment': comment.status === 'DELETED' || comment.status === 'ADMIN_DELETED'
                 }"
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
                      <span
                          class="status-badge"
                          :style="{ backgroundColor: getCommentStatusColor(comment.status || 'ACTIVE') }"
                      >
                       {{ getCommentStatusText(comment.status || 'ACTIVE') }}
                     </span>
                    </div>

                    <div class="comment-actions">
                      <el-button
                          v-if="canDeleteComment(comment)"
                          size="small"
                          type="danger"
                          @click="deleteComment(comment)"
                          :loading="isDeleting"
                          class="bold-text"
                      >
                        삭제
                      </el-button>
                      <span v-else class="delete-disabled">삭제 불가</span>
                    </div>
                  </div>

                  <div class="comment-text" :class="{ 'deleted-content': comment.status === 'DELETED' || comment.status === 'ADMIN_DELETED' }">
                    {{ comment.content }}
                  </div>
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
  font-size: 14px;
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

/* 필터 섹션 */
.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #444;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-label {
  color: #e0e0e0;
  font-size: 16px;
}

.filter-result {
  color: #66b1ff;
  font-size: 14px;
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

.deleted-comment {
  opacity: 0.7;
  background-color: #2a2220;
  border-color: #665544;
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

.status-badge {
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.comment-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.delete-disabled {
  color: #666;
  font-size: 12px;
  padding: 5px 10px;
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

.deleted-content {
  background-color: #2a2520;
  border-color: #443a2a;
  opacity: 0.8;
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

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
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