<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ElButton } from 'element-plus';

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
    <div class="header-content">
      <div class="logo-container">
        <img src="/public/HeoJin.png" alt="HeoJin" class="logo-image" />
      </div>
      <div class="buttons-container">
        <el-button
            class="nav-button blog-title"
            type="text"
            @click="goHome">허진블로그
        </el-button>

        <el-button
            class="nav-button about-button"
            type="text"
            @click="goToAboutMe">허진블로그
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
  max-width: 1200px;
}

.logo-container {
  margin-bottom: 8px;
}

.logo-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
}

.buttons-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 5px;
}

:deep(.el-button) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.nav-button {
  display: block;
  width: 140px;
  text-align: center;
  margin: 0;
  padding: 10px 0;
}

.blog-title {
  font-size: 20px;
  font-weight: bold;
  color: #e0e0e0;
}

.blog-title:hover {
  color: #ffffff;
}

.about-button {
  font-size: 14px;
  color: #b0b0b0;
}

.about-button:hover {
  color: #ffffff;
}
</style>