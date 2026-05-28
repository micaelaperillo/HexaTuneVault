export class DomainException extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    // Ensures instanceof works correctly when transpiled below ES2015
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.code = code;
  }
}
