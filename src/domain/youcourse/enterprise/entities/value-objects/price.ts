import { ValueObject } from 'src/core/entities/value-objects';

export interface PriceProps {
  amount: number; // centavos
  currency: string; // BRL
}

export class Price extends ValueObject<PriceProps> {
  get amount() {
    return this.props.amount;
  }

  get currency() {
    return this.props.currency;
  }

  static create(props: PriceProps) {
    return new Price(props);
  }

  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }
}
