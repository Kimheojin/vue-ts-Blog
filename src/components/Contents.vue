<script setup lang="ts">

</script>
<template>
  <el-row>
    <el-col class="fixed-width">
      <router-view></router-view>
    </el-col>
  </el-row>
</template>
<style scoped>
.fixed-width {
  width: 1000px; /* 원하는 고정된 가로 크기 */
  word-wrap: break-word; /* 긴 단어도 잘라서 줄바꿈 */
}
</style>