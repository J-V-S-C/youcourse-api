import { Unit } from 'src/domain/youcourse/enterprise/entities/unit';
import { UnitsRepository } from 'src/domain/youcourse/application/repositories/units-repository';

export class InMemoryUnitsRepository implements UnitsRepository {
  public items: Unit[] = [];

  async create(unit: Unit): Promise<void> {
    this.items.push(unit);
  }

  async save(unit: Unit): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(unit.id));
    if (index !== -1) {
      this.items[index] = unit;
    }
  }

  async findById(id: string): Promise<Unit | null> {
    return this.items.find((item) => item.id.toString() === id) ?? null;
  }

  async findByCourseId(courseId: string): Promise<Unit[]> {
    return this.items.filter((item) => item.courseId.toString() === courseId);
  }

  async findByIdWithLessons(id: string): Promise<Unit | null> {
    return this.items.find((item) => item.id.toString() === id) ?? null;
  }

  async delete(unit: Unit): Promise<void> {
    const index = this.items.findIndex((item) => item.id.equals(unit.id));
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }
}
