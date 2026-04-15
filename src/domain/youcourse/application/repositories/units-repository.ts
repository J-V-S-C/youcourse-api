import { Unit } from '../../enterprise/entities/unit';

export abstract class UnitsRepository {
  abstract create(unit: Unit): Promise<void>;
  abstract save(unit: Unit): Promise<void>;
  abstract findById(id: string): Promise<Unit | null>;
  abstract findByCourseId(courseId: string): Promise<Unit[]>;
  abstract findByIdWithLessons(id: string): Promise<Unit | null>;
  abstract delete(unit: Unit): Promise<void>;
}
