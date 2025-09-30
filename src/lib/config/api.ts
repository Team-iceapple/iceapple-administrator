import { API_URL } from '$env/static/private';

export const API_ENDPOINTS = {
  PROJECT_WORK: `${API_URL}/admin/project/works`,
  PROJECT_FILE: `${API_URL}/project/files`,
  PLACE_PLACE: `${API_URL}/admin/place/places`,
  PLACE_RESERVATION: `${API_URL}/admin/place/reservations`,
  AUTH_LOGIN: `${API_URL}/auth/login`,
  AUTH_EXTENDS: `${API_URL}/auth/extend`,
} as const;
