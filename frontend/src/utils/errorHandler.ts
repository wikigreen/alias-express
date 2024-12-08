import { FetchBaseQueryMeta } from "@reduxjs/toolkit/query/react";
import status from "statuses";

export type ErrorType = { errorType?: "ALREADY_EXISTS"; nickname?: string };

export const transformErrorResponse = (
  responseBody: unknown,
  { response }: FetchBaseQueryMeta,
): ErrorType => {
  if (status("Conflict") === response?.status) {
    return {
      errorType: "ALREADY_EXISTS",
      nickname: (responseBody as { data: { nickname?: string } }).data.nickname,
    };
  }

  return {};
};
