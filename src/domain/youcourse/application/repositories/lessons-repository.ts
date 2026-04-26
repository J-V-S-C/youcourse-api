import { Lesson } from '../../enterprise/entities/lesson';

export abstract class LessonsRepository {
  abstract create(lesson: Lesson): Promise<void>;
  abstract save(lesson: Lesson): Promise<void>;
  abstract findById(id: string): Promise<Lesson | null>;
  abstract findManyByUnitId(unitId: string): Promise<Lesson[]>;
  abstract countByUnitId(unitId: string): Promise<number>;
  abstract delete(lesson: Lesson): Promise<void>;
}
