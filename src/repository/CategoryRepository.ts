import {inject, singleton} from "tsyringe";
import HttpRepository from "./HttpRepository.ts";
import Category from "../entity/data/Category.ts";
// import type CategoryRequest from "../entity/request/CategoryRequest.ts";


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

/*    // 카테고리 추가
    public async addCategory(request: CategoryRequest):Promise<Category[]>{
        return this.httpRepository.post<Category[]>({
            path: '/api/category',
            body: request,
            withAuth: true
        });
    }*/

}