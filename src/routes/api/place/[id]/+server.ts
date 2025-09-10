import { API_ENDPOINTS } from '$lib/config/api';
import { logger } from '$lib/utils';

export async function DELETE({ params }) {
    const { id } = params;

    const endpoint = `${API_ENDPOINTS.PLACE_PLACE}/${id}`;

    logger.log('공간 삭제 요청', {
        endpoint,
        id: id,
    });

    const response = fetch(endpoint, {
        method: 'DELETE',
    });

    return response;
}
