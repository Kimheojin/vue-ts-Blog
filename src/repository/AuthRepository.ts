import {inject, singleton} from "tsyringe";
import HttpRepository from "./HttpRepository.ts";
import type LoginRequest from "../entity/user/LoginRequest.ts";


@singleton()
export default class AuthRepository {
    constructor(@inject(HttpRepository) private readonly httpRepository: HttpRepository) {
    }

    public login(request: LoginRequest){
        return this.httpRepository.post({
            path: '/api/login',
            body: request
        })
    }
}