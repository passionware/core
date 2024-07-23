import { describe, expect, it } from "vitest";
import { v4s } from "./v4s";

describe("v4", () => {
  it("should work", () => {
    const v4 = v4s("x");
    expect(v4).toBe("e8bebe66-2df2-4e85-801b-fd29a94e364e");
    const v4_2 = v4s("e8bebe66-2df2-4e85-801b-fd29a94e364e");
    expect(v4_2).toBe("c0f07670-c818-4b1a-9f56-7e72ce03fbc8");
  });
});
