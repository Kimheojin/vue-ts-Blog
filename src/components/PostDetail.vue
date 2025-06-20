<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { container } from 'tsyringe';
import { ElMessage } from 'element-plus';
import { marked } from 'marked';
import PostRepository from '../repository/post/PostRepository.ts';
import PostItem from '../entity/post/data/PostItem.ts';
import PostComments from '../components/PostComments.vue';

const route = useRoute();
const router = useRouter();
const POST_REPOSITORY = container.resolve(PostRepository);

const post = ref<PostItem>(new PostItem());
const isLoading = ref(true);
const postId = ref<number>(0);

marked.setOptions({
  breaks: true,
  gfm: true,
});

const renderedContent = computed(() => {
  if (!post.value.content) return '';
  return marked(post.value.content);
});

const isPostLoaded = computed(() => {
  return post.value.postId > 0;
});

onMounted(async () => {
  postId.value = Number(route.params.postId);
  await loadPost();
});

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
    router.replace('/');
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
</script>

<template>
  <div class="post-detail-page">
    <div class="post-detail-container">
      <div v-if="isLoading" class="loading-text">
        게시글을 불러오는 중...
      </div>

      <div v-else-if="isPostLoaded" class="post-content">
        <div class="post-header">
          <div class="post-title">{{ post.title }}</div>
          <div class="post-meta">
            <el-tag class="category-tag"
                    size = 'large'
                    type="warning"
                    effect="plain"
                    @click="goToCategory(post.categoryName)">
              {{ post.categoryName }}
            </el-tag>
            <span class="post-author">{{ post.memberName }}</span>
            <span class="post-date">{{ formatDate(post.regDate) }}</span>
          </div>
        </div>

        <!-- GitHub 마크다운 스타일 적용 -->
        <div class="post-body">
          <article class="markdown-body" v-html="renderedContent"></article>
        </div>

        <div class="bottom-navigation">
          <el-button @click="goBack" type='warning' text bg >이전으로</el-button>
          <el-button @click="goToCategory(post.categoryName)" type='warning' text bg>
            {{ post.categoryName }} 카테고리 더 보기
          </el-button>
        </div>
        <PostComments :post-id="post.postId" />
      </div>

      <div v-else class="error-text">
        게시글을 찾을 수 없습니다.
      </div>
    </div>
  </div>
</template>

<style scoped>
/* GitHub Markdown CSS import */
@import url('https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.1/github-markdown-dark.min.css');

/* 나눔바른펜 폰트 */
@import url('https://hangeul.pstatic.net/hangeul_static/css/nanum-barun-pen.css');

.post-detail-page {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'NanumBarunPen', sans-serif;
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
  gap: 10px;
}

.post-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #444;
}

.post-title {
  font-size: 32px;
  color: #ffffff;
  margin: 0 0 20px 0;
  line-height: 1.4;
  word-break: keep-all;
  font-weight: bold;
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

/* GitHub 마크다운 스타일 커스터마이징 */
.markdown-body {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 100%;
  margin: 0;
  padding: 0;
  font-family: 'NanumBarunPen', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  background-color: transparent !important;
}

/* 한글 폰트 적용 */
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  font-family: 'NanumBarunPenBold', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  word-break: keep-all;
}

.markdown-body p,
.markdown-body li,
.markdown-body blockquote {
  font-family: 'NanumBarunPen', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  word-break: keep-all;
  overflow-wrap: break-word;
}

/* 코드 폰트는 모노스페이스 유지 */
.markdown-body code,
.markdown-body pre {
  font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', 'Courier New', monospace;
}

.bottom-navigation {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #444;
  flex-wrap: wrap;
  gap: 10px;
}

/* 반응형 */
@media (max-width: 767px) {
  .post-detail-container {
    padding: 15px;
  }

  .navigation-buttons,
  .bottom-navigation {
    flex-direction: column;
    gap: 10px;
  }

  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .post-title {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .post-detail-container {
    padding: 10px;
  }
}
</style>