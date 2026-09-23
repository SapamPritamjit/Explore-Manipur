export class DataAccessError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly detail?: unknown
  ) {
    super(message);
    this.name = "DataAccessError";
  }
}

export interface QueryErrorLike {
  message?: string;
  code?: string;
}

export function throwIfQueryError(
  error: QueryErrorLike | null | undefined,
  context: string
): void {
  if (!error) {
    return;
  }
  throw new DataAccessError(
    `${context}: ${error.message ?? "unknown database error"}`,
    error.code ?? "database_error",
    error
  );
}