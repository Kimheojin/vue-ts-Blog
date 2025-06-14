import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import Category from "../../entity/data/Category.ts";
import CategoryListResponse from "../../entity/response/CategoryListResponse.ts";
import type CategoryDeleteRequest from "../../entity/request/CategoryDeleteRequest.ts";

@singleton()
export default class CategoryRepository{
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {
    }


    // 전체 카테고리 조회
    public async getCategories(): Promise<Category[]> {
        const response = await this.httpRepository.get({
            path: '/api/categories',
        }, CategoryListResponse);

        return response.categoryResponses || [];
    }

    // 전체 카테고리 조회 + 해당 post 수 조회
    public async getCategoriesAndPostCount(): Promise<Category[]> {
        const response = await this.httpRepository.get({
            path: '/api/categories/stats',
        }, CategoryListResponse);

        return response.categoryResponses || [];
    }



    // 카테고리 삭제
    public async deleteCategory(request: CategoryDeleteRequest): Promise<CategoryListResponse> {
        return this.httpRepository.delete<CategoryListResponse>({
            path: '/api/admin/categories',
            body: request,
        }, CategoryListResponse);
    }
    
    // 카테고리 이름 수정(관리자)
}