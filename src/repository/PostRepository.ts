import {inject, singleton} from "tsyringe";
import HttpRepository from "./HttpRepository.ts";
import type PostRequest from "../entity/request/PostRequest.ts";
import PostResponse from "../entity/response/PostResponse.ts";
import type PostPageResponse from "../entity/response/PostPageResponse.ts";
import type PostItem from "../entity/data/PostItem.ts";


@singleton()
export default class PostRepository{
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {}


    // 포스트 작성
    public async createPost(request: PostRequest): Promise<PostResponse>{
        return this.httpRepository.post<PostResponse>({
            path: '/api/post',
            body: request,
            withAuth: true
        }, PostResponse)
    }

    // 페이징된 포스트 목록 조회
    public async getPagePosts(page: number= 0, size: number= 10): Promise<PostPageResponse<PostItem>>{
        return this.httpRepository.get<PostPageResponse<PostItem>>({
            path: '/api/posts/paged',
            params: {
                page,
                size
            },
            withAuth: false
        }, PostPageResponse)
    }

}