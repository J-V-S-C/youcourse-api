import { Injectable } from '@nestjs/common';
import { RatingsRepository } from 'src/domain/youcourse/application/repositories/ratings-repository';
import { Rating } from 'src/domain/youcourse/enterprise/entities/rating';
import { PrismaRatingMapper } from '../mappers/prisma-rating-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaRatingsRepository implements RatingsRepository {
  constructor(private prisma: PrismaService) {}
  async create(rating: Rating): Promise<void> {
    const data = PrismaRatingMapper.toPrisma(rating);
    await this.prisma.rating.create({
      data,
    });
  }

  async findById(id: string): Promise<Rating | null> {
    const rating = await this.prisma.rating.findUnique({
      where: {
        id,
      },
    });
    if (!rating) return null;

    return PrismaRatingMapper.toDomain(rating);
  }

  async save(rating: Rating): Promise<void> {
    const data = PrismaRatingMapper.toPrisma(rating);
    await this.prisma.rating.update({
      where: {
        id: data.id,
      },
      data,
    });
  }
}
