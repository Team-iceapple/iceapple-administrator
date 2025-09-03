// 홈 대시보드 전용 타입들

export type HomeVideo = {
  filename: string;
  url?: string | null;
};

export type RoomAvailability = 'AVAILABLE' | 'IN_USE';

export type RoomStatus = {
  roomId: string;
  status: RoomAvailability;
};

export type ReservationDisplayUser = {
  name: string;   // 예: 김학생
  mask?: string;  // 예: **** (옵션)
};

export type ReservationSummary = {
  count: number;                      // 오늘 예약된 사용자 수
  users: ReservationDisplayUser[];    // 간단 표시용 목록
};

export type ProjectYearStat = {
  year: number;
  count: number;
};