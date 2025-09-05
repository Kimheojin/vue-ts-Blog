<script setup lang="ts">
import {onMounted, ref, computed} from 'vue';
import {container} from 'tsyringe';
import {ElMessage, ElMessageBox} from 'element-plus';
import type Comment from '../../../entity/comment/data/Comment.ts';
import CommentAdminRepository from "../../../repository/comment/CommentAdminRepository.ts";
import {useAdminAuth} from "../../../composables/useAdminAuth.ts";
import {useRouter} from "vue-router";
import CommentAdminDeleteRequest from "../../../entity/comment/request/CommentAdminDeleteRequest.ts";
import { useErrorHandler } from '../../../composables/useErrorHandler.ts';

const { customHandleError } = useErrorHandler();

const router = useRouter();
const { isCheckingAuth, checkAuth } = useAdminAuth();

const COMMENT_ADMIN_REPOSITORY = container.resolve(CommentAdminRepository);

// 선택된 게시물 상태
const selectedPostId = ref<number | null>(null);

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
    await loadAllComments();
  }
});

// 전체 댓글 목록 불러오기
async function loadAllComments() {
  isLoadingComments.value = true;
  try {
    const allComments = await COMMENT_ADMIN_REPOSITORY.getAdminCommentList();
    comments.value = flattenComments(allComments);
    console.log('전체 댓글 데이터:', comments.value);
  } catch (error) {
    customHandleError(error, '댓글을 불러오는데 실패했습니다.');
  } finally {
    isLoadingComments.value = false;
  }
}

// 댓글 클릭 시 해당 게시물의 댓글만 보기
async function showCommentsByPost(postId: number) {
  selectedPostId.value = postId;
  statusFilter.value = 'ALL'; // 상태 필터 초기화
  await loadCommentsByPostId(postId);
}

// 특정 게시물의 댓글 목록 불러오기
async function loadCommentsByPostId(postId: number) {
  isLoadingComments.value = true;
  try {
    const allComments = await COMMENT_ADMIN_REPOSITORY.getAdminCommentByPostId(postId);
    comments.value = flattenComments(allComments);
    console.log('특정 게시물 댓글 데이터:', comments.value);
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
        `댓글을 관리자 삭제하시겠습니까?\n\n"${contentPreview}"`,
        '댓글 삭제',
        {
          confirmButtonText: '관리자 삭제',
          cancelButtonText: '취소',
          type: 'warning',
        }
    );

    isDeleting.value = true;

    const deleteRequest = new CommentAdminDeleteRequest();
    deleteRequest.commentId = comment.id;
    deleteRequest.content = comment.content;
    deleteRequest.email = comment.email;
    deleteRequest.postId = comment.postId;
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
      customHandleError(error, '댓글 관리자 삭제에 실패했습니다.');

      // 에러가 발생한 경우에만 다시 조회해서 실제 상태 확인
      if (selectedPostId.value) {
        await loadCommentsByPostId(selectedPostId.value);
      } else {
        await loadAllComments();
      }
    }
  } finally {
    isDeleting.value = false;
  }
}

// 전체 댓글 목록으로 돌아가기
async function backToAllComments() {
  selectedPostId.value = null;
  statusFilter.value = 'ALL';
  await loadAllComments();
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

// 댓글에서 postId로 필터링하기
function filterCommentsByPostId(postId: number) {
  showCommentsByPost(postId);
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
        <!-- 전체 댓글 목록 화면 -->
        <div v-if="!selectedPostId">
          <div class="page-header">
            <h2 class="page-title bold-text">댓글 관리 - 전체 댓글</h2>
            <div class="header-actions">
              <span class="comments-count">
                총 {{ commentStatusCounts.TOTAL }}개
                (활성: {{ commentStatusCounts.ACTIVE }}, 삭제: {{ commentStatusCounts.DELETED }}, 관리자삭제: {{ commentStatusCounts.ADMIN_DELETED }})
              </span>
              <el-button @click="goBack" class="bold-text">돌아가기</el-button>
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

          <!-- 전체 댓글 목록 -->
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
                  class="comment-item clickable-comment"
                  :class="{
                   'reply-comment': isReply(comment),
                   'deleted-comment': comment.status === 'DELETED' || comment.status === 'ADMIN_DELETED'
                 }"
                  @click="filterCommentsByPostId(comment.postId)"
              >
                <div v-if="isReply(comment)" class="reply-indicator">
                  ↳ 답글
                </div>

                <div class="comment-content">
                  <div class="comment-header">
                    <div class="comment-info">
                      <span class="comment-author">{{ (comment.email) }}</span>
                      <span class="comment-date">{{ formatDate(comment.regDate) }}</span>
                      <span class="post-id-badge">게시물 ID: {{ comment.postId }}</span>
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
                          @click.stop="deleteComment(comment)"
                          :loading="isDeleting"
                          class="bold-text"
                      >
                        관리자 삭제
                      </el-button>
                      <span v-else class="delete-disabled">삭제 불가</span>
                    </div>
                  </div>

                  <div class="comment-text" :class="{ 'deleted-content': comment.status === 'DELETED' || comment.status === 'ADMIN_DELETED' }">
                    {{ comment.content }}
                  </div>
                  <div class="click-hint">클릭하여 이 게시물의 댓글만 보기</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 특정 게시물 댓글 관리 화면 -->
        <div v-else>
          <div class="page-header">
            <h2 class="page-title bold-text">댓글 관리 - 게시물 ID: {{ selectedPostId }}</h2>
            <div class="header-actions">
             <span class="comments-count">
               총 {{ commentStatusCounts.TOTAL }}개
               (활성: {{ commentStatusCounts.ACTIVE }}, 삭제: {{ commentStatusCounts.DELETED }}, 관리자삭제: {{ commentStatusCounts.ADMIN_DELETED }})
             </span>
              <el-button @click="backToAllComments" class="bold-text">전체 댓글 목록</el-button>
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
                      <span class="comment-author">{{ (comment.email) }}</span>
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
                        관리자 삭제
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



/* 댓글 관련 스타일 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.clickable-comment {
  cursor: pointer;
}


.post-id-badge {
  background-color: #66b1ff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: bold;
}

.click-hint {
  margin-top: 10px;
  color: #888;
  font-size: 16px;
  font-style: italic;
  text-align: center;
}

.comment-item {
  background-color: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #444;
  overflow: hidden;
  transition: all 0.3s ease;
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