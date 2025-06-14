import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import type Comment from "../../entity/comment/data/Comment.ts";
import CommentListResponse from "../../entity/comment/response/CommentListResponse.ts";
import CommentDeleteRequest from "../../entity/comment/request/CommentDeleteRequest.ts";
import CategoryListResponse from "../../entity/category/response/CategoryListResponse.ts";

@singleton()
export default class CommentAdminRepository {
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {
    }


    // 댓글 조회(관리자)
    public async getAdminCommentByPostId(postId: number): Promise<Comment[]> {
        const response = await this.httpRepository.get({
            path: `/api/admin/posts/${postId}/comments`,
        }, CommentListResponse);

        return response.commentDtoList || [];
    }


    // 댓글 삭제(관리자)

    public async addCategory(request: CommentDeleteRequest): Promise<CategoryListResponse> {
        return this.httpRepository.post<CategoryListResponse>({
            path: '/api/admin/comments',
            body: request,
        }, CategoryListResponse);
    }

}