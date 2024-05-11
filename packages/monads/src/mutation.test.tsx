import { describe, expect, it } from "vitest";
import { mt, MutationData } from "./mutation";

describe("Mutation Utilities", () => {
  describe("Mutation Constructors", () => {
    it("ofSuccess creates a success state", () => {
      const request = { payload: "test" };
      const response = { data: "result" };
      const mutation = mt.ofSuccess(request, response);
      expect(mutation).toEqual({
        status: "success",
        request,
        response,
      });
    });

    it("ofError creates an error state", () => {
      const request = { payload: "test" };
      const error = new Error("Oops");
      const mutation = mt.ofError(request, error);
      expect(mutation).toEqual({
        status: "error",
        request,
        error,
      });
    });

    it("ofIdle creates an idle state", () => {
      const mutation = mt.ofIdle();
      expect(mutation).toEqual({ status: "idle" });
    });

    it("ofPending creates a pending state", () => {
      const request = { payload: "test" };
      const mutation = mt.ofPending(request);
      expect(mutation).toEqual({
        status: "pending",
        request,
      });
    });
  });

  describe("State Check Functions", () => {
    it("isInProgress correctly identifies pending mutations", () => {
      const pendingMutation = mt.ofPending({});
      expect(mt.isInProgress(pendingMutation)).toBeTruthy();
    });

    it("isIdle correctly identifies idle mutations", () => {
      const idleMutation = mt.ofIdle();
      expect(mt.isIdle(idleMutation)).toBeTruthy();
    });

    it("isSuccess correctly identifies success mutations", () => {
      const successMutation = mt.ofSuccess({}, {});
      expect(mt.isSuccess(successMutation)).toBeTruthy();
    });

    it("isInError correctly identifies error mutations", () => {
      const errorMutation = mt.ofError({}, new Error("error"));
      expect(mt.isInError(errorMutation)).toBeTruthy();
    });

    it("isExecutable identifies non-pending mutations as executable", () => {
      const idleMutation = mt.ofIdle();
      const errorMutation = mt.ofError({}, new Error("error"));
      const successMutation = mt.ofSuccess({}, {});
      expect(mt.isExecutable(idleMutation)).toBeTruthy();
      expect(mt.isExecutable(errorMutation)).toBeTruthy();
      expect(mt.isExecutable(successMutation)).toBeTruthy();
    });
  });

  describe("Utility Functions", () => {
    it("when returns the mutation when the filter condition is true", () => {
      const request = { user: "admin" };
      const successMutation = mt.ofSuccess(request, {});
      const result = mt.when(successMutation, (req) => req.user === "admin");
      expect(result).toBe(successMutation);
    });

    it("when returns idle mutation when the filter condition is false", () => {
      const request = { user: "admin" };
      const successMutation = mt.ofSuccess(request, {});
      const result = mt.when(successMutation, (req) => req.user !== "admin");
      expect(result).toEqual(mt.ofIdle());
    });
  });

  it("mapError returns a new error mutation with the mapped error", () => {
    const request = { user: "admin" };
    const errorMutation = mt.ofError(request, new Error("error"));
    const result = mt.mapError(
      errorMutation,
      (error) => new Error("mapped error"),
    );
    expect(result).toEqual({
      status: "error",
      request,
      error: new Error("mapped error"),
    });
  });

  it("mapError does not map the error if the mutation is not in error state", () => {
    const request = { user: "admin" };
    const successMutation = mt.ofSuccess(request, {});
    const result = mt.mapError(
      successMutation,
      (error) => new Error("mapped error"),
    );
    expect(result).toBe(successMutation);
  });

  it("mapErrorMonadic returns the mapped error mutation if the mutation is in error state", () => {
    const request = { user: "admin" };
    const errorMutation = mt.ofError(request, new Error("error"));
    const result = mt.mapErrorMonadic(errorMutation, (error) =>
      mt.ofError(request, new Error("mapped error")),
    );
    expect(result).toEqual({
      status: "error",
      request,
      error: new Error("mapped error"),
    });
  });

  it("mapErrorMonadic returns the original mutation if the mutation is not in error state", () => {
    const request = { user: "admin" };
    const successMutation = mt.ofSuccess(request, {});
    const result = mt.mapErrorMonadic(successMutation, (error) =>
      mt.ofError(request, new Error("mapped error")),
    );
    expect(result).toBe(successMutation);
  });

  describe("journey", () => {
    it("correctly composes rendering logic through journey", () => {
      const req = "req";
      const res = 123;
      const jo = (m: MutationData<typeof req, typeof res>) =>
        mt
          .journey(m)
          .initially(() => 999)
          .during(({ request }) => `Pending ${request}`)
          .catch((m) => `Error/${m.error.message}/${m.request}`)
          .done((m) => `Success/${m.response}`);

      expect(jo(mt.ofIdle())).toEqual(999);
      expect(jo(mt.ofPending(req))).toEqual("Pending req");
      expect(jo(mt.ofError(req, new Error("err")))).toEqual("Error/err/req");
      expect(jo(mt.ofSuccess(req, res))).toEqual("Success/123");
    });
  });
});
