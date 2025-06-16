<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Contents from "./components/Contents.vue";
import MenuHeader from "./components/MenuHeader.vue";
import ContentsHeader from "./components/ContentsHeader.vue";

// 다크 모드 설정
import { useDark } from '@vueuse/core'
const isDark = useDark()
isDark.value = true

// 그거 반응형으로
const currentWidth = ref(window.innerWidth)

// 화면 너비 업데이트 함수
const updateWidth = () => {
  currentWidth.value = window.innerWidth
}

// 사이드바 표시 여부 결정 (1000px 기준)
const showSidebar = computed(() => {
  // 가로 너비가 1200px 이상일 때만 사이드바 표시
  // content 가로 1000 px
  // 왼쪽 사이드바 250
  return currentWidth.value > 1250
})

// 이벤트 리스너 관리
onMounted(() => {
  // 초기 화면 너비 설정
  updateWidth()

  // 리사이즈 이벤트 감지
  window.addEventListener('resize', updateWidth)
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})
</script>
<template>
  <el-container class="main-container">
    <!-- 사이드바 -->
    <el-aside
        width="250px"
        class="left-sidebar"
        v-if="showSidebar">
      <div class="sidebar-header">
        <div class="header-square">
          <MenuHeader />
        </div>
      </div>

      <div class="sidebar-menu">
        <Menu />
      </div>
    </el-aside>

    <el-main
        class="main-content"
             :class="{ 'full-width': !showSidebar }">

      <el-row>
        <el-col :span="24" class="header-content-container">
          <ContentsHeader />
          <Contents  />
        </el-col>
      </el-row>


    </el-main>
  </el-container>
</template>

<style>
/* 나눔바른펜 폰트 import */
@import url('https://hangeul.pstatic.net/hangeul_static/css/nanum-barun-pen.css');

/* Base styling */
body {
  margin: 0;
  font-family: 'NanumBarunPen', sans-serif;
}

/* 굵은 글씨체용 // class 는 여러개 추가 가능 */
.bold-text {
  font-family: 'NanumBarunPenBold', sans-serif;
}

.main-container {
  min-height: 100vh;
  position: relative;
}

/* Left sidebar styling */
.left-sidebar {
  background-color: #1e1e1e;
  color: #e0e0e0;
  padding: 15px;
  border-right: 1px solid #333;
  /*  display: flex; */
  flex-direction: column;
  transition: all 0.3s ease;

  /* 고정 사이드바 */
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

/* Sidebar header section */
.sidebar-header {
  margin-bottom: 7px;
}

/* Square header container with rounded corners */
.header-square {
  width: 100%;
  background-color: #2a2a2a;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid #444;
}

/* Sidebar menu section */
.sidebar-menu {
  flex-grow: 1;
  overflow-y: auto;
  padding: 15px;
  background-color: #2a2a2a;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid #444;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
}

/* 메인 콘텐츠 영역 */
.main-content {
  background-color: #2c2c2c;
  padding: 0;
  overflow-y: auto;
  display: flex;
  justify-content: center;
}

/* 사이드바가 숨겨졌을 때 콘텐츠 영역 확장 */
.full-width {
  width: 100%;
  transition: width 0.3s ease;
}

html.dark body {
  background-color: #2c2c2c;
  color: #e0e0e0;
}
.header-content-container {
  width: 100%;
  height: auto;
  /* 또는 원하는 고정 너비 (예: 1600px) */
  margin: 0 auto; /* 가운데 정렬 */
}
</style>