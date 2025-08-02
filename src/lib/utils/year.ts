export function generateYears(start: number = 2024, end: number = 50) {
  return Array.from({ length: end }).map((_, i) => start + i);
}
