import { API_ENDPOINTS } from '$lib/config/api';
import { logger } from '$lib/utils';

export async function GET({ params }) {
  const { id } = params;

  const endpoint = `${API_ENDPOINTS.PROJECT_WORK}/${id}`;
  logger.log('프로젝트 세부 정보 요청', {
    endpoint,
    id: id,
  });

  const response = fetch(endpoint, {
    method: 'GET',
  });

  return response;
}
