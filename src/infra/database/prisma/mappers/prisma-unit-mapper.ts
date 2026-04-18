import { Prisma, Unit as PrismaUnit } from '@prisma/client';
import { UniqueEntityID } from 'src/core/entities/unique-entity-id';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';

export class PrismaUnitMapper {
  static toDomain(raw: PrismaUnit): Unit {
    return Unit.create(
      {
        courseId: new UniqueEntityID(raw.courseId),
        name: raw.name,
        description: raw.description ?? undefined,
        position: raw.position,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? null,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(unit: Unit): Prisma.UnitUncheckedCreateInput {
    return {
      id: unit.id.toString(),
      courseId: unit.courseId.toString(),
      name: unit.name,
      description: unit.description,
      position: unit.position,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    };
  }
}
