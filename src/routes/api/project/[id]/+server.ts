import {API_ENDPOINTS} from '$lib/config/api';
import {logger} from '$lib/utils';

export async function GET({params, request}) {
    const {id} = params;
    const authHeader = request.headers.get('Authorization');

    const headers: HeadersInit = {};
    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    const endpoint = `${API_ENDPOINTS.PROJECT_WORK}/${id}`;
    logger.log('프로젝트 세부 정보 요청', {
        endpoint,
        id: id,
        hasAuth: !!authHeader
    });

    const response = fetch(endpoint, {
        method: 'GET',
        headers
    });

    return response;
}

export async function DELETE({params, request}) {
    const {id} = params;
    const authHeader = request.headers.get('Authorization');

    const headers: HeadersInit = {};
    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    const endpoint = `${API_ENDPOINTS.PROJECT_WORK}/${id}`;

    logger.log('프로젝트 삭제 요청', {
        endpoint,
        id: id,
        hasAuth: !!authHeader
    });

    const response = fetch(endpoint, {
        method: 'DELETE',
        headers
    });

    return response;
}
