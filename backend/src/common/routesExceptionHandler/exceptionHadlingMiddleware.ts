import { NextFunction, Request, Response } from "express";
import { EntityAlreadyExistsError, NotFoundError } from "./exceptions";
import status from "statuses";

export const exceptionHandlingMiddleware = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const [code, message, args] = getErrorMetadata(err);

  res
    .status(code)
    .json({ ...(args || {}), message })
    .send();
};

function getErrorMetadata(
  error: Error,
): [number, string, Record<string, string>?] {
  switch (error.constructor) {
    case EntityAlreadyExistsError:
      return [
        status("Conflict"),
        error.message,
        { nickname: (error as EntityAlreadyExistsError).nickname },
      ];
    case NotFoundError:
      return [status("NotFound"), error.message];
  }
  return [status("InternalServerError"), "Server error"];
}
