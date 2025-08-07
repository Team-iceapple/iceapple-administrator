export type Room = {
    id: string;
    name: string;
    description?: string | null;

}

export type Student = {
    id: string;
    number: string;
    phone: string;
}

export type Reservation = {
    id: string;
    times: string[];
    date: Date;
    room: Room;
    student: Student;
    description?: string | null;
};

export type ChangeType = 'APPLY' | 'EDIT' | 'DELETE';

export type PendingToChange = {
    id: number;
    type: ChangeType;
    data: Reservation;
};
