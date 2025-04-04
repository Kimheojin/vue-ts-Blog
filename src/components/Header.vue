<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElButton, ElDivider } from 'element-plus';

const router = useRouter();

const goHome = () => {
  router.push('/');
}

const goToAboutMe = () => {
  router.push('/about');
}
</script>

<template>
  <div class="header-container">
    <el-button
        class="blog-title"
        type="text"
        @click="goHome">
      허진 블로그
    </el-button>



    <el-button
        class="about-button"
        type="text"
        @click="goToAboutMe">
      소개
    </el-button>
  </div>
</template>

<style scoped>
.header-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 10px;
}

:deep(.el-button) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.blog-title {
  font-size: 20px;
  font-weight: bold;
  color: #e0e0e0;
  margin-bottom: 5px;
}

.blog-title:hover {
  color: #ffffff;
}

:deep(.el-divider) {
  margin: 10px 0;
  width: 70%;
  border-color: #444;
}

.about-button {
  font-size: 16px;
  color: #b0b0b0;
}

.about-button:hover {
  color: #ffffff;
}
</style>