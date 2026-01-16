import { JwtSignerPort, JwtToken } from "../domain/value-objects/jwt-token.vo";

describe("JwtToken VO", () => {
  it("create: firma token y expone payload", () => {
    const jwtSigner: JwtSignerPort = { sign: jest.fn(() => "tkn"), verify: jest.fn() };

    const token = JwtToken.create(jwtSigner, {
      userId: "u1",
      email: "u1@example.com",
      role: "admin",
    });

    expect(token.value).toBe("tkn");
    expect(token.userId).toBe("u1");
    expect(token.payload.sub).toBe("u1");
  });

  it("fromString: retorna null si verify falla", () => {
    const jwtSigner: JwtSignerPort = {
      sign: jest.fn(),
      verify: jest.fn(() => {
        throw new Error("bad");
      }),
    };
    expect(JwtToken.fromString(jwtSigner, "x")).toBeNull();
  });

  it("fromString: calcula expiración correctamente", () => {
    const exp = Math.floor(Date.now() / 1000) + 60;
    const jwtSigner: JwtSignerPort = {
      sign: jest.fn(),
      verify: jest.fn(() => ({
        userId: "u1",
        email: "u1@example.com",
        role: "tecnico",
        exp,
      })),
    };

    const token = JwtToken.fromString(jwtSigner, "tok")!;

    expect(token.isExpired).toBe(false);
    expect(token.expiresAt).toBeInstanceOf(Date);
  });

  it("fromString: sin exp -> expiresAt null e isExpired false", () => {
    const jwtSigner: JwtSignerPort = {
      sign: jest.fn(),
      verify: jest.fn(() => ({
        userId: "u1",
        email: "u1@example.com",
        role: "tecnico",
      })),
    };

    const token = JwtToken.fromString(jwtSigner, "tok")!;
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
    const jwtSigner: JwtSignerPort = { sign: jest.fn(() => "tkn"), verify: jest.fn() };
    const a = JwtToken.create(jwtSigner, {
      userId: "u1",
      email: "u1@example.com",
      role: "admin",
    });
    const b = JwtToken.create(jwtSigner, {
      userId: "u1",
      email: "u1@example.com",
      role: "admin",
    });

    expect(a.equals(a)).toBe(true);
    expect(a.equals(b)).toBe(true);
    expect(a.toString()).toBe("tkn");
  });
});
