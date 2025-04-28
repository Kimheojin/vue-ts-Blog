<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();

function goToLogin () {
  router.push("/login")
};
</script>
<template>
  <div class="admin-page">
    <div class="admin-container">
    <h2 class="admin-title">관리자 페이지</h2>

    <div class="admin-content">
      <p class="admin-message">
        이 페이지는 관리자만 접근할 수 있는 영역입니다.
      </p>
      <p class="admin-description">
        계속하려면 로그인하세요.
      </p>

      <div class="admin-actions">
        <button class="login-button" @click="goToLogin">
          로그인
        </button>
      </div>
    </div>
</div>
</div>


</template>

<style scoped>

</style>