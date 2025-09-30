import { API_ENDPOINTS } from '$lib/config/api';
import { logger } from '$lib/utils';

export async function DELETE({ params, request }) {
    const { id } = params;

    const endpoint = `${API_ENDPOINTS.PLACE_PLACE}/${id}`;
    const authHeader = request.headers.get('Authorization');

    logger.log('공간 삭제 요청', {
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
        method: 'DELETE',
        headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json' },
    });

    return response;
}
