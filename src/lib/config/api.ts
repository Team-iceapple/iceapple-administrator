import { API_URL } from '$env/static/private';

export const API_ENDPOINTS = {
  PROJECT_WORK: `${API_URL}/project/works`,
  PROJECT_FILE: `${API_URL}/project/files`,
  PLACE_PLACE: `${API_URL}/admin/place/places`,
  PLACE_RESERVATION: `${API_URL}/admin/place/reservations`,

} as const;
