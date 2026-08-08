export class RequestError extends Error {}

export class ConflictError<T = unknown> extends Error {
  readonly serverDocument: T

  constructor(serverDocument: T, message = "Version conflict") {
    super(message)
    this.serverDocument = serverDocument
  }
}
