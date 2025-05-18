import {inject, singleton} from "tsyringe";
import HttpRepository from "./HttpRepository.ts";
import type LoginRequest from "../entity/user/LoginRequest.ts";
import AuthService from "../service/AuthService.ts";
import LoginResponse from "../entity/user/LoginResponse.ts";
import LogoutResponse from "../entity/user/LogoutResponse.ts";


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

    public async logout(): Promise<LogoutResponse> {
        const response = await this.httpRepository.post({
            path: '/api/logout',
            withAuth: true // true 가 디폴트
        }, LogoutResponse);

        // 로그인 성공 시 세션 정보 저장
        if (response) {
            this.authService.logout()
        }

        return response;
    }


}