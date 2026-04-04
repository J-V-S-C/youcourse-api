export class NotAllowedError extends Error {
  constructor() {
    super(`Operation not allowed.`);
  }
}
