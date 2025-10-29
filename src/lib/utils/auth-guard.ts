import { goto } from '$app/navigation';
import { hasToken } from './auth';

/**
 * 클라이언트 사이드에서 인증 상태를 확인하고 로그인이 필요한 경우 로그인 페이지로 리다이렉트
 */
export function requireAuth(): boolean {
    if (typeof window === 'undefined') return true; // 서버 사이드에서는 통과

    if (!hasToken()) {
        goto('/login');
        return false;
    }

    return true;
}

/**
 * 로그인된 사용자가 로그인 페이지에 접근하는 경우 메인 페이지로 리다이렉트
 */
export function redirectIfAuthenticated(): boolean {
    if (typeof window === 'undefined') return true; // 서버 사이드에서는 통과

    if (hasToken()) {
        goto('/dashboard');
        return false;
    }

    return true;
}
