import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";

@singleton()
export default class CommentAdminRepository {
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {
    }

    // 댓글 조회(관리자)

    // 댓글 삭제 (관리자)
}