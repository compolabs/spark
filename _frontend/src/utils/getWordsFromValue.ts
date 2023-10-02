export function getWordsFromValue(value?: string | string[]) {
  if (!Array.isArray(value)) {
    return value?.split(" ");
  }
  return value;
}
