import { API_URL } from '$env/static/private';
import type { PageServerLoad, Actions } from './$types'; // Import Actions

type Reservation = {
  id: string;
  times: number[];
  student_number: string;
  phone_number: string;
  place: {
    id: string;
    name: string;
    count: number;
  };
};

export const load: PageServerLoad = async ({ fetch }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayDateString = `${year}-${month}-${day}`;
  // const todayDateString = `2025-05-08`;

  const [
    projectsRes,
    placesRes,
    reservationsRes,
    currentVideoRes,
    homeVideosRes,
    worksRes,
    recentProjectsRes,
    pinnedNoticesRes
  ] = await Promise.all([
    fetch(`${API_URL}/projects?page=1&limit=5`),
    fetch(`${API_URL}/place/admin/places`),
    fetch(`${API_URL}/place/admin/reservations?date=${todayDateString}`),
    fetch(`${API_URL}/home/videos/current`),
    fetch(`${API_URL}/home/videos`),
    fetch(`${API_URL}/project/works`),
    fetch(`${API_URL}/projects?recent=true`),
    fetch('https://task-api.wisoft.io/iceapple/notice/api/mobile/pin')
  ]);

  const projectsData = projectsRes.ok ? await projectsRes.json() : { projects: [] };
  const placesData = placesRes.ok ? await placesRes.json() : { places: [] };
  const reservationsData = reservationsRes.ok ? await reservationsRes.json() : { reservations: [] };
  const currentVideoData = currentVideoRes.ok ? await currentVideoRes.json() : null;
  const homeVideosData = homeVideosRes.ok ? await homeVideosRes.json() : [];
  const worksData = worksRes.ok ? await worksRes.json() : { works: [] };
  const recentProjectsData = recentProjectsRes.ok ? await recentProjectsRes.json() : { projects: [] };
  const pinnedNoticesData = pinnedNoticesRes.ok ? await pinnedNoticesRes.json() : { mobiles: [] };

  const uniqueTodayUsers = new Set(reservationsData.reservations.map((r: Reservation) => r.student_number)).size;

  // 회의실 예약 현황 목데이터
  const mockTodayReservations = [
    { name: "N5506", count: [2, 1, 0, 3, 2, 4, 1, 0, 2, 1] },
    { name: "N5507", count: [1, 2, 3, 1, 0, 2, 3, 2, 1, 0] },
    { name: "N5508", count: [0, 1, 2, 2, 1, 3, 2, 1, 0, 2] },
    { name: "N5509", count: [3, 0, 1, 0, 2, 1, 0, 3, 2, 1] },
    { name: "회의실A", count: [1, 3, 2, 1, 0, 2, 1, 2, 3, 0] }
  ];

  return {
    projects: projectsData.projects,
    places: placesData.places,
    totalPlaces: placesData.places.length,
    reservations: reservationsData.reservations,
    currentVideo: currentVideoData,
    homeVideos: homeVideosData,
    works: worksData.works,
    todayReservations: reservationsData.reservations, // 기존 데이터
    // todayReservations: mockTodayReservations, // 목데이터 사용
    recentProjects: recentProjectsData.projects,
    pinnedNotices: pinnedNoticesData.mobiles,
    uniqueTodayUsers: uniqueTodayUsers
  };
};

export const actions: Actions = {
  uploadVideo: async ({ request, fetch }) => {
    const formData = await request.formData();
    const title = formData.get('title');
    const file = formData.get('file');

    if (!title || !file) {
      return { success: false, message: '제목과 파일을 모두 입력해주세요.' };
    }

    const uploadFormData = new FormData();
    uploadFormData.append('title', title.toString());
    uploadFormData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/home/videos/upload`, {
        method: 'POST',
        body: uploadFormData
      });

      if (response.ok) {
        return { success: true, message: '영상이 성공적으로 등록되었습니다.' };
      } else {
        const errorData = await response.json();
        return { success: false, message: `영상 등록 실패: ${errorData.message || response.statusText}` };
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      return { success: false, message: '영상 등록 중 오류가 발생했습니다.' };
    }
  },

  deleteVideo: async ({ request, fetch }) => {
    const formData = await request.formData();
    const videoId = formData.get('id');

    if (!videoId) {
      return { success: false, message: '삭제할 영상 ID가 필요합니다.' };
    }

    try {
      const response = await fetch(`${API_URL}/home/videos/${videoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        return { success: true, message: '영상이 성공적으로 삭제되었습니다.' };
      } else {
        const errorData = await response.json();
        return { success: false, message: `영상 삭제 실패: ${errorData.message || response.statusText}` };
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      return { success: false, message: '영상 삭제 중 오류가 발생했습니다.' };
    }
  },

  setCurrentVideo: async ({ request, fetch }) => {
    const formData = await request.formData();
    const videoId = formData.get('id');

    if (!videoId) {
      return { success: false, message: '설정할 영상 ID가 필요합니다.' };
    }

    try {
      const response = await fetch(`${API_URL}/home/videos/${videoId}/current`, {
        method: 'PATCH'
      });

      if (response.ok) {
        return { success: true, message: '현재 영상이 성공적으로 변경되었습니다.' };
      } else {
        const errorData = await response.json();
        return { success: false, message: `현재 영상 설정 실패: ${errorData.message || response.statusText}` };
      }
    } catch (error) {
      console.error('Error setting current video:', error);
      return { success: false, message: '현재 영상 설정 중 오류가 발생했습니다.' };
    }
  }
};