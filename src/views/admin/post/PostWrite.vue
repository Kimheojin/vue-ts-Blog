<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue';
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {container} from "tsyringe";
import CategoryRepository from "../../../repository/category/CategoryRepository.ts";
import PostRequest from "../../../entity/post/request/PostRequest.ts";
import type Category from "../../../entity/category/data/Category.ts";
import PostAdminRepository from "../../../repository/post/PostAdminRepository.ts";
import {useAdminAuth} from "../../../composables/useAdminAuth.ts";
import { useErrorHandler } from '../../../composables/useErrorHandler.ts';

const { customHandleError } = useErrorHandler();

const router = useRouter();
const POST_ADMIN_REPOSITORY = container.resolve(PostAdminRepository);
const CATEGORY_REPOSITORY = container.resolve(CategoryRepository);

const state = reactive({
  post: new PostRequest()
});

const categories = ref<Category[]>([]);
const isLoading = ref(false);
const isSubmitting = ref(false);

// 컴포넌트 마운트 시 인증 확인 및 카테고리 로드

const { isCheckingAuth, checkAuth } = useAdminAuth();

onMounted(async () => {
  const isAuth = await checkAuth();
  if (isAuth) {
    await loadCategories();
  }
});

async function loadCategories() {
  isLoading.value = true;
  try {
    categories.value = await CATEGORY_REPOSITORY.getCategories();
  } catch (error) {
    customHandleError(error, '카테고리를 불러오는데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
}

async function handleSubmit() {
  if (!state.post.title.trim()) {
    ElMessage.warning('제목을 입력해주세요.');
    return;
  }

  if (!state.post.content.trim()) {
    ElMessage.warning('내용을 입력해주세요.');
    return;
  }

  if (!state.post.categoryName) {
    ElMessage.warning('카테고리를 선택해주세요.');
    return;
  }

  isSubmitting.value = true;

  try {
    await POST_ADMIN_REPOSITORY.createPost(state.post);
    ElMessage.success('글이 성공적으로 작성되었습니다.');
    router.replace('/admin');
  } catch (error) {
    customHandleError(error, '글 작성에 실패했습니다.');
  } finally {
    isSubmitting.value = false;
  }
}

function handleCancel() {
  router.back();
}

function handleReset() {
  state.post = new PostRequest();
}
</script>
<template>
  <div class="post-write-page">
    <div class="post-write-container">
      <div v-if="isCheckingAuth" class="loading-text">
        인증 확인 중...
      </div>

      <div v-else>
        <h2 class="page-title bold-text">글 작성</h2>

        <el-form class="post-form" label-position="top">
          <el-form-item label="제목" class="bold-text">
            <el-input
                v-model="state.post.title"
                placeholder="제목을 입력해주세요"
                clearable
            />
          </el-form-item>

          <el-form-item label="카테고리" class="bold-text">
            <el-select
                v-model="state.post.categoryName"
                placeholder="카테고리를 선택해주세요"
                style="width: 100%"
                :loading="isLoading"
            >
              <el-option
                  v-for="category in categories"
                  :key="category.categoryId"
                  :label="category.categoryName"
                  :value="category.categoryName"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="발행 상태" class="bold-text">
            <el-select v-model="state.post.postStatus" style="width: 100%">

<!--              <el-option label="임시저장" value="DRAFT" />-->
              <el-option label="발행" value="PUBLISHED" />
              <el-option label="임시저장" value="DRAFT" />
              <el-option label="비공개" value="PRIVATE" />
              <el-option label="예약된" value="SCHEDULED" />
            </el-select>
          </el-form-item>

          <el-form-item label="내용" class="bold-text">
            <el-input
                v-model="state.post.content"
                type="textarea"
                placeholder="내용을 입력해주세요"
                :rows="20"
            />
          </el-form-item>

          <el-form-item>
            <div class="button-group">
              <el-button
                  type="primary"
                  @click="handleSubmit"
                  :loading="isSubmitting"
                  class="bold-text"
              >
                {{ isSubmitting ? '작성 중...' : '글 작성' }}
              </el-button>

              <el-button
                  @click="handleReset"
                  :disabled="isSubmitting"
                  class="bold-text"
              >
                초기화
              </el-button>

              <el-button
                  @click="handleCancel"
                  :disabled="isSubmitting"
                  class="bold-text"
              >
                취소
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style>

</style>