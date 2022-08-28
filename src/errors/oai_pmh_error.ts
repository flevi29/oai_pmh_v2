export class OaiPmhError extends Error {
  readonly httpStatus?: number;

  constructor(message?: string, httpStatus?: number) {
    super(message);
    this.httpStatus = httpStatus;
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
