import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import type Comment from "../../entity/comment/data/Comment.ts";
import CommentListResponse from "../../entity/comment/response/CommentListResponse.ts";
import CommentAdminDeleteRequest from "../../entity/comment/request/CommentAdminDeleteRequest.ts";

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

    public async deleteAdminComment(request: CommentAdminDeleteRequest): Promise<Comment[]> {
        const response = await this.httpRepository.delete({
            path: '/api/admin/comments',
            body: request,
        }, CommentListResponse);

        return response.commentDtoList || [];
    }


}