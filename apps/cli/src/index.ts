#!/usr/bin/env node
import { createProgram } from "./program.js";

const program = createProgram();

program.parseAsync(process.argv).catch((error: unknown) => {
  // exitOverride() makes Commander throw a CommanderError (for --help,
  // --version, and parsing errors) instead of calling process.exit itself.
  // Commander has already printed the relevant message — we just need to
  // propagate the exit code without a stack trace.
  const exitCode =
    typeof error === "object" && error !== null && "exitCode" in error
      ? (error as { exitCode: number }).exitCode
      : 1;
  process.exitCode = exitCode;
});
