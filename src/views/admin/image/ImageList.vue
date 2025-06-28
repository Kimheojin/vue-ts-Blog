<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { container } from 'tsyringe';
import { useRouter } from 'vue-router';
import ImageRepository from '../../../repository/image/ImageRepository.ts';
import ImageListRequest from '../../../entity/image/request/ImageListRequest.ts';
import type ImageItem from '../../../entity/image/data/ImageItem.ts';
import HttpError from '../../../http/HttpError.ts';

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
    const httpError = error as HttpError;
    ElMessage.error('이미지 목록을 불러오는 중 오류가 발생했습니다: ' + httpError.getMessage());
  } finally {
    isLoading.value = false;
  }
};

const showImageDetail = (image: ImageItem) => {
  selectedImage.value = image;
  showImageDialog.value = true;
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
            <img :src="image.secureUrl" :alt="image.originalFilename" />
          </div>
          <div class="image-info">
            <h4>{{ image.originalFilename }}</h4>
            <p>크기: {{ image.width }} x {{ image.height }}</p>
            <p>용량: {{ formatFileSize(image.bytes) }}</p>
            <p>형식: {{ image.format.toUpperCase() }}</p>
          </div>
        </div>
      </div>

      <!-- 이미지 상세 다이얼로그 -->
      <el-dialog
          v-model="showImageDialog"
          :title="selectedImage?.originalFilename"
          width="70%"
          :before-close="() => showImageDialog = false"
      >
        <div v-if="selectedImage" class="image-detail">
          <div class="detail-image">
            <img :src="selectedImage.secureUrl" :alt="(selectedImage as ImageItem).originalFilename" />
          </div>
          <div class="detail-info">
            <div class="info-item">
              <label>파일명:</label>
              <span>{{ (selectedImage as ImageItem).originalFilename }}</span>
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
            <div class="info-item">
              <label>URL:</label>
              <span class="url-text">{{ (selectedImage as ImageItem).secureUrl }}</span>
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
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.search-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
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
  background: white;
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
  background: #f5f5f5;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.image-info {
  padding: 15px;
}

.image-info h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  word-break: break-all;
}

.image-info p {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
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

.info-item label {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.info-item span {
  color: #666;
}

.url-text {
  word-break: break-all;
  font-size: 12px;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>