import { RatingsRepository } from 'src/domain/e-commerce/application/repositories/ratings-repository';
import { Rating } from 'src/domain/e-commerce/enterprise/entities/rating';

export class InMemoryRatingsRepository implements RatingsRepository {
  public items: Rating[] = [];

  async create(rating: Rating): Promise<void> {
    this.items.push(rating);
  }

  async findById(id: string): Promise<Rating | null> {
    return this.items.find((rating) => rating.id.toString() === id) ?? null;
  }

  async save(rating: Rating): Promise<void> {
    this.items.find((itemsRating) => {
      if (itemsRating.id === rating.id) {
        itemsRating = rating;
      }
    });
  }
}
