import {inject, singleton} from "tsyringe";
import HttpRepository from "./HttpRepository.ts";
import Category from "../entity/data/Category.ts";
import type CategoryRequest from "../entity/request/CategoryRequest.ts";
import CategoryListResponse from "../entity/response/CategoryListResponse.ts";
import type CategoryDeleteRequest from "../entity/request/CategoryDeleteRequest.ts";

@singleton()
export default class CategoryRepository{
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {
    }


    // 전체 카테고리 조회
    public async getCategories():Promise<Category[]>{
        return this.httpRepository.getSimpleList({
            path: '/api/categoryList',
            withAuth: false
        }, Category);
    }

    // 카테고리 추가
    public async addCategory(categoryName: string): Promise<CategoryListResponse> {
        return this.httpRepository.post<CategoryListResponse>({
            path: '/api/category',
            withAuth: true
        }, CategoryListResponse);
    }

    // 카테고리 삭제
    public async deleteCategory(request: CategoryDeleteRequest): Promise<CategoryListResponse> {
        return this.httpRepository.post<CategoryListResponse>({
            path: '/api/category',
            body: request,
            method: 'DELETE',
            withAuth: true
        }, CategoryListResponse);
    }
}