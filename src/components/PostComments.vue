<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { container } from 'tsyringe';
import { ElMessage } from 'element-plus';
import CommentRepository from '../repository/comment/CommentRepository.ts';
import CommentWriteRequest from '../entity/comment/request/CommentWirteRequest.ts';
import CommentDeleteRequest from '../entity/comment/request/CommentDeleteRequest.ts';
import type Comment from '../entity/comment/data/Comment.ts';

// Props 정의
const props = defineProps<{
  postId: number;
}>();

const COMMENT_REPOSITORY = container.resolve(CommentRepository);

// 댓글 관련 상태
const comments = ref<Comment[]>([]);
const isLoading = ref(true);

// 댓글 작성 폼 상태
const commentForm = ref(new CommentWriteRequest());
const isSubmitting = ref(false);

// 답글 작성 관련 상태
const replyForms = ref<{ [commentId: number]: CommentWriteRequest }>({});
const showReplyForm = ref<{ [commentId: number]: boolean }>({});

// 댓글 삭제 관련 상태
const deleteForm = ref<{ [commentId: number]: { email: string; password: string } }>({});
const showDeleteForm = ref<{ [commentId: number]: boolean }>({});

onMounted(async () => {
  commentForm.value.postId = props.postId;
  await loadComments();
});

// 댓글 목록 불러오기
async function loadComments() {
  isLoading.value = true;
  try {
    comments.value = await COMMENT_REPOSITORY.getCommentByPostId(props.postId);
  } catch (error) {
    console.error('댓글을 불러오는 중 오류:', error);
    ElMessage.error('댓글을 불러오는데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
}

// 댓글 작성
async function submitComment() {
  if (!commentForm.value.content.trim()) {
    ElMessage.warning('댓글 내용을 입력해주세요.');
    return;
  }
  if (!commentForm.value.email.trim()) {
    ElMessage.warning('이메일을 입력해주세요.');
    return;
  }
  if (!commentForm.value.password.trim()) {
    ElMessage.warning('비밀번호를 입력해주세요.');
    return;
  }

  isSubmitting.value = true;
  try {
    await COMMENT_REPOSITORY.postComment(commentForm.value);
    ElMessage.success('댓글이 작성되었습니다.');

    // 폼 초기화
    commentForm.value = new CommentWriteRequest();
    commentForm.value.postId = props.postId;

    // 댓글 목록 새로고침
    await loadComments();
  } catch (error) {
    console.error('댓글 작성 중 오류:', error);
    ElMessage.error('댓글 작성에 실패했습니다.');
  } finally {
    isSubmitting.value = false;
  }
}

// 답글 폼 토글
function toggleReplyForm(commentId: number) {
  showReplyForm.value[commentId] = !showReplyForm.value[commentId];

  if (showReplyForm.value[commentId] && !replyForms.value[commentId]) {
    replyForms.value[commentId] = new CommentWriteRequest();
    replyForms.value[commentId].postId = props.postId;
    replyForms.value[commentId].parentId = commentId;
  }
}

// 답글 작성
async function submitReply(commentId: number) {
  const replyForm = replyForms.value[commentId];

  if (!replyForm.content.trim()) {
    ElMessage.warning('답글 내용을 입력해주세요.');
    return;
  }
  if (!replyForm.email.trim()) {
    ElMessage.warning('이메일을 입력해주세요.');
    return;
  }
  if (!replyForm.password.trim()) {
    ElMessage.warning('비밀번호를 입력해주세요.');
    return;
  }

  try {
    await COMMENT_REPOSITORY.postComment(replyForm);
    ElMessage.success('답글이 작성되었습니다.');

    // 답글 폼 숨기기 및 초기화
    showReplyForm.value[commentId] = false;
    delete replyForms.value[commentId];

    // 댓글 목록 새로고침
    await loadComments();
  } catch (error) {
    console.error('답글 작성 중 오류:', error);
    ElMessage.error('답글 작성에 실패했습니다.');
  }
}

// 삭제 폼 토글
function toggleDeleteForm(commentId: number) {
  showDeleteForm.value[commentId] = !showDeleteForm.value[commentId];

  if (showDeleteForm.value[commentId] && !deleteForm.value[commentId]) {
    deleteForm.value[commentId] = { email: '', password: '' };
  }
}

// 댓글 삭제
async function deleteComment(comment: Comment) {
  const deleteData = deleteForm.value[comment.id];

  if (!deleteData.email.trim()) {
    ElMessage.warning('이메일을 입력해주세요.');
    return;
  }
  if (!deleteData.password.trim()) {
    ElMessage.warning('비밀번호를 입력해주세요.');
    return;
  }

  try {
    const deleteRequest = new CommentDeleteRequest();
    deleteRequest.commentId = comment.id;
    deleteRequest.content = comment.content;
    deleteRequest.email = deleteData.email;
    deleteRequest.password = deleteData.password;
    deleteRequest.postId = props.postId;
    deleteRequest.parentId = comment.parentId;

    await COMMENT_REPOSITORY.addCategory(deleteRequest); // 메서드명이 잘못된 것 같지만 기존 코드 유지
    ElMessage.success('댓글이 삭제되었습니다.');

    // 삭제 폼 숨기기
    showDeleteForm.value[comment.id] = false;
    delete deleteForm.value[comment.id];

    // 댓글 목록 새로고침
    await loadComments();
  } catch (error) {
    console.error('댓글 삭제 중 오류:', error);
    ElMessage.error('댓글 삭제에 실패했습니다.');
  }
}

// 날짜 포맷팅
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 이메일 마스킹
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 3) {
    return `${local[0]}***@${domain}`;
  }
  return `${local.substring(0, 3)}***@${domain}`;
}
</script>

<template>
  <div class="comments-section">
    <h3 class="comments-title bold-text">댓글 {{ comments.length }}개</h3>

    <!-- 댓글 작성 폼 -->
    <div class="comment-form">
      <div class="form-row">
        <el-input
            v-model="commentForm.email"
            placeholder="이메일"
            class="form-input"
            type="email"
        />
        <el-input
            v-model="commentForm.password"
            placeholder="비밀번호"
            class="form-input"
            type="password"
            show-password
        />
      </div>

      <el-input
          v-model="commentForm.content"
          type="textarea"
          placeholder="댓글을 입력하세요..."
          :rows="4"
          class="comment-textarea"
      />

      <div class="form-actions">
        <el-button
            type="primary"
            @click="submitComment"
            :loading="isSubmitting"
        >
          댓글 작성
        </el-button>
      </div>
    </div>

    <!-- 댓글 목록 -->
    <div class="comments-list">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-text">
        댓글을 불러오는 중...
      </div>

      <!-- 댓글이 없는 경우 -->
      <div v-else-if="comments.length === 0" class="empty-text">
        첫 번째 댓글을 작성해보세요!
      </div>

      <!-- 댓글 목록 -->
      <div v-else>
        <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
        >
          <!-- 댓글 내용 -->
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">{{ maskEmail(comment.email) }}</span>
              <span class="comment-date">{{ formatDate(comment.regDate || '') }}</span>
            </div>

            <div class="comment-text">{{ comment.content }}</div>

            <div class="comment-actions">
              <el-button
                  size="small"
                  text
                  @click="toggleReplyForm(comment.id)"
              >
                답글
              </el-button>
              <el-button
                  size="small"
                  text
                  type="danger"
                  @click="toggleDeleteForm(comment.id)"
              >
                삭제
              </el-button>
            </div>
          </div>

          <!-- 답글 작성 폼 -->
          <div v-if="showReplyForm[comment.id]" class="reply-form">
            <div class="form-row">
              <el-input
                  v-model="replyForms[comment.id].email"
                  placeholder="이메일"
                  class="form-input-small"
                  type="email"
              />
              <el-input
                  v-model="replyForms[comment.id].password"
                  placeholder="비밀번호"
                  class="form-input-small"
                  type="password"
                  show-password
              />
            </div>

            <el-input
                v-model="replyForms[comment.id].content"
                type="textarea"
                placeholder="답글을 입력하세요..."
                :rows="3"
                class="reply-textarea"
            />

            <div class="reply-actions">
              <el-button size="small" @click="showReplyForm[comment.id] = false">취소</el-button>
              <el-button size="small" type="primary" @click="submitReply(comment.id)">답글 작성</el-button>
            </div>
          </div>

          <!-- 삭제 폼 -->
          <div v-if="showDeleteForm[comment.id]" class="delete-form">
            <p class="delete-warning">댓글을 삭제하려면 작성 시 사용한 이메일과 비밀번호를 입력하세요.</p>
            <div class="form-row">
              <el-input
                  v-model="deleteForm[comment.id].email"
                  placeholder="이메일"
                  class="form-input-small"
                  type="email"
              />
              <el-input
                  v-model="deleteForm[comment.id].password"
                  placeholder="비밀번호"
                  class="form-input-small"
                  type="password"
                  show-password
              />
            </div>

            <div class="delete-actions">
              <el-button size="small" @click="showDeleteForm[comment.id] = false">취소</el-button>
              <el-button size="small" type="danger" @click="deleteComment(comment)">삭제</el-button>
            </div>
          </div>

          <!-- 답글 목록 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
            <div
                v-for="reply in comment.replies"
                :key="reply.id"
                class="reply-item"
            >
              <div class="comment-header">
                <span class="comment-author">{{ maskEmail(reply.email) }}</span>
                <span class="comment-date">{{ formatDate(reply.regDate || '') }}</span>
              </div>

              <div class="comment-text">{{ reply.content }}</div>

              <div class="comment-actions">
                <el-button
                    size="small"
                    text
                    type="danger"
                    @click="toggleDeleteForm(reply.id)"
                >
                  삭제
                </el-button>
              </div>

              <!-- 답글 삭제 폼 -->
              <div v-if="showDeleteForm[reply.id]" class="delete-form">
                <p class="delete-warning">답글을 삭제하려면 작성 시 사용한 이메일과 비밀번호를 입력하세요.</p>
                <div class="form-row">
                  <el-input
                      v-model="deleteForm[reply.id].email"
                      placeholder="이메일"
                      class="form-input-small"
                      type="email"
                  />
                  <el-input
                      v-model="deleteForm[reply.id].password"
                      placeholder="비밀번호"
                      class="form-input-small"
                      type="password"
                      show-password
                  />
                </div>

                <div class="delete-actions">
                  <el-button size="small" @click="showDeleteForm[reply.id] = false">취소</el-button>
                  <el-button size="small" type="danger" @click="deleteComment(reply)">삭제</el-button>
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

.comments-section {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 2px solid #444;
  font-family: 'NanumBarunPen', sans-serif;
}

.comments-title {
  font-size: 20px;
  color: #e0e0e0;
  margin-bottom: 25px;
}

.comment-form {
  background-color: #2a2a2a;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 30px;
  border: 1px solid #444;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.form-input {
  flex: 1;
}

.form-input-small {
  flex: 1;
}

.comment-textarea,
.reply-textarea {
  margin-bottom: 15px;
}

.form-actions,
.reply-actions,
.delete-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.loading-text,
.empty-text {
  text-align: center;
  color: #b0b0b0;
  font-size: 16px;
  margin: 40px 0;
}

.comment-item {
  margin-bottom: 25px;
}

.comment-content {
  background-color: #3a3a3a;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #444;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-author {
  color: #66b1ff;
  font-weight: bold;
  font-size: 14px;
}

.comment-date {
  color: #909399;
  font-size: 12px;
}

.comment-text {
  color: #e0e0e0;
  line-height: 1.6;
  margin-bottom: 15px;
  white-space: pre-wrap;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.reply-form,
.delete-form {
  margin-top: 15px;
  padding: 15px;
  background-color: #2a2a2a;
  border-radius: 8px;
  border: 1px solid #555;
}

.delete-warning {
  color: #f56c6c;
  font-size: 12px;
  margin: 0 0 10px 0;
}

.replies-list {
  margin-top: 15px;
  margin-left: 30px;
  border-left: 2px solid #555;
  padding-left: 20px;
}

.reply-item {
  background-color: #2a2a2a;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #555;
  margin-bottom: 10px;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 10px;
  }

  .replies-list {
    margin-left: 15px;
    padding-left: 15px;
  }

  .comment-actions,
  .form-actions,
  .reply-actions,
  .delete-actions {
    flex-direction: column;
  }
}
</style>