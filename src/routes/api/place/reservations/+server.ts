import { API_ENDPOINTS } from '$lib/config/api';
import type { RequestHandler } from './$types';
import {logger} from "$lib/utils";

export const POST: RequestHandler = async ({ request, fetch }) => {
    const body = await request.json();
    const authHeader = request.headers.get('Authorization');

    logger.log('POST', authHeader);
    logger.log('POST', body);

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        logger.log('인증 토큰 없음');
        return new Response(JSON.stringify({ error: '인증 토큰이 필요합니다.' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    const response = await fetch(API_ENDPOINTS.PLACE_RESERVATION, {
        method: 'POST',
        headers: {
            'Authorization': `${authHeader}`,
            'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    logger.log('POST', JSON.stringify(body));

    if (!response.ok) {
        const err = await response.json();
        console.log(response.status);
        return new Response(JSON.stringify({ success: false, message: err.message }), {
            status: response.status,
            headers: {
                'Authorization': `${authHeader}`,
                'Content-Type': 'application/json' }
        });
    }

    const result = await response.json();
    return new Response(JSON.stringify({ success: true, message: '예약이 등록되었습니다.', data: result }), {
        status: 201,
        headers: {
            'Authorization': `${authHeader}`,
            'Content-Type': 'application/json' }
    });
};
