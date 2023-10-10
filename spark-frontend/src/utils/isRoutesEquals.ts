const isRoutesEquals = (a: string, b: string) =>
  a.replaceAll("/", "") === b.replaceAll("/", "");
export default isRoutesEquals;
