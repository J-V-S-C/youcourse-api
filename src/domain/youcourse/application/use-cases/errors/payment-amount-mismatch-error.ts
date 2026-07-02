export class PaymentAmountMismatchError extends Error {
  constructor() {
    super('The paid amount does not match the intended payment amount.');
  }
}
