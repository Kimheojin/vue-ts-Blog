<script setup lang="ts">
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {container} from "tsyringe";
import CategoryRepository from "../repository/category/CategoryRepository.ts";
import type Category from "../entity/category/data/Category.ts";

const router = useRouter();
const CATEGORY_REPOSITORY = container.resolve(CategoryRepository);
const categories = ref<Category[]>([]);
const isLoading = ref(true);

const goToAdmin = () => {
  router.push("/admin");
};

const goToCategory = (categoryName: string) => {
  router.push(`/category/${categoryName}`);
};

onMounted(async () => {
  try {
    categories.value = await CATEGORY_REPOSITORY.getCategories();
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
      <el-link type="warning" class="bold-text" :underline="false">글 전체보기</el-link>

      <!-- 로딩 상태 표시 -->
      <div v-if="isLoading" class="bold-text">카테고리 로딩 중...</div>

      <!-- 카테고리 목록 - el-link 사용 -->
      <div v-else class="category-list">
        <el-link
            v-for="category in categories"
            :key="category.categoryId"
            @click="goToCategory(category.categoryName)"
            class="category-item bold-text"
            :underline="false"
        >
          {{ category.categoryName }}
        </el-link>
      </div>
    </div>

    <div class="admin-container">
      <el-link class="admin-button bold-text"
               type="info"
               :underline="false"
               @click="goToAdmin">관리자 페이지</el-link>
    </div>
  </div>
</template>
<style scoped>
/* 나눔바른펜 폰트 import */
@import url('https://hangeul.pstatic.net/hangeul_static/css/nanum-barun-pen.css');

/* 굵은 글씨체 적용 */
.bold-text {
  font-family: 'NanumBarunPenBold', sans-serif;
}

.menu-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: 'NanumBarunPenBold', sans-serif;
}

.admin-container {
  /* 관리자 페이지 버튼 컨테이너 스타일 */
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.admin-button:hover {
  color: #ffffff;
}

.category-list {
  font-family: 'NanumBarunPenBold', sans-serif;
  display: flex;
  flex-direction: column;
  margin-top: 2px;
}

.category-item {
  font-family: 'NanumBarunPenBold', sans-serif;
  display: block;
  margin-top: 8px;
}
</style>