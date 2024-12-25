import { NextFunction, Request, Response } from "express";
import {
  ActionNotAllowedError,
  EntityAlreadyExistsError,
  IncompleteRequestError,
  NotFoundError,
} from "./exceptions";
import status from "statuses";
import { AccessNotAllowed } from "./exceptions/AccessNotAllowed";

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
    case AccessNotAllowed:
      return [403, error.message];
    case ActionNotAllowedError:
      return [409, error.message];
    case IncompleteRequestError:
      return [400, error.message];
    case NotFoundError:
      return [status("NotFound"), error.message];
  }
  return [500, "Server error"];
}
