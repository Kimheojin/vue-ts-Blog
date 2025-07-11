<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true,
});

const aboutContent = `## Contact
- **Email**: hurjin1109@naver.com
- **GitHub**: https://github.com/Kimheojin

## 학력 & 자격
### 학력
- 홍익대학교 공과대학 컴퓨터공학과 졸업(2019.03 ~ 2025.08)

### 자격
- 정보처리기사
- AWS SAA
- SQLD
- 리눅스마스터 2급

### 논문
- **[Spring Framwork 캐싱 최적화 전략]** (2024.12) *[한국정보과학회]* [RISS 링크](https://www.riss.kr/search/detail/DetailView.do?p_mat_type=1a0202e37d52c72d&control_no=cd9dc3cecb211246b7998d826d417196&keyword=)

## 기술 스택
- 백엔드 : Spring Framework, Spring boot, Spring Security, QueryDsl 등
- 인프라 : AWS
- DevOps: Docker, Docker Compose 등
- 프론트 : Vue, React, TypeScript, Html, Css 등

## 프로젝트
### 개인 프로젝트
1. 개인 블로그 구현 프로젝트
- 백 엔드 코드 주소 : [https://github.com/Kimheojin/Blog-Spring.git](https://github.com/Kimheojin/Blog-Spring.git)
- 프론트 엔드 코드 주소 : [https://github.com/Kimheojin/vue-ts-Blog.git](https://github.com/Kimheojin/vue-ts-Blog.git)
- 배포 주소: [https://heojinblog.vercel.app/](https://heojinblog.vercel.app/)

### 팀 프로젝트
1. **도서 추천 및 공공 도서관 연계 서비스 프로젝트**
- 백엔드 코드 주소: [https://github.com/Kimheojin/CheckLogOut-server.git](https://github.com/Kimheojin/CheckLogOut-server.git)`;

const renderedContent = computed(() => {
  return marked(aboutContent);
});
</script>

<template>
  <div class="about-page">
    <div class="about-container">
      <article class="markdown-body" v-html="renderedContent"></article>
    </div>
  </div>
</template>

<style scoped>
@import url('https://hangeul.pstatic.net/hangeul_static/css/nanum-barun-pen.css');

.about-page {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'NanumBarunPen', sans-serif;
}

.about-container {
  padding: 20px;
}

:deep(.markdown-body) {
  box-sizing: border-box;
  min-width: 200px;
  max-width: 100%;
  margin: 0;
  padding: 0;
  background-color: transparent !important;
  line-height: 1.8;
  letter-spacing: 0.05em;
}

:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3),
:deep(.markdown-body h4),
:deep(.markdown-body h5),
:deep(.markdown-body h6) {
  font-family: 'NanumBarunPenBold', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  word-break: keep-all;
}

:deep(.markdown-body h1) {
  color: #fff86b;
  line-height: 1.5;
  font-size: 2.5em;
}

:deep(.markdown-body h2) {
  color: #CDDC39;
  line-height: 1.5;
  font-size: 2em;
}

:deep(.markdown-body h3) {
  color: #719b3d;
  line-height: 1.5;
  font-size: 1.7em;
}

:deep(.markdown-body h4) {
  color: #4b8a23;
  line-height: 1.5;
  font-size: 1.4em;
}

:deep(.markdown-body p),
:deep(.markdown-body li),
:deep(.markdown-body blockquote) {
  font-family: 'NanumBarunPen', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  word-break: keep-all;
  overflow-wrap: break-word;
}

:deep(.markdown-body code),
:deep(.markdown-body pre) {
  font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', 'Courier New', monospace;
}

@media (max-width: 767px) {
  .about-container {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .about-container {
    padding: 10px;
  }
}
</style>