import {inject, singleton} from "tsyringe";
import type {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import axios from "axios";
import HttpError from "./HttpError.ts";
import type {ErrorResponse} from "../entity/interface/ErrorResponse.ts";
import AuthService from "../service/AuthService.ts";

export type HttpRequestConfig = {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    path: string
    params?: any
    body?: any
    withAuth?: boolean  // withAuth로 변경 (withCredentials 제거)
}

let routerInstance: any = null;

export function setRouterInstance(router: any) {
    routerInstance = router;
}


@singleton()
export default class AxiosHttpClient {
    private readonly client: AxiosInstance = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        timeout: 3000,
        timeoutErrorMessage: '시간 초과에요',
        withCredentials: true
    })

    constructor(@inject(AuthService) private readonly authService: AuthService) {
    }

    public async request<T = any>(config: HttpRequestConfig): Promise<T> {
        const requestConfig = {
            method: config.method,
            url: config.path,
            params: config.params,
            data: config.body,
            headers: {} as Record<string, string>  // headers 객체 초기화
        }



        return this.client
            .request<T>(requestConfig)
            .then((response: AxiosResponse<T>) => {
                return response.data
            })
            .catch((e: AxiosError<ErrorResponse>) => {
                // 401 Unauthorized 오류가 발생하면 로그아웃 처리
                if (e.response?.status === 401) {
                    this.authService.logout();
                    console.log('401 오류 발생 - 세션 만료');
                }
                return Promise.reject(new HttpError(e))
            })
    }

}