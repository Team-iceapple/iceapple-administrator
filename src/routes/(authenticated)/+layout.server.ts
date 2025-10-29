import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const token = cookies.get('accessToken');
  
  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    throw redirect(307, '/');
  }
  
  return {
    isAuthenticated: true
  };
};
