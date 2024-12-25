export class ActionNotAllowedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionNotAllowed";
  }
}
