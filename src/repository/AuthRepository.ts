import {inject, singleton} from "tsyringe";
import HttpRepository from "./HttpRepository.ts";
import type LoginRequest from "../entity/user/LoginRequest.ts";
import LoginResponse from "../entity/user/LoginResponse.ts";
import LogoutResponse from "../entity/user/LogoutResponse.ts";
import AuthCheckResponse from "../entity/response/AuthCheckResponse.ts";

@singleton()
export default class AuthRepository {
    constructor(
        @inject(HttpRepository) private readonly httpRepository: HttpRepository
    ) {
    }

    public async login(request: LoginRequest): Promise<LoginResponse> {

        const response = await this.httpRepository.post<LoginResponse>({
            path: '/api/login',
            body: request
        }, LoginResponse);

        return response;
    }

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
                path: '/api/auth/check'
            }, AuthCheckResponse);


            return response.authenticated;
        } catch (error) {

            return false;
        }
    }
}