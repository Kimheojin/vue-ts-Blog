<script setup lang="ts">
import { useDark, useBreakpoints } from '@vueuse/core'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Contents from "./components/Contents.vue";
import MenuHeader from "./components/MenuHeader.vue";
import ContentsHeader from "./components/ContentsHeader.vue";

// 다크 모드 설정
const isDark = useDark()
isDark.value = true

// VueUse breakpoints
const breakpoints = useBreakpoints({
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  widescreen: 1280
})

// 반응형 화면 크기 확인
const isTabletOrLarger = breakpoints.greater('tablet')

// 줌 레벨 관리
const zoomLevel = ref(1)

// 줌 레벨 업데이트 함수 - visualViewport API 활용
const updateZoomLevel = () => {
  if (window.visualViewport) {
    zoomLevel.value = window.visualViewport.scale
  } else {
    // 대체 방법
    zoomLevel.value = window.innerWidth / window.screen.width
  }
}

// 사이드바 표시 여부 결정 (breakpoints와 zoomLevel 기반)
const showSidebar = computed(() => {
  // 태블릿 이상 크기이고 줌 레벨이 1.3 미만일 때 표시
  return isTabletOrLarger.value && zoomLevel.value < 1.3
})

// 이벤트 리스너 관리
onMounted(() => {
  // 초기 줌 레벨 설정
  updateZoomLevel()

  // 줌/리사이즈 이벤트 감지
  window.addEventListener('resize', updateZoomLevel)

  // visualViewport 이벤트
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateZoomLevel)
    window.visualViewport.addEventListener('scroll', updateZoomLevel)
  }
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('resize', updateZoomLevel)

  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', updateZoomLevel)
    window.visualViewport.removeEventListener('scroll', updateZoomLevel)
  }
})
</script>
<template>
  <el-container class="main-container">
    <!-- 사이드바 -->
    <el-aside
        width="200px"
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
/* Base styling */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
}

/* Sidebar header section */
.sidebar-header {
  margin-bottom: 7px;
}

/* Square header container with rounded corners */
.header-square {
  width: 100%;
  aspect-ratio: 1 / 1;
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
  width: 1300px; /* 항상 전체 너비 사용 */
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