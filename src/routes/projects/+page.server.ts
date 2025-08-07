import { error } from '@sveltejs/kit';
import { API_URL } from '$env/static/private';
import type { Project } from '$lib/types';
import type { PageServerLoad } from './$types';

const IMAGE_URL = new URL('project/files', API_URL).toString();
const PAGE_SIZE = 5;

export const load: PageServerLoad = async ({ url }) => {
  const allProjects = await loadProjects();
  const currentPage = getCurrentPage(url);

  const maxPage = Math.ceil(allProjects.length / PAGE_SIZE);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const projects = allProjects.slice(startIndex, endIndex);

  return {
    projects,
    IMAGE_URL,
    currentPage,
    maxPage,
  };
};

async function loadProjects(): Promise<Project[]> {
  const apiPath = 'project/works';
  const fullUrl = new URL(apiPath, API_URL);

  const response = await fetch(fullUrl, {
    method: 'GET',
  });

  const body = await response.json();

  if (!response.ok) error(response.status, body.message);

  return body.works;
}

function getCurrentPage(url: URL): number {
  return Number(url.searchParams.get('page')) || 1;
}
