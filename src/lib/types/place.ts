export type Place = {
  id: string;
  name: string;
  description: string;
  count: number | null;
};

export type Student = {
  id: string;
  number: string;
  phone: string;
};

export type Reservation = {
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

export type ReservationForm = {
    id: string;
    date: Date;
    place_name: string;
    times: number[];
    user_number: string;
    phone_number: string;
}

export type ReservationGetResponse = {
    reservations: Reservation[];
};
