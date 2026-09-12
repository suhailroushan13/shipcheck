import { Command } from "commander";
import { registerWebcheckCommand } from "./commands/webcheck.js";

const VERSION = "0.1.0";

/**
 * Builds a fresh Commander program. Always uses exitOverride() (throws a
 * CommanderError instead of calling process.exit) so both the real bin
 * entrypoint and tests can control how the process actually exits.
 */
export function createProgram(): Command {
  const program = new Command();

  program
    .name("shipcheck")
    .description("Know if your website is ready to ship.\n\nOpen-source website quality checks for developers and CI.")
    .version(VERSION, "-V, --version", "output the current version")
    .exitOverride();

  registerWebcheckCommand(program);

  return program;
}
