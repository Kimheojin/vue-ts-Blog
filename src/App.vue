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
      <el-main class="content-with-border">
        <div class="centered-content">
          <Contents />
        </div>
      </el-main>
      <!-- 오른쪽에 동일한 너비의 aside 추가 -->
      <el-aside width="150px" class="sidebar-with-border right-sidebar">
        <!-- 임시로 Menu 추가 -->
        <Menu />
      </el-aside>
    </el-container>
  </el-container>
</template>

<style>
.centered-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.header{
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.sidebar-with-border {
  border: 1px solid #ffffff; /* 흰색 테두리 */
  border-radius: 8px;
  margin-top: 10px;
  padding: 5px;
}

.right-sidebar {
  margin-right: 10px; /* 오른쪽 여백 추가 // 균형 맞추려고 */
}

.content-with-border {
  border: 1px solid #ffffff; /* 흰색 테두리 */
  border-radius: 8px;
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
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