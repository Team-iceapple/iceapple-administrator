import { API_URL } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { ApiReservation } from '$lib/types/home';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    const token = cookies.get('accessToken');
    if (!token) {
        throw redirect(307, '/');
    }
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayDateString = `${year}-${month}-${day}`;

    const endpoints = {
        projects: `${API_URL}/projects?page=1&limit=5`,
        works: `${API_URL}/admin/project/works`,
        places: `${API_URL}/place/places`,
        reservations: `${API_URL}/place/admin/reservations?date=${todayDateString}`,
        homeVideos: `${API_URL}/home/admin/videos`,
        playlist: `${API_URL}/home/videos/playlist?includeCurrent=true`,
        pinnedNotices: `${API_URL}/notice/mobile/pin`
    }

    const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
    };

    const responses = await Promise.all(
        Object.entries(endpoints).map(([key, url]) =>
            fetch(url, { headers }).then(res => ({ [key]: res }))
        )
    );

    const apiResponses = responses.reduce((acc, curr) => ({ ...acc, ...curr }), {}) as Record<keyof typeof endpoints, Response>;

    const projectsData = apiResponses.projects.ok ? await apiResponses.projects.json() : { projects: [] };
    const placesData = apiResponses.places.ok ? await apiResponses.places.json() : { places: [] };
    const reservationsData = apiResponses.reservations.ok ? await apiResponses.reservations.json() : { reservations: [] };
    const homeVideosData = apiResponses.homeVideos.ok ? await apiResponses.homeVideos.json() : [];
    const playlistData = apiResponses.playlist.ok ? await apiResponses.playlist.json() : [];
    const worksData = apiResponses.works.ok ? await apiResponses.works.json() : { works: [] };
    const pinnedNoticesData = apiResponses.pinnedNotices.ok ? await apiResponses.pinnedNotices.json() : { mobiles: [] };

    const convertedReservations = reservationsData.reservations?.map((r: ApiReservation) => ({
        id: r.id,
        times: r.times,
        date: new Date(),
        student: {
            id: r.student_number,
            number: r.student_number,
            phone: r.phone_number
        },
        room: {
            id: r.place.id,
            name: r.place.name
        }
    })) || [];

    const uniqueTodayUsers = new Set(reservationsData.reservations?.map((r: ApiReservation) => r.student_number) || []).size;

    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

    const todayReservationsData = placesData.places?.map((place: any) => {
        const placeReservations = (reservationsData.reservations || []).filter((r: ApiReservation) => r.place.name === place.name);

        const count = timeSlots.map(timeSlot => {
            const hour = parseInt(timeSlot.split(':')[0]);
            const reservationsAtThisHour = placeReservations.filter((r: ApiReservation) => r.times.includes(hour));
            return reservationsAtThisHour.reduce((sum: number, r: ApiReservation) => sum + (r.res_count || 1), 0);
        });

        return {
            name: place.name,
            count: count,
            description: place.description
        };
    }) || [];

    const currentVideo = Array.isArray(playlistData) && playlistData.length > 0 ? { ...playlistData[0], current: true } : null;

    return {
        projects: projectsData.projects || [],
        places: placesData.places || [],
        totalPlaces: placesData.places?.length || 0,
        reservations: convertedReservations,
        currentVideo: currentVideo,
        homeVideos: Array.isArray(homeVideosData) ? homeVideosData : [],
        playlist: playlistData,
        works: worksData.works || [],
        todayReservations: todayReservationsData,
        pinnedNotices: pinnedNoticesData.mobiles || [],
        uniqueTodayUsers: uniqueTodayUsers
    };
};

export const actions: Actions = {

    uploadVideo: async ({ request, fetch, cookies }) => {
        const token = cookies.get('accessToken');
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
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
            const response = await fetch(`${API_URL}/home/admin/videos`, {
                method: 'POST',
                headers,
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

    deleteVideo: async ({ request, fetch, cookies }) => {
        const token = cookies.get('accessToken');
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const formData = await request.formData();
        const videoId = formData.get('id');

        if (!videoId) {
            return { success: false, message: '삭제할 영상 ID가 필요합니다.' };
        }

        try {
            const response = await fetch(`${API_URL}/home/admin/videos/${videoId}`, {
                method: 'DELETE',
                headers
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


    enableVideo: async ({ request, fetch, cookies }) => {
        const token = cookies.get('accessToken');
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const formData = await request.formData();
        const videoId = formData.get('id');
        const enabled = formData.get('enabled') === 'true';

        if (!videoId) {
            return { success: false, message: '영상 ID가 필요합니다.' };
        }

        try {
            const response = await fetch(`${API_URL}/home/admin/videos/${videoId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ enabled })
            });

            if (response.ok) {
                return { success: true, message: `영상이 ${enabled ? '활성화' : '비활성화'}되었습니다.` };
            } else {
                const errorData = await response.json();
                return { success: false, message: `영상 상태 변경 실패: ${errorData.message || response.statusText}` };
            }
        } catch (error) {
            console.error('Error enabling/disabling video:', error);
            return { success: false, message: '영상 상태 변경 중 오류가 발생했습니다.' };
        }
    },

    updateVideo: async ({ request, fetch, cookies }) => {
        const token = cookies.get('accessToken');
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const formData = await request.formData();
        const videoId = formData.get('id');
        const title = formData.get('title');
        const weight = formData.get('weight');
        const playbackRate = formData.get('playbackRate');
        const makeFirst = formData.get('makeFirst') === 'true';

        if (!videoId) {
            return { success: false, message: '영상 ID가 필요합니다.' };
        }

        const updateData: Record<string, string | number | boolean> = {};
        if (title) updateData.title = title.toString();
        if (weight) updateData.weight = parseInt(weight.toString());
        if (playbackRate) updateData.playbackRate = parseFloat(playbackRate.toString());
        if (makeFirst) updateData.makeFirst = true;

        try {
            const response = await fetch(`${API_URL}/home/admin/videos/${videoId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const message = makeFirst ? '영상이 최우선으로 설정되었습니다.' : '영상 정보가 성공적으로 업데이트되었습니다.';
                return { success: true, message };
            } else {
                const errorData = await response.json();
                return { success: false, message: `영상 정보 업데이트 실패: ${errorData.message || response.statusText}` };
            }
        } catch (error) {
            console.error('Error updating video:', error);
            return { success: false, message: '영상 정보 업데이트 중 오류가 발생했습니다.' };
        }
    }
};