export class EntityAlreadyExistsError extends Error {
  nickname: string;

  constructor(message: string, nickname: string) {
    super(message);
    this.name = "EntityAlreadyExistsError";
    this.nickname = nickname;
  }
}
