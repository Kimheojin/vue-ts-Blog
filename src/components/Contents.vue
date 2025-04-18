<script setup lang="ts">

</script>

<template>
  <div class="content-wrapper">
    <router-view></router-view>
  </div>
</template>

<style scoped>
.content-wrapper {
  width: 100%;
  max-width: 1200px;
  height: auto; /* 'auto'로 변경하여 컨텐츠 높이에 맞게 조정 */
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 'center'에서 'flex-start'로 변경 */
  padding-top: 20px; /* 상단 패딩 추가 */
  overflow-x: visible;
  overflow-y: visible;
}
</style>