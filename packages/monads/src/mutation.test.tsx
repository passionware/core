import { describe, expect, it } from "vitest";
import { mt } from "./mutation";
import { MutationData } from "./mutation.types";
import { rd } from "./remoteData";

describe("Mutation Utilities", () => {
  describe("Mutation Constructors", () => {
    it("ofSuccess creates a success state", () => {
      const request = { payload: "test" };
      const response = { data: "result" };
      const mutation = mt.of(request, response);
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
      expect(mutation).toEqual({ status: "idle", isBlocked: false });
    });

    it("ofIdle creates a blocked idle state when passed true", () => {
      const mutation = mt.ofIdle(true);
      expect(mutation).toEqual({ status: "idle", isBlocked: true });
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
      const successMutation = mt.of({}, {});
      expect(mt.isSuccess(successMutation)).toBeTruthy();
    });

    it("isInError correctly identifies error mutations", () => {
      const errorMutation = mt.ofError({}, new Error("error"));
      expect(mt.isInError(errorMutation)).toBeTruthy();
    });

    it("isExecutable identifies non-pending mutations as executable", () => {
      const idleMutation = mt.ofIdle();
      const blockedIdleMutation = mt.ofIdle(true);
      const errorMutation = mt.ofError({}, new Error("error"));
      const successMutation = mt.of({}, {});
      const pendingMutation = mt.ofPending({});
      expect(mt.isExecutable(idleMutation)).toBeTruthy();
      expect(mt.isExecutable(errorMutation)).toBeTruthy();
      expect(mt.isExecutable(successMutation)).toBeTruthy();
      expect(mt.isExecutable(pendingMutation)).toBeFalsy();
      expect(mt.isExecutable(blockedIdleMutation)).toBeFalsy();
    });

    it("isBlocked correctly identifies blocked idle mutations", () => {
      const blockedIdle = mt.ofIdle(true);
      const unblockedIdle = mt.ofIdle(false);
      const pendingMutation = mt.ofPending({});
      const errorMutation = mt.ofError({}, new Error("error"));
      const successMutation = mt.of({}, {});

      expect(mt.isBlocked(blockedIdle)).toBeTruthy();
      expect(mt.isBlocked(unblockedIdle)).toBeFalsy();
      expect(mt.isBlocked(pendingMutation)).toBeFalsy();
      expect(mt.isBlocked(errorMutation)).toBeFalsy();
      expect(mt.isBlocked(successMutation)).toBeFalsy();
    });

    it("isStarted correctly identifies non-idle mutations", () => {
      const idleMutation = mt.ofIdle();
      const pendingMutation = mt.ofPending({});
      const errorMutation = mt.ofError({}, new Error("error"));
      const successMutation = mt.of({}, {});

      expect(mt.isStarted(idleMutation)).toBeFalsy();
      expect(mt.isStarted(pendingMutation)).toBeTruthy();
      expect(mt.isStarted(errorMutation)).toBeTruthy();
      expect(mt.isStarted(successMutation)).toBeTruthy();
    });
  });

  describe("Utility Functions", () => {
    it("when returns the mutation when the filter condition is true", () => {
      const request = { user: "admin" };
      const successMutation = mt.of(request, {});
      const result = mt.when(successMutation, (req) => req.user === "admin");
      expect(result).toBe(successMutation);
    });

    it("when returns idle mutation when the filter condition is false", () => {
      const request = { user: "admin" };
      const successMutation = mt.of(request, {});
      const result = mt.when(successMutation, (req) => req.user !== "admin");
      expect(result).toEqual(mt.ofIdle());
    });

    it("blockUnless returns the mutation when the filter condition is true", () => {
      const request = { user: "admin" };
      const pendingMutation = mt.ofPending(request);
      const result = mt.blockUnless(
        pendingMutation,
        (req) => req.user === "admin"
      );
      expect(result).toBe(pendingMutation);
    });

    it("blockUnless returns blocked idle mutation when the filter condition is false for pending mutations", () => {
      const request = { user: "admin" };
      const pendingMutation = mt.ofPending(request);
      const result = mt.blockUnless(
        pendingMutation,
        (req) => req.user !== "admin"
      );
      expect(result).toEqual(mt.ofIdle(true));
    });

    it("blockUnless converts non-pending mutations to unblocked idle when filter fails", () => {
      const request = { user: "admin" };
      const successMutation = mt.of(request, {});
      const errorMutation = mt.ofError(request, new Error("error"));

      const successResult = mt.blockUnless(
        successMutation,
        (req) => req.user !== "admin"
      );
      const errorResult = mt.blockUnless(
        errorMutation,
        (req) => req.user !== "admin"
      );

      expect(successResult).toEqual(mt.ofIdle(false));
      expect(errorResult).toEqual(mt.ofIdle(false));
    });

    it("blockUnless returns the original idle mutation unchanged", () => {
      const idleMutation = mt.ofIdle();
      const result = mt.blockUnless(idleMutation, () => true);
      expect(result).toBe(idleMutation);
    });
  });

  it("mapError returns a new error mutation with the mapped error", () => {
    const request = { user: "admin" };
    const errorMutation = mt.ofError(request, new Error("error"));
    const result = mt.mapError(errorMutation, () => new Error("mapped error"));
    expect(result).toEqual({
      status: "error",
      request,
      error: new Error("mapped error"),
    });
  });

  it("mapError does not map the error if the mutation is not in error state", () => {
    const request = { user: "admin" };
    const successMutation = mt.of(request, {});
    const result = mt.mapError(
      successMutation,
      () => new Error("mapped error")
    );
    expect(result).toBe(successMutation);
  });

  it("mapErrorMonadic returns the mapped error mutation if the mutation is in error state", () => {
    const request = { user: "admin" };
    const errorMutation = mt.ofError(request, new Error("error"));
    const result = mt.mapErrorMonadic(errorMutation, () =>
      mt.ofError(request, new Error("mapped error"))
    );
    expect(result).toEqual({
      status: "error",
      request,
      error: new Error("mapped error"),
    });
  });

  it("mapErrorMonadic returns the original mutation if the mutation is not in error state", () => {
    const request = { user: "admin" };
    const successMutation = mt.of(request, {});
    const result = mt.mapErrorMonadic(successMutation, () =>
      mt.ofError(request, new Error("mapped error"))
    );
    expect(result).toBe(successMutation);
  });

  describe("mapRequest", () => {
    it("maps the request for non-idle mutations", () => {
      const request = { user: "admin" };
      const successMutation = mt.of(request, {});
      const result = mt.mapRequest(successMutation, (req) => ({
        ...req,
        user: "admin",
      }));
      expect(result).toEqual(mt.of({ ...request, user: "admin" }, {}));
    });

    it("maps the request for pending mutations", () => {
      const request = { user: "admin" };
      const pendingMutation = mt.ofPending(request);
      const result = mt.mapRequest(pendingMutation, (req) => ({
        ...req,
        user: "admin",
      }));
      expect(result).toEqual(mt.ofPending({ ...request, user: "admin" }));
    });

    it("maps the request for error mutations", () => {
      const request = { user: "admin" };
      const error = new Error("error");
      const errorMutation = mt.ofError(request, error);
      const result = mt.mapRequest(errorMutation, (req) => ({
        ...req,
        user: "admin",
      }));
      expect(result).toEqual(mt.ofError({ ...request, user: "admin" }, error));
    });
    it("maps the request for success mutations", () => {
      const request = { user: "admin" };
      const successMutation = mt.of(request, {});
      const result = mt.mapRequest(successMutation, (req) => ({
        ...req,
        user: "admin",
      }));
      expect(result).toEqual(mt.of({ ...request, user: "admin" }, {}));
    });
  });

  describe("mapRequestMonadic", () => {
    it("maps the request for non-idle mutations", () => {
      const request = { user: "admin" };
      const successMutation = mt.of(request, {});
      const result = mt.mapRequestMonadic(successMutation, (m) =>
        mt.of(
          {
            ...m.request,
            user: "admin",
          },
          { result: 123 }
        )
      );
      expect(result).toEqual(
        mt.of({ ...request, user: "admin" }, { result: 123 })
      );
    });

    it("maps the request for pending mutations", () => {
      const request = { user: "admin" };
      const pendingMutation = mt.ofPending(request);
      const result = mt.mapRequestMonadic(pendingMutation, (m) =>
        mt.ofPending({
          ...m.request,
          user: "admin",
        })
      );
      expect(result).toEqual(mt.ofPending({ ...request, user: "admin" }));
    });

    it("maps the request for error mutations", () => {
      const request = { user: "admin" };
      const error = new Error("error");
      const errorMutation = mt.ofError(request, error);
      const result = mt.mapRequestMonadic(errorMutation, (m) =>
        mt.ofError(
          {
            ...m.request,
            user: "admin",
          },
          new Error("mapped error")
        )
      );
      expect(result).toEqual(
        mt.ofError({ ...request, user: "admin" }, new Error("mapped error"))
      );
    });
    it("maps the request for success mutations", () => {
      const request = { user: "admin" };
      const successMutation = mt.of(request, {});
      const result = mt.mapRequestMonadic(successMutation, (m) =>
        mt.of(
          {
            ...m.request,
            user: "admin",
          },
          { result: 123 }
        )
      );
      expect(result).toEqual(
        mt.of({ ...request, user: "admin" }, { result: 123 })
      );
    });
  });

  describe("Getter Functions", () => {
    it("getRequest returns the request for non-idle mutations", () => {
      const request = { user: "admin" };
      const pendingMutation = mt.ofPending(request);
      const errorMutation = mt.ofError(request, new Error("error"));
      const successMutation = mt.of(request, {});

      expect(mt.getRequest(pendingMutation)).toBe(request);
      expect(mt.getRequest(errorMutation)).toBe(request);
      expect(mt.getRequest(successMutation)).toBe(request);
    });

    it("getRequest returns null for idle mutations", () => {
      const idleMutation = mt.ofIdle();
      expect(mt.getRequest(idleMutation)).toBeNull();
    });

    it("getResponse returns the response for success mutations", () => {
      const response = { data: "result" };
      const successMutation = mt.of({}, response);
      expect(mt.getResponse(successMutation)).toBe(response);
    });

    it("getResponse returns null for non-success mutations", () => {
      const idleMutation = mt.ofIdle();
      const pendingMutation = mt.ofPending({});
      const errorMutation = mt.ofError({}, new Error("error"));

      expect(mt.getResponse(idleMutation)).toBeNull();
      expect(mt.getResponse(pendingMutation)).toBeNull();
      expect(mt.getResponse(errorMutation)).toBeNull();
    });
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
      expect(jo(mt.of(req, res))).toEqual("Success/123");
    });

    it("supports static values for each state", () => {
      const jo = (m: MutationData<string, number>) =>
        mt
          .journey(m)
          .initially("Initial")
          .during("Loading...")
          .catch(() => "Error occurred")
          .done("Success!");

      expect(jo(mt.ofIdle())).toEqual("Initial");
      expect(jo(mt.ofPending("test"))).toEqual("Loading...");
      expect(jo(mt.ofError("test", new Error("err")))).toEqual(
        "Error occurred"
      );
      expect(jo(mt.of("test", 42))).toEqual("Success!");
    });

    it("supports mixed static and dynamic values", () => {
      const jo = (m: MutationData<string, number>) =>
        mt
          .journey(m)
          .initially("Ready")
          .during(({ request }) => `Processing ${request}...`)
          .catch(() => "Failed")
          .done((success) => success.response * 2);

      expect(jo(mt.ofIdle())).toEqual("Ready");
      expect(jo(mt.ofPending("data"))).toEqual("Processing data...");
      expect(jo(mt.ofError("data", new Error("err")))).toEqual("Failed");
      expect(jo(mt.of("data", 21))).toEqual(42);
    });

    it("initially callback can access isBlocked property", () => {
      const jo = (m: MutationData<string, number>) =>
        mt
          .journey(m)
          .initially((idle) => (idle.isBlocked ? "Blocked" : "Ready"))
          .during("Loading...")
          .catch(() => "Error")
          .done("Success");

      expect(jo(mt.ofIdle(false))).toEqual("Ready");
      expect(jo(mt.ofIdle(true))).toEqual("Blocked");
      expect(jo(mt.ofPending("data"))).toEqual("Loading...");
      expect(jo(mt.ofError("data", new Error("err")))).toEqual("Error");
      expect(jo(mt.of("data", 42))).toEqual("Success");
    });
  });

  describe("convert", () => {
    describe("fromRemoteData", () => {
      it("converts idle remote data to idle mutation", () => {
        const remoteData = rd.ofIdle();
        const result = mt.fromRemoteData(remoteData);
        expect(result).toEqual(mt.ofIdle(false));
      });

      it("converts pending remote data to pending mutation", () => {
        const remoteData = rd.ofPending();
        const result = mt.fromRemoteData(remoteData);
        expect(result).toEqual(mt.ofPending(void 0));
      });

      it("converts success remote data to success mutation", () => {
        const remoteData = rd.of(42);
        const result = mt.fromRemoteData(remoteData);
        expect(result).toEqual(mt.of(void 0, 42));
      });

      it("converts error remote data to error mutation", () => {
        const error = new Error("test error");
        const remoteData = rd.ofError(error);
        const result = mt.fromRemoteData(remoteData);
        expect(result).toEqual(mt.ofError(void 0, error));
      });
    });

    describe("toRemoteData", () => {
      it("converts idle mutation to idle remote data", () => {
        const mutation = mt.ofIdle();
        const result = mt.toRemoteData(mutation);
        expect(result).toEqual(rd.ofIdle());
      });

      it("converts pending mutation to pending remote data", () => {
        const mutation = mt.ofPending("request");
        const result = mt.toRemoteData(mutation);
        expect(result).toEqual(rd.ofPending());
      });

      it("converts success mutation to success remote data", () => {
        const mutation = mt.of("request", 42);
        const result = mt.toRemoteData(mutation);
        expect(result).toEqual(rd.of(42));
      });

      it("converts error mutation to error remote data", () => {
        const error = new Error("test error");
        const mutation = mt.ofError("request", error);
        const result = mt.toRemoteData(mutation);
        expect(result).toEqual(rd.ofError(error));
      });
    });
  });
});
