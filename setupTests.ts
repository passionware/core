import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Run cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});
