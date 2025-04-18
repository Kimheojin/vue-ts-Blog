<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { marked } from 'marked';

// 마크다운 내용만 prop으로 받기
const props = defineProps<{
  content: string;
}>();

// 변환된 HTML을 저장할 ref
const html = ref('');

// 마크다운을 HTML로 변환하는 함수
const renderMarkdown = async () => {
  try {
    // marked 함수가 Promise를 반환하는 경우를 처리
    const result = await marked(props.content);
    html.value = result;
  } catch (error) {
    console.error('마크다운 변환 중 오류:', error);
    html.value = '마크다운 변환 중 오류가 발생했습니다.';
  }
};

// watcher와 onMounted에서 비동기 처리 추가
watch(() => props.content, async () => {
  await renderMarkdown();
});

// 컴포넌트 마운트 시 초기 렌더링
onMounted(async () => {
  await renderMarkdown();
});
</script>

<template>
  <div class="markdown-content" v-html="html"></div>
</template>

<style scoped>

</style>
