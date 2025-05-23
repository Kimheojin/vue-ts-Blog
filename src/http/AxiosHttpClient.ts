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
                // 401 Unauthorized 오류가 발생하면 세션이 만료된 것으로 간주
                if (e.response?.status === 401) {
                    this.authService.logout(); // 세션 정보 삭제
                }
                return Promise.reject(new HttpError(e))
            })
    }
}