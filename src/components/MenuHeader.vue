<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
  router.push("/");
};

const goToAboutMe = () => {
  router.push("/about");
};
</script>

<template>
  <div class="header-container">
    <div class="header-content">
      <div class="logo-container">
        <img src="/HeoJin.png" alt="HeoJin" class="logo-image" />
      </div>
      <div class="buttons-container">
        <el-link class="nav-link blog-title" :underline="false" @click="goHome">허진블로그</el-link>
        <el-link class="nav-link about-link" :underline="false" @click="goToAboutMe">About me</el-link>
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
  padding: 10px;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80%;
}

.logo-container {
  margin-bottom: 1px;
}

.logo-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
}
.nav-link {
  display: block;
  width: 140px;
  text-align: center;
  padding: 3px 0;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
  Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

.blog-title {
  font-size: 20px;
  font-weight: bold;
  color: #e0e0e0;
}

.blog-title:hover {
  color: #ffffff;
}

.about-link {
  font-size: 14px;
  color: #b0b0b0;
}

.about-link:hover {
  color: #ffffff;
}
</style>