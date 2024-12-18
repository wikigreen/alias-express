export function stringifyObjectValues<T extends object>(
  obj: T,
): Record<keyof T, string> {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([, value]) => value != null)
      .map(([key, value]) => [key as keyof T, JSON.stringify(value)]),
  ) as Record<keyof T, string>;
}

export function parseObjectValues(obj: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, JSON.parse(value)]),
  );
}
