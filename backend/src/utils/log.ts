//TODO: replace with winston

function logMessageHelper(
  type: "LOG" | "ERROR" | "DEBUG",
  message: unknown[],
  logFn: (...args: unknown[]) => void,
) {
  const error = new Error();
  const [, , , callerFunctionCall] = error?.stack?.split("\n") || [];

  logFn(
    `[${type}] ${message
      .map((o) => {
        if (o === Object(o)) {
          return JSON.stringify(o);
        }
        return String(o);
      })
      .join(" ")} (Called from: ${callerFunctionCall || "Unknown location"})`,
  );
}

export function logMessage(...message: string[]) {
  logMessageHelper("LOG", message, console.log);
}

export function logErrorMessage(...message: string[]) {
  logMessageHelper("ERROR", message, console.error);
}

export function debugMessage(...message: unknown[]) {
  logMessageHelper("DEBUG", message, console.log);
}
