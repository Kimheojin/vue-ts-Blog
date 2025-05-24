import {singleton} from "tsyringe";

@singleton()
export default class AuthService{

    constructor() {

    }

    public saveSession() : void {
        console.log('로그인 성공 - 세션 쿠키가 설정되었습니다.');
    }

    public logout(): void {

        console.log('로그아웃 처리됨');
    }


    // 서버 인증 확인(관리 페이지 진입시 사용)
    public async quickAuthCheck(): Promise<boolean> {
        try {
            const response = await fetch('/api/auth/check', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            return response.ok;
        } catch (error) {
            console.error('인증 확인 중 오류:', error);
            return false;
        }
    }

}