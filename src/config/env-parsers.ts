export const parsePositiveFiniteNumber = (value: string | undefined, fallback: number, key: string): number => {
  if (value === undefined) return fallback;
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${key} must be a positive number`);
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${key} must be a positive number`);
  return parsed;
};
