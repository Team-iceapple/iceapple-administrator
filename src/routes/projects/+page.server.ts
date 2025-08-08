import { error, fail } from '@sveltejs/kit';
import { API_ENDPOINTS } from '$lib/config/api';
import type { ProjectGetResponse } from '$lib/types';
import { logger } from '$lib/utils';
import type { Actions, PageServerLoad } from './$types';

const PAGE_SIZE = 5;

export const load: PageServerLoad = async ({ url, fetch }) => {
  const response = await fetch(API_ENDPOINTS.PROJECT_WORK, {
    method: 'GET',
  });

  const body: ProjectGetResponse = await response.json();

  if (!response.ok) error(response.status, body.message);

  const allProjects = body.works;
  const currentPage = Number(url.searchParams.get('page')) || 1;

  const maxPage = Math.ceil(allProjects.length / PAGE_SIZE);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const projects = allProjects.slice(startIndex, endIndex);

  return {
    projects,
    currentPage,
    maxPage,
  };
};

export const actions = {
  default: async ({ request, url, fetch }) => {
    logger.log('Action 실행', url.toString());
    const type = url.searchParams.get('type') || 'create';

    const formData = await request.formData();
    logger.log('FormData', formData);

    if (type === 'create') {
      logger.log('create 액션');
      const response = await fetch(API_ENDPOINTS.PROJECT_WORK, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok)
        return fail(response.status, {
          success: false,
          message: (await response.json()).message,
        });

      return {
        success: true,
        message: '성공적으로 생성되었습니다.',
      };
    }

    if (type === 'update') {
      logger.log('update 액션');
      const id = url.searchParams.get('id');

      if (id === null)
        return fail(401, {
          success: false,
          message: '잘못된 요청입니다.',
        });

      const response = await fetch(`${API_ENDPOINTS.PROJECT_WORK}/${id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok)
        return fail(response.status, {
          success: false,
          message: (await response.json()).message,
        });

      return {
        success: true,
        message: '성공적으로 수정되었습니다.',
      };
    }
  },
} satisfies Actions;
