import { singleton} from "tsyringe";
import type {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import axios from "axios";
import HttpError from "./HttpError.ts";
import type {ErrorResponse} from "../entity/interface/ErrorResponse.ts";

export type HttpRequestConfig = {
    method?: 'GET' | 'POST' | 'PUT' |'PATCH' | 'DELETE'
    path: string
    params?: any
    body?: any
    withAuth?: boolean
}

@singleton()
export default class AxiosHttpClient {
    private readonly client: AxiosInstance = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        timeout: 10000,
        timeoutErrorMessage: '시간 초과에요',
        withCredentials: true,  // 글로벌 설정
        headers: {
            'Content-Type': 'application/json',
            // 'Accept': 'application/json'
        }
    })

    constructor() {
        // 요청 인터셉터
        this.client.interceptors.request.use(
            (config) => {
                // withCredentials를 각 요청마다 명시적으로 설정
                config.withCredentials = true;
                // FormData 감지시 Content-Type 헤더 제거
                if (config.data instanceof FormData) {
                    console.log('FormData 감지됨 - Content-Type 헤더 제거');
                    delete config.headers['Content-Type'];
                    delete config.headers['content-type'];
                }

                console.log('요청 전송:', {
                    url: `${config.baseURL}${config.url}`,
                    method: config.method?.toUpperCase(),
                    withCredentials: config.withCredentials,
                    data: config.data,
                    params: config.params
                });

                console.log('요청 시점 쿠키:', document.cookie);

                return config;
            },
            (error) => {
                console.error('요청 인터셉터 오류:', error);
                return Promise.reject(error);
            }
        );

        // 응답 인터셉터
        this.client.interceptors.response.use(
            (response) => {
                console.log('응답 수신:', {
                    url: response.config.url,
                    status: response.status,
                    statusText: response.statusText,
                    data: response.data
                });

                return response;
            },
            (error) => {
                console.error('응답 오류:', {
                    url: error.config?.url,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    responseData: error.response?.data,
                    message: error.message
                });

                // 401 오류 특별 처리
                if (error.response?.status === 401) {
                    console.log('401 Unauthorized - 쿠키 확인 필요');
                    console.log('401 오류 시 쿠키:', document.cookie);
                }

                return Promise.reject(error);
            }
        );
    }

    // header 부분 json 만 호환되게 짜놨어서 form 데이터도 호환되게 수정
    public async request<T = any>(config: HttpRequestConfig): Promise<T> {
        const isFormData = config.body instanceof FormData
        console.log('FormData 감지:', isFormData, config.body);

        const requestConfig = {
            method: config.method,
            url: config.path,
            params: config.params,
            data: config.body,
            // withCredentials를 명시적으로 true로 설정
            withCredentials: true,
            // accept -> 반환타입 지정?
            // content-Type -> 요청 타입
            headers: isFormData ? {
                'Accept' : 'application/json'
            } :{
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
        }



        return this.client
            .request<T>(requestConfig)
            .then((response: AxiosResponse<T>) => {
                return response.data
            })
            .catch((e: AxiosError<ErrorResponse>) => {
                console.error('AxiosHttpClient 오류 처리:', e.response?.status, e.response?.data);
                return Promise.reject(new HttpError(e))
            })
    }
}