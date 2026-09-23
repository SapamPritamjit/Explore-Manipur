export class AssistantError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly detail?: unknown
  ) {
    super(message);
    this.name = "AssistantError";
  }
}