import {inject, singleton} from "tsyringe";
import AuthRepository from "../repository/AuthRepository.ts";

@singleton()
export default class AuthService{

    constructor(@inject(AuthRepository) private readonly authRepository: AuthRepository) {

    }

    public saveSession() : void {
        console.log('로그인 성공 - 세션 쿠키가 설정되었습니다.');
    }

    public logout(): void {
        console.log('로그아웃 처리됨');
    }

    // AuthRepository를 통해 인증 상태 확인
    public async isAuthenticated(): Promise<boolean> {
        return await this.authRepository.checkAuthentication();
    }

    // 서버 인증 확인(관리 페이지 진입시 사용)
    public async quickAuthCheck(): Promise<boolean> {
        return this.isAuthenticated();
    }
}