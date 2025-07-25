import {inject, singleton} from "tsyringe";
import HttpRepository from "../HttpRepository.ts";
import type LoginRequest from "../../entity/auth/request/LoginRequest.ts";
import LoginResponse from "../../entity/auth/response/LoginResponse.ts";
import LogoutResponse from "../../entity/auth/response/LogoutResponse.ts";
import AuthCheckResponse from "../../entity/auth/response/AuthCheckResponse.ts";

@singleton()
export default class AuthRepository {
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {
    }

    // 로그인 관련
    public async login(request: LoginRequest): Promise<LoginResponse> {

        const response = await this.httpRepository.post<LoginResponse>({
            path: '/api/auth/login',
            body: request
        }, LoginResponse);

        return response;
    }

    // 로그아웃
    public async logout(): Promise<LogoutResponse> {


        const response = await this.httpRepository.post({
            path: '/api/logout'
        }, LogoutResponse);


        return response;
    }

    // 인증 상태 확인
    public async checkAuthentication(): Promise<boolean> {
        try {
            const response = await this.httpRepository.get({
                path: '/api/auth/session'
            }, AuthCheckResponse);


            return response.authenticated;
        } catch (error) {

            return false;
        }
    }

}