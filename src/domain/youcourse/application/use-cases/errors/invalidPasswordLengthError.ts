export class InvalidPasswordLengthError extends Error {
  constructor() {
    super('Password must be at least 8 characters long.');
  }
}
