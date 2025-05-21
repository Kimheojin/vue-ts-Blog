import {inject, singleton} from "tsyringe";
import HttpRepository from "./HttpRepository.ts";
import type PostRequest from "../entity/request/PostRequest.ts";
import PostResponse from "../entity/response/PostResponse.ts";


@singleton()
export default class PostRepository{
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {}


    // 포스트 작성
    public async createPost(request: PostRequest): Promise<PostResponse>{
        return this.httpRepository.post<PostResponse>({
            path: '/api/post',
            body: request,
            withAuth: true
        }, PostResponse)
    }

}