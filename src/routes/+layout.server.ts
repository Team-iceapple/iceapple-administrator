import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
  // 루트 레이아웃에서는 인증 상태 확인하지 않음
  return {};
};