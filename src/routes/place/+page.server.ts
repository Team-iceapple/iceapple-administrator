import {error, fail, redirect} from '@sveltejs/kit';
import { API_ENDPOINTS } from '$lib/config/api';
import type {Place, Reservation, ApiReservation} from '$lib/types';
import { logger } from '$lib/utils';
import type { Actions, PageServerLoad } from './$types';
import {API_URL} from "$env/static/private";

export const load: PageServerLoad = async ({ url, fetch, cookies }) => {
    const token = cookies.get('accessToken');
    const selectedDate = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!token) {
        throw redirect(307, '/');
    }

    const headers: HeadersInit = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const endpoints = {
        places: `${API_URL}/admin/place/places`,
        reservations: `${API_URL}/admin/place/reservations?date=${selectedDate}`,
    };

    const responses = await Promise.all(
        Object.entries(endpoints).map(([key, url]) =>
            fetch(url, { headers }).then(res => ({ [key]: res }))
        )
    );

    const apiResponses = responses.reduce((acc, curr) => ({ ...acc, ...curr }), {}) as Record<keyof typeof endpoints, Response>;

    const placesData = apiResponses.places.ok ? await apiResponses.places.json() : { places: [] };
    const reservationsData = apiResponses.reservations.ok ? await apiResponses.reservations.json() : { reservations: [] };

    console.log(apiResponses.reservations);
    const individualPlaces = (placesData.places || []).flatMap((place: any) => {
        const count = place.count && place.count > 1 ? place.count : 1;

        return Array.from({ length: count }, (_, i) => ({
            individualId: `${place.id}_${i + 1}`,
            displayName: count > 1 ? `${place.name}-${i + 1}` : place.name,
            originalId: place.id,
            name: place.name,
            placeIndex: i,
            description: place.description,
            count: 1
        }));
    });

    const convertedReservations = reservationsData.reservations?.map((r: ApiReservation) => ({
        id: r.id,
        times: r.times,
        date: selectedDate,
        student: {
            id: r.student_number,
            number: r.student_number,
            phone: r.phone_number
        },
        place: {
            id: r.place.id,
            name: r.place.name,
            count: r.place.count
        },
        res_count: r.res_count
    })) || [];

    console.log(convertedReservations);

    const uniqueTodayUsers = new Set(reservationsData.reservations?.map((r: ApiReservation) => r.student_number) || []).size;

    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

    const todayReservationsData = individualPlaces.map((individualPlace: any) => {
        // 개별 공간의 예약은 (현재 로직에서는) 원본 place.name과 일치하는 모든 예약을 사용합니다.
        // **주의**: API가 개별 공간(예: 504호-1)을 구분하여 예약 데이터를 주지 않는다면,
        // 예약 데이터 (`reservationsData.reservations`)는 원본 이름(예: '504호')으로만 필터링해야 합니다.
        // 여기서는 API가 원본 이름으로 예약을 제공한다고 가정하고 필터링합니다.

        const placeReservations = (reservationsData.reservations || []).filter((r: ApiReservation) => r.place.name === individualPlace.name);

        // ... (count 계산 로직은 현재 todayReservationsData에서는 사용하지 않으므로 생략 가능하나, 구조 유지를 위해 그대로 둡니다.)
        const count = timeSlots.map(timeSlot => {
            const hour = parseInt(timeSlot.split(':')[0]);
            return placeReservations.filter((r: ApiReservation) => r.times.includes(hour)).length;
        });

        return {
            ...individualPlace,
            count: count, // 시간대별 예약 갯수 (사용 안 함)
        };
    }) || [];

    // const [reservationRes, placeRes] = await Promise.all([
    //     fetch(`${API_ENDPOINTS.PLACE_RESERVATION}?date=2025-05-08`),
    //     fetch(API_ENDPOINTS.PLACE_PLACE) // 장소 리스트 가져오기
    // ]);

    // if (!reservationRes.ok) error(reservationRes.status);
    // if (!placeRes.ok) error(placeRes.status);

    // const reservationBody: ReservationGetResponse = await reservationRes.json();
    // const placesBody: Place = await placeRes.json();

    // // 예약을 place 단위로 묶기
    // const groupedByPlace = reservationBody.reservations.reduce((acc, reservation) => {
    //     const placeId = reservation.place.id;
    //
    //     if (!acc[placeId]) {
    //         acc[placeId] = {
    //             place: reservation.place,
    //             reservations: []
    //         };
    //     }
    //
    //     acc[placeId].reservations.push({
    //         id: reservation.id,
    //         times: reservation.times,
    //         student_number: reservation.student_number,
    //         phone_number: reservation.phone_number
    //     });
    //
    //     return acc;
    // }, {} as Record<string, { place: Reservation["place"]; reservations: Omit<Reservation, "place">[] }>);

    console.log(individualPlaces);

    return {
        places: individualPlaces,
        totalPlaces: individualPlaces.length || 0,
        reservations: convertedReservations,
        todayReservations: todayReservationsData,
    };
};

export const actions = {
    default: async ({ request, url, fetch, cookies }) => {
        const type = url.searchParams.get('type');
        const target = url.searchParams.get('target'); // work | place | reservation
        const id = url.searchParams.get('id');
        const formData = await request.formData();
        const token = cookies.get('accessToken');
        const headers: HeadersInit = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        console.log(headers);

        if (target === 'place') {
            if (type === 'create') {
                const response = await fetch(API_ENDPOINTS.PLACE_PLACE, {
                    method: 'POST',
                    headers,
                    body: formData,
                });
                if (!response.ok) return fail(response.status, await response.json());
                return { success: true, message: '공간이 등록되었습니다.' };
            }

            if (type === 'delete' && id) {
                const response = await fetch(`${API_ENDPOINTS.PLACE_PLACE}/${id}`, {
                    method: 'DELETE',
                    headers,
                });
                if (!response.ok) return fail(response.status, await response.json());
                return { success: true, message: '공간이 삭제되었습니다.' };
            }
        }

        if (target === 'reservation') {
            if (type === 'create') {
                const response = await fetch(API_ENDPOINTS.PLACE_RESERVATION, {
                    method: 'POST',
                    headers,
                    body: formData,
                });
                if (!response.ok) return fail(response.status, await response.json());
                return { success: true, message: '예약이 등록되었습니다.' };
            }

            if (type === 'update' && id) {
                const response = await fetch(`${API_ENDPOINTS.PLACE_RESERVATION}/${id}`, {
                    method: 'PATCH',
                    headers,
                    body: formData,
                });
                if (!response.ok) return fail(response.status, await response.json());
                return { success: true, message: '예약이 수정되었습니다.' };
            }

            if (type === 'delete' && id) {
                const response = await fetch(`${API_ENDPOINTS.PLACE_RESERVATION}/${id}`, {
                    method: 'DELETE',
                    headers,
                });
                if (!response.ok) return fail(response.status, await response.json());
                return { success: true, message: '예약이 취소되었습니다.' };
            }
        }

        return fail(400, { success: false, message: '잘못된 요청입니다.' });
    }
} satisfies Actions;
