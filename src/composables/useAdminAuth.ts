// component -> UI 재사용, composable -> 로직 재사용

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { container } from 'tsyringe';
import AuthService from '../service/AuthService.ts';
export function useAdminAuth() {
    const router = useRouter()
    const AUTH_SERVICE = container.resolve(AuthService);

    const isCheckingAuth = ref(true);
    const isAuthenticated = ref(false);

    const checkAuth = async () => {
        isCheckingAuth.value = true;

        try {
            const authResult = await AUTH_SERVICE.isAuthenticated();

            // 쿠키 세션 인증 실패 시
            if (!authResult) {
                ElMessage.warning('로그인이 필요합니다.');
                router.replace('/admin/login');
                return false;
            }

            isAuthenticated.value = true;
            return true;
        } catch (error) {
            console.error('인증 확인 중 오류:', error);
            ElMessage.warning('세션이 만료되었습니다. 다시 로그인해주세요.');
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