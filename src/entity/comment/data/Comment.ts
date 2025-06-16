export default class Comment{
    public id: number = 0;
    public content: string = "";
    public email: string = "";
    public postId: number = 0;
    public regDate: string = ''
    public parentId: number | null = null;  // 디폴트 null
    public replies: Comment[] = [];         // 재귀적 구조
}