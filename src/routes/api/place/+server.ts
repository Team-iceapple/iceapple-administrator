import { API_ENDPOINTS } from '$lib/config/api';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, fetch }) => {
    const body = await request.json();

    const response = await fetch(API_ENDPOINTS.PLACE_PLACE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.json();
        return new Response(JSON.stringify({ success: false, message: err.message }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const result = await response.json();
    return new Response(JSON.stringify({ success: true, message: '공간이 등록되었습니다.', data: result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};
