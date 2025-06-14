import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import type PostRequest from "../../entity/post/request/PostRequest.ts";
import PostResponse from "../../entity/post/response/PostResponse.ts";
import PostPageResponse from "../../entity/post/response/PostPageResponse.ts";
import PostItem from "../../entity/post/data/PostItem.ts";
import ModifyPostRequest from "../../entity/post/request/ModifyPostRequest.ts";
import DeletePostRequest from "../../entity/post/request/DeletePostRequest.ts";
import PostDeleteResponse from "../../entity/post/response/PostDeleteResponse.ts";

@singleton()
export default class PostAdminRepository{
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {}

    // 전체 포스트 조회(모든 상태)

    public async getAdminPagePosts(page: number= 0, size: number= 10): Promise<PostPageResponse<PostItem>>{
        return this.httpRepository.get<PostPageResponse<PostItem>>({
            path: '/api/admin/posts',
            params: {
                page,
                size
            },
        }, PostPageResponse)
    }
    
    // 카테고리 별 포스트 조회(모든 상태)

    public async getAdminCategoryPagePosts(categoryName: string, page: number = 0, size: number = 10): Promise<PostPageResponse<PostItem>> {
        return this.httpRepository.get<PostPageResponse<PostItem>>({
            path: '/api/admin/posts/category',
            params: {
                categoryName,
                page,
                size
            },
        }, PostPageResponse)
    }

    // 단일 포스트 조회(모든 상태)

    public async getAdminSinglePost(postId: number): Promise<PostItem> {
        return await this.httpRepository.get<PostItem>({
            path: '/api/posts/single',
            params: {
                postId
            },
        }, PostItem)
    }
    
    // 상태 별 포스트 조회

    public async getAdminStatusPagePosts(Status: string, page: number = 0, size: number = 10): Promise<PostPageResponse<PostItem>> {
        return this.httpRepository.get<PostPageResponse<PostItem>>({
            path: '/api/admin/statusPosts',
            params: {
                Status,
                page,
                size
            },
        }, PostPageResponse)
    }
    // 포스트 작성
    public async createPost(request: PostRequest): Promise<PostResponse>{
        return await this.httpRepository.post<PostResponse>({
            path: '/api/admin/posts',
            body: request,
        }, PostResponse)
    }
    // 포스트 수정
    public async modifyPost(request: ModifyPostRequest): Promise<PostResponse>{
        return await this.httpRepository.put<PostResponse>({
            path: '/api/admin/posts',
            body: request,
        }, PostResponse)
    }

    // 포스트 삭제
    public async deletePost(request: DeletePostRequest): Promise<PostDeleteResponse>{
        return await this.httpRepository.delete<PostDeleteResponse>({
            path: '/api/admin/posts',
            body: request,
        }, PostDeleteResponse)
    }

}