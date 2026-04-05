import { Injectable } from '@nestjs/common';
import {
  Rating,
  RatingProps,
} from 'src/domain/youcourse/enterprise/entities/rating';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { makeRating } from '../make-rating';
import { PrismaRatingMapper } from 'src/infra/database/prisma/mappers/prisma-rating-mapper';

@Injectable()
export class RatingFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaRating(data: Partial<RatingProps> = {}): Promise<Rating> {
    const rating = makeRating(data);

    await this.prisma.rating.create({
      data: PrismaRatingMapper.toPrisma(rating),
    });

    return rating;
  }
}
