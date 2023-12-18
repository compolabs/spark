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

/**
 * Call an async function with a maximum time limit (in milliseconds) for the timeout
 * @param {Promise<any>} asyncPromise An asynchronous promise to resolve
 * @param {number} timeLimit Time limit to attempt function in milliseconds
 * @returns {Promise<any> | undefined} Resolved promise for async function call, or an error if time limit reached
 */
export const asyncCallWithTimeout = async (asyncPromise: Promise<any>, timeLimit: number) => {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise((_resolve, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new Error("Async call timeout limit reached")),
      timeLimit
    );
  });

  return Promise.race([asyncPromise, timeoutPromise]).then((result) => {
    clearTimeout(timeoutHandle);
    return result;
  });
};
