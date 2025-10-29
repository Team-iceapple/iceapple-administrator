/**
 * JWT 토큰 관리 유틸리티 함수들
 */

const TOKEN_KEY = 'accessToken';

/**
 * localStorage에서 JWT 토큰을 가져옵니다
 */
export function getToken(): string | null {

    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * localStorage에 JWT 토큰을 저장합니다
 */
export function setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);

    // 쿠키에도 저장 (서버에서 접근 가능)
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
    
    // 커스텀 이벤트 발생시켜 즉시 UI 업데이트
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: true } }));
}

/**
 * localStorage에서 JWT 토큰을 삭제합니다
 */
export function removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);

    // 쿠키에서도 삭제
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    
    // 커스텀 이벤트 발생시켜 즉시 UI 업데이트
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: false } }));

}

/**
 * 토큰이 존재하는지 확인합니다
 */
export function hasToken(): boolean {
    return getToken() !== null;
}

/**
 * API 요청을 위한 기본 헤더를 반환합니다
 */
export function getAuthHeaders(): HeadersInit {

    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(headers);

    return headers;
}

/**
 * 인증된 fetch 요청을 수행합니다
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
        ...getAuthHeaders(),
        ...options.headers,
    };

    return fetch(url, {
        ...options,
        headers,
    });
}

/**
 * 세션을 연장합니다
 */
export async function extendSession(): Promise<{ success: boolean; message: string }> {
    try {
        const response = await authFetch('/api/auth/extends', {
            method: 'POST',
        });

        const data = await response.json();

        if (response.ok) {
            if(data.token) {
                setToken(data.token);
            }
            return {success: true, message: '로그인이 연장되었습니다.'};
        } else {
            return {success: false, message: data.error || '로그인 연장에 실패했습니다.'};
        }
    } catch (error) {
        console.error('로그인 연장 에러:', error);
        return {success: false, message: '네트워크 오류가 발생했습니다.'};
    }
}

/**
 * JWT 토큰에서 만료시간을 추출합니다
 */
export function getTokenExpiresAt(token: string): number | null {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) {
            return null;
        }
        const payload = JSON.parse(atob(parts[1]));
        return payload.exp ? payload.exp * 1000 : null;
    } catch (e) {
        console.error('토큰 파싱 에러', e);
        return null;
    }
}


/**
 * 토큰의 남은 시간을 계산합니다(초 단위)
 */
export function getTokenTimeLeft(): number {
    const token = getToken();
    if(!token) return 0;

    const expiresAt = getTokenExpiresAt(token);
    if (!expiresAt) return 0;

    const now = Date.now();
    const timeLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
    return timeLeft;
}



export function isTokenExpired(): boolean {
    return getTokenTimeLeft() === 0;
}

