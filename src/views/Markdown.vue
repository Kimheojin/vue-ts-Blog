<script setup lang="ts">
import { ref } from 'vue';
import MarkdownRender from '../components/MarkdownRender.vue';

// 테스트용 마크다운 콘텐츠
const markdownContent = ref(`
# 허진 블로그에 오신 것을 환영합니다!

## 블로그 소개

- **개발 도구**: Git, Docker, CI/CD


*마지막 업데이트: 2025년 4월*
`);
</script>

<template>
  <div class="markdown-page">
    <div class="markdown-container">
      <MarkdownRender :content="markdownContent" />
    </div>
  </div>
</template>

<style scoped>
.markdown-page {
  padding: 20px;
  max-width: 800px;
  margin: 40px auto; /* 상단 마진 추가 */
  min-height: 100%;
  overflow: visible;
}
.markdown-container {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 20px; /* 추가 상단 마진 */
  overflow: visible;
}

/* 마크다운 콘텐츠 스타일 보강 */
:deep(h1) {
  color: #e0e0e0;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

:deep(h2) {
  color: #d0d0d0;
  margin-top: 30px;
}

:deep(h3) {
  color: #c0c0c0;
}

:deep(p) {
  line-height: 1.6;
  margin-bottom: 16px;
}

:deep(ul), :deep(ol) {
  padding-left: 20px;
  margin-bottom: 16px;
}

:deep(li) {
  margin-bottom: 8px;
}

:deep(code) {
  background-color: #333;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

:deep(pre) {
  background-color: #333;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin-bottom: 16px;
}

:deep(blockquote) {
  border-left: 4px solid #555;
  padding-left: 16px;
  color: #aaa;
  font-style: italic;
  margin: 16px 0;
}

:deep(hr) {
  border: none;
  border-top: 1px solid #444;
  margin: 24px 0;
}

:deep(a) {
  color: #58a6ff;
  text-decoration: none;
}

:deep(a:hover) {
  text-decoration: underline;
}

:deep(strong) {
  color: #ffffff;
}
</style>