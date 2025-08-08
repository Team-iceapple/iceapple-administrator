import { API_URL } from '$env/static/private';
import { logger } from '$lib/utils';

const FULL_API_URL = new URL('project/works/', API_URL);

export async function GET({ params }) {
  const { id } = params;

  logger.log('프로젝트 세부 정보 요청', {
    endpoint: `/project/works/${id}`,
    id: id,
  });

  const response = fetch(new URL(id, FULL_API_URL), {
    method: 'GET',
  });

  return response;
}
