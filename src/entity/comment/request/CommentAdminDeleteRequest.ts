export default class CommentAdminDeleteRequest{
    public commentId: number = 0;
    public content: string = "";
    public email: string = "";
    public postId: number = 0;
    public parentId: number | null = null;  // 디폴트 null
}