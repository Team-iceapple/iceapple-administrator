export type ApiReservation = {
  id: string;
  times: number[];
  student_number: string;
  phone_number: string;
  place: {
    id: string;
    name: string;
    count: number;
  };
  res_count: number;
};

export type AdminVideo = {
  id: string;
  title: string;
  filePath: string;
  fileUrl: string;
  enabled: boolean;
  weight: number;
  playbackRate: number;
  current?: boolean;
};
