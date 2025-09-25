import {API_ENDPOINTS} from '$lib/config/api';
import {logger} from '$lib/utils/logger';

type AcceptType = 'png' | 'jpeg' | 'pdf';

function isAcceptType(type: string | null): type is AcceptType {
    return type === 'png' || type === 'jpeg' || type === 'pdf';
}

function MIMEType(type: AcceptType) {
    if (type === 'png' || type === 'jpeg') return `image/${type}`;

    return 'application/pdf';
}

export async function GET({params, url, request}) {
    const {id} = params;

    const typeParam = url.searchParams.get('type');
    const mime = isAcceptType(typeParam) ? MIMEType(typeParam) : 'png';

    const authHeader = request.headers.get('Authorization');

    const headers: HeadersInit = {
        Accept: mime,
    };

    if (authHeader) {
        headers['Authorization'] = authHeader;
    }

    const endpoint = `${API_ENDPOINTS.PROJECT_FILE}/${id}`;

    logger.log('파일 요청', {
        endpoint,
        id: id,
        MIME: mime,
        hasAuth: !!authHeader,
    });

    const response = await fetch(endpoint, {
        method: 'GET',
        headers,
    });

    if (!response.ok) return response;

    const cachedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });

    cachedResponse.headers.set('Cache-Control', 'private, max-age=600');

    return cachedResponse;
}
