import type { PlaceModel } from '$lib/models/places/place.model.svelte';
import type { ReservationForm } from '$lib/types';

export class ReservationFormModel {
    // @ts-ignore
    reservation = $state<ReservationForm>(this.#emptyReservation());

    setReservation = (newReservation: ReservationForm) => {
        this.reservation = { ...newReservation };
    };

    clear = () => {
        // @ts-ignore
        this.reservation = { ...this.#emptyReservation() };
    };

    #emptyReservation() {
        return {
            id: '',
            date: new Date(),
            place_name: '',
            times: [],
            student_number: '',
            user_name: '',
            phone_number: '',
            place_description: '',
            place_count: 0,
            place_id: '',
        };
    }
}
