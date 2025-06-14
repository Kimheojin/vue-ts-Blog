import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import type CategoryRequest from "../../entity/category/request/CategoryRequest.ts";
import CategoryListResponse from "../../entity/category/response/CategoryListResponse.ts";
import CategoryDeleteRequest from "../../entity/category/request/CategoryDeleteRequest.ts";
import type CategoryModifyRequest from "../../entity/category/request/CategoryModifyRequest.ts";


@singleton()
export default class CategoryAdminRepository {
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {
    }
    
    // 카테고리 추가
    public async addCategory(request: CategoryRequest): Promise<CategoryListResponse> {
        return this.httpRepository.post<CategoryListResponse>({
            path: '/api/admin/categories',
            body: request,
        }, CategoryListResponse);
    }
    // 카테고리 삭제
    public async DeleteCategory(request: CategoryDeleteRequest): Promise<CategoryListResponse> {
        return this.httpRepository.delete<CategoryListResponse>({
            path: '/api/admin/categories',
            body: request,
        }, CategoryListResponse);
    }
    
    // 카테고리  수정
    public async ModifyCategory(request: CategoryModifyRequest): Promise<CategoryListResponse> {
        return this.httpRepository.put<CategoryListResponse>({
            path: '/api/admin/categories',
            body: request,
        }, CategoryListResponse);
    }

}

