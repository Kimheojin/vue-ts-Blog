import {inject, singleton} from "tsyringe";
import AxiosHttpClient, {type HttpRequestConfig} from "../http/AxiosHttpClient.ts";
import {type ClassConstructor, plainToInstance} from "class-transformer";
import Paging from "../entity/data/Paging.ts";
import Null from "../entity/data/Null.ts";


@singleton()
export default class HttpRepository {
    constructor(@inject(AxiosHttpClient) private readonly httpClient: AxiosHttpClient) {}

    // clazz -> 응답 데이터를 변환할 클래스 성성자
    public get<T>(config: HttpRequestConfig, clazz: ClassConstructor<T>): Promise<T> {
        return this.httpClient
            .request({...config, method: 'GET'})
            .then((response) => plainToInstance(clazz, response))
    }

    public getList<T>(config: HttpRequestConfig, clazz: ClassConstructor<T>): Promise<Paging<T>> {
        return this.httpClient.request({ ...config, method: 'GET' }).then((response) => {
            // Paging 인스턴스 생성
            const paging = plainToInstance(Paging, response) as Paging<T>;

            // items를 변환할 때 명시적으로 배열임을 표시
            const items = Array.isArray(response.items)
                ? plainToInstance(clazz, response.items)
                : [];

            // 타입 단언을 사용하여 타입 호환성 문제 해결
            paging.setItems(items as T[]);
            return paging;
        });
    }

    public getSimpleList<T>(config: HttpRequestConfig, clazz: ClassConstructor<T>): Promise<T[]> {
        return this.httpClient.request({ ...config, method: 'GET' }).then((response) => {
            // categoryResponses가 있으면 그것을 사용, 없으면 빈 배열 반환
            const itemsArray = response.categoryResponses || [];

            // 배열 변환
            return Array.isArray(itemsArray)
                ? plainToInstance(clazz, itemsArray)
                : [];
        });
    }

    public delete<T>(config: HttpRequestConfig, clazz:ClassConstructor<T> | null = null) : Promise<T | unknown> {
        return this.httpClient
            .request({
                ...config, method: 'DELETE'
            })
            .then((response) => plainToInstance(clazz !== null ? clazz : (Null as any), response))
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
