import type Comment from "../data/Comment.ts";

export default class CommentListResponse {
    public commentDtoList: Comment[] = [];
}