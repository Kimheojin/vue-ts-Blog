import type {AxiosError} from "axios";
import type {ErrorResponse} from "../entity/interface/ErrorResponse.ts";
export default class HttpError{
    private readonly code: string
    private readonly message: string

    constructor(e: AxiosError<ErrorResponse>) { // 디폴트 오류
        this.code = e.response?.data?.code || '500'
        this.message = e.response?.data?.message || '네트워크 상태 확인 필요'
    }
    public getCode(): string {
        return this.code
    }

    public getMessage(): string {
        return this.message
    }
}