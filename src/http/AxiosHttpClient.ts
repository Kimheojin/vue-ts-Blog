import {singleton} from "tsyringe";
import type {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import axios from "axios";
import HttpError from "./HttpError.ts";
import type {ErrorResponse} from "../data/interface/ErrorResponse.ts";

// API 에러 응답 타입 정의


export type HttpRequestConfig = {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    path: string
    params?: any
    body?: any
}

@singleton()
export default class AxiosHttpClient {
    private readonly client: AxiosInstance = axios.create({
        timeout: 3000,
        timeoutErrorMessage: '시간 초과에요, 유감이네요',
    })

    public async request<T = any>(config: HttpRequestConfig): Promise<T> {
        return this.client
            .request<T>({
                method: config.method,
                url: config.path,
                params: config.params,
                data: config.body,
            })
            .then((response: AxiosResponse<T>) => {
                return response.data
            })
            .catch((e: AxiosError<ErrorResponse>) => {
                return Promise.reject(new HttpError(e))
            })
    }
}