import { error, fail } from '@sveltejs/kit';
import { API_ENDPOINTS } from '$lib/config/api';
import type { ReservationGetResponse, Place, Reservation } from '$lib/types';
import { logger } from '$lib/utils';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch }) => {
    const date = url.searchParams.get("date") ?? new Date().toISOString().split("T")[0];

    const [reservationRes, placeRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.PLACE_RESERVATION}?date=2025-05-08`),
        fetch(API_ENDPOINTS.PLACE_PLACE) // 장소 리스트 가져오기
    ]);

    if (!reservationRes.ok) error(reservationRes.status);
    if (!placeRes.ok) error(placeRes.status);

    const reservationBody: ReservationGetResponse = await reservationRes.json();
    const placesBody: Place = await placeRes.json();

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

    console.log(reservationBody);
    console.log(placesBody);

    return {
        reservations: reservationBody,
        places: placesBody
    };
};

export const actions = {
    default: async ({ request, url, fetch }) => {
        const type = url.searchParams.get('type');
        const target = url.searchParams.get('target'); // work | place | reservation
        const id = url.searchParams.get('id');
        const formData = await request.formData();

        if (target === 'place') {
            if (type === 'create') {
                const response = await fetch(API_ENDPOINTS.PLACE_PLACE, {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) return fail(response.status, await response.json());
                return { success: true, message: '공간이 등록되었습니다.' };
            }

            if (type === 'delete' && id) {
                const response = await fetch(`${API_ENDPOINTS.PLACE_PLACE}/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) return fail(response.status, await response.json());
                return { success: true, message: '공간이 삭제되었습니다.' };
            }
        }

        if (target === 'reservation') {
            if (type === 'create') {
                const response = await fetch(API_ENDPOINTS.PLACE_RESERVATION, {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) return fail(response.status, await response.json());
                return { success: true, message: '예약이 등록되었습니다.' };
            }

            if (type === 'update' && id) {
                const response = await fetch(`${API_ENDPOINTS.PLACE_RESERVATION}/${id}`, {
                    method: 'PATCH',
                    body: formData,
                });
                if (!response.ok) return fail(response.status, await response.json());
                return { success: true, message: '예약이 수정되었습니다.' };
            }

            if (type === 'delete' && id) {
                const response = await fetch(`${API_ENDPOINTS.PLACE_RESERVATION}/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) return fail(response.status, await response.json());
                return { success: true, message: '예약이 취소되었습니다.' };
            }
        }

        return fail(400, { success: false, message: '잘못된 요청입니다.' });
    }
} satisfies Actions;
