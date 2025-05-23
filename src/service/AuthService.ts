import {singleton} from "tsyringe";

@singleton()
export default class AuthService{

    constructor() {

    }

    public saveSession() : void {
        console.log('로그인 성공 - 세션 쿠키가 설정되었습니다.');
    }


    // 현재 세션 ID 가져오기
    public getSessionId(): string | null {
        // 쿠키에서 JSESSIONID 확인
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'JSESSIONID') {
                return value;
            }
        }
        return null;
    }
    public logout(): void {

        console.log('로그아웃 처리됨');
    }

}