export class AccountAlreadyExistsError extends Error {
  constructor(identifier: string) {
    super(`Account ${identifier} already exists`);
  }
}
