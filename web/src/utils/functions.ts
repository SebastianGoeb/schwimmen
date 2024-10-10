export function ifDefined<T, R>(x: T | undefined, fun: (x: T) => R): R | undefined {
  if (x === undefined) {
    return undefined;
  }
  return fun(x);
}
