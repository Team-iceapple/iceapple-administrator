import { API_ENDPOINTS } from '$lib/config/api';
import { logger } from '$lib/utils';

export async function POST({ request, fetch }: { request: Request; fetch: typeof globalThis.fetch }) {
    logger.log('세션 연장 요청');

    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.log('인증 토큰 없음');
            return new Response(JSON.stringify({ error: '인증 토큰이 필요합니다.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const response = await fetch(API_ENDPOINTS.AUTH_EXTENDS, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            logger.log('세션 연장 실패', { status: response.status, error: data });
            return new Response(JSON.stringify(data), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const clientResponse = {
            success: true,
            token: data.accessToken,
            methode: data.method || '세션이 연장되었습니다.'
        }

        logger.log('세션 연장 성공');
        return new Response(JSON.stringify(clientResponse), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        logger.log('세션 연장 에러', error);
        return new Response(JSON.stringify({ error: '서버 오류가 발생했습니다.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}