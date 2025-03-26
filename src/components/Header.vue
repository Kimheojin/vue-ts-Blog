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
    <div class="github-icon" @click="goToGithub">
      <img src="/github-logo.png" alt="GitHub" />
    </div>
    <div class="site-title" @click="goHome">허진 블로그</div>
  </div>
</template>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
}

.github-icon {
  cursor: pointer;
  margin-right: 15px;
  position: absolute;
  left: 0;
  top: 0;
}

.github-icon img {
  width: 18px;
  height: 18px;
  vertical-align: middle;
}
.site-title {
  cursor: pointer;
  font-size: 1.8rem;
  margin: 0 auto;
}
</style>