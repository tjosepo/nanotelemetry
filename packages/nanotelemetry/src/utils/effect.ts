interface EffectArgs<T> {
  fn: () => T;
  onError?: (error: unknown) => void;
  onSettled?: (error?: unknown) => void;
  onSuccess?: () => void;
}

/** Run a function `fn`, then run side-effects depending on the result. */
export function effect<T>({ fn, onError, onSettled, onSuccess }: EffectArgs<T>): T {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then((value) => {
          onSuccess?.();
          onSettled?.();
          return value;
        })
        .catch((error) => {
          onError?.(error);
          onSettled?.(error);
          throw error;
        }) as T;
    }
    onSuccess?.();
    onSettled?.();
    return result;
  } catch (error) {
      onError?.(error);
      onSettled?.(error);
      throw error;
  } 
}