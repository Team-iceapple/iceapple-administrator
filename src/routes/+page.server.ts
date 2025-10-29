import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
    // 이미 로그인된 경우 대시보드로 리다이렉트
    const token = cookies.get('accessToken');
    if (token) {
        throw redirect(307, '/dashboard');
    }

    return {};
};
