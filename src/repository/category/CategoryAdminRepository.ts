import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import type CategoryRequest from "../../entity/request/CategoryRequest.ts";
import CategoryListResponse from "../../entity/response/CategoryListResponse.ts";


@singleton()
export default class CategoryAdminRepository {
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {
    }
    
    // 카테고리 추가
    // 카테고리 추가
    public async addCategory(request: CategoryRequest): Promise<CategoryListResponse> {
        return this.httpRepository.post<CategoryListResponse>({
            path: '/api/admin/categories',
            body: request,
        }, CategoryListResponse);
    }
    // 카테고리 삭제 
    
    // 카테고리 이름 수정
}

