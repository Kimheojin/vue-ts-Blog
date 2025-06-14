import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import PostPageResponse from "../../entity/post/response/PostPageResponse.ts";
import PostItem from "../../entity/post/data/PostItem.ts";

@singleton()
export default class PostRepository{
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {}

    // 페이징된 포스트 목록 조회
    public async getPagePosts(page: number= 0, size: number= 10): Promise<PostPageResponse<PostItem>>{
        return this.httpRepository.get<PostPageResponse<PostItem>>({
            path: '/api/posts',
            params: {
                page,
                size
            },
        }, PostPageResponse)
    }
    
    // 카테고리 활용 포스트 목록 조회
    public async getCategoryPagePosts(categoryName: string, page: number = 0, size: number = 10): Promise<PostPageResponse<PostItem>> {
        return this.httpRepository.get<PostPageResponse<PostItem>>({
            path: '/api/posts/category',
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
            path: '/api/posts/single',
            params: {
                postId
            },
        }, PostItem)
    }
}