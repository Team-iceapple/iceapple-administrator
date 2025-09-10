import type { PlaceModel } from '$lib/models/places/place.model.svelte';
import type { ReservationForm } from '$lib/types';

export class ReservationFormModel {
    reservation = $state<ReservationForm>(this.#emptyReservation());

    setReservation = (newReservation: ReservationForm) => {
        this.reservation = { ...newReservation };
    };

    clear = () => {
        this.reservation = { ...this.#emptyReservation() };
    };

    #emptyReservation() {
        return {
            id: '',
            date: new Date(),
            place_name: '',
            times: [],
            user_number: '',
            phone_number: '',
        };
    }
}
