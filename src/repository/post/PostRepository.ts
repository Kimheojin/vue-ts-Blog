import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import type PostRequest from "../../entity/request/PostRequest.ts";
import PostResponse from "../../entity/response/PostResponse.ts";
import PostPageResponse from "../../entity/response/PostPageResponse.ts";
import PostItem from "../../entity/data/PostItem.ts";

@singleton()
export default class PostRepository{
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {}


    // 포스트 작성
    public async createPost(request: PostRequest): Promise<PostResponse>{
        return await this.httpRepository.post<PostResponse>({
            path: '/api/post',
            body: request,
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
        }, PostPageResponse)
    }
    
    // 카테고리 활용 포스트 목록 조회
    public async getCategoryPagePosts(categoryName: string, page: number = 0, size: number = 10): Promise<PostPageResponse<PostItem>> {
        return this.httpRepository.get<PostPageResponse<PostItem>>({
            path: '/api/posts/categoryPaged',
            params: {
                categoryName,
                page,
                size
            },
            }, PostPageResponse)
    }

    // 단일 포스트 조회
    public async getSinglePost(postId: number): Promise<PostItem> {
        return await this.httpRepository.get<PostItem>({
            path: '/api/posts',
            params: {
                postId
            },
        }, PostItem)
    }
}