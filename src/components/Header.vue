<script setup lang="ts">
import router from "../router";

const goHome = () => {
  router.push('/')
}
const goToGithub = () => {
  window.open('https://github.com/Kimheojin', '_blank');
}
</script>

<template>
  <div class="header-container">
    <div class="left-section">
      <div class="github-icon" @click="goToGithub">
        <img src="/github-logo.png" alt="GitHub" />
      </div>
    </div>

    <div class="center-section">
      <div class="site-title" @click="goHome">
        허진 블로그
      </div>
    </div>

    <div class="right-section">
      <!-- 오른쪽 여백을 위한 빈 공간 // GitHub 아이콘과 동일한 너비 -->
    </div>
  </div>
</template>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
}

.left-section {
  flex: 0 0 auto;
  margin-right: 10px;
}

.center-section {
  flex: 1;
  display: flex;
  justify-content: center;
}

.right-section {
  flex: 0 0 40px; /* GitHub 아이콘과 동일한 공간*/
}

.github-icon {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.github-icon img {
  width: 30px;
  height: 30px;
  vertical-align: middle;
}

.site-title {
  cursor: pointer;
  font-size: 1.8rem;
}
</style>