import {inject, singleton} from "tsyringe";
import AxiosHttpClient, {type HttpRequestConfig} from "../http/AxiosHttpClient.ts";
import {type ClassConstructor, plainToInstance} from "class-transformer";


@singleton()
export default class HttpRepository {
    constructor(@inject(AxiosHttpClient) private readonly httpClient: AxiosHttpClient) {}

    public get<T>(config: HttpRequestConfig, clazz: ClassConstructor<T>): Promise<T> {
        return this.httpClient
            .request({...config, method: 'GET'})
            .then((response) => plainToInstance(clazz, response))
    }



}
