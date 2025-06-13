import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";

@singleton()
export default class CommentRepository {
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {
    }

    // 댓글 조회
    // 댓글 작성
    // 댓글 삭제 (사용자 전용)




}