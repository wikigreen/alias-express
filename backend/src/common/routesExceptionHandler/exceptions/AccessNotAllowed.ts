export class AccessNotAllowed extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccessNotAllowed";
  }
}
