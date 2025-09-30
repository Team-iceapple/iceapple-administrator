import { API_ENDPOINTS } from '$lib/config/api';
import { logger } from '$lib/utils';

export async function PATCH({ params, request }) {
    const { id } = params;

    const endpoint = `${API_ENDPOINTS.PLACE_RESERVATION}/${id}`;
    const authHeader = request.headers.get('Authorization');
    const body = await request.json();

    logger.log('예약 수정 요청', {
        endpoint,
        id: id,
        headers: authHeader,
    });

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        logger.log('인증 토큰 없음');
        return new Response(JSON.stringify({ error: '인증 토큰이 필요합니다.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    const response = fetch(endpoint, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${authHeader},`
        },
        body: JSON.stringify(body),
    });

    return response;
}

export async function DELETE({ params, request }) {
    const { id } = params;

    const endpoint = `${API_ENDPOINTS.PLACE_RESERVATION}/${id}`;
    const authHeader = request.headers.get('Authorization');
    logger.log('예약 삭제 요청', {
        endpoint,
        id: id,
        headers: authHeader,
    });

    const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
            'Authorization':`${authHeader}`,
        }
    });

    return response;
}
