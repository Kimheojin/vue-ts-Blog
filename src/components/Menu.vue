<script setup lang="ts">
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { container } from "tsyringe";
import CategoryRepository from "../repository/CategoryRepository.ts";
import type Category from "../entity/data/Category.ts";

// 타입 정의 추가 (Category 인터페이스가 없어 추가했습니다)


const router = useRouter();
const CATEGORY_REPOSITORY = container.resolve(CategoryRepository);
const categories = ref<Category[]>([]); // CAtegory -> Category 오타 수정
const isLoading = ref(true);

const goToLogin = () => {
  router.push("/login");
};

const goToCategory = (categoryId: string) => {
  router.push(`/category/${categoryId}`); // 템플릿 리터럴 수정
};

onMounted(async () => {
  try {
    const response = await CATEGORY_REPOSITORY.getCategories();
    categories.value = response;
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
      <el-button>글 전체보기</el-button>

      <!-- 로딩 상태 표시 -->
      <div v-if="isLoading">카테고리 로딩 중...</div>

      <!-- 카테고리 목록 -->
      <ul v-else class="category-list">
        <li v-for="category in categories"
            :key="category.id"
            @click="goToCategory(category.categoryName)"
            class="category-item">
          {{ category.categoryName}}
        </li>
      </ul>
    </div>

    <div class="login-container">
      <button class="login-button" @click="goToLogin">관리자 로그인</button>
    </div>
  </div>
</template>

<style scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.login-container {
  /* 로그인 버튼 컨테이너 스타일 */
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-bottom: 1px;
}

.login-button:hover {
  color: #ffffff;
}
</style>
