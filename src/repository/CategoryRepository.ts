import {inject, singleton} from "tsyringe";
import HttpRepository from "./HttpRepository.ts";
import Category from "../entity/data/Category.ts";


@singleton()
export default class CategoryRepository{
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {
    }


    // 전체 카테고리 조회
    public async getCategories():Promise<Category[]>{
        return this.httpRepository.getSimpleList({
            path: '/api/categoryList'
        }, Category);
    }

    // 카테고리 추가

}