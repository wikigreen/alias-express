export class IncompleteRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IncompleteRequestError";
  }
}
