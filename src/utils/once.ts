/**
 * Creates a function that executes an async operation only once and caches the result.
 * Subsequent calls return the same promise, ensuring the operation runs exactly once.
 * 
 * @param fn - The async function to execute once
 * @returns A wrapped function that ensures single execution
 * 
 * @example
 * ```ts
 * const fetchData = onceAsync(async () => {
 *   return await expensiveApiCall();
 * });
 * 
 * await fetchData(); // Executes the API call
 * await fetchData(); // Returns cached promise
 * ```
 */
export const onceAsync = <T>(fn: () => Promise<T>) => {
    let done = false;
    let result: Promise<T>;
    return () => {
      if (!done) {
        done = true;
        result = fn();
      }
      return result;
    };
  };
  