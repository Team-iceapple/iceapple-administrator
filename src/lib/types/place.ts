export type Place = {
  id: string;
  name: string;
  description: string;
  count: number | null;
};

export type PlaceModel = {
    id: string;
    name: string;
    description: string;
    count: number | null;
}

export type Student = {
  id: string;
  number: string;
  phone: string;
};

export type Reservation = {
    id: string;
    date: string;
    times: number[];
    student: {
        id: string;
        number: string;
        phone: string;
    };
    phone_number: string;
    place: {
        id: string;
        name: string;
        description: string;
        count: number;
    };
    res_count: number;
};

export type ReservationForm = {
    id: string;
    date: string;
    place_name: string;
    times: number[];
    student_number: string;
    phone_number: string;
    place_count: number;
    place_id: string;
}
