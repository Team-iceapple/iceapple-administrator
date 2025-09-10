import type { Place } from '$lib/types';

function emptyPlace(): Place {
    return {
        id: '',
        name: '',
        description: '',
        count: 0,
    };
}

export class PlaceModel {
    place = $state<Place>(emptyPlace());

    toPlain = () => {
        return $state.snapshot(this.place);
    };

    clear = () => {
        this.place = { ...emptyPlace() };
    };
}
