import {inject, singleton} from "tsyringe";
import AuthRepository from "../repository/auth/AuthRepository.ts";

@singleton()
export default class AuthService{

    constructor(@inject(AuthRepository) private readonly authRepository: AuthRepository) {

    }


    // AuthRepository를 통해 인증 상태 확인
    public async isAuthenticated(): Promise<boolean> {
        return await this.authRepository.checkAuthentication();
    }

    // 서버 인증 확인(관리 페이지 진입시 사용)
}