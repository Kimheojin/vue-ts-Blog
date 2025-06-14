import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import type PostRequest from "../../entity/post/request/PostRequest.ts";
import PostResponse from "../../entity/post/response/PostResponse.ts";

@singleton()
export default class PostAdminRepository{
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {}
    // 포스트 작성
    public async createPost(request: PostRequest): Promise<PostResponse>{
        return await this.httpRepository.post<PostResponse>({
            path: '/api/admin/posts',
            body: request,
        }, PostResponse)
    }
    // 전체 포스트 조회(모든 상태)
    
    // 카테고리 별 포스트 조회(모든 상태)

    // 단일 포스트 조회(모든 상태)
    
    // 상태 별 포스트 조회
    


    // 포스트 수정
    // 포스트 삭제

}