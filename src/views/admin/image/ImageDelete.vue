<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { container } from 'tsyringe';
import { useRouter } from 'vue-router';
import ImageRepository from '../../../repository/image/ImageRepository.ts';
import ImageListRequest from '../../../entity/image/request/ImageListRequest.ts';
import ImageDeleteRequest from '../../../entity/image/request/ImageDeleteRequest.ts';
import type ImageItem from '../../../entity/image/data/ImageItem.ts';
import HttpError from '../../../http/HttpError.ts';

const router = useRouter();
const IMAGE_REPOSITORY = container.resolve(ImageRepository);

const images = ref<ImageItem[]>([]);
const folder = ref('blog-images');
const isLoading = ref(false);
const selectedImages = ref<string[]>([]);
const isDeleting = ref(false);

const loadImages = async () => {
  isLoading.value = true;
  selectedImages.value = [];

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

const handleSelectionChange = (selection: ImageItem[]) => {
  selectedImages.value = selection.map(item => item.publicId);
};

const deleteSelectedImages = async () => {
  if (selectedImages.value.length === 0) {
    ElMessage.warning('삭제할 이미지를 선택해주세요.');
    return;
  }

  try {
    await ElMessageBox.confirm(
        `선택한 ${selectedImages.value.length}개의 이미지를 삭제하시겠습니까?`,
        '이미지 삭제 확인',
        {
          confirmButtonText: '삭제',
          cancelButtonText: '취소',
          type: 'warning',
        }
    );

    isDeleting.value = true;
    let successCount = 0;
    let errorCount = 0;

    for (const publicId of selectedImages.value) {
      try {
        const request = new ImageDeleteRequest();
        request.publicId = publicId;

        const response = await IMAGE_REPOSITORY.deleteImage(request);

        if (response.success) {
          successCount++;
        } else {
          errorCount++;
          console.error(`이미지 삭제 실패 (${publicId}):`, response.message);
        }
      } catch (error) {
        errorCount++;
        console.error(`이미지 삭제 오류 (${publicId}):`, error);
      }
    }

    if (successCount > 0) {
      ElMessage.success(`${successCount}개의 이미지가 삭제되었습니다.`);
      await loadImages(); // 목록 새로고침
    }

    if (errorCount > 0) {
      ElMessage.error(`${errorCount}개의 이미지 삭제에 실패했습니다.`);
    }

  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('삭제 중 오류가 발생했습니다.');
    }
  } finally {
    isDeleting.value = false;
  }
};

const deleteSingleImage = async (image: ImageItem) => {
  try {
    await ElMessageBox.confirm(
        `"${image.originalFilename}" 이미지를 삭제하시겠습니까?`,
        '이미지 삭제 확인',
        {
          confirmButtonText: '삭제',
          cancelButtonText: '취소',
          type: 'warning',
        }
    );

    const request = new ImageDeleteRequest();
    request.publicId = image.publicId;

    const response = await IMAGE_REPOSITORY.deleteImage(request);

    if (response.success) {
      ElMessage.success('이미지가 삭제되었습니다.');
      await loadImages(); // 목록 새로고침
    } else {
      ElMessage.error('삭제 실패: ' + response.message);
    }
  } catch (error) {
    if (error !== 'cancel') {
      const httpError = error as HttpError;
      ElMessage.error('삭제 중 오류가 발생했습니다: ' + httpError.getMessage());
    }
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
  <div class="image-delete-page">
    <div class="delete-container">
      <div class="page-header">
        <h2>이미지 삭제</h2>
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

      <div class="action-section" v-if="images.length > 0">
        <el-button
            type="danger"
            @click="deleteSelectedImages"
            :disabled="selectedImages.length === 0 || isDeleting"
            :loading="isDeleting"
        >
          선택한 이미지 삭제 ({{ selectedImages.length }}개)
        </el-button>
      </div>

      <div v-if="isLoading" class="loading-text">
        이미지 목록을 불러오는 중...
      </div>

      <div v-else-if="images.length === 0" class="empty-state">
        <p>이미지가 없습니다.</p>
      </div>

      <div v-else>
        <el-table
            :data="images"
            @selection-change="handleSelectionChange"
            style="width: 100%"
        >
          <el-table-column type="selection" width="55" />

          <el-table-column label="미리보기" width="120">
            <template #default="{ row }">
              <div class="table-image-preview">
                <img :src="row.secureUrl" :alt="row.originalFilename" />
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="originalFilename" label="파일명" min-width="200">
            <template #default="{ row }: { row: ImageItem }">
              <div class="filename-cell">{{ row.originalFilename || '알 수 없음' }}</div>
            </template>
          </el-table-column>

          <el-table-column label="크기" width="120">
            <template #default="{ row }: { row: ImageItem }">
              {{ row.width || 0 }} x {{ row.height || 0 }}
            </template>
          </el-table-column>

          <el-table-column label="용량" width="100">
            <template #default="{ row }: { row: ImageItem }">
              {{ formatFileSize(row.bytes || 0) }}
            </template>
          </el-table-column>

          <el-table-column prop="format" label="형식" width="80">
            <template #default="{ row }: { row: ImageItem }">
              {{ (row.format || '').toUpperCase() }}
            </template>
          </el-table-column>

          <el-table-column label="생성일" width="180">
            <template #default="{ row }: { row: ImageItem }">
              {{ row.createdAt ? formatDate(row.createdAt) : '알 수 없음' }}
            </template>
          </el-table-column>

          <el-table-column label="작업" width="100">
            <template #default="{ row }">
              <el-button
                  type="danger"
                  size="small"
                  @click="deleteSingleImage(row)"
              >
                삭제
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-delete-page {
  padding: 20px;
}

.delete-container {
  max-width: 1400px;
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

.action-section {
  margin-bottom: 20px;
  text-align: right;
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

.table-image-preview {
  width: 80px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: #f5f5f5;
}

.table-image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.filename-cell {
  word-break: break-all;
  font-size: 13px;
}
</style>