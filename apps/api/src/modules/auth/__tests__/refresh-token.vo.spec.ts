import { RefreshToken } from "../domain/value-objects/refresh-token.vo";

describe("RefreshToken VO", () => {
  it("create() genera token y family UUID y expira en ~7 días", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

    const rt = RefreshToken.create();
    expect(typeof rt.value).toBe("string");
    expect(typeof rt.family).toBe("string");
    expect(rt.value).not.toBe(rt.family);
    expect(rt.daysUntilExpiry).toBe(7);
    expect(rt.isExpired).toBe(false);

    jest.useRealTimers();
  });

  it("fromExisting() retorna null si value/family no es UUID", () => {
    const rt = RefreshToken.fromExisting("no", new Date(), "tampoco");
    expect(rt).toBeNull();
  });

  it("rotate() preserva family y cambia value", () => {
    const original = RefreshToken.create();
    const rotated = original.rotate();

    expect(rotated.family).toBe(original.family);
    expect(rotated.value).not.toBe(original.value);
  });

  it("equals() compara por value", () => {
    const a = RefreshToken.create();
    const b = RefreshToken.create(a.family);
    expect(a.equals(b)).toBe(false);
    expect(a.equals(a)).toBe(true);
  });
});
