<script setup lang="ts">
import {useRouter} from "vue-router";

const router = useRouter();

const goToLogin = () => {
  router.push("/login");
  console.log("로그인 클릭됨");
};
</script>

<template>
  <div class="menu-container">
    <div class="categories-section">카테고리</div>

    <div class="login-container">
      <button class="login-button" @click="goToLogin">로그인</button>
    </div>
  </div>
</template>

<style scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.login-container {
  /* 로그인 버튼 컨테이너 스타일 */
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-bottom: 1px;
}

.login-button:hover {
  color: #ffffff;
}
</style>
