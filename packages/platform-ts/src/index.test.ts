import { describe, it, expect } from "vitest";
import { filterObjectFields } from "./index";

type TestType = {
  name: string;
  age?: number;
  city?: string;
  isActive?: boolean;
};

describe("filterObjectFields", () => {
  it("should remove fields with undefined values", () => {
    const data: TestType = {
      name: "Alice",
      age: undefined,
      city: "Wonderland",
      isActive: true,
    };

    const result = filterObjectFields(data, (value) => value !== undefined);

    expect(result).toEqual({
      name: "Alice",
      city: "Wonderland",
      isActive: true,
    });
  });

  it("should remove fields with false values", () => {
    const data: TestType = {
      name: "Bob",
      age: 30,
      city: "Neverland",
      isActive: false,
    };

    const result = filterObjectFields(data, (value) => value !== false);

    expect(result).toEqual({
      name: "Bob",
      age: 30,
      city: "Neverland",
    });
  });

  it("should remove fields with undefined and false values", () => {
    const data: TestType = {
      name: "Charlie",
      age: undefined,
      city: "Atlantis",
      isActive: false,
    };

    const result = filterObjectFields(
      data,
      (value) => value !== undefined && value !== false,
    );

    expect(result).toEqual({
      name: "Charlie",
      city: "Atlantis",
    });
  });

  it("should return an empty object if all values are filtered out", () => {
    const data: TestType = {
      name: "",
      age: undefined,
      city: undefined,
      isActive: false,
    };

    const result = filterObjectFields(data, (value) => !!value);

    expect(result).toEqual({});
  });

  it("should keep all fields if no values are filtered out", () => {
    const data: TestType = {
      name: "Diana",
      age: 25,
      city: "Gotham",
      isActive: true,
    };

    const result = filterObjectFields(data, () => true);

    expect(result).toEqual(data);
  });
});
