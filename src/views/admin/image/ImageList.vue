<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { container } from 'tsyringe';
import { useRouter } from 'vue-router';
import ImageRepository from '../../../repository/image/ImageRepository.ts';
import ImageListRequest from '../../../entity/image/request/ImageListRequest.ts';
import type ImageItem from '../../../entity/image/data/ImageItem.ts';
import { useErrorHandler } from '../../../composables/useErrorHandler.ts';

const { customHandleError } = useErrorHandler();

const router = useRouter();
const IMAGE_REPOSITORY = container.resolve(ImageRepository);

const images = ref<ImageItem[]>([]);
const folder = ref('blog-images');
const isLoading = ref(false);
const selectedImage = ref<ImageItem | null>(null);
const showImageDialog = ref(false);

const loadImages = async () => {
  isLoading.value = true;

  try {
    const request = new ImageListRequest();
    request.folder = folder.value;

    const response = await IMAGE_REPOSITORY.getImageList(request);
    images.value = response;

    if (response.length === 0) {
      ElMessage.info('해당 폴더에 이미지가 없습니다.');
    } else {
      ElMessage.success(`${response.length}개의 이미지를 불러왔습니다.`);
    }
  } catch (error) {
    customHandleError(error, '이미지 목록을 불러오는 중 오류가 발생했습니다.');
  } finally {
    isLoading.value = false;
  }
};

const showImageDetail = (image: ImageItem) => {
  selectedImage.value = image;
  showImageDialog.value = true;
};

const copyImageUrl = async (imageUrl: string, event?: Event) => {
  // 이벤트 버블링 방지 (카드 클릭 이벤트와 충돌 방지)
  if (event) {
    event.stopPropagation();
  }

  try {
    await navigator.clipboard.writeText(imageUrl);
    ElMessage.success('이미지 URL이 클립보드에 복사되었습니다.');
  } catch (error) {
    console.error('클립보드 복사 실패:', error);
    ElMessage.error('클립보드 복사에 실패했습니다.');
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('ko-KR');
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadImages();
});
</script>
<template>
  <div class="image-list-page">
    <div class="list-container">
      <div class="page-header">
        <h2>이미지 목록</h2>
        <el-button @click="goBack">돌아가기</el-button>
      </div>

      <div class="search-section">
        <div class="search-form">
          <el-input
              v-model="folder"
              placeholder="폴더명을 입력하세요"
              style="width: 300px; margin-right: 10px;"
          />
          <el-button type="primary" @click="loadImages" :loading="isLoading">
            {{ isLoading ? '로딩 중...' : '검색' }}
          </el-button>
        </div>
      </div>

      <div v-if="isLoading" class="loading-text">
        이미지 목록을 불러오는 중...
      </div>

      <div v-else-if="images.length === 0" class="empty-state">
        <p>이미지가 없습니다.</p>
      </div>

      <div v-else class="image-grid">
        <div
            v-for="image in images"
            :key="image.publicId"
            class="image-card"
            @click="showImageDetail(image)"
        >
          <div class="image-preview">
            <img :src="image.secureUrl" />
          </div>
          <div class="image-info">
            <div class="size-row">
              <p>크기: {{ image.width }} x {{ image.height }}</p>
              <el-button
                  size="small"
                  type="warning"
                  @click="copyImageUrl(image.secureUrl, $event)"
                  class="copy-btn"
                  plain
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                  <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>
              </el-button>
            </div>
            <p>용량: {{ formatFileSize(image.bytes) }}</p>
            <p>형식: {{ image.format.toUpperCase() }}</p>
          </div>
        </div>
      </div>

      <!-- 이미지 상세 다이얼로그 -->
      <el-dialog
          v-model="showImageDialog"
          :title="selectedImage?.secureUrl"
          width="70%"
          :before-close="() => showImageDialog = false"
      >
        <div v-if="selectedImage" class="image-detail">
          <div class="detail-image">
            <img :src="selectedImage.secureUrl" />
          </div>
          <div class="detail-info">
            <div class="info-item">
              <div class="info-item-header">
                <label>URL:</label>
                <el-button
                    size="small"
                    type="warning"
                    @click="copyImageUrl((selectedImage as ImageItem).secureUrl)"
                    class="copy-btn-dialog"
                    plain
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                  </svg>
                </el-button>
              </div>
              <span class="url-text">{{ (selectedImage as ImageItem).secureUrl }}</span>
            </div>
            <div class="info-item">
              <label>Public ID:</label>
              <span>{{ (selectedImage as ImageItem).publicId }}</span>
            </div>
            <div class="info-item">
              <label>크기:</label>
              <span>{{ (selectedImage as ImageItem).width }} x {{ (selectedImage as ImageItem).height }}</span>
            </div>
            <div class="info-item">
              <label>파일 크기:</label>
              <span>{{ formatFileSize((selectedImage as ImageItem).bytes) }}</span>
            </div>
            <div class="info-item">
              <label>형식:</label>
              <span>{{ (selectedImage as ImageItem).format.toUpperCase() }}</span>
            </div>
            <div class="info-item">
              <label>생성일:</label>
              <span>{{ formatDate((selectedImage as ImageItem).createdAt) }}</span>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.image-list-page {
  padding: 20px;
}

.list-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.search-section {
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.search-form {
  display: flex;
  align-items: center;
}

.loading-text {
  text-align: center;
  color: #666;
  font-size: 16px;
  padding: 40px;
}

.empty-state {
  text-align: center;
  color: #999;
  font-size: 16px;
  padding: 40px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.image-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-preview {
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.image-info {
  padding: 15px;
}

.size-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0;
}

.size-row p {
  margin: 0;
  flex: 1;
  font-size: 12px;
  color: #ffffff;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 10px;
}

.info-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  word-break: break-all;
  flex: 1;
}

.copy-btn {
  flex-shrink: 0;
  padding: 4px 8px;
  height: auto;
  min-height: 24px;
}

.copy-btn svg {
  margin: 0;
}

.image-info p {
  margin: 4px 0;
  font-size: 12px;
  color: #ffffff;
}

.image-detail {
  display: flex;
  gap: 20px;
}

.detail-image {
  flex: 1;
  text-align: center;
}

.detail-image img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.detail-info {
  flex: 1;
}

.info-item {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

.info-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.info-item label {
  font-weight: bold;
  color: rgba(255, 255, 255, 0.71);
}

.copy-btn-dialog {
  padding: 4px 8px;
  height: auto;
  min-height: 24px;
  gap: 4px;
}

.copy-btn-dialog svg {
  margin: 0;
}

.info-item span {
  color: #ffffff;
}

.url-text {
  word-break: break-all;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: rgba(245, 245, 245, 0.18);
}
</style>