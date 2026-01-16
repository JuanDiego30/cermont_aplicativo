import { of, throwError } from "rxjs";

import { HttpLoggingInterceptor } from "./http-logging.interceptor";

describe(HttpLoggingInterceptor.name, () => {
  const makeContext = (overrides?: {
    method?: string;
    url?: string;
    requestId?: string;
    userId?: string;
    statusCode?: number;
  }) => {
    const request = {
      method: overrides?.method ?? "GET",
      url: overrides?.url ?? "/api/test",
      requestId: overrides?.requestId ?? "req-1",
      user: overrides?.userId ? { userId: overrides.userId } : undefined,
    };

    const response = {
      statusCode: overrides?.statusCode ?? 200,
    };

    const ctx: any = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
      getClass: () => ({ name: "TestController" }),
      getHandler: () => ({ name: "testHandler" }),
    };

    return { ctx, request, response };
  };

  it("loguea request exitosa con requestId y sin PII", (done) => {
    const logger = {
      logApiRequest: jest.fn(),
      logErrorWithStack: jest.fn(),
    } as any;

    const interceptor = new HttpLoggingInterceptor(logger);
    const { ctx } = makeContext({ userId: "u1" });

    interceptor
      .intercept(ctx, { handle: () => of({ ok: true }) } as any)
      .subscribe({
        next: () => {
          expect(logger.logApiRequest).toHaveBeenCalledTimes(1);
          const call = logger.logApiRequest.mock.calls[0];

          // signature: (method, url, statusCode, durationMs, userId, meta)
          expect(call[0]).toBe("GET");
          expect(call[1]).toBe("/api/test");
          expect(call[2]).toBe(200);
          expect(typeof call[3]).toBe("number");
          expect(call[4]).toBe("u1");

          const meta = call[5];
          expect(meta).toMatchObject({
            requestId: "req-1",
            controller: "TestController",
            handler: "testHandler",
          });

          // No PII
          expect(meta).not.toHaveProperty("ip");
          expect(meta).not.toHaveProperty("userEmail");
          expect(meta).not.toHaveProperty("userAgent");

          done();
        },
        error: done,
      });
  });

  it("loguea error con stack y re-lanza el error", (done) => {
    const logger = {
      logApiRequest: jest.fn(),
      logErrorWithStack: jest.fn(),
    } as any;

    const interceptor = new HttpLoggingInterceptor(logger);
    const { ctx } = makeContext({ statusCode: 500, requestId: "req-2" });

    interceptor
      .intercept(ctx, {
        handle: () => throwError(() => new Error("boom")),
      } as any)
      .subscribe({
        next: () => done(new Error("Expected error")),
        error: (err) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe("boom");
          expect(logger.logErrorWithStack).toHaveBeenCalledTimes(1);

          const call = logger.logErrorWithStack.mock.calls[0];
          expect(call[0]).toBeInstanceOf(Error);
          expect(call[1]).toBe("HttpLoggingInterceptor");
          expect(call[2]).toMatchObject({
            requestId: "req-2",
            method: "GET",
            url: "/api/test",
            statusCode: 500,
            controller: "TestController",
            handler: "testHandler",
          });

          done();
        },
      });
  });
});
