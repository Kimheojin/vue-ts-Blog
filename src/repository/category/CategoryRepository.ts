import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import Category from "../../entity/category/data/Category.ts";
import CategoryListResponse from "../../entity/category/response/CategoryListResponse.ts";
import CategoryCountListResponse from "../../entity/category/response/CategoryCountListResponse.ts";
import type CategoryWithCount from "../../entity/category/data/CategoryWithCount.ts";


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
    public async getCategoriesAndPostCount(): Promise<CategoryWithCount[]> {
        const response = await this.httpRepository.get({
            path: '/api/categories/stats',
        }, CategoryCountListResponse);

        return response.CategoryWithCountResponses || [];
    }


}