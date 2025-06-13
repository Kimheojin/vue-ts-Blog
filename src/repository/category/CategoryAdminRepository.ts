import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";


@singleton()
export default class CategoryAdminRepository {
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {
    }
    
    // 카테고리 추가
    
    // 카테고리 삭제 
    
    // 카테고리 이름 수정
}

