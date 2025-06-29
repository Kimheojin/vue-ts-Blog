<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElUpload } from 'element-plus';
import { container } from 'tsyringe';
import { useRouter } from 'vue-router';
import ImageRepository from '../../../repository/image/ImageRepository.ts';
import ImageUploadRequest from '../../../entity/image/request/ImageUploadRequest.ts';
import HttpError from '../../../http/HttpError.ts';
import type { UploadProps, UploadUserFile } from 'element-plus';

const router = useRouter();
const IMAGE_REPOSITORY = container.resolve(ImageRepository);

const fileList = ref<UploadUserFile[]>([]);
const folder = ref('blog-images');
const isUploading = ref(false);
const uploadResult = ref<{
  imageUrl?: string;
  originalFilename?: string;
  folder?: string;
} | null>(null);

const handleUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('업로드할 파일을 선택해주세요.');
    return;
  }

  const file = fileList.value[0].raw;
  if (!file) {
    ElMessage.error('지원하지 않는 파일입니다.');
    return;
  }

  isUploading.value = true;

  try {
    const request = new ImageUploadRequest();
    request.file = file;
    request.folder = folder.value;

    const response = await IMAGE_REPOSITORY.uploadImage(request);

    if (response.success) {
      ElMessage.success('이미지가 성공적으로 업로드되었습니다!');
      uploadResult.value = {
        imageUrl: response.imageUrl,
        originalFilename: response.originalFilename,
        folder: response.folder
      };
      fileList.value = [];
    } else {
      ElMessage.error('업로드 실패: ' + response.message);
    }
  } catch (error) {
    const httpError = error as HttpError;
    ElMessage.error(httpError.getStatusCode() + " : " + httpError.getMessage());
  } finally {
    isUploading.value = false;
  }
};

const handleRemove: UploadProps['onRemove'] = (_file, uploadFiles) => {
  fileList.value = uploadFiles;
};

const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  console.log(uploadFile);
};

const goBack = () => {
  router.back();
};

const clearResult = () => {
  uploadResult.value = null;
};

// URL 복사 함수 추가
const copyUrl = async () => {
  if (!uploadResult.value?.imageUrl) return;

  try {
    await navigator.clipboard.writeText(uploadResult.value.imageUrl);
    ElMessage.success('URL이 클립보드에 복사되었습니다!');
  } catch (error) {
    ElMessage.error('URL 복사에 실패했습니다.');
  }
};
</script>

<template>
  <div class="image-upload-page">
    <div class="upload-container">
      <div class="page-header">
        <h2>이미지 업로드</h2>
        <el-button @click="goBack">돌아가기</el-button>
      </div>

      <div class="upload-form">
        <div class="form-group">
          <label>폴더명:</label>
          <el-input v-model="folder" placeholder="폴더명을 입력하세요" style="width: 300px;" />
        </div>

        <div class="form-group">
          <label>파일 선택:</label>
          <el-upload
              v-model:file-list="fileList"
              :limit="1"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :auto-upload="false"
              accept="image/*"
          >
            <el-button type="primary">파일 선택</el-button>
            <template #tip>
              <div class="el-upload__tip">
                이미지 파일만 업로드 가능합니다 (1개 파일만)
              </div>
            </template>
          </el-upload>
        </div>

        <div class="form-actions">
          <el-button
              type="primary"
              @click="handleUpload"
              :loading="isUploading"
              :disabled="fileList.length === 0"
          >
            {{ isUploading ? '업로드 중...' : '업로드' }}
          </el-button>
        </div>
      </div>

      <!-- 업로드 결과 -->
      <div v-if="uploadResult" class="upload-result">
        <div class="result-header">
          <h3>업로드 완료</h3>
          <el-button @click="clearResult" size="small">결과 지우기</el-button>
        </div>

        <div class="result-content">
          <div class="result-info">
            <p><strong>파일명:</strong> {{ uploadResult?.['originalFilename'] || '알 수 없음'}}</p>
            <p><strong>폴더:</strong> {{ uploadResult?.['folder'] || '알 수 없음'}}</p>
            <p class="url-row">
              <strong>URL:</strong> {{ uploadResult?.['imageUrl'] || '알 수 없음'}}
              <el-button @click="copyUrl" type="warning" plain style="margin-left: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; height: 16px;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </el-button>
            </p>
          </div>

          <div class="result-preview">
            <img :src="uploadResult?.['imageUrl']" :alt="uploadResult?.['originalFilename']" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.upload-form {
  padding : 5px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-actions {
  text-align: center;
  padding-top: 5px;
  margin-bottom: 5px;
}

.upload-result {
  border: 1px solid #ddd;
  border-radius: 7px;
  padding: 10px;
  margin-bottom: 40px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.result-content {
  display: flex;
  gap: 20px;
}

.result-info {
  flex: 1;
}

.result-info p {
  margin-bottom: 8px;
}

.url-row {
  display: flex;
  align-items: center;
}

.result-preview {
  flex-shrink: 0;
  width: 200px;
}

.result-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>