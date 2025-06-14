export default class PostPageResponse<T>{

    public content: T[] = []
    public pageNumber :number = 0
    public pageSize :number = 10
    public totalElements:number = 0
    public totalPages:number = 0
    public first: boolean = true
    public last: boolean = true
}