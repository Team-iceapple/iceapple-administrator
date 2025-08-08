import { API_URL } from '$env/static/private';
import { logger } from '$lib/utils';

const FULL_API_URL = new URL('project/works', API_URL);

export async function GET() {
  logger.log('프로젝트 목록 요청', {
    endpoint: `/project/works`,
  });

  const response = fetch(FULL_API_URL, {
    method: 'GET',
  });

  return response;
}
