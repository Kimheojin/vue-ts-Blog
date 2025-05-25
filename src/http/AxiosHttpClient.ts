import { singleton} from "tsyringe";
import type {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import axios from "axios";
import HttpError from "./HttpError.ts";
import type {ErrorResponse} from "../entity/interface/ErrorResponse.ts";


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
        withCredentials: true  // 언제나 쿠키 포함 설정
    })

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
                if (e.response?.status === 401) {
                    console.log('401 오류 발생 - 세션 만료');
                }
                return Promise.reject(new HttpError(e))
            })
    }
}