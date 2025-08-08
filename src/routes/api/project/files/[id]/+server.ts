import { API_URL } from '$env/static/private';
import { logger } from '$lib/utils/logger';

const FULL_API_URL = new URL('project/files/', API_URL);

type AcceptType = 'png' | 'jpeg' | 'pdf';

function isAcceptType(type: string | null) {
  return type === 'png' || type === 'jpeg' || type === 'pdf';
}

function toMIMEType(type: AcceptType) {
  if (type === 'png' || type === 'jpeg') return `image/${type}`;

  return 'application/pdf';
}

export async function GET({ params, url }) {
  const { id } = params;
  const typeParam = url.searchParams.get('type');
  const type = isAcceptType(typeParam) ? typeParam : 'png';

  logger.log('파일 요청', {
    endpoint: `/project/files/${id}`,
    id: id,
    requestedType: typeParam,
  });

  const response = await fetch(new URL(id, FULL_API_URL), {
    method: 'GET',
    headers: {
      Accept: toMIMEType(type),
    },
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
