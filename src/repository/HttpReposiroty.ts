import {inject, singleton} from "tsyringe";
import AxiosHttpClient, {type HttpRequestConfig} from "../http/AxiosHttpClient.ts";
import {type ClassConstructor, plainToInstance} from "class-transformer";
import Paging from "../entity/data/Paging.ts";





@singleton()
export default class HttpRepository {
    constructor(@inject(AxiosHttpClient) private readonly httpClient: AxiosHttpClient) {}

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


}
