<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { container } from "tsyringe";
import PostAdminRepository from "../../repository/post/PostAdminRepository.ts";
import CategoryRepository from "../../repository/category/CategoryRepository.ts";
import AuthService from "../../service/AuthService.ts";
import ModifyPostRequest from "../../entity/post/request/ModifyPostRequest.ts";
import type PostItem from "../../entity/post/data/PostItem.ts";
import type Category from "../../entity/category/data/Category.ts";
import type PostPageResponse from "../../entity/post/response/PostPageResponse.ts";
import type HttpError from "../../http/HttpError.ts";

const router = useRouter();
const POST_ADMIN_REPOSITORY = container.resolve(PostAdminRepository);
const CATEGORY_REPOSITORY = container.resolve(CategoryRepository);
const AUTH_SERVICE = container.resolve(AuthService);

const posts = ref<PostItem[]>([]);
const categories = ref<Category[]>([]);
const selectedPost = ref<PostItem | null>(null);
const isLoading = ref(false);
const isModifying = ref(false);
const isCheckingAuth = ref(true);
const currentPage = ref(0);
const totalPages = ref(0);
const totalElements = ref(0);

const state = reactive({
  post: new ModifyPostRequest()
});

onMounted(() => {
  checkAuth();
});

async function checkAuth() {
  try {
    const isAuthenticated = await AUTH_SERVICE.isAuthenticated();

    if (!isAuthenticated) {
      ElMessage.warning('로그인이 필요합니다.');
      router.replace("/admin/login");
      return;
    }

    await Promise.all([loadPosts(), loadCategories()]);
  } catch (error) {
    console.error('인증 확인 중 오류:', error);
    ElMessage.warning('세션이 만료되었습니다. 다시 로그인해주세요.');
    router.replace("/admin/login");
  } finally {
    isCheckingAuth.value = false;
  }
}

async function loadPosts(page: number = 0) {
  isLoading.value = true;
  try {
    const response: PostPageResponse<PostItem> = await POST_ADMIN_REPOSITORY.getAdminPagePosts(page, 10);
    posts.value = response.content;
    currentPage.value = response.pageNumber;
    totalPages.value = response.totalPages;
    totalElements.value = response.totalElements;
  } catch (error) {
    ElMessage.error('게시글을 불러오는데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
}

async function loadCategories() {
  try {
    categories.value = await CATEGORY_REPOSITORY.getCategories();
  } catch (error) {
    ElMessage.error('카테고리를 불러오는데 실패했습니다.');
  }
}

function handleSelectPost(post: PostItem) {
  selectedPost.value = post;
  state.post.postId = post.postId;
  state.post.title = post.title;
  state.post.content = post.content;
  state.post.categoryName = post.categoryName;
  state.post.postStatus = post.status;
}

async function handleModify() {
  if (!selectedPost.value) {
    ElMessage.warning('수정할 게시글을 선택해주세요.');
    return;
  }

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

  isModifying.value = true;

  try {
    await POST_ADMIN_REPOSITORY.modifyPost(state.post);
    ElMessage.success('게시글이 성공적으로 수정되었습니다.');

    selectedPost.value = null;
    state.post = new ModifyPostRequest();
    await loadPosts(currentPage.value);

  } catch (error) {
    const httpError = error as HttpError;
    ElMessage.error('게시글 수정에 실패했습니다: ' + httpError.getMessage());
  } finally {
    isModifying.value = false;
  }
}

async function handlePageChange(page: number) {
  await loadPosts(page - 1);
}

function handleCancel() {
  router.back();
}

function handleReset() {
  selectedPost.value = null;
  state.post = new ModifyPostRequest();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR');
}

function getStatusText(status: string): string {
  return status === 'PUBLISHED' ? '발행' : '임시저장';
}
</script>

<template>
  <div class="post-modify-page">
    <div class="post-modify-container">
      <div v-if="isCheckingAuth" class="loading-text">
        인증 확인 중...
      </div>

      <div v-else>
        <h2 class="page-title bold-text">게시글 수정</h2>

        <div v-if="isLoading" class="loading-text">
          게시글 목록을 불러오는 중...
        </div>

        <div v-else-if="posts.length === 0" class="empty-text">
          수정할 게시글이 없습니다.
        </div>

        <div v-else>
          <!-- 게시글 선택 섹션 -->
          <div class="section">
            <h3 class="section-title bold-text">수정할 게시글 선택</h3>

            <div class="posts-info">
              총 {{ totalElements }}개의 게시글
            </div>

            <div class="posts-list">
              <div
                  v-for="post in posts"
                  :key="post.postId"
                  class="post-item"
                  :class="{ 'selected': selectedPost?.postId === post.postId }"
                  @click="handleSelectPost(post)"
              >
                <h4 class="post-title">{{ post.title }}</h4>
                <div class="post-meta">
                  <span class="post-author">{{ post.memberName }}</span>
                  <span class="post-category">{{ post.categoryName }}</span>
                  <span class="post-status">{{ getStatusText(post.status) }}</span>
                  <span class="post-date">{{ formatDate(post.regDate) }}</span>
                </div>
              </div>
            </div>

            <div class="pagination-container" v-if="totalPages > 1">
              <el-pagination
                  v-model:current-page="currentPage"
                  :page-size="10"
                  :total="totalElements"
                  layout="prev, pager, next"
                  @current-change="handlePageChange"
              />
            </div>
          </div>

          <!-- 수정 폼 섹션 -->
          <div v-if="selectedPost" class="form-section">
            <h3 class="section-title bold-text">게시글 정보 수정</h3>

            <el-form class="modify-form" label-position="top">
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
                  <el-option label="발행" value="PUBLISHED" />
                  <el-option label="임시저장" value="DRAFT" />
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
                      @click="handleModify"
                      :loading="isModifying"
                      class="bold-text"
                  >
                    {{ isModifying ? '수정 중...' : '게시글 수정' }}
                  </el-button>

                  <el-button
                      @click="handleReset"
                      :disabled="isModifying"
                      class="bold-text"
                  >
                    선택 취소
                  </el-button>

                  <el-button
                      @click="handleCancel"
                      :disabled="isModifying"
                      class="bold-text"
                  >
                    돌아가기
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>