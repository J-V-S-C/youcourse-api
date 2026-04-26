import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LessonsRepository } from 'src/domain/youcourse/application/repositories/lessons-repository';
import { Lesson } from 'src/domain/youcourse/enterprise/entities/lesson';
import { PrismaLessonMapper } from '../mappers/prisma-lesson-mapper';

@Injectable()
export class PrismaLessonsRepository implements LessonsRepository {
  constructor(private prisma: PrismaService) {}

  async create(lesson: Lesson): Promise<void> {
    const data = PrismaLessonMapper.toPrisma(lesson);
    await this.prisma.lesson.create({ data });
  }

  async save(lesson: Lesson): Promise<void> {
    const data = PrismaLessonMapper.toPrisma(lesson);
    await this.prisma.lesson.update({
      where: { id: lesson.id.toString() },
      data,
    });
  }

  async findById(id: string): Promise<Lesson | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) return null;

    return PrismaLessonMapper.toDomain(lesson);
  }

  async findManyByUnitId(unitId: string): Promise<Lesson[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { unitId },
    });

    return lessons.map(PrismaLessonMapper.toDomain);
  }

  async countByUnitId(unitId: string): Promise<number> {
    return this.prisma.lesson.count({
      where: { unitId },
    });
  }

  async delete(lesson: Lesson): Promise<void> {
    await this.prisma.lesson.delete({
      where: { id: lesson.id.toString() },
    });
  }
}