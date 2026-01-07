import { JwtToken } from "../domain/value-objects/jwt-token.vo";
import { IJwtService } from "../domain/ports/jwt-service.port";

describe("JwtToken VO", () => {
  it("create: firma token y expone payload", () => {
    const jwtService = { sign: jest.fn(() => "tkn") } as unknown as IJwtService;

    const token = JwtToken.create(jwtService, {
      userId: "u1",
      email: "u1@example.com",
      role: "admin",
    });

    expect(token.value).toBe("tkn");
    expect(token.userId).toBe("u1");
    expect(token.payload.sub).toBe("u1");
  });

  it("fromString: retorna null si verify falla", () => {
    const jwtService = {
      verify: jest.fn(() => {
        throw new Error("bad");
      }),
    } as unknown as IJwtService;
    expect(JwtToken.fromString(jwtService, "x")).toBeNull();
  });

  it("fromString: calcula expiración correctamente", () => {
    const exp = Math.floor(Date.now() / 1000) + 60;
    const jwtService = {
      verify: jest.fn(() => ({
        userId: "u1",
        email: "u1@example.com",
        role: "tecnico",
        exp,
      })),
    } as unknown as IJwtService;

    const token = JwtToken.fromString(jwtService, "tok")!;

    expect(token.isExpired).toBe(false);
    expect(token.expiresAt).toBeInstanceOf(Date);
  });

  it("fromString: sin exp -> expiresAt null e isExpired false", () => {
    const jwtService = {
      verify: jest.fn(() => ({
        userId: "u1",
        email: "u1@example.com",
        role: "tecnico",
      })),
    } as unknown as IJwtService;

    const token = JwtToken.fromString(jwtService, "tok")!;
    expect(token.expiresAt).toBeNull();
    expect(token.isExpired).toBe(false);
  });

  it("decode: retorna payload si token está bien formado", () => {
    const payload = { userId: "u1", email: "u1@example.com", role: "tecnico" };
    const payloadBase64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
      "base64",
    );
    const fakeJwt = `a.${payloadBase64}.c`;

    expect(JwtToken.decode(fakeJwt)).toMatchObject(payload);
  });

  it("decode: retorna null si el token no es decodificable", () => {
    expect(JwtToken.decode("not-a-jwt")).toBeNull();
  });

  it("equals + toString: comparan por value", () => {
    const jwtService = { sign: jest.fn(() => "tkn") } as unknown as IJwtService;
    const a = JwtToken.create(jwtService, {
      userId: "u1",
      email: "u1@example.com",
      role: "admin",
    });
    const b = JwtToken.create(jwtService, {
      userId: "u1",
      email: "u1@example.com",
      role: "admin",
    });

    expect(a.equals(a)).toBe(true);
    expect(a.equals(b)).toBe(true);
    expect(a.toString()).toBe("tkn");
  });
});
