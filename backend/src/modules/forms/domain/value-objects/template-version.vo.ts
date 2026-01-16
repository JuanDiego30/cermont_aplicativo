/**
 * Value Object: TemplateVersion
 *
 * Versionado semántico para templates (major.minor.patch)
 */

import { ValidationError } from "../../../../shared/domain/exceptions";

export class TemplateVersion {
  private constructor(
    private readonly _major: number,
    private readonly _minor: number,
    private readonly _patch: number,
  ) {
    if (_major < 0 || _minor < 0 || _patch < 0) {
      throw new ValidationError("Version numbers must be non-negative");
    }
    Object.freeze(this);
  }

  public static initial(): TemplateVersion {
    return new TemplateVersion(1, 0, 0);
  }

  public static create(version: string): TemplateVersion {
    const parts = version.split(".").map(Number);
    if (parts.length !== 3 || parts.some(isNaN) || parts.some((p) => p < 0)) {
      throw new ValidationError(
        "Invalid version format. Use semver (e.g., 1.0.0)",
      );
    }
    return new TemplateVersion(parts[0], parts[1], parts[2]);
  }

  public incrementMinor(): TemplateVersion {
    return new TemplateVersion(this._major, this._minor + 1, 0);
  }

  public incrementPatch(): TemplateVersion {
    return new TemplateVersion(this._major, this._minor, this._patch + 1);
  }

  public incrementMajor(): TemplateVersion {
    return new TemplateVersion(this._major + 1, 0, 0);
  }

  public toString(): string {
    return `${this._major}.${this._minor}.${this._patch}`;
  }

  public getMajor(): number {
    return this._major;
  }

  public getMinor(): number {
    return this._minor;
  }

  public getPatch(): number {
    return this._patch;
  }

  public isGreaterThan(other: TemplateVersion): boolean {
    if (this._major > other._major) return true;
    if (this._major < other._major) return false;
    if (this._minor > other._minor) return true;
    if (this._minor < other._minor) return false;
    return this._patch > other._patch;
  }

  public equals(other: TemplateVersion): boolean {
    return (
      this._major === other._major &&
      this._minor === other._minor &&
      this._patch === other._patch
    );
  }
}

