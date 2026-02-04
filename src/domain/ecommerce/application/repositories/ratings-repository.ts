import { Rating } from '../../enterprise/entities/rating';

export abstract class RatingsRepository {
  abstract create(rating: Rating): Promise<void>;
  abstract save(rating: Rating): Promise<void>;
  abstract findById(id: string): Promise<Rating | null>;
}
