import { ValueObject } from 'src/core/entities/value-objects';

export interface MoneyProps {
  amount: number; // centavos
  currency: string; // BRL
}

export class Money extends ValueObject<MoneyProps> {
  get amount() {
    return this.props.amount;
  }

  get currency() {
    return this.props.currency;
  }

  static create(props: MoneyProps) {
    return new Money(props);
  }
}
