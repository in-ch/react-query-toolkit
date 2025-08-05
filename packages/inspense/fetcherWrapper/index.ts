/**
 * Wraps a Promise to integrate with React Suspense.
 * Throws the Promise while it's pending, allowing Suspense to catch it.
 * Once the Promise resolves or rejects, returns the result or throws the error.
 *
 * @template T - The type of the resolved value from the promise.
 * @param {Promise<T>} promise - The API call or async operation to wrap.
 * @returns { fetch: () => T | void } A function that will return the result or throw while waiting.
 */
export function fetcherWrapper<T>(promise: Promise<T>): { fetch: () => T } {
  let status = 'pending';
  let result: T;
  let error: unknown;

  const suspender = promise.then(
    r => {
      status = 'success';
      result = r;
    },
    e => {
      status = 'error';
      error = e;
    }
  );

  return {
    fetch(): T {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw error;
      } else if (status === 'success') {
        return result;
      }
      throw new Error('Unreachable state');
    },
  };
}
