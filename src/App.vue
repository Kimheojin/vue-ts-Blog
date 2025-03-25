<script setup lang="ts">

</script>


<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">허진 블로그</el-header>
      <el-container>
        <el-aside width="150px">
          <Menu />
        </el-aside>
        <el-main>content라우터 들어갈 곳</el-main>
      </el-container>
    </el-container>
  </div>
</template>



<style scoped>
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 24px;

}
</style>
