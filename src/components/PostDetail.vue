<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { container } from 'tsyringe';
import { ElMessage } from 'element-plus';
import { marked } from 'marked';
import PostRepository from '../repository/post/PostRepository.ts';
import PostItem from '../entity/post/data/PostItem.ts';
import PostComments from '../components/PostComments.vue'; // 댓글 컴포넌트 import

const route = useRoute();
const router = useRouter();
const POST_REPOSITORY = container.resolve(PostRepository);

const post = ref<PostItem>(new PostItem());
const isLoading = ref(true);
const postId = ref<number>(0);

// marked 설정
marked.setOptions({
  breaks: true,
  gfm: true,
});

// 마크다운 콘텐츠를 HTML로 변환하는 computed 속성
const renderedContent = computed(() => {
  if (!post.value.content) return '';
  return marked(post.value.content);
});

// 게시글이 실제로 로드되었는지 확인하는 computed 속성
const isPostLoaded = computed(() => {
  return post.value.postId > 0;
});

onMounted(async () => {
  postId.value = Number(route.params.postId);
  await loadPost();
});

// 라우트 파라미터 변경 감지
watch(() => route.params.postId, async (newPostId) => {
  if (newPostId) {
    postId.value = Number(newPostId);
    await loadPost();
  }
});

async function loadPost() {
  isLoading.value = true;
  try {
    const loadedPost = await POST_REPOSITORY.getSinglePost(postId.value);
    post.value = loadedPost;
  } catch (error) {
    console.error('게시글을 불러오는 중 오류:', error);
    ElMessage.error('게시글을 불러오는데 실패했습니다.');
    router.push('/'); // 오류 시 홈으로 이동
  } finally {
    isLoading.value = false;
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function goToCategory(categoryName: string) {
  router.push(`/category/${categoryName}`);
}

function goBack() {
  router.back();
}

function goToAllPosts() {
  router.push('/posts');
}
</script>

<template>
  <div class="post-detail-page">
    <div class="post-detail-container">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-text">
        게시글을 불러오는 중...
      </div>

      <!-- 게시글 내용 -->
      <div v-else-if="isPostLoaded" class="post-content">
        <!-- 네비게이션 버튼 -->
        <div class="navigation-buttons">
          <el-button @click="goBack" type="info">← 이전으로</el-button>
          <el-button @click="goToAllPosts" type="primary">전체 글 보기</el-button>
        </div>

        <!-- 게시글 헤더 -->
        <div class="post-header">
          <h1 class="post-title bold-text">{{ post.title }}</h1>

          <div class="post-meta">
            <el-tag
                class="category-tag"
                type="primary"
                @click="goToCategory(post.categoryName)"
            >
              {{ post.categoryName }}
            </el-tag>
            <span class="post-author">{{ post.memberName }}</span>
            <span class="post-date">{{ formatDate(post.regDate) }}</span>
          </div>
        </div>

        <!-- 게시글 본문 -->
        <div class="post-body">
          <div class="post-content-text" v-html="renderedContent"></div>
        </div>

        <!-- 하단 네비게이션 -->
        <div class="bottom-navigation">
          <el-button @click="goBack" type="info">← 이전으로</el-button>
          <el-button @click="goToCategory(post.categoryName)" type="success">
            {{ post.categoryName }} 카테고리 더보기
          </el-button>
        </div>

        <!-- 댓글 섹션 -->
        <PostComments :post-id="post.postId" />
      </div>

      <!-- 오류 상태 -->
      <div v-else class="error-text">
        게시글을 찾을 수 없습니다.
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

.post-detail-page {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'NanumBarunPen', sans-serif;
}

.post-detail-container {
  padding: 20px 0;
}

.loading-text, .error-text {
  text-align: center;
  color: #b0b0b0;
  font-size: 16px;
  margin: 40px 0;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.post-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #444;
}

.post-title {
  font-size: 32px;
  color: #e0e0e0;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.category-tag {
  cursor: pointer;
  font-size: 14px;
}

.category-tag:hover {
  background-color: #409eff !important;
  color: white !important;
}

.post-author {
  color: #b0b0b0;
  font-size: 14px;
  font-weight: bold;
}

.post-date {
  color: #909399;
  font-size: 14px;
}

.post-body {
  margin-bottom: 40px;
}

.post-content-text {
  color: #e0e0e0;
  line-height: 1.8;
  font-size: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 마크다운 렌더링된 콘텐츠 스타일링 */
.post-content-text :deep(h1) {
  color: #ffffff;
  font-size: 28px;
  margin: 30px 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
  font-family: 'NanumBarunPenBold', sans-serif;
}

.post-content-text :deep(h2) {
  color: #ffffff;
  font-size: 24px;
  margin: 25px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #555;
  font-family: 'NanumBarunPenBold', sans-serif;
}

.post-content-text :deep(h3) {
  color: #ffffff;
  font-size: 20px;
  margin: 20px 0 10px 0;
  font-family: 'NanumBarunPenBold', sans-serif;
}

.post-content-text :deep(h4),
.post-content-text :deep(h5),
.post-content-text :deep(h6) {
  color: #ffffff;
  margin: 18px 0 8px 0;
  font-family: 'NanumBarunPenBold', sans-serif;
}

.post-content-text :deep(p) {
  margin: 16px 0;
  line-height: 1.8;
}

.post-content-text :deep(strong) {
  color: #ffffff;
  font-family: 'NanumBarunPenBold', sans-serif;
}

.post-content-text :deep(em) {
  color: #f0f0f0;
  font-style: italic;
}

.post-content-text :deep(a) {
  color: #409eff;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.post-content-text :deep(a:hover) {
  border-bottom-color: #409eff;
  color: #66b1ff;
}

.post-content-text :deep(ul),
.post-content-text :deep(ol) {
  margin: 16px 0;
  padding-left: 24px;
}

.post-content-text :deep(li) {
  margin: 8px 0;
  line-height: 1.6;
}

.post-content-text :deep(li p) {
  margin: 4px 0;
}

.post-content-text :deep(blockquote) {
  border-left: 4px solid #409eff;
  margin: 20px 0;
  padding: 16px 20px;
  background-color: #2a2a2a;
  border-radius: 6px;
  color: #d0d0d0;
  font-style: italic;
}

.post-content-text :deep(blockquote p) {
  margin: 8px 0;
}

.post-content-text :deep(code) {
  background-color: #3a3a3a;
  color: #f8f8f2;
  padding: 3px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 0.9em;
  border: 1px solid #555;
}

.post-content-text :deep(pre) {
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 20px 0;
  border: 1px solid #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.post-content-text :deep(pre code) {
  background: none;
  padding: 0;
  border: none;
  color: #f8f8f2;
  font-size: 14px;
  line-height: 1.5;
}

.post-content-text :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background-color: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #444;
}

.post-content-text :deep(th),
.post-content-text :deep(td) {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #444;
}

.post-content-text :deep(th) {
  background-color: #3a3a3a;
  color: #ffffff;
  font-family: 'NanumBarunPenBold', sans-serif;
}

.post-content-text :deep(td) {
  color: #e0e0e0;
}

.post-content-text :deep(tr:last-child td) {
  border-bottom: none;
}

.post-content-text :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.post-content-text :deep(hr) {
  border: none;
  height: 2px;
  background: linear-gradient(to right, transparent, #409eff, transparent);
  margin: 30px 0;
}

/* 인라인 코드와 일반 텍스트 구분 */
.post-content-text :deep(p code),
.post-content-text :deep(li code) {
  background-color: #404040;
  color: #ff6b6b;
  font-weight: 500;
}

/* 체크박스 리스트 스타일링 */
.post-content-text :deep(input[type="checkbox"]) {
  margin-right: 8px;
  transform: scale(1.2);
}

/* 마크다운 인용구 내 코드 */
.post-content-text :deep(blockquote code) {
  background-color: #404040;
  color: #66b1ff;
}

.bottom-navigation {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #444;
  flex-wrap: wrap;
  gap: 10px;
}

@media (max-width: 600px) {
  .navigation-buttons,
  .bottom-navigation {
    flex-direction: column;
    gap: 10px;
  }

  .post-title {
    font-size: 24px;
  }

  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>