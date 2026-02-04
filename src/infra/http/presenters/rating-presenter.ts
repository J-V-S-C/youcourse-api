import { Rating } from 'src/domain/ecommerce/enterprise/entities/rating';

export class RatingPresenter {
  static toHTTP(rating: Rating) {
    return {
      stars: rating.stars,
      commentary: rating.commentary,
      createdAt: rating.createdAt,
      updatedAt: rating.updatedAt,
    };
  }
}
