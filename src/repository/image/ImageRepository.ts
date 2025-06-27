import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import type ImageUploadRequest from "../../entity/image/request/ImageUploadRequest.ts";
import ImageUploadResponse from "../../entity/image/response/ImageUploadResponse.ts";
import type ImageListRequest from "../../entity/image/request/ImageListRequest.ts";
import type ImageItem from "../../entity/image/data/ImageItem.ts";
import ImageListResponse from "../../entity/image/response/ImageListResponse.ts";
import type ImageDeleteRequest from "../../entity/image/request/ImageDeleteRequest.ts";
import ImageDeleteResponse from "../../entity/image/response/ImageDeleteResponse.ts";


@singleton()
export default class ImageRepository {
    constructor(
        @inject(HttpRepository)
        private readonly httpRepository: HttpRepository

    ) {}

    
    // 이미지 업로드
    public async uploadImage(request: ImageUploadRequest): Promise<ImageUploadResponse>{
        const formData = new FormData();

        if(request.file){ // 존재할 경우
            formData.append('file', request.file)
        }
        if(request.folder){
            formData.append('folder', request.folder)
        }
        const response = await this.httpRepository.postFormData<ImageUploadResponse>(
            {
                path: '/api/admin/images',
                body: formData
            }, ImageUploadResponse);
        return response
    }

    
    // 이미지 리스트 반환
    public async getImageList(request: ImageListRequest): Promise<ImageItem[]> {
        const response = await this.httpRepository.get<ImageListResponse>({
            path: '/api/admin/images',
            params: { folder: request.folder}
        }, ImageListResponse)

        return response.images || [];
    }


    // 이미지 삭제
    public async deleteImage(request: ImageDeleteRequest): Promise<ImageDeleteResponse> {
        const response = await this.httpRepository.delete<ImageDeleteResponse>({
            path: '/api/admin/images',
            body: request
        }, ImageDeleteResponse);

        return response;
    }


}