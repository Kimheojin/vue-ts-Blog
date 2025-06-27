export interface ErrorResponse {
    message: string
    statusCode: number
    code?: string  //
    validation?: { [key: string]: string }  // Spring 코드 -> Map<String, String>에 대응
}