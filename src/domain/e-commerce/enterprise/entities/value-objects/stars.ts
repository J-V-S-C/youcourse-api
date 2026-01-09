import { ValueObject } from 'src/core/entities/value-objects';

export class Stars extends ValueObject<{ stars: number }> {
  get value() {
    return this.props.stars;
  }

  static create(stars: number) {
    if (stars < 0.5 || stars > 5 || stars % 0.5 !== 0) {
      throw new Error('Invalid stars format');
    }
    return new Stars({ stars });
  }
}
