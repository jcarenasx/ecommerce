export class ServiceError extends Error {
  constructor(public code: string, public statusCode: number, message?: string) {
    super(message ?? code);
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}
