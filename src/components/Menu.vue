<script setup lang="ts">
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {container} from "tsyringe";
import CategoryRepository from "../repository/category/CategoryRepository.ts";
import type CategoryWithCount from "../entity/category/data/CategoryWithCount.ts";

const router = useRouter();
const CATEGORY_REPOSITORY = container.resolve(CategoryRepository);
const categories = ref<CategoryWithCount[]>([]);
const isLoading = ref(true);

const goToAdmin = () => {
  router.push("/admin");
};

const goToCategory = (categoryName: string) => {
  router.push(`/category/${categoryName}`);
};

const goToAllPosts = () => {
  router.push("/posts");
};

onMounted(async () => {
  try {
    categories.value = await CATEGORY_REPOSITORY.getCategoriesAndPostCount();
    isLoading.value = false;
  } catch (error) {
    console.error("카테고리를 불러오는 중 오류가 발생했습니다:", error);
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="menu-container">
    <div class="categories-section">
      <el-link type="warning" class="regular-text" :underline="false" @click="goToAllPosts">글 전체보기</el-link>

      <!-- 로딩 상태 표시 -->
      <div v-if="isLoading" class="regular-text">카테고리 로딩 중...</div>

      <!-- 카테고리 목록 - el-link 사용 -->
      <div v-else class="category-list">
        <el-link
            v-for="category in categories"
            :key="category.categoryId"
            @click="goToCategory(category.categoryName)"
            class="category-item regular-text"
            :underline="false"
        >
          <span class="category-name">{{ category.categoryName }}</span>
          <span class="post-count" >({{ category.postCount }})</span>
        </el-link>

      </div>
    </div>

    <div class="admin-container">
      <el-link class="admin-button regular-text"
               type="info"
               :underline="false"
               @click="goToAdmin">관리자 페이지
      </el-link>
    </div>
  </div>
</template>

<style scoped>
/* 나눔바른펜 폰트 import */
@import url('https://hangeul.pstatic.net/hangeul_static/css/nanum-barun-pen.css');

/* 일반 글씨체 적용 + bold 체 */
.regular-text {
  font-family: 'NanumBarunPen', sans-serif;
  font-size: 16px;
  font-weight: bold;
}

.menu-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: 'NanumBarunPen', sans-serif;
}

.admin-container {
  /* 관리자 페이지 버튼 컨테이너 스타일 */
  margin-top: 14px;
  display: flex;
  justify-content: center;
}

.admin-button:hover {
  color: #59ff40;
}

.category-list {
  font-family: 'NanumBarunPen', sans-serif;
  display: flex;
  flex-direction: column;
  margin-top: 6px;
}

.category-item {
  font-family: 'NanumBarunPen', sans-serif;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.category-name {
  flex: 1;
}

.post-count {
  color: #909399;
  font-size: 0.9em;
  margin-left: 8px;
}
</style>