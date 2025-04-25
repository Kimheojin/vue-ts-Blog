import {inject, singleton} from "tsyringe";
import HttpRepository from "./HttpRepository.ts";
import Category from "../entity/data/Category.ts";
import type Paging from "../entity/data/Paging.ts";

@singleton()
export default class CategoryRepository{
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {
    }

    public async getCategories():Promise<Paging<Category>>{
        return this.httpRepository.getList({
            path: '/api/categories'
        }, Category)
    }
}