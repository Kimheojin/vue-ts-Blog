import { ElMessage } from 'element-plus';


// HttpError에 맞게 처리하는 코드
export function useErrorHandler() {

    const customHandleError = (error: any, defaultMessage: string = '작업에 실패했습니다.') => {
        if (error === 'cancel') {
            return; // 사용자 취소는 무시
        }

        console.error('오류 발생:', error);

        let errorMessage = defaultMessage;

        // HttpError 객체인 경우 (getter 메서드 사용)
        if (error?.getStatusCode && error?.getMessage) {
            const statusCode = error.getStatusCode();
            const message = error.getMessage();
            const validation = error.getValidation();

            errorMessage = `${statusCode} - ${message}`;
            console.log('HttpError 사용:', errorMessage);

            // validation 에러가 있는 경우 추가 정보 표시
            if (validation && Object.keys(validation).length > 0) {
                const validationErrors = Object.values(validation).join(', ');
                errorMessage += `\n검증 오류: ${validationErrors}`;
            }
        }
        // 일반 에러인 경우
        else if (error?.message) {
            errorMessage = error.message;
        }

        console.log('최종 errorMessage:', errorMessage);
        ElMessage.error(errorMessage);
    };

    return {
        customHandleError
    };
}