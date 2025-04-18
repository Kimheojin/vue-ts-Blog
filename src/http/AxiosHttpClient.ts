import {inject, singleton} from "tsyringe";
import type {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import axios from "axios";
import HttpError from "./HttpError.ts";
import type {ErrorResponse} from "../entity/interface/ErrorResponse.ts";
import AuthService from "../service/AuthService.ts";

// API 에러 응답 타입 정의


export type HttpRequestConfig = {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    path: string
    params?: any
    body?: any
    withAuth?: boolean
}

@singleton()
export default class AxiosHttpClient {
    private readonly client: AxiosInstance = axios.create({
        baseURL: import.meta.env.VITE_API_URL, // 기본 url 설정
        timeout: 3000,
        timeoutErrorMessage: '시간 초과에요',
    })

    constructor(@inject(AuthService) private readonly authService: AuthService) {
    }

    public async request<T = any>(config: HttpRequestConfig): Promise<T> {
        const requestConfig = {
            method: config.method,
            url: config.path,
            params: config.params,
            data: config.body,
            headers: {} as Record<string, string>
        }

        if (config.withAuth !== false) { // 기본값은 true (인증 필요)
            const sessionId = this.authService.getSessionId();
            if (sessionId) {
                requestConfig.headers['X-Session-ID'] = sessionId;
                // 또는 Authorization 헤더를 사용할 수도 있음
                // requestConfig.headers['Authorization'] = `Bearer ${sessionId}`;
            }
        }



        return this.client
            .request<T>(requestConfig)
                .then((response: AxiosResponse<T>) => {
                    return response.data
                })
                .catch((e: AxiosError<ErrorResponse>) => {
                    // 401 Unauthorized 오류가 발생하면 세션이 만료된 것으로 간주
                    if (e.response?.status === 401) {
                        this.authService.logout(); // 세션 정보 삭제
                    }
                    return Promise.reject(new HttpError(e))
                })
    }

}