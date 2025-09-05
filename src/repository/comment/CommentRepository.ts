import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import type Comment from "../../entity/comment/data/Comment.ts";
import CommentListResponse from "../../entity/comment/response/CommentListResponse.ts";
import CommentDeleteRequest from "../../entity/comment/request/CommentDeleteRequest.ts";
import CommentWriteRequest from "../../entity/comment/request/CommentWriteRequest.ts";

@singleton()
export default class CommentRepository {
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {
    }

    // 댓글 조회

    public async getCommentByPostId(postId: number): Promise<Comment[]> {
        const response = await this.httpRepository.get({
            path: `/api/posts/${postId}/comments`,
        }, CommentListResponse);

        return response.commentDtoList || [];
    }
    // 댓글 작성

    public async postComment(request: CommentWriteRequest): Promise<Comment[]> {
        const response = await this.httpRepository.post({
            path: `/api/posts/comments`,
            body: request
        }, CommentListResponse);

        return response.commentDtoList || [];
    }
    // 댓글 삭제 (일반 사용자 전용)

    public async deleteComment(request: CommentDeleteRequest): Promise<Comment[]> {
        const response = await this.httpRepository.post({
            path: `/api/comments`,
            body: request
        }, CommentListResponse);

        return response.commentDtoList || [];
    }
}