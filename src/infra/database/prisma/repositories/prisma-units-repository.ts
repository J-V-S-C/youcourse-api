import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UnitsRepository } from 'src/domain/youcourse/application/repositories/units-repository';
import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { PrismaUnitMapper } from '../mappers/prisma-unit-mapper';

@Injectable()
export class PrismaUnitsRepository implements UnitsRepository {
  constructor(private prisma: PrismaService) {}

  async create(unit: Unit): Promise<void> {
    const data = PrismaUnitMapper.toPrisma(unit);
    await this.prisma.unit.create({ data });
  }

  async save(unit: Unit): Promise<void> {
    const data = PrismaUnitMapper.toPrisma(unit);
    await this.prisma.unit.update({
      where: { id: unit.id.toString() },
      data,
    });
  }

  async findById(id: string): Promise<Unit | null> {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
    });

    if (!unit) return null;

    return PrismaUnitMapper.toDomain(unit);
  }

  async findByCourseId(courseId: string): Promise<Unit[]> {
    const units = await this.prisma.unit.findMany({
      where: { courseId },
    });

    return units.map(PrismaUnitMapper.toDomain);
  }

  async findByIdWithLessons(id: string): Promise<Unit | null> {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: { lessons: true },
    });

    if (!unit) return null;

    return PrismaUnitMapper.toDomain(unit);
  }

  async delete(unit: Unit): Promise<void> {
    await this.prisma.unit.delete({
      where: { id: unit.id.toString() },
    });
  }
}