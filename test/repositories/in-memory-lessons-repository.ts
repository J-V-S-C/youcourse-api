import { Lesson } from 'src/domain/youcourse/enterprise/entities/lesson';
import { LessonsRepository } from 'src/domain/youcourse/application/repositories/lessons-repository';

export class InMemoryLessonsRepository implements LessonsRepository {
  public items: Lesson[] = [];

  async create(lesson: Lesson): Promise<void> {
    this.items.push(lesson);
  }

  async save(lesson: Lesson): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(lesson.id));
    if (index !== -1) {
      this.items[index] = lesson;
    }
  }

  async findById(id: string): Promise<Lesson | null> {
    return this.items.find((item) => item.id.toString() === id) ?? null;
  }

  async findManyByUnitId(unitId: string): Promise<Lesson[]> {
    return this.items
      .filter((item) => item.unitId.toString() === unitId)
      .sort((a, b) => a.position - b.position);
  }

  async countByUnitId(unitId: string): Promise<number> {
    return this.items.filter((item) => item.unitId.toString() === unitId)
      .length;
  }

  async delete(lesson: Lesson): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(lesson.id));
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
}
