export function loadVar(name: string): string;
export function loadVar<T extends boolean>(
  name: string,
  optional: T
): T extends false ? string : string | undefined;
export function loadVar(name: string, optional?: unknown): string | undefined {
  const result = process.env[name];
  if (result == null && !optional) {
    throw new Error(`${name} is required`);
  }
  return result;
}
