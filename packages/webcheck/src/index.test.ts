import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "./index.js";

describe("@shipcheck/webcheck", () => {
  it("builds and is importable", () => {
    expect(PACKAGE_NAME).toBe("@shipcheck/webcheck");
  });
});
