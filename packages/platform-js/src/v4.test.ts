import { describe, expect, it } from "vitest";
import { createSeededV4, v4s } from "./v4s";

describe("v4", () => {
  it("v4s", () => {
    const v4 = v4s("x");
    expect(v4).toBe("e8bebe66-2df2-4e85-801b-fd29a94e364e");
    const v4_2 = v4s("e8bebe66-2df2-4e85-801b-fd29a94e364e");
    expect(v4_2).toBe("c0f07670-c818-4b1a-9f56-7e72ce03fbc8");
  });

  it("createSeededV4", () => {
    const seededV4 = createSeededV4("x");
    expect(seededV4()).toBe("e8bebe66-2df2-4e85-801b-fd29a94e364e");
    expect(seededV4()).toBe("c0f07670-c818-4b1a-9f56-7e72ce03fbc8");
    expect(seededV4()).toBe("b8dcf5cb-649b-4185-ad61-48b6f014749c");
  });
});
