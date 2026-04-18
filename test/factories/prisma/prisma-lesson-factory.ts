import { Injectable } from '@nestjs/common';
import { Lesson, LessonProps } from 'src/domain/youcourse/enterprise/entities/lesson';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { makeLesson } from '../make-lesson';
import { PrismaLessonMapper } from 'src/infra/database/prisma/mappers/prisma-lesson-mapper';

@Injectable()
export class LessonFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaLesson(data: Partial<LessonProps> = {}): Promise<Lesson> {
    const lesson = makeLesson(data);

    await this.prisma.lesson.create({
      data: PrismaLessonMapper.toPrisma(lesson),
    });

    return lesson;
  }
}