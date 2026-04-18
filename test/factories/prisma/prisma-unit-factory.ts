import { Injectable } from '@nestjs/common';
import {
  Unit,
  UnitProps,
} from 'src/domain/youcourse/enterprise/entities/unit';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { makeUnit } from '../make-unit';
import { PrismaUnitMapper } from 'src/infra/database/prisma/mappers/prisma-unit-mapper';

@Injectable()
export class UnitFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaUnit(data: Partial<UnitProps> = {}): Promise<Unit> {
    const unit = makeUnit(data);

    await this.prisma.unit.create({
      data: PrismaUnitMapper.toPrisma(unit),
    });

    return unit;
  }
}