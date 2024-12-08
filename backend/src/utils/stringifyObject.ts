export function stringifyObjectValues<T>(obj: T): Record<keyof T, string> {
  const result: Record<keyof T, string> = {} as Record<keyof T, string>;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (value === null) {
        result[key] = ""; // Empty string for null values
      } else if (value !== undefined) {
        result[key] = String(value); // Convert to string
      }
    }
  }

  return result as Record<keyof T, string>;
}
