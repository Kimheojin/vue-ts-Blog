<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const headerTitle = computed(() => {
  if (route.path === '/' || route.path === '/posts') {
    return '전체 게시글';
  }else if (route.path === '/about'){
    return 'About me'
  } else if (route.path.startsWith('/category/')) {
    const categoryName = route.path.split('/category/')[1];
    // 뒤로 가기 시 글자 깨지는 현상 제거
    const decodedName = decodeURIComponent(categoryName);
    return `${decodedName}`;
  } else if (route.path.startsWith('/admin')){
    return '관리자 페이지';
  }
    return '';
});
</script>

<template>
  <el-row>
    <el-col class="fixed-width">
      <div class="centered-text">{{ headerTitle }}</div>
    </el-col>
  </el-row>
</template>

<style scoped>
.fixed-width {
  width: 800px; /* 원하는 고정된 가로 크기 */
  word-wrap: break-word; /* 긴 단어도 잘라서 줄바꿈 */
  margin: 0 auto; /* 컬럼 자체를 화면 중앙에 배치 */
}

.centered-text {
  margin-top: 50px;
  font-size: 40px;
  text-align: center; /* 텍스트를 가로 중앙 정렬 */
  margin-bottom: 50px;
  font-weight: bold;
  min-height: 20px;  /* 최소 공백 유지 */
}
</style>