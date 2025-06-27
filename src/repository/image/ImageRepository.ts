import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import type ImageUploadRequest from "../../entity/image/request/ImageUploadRequest.ts";
import ImageUploadResponse from "../../entity/image/response/ImageUploadResponse.ts";


@singleton()
export default class ImageRepository {
    constructor(
        @inject(HttpRepository)
        private readonly httpRepository: HttpRepository

    ) {}

    public async upladImage(request: ImageUploadRequest): Promise<ImageUploadResponse>{
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
}