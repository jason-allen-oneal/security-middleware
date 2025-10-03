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
  