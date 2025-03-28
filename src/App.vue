<script setup lang="ts">

import { useDark } from '@vueuse/core'
const isDark = useDark()

isDark.value = true
</script>


<template>

  <el-container>
    <el-header class="header">
      <Header />
    </el-header>
    <el-container>
      <el-aside width="150px" class="sidebar-with-border">
        <Menu />
      </el-aside>
      <el-main>
        <Contents />
      </el-main>
    </el-container>
  </el-container>

</template>



<style>



.header{
  border-bottom: 1px solid #e0e0e0; /* Light gray border at the bottom */
  padding-bottom: 10px; /* Add some padding to separate content from the line */
}
.sidebar-with-border {
  border: 1px solid #ffffff; /* 흰색 테두리 */
  border-radius: 8px;
  margin-top: 10px;
  padding: 5px;
}


html.dark {
  --el-bg-color: #242424;
  --el-bg-color-overlay: #2a2a2a;

  --el-text-color-primary: #e0e0e0;
  --el-text-color-regular: #c0c0c0;

  --el-fill-color-blank: #2c2c2c;
  --el-fill-color: #303030;
  --el-fill-color-light: #363636;
  --el-fill-color-darker: #222222;

  --el-border-color: #444444;
  --el-border-color-light: #3a3a3a;
}


html.dark body {
  background-color: #2c2c2c;
  color: #e0e0e0;
}
</style>