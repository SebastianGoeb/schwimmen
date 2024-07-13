export type Error = {
  errors: string[];
};

export function isError(value: Error | any): value is Error {
  return value.errors != undefined;
}

export function extractErrors(value: Error | any): string[] {
  return isError(value) ? value.errors : [];
}

export function extractManyErrors(values: (Error | any)[]): Error {
  return { errors: values.map(extractErrors).flatMap((x) => x) };
}
