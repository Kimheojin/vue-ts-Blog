import {inject, singleton} from "tsyringe";
import HttpRepository from "./HttpRepository.ts";
import type LoginRequest from "../entity/user/LoginRequest.ts";
import AuthService from "../service/AuthService.ts";
import LoginResponse from "../entity/user/LoginResponse.ts";


@singleton()
export default class AuthRepository {
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository,
        @inject(AuthService) private readonly authService: AuthService
    ) {
    }

    public async login(request: LoginRequest): Promise<LoginResponse> {
        const response = await this.httpRepository.post<LoginResponse>({
            path: '/api/login',
            body: request,
            withAuth: false // true 가 디폴트
        }, LoginResponse);

        // 로그인 성공 시 세션 정보 저장
        if (response && response.sessionId) {
            this.authService.saveSession({
                sessionId: response.sessionId,
                userId: response.userId
            });
        }

        return response;
    }


}