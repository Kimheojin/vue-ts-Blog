import {inject, singleton} from "tsyringe";
import AxiosHttpClient, {type HttpRequestConfig} from "../http/AxiosHttpClient.ts";
import {type ClassConstructor, plainToInstance} from "class-transformer";

@singleton()
export default class HttpRepository {
    constructor(@inject(AxiosHttpClient) private readonly httpClient: AxiosHttpClient) {}

    // clazz -> 응답 데이터를 변환할 클래스 성성자
    public get<T>(config: HttpRequestConfig, clazz: ClassConstructor<T>): Promise<T> {
        return this.httpClient
            .request({...config, method: 'GET'})
            .then((response) => plainToInstance(clazz, response))
    }



    public delete<T>(config: HttpRequestConfig, clazz: ClassConstructor<T> | null = null): Promise<T> {
        return this.httpClient
            .request({ ...config, method: 'DELETE' })
            .then((response) => {
                return clazz !== null
                    ? plainToInstance(clazz, response) as T
                    : response as unknown as T;
            });
    }

    public post<T>(config: HttpRequestConfig, clazz: ClassConstructor<T> | null = null): Promise<T> {
        return this.httpClient
            .request({ ...config, method: 'POST' })
            .then((response) => {
                // null 처리 개선
                return clazz !== null
                    ? plainToInstance(clazz, response) as T
                    : response as unknown as T;
            });
    }


}
