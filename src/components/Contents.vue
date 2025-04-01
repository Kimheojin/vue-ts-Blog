<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// marked 설정
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code: string, lang: string) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));

// 테스트용 마크다운 문자열
const markdown = ref(`# 마크다운 테스트
일반 텍스트입니다.

## 코드 하이라이팅 테스트
\`\`\`typescript
function hello(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

\`\`\`javascript
console.log('테스트 성공!');
\`\`\`
`);

// 변환된 HTML
const html = ref('');

onMounted(() => {
  html.value = marked(markdown.value);
});
</script>

<template>
  <div>
    <h1>Marked + Highlight.js 테스트</h1>
    <div v-html="html"></div>
  </div>
</template>

<style scoped>
:deep(pre) {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
}

:deep(code) {
  font-family: monospace;
}
</style>