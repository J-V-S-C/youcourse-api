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
    if (props.amount < 0) {
      throw new Error('Price amount cannot be negative');
    }

    if (props.amount > 0 && props.amount < 150) {
      throw new Error('Price must be 0 (free) or at least 150 (R$ 1,50)');
    }

    if (!Number.isInteger(props.amount)) {
      throw new Error('Price amount must be ain integer (cents)');
    }

    return new Price({
      amount: props.amount,
      currency: props.currency.toUpperCase(),
    });
  }

  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }
}
