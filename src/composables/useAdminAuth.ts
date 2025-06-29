import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { container } from 'tsyringe';
import AuthService from '../service/AuthService.ts';
import HttpError from "../http/HttpError.ts";

export function useAdminAuth() {
    const router = useRouter()
    const AUTH_SERVICE = container.resolve(AuthService);

    const isCheckingAuth = ref(true);
    const isAuthenticated = ref(false);

    const checkAuth = async () => {
        isCheckingAuth.value = true;

        try {
            const authResult = await AUTH_SERVICE.isAuthenticated();

            if (!authResult) {
                ElMessage.warning('로그인이 필요합니다.');
                router.replace('/admin/login');
                return false;
            }

            isAuthenticated.value = true;
            return true;
        } catch (error: unknown) {
            console.error('인증 확인 중 오류:', error);

            if(error instanceof HttpError) {
                console.log(`HTTP 오류 - 상태코드: ${error.getStatusCode()}, 메시지: ${error.getMessage()}`);

                ElMessage.warning(error.getMessage());
            }

            router.replace('/admin/login');
            return false;
        } finally {
            isCheckingAuth.value = false;
        }
    };

    return {
        isCheckingAuth,
        isAuthenticated,
        checkAuth,
    };
}