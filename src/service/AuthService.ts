import {singleton} from "tsyringe";
import type {SessionInfo} from "../entity/interface/SessionInfo.ts";


@singleton()
export default class AuthService{
    private readonly SESSION_KEY = 'session'
    private currentSession: SessionInfo | null = null

    constructor() {
        this.loadSeesion();
    }

    public saveSession(seesionInfo: SessionInfo) : void {
        this.currentSession = seesionInfo;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(seesionInfo))
    }

    private loadSeesion() : void {
        const sessionData = localStorage.getItem(this.SESSION_KEY)
        if(sessionData) { // 존재 한다면

            try {
                this.currentSession = JSON.parse(sessionData);
            } catch (e) {
                console.error('Failed to parse session data:', e);
                this.clearSession();
            }

        }
    }
    // 현재 세션 ID 가져오기
    public getSessionId(): string | null {
        return this.currentSession?.sessionId || null;
    }
    public logout(): void {
        this.clearSession();
    }
    private clearSession(): void {
        this.currentSession = null;
        localStorage.removeItem(this.SESSION_KEY);
    }
}